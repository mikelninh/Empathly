# Empathly — Presentation Guide

Demo, slide content, and talking points for presenting to students and tutors.

---

## The hook (open with this)

Ask the room:

> "Quick question — what do you call the feeling of missing a home that no longer exists, or maybe never existed at all?"

Wait. Let them guess. Then:

> "Germans call it *Heimweh*. Russians have *toska* — a longing with no object. Portuguese speakers have *saudade*. The Japanese have *mono no aware* — the bittersweet awareness that everything passes."
>
> "English has... 'sad'."

Then open the app. Show the emotion wheel. Point to Sehnsucht, Wehmut, Leere.

> "Language shapes what you can feel — or at least, what you can name. This project is about giving people more words, in more languages, for the full range of human experience."

---

## Slide structure

### Slide 1 — Title

**Empathly**
*Feel deeply. Live openly.*

67 emotions · 15 languages · 9 game modes · 5 AI guides

Live: mikelninh.github.io/Empathly

---

### Slide 2 — The problem

**Talking about feelings is hard.**

- Most people have fewer than 10 words for emotions (happy, sad, angry, scared, tired)
- Families with different mother tongues have no shared emotional vocabulary
- Therapy, schools, and couples counseling all depend on emotional literacy — which nobody teaches
- Translation apps handle words. None handle *felt meaning*.

---

### Slide 3 — What Empathly is

A multilingual emotional vocabulary game. Not a self-help app. A game — with real game design.

**For a grandmother and grandchild who don't share a language.**
**For a couple who want to talk more honestly.**
**For a classroom exploring mental health.**
**For anyone who wants more words for what they feel.**

---

### Slide 4 — The 9 modes (show the landing page)

| Mode | What it does |
|------|-------------|
| Classic Memory | Match emotion pairs across languages. 5 difficulty levels. |
| Emotion Wheel | 67 emotions on an SVG wheel. Tap to explore. |
| Word of the Day | Deep psychological, cultural, and etymological insights. |
| Conversation Round | Draw a card, answer the reflection question. For groups. |
| Flashcards | Spaced repetition. 5 quiz types. Streak counter. |
| Emotion Journal | Write entries. AI finds patterns after 3+ entries. |
| Emotion Detective | Read a scenario. Find the hidden emotion. 30 cases, 3 difficulty levels. |
| Needs Map | Feel something? Find what need is underneath. Get 3 micro-actions. |
| Needs Check-In | Daily: what do you need right now? 40 needs, 5 dimensions. |

---

### Slide 5 — The AI engineering

**Where AI actually adds value (not just a chatbot bolted on)**

**1. Cultural Bridge (RAG)**
Not generic "tell me about emotions." A knowledge base of culturally-specific emotional vocabulary — toska, han, ya'aburnee, Weltschmerz — retrieved by context. AI explains *why* Sehnsucht feels different from "longing" to a German speaker.

**2. 5 distinct AI personas**
Each guide has a system prompt shaped by their cultural background and specialty:
- Hana (Kyoto) — mindfulness, mono no aware
- Nadia (Moscow/Berlin) — toska, dusha, Weltschmerz
- Karim (Marrakech) — Sufi poetry, tarab
- Lena (Frankfurt) — etymology, untranslatability
- Soo (Seoul) — nunchi, han, jeong

**3. Persona memory**
The AI remembers which emotions you've resonated with. Your guide references your history in future conversations.

**4. Streaming responses (SSE)**
Server-sent events from FastAPI → real-time word-by-word output. Not a spinner.

**5. Journal analysis**
After 3+ entries, the AI identifies patterns in your emotional language — which emotions repeat, what's shifting.

**6. Language-aware responses**
All AI outputs adapt to the user's first chosen language. System prompts enforce this explicitly.

---

### Slide 6 — The technical architecture

```
Frontend          Pure HTML + CSS + JS. Zero framework. Zero npm. Zero build step.
                  (~8000 lines total. One file open and it runs.)

Backend           FastAPI + SQLite + Python
                  REST API, SSE streaming, SQLite migrations on startup

AI                OpenAI GPT-4o Mini (via backend, free for users)
                  Fallback: OpenRouter (Gemma 3 27B, Mistral Small — free tier)

Data              67 emotions × 15 languages = 1005 emotion-language pairs
                  40 needs × 5 dimensions × 15 languages
                  268 real emotion→need connections (not random)
                  30 detective scenarios with psychological explanations

PWA               Installable. Works offline. Service worker with cache-first strategy.
```

**The deliberate constraint:** No React, no Vue, no TypeScript, no bundler. This forces you to deeply understand the DOM, event delegation, module patterns, and state management — skills that frameworks abstract away.

---

### Slide 7 — What makes this different from other emotion apps

