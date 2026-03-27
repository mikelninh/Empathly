"""
Pydantic schemas — define what goes IN and OUT of the API.

LEARNING NOTE:
- Models (models.py) = database shape
- Schemas (schemas.py) = API shape (what the client sends / receives)
- They're separate because the DB and API don't always match 1:1
- Pydantic validates types automatically and returns a 422 error if input is wrong
- model_config = {"from_attributes": True} lets Pydantic read SQLAlchemy objects directly
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Users ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    supabase_uid: str = Field(..., description="Supabase user UUID from the verified JWT")
    email:        Optional[str] = None
    display_name: Optional[str] = None
    lang:         str = "en"


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    lang:         Optional[str] = None


class UserResponse(BaseModel):
    id:           int
    supabase_uid: str
    email:        Optional[str]
    display_name: Optional[str]
    lang:         str
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
    user_id:     int  = Field(..., description="Integer user ID from /users/")
    emotion_ids: list[str] = Field(default=[], min_length=0)
    need_ids:    list[str] = []
    dimensions:  list[str] = []   # unique need dimensions, e.g. ["koerper", "geist"]
    intensity:   int  = Field(default=3, ge=1, le=5)
    note:        Optional[str] = None
    lang:        str  = "en"


class CheckInUpdate(BaseModel):
    intensity: Optional[int] = Field(None, ge=1, le=5)
    note:      Optional[str] = None


class CheckInResponse(BaseModel):
    id:          int
    user_id:     int
    emotion_ids: list[str]
    need_ids:    list[str]
    dimensions:  list[str]
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


class DimensionCount(BaseModel):
    dimension: str
    count:     int


class StatsResponse(BaseModel):
    user_id:                int
    total_checkins:         int
    streak_days:            int
    top_emotions:           list[EmotionCount]
    category_distribution:  list[CategoryCount]
    dimension_distribution: list[DimensionCount]


# ── Journal ────────────────────────────────────────────────────────────────────

class JournalCreate(BaseModel):
    user_id:     int  = Field(..., description="Integer user ID from /users/")
    emotion_ids: list[str] = Field(..., min_length=1)
    note:        Optional[str] = None
    lang:        str  = "en"


class JournalUpdate(BaseModel):
    note:        Optional[str] = None
    emotion_ids: Optional[list[str]] = None


class JournalResponse(BaseModel):
    id:          int
    user_id:     int
    emotion_ids: list[str]
    note:        Optional[str]
    lang:        str
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── AI Requests ────────────────────────────────────────────────────────────────

class CulturalBridgeRequest(BaseModel):
    emotion_id:    str = Field(..., description="e.g. 'liebe', 'freude'")
    emotion_name:  str = Field(..., description="Human-readable name, e.g. 'Liebe'")
    source_lang:   str = Field(default="en")
    target_lang:   str = Field(default="el")
    response_lang: str = Field(default="en")


class CulturalBridgeResponse(BaseModel):
    emotion_id:  str
    source_lang: str
    target_lang: str
    insight:     str
    vocabulary:  list[dict]


class JournalAnalysisRequest(BaseModel):
    user_id: int
    lang:    str = "en"


class JournalAnalysisResponse(BaseModel):
    insight:            str
    patterns:           list[str]
    suggestion:         str
    follow_up_question: str = ""


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3)
    lang:     str = "en"


class AskResponse(BaseModel):
    answer: str


class DynamicPromptRequest(BaseModel):
    type:          str = Field(..., description="talk_followup | checkin_reflection | story_starter | story_feedback | journal_question")
    emotion_ids:   list[str] = []
    emotion_names: list[str] = []
    needs:         list[str] = []
    context:       str = ""
    user_text:     str = ""
    lang:          str = "en"


class DynamicPromptResponse(BaseModel):
    text: str


# ── OpenAI AI Output ───────────────────────────────────────────────────────────

OPENAI_MODELS = {"gpt-4o-mini", "gpt-4.1-mini", "gpt-5-mini"}


class GenerateAIOutputRequest(BaseModel):
    user_id: int
    lang:    str = "en"
    model:   str = Field(default="gpt-4o-mini", description="gpt-4o-mini | gpt-4.1-mini | gpt-5-mini")


class GenerateAIOutputResponse(BaseModel):
    text:  str
    model: str
