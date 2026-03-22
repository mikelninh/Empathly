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
from models import JournalEntry
from schemas import (
    CulturalBridgeRequest,
    CulturalBridgeResponse,
    JournalAnalysisRequest,
    JournalAnalysisResponse,
)

router = APIRouter(prefix="/ai", tags=["AI"])

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "data" / "knowledge_base.md"

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


# ── OpenRouter API call ───────────────────────────────────────────────────────

async def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
    """
    LEARNING NOTE — Calling an LLM API:
    We use OpenRouter which provides a unified API for many models.
    The request follows the OpenAI Chat Completions format:
      - messages: list of {role, content} dicts
      - system message sets the AI's persona/instructions
      - user message is the actual query

    httpx is an async HTTP client (like requests but async-compatible with FastAPI).
    """
    if not settings.openrouter_api_key:
        raise HTTPException(
            status_code=503,
            detail="No OpenRouter API key configured. Set OPENROUTER_API_KEY in .env"
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://gefuehle-memory.app",
                "X-Title": "Gefühle-Memory",
            },
            json={
                "model": settings.default_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"LLM API error: {response.status_code} — {response.text}"
        )

    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


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

    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="No API key configured")

    async def generate() -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream(
                "POST",
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://gefuehle-memory.app",
                    "X-Title": "Gefuehle-Memory",
                },
                json={
                    "model": settings.default_model,
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
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == payload.user_id)
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
            "emotions": e.emotions,
            "note": e.note or "",
        }
        for e in reversed(entries)  # chronological order
    ]

    response_lang = RESPONSE_LANGUAGE_NAMES.get(payload.lang, "English.")

    system_prompt = f"""You are a compassionate emotional wellness guide.
Analyze journal entries and identify emotional patterns with warmth — not clinical detachment.
Write in {response_lang}
Respond ONLY with valid JSON:
{{
  "insight": "2-3 sentences describing the overall emotional pattern",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "suggestion": "one gentle, specific suggestion for emotional wellbeing"
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
    )


@router.get("/models")
def list_models():
    """Return the available models on OpenRouter (free + premium)."""
    return {
        "current": settings.default_model,
        "available": [
            {"value": "meta-llama/llama-3.3-70b-instruct:free",       "label": "Llama 3.3 70B",          "free": True},
            {"value": "google/gemma-3-27b-it:free",                    "label": "Gemma 3 27B",             "free": True},
            {"value": "mistralai/mistral-small-3.1-24b-instruct:free", "label": "Mistral Small 3.1 24B",   "free": True},
            {"value": "qwen/qwen3-next-80b-a3b-instruct:free",         "label": "Qwen3 80B",               "free": True},
            {"value": "anthropic/claude-sonnet-4-6", "label": "Claude Sonnet 4.6", "free": False},
            {"value": "openai/gpt-4o-mini", "label": "GPT-4o Mini", "free": False},
        ],
    }
