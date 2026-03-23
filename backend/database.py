"""
SQLite database setup via SQLAlchemy.

LEARNING NOTE:
- SQLAlchemy is an ORM (Object Relational Mapper): Python classes <-> DB tables
- create_engine() creates the connection pool
- SessionLocal is used per-request (opened, used, closed)
- Base is the parent class all DB models inherit from
- Seeding: on first startup, if the emotions table is empty, we insert all 67 emotions
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
    """
    Create all tables and seed reference data.
    Called once on app startup via lifespan() in main.py.

    LEARNING NOTE — create_all vs migrations:
    create_all(checkfirst=True) only creates tables that don't exist yet.
    It does NOT alter existing tables. For schema changes in production
    you would use Alembic (a migration tool). For this project, dropping
    and recreating the DB file is fine since we have no critical user data.
    """
    # Import all models so SQLAlchemy registers their tables before create_all
    from models import User, Emotion, CheckIn, JournalEntry  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _seed_emotions()


def _seed_emotions():
    """
    Insert all 67 emotions if the emotions table is empty.
    Safe to call on every startup — does nothing if already seeded.
    """
    from models import Emotion
    from seed_data import EMOTIONS

    db = SessionLocal()
    try:
        if db.query(Emotion).count() > 0:
            return  # already seeded

        for data in EMOTIONS:
            db.add(Emotion(**data))
        db.commit()
    finally:
        db.close()
