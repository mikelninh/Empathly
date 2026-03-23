"""
AI endpoints: Cultural Bridge + Journal Analysis.

LEARNING NOTE — What is RAG?
RAG = Retrieval-Augmented Generation.
Instead of relying only on what the LLM "knows" from training, we:
  1. RETRIEVE relevant text chunks from our own knowledge base
  2. AUGMENT the prompt with those chunks
  3. GENERATE a response that's grounded in our data

Simple RAG (what we do here):
  - Split knowledge_base.md into chunks (by ## header)
  - Match chunks by keyword overlap with the user's query
  - Inject matching chunks into the system prompt

Production RAG (next step to learn):
  - Embed chunks as vectors (e.g. with sentence-transformers)
  - Store in a vector DB (e.g. ChromaDB, Qdrant)
  - Find chunks by semantic similarity, not just keywords
  - Much better for nuanced queries

Endpoints:
  POST /ai/cultural-bridge         - explains an emotion across two cultures (JSON)
  POST /ai/cultural-bridge/stream  - streaming SSE version (word by word)
  POST /ai/journal-analysis        - finds patterns in recent journal entries
  GET  /ai/models                  - list available models
"""

import json
import re
from pathlib import Path
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import JournalEntry, User
from schemas import (
    AskRequest,
    AskResponse,
    CulturalBridgeRequest,
    CulturalBridgeResponse,
    DynamicPromptRequest,
    DynamicPromptResponse,
    GenerateAIOutputRequest,
    GenerateAIOutputResponse,
    JournalAnalysisRequest,
    JournalAnalysisResponse,
    OPENAI_MODELS,
)

router = APIRouter(prefix="/ai", tags=["AI"])

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "data" / "knowledge_base.md"

# Fallback models tried in order if the primary is unavailable
FREE_MODEL_FALLBACKS = [
    "meta-llama/llama-3.3-70b-instruct",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
]

LANGUAGE_NAMES = {
    "de": "German",
    "vi": "Vietnamese",
    "en": "English",
    "tr": "Turkish",
    "ar": "Arabic",
    "es": "Spanish",
    "fr": "French",
    "uk": "Ukrainian",
    "pl": "Polish",
    "el": "Greek",
    "ta": "Tamil",
}

RESPONSE_LANGUAGE_NAMES = {
    "de": "German. Use clear, warm language.",
    "vi": "Vietnamese. Use natural, conversational Vietnamese.",
    "en": "English. Use clear, accessible language.",
    "tr": "Turkish.",
    "ar": "Arabic.",
    "es": "Spanish.",
    "fr": "French.",
    "uk": "Ukrainian.",
    "pl": "Polish.",
    "el": "Greek.",
    "ta": "Tamil.",
}


# ── RAG: Load & chunk knowledge base ─────────────────────────────────────────

def load_knowledge_chunks() -> list[dict]:
    """
    LEARNING NOTE — Naive Chunking:
    We split the markdown file by ## headers. Each chunk gets:
      - title: the header text
      - keywords: words extracted from the title (for matching)
      - content: the full text of the chunk

    A better approach would be to embed each chunk as a vector and
    do cosine-similarity search. But keyword matching works well for
    our structured knowledge base.
    """
    if not KNOWLEDGE_BASE_PATH.exists():
        return []

    text = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
    raw_chunks = re.split(r"\n## CHUNK:", text)

    chunks = []
    for raw in raw_chunks[1:]:  # skip preamble before first chunk
        lines = raw.strip().split("\n")
        keyword_line = lines[0].strip()  # e.g. "love | liebe | tinh yeu | tamil"
        content = "\n".join(lines[1:]).strip()
        keywords = [kw.strip().lower() for kw in keyword_line.split("|")]
        chunks.append({
            "keywords": keywords,
            "content": content,
        })

    return chunks


