"""
Gefühle-Memory Backend — FastAPI app entry point.

LEARNING NOTE:
- FastAPI automatically generates interactive API docs at /docs (Swagger UI)
  and /redoc. Open http://localhost:8000/docs after starting the server.
- lifespan() runs setup/teardown code (db init on startup)
- CORS middleware allows the frontend (different origin) to call our API

Start the server:
    cd backend
    uvicorn main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables
from routers import checkins, journal, ai, users, emotions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup: create DB tables if they don't exist."""
    create_tables()
    yield
    # (cleanup code would go here, after yield)


app = FastAPI(
    title="Gefühle-Memory API",
    description=(
        "Backend for the Gefühle-Memory emotion card game.\n\n"
        "Features: Check-in tracking, emotion statistics, "
        "AI cultural bridge (RAG), journal pattern analysis."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# Allow the frontend (served from file:// or a dev server) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)
app.include_router(emotions.router)
app.include_router(checkins.router)
app.include_router(journal.router)
app.include_router(ai.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "app": "Gefühle-Memory API",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
