"""
User endpoints — upsert by Supabase UID, read, update, delete.

Auth flow:
  1. Frontend signs in via Supabase (magic link or Google OAuth).
  2. Supabase returns a JWT + user.id (supabase_uid) + user.email.
  3. Frontend calls POST /users/ with those values — we get-or-create the profile row.
  4. All subsequent requests carry the integer user.id we return here.

For production you'd verify the Supabase JWT in a FastAPI middleware before
trusting supabase_uid. For the demo, we accept it directly from the frontend.
See TUTORIAL.md → Phase 5: Authentication for the full JWT verification snippet.

Endpoints:
  POST   /users/          - upsert by supabase_uid; returns integer user id
  GET    /users/{user_id} - get profile by integer id
  PUT    /users/{user_id} - update display_name / lang
  DELETE /users/{user_id} - delete user and all their data (cascade)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=200)
def upsert_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Get or create the user profile for this Supabase UID.

    Called once after every successful Supabase sign-in. Safe to call on every
    app load — returns the existing row if already present, creates one if new.
    The integer id returned here is what the frontend sends as user_id on all
    other requests (check-ins, journal, etc.).
    """
    user = db.query(User).filter(User.supabase_uid == payload.supabase_uid).first()
    if not user:
        user = User(
            supabase_uid=payload.supabase_uid,
            email=payload.email,
            display_name=payload.display_name,
            lang=payload.lang,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.lang is not None:
        user.lang = payload.lang
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
