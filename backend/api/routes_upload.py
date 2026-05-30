"""File upload and document indexing routes."""

import shutil
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import get_settings
from database import Course, Document, get_db
from document_processor import process_document

router = APIRouter()
settings = get_settings()

ALLOWED_TYPES = {".pdf", ".md", ".txt", ".rst"}


class DocumentOut(BaseModel):
    id: int
    course_id: int
    filename: str
    file_type: str
    chunk_count: int
    indexed: bool

    model_config = {"from_attributes": True}


@router.post("/{course_id}", response_model=DocumentOut, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    course_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(ALLOWED_TYPES)}",
        )

    # Guard upload size
    content = await file.read()
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    # Persist file
    dest_dir = Path(settings.upload_dir) / str(course_id)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / (file.filename or "upload")
    dest_path.write_bytes(content)

    doc = Document(
        course_id=course_id,
        filename=file.filename or "upload",
        file_path=str(dest_path),
        file_type=suffix,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Index asynchronously
    background_tasks.add_task(_index_document, doc.id)

    return DocumentOut.model_validate(doc)


def _index_document(document_id: int) -> None:
    """Background task: run the full processing pipeline."""
    from database import Session, engine, Document
    with Session(engine) as db:
        doc = db.get(Document, document_id)
        if doc:
            try:
                process_document(doc, db)
            except Exception as exc:
                print(f"[error] Failed to index document {document_id}: {exc}")


@router.get("/{course_id}", response_model=list[DocumentOut])
def list_documents(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return [DocumentOut.model_validate(d) for d in course.documents]


@router.delete("/{course_id}/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(course_id: int, document_id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, document_id)
    if not doc or doc.course_id != course_id:
        raise HTTPException(status_code=404, detail="Document not found")
    from vector_store import get_vector_store
    get_vector_store().delete_document_chunks(course_id, document_id)
    try:
        Path(doc.file_path).unlink(missing_ok=True)
    except Exception:
        pass
    db.delete(doc)
    db.commit()
