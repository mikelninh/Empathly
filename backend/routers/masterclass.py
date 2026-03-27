"""
Empathly Masterclass endpoints — SEL (Social-Emotional Learning) curriculum.

MONETIZATION MODEL
==================
  free tier   — Modules 1-2 are always free for every user.
                No account required beyond a device_id.

  pro tier    — Modules 3-5 unlocked for €4.99 / month (personal subscription).
                Covers: advanced SEL content, certificates for all modules.

  school tier — €2 / student / year.
                Unlocks: teacher dashboard, class management, bulk progress reports,
                         certificates for enrolled students.

  NO data selling. NO advertising. Revenue comes only from subscriptions.

CURRICULUM OVERVIEW
===================
  Module 1  — Emotions & Feelings        (free)
  Module 2  — Needs & Empathy            (free)
  Module 3  — Communication & Conflict   (pro / school)
  Module 4  — Regulation & Resilience    (pro / school)
  Module 5  — Community & Values         (pro / school)

  Each module contains a fixed set of lesson_ids (validated below).

Endpoints:
  POST   /masterclass/progress                          — save a completed lesson
  GET    /masterclass/progress/{user_id}                — all progress for a user

  POST   /masterclass/certificates                      — issue certificate for a module
  GET    /masterclass/certificates/verify/{cert_uuid}   — public certificate verification
  GET    /masterclass/certificates/user/{user_id}       — all certificates for a user

  POST   /masterclass/classes                           — teacher creates a class
  GET    /masterclass/classes/teacher/{teacher_user_id} — list teacher's classes
  GET    /masterclass/classes/{class_code}              — class detail + students + progress
  POST   /masterclass/classes/{class_code}/enroll       — student enrolls in a class
  DELETE /masterclass/classes/{class_code}/students/{user_id} — remove student
"""

import random
import string
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Session, relationship

from database import Base, get_db
from models import User


# ── Curriculum definition ───────────────────────────────────────────────────────
# Authoritative map of which lesson_ids belong to each module.
# Used to enforce "all lessons complete" before issuing a certificate.

MODULE_LESSONS: dict[str, list[str]] = {
    "module_1": [
        "m1_l1_intro_emotions",
        "m1_l2_emotion_wheel",
        "m1_l3_body_signals",
        "m1_l4_emotion_stories",
        "m1_l5_reflection",
    ],
    "module_2": [
        "m2_l1_intro_needs",
        "m2_l2_universal_needs",
        "m2_l3_empathy_listening",
        "m2_l4_perspective_taking",
        "m2_l5_reflection",
    ],
    "module_3": [
        "m3_l1_intro_communication",
        "m3_l2_nonviolent_language",
        "m3_l3_conflict_anatomy",
        "m3_l4_de_escalation",
        "m3_l5_reflection",
    ],
    "module_4": [
        "m4_l1_intro_regulation",
        "m4_l2_window_of_tolerance",
        "m4_l3_grounding_techniques",
        "m4_l4_building_resilience",
        "m4_l5_reflection",
    ],
    "module_5": [
        "m5_l1_intro_community",
        "m5_l2_shared_values",
        "m5_l3_restorative_circles",
        "m5_l4_service_and_meaning",
        "m5_l5_capstone",
    ],
}

FREE_MODULES = {"module_1", "module_2"}
ALL_MODULE_IDS = set(MODULE_LESSONS.keys())


# ── SQLAlchemy models ───────────────────────────────────────────────────────────
# These models will also be registered in models.py

class MasterclassProgress(Base):
    """
    One row per (user, lesson) pair — records that a lesson was completed.
    A UniqueConstraint prevents recording the same lesson twice for the same user.
    The score column is optional; quizless lessons leave it NULL.
    """
    __tablename__ = "masterclass_progress"

    id           = Column(Integer,  primary_key=True, index=True)
    user_id      = Column(Integer,  ForeignKey("users.id", ondelete="CASCADE"),
                          nullable=False, index=True)
    lesson_id    = Column(String,   nullable=False)
    module_id    = Column(String,   nullable=False, index=True)
    score        = Column(Integer,  nullable=True)   # 0–100, or NULL if not scored
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),
    )


