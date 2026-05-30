from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Note, get_db

router = APIRouter()


class NoteCreate(BaseModel):
    course_id: int
    title: str
    content: str = ""
    tags: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None


class NoteOut(BaseModel):
    id: int
    course_id: int
    title: str
    content: str
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[NoteOut])
def list_notes(course_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Note)
    if course_id is not None:
        q = q.filter(Note.course_id == course_id)
    return [NoteOut.model_validate(n) for n in q.order_by(Note.updated_at.desc()).all()]


@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    note = Note(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteOut.model_validate(note)


@router.get("/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteOut.model_validate(note)


@router.patch("/{note_id}", response_model=NoteOut)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(note, field, value)
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return NoteOut.model_validate(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
