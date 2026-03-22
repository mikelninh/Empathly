"""
SQLAlchemy database models (= table definitions).

LEARNING NOTE:
- Each class = one table in SQLite
- Column types: Integer, String, Text, DateTime, JSON
- JSON columns store Python dicts/lists as JSON strings in SQLite
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.types import JSON
from database import Base


class CheckIn(Base):
    """
    A daily emotional check-in.
    User picks one or more emotions and optionally rates intensity + adds a note.
    This is the core data for emotion statistics.
    """
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="default", index=True)
    # List of emotion IDs from data.js, e.g. ["freude", "dankbarkeit"]
    emotion_ids = Column(JSON, nullable=False)
    # Which category dominated, e.g. "licht"
    category = Column(String, nullable=True)
    # 1 (barely) to 5 (very intense)
    intensity = Column(Integer, default=3)
    # Optional free-text note in any language
    note = Column(Text, nullable=True)
    # UI language used during check-in, e.g. "de", "vi", "en"
    lang = Column(String, default="de")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class JournalEntry(Base):
    """
    A richer journal entry — more narrative, intended for AI pattern analysis.
    Separate from quick check-ins.
    """
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="default", index=True)
    # Emotion IDs selected for this entry
    emotions = Column(JSON, nullable=False)
    # Free-text journal note
    note = Column(Text, nullable=True)
    lang = Column(String, default="de")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
