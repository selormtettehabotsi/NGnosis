from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Course, get_db
from vector_store import get_vector_store

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    color: str = "#6366f1"


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    color: str
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    note_count: int = 0

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    result = []
    for c in courses:
        out = CourseOut.model_validate(c)
        out.document_count = len(c.documents)
        out.note_count = len(c.notes)
        result.append(out)
    return result


@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseOut.model_validate(course)


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    out = CourseOut.model_validate(course)
    out.document_count = len(course.documents)
    out.note_count = len(course.notes)
    return out


@router.patch("/{course_id}", response_model=CourseOut)
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(course)
    return CourseOut.model_validate(course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    get_vector_store().delete_collection(course_id)
    db.delete(course)
    db.commit()


@router.get("/{course_id}/search")
def search_course(
    course_id: int,
    q: str,
    n: int = 5,
    db: Session = Depends(get_db),
):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    results = get_vector_store().query(course_id=course_id, query_text=q, n_results=n)
    return {"query": q, "results": results}
