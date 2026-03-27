# Building Empathly From Scratch — Backend Tutorial

A step-by-step guide for developers who want to understand how to build a
production-grade API backend. We use Empathly as the example project.

**Stack:** Python · FastAPI · SQLAlchemy · SQLite · Pydantic

---

## PHASE 1 — Database Schema (First Draft)

Before writing any code, you design your data model on paper (or in DBML).
Ask yourself: *What are the real-world things in my system? What do they know about each other?*

### Step 1 — Identify your entities

In Empathly:
- A **User** plays the game and saves progress
- An **Emotion** is a card (Freude, Sehnsucht, …)
- A **CheckIn** is a user's daily emotional snapshot
- A **JournalEntry** is a user's written reflection
- **MasterclassProgress** tracks which lessons a user completed
- **MasterclassCertificate** is issued when a module is complete
- **MasterclassClass** is a teacher's classroom group
- **MasterclassEnrollment** links students to a class

### Step 2 — Draw the schema (DBML for dbdiagram.io)

DBML is a simple language for describing database tables.
Paste this at https://dbdiagram.io to see the visual diagram.

```dbml
Table users {
  id            integer   [pk, increment]
  supabase_uid  varchar   [unique, not null, note: "UUID from Supabase Auth JWT"]
  email         varchar   [note: "From Supabase; stored for display only"]
  display_name  varchar
  lang          varchar   [default: "en"]
  created_at    datetime
}

Table emotions {
  id    varchar  [pk, note: "e.g. 'freude', 'sehnsucht'"]
  de    varchar
  en    varchar
  vi    varchar
  zh    varchar
  // ... add more language columns as needed
}

Table checkins {
  id         integer  [pk, increment]
  user_id    integer  [ref: > users.id, not null]
  intensity  integer  [note: "1-5"]
  note       text
  lang       varchar
  created_at datetime
}

Table checkin_emotions {
  checkin_id  integer  [ref: > checkins.id]
  emotion_id  varchar  [ref: > emotions.id]
  indexes { (checkin_id, emotion_id) [pk] }
}

Table journal_entries {
  id         integer  [pk, increment]
  user_id    integer  [ref: > users.id, not null]
  note       text
  lang       varchar
  created_at datetime
}

Table journal_emotions {
  entry_id   integer  [ref: > journal_entries.id]
  emotion_id varchar  [ref: > emotions.id]
  indexes { (entry_id, emotion_id) [pk] }
}

Table masterclass_progress {
  id           integer  [pk, increment]
  user_id      integer  [ref: > users.id, not null]
  lesson_id    varchar  [not null, note: "e.g. 'm1_l1_intro_emotions'"]
  module_id    varchar  [not null, note: "e.g. 'module_1'"]
  score        integer  [note: "0-100, null if no quiz"]
  completed_at datetime
  indexes { (user_id, lesson_id) [unique] }
}

Table masterclass_certificates {
  id        integer  [pk, increment]
  cert_uuid varchar  [unique, not null]
  user_id   integer  [ref: > users.id, not null]
  module_id varchar  [not null]
  user_name varchar
  issued_at datetime
}

Table masterclass_classes {
  id              integer  [pk, increment]
  class_code      varchar  [unique, not null, note: "6-char teacher code"]
  teacher_user_id integer  [ref: > users.id, not null]
  class_name      varchar
  created_at      datetime
}

Table masterclass_enrollments {
  id           integer  [pk, increment]
  class_id     integer  [ref: > masterclass_classes.id, not null]
  user_id      integer  [ref: > users.id, not null]
  student_name varchar
  enrolled_at  datetime
  indexes { (class_id, user_id) [unique] }
}
```

**Why this design?**
- We delegate auth entirely to Supabase — no passwords, no token management in our code
- `supabase_uid` is the stable UUID Supabase issues; it never changes even if the user changes email
- `checkin_emotions` is a *junction table* (many-to-many): one check-in can have multiple emotions
- `cert_uuid` is a UUID4 that can be publicly shared for certificate verification
- The `indexes` block with `[unique]` prevents duplicate records (e.g., completing the same lesson twice)

---

## PHASE 2 — List of Needed Endpoints

