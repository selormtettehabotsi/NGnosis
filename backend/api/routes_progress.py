from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Progress, get_db

router = APIRouter()


class ProgressCreate(BaseModel):
    course_id: int
    topic: str
    score: float = Field(ge=0.0, le=1.0)
    session_type: str = "review"  # quiz | review | tutor
    notes: Optional[str] = None


class ProgressOut(BaseModel):
    id: int
    course_id: int
    topic: str
    score: float
    session_type: str
    notes: Optional[str]
    recorded_at: datetime

    model_config = {"from_attributes": True}


class CourseProgressSummary(BaseModel):
    course_id: int
    topic_count: int
    average_score: float
    sessions: list[ProgressOut]


@router.post("/", response_model=ProgressOut, status_code=status.HTTP_201_CREATED)
def record_progress(payload: ProgressCreate, db: Session = Depends(get_db)):
    entry = Progress(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return ProgressOut.model_validate(entry)


@router.get("/{course_id}", response_model=CourseProgressSummary)
def get_course_progress(course_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(Progress)
        .filter(Progress.course_id == course_id)
        .order_by(Progress.recorded_at.desc())
        .all()
    )
    if not sessions:
        return CourseProgressSummary(
            course_id=course_id, topic_count=0, average_score=0.0, sessions=[]
        )

    topics = {s.topic for s in sessions}
    avg = sum(s.score for s in sessions) / len(sessions)
    return CourseProgressSummary(
        course_id=course_id,
        topic_count=len(topics),
        average_score=round(avg, 3),
        sessions=[ProgressOut.model_validate(s) for s in sessions],
    )


@router.get("/{course_id}/topics")
def get_topic_scores(course_id: int, db: Session = Depends(get_db)):
    """Return latest score per topic for a course."""
    sessions = (
        db.query(Progress)
        .filter(Progress.course_id == course_id)
        .order_by(Progress.recorded_at.desc())
        .all()
    )
    seen: dict[str, dict] = {}
    for s in sessions:
        if s.topic not in seen:
            seen[s.topic] = {
                "topic": s.topic,
                "latest_score": s.score,
                "session_count": 0,
            }
        seen[s.topic]["session_count"] += 1
    return list(seen.values())


@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_progress(progress_id: int, db: Session = Depends(get_db)):
    entry = db.get(Progress, progress_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    db.delete(entry)
    db.commit()
