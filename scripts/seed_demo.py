"""Seed the Gnosis database with demo courses, notes, and progress entries."""

import sys
from pathlib import Path

# Allow imports from backend/
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from sqlalchemy.orm import Session
from database import engine, init_db, Course, Note, Progress

DEMO_COURSES = [
    {
        "title": "Operating Systems",
        "description": "Processes, scheduling, memory management, and file systems.",
        "color": "#6366f1",
    },
    {
        "title": "Machine Learning Fundamentals",
        "description": "Supervised & unsupervised learning, gradient descent, neural networks.",
        "color": "#ec4899",
    },
    {
        "title": "Distributed Systems",
        "description": "CAP theorem, consensus protocols, fault tolerance, and replication.",
        "color": "#14b8a6",
    },
]

DEMO_NOTES = [
    {
        "course_index": 0,
        "title": "Process vs Thread",
        "content": "A **process** is an independent execution unit with its own address space. "
                   "A **thread** shares memory with sibling threads within the same process. "
                   "Context switching between threads is cheaper than between processes.",
        "tags": "processes,threads,scheduling",
    },
    {
        "course_index": 1,
        "title": "Gradient Descent",
        "content": "Gradient descent minimises a loss function L(θ) by iteratively moving "
                   "θ in the direction of the negative gradient: θ ← θ - η∇L(θ). "
                   "η is the learning rate. Too large → diverges. Too small → slow convergence.",
        "tags": "optimisation,gradient,loss",
    },
]

DEMO_PROGRESS = [
    {"course_index": 0, "topic": "Process Scheduling", "score": 0.72, "session_type": "quiz"},
    {"course_index": 0, "topic": "Virtual Memory", "score": 0.55, "session_type": "review"},
    {"course_index": 1, "topic": "Gradient Descent", "score": 0.88, "session_type": "tutor"},
    {"course_index": 2, "topic": "CAP Theorem", "score": 0.61, "session_type": "quiz"},
]


def seed():
    init_db()
    with Session(engine) as db:
        # Check if already seeded
        if db.query(Course).count() > 0:
            print("Database already has data — skipping seed.")
            return

        courses = []
        for data in DEMO_COURSES:
            c = Course(**data)
            db.add(c)
            courses.append(c)
        db.flush()

        for note_data in DEMO_NOTES:
            idx = note_data.pop("course_index")
            db.add(Note(course_id=courses[idx].id, **note_data))

        for prog_data in DEMO_PROGRESS:
            idx = prog_data.pop("course_index")
            db.add(Progress(course_id=courses[idx].id, **prog_data))

        db.commit()
        print(f"Seeded {len(DEMO_COURSES)} courses, {len(DEMO_NOTES)} notes, {len(DEMO_PROGRESS)} progress entries.")


if __name__ == "__main__":
    seed()