Before writing code, document your API as a spec. For each endpoint, write:
`METHOD /path — what it does — request body — response`

```
AUTH / USERS
  POST   /users/          Upsert user profile after Supabase sign-in (supabase_uid + email)
  GET    /users/{user_id} Get profile by integer id
  PUT    /users/{user_id} Update display_name or lang
  DELETE /users/{user_id} Delete account + all data

CHECK-INS
  POST   /checkins/               Record a daily check-in with emotions
  GET    /checkins/stats/{user_id} Aggregated stats (streaks, top emotions)

JOURNAL
  POST   /journal/                Create a journal entry
  GET    /journal/{user_id}       List entries (paginated)
  DELETE /journal/{entry_id}      Delete an entry

AI
  POST   /ai/cultural-bridge      Cultural comparison for an emotion (JSON)
  POST   /ai/cultural-bridge/stream  Same, but streamed SSE token by token
  POST   /ai/journal-analysis     Pattern analysis of recent journal entries
  POST   /ai/dynamic-prompt       Contextual prompts (talk, checkin, story)
  POST   /ai/ask                  RAG-powered open Q&A
  POST   /ai/ask/stream           Same, streamed

MASTERCLASS
  POST   /masterclass/progress              Record a completed lesson
  GET    /masterclass/progress/{user_id}    All progress for a user
  GET    /masterclass/module/{user_id}/{module_id}  Module completion status
  POST   /masterclass/certificates          Issue a certificate (all lessons done)
  GET    /masterclass/certificates/{user_id} List user certificates
  GET    /masterclass/certificates/verify/{cert_uuid} Public verification
  POST   /masterclass/classes               Teacher creates a class
  GET    /masterclass/classes/{code}        Get class by code
  POST   /masterclass/classes/{code}/enroll  Student joins a class
  GET    /masterclass/classes/{code}/roster  Teacher views student progress
```

**Rule of thumb:** REST endpoints map to nouns (users, checkins, journal).
Actions that don't fit are either POST sub-routes (/enroll) or separate resources (/progress).

---

## PHASE 3 — Initial Backend Infrastructure Setup

### Step 1 — Project structure

```
backend/
  main.py           ← FastAPI app + CORS + router registration
  database.py       ← SQLAlchemy engine + session factory + Base
  models.py         ← All ORM model classes (one per table)
  schemas.py        ← Pydantic request/response models
  config.py         ← Environment variable settings (API keys, etc.)
  routers/
    users.py        ← /users/ endpoints
    checkins.py     ← /checkins/ endpoints
    journal.py      ← /journal/ endpoints
    ai.py           ← /ai/ endpoints
    masterclass.py  ← /masterclass/ endpoints
  data/
    knowledge_base.md  ← RAG source text
  requirements.txt
  .env              ← secrets (never commit this)
```

### Step 2 — Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic httpx python-dotenv
# Save them:
pip freeze > requirements.txt
```

### Step 3 — database.py

This file creates the database connection and provides a session factory.
Every endpoint gets a fresh DB session per request (via dependency injection).

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./empathly.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite only
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency: opens a DB session, yields it, always closes it.
    Usage in endpoint: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 4 — config.py

Read secrets from environment variables. Never hardcode API keys.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = ""
    openrouter_api_key: str = ""
    default_model: str = "meta-llama/llama-3.3-70b-instruct:free"
    openai_default_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"

settings = Settings()
```

```bash
# .env (never commit this file!)
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
```

### Step 5 — models.py (SQLAlchemy ORM)

Each class maps to one database table. SQLAlchemy creates the tables for you.

```python
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

# Many-to-many join table (no class needed — just a Table)
checkin_emotions = Table(
    "checkin_emotions", Base.metadata,
    Column("checkin_id", Integer, ForeignKey("checkins.id", ondelete="CASCADE"), primary_key=True),
    Column("emotion_id", String,  ForeignKey("emotions.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id           = Column(Integer, primary_key=True, index=True)
    supabase_uid = Column(String,  unique=True, nullable=False, index=True)
    email        = Column(String,  nullable=True)
    display_name = Column(String,  nullable=True)
    lang         = Column(String,  default="en")
    created_at   = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CheckIn(Base):
    __tablename__ = "checkins"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    intensity  = Column(Integer, nullable=True)
    note       = Column(Text,    nullable=True)
    lang       = Column(String,  default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user       = relationship("User")
    emotions   = relationship("Emotion", secondary=checkin_emotions)
```

