"""
Check-In & Statistics endpoints.

LEARNING NOTE:
- APIRouter groups related endpoints (like a Blueprint in Flask)
- Depends(get_db) injects a DB session per request
- We use SQLAlchemy queries to read/write data

Endpoints:
  POST /checkins/             - create a new check-in
  GET  /checkins/             - list check-ins (with optional filter by user)
  GET  /checkins/stats/{uid}  - emotion statistics for a user
  GET  /checkins/{id}         - get single check-in
  DELETE /checkins/{id}       - delete a check-in
"""

from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import CheckIn
from schemas import CheckInCreate, CheckInResponse, StatsResponse, EmotionCount, CategoryCount

router = APIRouter(prefix="/checkins", tags=["Check-Ins"])


@router.post("/", response_model=CheckInResponse, status_code=201)
def create_checkin(payload: CheckInCreate, db: Session = Depends(get_db)):
    """Save a new emotional check-in."""
    entry = CheckIn(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/", response_model=list[CheckInResponse])
def list_checkins(user_id: str = "default", limit: int = 50, db: Session = Depends(get_db)):
    """Return recent check-ins for a user, newest first."""
    return (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user_id)
        .order_by(CheckIn.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/stats/{user_id}", response_model=StatsResponse)
def get_stats(user_id: str, db: Session = Depends(get_db)):
    """
    Emotion statistics for a user:
    - Total check-ins
    - Current streak (consecutive days with at least one check-in)
    - Top 5 emotions
    - Category distribution

    LEARNING NOTE:
    We use Python's Counter class to count occurrences, which is simpler
    than GROUP BY in SQL for this scale. For large datasets you'd use SQL aggregation.
    """
    entries = db.query(CheckIn).filter(CheckIn.user_id == user_id).all()

    if not entries:
        return StatsResponse(
            user_id=user_id,
            total_checkins=0,
            streak_days=0,
            top_emotions=[],
            category_distribution=[],
        )

    # ── Top emotions ──
    all_emotion_ids = [eid for entry in entries for eid in (entry.emotion_ids or [])]
    emotion_counter = Counter(all_emotion_ids)
    top_emotions = [
        EmotionCount(emotion_id=eid, count=cnt)
        for eid, cnt in emotion_counter.most_common(5)
    ]

    # ── Category distribution ──
    categories = [entry.category for entry in entries if entry.category]
    category_counter = Counter(categories)
    category_distribution = [
        CategoryCount(category=cat, count=cnt)
        for cat, cnt in category_counter.most_common()
    ]

    # ── Streak calculation ──
    # Get unique dates of check-ins, sorted descending
    checkin_dates = sorted(
        {entry.created_at.date() for entry in entries},
        reverse=True,
    )
    streak = 0
    today = datetime.now(timezone.utc).date()
    expected = today
    for d in checkin_dates:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif d < expected:
            break  # gap found

    return StatsResponse(
        user_id=user_id,
        total_checkins=len(entries),
        streak_days=streak,
        top_emotions=top_emotions,
        category_distribution=category_distribution,
    )


@router.get("/{checkin_id}", response_model=CheckInResponse)
def get_checkin(checkin_id: int, db: Session = Depends(get_db)):
    entry = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Check-in not found")
    return entry


@router.delete("/{checkin_id}", status_code=204)
def delete_checkin(checkin_id: int, db: Session = Depends(get_db)):
    entry = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Check-in not found")
    db.delete(entry)
    db.commit()
