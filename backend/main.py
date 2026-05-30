"""Gnosis — FastAPI application entry point."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db
from api.routes_upload import router as upload_router
from api.routes_courses import router as courses_router
from api.routes_notes import router as notes_router
from api.routes_progress import router as progress_router
from api.routes_settings import router as settings_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
    init_db()
    yield
    # Shutdown (nothing to clean up for now)


app = FastAPI(
    title="Gnosis API",
    description="AI-powered knowledge management & Socratic tutoring platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router, prefix="/api/courses", tags=["courses"])
app.include_router(upload_router, prefix="/api/upload", tags=["upload"])
app.include_router(notes_router, prefix="/api/notes", tags=["notes"])
app.include_router(progress_router, prefix="/api/progress", tags=["progress"])
app.include_router(settings_router, prefix="/api/settings", tags=["settings"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
