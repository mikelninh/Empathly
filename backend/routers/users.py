"""
User endpoints — get-or-create by device_id, read, delete.

Endpoints:
  POST   /users/          - get or create user by device_id; returns user with integer id
  GET    /users/{user_id} - get user by integer id
  DELETE /users/{user_id} - delete user and all their data (cascade)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=200)
def get_or_create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Find the user for this device_id, or create one if new.
    Always returns the user with their integer id — the frontend stores this
    and sends it as user_id on all subsequent requests.
    """
    user = db.query(User).filter(User.device_id == payload.device_id).first()
    if not user:
        user = User(device_id=payload.device_id, display_name=payload.display_name)
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
    if payload.avatar_emoji is not None:
        user.avatar_emoji = payload.avatar_emoji
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
