# Gefühle-Memory

**A card game about emotions — in 15 languages.**

Find pairs. Talk about them. Learn emotional vocabulary across languages and cultures.

Play live: [mikelninh.github.io/Gefuehle-Memory](https://mikelninh.github.io/Gefuehle-Memory/)

---

## What is this?

Talking about feelings is hard — in any language. This game makes it easier through play, not instruction. Designed for families across language barriers, couples, classrooms, therapy groups, and anyone curious about their inner life.

- **67 emotions** across 6 categories (Light, Middle, Heavy, Storm, Fear, Shadow)
- **40 needs** across 5 dimensions (Body, Heart, Mind, Soul, Relationship)
- **15 languages** — German · Vietnamese · English · Turkish · Arabic · Spanish · French · Ukrainian · Polish · Greek · Tamil · Japanese · Chinese · Korean · Sanskrit
- **9 game modes** — from classic memory pairs to emotional detective work
- **5 AI guides** with distinct personalities and cultural backgrounds
- **Cross-generational** — grandparent and grandchild, couples, classroom groups
- **Mobile-first** — installable as a PWA, works offline
- **Optional backend** — all features work without it via localStorage

---

## Game Modes

### Classic Memory
Find matching pairs: "Sehnsucht" belongs with "Noi nhớ". Five difficulty levels from Kids (6 pairs) to Master (30 pairs). Star rating and personal bests.

### Conversation Round
Draw a card, read the emotion, answer the reflection question. Perfect for family evenings, therapy, or classroom use.

### Story Mode
Three random emotions — tell a story that connects all three.

### Needs Check-In
Daily check-in: What do you need right now? 40 needs across 5 dimensions. Return prompt shows yesterday's needs — "Yesterday you needed rest. Today?"

### Emotion Wheel
Interactive SVG wheel with all 67 emotions. Floating emoji dots, hover shows the name, tap opens a learning card.

### Flashcards (Learn)
Spaced repetition with 5 quiz types: translate, situation-to-emotion, listen, fill-in-the-blank, categorize. Progress dashboard with streak counter.

### Emotion Journal
Daily emotional entries with optional AI pattern recognition after 3+ entries.

### Emotion Detective
10 realistic scenarios: what is really hiding behind the behavior? Identify the hidden emotion beneath the surface. Rank system from Novice to Soul Master.

### Needs Map
Choose an emotion — instantly see which needs lie behind it. Tap any need to open a journal entry with pre-filled context.

---

## Features

| Feature | Status |
|---------|--------|
| 9 game modes | done |
| 15 languages (DE/VI/EN/TR/AR/ES/FR/UK/PL/EL/TA/JA/ZH/KO/SA) | done |
| 4-step onboarding (language pair, mode, profile, guide) | done |
| User profile (name + emoji) | done |
| Streak + weekly recap + milestone messages | done |
| Daily challenge (deterministic, date-seeded) | done |
| Resonance buttons (I know this / I feel this / surprising) | done |
| Persona memory (AI remembers your emotional resonances) | done |
| 5 AI guides (Hana, Nadia, Karim, Lena, Soo) | done |
| Tandem mode (language partner worldwide) | done |
| Physical card set configuration | done |
| Notification banner | done |
| AI without own API key (backend covers costs) | done |
| Check-in with 5 dimensions | done |
| Return prompt (yesterday/today) | done |
| Generative SVG card art | done |
| Cultural perspectives (20 emotions, multilingual) | done |
| AI Cultural Bridge (RAG-powered) | done |
| Streaming AI responses (SSE) | done |
| Fun Facts modal (13 language facts) | done |
| Audio pronunciation | done |
| Dark mode | done |
| Star rating | done |
| Multiplayer (2-4 players) | done |
| PWA (installable) | done |
| Spaced repetition | done |
| Progress export | done |
| FastAPI backend | done |
| SQLite database | done |
| Check-in stats + dimension distribution | done |
| Journal analysis (AI) | done |
| Emotion Detective (10 scenarios, rank system) | done |
| Needs Map (40-need framework) | done |
| Word of the Day with deep psychological insights | done |

---

## Quick Start

```bash
# No build step, no npm, no framework
open index.html

# Or serve locally
npx serve .
```

The app works fully in the browser without any backend.

---

## Backend (optional)

The optional FastAPI backend enables AI conversations, streamed responses, journal analysis, and stats synced across devices.

```bash
cd backend
pip install -r requirements.txt

# Create .env
echo "OPENAI_API_KEY=sk-..." > .env
# or use OpenRouter
echo "OPENROUTER_API_KEY=sk-or-..." > .env

# Start
uvicorn main:app --reload
# API docs: http://localhost:8000/docs
```

The frontend auto-detects whether the backend is running. Without it, everything works via localStorage. With it, users get AI features without needing their own API key.

---

## Tech Stack

**Frontend:** Pure HTML + CSS + JS. No framework, no build step, no npm.

**Backend:** FastAPI + SQLite + OpenAI / OpenRouter (RAG-powered AI)

**AI models:**
- GPT-4o Mini (default, routed through backend — free for users)
- Gemma 3 27B, Mistral Small 3.1 (OpenRouter free tier)
- Claude Sonnet 4.6 (via OpenRouter, own key)

---

## File Structure

```
index.html              — Main page
css/style.css           — Responsive styles + dark mode
js/
  data.js               — 67 emotions, 40 needs, UI text (15 languages)
  lang-supplement.js    — Runtime patches for JA/ZH/KO/SA
  game.js               — Game engine (all modes, onboarding, streak, profile)
  api.js                — Backend client (graceful fallback to localStorage)
  ai.js                 — OpenRouter integration, cultural bridge + persona memory
  culture.js            — Handwritten cultural comparisons DE/VN/EL
  culture-insights.js   — Static cultural perspectives for 20 emotions
  funfacts.js           — Fun Facts modal
  card-art.js           — Generative SVG art per emotion category
  personas.js           — 5 AI guides with system prompts
  tandem.js             — Tandem learning mode
  detective.js          — Emotion Detective (scenarios, rank system)
  learn.js              — Flashcard engine with spaced repetition
  learn-data.js         — Scenarios, exercises, quiz types
  wotd-insights.js      — Word of the Day: psychology, body, world words, quotes
manifest.json           — PWA manifest
sw.js                   — Service worker (offline cache)

backend/
  main.py               — FastAPI app + CORS + SQLite migration
  routers/
    checkins.py         — POST /checkins/, GET /checkins/stats/{user_id}
    journal.py          — POST /journal/, GET /journal/{user_id}
    users.py            — POST /users/init, PUT /users/{user_id}
    ai.py               — POST /ai/cultural-bridge, /stream, /journal-analysis
  data/
    knowledge_base.md   — RAG knowledge base (cultural emotion vocabulary)
```

---

## The AI Guides

| Guide | Background | Specialty |
|-------|-----------|-----------|
| Hana | Kyoto | Mindfulness, mono no aware, komorebi |
| Nadia | Moscow to Berlin | Psychology, toska, dusha, Weltschmerz |
| Karim | Marrakech | Sufi poetry, ya'aburnee, tarab |
| Lena | Frankfurt | Linguistics, etymology, untranslatability |
| Soo | Seoul | nunchi, han, jeong — Korean emotional intelligence |

---

## Adding Languages

Add a language code to each emotion in `js/data.js`, plus entries in `LANGUAGES` and `UI_TEXT`:

```javascript
{ id: 'freude', de: 'Freude', vi: 'Niem vui', en: 'Joy', el: 'Xara', ... }
```

`backend/tools/add_tamil.py` shows how to automate this — use it as a template.

---

## Roadmap

- [x] 67 emotions, 6 categories, 15 languages
- [x] 9 game modes
- [x] Audio pronunciation
- [x] Dark mode + PWA (offline)
- [x] Multiplayer (pass-and-play)
- [x] AI integration (free models, RAG)
- [x] Spaced repetition flashcards
- [x] FastAPI backend + SQLite
- [x] 5 AI guides with personalities
- [x] Tandem learning mode
- [x] Emotion Detective + Needs Map
- [x] Word of the Day with deep insights
- [ ] Push notifications (iOS Safari)
- [ ] Real-time tandem matching (WebSocket)
- [ ] B2B licenses (schools, therapy, integration courses)
- [ ] Physical card deck (print-on-demand)

---

## Contributing

Contributions welcome — especially:
- New language translations (add to `data.js`)
- Additional Detective scenarios
- Cultural insights and untranslatable words
- Accessibility improvements

Open an issue first for larger changes.

---

## License

MIT — take it, share it, make something beautiful.

*Made with love to help people talk about feelings.*
