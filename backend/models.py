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

Masterclass schema (added for Empathly SEL curriculum):
  masterclass_progress    — one row per (user, lesson) completed
  masterclass_certificates — issued verifiable certificates per (user, module)
  masterclass_classes      — teacher-managed class groups
  masterclass_enrollments  — student membership in a class
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, UniqueConstraint, Index
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
    One row per authenticated user. Identity is delegated to Supabase Auth —
    we never store passwords. The frontend signs in via magic link or Google
    OAuth, receives a Supabase JWT, and passes it to our API. We verify the
    JWT, extract supabase_uid + email, and upsert this row.

    supabase_uid  — the stable UUID Supabase assigns; use this as the lookup key
    email         — stored for display / admin; never used for auth logic here
    display_name  — optional name the user sets in their profile
    lang          — preferred UI language, e.g. "en", "de"
    """
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    supabase_uid = Column(String,  unique=True, index=True, nullable=False)
    email        = Column(String,  nullable=True)
    display_name = Column(String,  nullable=True)
    lang         = Column(String,  default="en")
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
    needs_json = Column(Text,     nullable=True)   # JSON list of need IDs, e.g. '["ruhe","fokus"]'
    dimensions = Column(Text,     nullable=True)   # JSON list of unique dimensions, e.g. '["koerper","geist"]'
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


# ── Masterclass ────────────────────────────────────────────────────────────────

class MasterclassProgress(Base):
    """
    One row per (user, lesson) pair — records that a lesson was completed.

    A UniqueConstraint on (user_id, lesson_id) prevents recording the same lesson
    twice. The score column is optional; lessons without quizzes leave it NULL.
    """
    __tablename__ = "masterclass_progress"

    id           = Column(Integer,  primary_key=True, index=True)
    user_id      = Column(Integer,  ForeignKey("users.id", ondelete="CASCADE"),
                          nullable=False, index=True)
    lesson_id    = Column(String,   nullable=False)
    module_id    = Column(String,   nullable=False, index=True)
    score        = Column(Integer,  nullable=True)   # 0-100, or NULL if not scored
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),
    )


class MasterclassCertificate(Base):
    """
    Issued certificate for completing a full module.

    cert_uuid is the public verifiable identifier used in shareable links
    (/masterclass/certificates/verify/{cert_uuid}). Indexed for fast public
    lookups that require no authentication.
    user_name stores the display name at the time of issue (snapshot).
    """
    __tablename__ = "masterclass_certificates"

    id        = Column(Integer,  primary_key=True, index=True)
    cert_uuid = Column(String,   unique=True, nullable=False)
    user_id   = Column(Integer,  ForeignKey("users.id", ondelete="CASCADE"),
                       nullable=False, index=True)
    module_id = Column(String,   nullable=False)
    user_name = Column(String,   nullable=True)   # display name at time of issue
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

    __table_args__ = (
        Index("ix_masterclass_certificates_cert_uuid", "cert_uuid"),
    )


class MasterclassClass(Base):
    """
    A teacher's class group identified by a short memorable class_code.

    The 6-character uppercase code is what students type to enroll themselves.
    Deleting a class cascades to all enrollments.
    """
    __tablename__ = "masterclass_classes"

    id              = Column(Integer, primary_key=True, index=True)
    class_code      = Column(String,  unique=True, nullable=False, index=True)
    teacher_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    class_name      = Column(String,  nullable=False)
    created_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    teacher     = relationship("User")
    enrollments = relationship("MasterclassEnrollment", back_populates="classroom",
                               cascade="all, delete-orphan")


class MasterclassEnrollment(Base):
    """
    Links a student (user) to a class.

    student_name is captured at enrollment time as a roster display name,
    independent of the user's own display_name so it can be set by the teacher.
    A UniqueConstraint on (class_id, user_id) prevents double-enrollment.
    """
    __tablename__ = "masterclass_enrollments"

    id           = Column(Integer, primary_key=True, index=True)
    class_id     = Column(Integer, ForeignKey("masterclass_classes.id", ondelete="CASCADE"),
                          nullable=False, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                          nullable=False, index=True)
    student_name = Column(String,  nullable=True)
    enrolled_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    classroom = relationship("MasterclassClass", back_populates="enrollments")
    student   = relationship("User")

    __table_args__ = (
        UniqueConstraint("class_id", "user_id", name="uq_enrollment_class_user"),
    )