class MasterclassCertificate(Base):
    """
    Issued certificate for completing a full module.
    cert_uuid is the public verifiable identifier (used in /verify/ links).
    Indexed on cert_uuid for fast public lookups without authentication.
    """
    __tablename__ = "masterclass_certificates"

    id        = Column(Integer,  primary_key=True, index=True)
    cert_uuid = Column(String,   unique=True, nullable=False, index=True)
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
    The 6-character uppercase code is what students type to enroll.
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
    student_name is stored at enrollment time as a display name
    (independent of the user's display_name, useful for class rosters).
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


# ── Pydantic schemas ────────────────────────────────────────────────────────────

class ProgressCreate(BaseModel):
    user_id:   int   = Field(..., description="Integer user ID from /users/")
    lesson_id: str   = Field(..., description="e.g. 'm1_l1_intro_emotions'")
    module_id: str   = Field(..., description="e.g. 'module_1'")
    score:     Optional[int] = Field(None, ge=0, le=100,
                                     description="Quiz score 0-100; omit if no quiz")


class ProgressResponse(BaseModel):
    id:           int
    user_id:      int
    lesson_id:    str
    module_id:    str
    score:        Optional[int]
    completed_at: datetime

    model_config = {"from_attributes": True}


class CertificateCreate(BaseModel):
    user_id:   int  = Field(..., description="Integer user ID from /users/")
    module_id: str  = Field(..., description="Module the certificate is issued for")
    user_name: Optional[str] = Field(None, description="Display name printed on certificate")


class CertificateResponse(BaseModel):
    id:        int
    cert_uuid: str
    user_id:   int
    module_id: str
    user_name: Optional[str]
    issued_at: datetime

    model_config = {"from_attributes": True}


class ClassCreate(BaseModel):
    teacher_user_id: int = Field(..., description="Integer user ID of the teacher")
    class_name:      str = Field(..., min_length=1, max_length=120,
                                 description="Human-readable name, e.g. 'Klasse 3b'")


class EnrollmentCreate(BaseModel):
    user_id:      int          = Field(..., description="Integer user ID of the student")
    student_name: Optional[str] = Field(None, max_length=120,
                                        description="Display name for the class roster")


class StudentProgressSummary(BaseModel):
    user_id:          int
    student_name:     Optional[str]
    enrolled_at:      datetime
    completed_lessons: int
    completed_modules: list[str]


class ClassDetailResponse(BaseModel):
    id:              int
    class_code:      str
    teacher_user_id: int
    class_name:      str
    created_at:      datetime
    students:        list[StudentProgressSummary]

    model_config = {"from_attributes": True}


class ClassSummaryResponse(BaseModel):
    id:              int
    class_code:      str
    teacher_user_id: int
    class_name:      str
    created_at:      datetime
    student_count:   int

    model_config = {"from_attributes": True}


# ── Helpers ─────────────────────────────────────────────────────────────────────

def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


def _generate_class_code(db: Session) -> str:
    """Generate a unique 6-character uppercase class code."""
    for _ in range(20):  # retry up to 20 times in case of collision
        code = "".join(random.choices(string.ascii_uppercase, k=6))
        if not db.query(MasterclassClass).filter(
            MasterclassClass.class_code == code
        ).first():
            return code
    raise HTTPException(status_code=500, detail="Could not generate unique class code")


def _completed_lessons_for_user(db: Session, user_id: int) -> set[str]:
    """Return a set of all lesson_ids completed by this user."""
    rows = (
        db.query(MasterclassProgress.lesson_id)
        .filter(MasterclassProgress.user_id == user_id)
        .all()
    )
    return {row.lesson_id for row in rows}


def _completed_modules_for_user(db: Session, user_id: int) -> list[str]:
    """Return a list of module_ids for which the user has completed every lesson."""
    completed = _completed_lessons_for_user(db, user_id)
    return [
        mid
        for mid, lessons in MODULE_LESSONS.items()
        if all(lid in completed for lid in lessons)
    ]


# ── Router ──────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/masterclass", tags=["Masterclass"])


# ── Progress ────────────────────────────────────────────────────────────────────

@router.post("/progress", response_model=ProgressResponse, status_code=201)
def save_progress(payload: ProgressCreate, db: Session = Depends(get_db)):
    """
    Record that a user has completed a lesson.

    - Validates that module_id and lesson_id exist in the curriculum.
    - Idempotent: if the (user, lesson) pair already exists the existing record is
      returned unchanged (HTTP 200 not 201 in that case — use upsert semantics).
    - The score field is optional; lessons without quizzes should omit it.
    """
    _get_user_or_404(db, payload.user_id)

    if payload.module_id not in ALL_MODULE_IDS:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown module_id '{payload.module_id}'. "
                   f"Valid values: {sorted(ALL_MODULE_IDS)}",
        )
    if payload.lesson_id not in MODULE_LESSONS[payload.module_id]:
        raise HTTPException(
            status_code=422,
            detail=f"lesson_id '{payload.lesson_id}' does not belong to "
                   f"module '{payload.module_id}'.",
        )

    # Idempotent: return existing row if already saved
    existing = (
        db.query(MasterclassProgress)
        .filter(
            MasterclassProgress.user_id  == payload.user_id,
            MasterclassProgress.lesson_id == payload.lesson_id,
        )
        .first()
    )
    if existing:
        # Optionally update score if a new one is provided
        if payload.score is not None and existing.score != payload.score:
            existing.score = payload.score
            db.commit()
            db.refresh(existing)
        return existing

    progress = MasterclassProgress(
        user_id=payload.user_id,
        lesson_id=payload.lesson_id,
        module_id=payload.module_id,
        score=payload.score,
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


@router.get("/progress/{user_id}", response_model=list[ProgressResponse])
def get_progress(user_id: int, db: Session = Depends(get_db)):
    """
    Return all completed lessons for a user, ordered by completion date (newest first).
    Returns an empty list (not 404) when the user exists but has no progress yet.
    """
    _get_user_or_404(db, user_id)
    return (
        db.query(MasterclassProgress)
        .filter(MasterclassProgress.user_id == user_id)
        .order_by(MasterclassProgress.completed_at.desc())
        .all()
    )


# ── Certificates ────────────────────────────────────────────────────────────────

@router.post("/certificates", response_model=CertificateResponse, status_code=201)
def issue_certificate(payload: CertificateCreate, db: Session = Depends(get_db)):
    """
    Issue a verifiable certificate for a completed module.

    Rules:
    - The module_id must be a valid curriculum module.
    - All lessons in that module must already be marked complete for this user.
    - If a certificate for this (user, module) already exists, the existing
      certificate is returned (idempotent — safe to call multiple times).
    - A UUID4 cert_uuid is generated and embedded in the certificate for public
      verification via /masterclass/certificates/verify/{cert_uuid}.
    """
    _get_user_or_404(db, payload.user_id)

    if payload.module_id not in ALL_MODULE_IDS:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown module_id '{payload.module_id}'.",
        )

    # Idempotent: return existing certificate
    existing = (
        db.query(MasterclassCertificate)
        .filter(
            MasterclassCertificate.user_id   == payload.user_id,
            MasterclassCertificate.module_id  == payload.module_id,
        )
        .first()
    )
    if existing:
        return existing

    # Verify all lessons in this module are completed
    required_lessons = set(MODULE_LESSONS[payload.module_id])
    completed        = _completed_lessons_for_user(db, payload.user_id)
    missing          = required_lessons - completed
    if missing:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot issue certificate: {len(missing)} lesson(s) not yet completed "
                f"in '{payload.module_id}': {sorted(missing)}"
            ),
        )

    cert = MasterclassCertificate(
        cert_uuid=str(uuid.uuid4()),
        user_id=payload.user_id,
        module_id=payload.module_id,
        user_name=payload.user_name,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.get("/certificates/verify/{cert_uuid}", response_model=CertificateResponse)
def verify_certificate(cert_uuid: str, db: Session = Depends(get_db)):
    """
    Public endpoint — no authentication required.

    Given a cert_uuid (from a printed certificate or shareable link), returns
    the full certificate record so anyone can confirm its authenticity.
    Returns 404 if the UUID is unknown or has been revoked.
    """
    cert = (
        db.query(MasterclassCertificate)
        .filter(MasterclassCertificate.cert_uuid == cert_uuid)
        .first()
    )
    if not cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate '{cert_uuid}' not found or has been revoked.",
        )
    return cert


