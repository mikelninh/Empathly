"""
Journal entry CRUD endpoints.

Endpoints:
  POST   /journal/          - create entry
  GET    /journal/          - list entries for a user
  GET    /journal/{id}      - get single entry
  DELETE /journal/{id}      - delete entry
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import JournalEntry
from schemas import JournalCreate, JournalResponse

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.post("/", response_model=JournalResponse, status_code=201)
def create_entry(payload: JournalCreate, db: Session = Depends(get_db)):
    entry = JournalEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/", response_model=list[JournalResponse])
def list_entries(user_id: str = "default", limit: int = 30, db: Session = Depends(get_db)):
    return (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/{entry_id}", response_model=JournalResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(entry)
    db.commit()
