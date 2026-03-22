"""
SQLite database setup via SQLAlchemy.

LEARNING NOTE:
- SQLAlchemy is an ORM (Object Relational Mapper): Python classes <-> DB tables
- create_engine() creates the connection pool
- SessionLocal is used per-request (opened, used, closed)
- Base is the parent class all DB models inherit from
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.database_url,
    # SQLite-specific: allow usage across threads (needed for FastAPI)
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency: yields a DB session per request, always closes it.

    Usage in a router:
        def my_endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in models.py. Called once on startup."""
    from models import CheckIn, JournalEntry  # noqa: F401 — import triggers table registration
    Base.metadata.create_all(bind=engine)
