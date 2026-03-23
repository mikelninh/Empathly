"""
Journal entry endpoints.

Endpoints:
  POST   /journal/          - create entry
  GET    /journal/          - list entries for a user (?user_id=)
  PUT    /journal/{id}      - update note or emotion_ids
  DELETE /journal/{id}      - delete entry
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Emotion, JournalEntry, User
from schemas import JournalCreate, JournalResponse, JournalUpdate

router = APIRouter(prefix="/journal", tags=["Journal"])


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


def journal_to_response(entry: JournalEntry) -> JournalResponse:
    return JournalResponse(
        id=entry.id,
        user_id=entry.user_id,
        emotion_ids=[e.id for e in entry.emotions],
        note=entry.note,
        lang=entry.lang,
        created_at=entry.created_at,
    )


@router.post("/", response_model=JournalResponse, status_code=201)
def create_entry(payload: JournalCreate, db: Session = Depends(get_db)):
    _get_user_or_404(db, payload.user_id)

    entry = JournalEntry(
        user_id=payload.user_id,
        note=payload.note,
        lang=payload.lang,
    )
    db.add(entry)
    db.flush()

    for eid in payload.emotion_ids:
        emotion = db.query(Emotion).filter(Emotion.id == eid).first()
        if emotion:
            entry.emotions.append(emotion)

    db.commit()
    db.refresh(entry)
    return journal_to_response(entry)


@router.get("/", response_model=list[JournalResponse])
def list_entries(user_id: int, limit: int = 30, db: Session = Depends(get_db)):
    _get_user_or_404(db, user_id)
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
    return [journal_to_response(e) for e in entries]


@router.put("/{entry_id}", response_model=JournalResponse)
def update_entry(entry_id: int, payload: JournalUpdate, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    if payload.note is not None:
        entry.note = payload.note
    if payload.emotion_ids is not None:
        entry.emotions = []
        db.flush()
        for eid in payload.emotion_ids:
            emotion = db.query(Emotion).filter(Emotion.id == eid).first()
            if emotion:
                entry.emotions.append(emotion)
    db.commit()
    db.refresh(entry)
    return journal_to_response(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(entry)
    db.commit()
