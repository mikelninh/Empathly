"""
Check-In & Statistics endpoints.

Endpoints:
  POST   /checkins/              - create a new check-in
  GET    /checkins/              - list check-ins for a user (?user_id=)
  PUT    /checkins/{id}          - update note or intensity
  DELETE /checkins/{id}          - delete a check-in
  GET    /checkins/stats/{user_id} - emotion statistics for a user
"""

import json
from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import CheckIn, Emotion, User
from schemas import (
    CheckInCreate, CheckInResponse, CheckInUpdate,
    StatsResponse, EmotionCount, CategoryCount, DimensionCount,
)

router = APIRouter(prefix="/checkins", tags=["Check-Ins"])


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


def checkin_to_response(entry: CheckIn) -> CheckInResponse:
    return CheckInResponse(
        id=entry.id,
        user_id=entry.user_id,
        emotion_ids=[e.id for e in entry.emotions],
        need_ids=json.loads(entry.needs_json) if entry.needs_json else [],
        dimensions=json.loads(entry.dimensions) if entry.dimensions else [],
        intensity=entry.intensity,
        note=entry.note,
        lang=entry.lang,
        created_at=entry.created_at,
    )


# Also exported for use in journal.py (get_or_create pattern)
def get_or_create_user(db: Session, device_id: str) -> User:
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        user = User(device_id=device_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.post("/", response_model=CheckInResponse, status_code=201)
def create_checkin(payload: CheckInCreate, db: Session = Depends(get_db)):
    _get_user_or_404(db, payload.user_id)

    entry = CheckIn(
        user_id=payload.user_id,
        intensity=payload.intensity,
        note=payload.note,
        lang=payload.lang,
        needs_json=json.dumps(payload.need_ids) if payload.need_ids else None,
        dimensions=json.dumps(payload.dimensions) if payload.dimensions else None,
    )
    db.add(entry)
    db.flush()

    for eid in payload.emotion_ids:
        emotion = db.query(Emotion).filter(Emotion.id == eid).first()
        if emotion:
            entry.emotions.append(emotion)

    db.commit()
    db.refresh(entry)
    return checkin_to_response(entry)


@router.get("/", response_model=list[CheckInResponse])
def list_checkins(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    _get_user_or_404(db, user_id)
    entries = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user_id)
        .order_by(CheckIn.created_at.desc())
        .limit(limit)
        .all()
    )
    return [checkin_to_response(e) for e in entries]


@router.put("/{checkin_id}", response_model=CheckInResponse)
def update_checkin(checkin_id: int, payload: CheckInUpdate, db: Session = Depends(get_db)):
    entry = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Check-in not found")
    if payload.intensity is not None:
        entry.intensity = payload.intensity
    if payload.note is not None:
        entry.note = payload.note
    db.commit()
    db.refresh(entry)
    return checkin_to_response(entry)


@router.delete("/{checkin_id}", status_code=204)
def delete_checkin(checkin_id: int, db: Session = Depends(get_db)):
    entry = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Check-in not found")
    db.delete(entry)
    db.commit()


@router.get("/stats/{user_id}", response_model=StatsResponse)
def get_stats(user_id: int, db: Session = Depends(get_db)):
    _get_user_or_404(db, user_id)

    entries = db.query(CheckIn).filter(CheckIn.user_id == user_id).all()
    if not entries:
        return StatsResponse(user_id=user_id, total_checkins=0,
                             streak_days=0, top_emotions=[], category_distribution=[],
                             dimension_distribution=[])

    all_emotion_ids = [e.id for entry in entries for e in entry.emotions]
    top_emotions = [
        EmotionCount(emotion_id=eid, count=cnt)
        for eid, cnt in Counter(all_emotion_ids).most_common(5)
    ]

    all_categories = [e.category for entry in entries for e in entry.emotions]
    category_distribution = [
        CategoryCount(category=cat, count=cnt)
        for cat, cnt in Counter(all_categories).most_common()
    ]

    all_dims = [
        dim
        for entry in entries
        for dim in (json.loads(entry.dimensions) if entry.dimensions else [])
    ]
    dimension_distribution = [
        DimensionCount(dimension=dim, count=cnt)
        for dim, cnt in Counter(all_dims).most_common()
    ]

    checkin_dates = sorted({entry.created_at.date() for entry in entries}, reverse=True)
    streak, expected = 0, datetime.now(timezone.utc).date()
    for d in checkin_dates:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif d < expected:
            break

    return StatsResponse(
        user_id=user_id,
        total_checkins=len(entries),
        streak_days=streak,
        top_emotions=top_emotions,
        category_distribution=category_distribution,
        dimension_distribution=dimension_distribution,
    )
