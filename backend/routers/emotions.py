"""
Emotion endpoints — read-only (emotions are seeded, not user-created).

Endpoints:
  GET /emotions/        - list all 67 emotions
  GET /emotions/{id}    - get a single emotion by id (e.g. "freude")
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Emotion
from schemas import EmotionResponse

router = APIRouter(prefix="/emotions", tags=["Emotions"])


@router.get("/", response_model=list[EmotionResponse])
def list_emotions(db: Session = Depends(get_db)):
    return db.query(Emotion).order_by(Emotion.category, Emotion.id).all()


@router.get("/{emotion_id}", response_model=EmotionResponse)
def get_emotion(emotion_id: str, db: Session = Depends(get_db)):
    emotion = db.query(Emotion).filter(Emotion.id == emotion_id).first()
    if not emotion:
        raise HTTPException(status_code=404, detail=f"Emotion '{emotion_id}' not found")
    return emotion