def retrieve_chunks(query_terms: list[str], chunks: list[dict], top_k: int = 2) -> list[str]:
    """
    LEARNING NOTE — Keyword Retrieval:
    Score each chunk by how many query terms appear in its keywords.
    Return the top_k scoring chunks' content.

    Upgrade path: replace this with embedding similarity search.
    """
    query_lower = [t.lower() for t in query_terms]
    scored = []
    for chunk in chunks:
        score = sum(
            1 for q in query_lower
            if any(q in kw for kw in chunk["keywords"])
        )
        if score > 0:
            scored.append((score, chunk["content"]))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [content for _, content in scored[:top_k]]


# ── Provider helpers ──────────────────────────────────────────────────────────

def _openai_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

def _openrouter_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gefuehle-memory.app",
        "X-Title": "Gefuehle-Memory",
    }

def _stream_config() -> tuple[str, dict, str]:
    """Returns (url, headers, model) — prefers OpenAI, falls back to OpenRouter."""
    if settings.openai_api_key:
        return (
            "https://api.openai.com/v1/chat/completions",
            _openai_headers(),
            settings.openai_default_model,
        )
    return (
        "https://openrouter.ai/api/v1/chat/completions",
        _openrouter_headers(),
        settings.default_model,
    )


async def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
    """
    Call the preferred LLM provider.
    Priority: OpenAI (if OPENAI_API_KEY set) → OpenRouter with fallback models.
    """
    if settings.openai_api_key:
        return await call_openai(system_prompt, user_prompt,
                                 model=settings.openai_default_model,
                                 max_tokens=max_tokens)

    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="No AI API key configured.")

    models = [settings.default_model] + [m for m in FREE_MODEL_FALLBACKS if m != settings.default_model]
    last_error = "No models available"

    for model in models:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=_openrouter_headers(),
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "max_tokens": max_tokens,
                        "temperature": 0.7,
                    },
                )
        except Exception as e:
            last_error = f"Connection error: {type(e).__name__}: {e}"
            continue

        if response.status_code == 429:
            last_error = f"Rate limited on {model}"
            continue
        if response.status_code != 200:
            last_error = f"LLM API error {response.status_code} on {model}"
            continue

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError):
            last_error = f"Unexpected response from {model}: {data}"
            continue

    raise HTTPException(status_code=502, detail=f"All models failed: {last_error}")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/cultural-bridge", response_model=CulturalBridgeResponse)
async def cultural_bridge(payload: CulturalBridgeRequest):
    """
    Generate a cultural comparison for an emotion between two languages.

    LEARNING NOTE — RAG flow:
    1. Build query terms from emotion name + language codes
    2. Retrieve relevant chunks from knowledge_base.md
    3. Inject chunks into system prompt
    4. Ask LLM to generate structured insight + vocabulary list
    5. Parse JSON response
    """
    chunks = load_knowledge_chunks()

    query_terms = [
        payload.emotion_id,
        payload.emotion_name,
        payload.source_lang,
        payload.target_lang,
        LANGUAGE_NAMES.get(payload.source_lang, ""),
        LANGUAGE_NAMES.get(payload.target_lang, ""),
    ]
    retrieved = retrieve_chunks(query_terms, chunks, top_k=2)

    source_lang_name = LANGUAGE_NAMES.get(payload.source_lang, payload.source_lang)
    target_lang_name = LANGUAGE_NAMES.get(payload.target_lang, payload.target_lang)
    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.response_lang, "English.")

    rag_context = "\n\n".join(retrieved) if retrieved else ""
    context_block = f"""
KNOWLEDGE BASE (use this as your primary source):
---
{rag_context}
---
""" if rag_context else ""

    system_prompt = f"""You are a cultural linguist and emotional intelligence expert.
Your role is to help people understand how emotions are expressed differently across cultures and languages.
Be warm, specific, and educational. Show how linguistic differences reveal cultural values.
Write your response in {response_lang}
{context_block}
Respond ONLY with valid JSON matching this structure exactly:
{{
  "insight": "2-3 sentences explaining the cultural difference for this emotion",
  "vocabulary": [
    {{"word": "word in target language", "meaning": "what it means", "usage": "when/how it's used"}}
  ]
}}
Include 3-6 vocabulary items. For vocabulary, focus on the target language ({target_lang_name}).
If the knowledge base contains relevant information, use it and expand on it.
"""

    user_prompt = f"""Compare how the emotion "{payload.emotion_name}" ({payload.emotion_id})
is understood and expressed in {source_lang_name} vs {target_lang_name} culture.
Show the vocabulary nuances that reveal these cultural differences."""

    raw = await call_llm(system_prompt, user_prompt, max_tokens=700)

    # Parse JSON from response (LLMs sometimes wrap JSON in markdown code blocks)
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise HTTPException(status_code=502, detail=f"LLM returned non-JSON: {raw}")

    try:
        parsed = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"JSON parse error: {e} — raw: {raw}")

    return CulturalBridgeResponse(
        emotion_id=payload.emotion_id,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang,
        insight=parsed.get("insight", ""),
        vocabulary=parsed.get("vocabulary", []),
    )


