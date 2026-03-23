"""
Check-In & Statistics endpoints.

LEARNING NOTE:
- get_or_create_user() is a common pattern: find the user, or create them if new.
  This is how we handle anonymous device-based users without a registration flow.
- After creating a CheckIn, we link emotions via the junction table by appending
  Emotion objects to checkin.emotions — SQLAlchemy handles the INSERT into
  checkin_emotions automatically.
- We build CheckInResponse manually because emotion_ids is derived from a
  relationship, not a direct column on the CheckIn model.

Endpoints:
  POST /checkins/              - create a new check-in
  GET  /checkins/              - list check-ins for a device
  GET  /checkins/stats/{id}    - emotion statistics for a device
  DELETE /checkins/{id}        - delete a check-in
"""

from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import CheckIn, Emotion, User
from schemas import CheckInCreate, CheckInResponse, StatsResponse, EmotionCount, CategoryCount

router = APIRouter(prefix="/checkins", tags=["Check-Ins"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_or_create_user(db: Session, device_id: str) -> User:
    """
    Find user by device_id, or create a new one if this device is new.

    LEARNING NOTE — "get or create" pattern:
    The first time a device sends a request we create a row in users.
    Every subsequent request finds the same row. No login, no password.
    """
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        user = User(device_id=device_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def checkin_to_response(entry: CheckIn) -> CheckInResponse:
    """Convert a CheckIn ORM object to a CheckInResponse schema."""
    return CheckInResponse(
        id=entry.id,
        user_id=entry.user_id,
        emotion_ids=[e.id for e in entry.emotions],  # follow the relationship
        intensity=entry.intensity,
        note=entry.note,
        lang=entry.lang,
        created_at=entry.created_at,
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/", response_model=CheckInResponse, status_code=201)
def create_checkin(payload: CheckInCreate, db: Session = Depends(get_db)):
    """
    Save a new emotional check-in for a device.

    Flow:
    1. Find or create the User for this device_id
    2. Create the CheckIn row
    3. Look up each emotion_id in the emotions table
    4. Append them to checkin.emotions → SQLAlchemy inserts into checkin_emotions
    """
    user = get_or_create_user(db, payload.device_id)

    entry = CheckIn(
        user_id=user.id,
        intensity=payload.intensity,
        note=payload.note,
        lang=payload.lang,
    )
    db.add(entry)
    db.flush()  # get entry.id before adding emotions

    for eid in payload.emotion_ids:
        emotion = db.query(Emotion).filter(Emotion.id == eid).first()
        if emotion:
            entry.emotions.append(emotion)

    db.commit()
    db.refresh(entry)
    return checkin_to_response(entry)


@router.get("/", response_model=list[CheckInResponse])
def list_checkins(device_id: str = "default", limit: int = 50, db: Session = Depends(get_db)):
    """Return recent check-ins for a device, newest first."""
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        return []
    entries = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user.id)
        .order_by(CheckIn.created_at.desc())
        .limit(limit)
        .all()
    )
    return [checkin_to_response(e) for e in entries]


@router.get("/stats/{device_id}", response_model=StatsResponse)
def get_stats(device_id: str, db: Session = Depends(get_db)):
    """
    Emotion statistics for a device:
    - Total check-ins
    - Current streak (consecutive days with at least one check-in)
    - Top 5 emotions by frequency
    - Category distribution

    LEARNING NOTE — Python Counter vs SQL GROUP BY:
    For one user's data, counting in Python is simpler and more readable.
    For large multi-user analytics, you'd push this into SQL with GROUP BY.
    """
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        return StatsResponse(device_id=device_id, total_checkins=0,
                             streak_days=0, top_emotions=[], category_distribution=[])

    entries = db.query(CheckIn).filter(CheckIn.user_id == user.id).all()
    if not entries:
        return StatsResponse(device_id=device_id, total_checkins=0,
                             streak_days=0, top_emotions=[], category_distribution=[])

    # Top emotions
    all_emotion_ids = [e.id for entry in entries for e in entry.emotions]
    top_emotions = [
        EmotionCount(emotion_id=eid, count=cnt)
        for eid, cnt in Counter(all_emotion_ids).most_common(5)
    ]

    # Category distribution — derived from emotion.category via the relationship
    all_categories = [e.category for entry in entries for e in entry.emotions]
    category_distribution = [
        CategoryCount(category=cat, count=cnt)
        for cat, cnt in Counter(all_categories).most_common()
    ]

    # Streak: consecutive days ending today
    checkin_dates = sorted({entry.created_at.date() for entry in entries}, reverse=True)
    streak, expected = 0, datetime.now(timezone.utc).date()
    for d in checkin_dates:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif d < expected:
            break

    return StatsResponse(
        device_id=device_id,
        total_checkins=len(entries),
        streak_days=streak,
        top_emotions=top_emotions,
        category_distribution=category_distribution,
    )


@router.delete("/{checkin_id}", status_code=204)
def delete_checkin(checkin_id: int, db: Session = Depends(get_db)):
    entry = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Check-in not found")
    db.delete(entry)
    db.commit()
