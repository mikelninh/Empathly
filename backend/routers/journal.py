"""
Journal entry endpoints.

Same pattern as checkins.py:
- device_id identifies the user (get or create)
- emotion_ids are linked via the junction table, not stored as JSON
- Responses are built manually to derive emotion_ids from the relationship

Endpoints:
  POST   /journal/          - create entry
  GET    /journal/          - list entries for a device
  DELETE /journal/{id}      - delete entry
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Emotion, JournalEntry, User
from routers.checkins import get_or_create_user
from schemas import JournalCreate, JournalResponse

router = APIRouter(prefix="/journal", tags=["Journal"])


def journal_to_response(entry: JournalEntry) -> JournalResponse:
    """Convert a JournalEntry ORM object to a JournalResponse schema."""
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
    user = get_or_create_user(db, payload.device_id)

    entry = JournalEntry(
        user_id=user.id,
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
def list_entries(device_id: str = "default", limit: int = 30, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.device_id == device_id).first()
    if not user:
        return []
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
    return [journal_to_response(e) for e in entries]


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(entry)
    db.commit()