@router.get("/certificates/user/{user_id}", response_model=list[CertificateResponse])
def list_certificates(user_id: int, db: Session = Depends(get_db)):
    """
    Return all certificates issued to a user, ordered by issue date (newest first).
    Returns an empty list if the user has no certificates yet.
    """
    _get_user_or_404(db, user_id)
    return (
        db.query(MasterclassCertificate)
        .filter(MasterclassCertificate.user_id == user_id)
        .order_by(MasterclassCertificate.issued_at.desc())
        .all()
    )


# ── Classes (teacher dashboard) ─────────────────────────────────────────────────

@router.post("/classes", response_model=ClassSummaryResponse, status_code=201)
def create_class(payload: ClassCreate, db: Session = Depends(get_db)):
    """
    Create a new class managed by a teacher.

    A unique 6-character uppercase class_code is generated automatically.
    Students use this code to self-enroll via POST /masterclass/classes/{code}/enroll.

    Only accessible for users on the school tier (tier enforcement is left to the
    API gateway / auth middleware; this endpoint trusts the caller).
    """
    _get_user_or_404(db, payload.teacher_user_id)

    code = _generate_class_code(db)
    classroom = MasterclassClass(
        class_code=code,
        teacher_user_id=payload.teacher_user_id,
        class_name=payload.class_name,
    )
    db.add(classroom)
    db.commit()
    db.refresh(classroom)

    student_count = (
        db.query(MasterclassEnrollment)
        .filter(MasterclassEnrollment.class_id == classroom.id)
        .count()
    )
    return ClassSummaryResponse(
        id=classroom.id,
        class_code=classroom.class_code,
        teacher_user_id=classroom.teacher_user_id,
        class_name=classroom.class_name,
        created_at=classroom.created_at,
        student_count=student_count,
    )


