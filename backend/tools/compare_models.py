"""
Model Comparison Tool — Gefühle-Memory

Sends the same prompt to multiple free models and prints results side by side.
Perfect for learning: you can see how different LLMs respond to the same input.

Usage:
    cd backend
    python tools/compare_models.py

    # Or with a custom prompt:
    python tools/compare_models.py --mode cultural --emotion "Liebe" --from de --to vi

    # Tamil generation mode:
    python tools/compare_models.py --mode tamil --emotions freude,liebe,sehnsucht
"""

import asyncio
import argparse
import json
import sys
import time
from pathlib import Path

import httpx

# Add parent dir so we can import config
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import settings

FREE_MODELS = [
    {"id": "nvidia/nemotron-3-super-120b-a12b:free",  "name": "Nvidia Nemotron 120B", "no_system": False},
    {"id": "nvidia/nemotron-3-nano-30b-a3b:free",     "name": "Nvidia Nemotron 30B",  "no_system": False},
    {"id": "google/gemma-3-12b-it:free",              "name": "Gemma 3 12B",          "no_system": True},
    {"id": "arcee-ai/trinity-mini:free",              "name": "Arcee Trinity Mini",   "no_system": False},
]

# Gemma models don't support system prompts — we merge them into the user message instead.

DIVIDER = "─" * 70


async def call_model(model_id: str, system: str, user: str, max_tokens: int = 500, no_system: bool = False) -> dict:
    """
    Call one model and return result + timing.
    no_system=True: merge system + user into a single user message (required for Gemma models).
    """
    start = time.monotonic()
    if no_system:
        messages = [{"role": "user", "content": f"{system}\n\n{user}"}]
    else:
        messages = [
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ]
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://gefuehle-memory.app",
                    "X-Title": "Gefuehle-Memory Model Comparison",
                },
                json={
                    "model": model_id,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.3,  # Lower = more consistent/deterministic
                },
            )
        elapsed = time.monotonic() - start
        if resp.status_code == 200:
            data = resp.json()
            choices = data.get("choices") or []
            if not choices or not choices[0].get("message", {}).get("content"):
                return {"ok": False, "error": "Empty response (no content in choices)", "elapsed": elapsed}
            content = choices[0]["message"]["content"].strip()
            return {"ok": True, "content": content, "elapsed": elapsed}
        else:
            return {"ok": False, "error": f"HTTP {resp.status_code}: {resp.text[:200]}", "elapsed": elapsed}
    except Exception as e:
        return {"ok": False, "error": str(e), "elapsed": time.monotonic() - start}


async def compare_all(system: str, user: str, max_tokens: int = 500, models: list = None):
    """Run all models in parallel and collect results."""
    target_models = models or FREE_MODELS
    print(f"\nSending to {len(target_models)} models in parallel...\n")

    tasks = [
        call_model(m["id"], system, user, max_tokens, no_system=m.get("no_system", False))
        for m in target_models
    ]
    results = await asyncio.gather(*tasks)

    for model, result in zip(target_models, results):
        print(DIVIDER)
        status = f"({result['elapsed']:.1f}s)" if result["ok"] else f"ERROR ({result['elapsed']:.1f}s)"
        print(f"  {model['name']}  {status}")
        print(DIVIDER)
        if result["ok"]:
            print(result["content"])
        else:
            print(f"  [FAILED] {result['error']}")
        print()

    return list(zip(target_models, results))


# ── Mode: Cultural Bridge ─────────────────────────────────────────────────────

CULTURAL_SYSTEM = """You are a cultural linguist. Compare how an emotion is expressed
in two cultures. Be specific and educational. Write in German.
Reply with valid JSON only:
{
  "insight": "2-3 sentences on cultural differences",
  "vocabulary": [
    {"word": "...", "meaning": "...", "usage": "..."}
  ]
}
Include 3-5 vocabulary words from the target language."""


def make_cultural_prompt(emotion: str, from_lang: str, to_lang: str) -> str:
    lang_names = {"de": "German", "vi": "Vietnamese", "en": "English",
                  "ta": "Tamil", "ar": "Arabic", "el": "Greek"}
    src = lang_names.get(from_lang, from_lang)
    tgt = lang_names.get(to_lang, to_lang)
    return (
        f'Compare how the emotion "{emotion}" is experienced and expressed '
        f'in {src} vs {tgt} culture. Show vocabulary nuances.'
    )


# ── Mode: Tamil Translation ───────────────────────────────────────────────────

