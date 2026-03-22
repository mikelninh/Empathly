"""
Pydantic schemas — define what goes IN and OUT of the API.

LEARNING NOTE:
- Models (models.py) = database shape
- Schemas (schemas.py) = API shape (what the client sends / receives)
- They're separate because DB and API don't always match 1:1
- Pydantic validates types automatically and gives good error messages
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Check-In ──────────────────────────────────────────────────────────────────

class CheckInCreate(BaseModel):
    user_id: str = "default"
    emotion_ids: list[str] = Field(..., min_length=1, description="At least one emotion ID")
    category: Optional[str] = None
    intensity: int = Field(default=3, ge=1, le=5, description="1=barely felt, 5=very intense")
    note: Optional[str] = None
    lang: str = "de"


class CheckInResponse(BaseModel):
    id: int
    user_id: str
    emotion_ids: list[str]
    category: Optional[str]
    intensity: int
    note: Optional[str]
    lang: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Statistics ────────────────────────────────────────────────────────────────

class EmotionCount(BaseModel):
    emotion_id: str
    count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class StatsResponse(BaseModel):
    user_id: str
    total_checkins: int
    streak_days: int
    top_emotions: list[EmotionCount]
    category_distribution: list[CategoryCount]


# ── Journal ───────────────────────────────────────────────────────────────────

class JournalCreate(BaseModel):
    user_id: str = "default"
    emotions: list[str] = Field(..., min_length=1)
    note: Optional[str] = None
    lang: str = "de"


class JournalResponse(BaseModel):
    id: int
    user_id: str
    emotions: list[str]
    note: Optional[str]
    lang: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── AI Requests ───────────────────────────────────────────────────────────────

class CulturalBridgeRequest(BaseModel):
    emotion_id: str = Field(..., description="e.g. 'liebe', 'freude'")
    emotion_name: str = Field(..., description="Human-readable name, e.g. 'Liebe'")
    source_lang: str = Field(default="de", description="Language the user speaks")
    target_lang: str = Field(default="vi", description="Language to compare with")
    response_lang: str = Field(default="de", description="Language to write the response in")


class CulturalBridgeResponse(BaseModel):
    emotion_id: str
    source_lang: str
    target_lang: str
    insight: str
    vocabulary: list[dict]  # [{"word": "thương", "meaning": "...", "usage": "..."}]


class JournalAnalysisRequest(BaseModel):
    user_id: str = "default"
    lang: str = "de"


class JournalAnalysisResponse(BaseModel):
    insight: str
    patterns: list[str]
    suggestion: str
