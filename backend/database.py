from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship

from config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=settings.is_development,
)


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    color: Mapped[str] = mapped_column(String(20), default="#6366f1")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    documents: Mapped[list["Document"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    notes: Mapped[list["Note"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    progress: Mapped[list["Progress"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50))
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    indexed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    course: Mapped["Course"] = relationship(back_populates="documents")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[Optional[str]] = mapped_column(String(512))  # comma-separated
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    course: Mapped["Course"] = relationship(back_populates="notes")


class Progress(Base):
    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0)  # 0.0 – 1.0
    session_type: Mapped[str] = mapped_column(String(50))  # quiz | review | tutor
    notes: Mapped[Optional[str]] = mapped_column(Text)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    course: Mapped["Course"] = relationship(back_populates="progress")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------


def get_db():
    with Session(engine) as session:
        yield session


def init_db():
    Base.metadata.create_all(bind=engine)