TAMIL_SYSTEM = """You are a Tamil language expert. Translate emotion words and discussion prompts into Tamil.
Be accurate — use standard Tamil (not Romanized).

Reply with valid JSON only:
{
  "ta": "Tamil word for the emotion",
  "prompt_ta": "Tamil translation of the discussion prompt"
}

Rules:
- Use Tamil script (தமிழ்), not Roman transliteration
- For the emotion word: pick the most natural, commonly used Tamil word
- For the prompt: natural conversational Tamil, not overly formal"""


def make_tamil_prompt(emotion_de: str, emotion_en: str, prompt_de: str, prompt_en: str) -> str:
    return f"""Emotion:
  German: {emotion_de}
  English: {emotion_en}

Discussion prompt:
  German: {prompt_de}
  English: {prompt_en}

Translate the emotion word and prompt into Tamil."""


# ── CLI ───────────────────────────────────────────────────────────────────────

SAMPLE_EMOTIONS = [
    {"id": "freude",      "de": "Freude",      "en": "Joy",
     "prompt_de": "Wann hast du dich zuletzt richtig gefreut?",
     "prompt_en": "When did you last feel real joy?"},
    {"id": "liebe",       "de": "Liebe",       "en": "Love",
     "prompt_de": "Was bedeutet Liebe für dich?",
     "prompt_en": "What does love mean to you?"},
    {"id": "sehnsucht",   "de": "Sehnsucht",   "en": "Longing",
     "prompt_de": "Nach wem oder was sehnst du dich?",
     "prompt_en": "Who or what do you long for?"},
    {"id": "traurigkeit", "de": "Traurigkeit", "en": "Sadness",
     "prompt_de": "Was macht dich traurig?",
     "prompt_en": "What makes you sad?"},
    {"id": "wut",         "de": "Wut",         "en": "Anger",
     "prompt_de": "Was bringt dich auf?",
     "prompt_en": "What makes you angry?"},
]


async def run_cultural(args):
    emotion = args.emotion or "Liebe"
    from_lang = getattr(args, "from") or "de"
    to_lang = args.to or "vi"
    user = make_cultural_prompt(emotion, from_lang, to_lang)
    print(f"\nCULTURAL BRIDGE: '{emotion}'  {from_lang} → {to_lang}")
    await compare_all(CULTURAL_SYSTEM, user, max_tokens=600)


async def run_tamil(args):
    emotion_ids = (args.emotions or "freude,liebe,sehnsucht").split(",")
    emotions = [e for e in SAMPLE_EMOTIONS if e["id"] in emotion_ids]
    if not emotions:
        emotions = SAMPLE_EMOTIONS[:3]

    for emotion in emotions:
        user = make_tamil_prompt(
            emotion["de"], emotion["en"],
            emotion["prompt_de"], emotion["prompt_en"]
        )
        print(f"\n{'=' * 70}")
        print(f"  EMOTION: {emotion['de']} / {emotion['en']}")
        print(f"{'=' * 70}")
        results = await compare_all(TAMIL_SYSTEM, user, max_tokens=200)

        # Show parsed JSON summary
        print(f"\n  SUMMARY — which model gave the best result?")
        for model, result in results:
            if result["ok"]:
                try:
                    parsed = json.loads(result["content"])
                    print(f"  {model['name']:20s}  ta={parsed.get('ta','?')}")
                except Exception:
                    print(f"  {model['name']:20s}  [JSON parse failed]")


async def run_custom(args):
    """Interactive: paste your own prompt."""
    print("Enter system prompt (end with a line containing only '---'):")
    system_lines = []
    while True:
        line = input()
        if line == "---":
            break
        system_lines.append(line)

    print("\nEnter user prompt (end with '---'):")
    user_lines = []
    while True:
        line = input()
        if line == "---":
            break
        user_lines.append(line)

    await compare_all("\n".join(system_lines), "\n".join(user_lines))


def main():
    parser = argparse.ArgumentParser(description="Compare free LLM models")
    parser.add_argument("--mode", choices=["cultural", "tamil", "custom"],
                        default="cultural", help="What to test")
    parser.add_argument("--emotion", help="Emotion name (cultural mode)")
    parser.add_argument("--from",    help="Source language code, e.g. de")
    parser.add_argument("--to",      help="Target language code, e.g. vi")
    parser.add_argument("--emotions", help="Comma-separated emotion IDs (tamil mode)")
    args = parser.parse_args()

    if not settings.openrouter_api_key:
        print("ERROR: OPENROUTER_API_KEY not set in backend/.env")
        sys.exit(1)

    if args.mode == "cultural":
        asyncio.run(run_cultural(args))
    elif args.mode == "tamil":
        asyncio.run(run_tamil(args))
    elif args.mode == "custom":
        asyncio.run(run_custom(args))


if __name__ == "__main__":
    main()
