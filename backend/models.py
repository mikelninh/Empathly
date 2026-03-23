"""
SQLAlchemy database models (= table definitions).

LEARNING NOTE:
- Each class = one table in SQLite
- ForeignKey("table.column") creates a real database constraint — the DB enforces it
- relationship() is Python-only magic: SQLAlchemy knows how to JOIN the tables for you
- secondary= on a relationship means "go through this junction table" (many-to-many)
- cascade="all, delete-orphan": deleting a User also deletes all their checkins/journal

Phase 1 schema:
  users            — one row per device (anonymous, no login yet)
  emotions         — all 67 emotions, seeded from seed_data.py
  checkins         — a quick emotional check-in, belongs to one user
  checkin_emotions — junction table: which emotions appeared in which check-in
  journal_entries  — a longer reflection, belongs to one user
  journal_emotions — junction table: which emotions appeared in which journal entry
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship

from database import Base


# ── Junction tables ────────────────────────────────────────────────────────────
# These are "pure" junction tables with no extra columns, so we use Table()
# instead of a full mapped class. They only exist to link two other tables.

checkin_emotions = Table(
    "checkin_emotions",
    Base.metadata,
    Column("checkin_id", Integer, ForeignKey("checkins.id",       ondelete="CASCADE"), primary_key=True),
    Column("emotion_id", String,  ForeignKey("emotions.id"),                           primary_key=True),
)

journal_emotions = Table(
    "journal_emotions",
    Base.metadata,
    Column("journal_id", Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), primary_key=True),
    Column("emotion_id", String,  ForeignKey("emotions.id"),                            primary_key=True),
)


# ── Users ──────────────────────────────────────────────────────────────────────

class User(Base):
    """
    One row per device. No login required — device_id is a UUID
    generated in the browser (stored in localStorage) and sent with every request.

    This replaces the old hardcoded user_id = "default".
    Now each device is its own user, and we can track data per device.
    """
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    device_id    = Column(String,  unique=True, index=True, nullable=False)
    display_name = Column(String,  nullable=True)
    avatar_emoji = Column(String,  default="💛")
    created_at   = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One user → many check-ins and journal entries
    checkins        = relationship("CheckIn",      back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")


# ── Emotions ───────────────────────────────────────────────────────────────────

class Emotion(Base):
    """
    Reference table for all 67 emotions.
    Seeded once from seed_data.py on first app startup.

    The id matches js/data.js exactly (e.g. "freude", "angst_gefuehl")
    so the frontend and backend always agree on emotion identity.
    """
    __tablename__ = "emotions"

    id       = Column(String, primary_key=True)   # e.g. "freude"
    emoji    = Column(String, nullable=False)
    category = Column(String, nullable=False)      # e.g. "licht", "sturm", "schwere"

    # All 11 language translations
    name_de = Column(String, nullable=False)
    name_vi = Column(String, default="")
    name_en = Column(String, default="")
    name_tr = Column(String, default="")
    name_ar = Column(String, default="")
    name_es = Column(String, default="")
    name_fr = Column(String, default="")
    name_uk = Column(String, default="")
    name_pl = Column(String, default="")
    name_el = Column(String, default="")
    name_ta = Column(String, default="")


# ── Check-Ins ─────────────────────────────────────────────────────────────────

class CheckIn(Base):
    """
    A quick emotional snapshot — which emotions, how intense, any note?

    Previously stored emotion_ids as a JSON blob (["freude", "angst"]).
    Now uses a proper junction table (checkin_emotions) with foreign keys.
    This lets us query: "how many times did freude appear this month?"
    """
    __tablename__ = "checkins"

    id         = Column(Integer,  primary_key=True, index=True)
    user_id    = Column(Integer,  ForeignKey("users.id"), nullable=False, index=True)
    intensity  = Column(Integer,  default=3)      # 1 = barely felt, 5 = very intense
    note       = Column(Text,     nullable=True)
    lang       = Column(String,   default="de")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user     = relationship("User",    back_populates="checkins")
    emotions = relationship("Emotion", secondary=checkin_emotions)
    # checkin.emotions → list of Emotion objects
    # checkin.emotions[0].name_de → "Freude"


# ── Journal Entries ────────────────────────────────────────────────────────────

class JournalEntry(Base):
    """
    A longer, more narrative reflection — meant for AI pattern analysis.
    Separate from quick check-ins because the intent is different:
    check-ins are fast snapshots, journal entries are thoughtful writing.
    """
    __tablename__ = "journal_entries"

    id         = Column(Integer,  primary_key=True, index=True)
    user_id    = Column(Integer,  ForeignKey("users.id"), nullable=False, index=True)
    note       = Column(Text,     nullable=True)
    lang       = Column(String,   default="de")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user     = relationship("User",    back_populates="journal_entries")
    emotions = relationship("Emotion", secondary=journal_emotions)