| Other apps | Empathly |
|-----------|---------|
| Translate a word | Explain the cultural felt-meaning |
| One language | 15 languages natively |
| Chatbot UI | Game mechanics (memory, detective, flashcards) |
| English-first | Designed for non-English speakers |
| Requires account | Works fully offline, no backend needed |
| AI as a feature | AI as a teacher with a personality |
| Generic advice | 40 mapped needs + 3 concrete micro-actions |

---

### Slide 8 — Open source

**Everything is open. Fork it, extend it, translate it.**

```
github.com/mikelninh/Empathly
```

**Easy contributions:**
- Add 5 emotions in your language → already valuable
- Write a Detective scenario in your culture
- Add a cultural insight about an emotion in your language

**The data architecture is contribution-friendly:**
Adding a language = adding one key to each emotion object in `data.js`. No code needed.

The knowledge base (`backend/data/knowledge_base.md`) is a plain markdown file — anyone can add cultural knowledge without writing code.

---

### Slide 9 — What we learned

**About AI:**
- The hardest part isn't the AI call — it's the prompt engineering that makes output *consistent*
- Language enforcement in LLMs requires redundancy: system prompt + user message both specify language
- RAG makes AI feel like an expert rather than a generator. The knowledge base is the product.
- Streaming changes the user experience completely — even 2 seconds of "thinking" feels slow

**About product:**
- A feature only lands when it changes user behavior. The Needs Map failed until micro-actions were added.
- Game mechanics (streak, rank, daily challenge) make repetitive content feel fresh
- "Works offline" is not a technical feature — it's a trust feature

**About engineering:**
- Zero-dependency doesn't mean zero complexity — it means *intentional* complexity
- A 67-emotion database with 15 languages is a design problem before it's an engineering problem
- Good CSS architecture (variables, responsive grid, dark mode) is worth more than any library

---

## Live demo script (15 minutes)

### Part 1: The hook (2 min)
- Ask the untranslatable word question (see above)
- Open the app on phone/projected browser
- Show the landing page — explain the 5 primary modes visible, 7 more hidden

### Part 2: Emotion Detective (5 min)
This is the most engaging live demo. Pick a hard scenario.

> "I'm going to read you a situation. Your job: what emotion is *really* hiding here?"

Read the situation aloud. Let the audience guess before you tap. Reveal the correct answer. Read the persona note. Watch the reaction — people always recognize themselves.

Best scenarios for a demo audience:
- `sc_nothing_wrong` — person who has everything but feels nothing
- `sc_social_likes` — checking Instagram compulsively
- `sc_compliment` — deflecting praise with "it was nothing"
- `sc_helping` — always helping others, never asking for help

### Part 3: AI Cultural Bridge (4 min)
- Navigate to any emotion card, tap "Cultural Bridge" / "Kulturellen Einblick"
- Let it stream live
- Point out: "It's responding in the user's first chosen language — not just translating, but explaining the *cultural context* of how this emotion is felt"
- Show with a culturally rich word: Sehnsucht, Einsamkeit, or Dankbarkeit

### Part 4: Needs Map (2 min)
- Show the 3-step flow live: emotion → needs → micro-actions
- Pick something relatable: "Überforderung" (overwhelm) or "Einsamkeit" (loneliness)
- Land on the action step: "Three things you can do *right now*"
- "This is what I mean by AI that's useful, not just impressive"

### Part 5: The code (2 min)
- Open `js/data.js` — show the EMOTIONS array with 15 language keys
- Open `backend/data/knowledge_base.md` — show the RAG source
- Open `js/personas.js` — show one persona's system prompt
- "The entire frontend is one HTML file, one CSS file, a few JS files. No npm install. Open it, it works."

---

## Key one-liners for Q&A

**"Why no React?"**
> "React solves the problem of managing complex UI state at scale — we don't have that problem. And the constraint forced us to deeply understand what frameworks actually do."

**"How do you make the AI respond in the right language?"**
> "Double enforcement: the system prompt explicitly forbids any other language, and the user message also specifies it. LLMs need redundancy — a single instruction isn't reliable enough."

**"What's RAG?"**
> "Retrieval-Augmented Generation. Instead of asking the AI to know things from training, we store a knowledge base — in this case, descriptions of culturally-specific emotions — and retrieve the relevant piece before the AI prompt. The AI reasons over curated facts, not trained guesses."

**"Who is this for?"**
> "Families across language barriers. Couples who want to talk more honestly. Teachers. Therapists. Anyone who's ever felt something they didn't have words for."

**"How can I contribute?"**
> "Add your language. Write a detective scenario. Translate 5 emotions. It takes 30 minutes and the app gets meaningfully better."

---

## Closing line

> "We built a game. But underneath it is a serious claim: that emotional vocabulary is a human right. That not having words for what you feel is a kind of poverty. And that AI — when it's used well — can help give those words back."