### Step 6 — main.py

Wire everything together.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # import so SQLAlchemy registers all tables

# Auto-create all tables on startup
Base.metadata.create_all(bind=engine)

from routers import users, checkins, journal, ai, masterclass

app = FastAPI(title="Empathly API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock this down in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(checkins.router)
app.include_router(journal.router)
app.include_router(ai.router)
app.include_router(masterclass.router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

```bash
# Start the server
uvicorn main:app --reload
# API docs at: http://localhost:8000/docs
```

---

## PHASE 4 — CRUD Endpoints (with examples)

CRUD = Create, Read, Update, Delete. This is the pattern for every resource.

### schemas.py — Pydantic models

Pydantic validates incoming JSON and shapes outgoing responses.
Keep Input schemas separate from Response schemas.

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    supabase_uid: str         # from Supabase JWT
    email: Optional[str] = None
    display_name: Optional[str] = None
    lang: str = "en"

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    lang: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    supabase_uid: str
    email: Optional[str]
    display_name: Optional[str]
    lang: str
    created_at: datetime

    class Config:
        from_attributes = True  # allows reading from SQLAlchemy objects

class CheckInCreate(BaseModel):
    user_id: int
    emotion_ids: list[str]
    intensity: Optional[int] = None
    note: Optional[str] = None
    lang: str = "en"
```

### routers/users.py

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse)
def upsert_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Upsert user profile after Supabase sign-in.
    The frontend signs in via Supabase, gets a UID + email, and sends them here.
    We create the profile row on first login, return existing row on subsequent logins.
    """
    user = db.query(User).filter(User.supabase_uid == payload.supabase_uid).first()
    if user:
        return user  # already exists — return it
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

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.lang:
        user.lang = payload.lang
    db.commit()
    db.refresh(user)
    return user
```

### routers/checkins.py

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, CheckIn, Emotion
from schemas import CheckInCreate

router = APIRouter(prefix="/checkins", tags=["Check-ins"])

@router.post("/")
def create_checkin(payload: CheckInCreate, db: Session = Depends(get_db)):
    """
    Record a daily check-in.
    Key pattern: attach related objects (emotions) before committing.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    checkin = CheckIn(
        user_id=payload.user_id,
        intensity=payload.intensity,
        note=payload.note,
        lang=payload.lang,
    )
    # Attach emotions (many-to-many)
    for emotion_id in payload.emotion_ids:
        emotion = db.query(Emotion).filter(Emotion.id == emotion_id).first()
        if emotion:
            checkin.emotions.append(emotion)

    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return {"id": checkin.id, "created_at": checkin.created_at}

@router.get("/stats/{user_id}")
def get_stats(user_id: int, db: Session = Depends(get_db)):
    """
    Return streak length + top 5 most checked-in emotions.
    Demonstrates aggregating data in Python after a DB query.
    """
    entries = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user_id)
        .order_by(CheckIn.created_at.desc())
        .limit(30)
        .all()
    )
    # Count emotion frequencies
    emotion_counts = {}
    for entry in entries:
        for emotion in entry.emotions:
            emotion_counts[emotion.id] = emotion_counts.get(emotion.id, 0) + 1
    top_emotions = sorted(emotion_counts, key=emotion_counts.get, reverse=True)[:5]

    return {
        "total_checkins": len(entries),
        "top_emotions": top_emotions,
    }
```

### Testing your endpoints

FastAPI auto-generates interactive docs at `/docs`. You can test every endpoint there.

For automated testing, use `httpx`:

```python
# test_api.py
import httpx

BASE = "http://localhost:8000"

# Create / retrieve a user after Supabase sign-in
r = httpx.post(f"{BASE}/users/", json={"supabase_uid": "abc-123", "email": "test@example.com"})
user = r.json()
print(user)  # {"id": 1, "supabase_uid": "abc-123", "email": "test@example.com", ...}

# Create a check-in
r = httpx.post(f"{BASE}/checkins/", json={
    "user_id": user["id"],
    "emotion_ids": ["freude", "dankbarkeit"],
    "intensity": 4,
    "note": "Good morning!",
})
print(r.json())
```

---

## Key Concepts to Remember

| Concept | What it is | Where it appears |
|---------|-----------|-----------------|
| `Depends(get_db)` | FastAPI dependency injection — gives each request its own DB session | every endpoint |
| `db.commit()` | Saves changes to the database | after every write |
| `db.refresh(obj)` | Re-reads the saved object (to get auto-generated id, created_at) | after commit |
| `response_model=` | Pydantic schema that shapes the JSON response | endpoint decorator |
| `raise HTTPException` | Returns an HTTP error with a status code and message | validation/not-found |
| Junction table | A table that represents a many-to-many relationship | checkin_emotions, journal_emotions |
| Upsert | Create-or-return-existing — safe to call on every app open | POST /users/ |

---

## PHASE 5 — Authentication with Supabase

### Why delegate auth?

Building auth from scratch means: storing passwords (hashed), handling forgotten
passwords, implementing sessions, preventing brute-force attacks, managing tokens.
This is weeks of work and a major security surface. Instead, we hand it all to
Supabase Auth (free tier) and only store what we need in our own DB.

**What Supabase handles:**
- Magic link emails (one-click login, no password)
- Google OAuth ("Continue with Google")
- JWT creation and signing
- Session management and refresh tokens

**What we handle:**
- Verify the JWT on incoming requests
- Store `supabase_uid` + `email` in our `users` table
- Look up the user's integer `id` for all data operations

### Sign-in flow

```
User clicks "Sign in with email"
  → Frontend calls supabase.auth.signInWithOtp({ email })
  → Supabase sends magic link email
  → User clicks link → redirected back to your app
  → supabase.auth.onAuthStateChange fires with session
  → Frontend extracts: session.user.id (supabase_uid) + session.user.email
  → Frontend calls POST /users/ with those values
  → Backend upserts profile row, returns integer user.id
  → Frontend stores user.id for all subsequent API calls
```

### Setup (10 minutes)

1. Create a free project at supabase.com
2. Copy your project URL and anon key
3. In your frontend HTML/JS:

```javascript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY'
)

// Magic link sign-in
async function signIn(email) {
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) alert(error.message)
  else alert('Check your email for a magic link!')
}

// Google OAuth
async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({ provider: 'google' })
}

// After sign-in — sync profile to our backend
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    const res = await fetch('/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabase_uid: session.user.id,
        email: session.user.email,
      })
    })
    const profile = await res.json()
    localStorage.setItem('user_id', profile.id)
  }
})
```

4. Enable Google in Supabase Dashboard → Authentication → Providers

### JWT verification in FastAPI (production)

For the demo, the frontend is trusted. For production, verify the JWT so users
can't impersonate each other:

```python
# pip install python-jose httpx
import os
import httpx
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SUPABASE_URL = os.getenv("SUPABASE_URL")
bearer = HTTPBearer()

def get_supabase_jwks():
    res = httpx.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")
    return res.json()

def verify_supabase_token(
    credentials: HTTPAuthorizationCredentials = Security(bearer)
):
    token = credentials.credentials
    try:
        jwks = get_supabase_jwks()  # cache this in production
        payload = jwt.decode(token, jwks, algorithms=["RS256"])
        return payload  # contains payload["sub"] = supabase_uid
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Use in any endpoint:
@router.get("/me")
def get_me(payload = Depends(verify_supabase_token), db: Session = Depends(get_db)):
    uid = payload["sub"]
    user = db.query(User).filter(User.supabase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### What to Build Next

1. **Add Stripe payments** — webhook updates a `is_pro` flag (add column when needed)
2. **Row-level security in Supabase** — prevent users from reading each other's data
3. **Refresh token rotation** — Supabase handles this automatically on the frontend
3. **Add vector search** — replace keyword RAG with `chromadb` + `sentence-transformers`
4. **Add WebSockets** — real-time tandem partner matching
5. **Deploy** — Railway (what we use), Render, or Fly.io all work great with FastAPI + SQLite

---

*Built with Empathly — an emotion card game in 15 languages.*
*See the live app: https://mikelninh.github.io/Empathly/*
