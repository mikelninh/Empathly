"""
Pydantic schemas — define what goes IN and OUT of the API.

LEARNING NOTE:
- Models (models.py) = database shape
- Schemas (schemas.py) = API shape (what the client sends / receives)
- They're separate because the DB and API don't always match 1:1
  Example: the DB stores user_id as an integer, but the API accepts a device_id string
- Pydantic validates types automatically and returns a 422 error if input is wrong
- model_config = {"from_attributes": True} lets Pydantic read SQLAlchemy objects directly
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Users ──────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id:           int
    device_id:    str
    display_name: Optional[str]
    avatar_emoji: str
    created_at:   datetime

    model_config = {"from_attributes": True}


# ── Emotions ───────────────────────────────────────────────────────────────────

class EmotionResponse(BaseModel):
    id:       str
    emoji:    str
    category: str
    name_de:  str
    name_vi:  str
    name_en:  str
    name_tr:  str
    name_ar:  str
    name_es:  str
    name_fr:  str
    name_uk:  str
    name_pl:  str
    name_el:  str
    name_ta:  str

    model_config = {"from_attributes": True}


# ── Check-Ins ──────────────────────────────────────────────────────────────────

class CheckInCreate(BaseModel):
    device_id:  str = Field(default="default", description="Browser UUID from localStorage")
    emotion_ids: list[str] = Field(..., min_length=1, description="At least one emotion ID")
    intensity:  int = Field(default=3, ge=1, le=5, description="1=barely felt, 5=very intense")
    note:       Optional[str] = None
    lang:       str = "de"


class CheckInResponse(BaseModel):
    id:          int
    user_id:     int
    emotion_ids: list[str]    # derived from the junction table relationship
    intensity:   int
    note:        Optional[str]
    lang:        str
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── Statistics ─────────────────────────────────────────────────────────────────

class EmotionCount(BaseModel):
    emotion_id: str
    count:      int


class CategoryCount(BaseModel):
    category: str
    count:    int


class StatsResponse(BaseModel):
    device_id:             str
    total_checkins:        int
    streak_days:           int
    top_emotions:          list[EmotionCount]
    category_distribution: list[CategoryCount]


# ── Journal ────────────────────────────────────────────────────────────────────

class JournalCreate(BaseModel):
    device_id:   str = Field(default="default", description="Browser UUID from localStorage")
    emotion_ids: list[str] = Field(..., min_length=1)
    note:        Optional[str] = None
    lang:        str = "de"


class JournalResponse(BaseModel):
    id:          int
    user_id:     int
    emotion_ids: list[str]    # derived from the junction table relationship
    note:        Optional[str]
    lang:        str
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── AI Requests ────────────────────────────────────────────────────────────────

class CulturalBridgeRequest(BaseModel):
    emotion_id:    str = Field(..., description="e.g. 'liebe', 'freude'")
    emotion_name:  str = Field(..., description="Human-readable name, e.g. 'Liebe'")
    source_lang:   str = Field(default="de")
    target_lang:   str = Field(default="vi")
    response_lang: str = Field(default="de")


class CulturalBridgeResponse(BaseModel):
    emotion_id:  str
    source_lang: str
    target_lang: str
    insight:     str
    vocabulary:  list[dict]


class JournalAnalysisRequest(BaseModel):
    device_id: str = "default"
    lang:      str = "de"


class JournalAnalysisResponse(BaseModel):
    insight:          str
    patterns:         list[str]
    suggestion:       str
    follow_up_question: str = ""


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3)
    lang:     str = "de"


class AskResponse(BaseModel):
    answer: str


class DynamicPromptRequest(BaseModel):
    type:          str = Field(..., description="talk_followup | checkin_reflection | story_starter | story_feedback | journal_question")
    emotion_ids:   list[str] = []
    emotion_names: list[str] = []
    needs:         list[str] = []
    context:       str = ""
    user_text:     str = ""
    lang:          str = "de"


class DynamicPromptResponse(BaseModel):
    text: str