@router.get("/classes/teacher/{teacher_user_id}",
            response_model=list[ClassSummaryResponse])
def list_teacher_classes(teacher_user_id: int, db: Session = Depends(get_db)):
    """
    Return all classes created by a teacher, with a student count per class.
    Ordered by creation date (newest first).
    """
    _get_user_or_404(db, teacher_user_id)
    classes = (
        db.query(MasterclassClass)
        .filter(MasterclassClass.teacher_user_id == teacher_user_id)
        .order_by(MasterclassClass.created_at.desc())
        .all()
    )

    result = []
    for cls in classes:
        count = (
            db.query(MasterclassEnrollment)
            .filter(MasterclassEnrollment.class_id == cls.id)
            .count()
        )
        result.append(ClassSummaryResponse(
            id=cls.id,
            class_code=cls.class_code,
            teacher_user_id=cls.teacher_user_id,
            class_name=cls.class_name,
            created_at=cls.created_at,
            student_count=count,
        ))
    return result


@router.get("/classes/{class_code}", response_model=ClassDetailResponse)
def get_class(class_code: str, db: Session = Depends(get_db)):
    """
    Return full class details including each enrolled student and their progress.

    For each student the response includes:
    - completed_lessons: total number of lessons completed across all modules
    - completed_modules: list of module_ids for which every lesson is done
    """
    classroom = (
        db.query(MasterclassClass)
        .filter(MasterclassClass.class_code == class_code.upper())
        .first()
    )
    if not classroom:
        raise HTTPException(status_code=404, detail=f"Class '{class_code}' not found")

    enrollments = (
        db.query(MasterclassEnrollment)
        .filter(MasterclassEnrollment.class_id == classroom.id)
        .order_by(MasterclassEnrollment.enrolled_at)
        .all()
    )

    students: list[StudentProgressSummary] = []
    for enr in enrollments:
        completed_lessons = (
            db.query(MasterclassProgress)
            .filter(MasterclassProgress.user_id == enr.user_id)
            .count()
        )
        completed_modules = _completed_modules_for_user(db, enr.user_id)
        students.append(StudentProgressSummary(
            user_id=enr.user_id,
            student_name=enr.student_name,
            enrolled_at=enr.enrolled_at,
            completed_lessons=completed_lessons,
            completed_modules=completed_modules,
        ))

    return ClassDetailResponse(
        id=classroom.id,
        class_code=classroom.class_code,
        teacher_user_id=classroom.teacher_user_id,
        class_name=classroom.class_name,
        created_at=classroom.created_at,
        students=students,
    )


@router.post("/classes/{class_code}/enroll",
             response_model=ClassDetailResponse, status_code=201)
def enroll_student(
    class_code: str,
    payload: EnrollmentCreate,
    db: Session = Depends(get_db),
):
    """
    Enroll a student in a class using the 6-character class code.

    Idempotent: if the student is already enrolled the existing enrollment is kept
    and the full class detail is returned (HTTP 200).
    """
    classroom = (
        db.query(MasterclassClass)
        .filter(MasterclassClass.class_code == class_code.upper())
        .first()
    )
    if not classroom:
        raise HTTPException(status_code=404, detail=f"Class '{class_code}' not found")

    _get_user_or_404(db, payload.user_id)

    existing = (
        db.query(MasterclassEnrollment)
        .filter(
            MasterclassEnrollment.class_id == classroom.id,
            MasterclassEnrollment.user_id  == payload.user_id,
        )
        .first()
    )
    if not existing:
        enrollment = MasterclassEnrollment(
            class_id=classroom.id,
            user_id=payload.user_id,
            student_name=payload.student_name,
        )
        db.add(enrollment)
        db.commit()

    # Return full class detail (reuse existing endpoint logic)
    return get_class(class_code, db)


@router.delete("/classes/{class_code}/students/{user_id}", status_code=204)
def remove_student(
    class_code: str,
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Remove a student from a class (teacher action).

    Returns 204 No Content on success.
    Returns 404 if the class or the enrollment does not exist.
    The student's progress records are NOT deleted — only the enrollment link.
    """
    classroom = (
        db.query(MasterclassClass)
        .filter(MasterclassClass.class_code == class_code.upper())
        .first()
    )
    if not classroom:
        raise HTTPException(status_code=404, detail=f"Class '{class_code}' not found")

    enrollment = (
        db.query(MasterclassEnrollment)
        .filter(
            MasterclassEnrollment.class_id == classroom.id,
            MasterclassEnrollment.user_id  == user_id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(
            status_code=404,
            detail=f"User {user_id} is not enrolled in class '{class_code}'",
        )

    db.delete(enrollment)
    db.commit()
