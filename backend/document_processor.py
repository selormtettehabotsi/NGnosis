"""Document ingestion pipeline: parse → chunk → embed → store."""

import hashlib
import re
from pathlib import Path
from typing import Generator

from sqlalchemy.orm import Session

from database import Document
from vector_store import get_vector_store

# Optional heavy deps — only imported when needed
try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False


CHUNK_SIZE = 512       # characters
CHUNK_OVERLAP = 64     # characters


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf(path)
    elif suffix in {".md", ".txt", ".rst"}:
        return path.read_text(encoding="utf-8", errors="replace")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(path: Path) -> str:
    if not HAS_PYPDF:
        raise RuntimeError("pypdf is not installed. Run: pip install pypdf")
    reader = pypdf.PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> Generator[str, None, None]:
    """Sliding-window character chunker that respects sentence boundaries."""
    text = re.sub(r"\s+", " ", text).strip()
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        # Try to snap to nearest sentence boundary
        if end < len(text):
            snap = text.rfind(".", start, end)
            if snap != -1 and snap > start + overlap:
                end = snap + 1
        yield text[start:end].strip()
        start = end - overlap


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------


def process_document(document: Document, db: Session) -> int:
    """
    Full pipeline for a single Document row:
      1. Extract text from file
      2. Chunk the text
      3. Store chunks in ChromaDB
      4. Update document row in DB

    Returns the number of chunks created.
    """
    text = extract_text(document.file_path)
    chunks = list(chunk_text(text))

    vs = get_vector_store()
    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        chunk_id = _make_chunk_id(document.id, i)
        ids.append(chunk_id)
        metadatas.append({
            "document_id": document.id,
            "course_id": document.course_id,
            "filename": document.filename,
            "chunk_index": i,
        })

    vs.add_chunks(
        course_id=document.course_id,
        chunks=chunks,
        metadatas=metadatas,
        ids=ids,
    )

    document.chunk_count = len(chunks)
    document.indexed = True
    db.commit()

    return len(chunks)


def _make_chunk_id(document_id: int, chunk_index: int) -> str:
    raw = f"doc_{document_id}_chunk_{chunk_index}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]