@router.post("/cultural-bridge/stream")
async def cultural_bridge_stream(payload: CulturalBridgeRequest):
    """
    Streaming version of cultural bridge — returns SSE (Server-Sent Events).
    The frontend receives the AI response word-by-word as it's generated.

    LEARNING NOTE — Streaming with FastAPI:
    - StreamingResponse wraps an async generator
    - Each yielded string is sent immediately to the client
    - SSE format: "data: <chunk>\\n\\n"
    - Frontend reads via ReadableStream / fetch body reader
    """
    chunks = load_knowledge_chunks()
    query_terms = [
        payload.emotion_id, payload.emotion_name,
        payload.source_lang, payload.target_lang,
        LANGUAGE_NAMES.get(payload.source_lang, ""),
        LANGUAGE_NAMES.get(payload.target_lang, ""),
    ]
    retrieved = retrieve_chunks(query_terms, chunks, top_k=2)

    source_lang_name = LANGUAGE_NAMES.get(payload.source_lang, payload.source_lang)
    target_lang_name = LANGUAGE_NAMES.get(payload.target_lang, payload.target_lang)
    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.response_lang, "English.")
    rag_context = "\n\n".join(retrieved) if retrieved else ""
    context_block = f"\nKNOWLEDGE BASE:\n---\n{rag_context}\n---\n" if rag_context else ""

    system_prompt = f"""You are a cultural linguist and emotional intelligence expert.
Compare how an emotion is experienced and expressed in two cultures.
Be warm, specific, and educational. Write in {response_lang}
{context_block}
Write 3-4 sentences of insight, then list 3-5 vocabulary words from the target language with their meanings."""

    user_prompt = f"""Compare how "{payload.emotion_name}" is expressed in {source_lang_name} vs {target_lang_name} culture.
Focus on vocabulary nuances that reveal cultural differences."""

    if not settings.openai_api_key and not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="No AI API key configured")

    stream_url, stream_headers, stream_model = _stream_config()

    async def generate() -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream(
                "POST", stream_url, headers=stream_headers,
                json={
                    "model": stream_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7,
                    "stream": True,
                },
            ) as resp:
                if resp.status_code != 200:
                    yield "data: [ERROR]\n\n"
                    return
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line[6:]
                    if raw == "[DONE]":
                        yield "data: [DONE]\n\n"
                        return
                    try:
                        token = json.loads(raw)["choices"][0]["delta"].get("content", "")
                        if token:
                            yield f"data: {token}\n\n"
                    except Exception:
                        continue

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.post("/journal-analysis", response_model=JournalAnalysisResponse)
async def journal_analysis(payload: JournalAnalysisRequest, db: Session = Depends(get_db)):
    """
    Analyze the last 7 journal entries for a user and return patterns + suggestions.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(7)
        .all()
    )

    if len(entries) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 journal entries needed for analysis."
        )

    entries_data = [
        {
            "date": e.created_at.strftime("%Y-%m-%d"),
            "emotions": [em.id for em in e.emotions],
            "note": e.note or "",
        }
        for e in reversed(entries)
    ]

    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")

    system_prompt = f"""You are a compassionate emotional wellness guide.
Analyze journal entries and identify emotional patterns with warmth — not clinical detachment.
Write in {response_lang}
Respond ONLY with valid JSON:
{{
  "insight": "2-3 sentences describing the overall emotional pattern",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "suggestion": "one gentle, specific suggestion for emotional wellbeing",
  "follow_up_question": "one specific, personal question that invites deeper reflection based on a pattern you noticed"
}}
"""

    user_prompt = f"Analyze these emotion journal entries:\n{json.dumps(entries_data, ensure_ascii=False, indent=2)}"

    raw = await call_llm(system_prompt, user_prompt, max_tokens=500)

    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise HTTPException(status_code=502, detail=f"LLM returned non-JSON: {raw}")

    try:
        parsed = json.loads(json_match.group())
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"JSON parse error: {e}")

    return JournalAnalysisResponse(
        insight=parsed.get("insight", ""),
        patterns=parsed.get("patterns", []),
        suggestion=parsed.get("suggestion", ""),
        follow_up_question=parsed.get("follow_up_question", ""),
    )


@router.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest):
    """
    RAG-powered Q&A — answers any question about emotions, languages, or cultures.

    LEARNING NOTE — this is the same RAG pattern as cultural-bridge, but more open-ended:
    - The user asks in natural language
    - We extract keywords and retrieve matching knowledge chunks
    - The LLM answers grounded in our knowledge base
    """
    chunks = load_knowledge_chunks()
    # Simple keyword extraction: split on spaces, filter short words
    query_terms = [w for w in payload.question.lower().split() if len(w) > 3]
    retrieved = retrieve_chunks(query_terms, chunks, top_k=3)

    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")
    rag_context = "\n\n".join(retrieved) if retrieved else ""
    context_block = f"\nKNOWLEDGE BASE:\n---\n{rag_context}\n---\n" if rag_context else ""

    system_prompt = f"""You are an emotional intelligence guide for "Gefühle-Memory" — a multilingual emotion card game.
You help people understand emotions, their linguistic nuances, and cultural differences.
Be warm, specific, and educational. Keep answers concise (3-5 sentences max).
Write in {response_lang}
{context_block}
If the question is about a specific language's word or concept, explain it richly.
If you don't know, say so honestly — don't invent facts."""

    answer = await call_llm(system_prompt, payload.question, max_tokens=400)
    return AskResponse(answer=answer)


@router.post("/ask/stream")
async def ask_stream(payload: AskRequest):
    """
    Streaming version of /ai/ask — returns SSE token by token.
    """
    chunks = load_knowledge_chunks()
    query_terms = [w for w in payload.question.lower().split() if len(w) > 3]
    retrieved = retrieve_chunks(query_terms, chunks, top_k=3)

    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")
    rag_context = "\n\n".join(retrieved) if retrieved else ""
    context_block = f"\nKNOWLEDGE BASE:\n---\n{rag_context}\n---\n" if rag_context else ""

    system_prompt = f"""You are an emotional intelligence guide for "Gefühle-Memory" — a multilingual emotion card game.
Answer questions about emotions, languages, and cultural differences warmly and concisely (3-5 sentences).
Write in {response_lang}
{context_block}"""

    if not settings.openai_api_key and not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="No AI API key configured")

    stream_url, stream_headers, stream_model = _stream_config()

    async def generate() -> AsyncGenerator[str, None]:
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                async with client.stream(
                    "POST", stream_url, headers=stream_headers,
                    json={
                        "model": stream_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": payload.question},
                        ],
                        "max_tokens": 400,
                        "temperature": 0.7,
                        "stream": True,
                    },
                ) as resp:
                    if resp.status_code != 200:
                        yield "data: [ERROR]\n\n"
                        return
                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        raw = line[6:]
                        if raw == "[DONE]":
                            yield "data: [DONE]\n\n"
                            return
                        try:
                            token = json.loads(raw)["choices"][0]["delta"].get("content", "")
                            if token:
                                yield f"data: {token}\n\n"
                        except Exception:
                            continue
        except Exception:
            yield "data: [ERROR]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ── Dynamic Prompt Configs ─────────────────────────────────────────────────────

_DYNAMIC_CONFIGS = {
    "talk_followup": (
        """You are a skilled facilitator for emotional conversation circles.
Generate exactly ONE open-ended discussion question about the emotion "{emotion}".
Context: {context}
The question should invite personal reflection, not yes/no answers.
Write in {lang}. Output ONLY the question, no preamble.""",
        'What is one moment this week when you felt "{emotion}"? What was happening around you?'
    ),
    "checkin_reflection": (
        """You are a compassionate emotional coach.
The person has identified these needs today: {needs}
You MUST weave ALL of these needs into your response — do not focus on just one.
Write a warm, personal reflection of 2-3 sentences that:
1. Acknowledges the full picture of what they're carrying — name each need
2. Notes any interesting tension or harmony between the needs
3. Offers one small, concrete suggestion that honours the combination
Write in {lang}. Be warm and specific, not clinical.""",
        "You're carrying several needs today. That awareness itself is meaningful — noticing what we need is the first step toward meeting it."
    ),
    "story_starter": (
        """You are a creative writing facilitator.
Write ONLY the opening 1-2 sentences of a story that weaves together these emotions: {emotions}
The opening should set a scene and emotionally draw the reader in.
Write in {lang}. Output ONLY the story opening, nothing else.""",
        "She didn't know why, standing at the kitchen window, she felt all three at once — but she did."
    ),
    "story_feedback": (
        """You are a compassionate creative writing coach.
The person wrote a short story using these emotion cards: {emotions}
Respond with 2-3 warm sentences that:
- Name which emotions you felt in the story
- Point to one moment of emotional truth
- Close with one gentle question that invites them deeper
Write in {lang}.""",
        "There's real emotional honesty in what you wrote. What surprised you most while writing?"
    ),
    "journal_question": (
        """You are a compassionate emotional intelligence guide.
The person's recent journal emotions include: {emotions}
Generate ONE specific, personal follow-up question that:
- References a pattern you notice in these emotions
- Invites reflection without judgment
- Could unlock deeper self-understanding
Write in {lang}. Output ONLY the question.""",
        "What has been the common thread in the moments when you felt this way?"
    ),
}


@router.post("/dynamic-prompt", response_model=DynamicPromptResponse)
async def dynamic_prompt(payload: DynamicPromptRequest):
    """
    Generates contextual AI text for multiple moments in the app:
    talk_followup, checkin_reflection, story_starter, story_feedback, journal_question.

    LEARNING NOTE — one endpoint, multiple behaviors via a 'type' field.
    This avoids endpoint explosion while keeping prompts specialized.
    Each type has its own system prompt template and fallback text.
    """
    if payload.type not in _DYNAMIC_CONFIGS:
        raise HTTPException(status_code=400, detail=f"Unknown type: {payload.type}. Use: {list(_DYNAMIC_CONFIGS)}")

    system_template, fallback = _DYNAMIC_CONFIGS[payload.type]
    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")

    # Format template vars
    system_prompt = system_template.format(
        emotion=", ".join(payload.emotion_names) if payload.emotion_names else "this emotion",
        emotions=", ".join(payload.emotion_names) if payload.emotion_names else "these emotions",
        needs=", ".join(payload.needs) if payload.needs else "various needs",
        context=payload.context or "general conversation",
        lang=response_lang,
    )

    # Build user message
    if payload.type == "story_feedback" and payload.user_text:
        user_msg = f"Story: {payload.user_text}"
    elif payload.type == "journal_question" and payload.emotion_names:
        user_msg = f"Recent emotions: {', '.join(payload.emotion_names)}"
    elif payload.type == "checkin_reflection" and payload.needs:
        user_msg = f"My needs today: {', '.join(payload.needs)}"
    else:
        user_msg = f"Emotions: {', '.join(payload.emotion_names)}" if payload.emotion_names else "Please generate."

    if not settings.openrouter_api_key:
        return DynamicPromptResponse(text=fallback)

    try:
        text = await call_llm(system_prompt, user_msg, max_tokens=300)
        return DynamicPromptResponse(text=text)
    except Exception:
        return DynamicPromptResponse(text=fallback)


@router.get("/models")
def list_models():
    """Return the available models on OpenRouter (free + premium)."""
    return {
        "current": settings.default_model,
        "available": [
            {"value": "meta-llama/llama-3.3-70b-instruct:free",       "label": "Llama 3.3 70B",          "free": True},
            {"value": "google/gemma-3-27b-it:free",                    "label": "Gemma 3 27B",             "free": True},
            {"value": "mistralai/mistral-small-3.1-24b-instruct:free", "label": "Mistral Small 3.1 24B",   "free": True},
            {"value": "anthropic/claude-sonnet-4-6", "label": "Claude Sonnet 4.6", "free": False},
            {"value": "openai/gpt-4o-mini", "label": "GPT-4o Mini", "free": False},
        ],
    }


# ── OpenAI helper ──────────────────────────────────────────────────────────────

async def call_openai(system_prompt: str, user_prompt: str,
                      model: str = "gpt-4o-mini", max_tokens: int = 500) -> str:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="No OpenAI API key configured. Set OPENAI_API_KEY.")
    if model not in OPENAI_MODELS:
        model = settings.openai_default_model

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OpenAI error {response.status_code}: {response.text}")

    return response.json()["choices"][0]["message"]["content"].strip()


# ── OpenAI-powered output endpoints ───────────────────────────────────────────

@router.post("/generate_ai_output_checkin", response_model=GenerateAIOutputResponse)
async def generate_ai_output_checkin(payload: GenerateAIOutputRequest, db: Session = Depends(get_db)):
    """
    Generate an AI reflection on a user's recent check-ins using OpenAI.
    Fetches the last 10 check-ins for user_id and produces a personalised insight.
    """
    from models import CheckIn
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == payload.user_id)
        .order_by(CheckIn.created_at.desc())
        .limit(10)
        .all()
    )
    if not entries:
        raise HTTPException(status_code=400, detail="No check-ins found for this user")

    entries_data = [
        {
            "date": e.created_at.strftime("%Y-%m-%d"),
            "emotions": [em.id for em in e.emotions],
            "intensity": e.intensity,
            "note": e.note or "",
        }
        for e in reversed(entries)
    ]

    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")
    system_prompt = f"""You are a compassionate emotional wellness coach.
Analyse these emotional check-ins and identify patterns with warmth.
Write in {response_lang}
Respond with 3-4 sentences covering:
1. The dominant emotional pattern you notice
2. Any shifts or tensions across the entries
3. One gentle, actionable suggestion for emotional wellbeing"""

    user_prompt = f"Analyse these check-ins:\n{json.dumps(entries_data, ensure_ascii=False, indent=2)}"

    text = await call_openai(system_prompt, user_prompt, model=payload.model)
    return GenerateAIOutputResponse(text=text, model=payload.model)


@router.post("/generate_ai_output_journal", response_model=GenerateAIOutputResponse)
async def generate_ai_output_journal(payload: GenerateAIOutputRequest, db: Session = Depends(get_db)):
    """
    Generate an AI insight on a user's recent journal entries using OpenAI.
    Fetches the last 7 journal entries for user_id and produces a pattern analysis.
    """
    from models import JournalEntry
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == payload.user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(7)
        .all()
    )
    if len(entries) < 2:
        raise HTTPException(status_code=400, detail="At least 2 journal entries needed")

    entries_data = [
        {
            "date": e.created_at.strftime("%Y-%m-%d"),
            "emotions": [em.id for em in e.emotions],
            "note": e.note or "",
        }
        for e in reversed(entries)
    ]

    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")
    system_prompt = f"""You are a compassionate emotional intelligence guide.
Analyse journal entries and identify patterns warmly — not clinically.
Write in {response_lang}
Respond ONLY with valid JSON:
{{
  "insight": "2-3 sentences describing the overall emotional pattern",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "suggestion": "one gentle, specific suggestion for emotional wellbeing",
  "follow_up_question": "one personal question that invites deeper reflection"
}}"""

    user_prompt = f"Analyse these journal entries:\n{json.dumps(entries_data, ensure_ascii=False, indent=2)}"

    raw = await call_openai(system_prompt, user_prompt, model=payload.model, max_tokens=600)

    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group())
            text = parsed.get("insight", raw)
        except json.JSONDecodeError:
            text = raw
    else:
        text = raw

    return GenerateAIOutputResponse(text=text, model=payload.model)
