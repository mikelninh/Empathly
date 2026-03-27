# Empathly

**A mindful emotion game for emotional awareness — in 15 languages.**

Explore emotions. Talk about them. Grow your inner vocabulary across languages and cultures.

Play live: [mikelninh.github.io/Empathly](https://mikelninh.github.io/Empathly/) · [📊 Slides](https://mikelninh.github.io/Empathly/presentation.html)

---

## Why Empathly?

*Empath* + *-ly* — the adverb suffix that turns a quality into a way of being. Like *deeply*, *openly*, *mindfully* — words already woven into this app's language. The name suggests not just having empathy, but living it: feeling empathly, connecting empathly, knowing yourself empathly. A practice, not a label.

---

## What is this?

Talking about feelings is hard — in any language. This game makes it easier through play, not instruction. Designed for families across language barriers, couples, classrooms, therapy groups, and anyone curious about their inner life.

- **94 emotions** across 6 categories (Light, Middle, Heavy, Storm, Fear, Shadow) — including 6 untranslatables (Fernweh, Waldeinsamkeit, Saudade, Han, Schadenfreude, Torschlusspanik)
- **40 needs** across 5 dimensions (Body, Heart, Mind, Soul, Relationship)
- **15 languages** — German · Vietnamese · English · Turkish · Arabic · Spanish · French · Ukrainian · Polish · Greek · Tamil · Japanese · Chinese · Korean · Sanskrit
- **11 game modes** — from classic memory pairs to a full SEL Masterclass
- **5 AI guides** with illustrated portraits and distinct cultural backgrounds
- **SEL Masterclass** — 5-module Social-Emotional Learning curriculum with server-side certificates (Modules 1–2 always free)
- **Teacher dashboard** — class codes, student enrollment, progress tracking (B2B)
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
Interactive SVG wheel with all 94 emotions. Floating emoji dots, hover shows the name, tap opens a learning card.

### Flashcards (Learn)
Spaced repetition with 5 quiz types: translate, situation-to-emotion, listen, fill-in-the-blank, categorize. Progress dashboard with streak counter.

### Emotion Journal
Daily emotional entries with optional AI pattern recognition after 3+ entries.

### Emotion Detective
10 realistic scenarios: what is really hiding behind the behavior? Identify the hidden emotion beneath the surface. Rank system from Novice to Soul Master.

### Needs Map
Choose an emotion — instantly see which needs lie behind it. Tap any need to open a journal entry with pre-filled context.

### Word of the Day
One emotion per day with deep psychological insights, body sensations, world words, and quotes.

### SEL Masterclass
A full Social-Emotional Learning curriculum:

| Module | Topic | Access |
|--------|-------|--------|
| 1 · Language of Feelings | Neuroscience of affect labeling, emotion wheel, vocabulary | **Free** |
| 2 · What Lies Beneath | Evolutionary function of emotions, needs map | **Free** |
| 3 · The Body Knows | Interoception, Window of Tolerance, body check-in | Pro |
| 4 · Feelings Across Cultures | Untranslatable emotions, AI cultural bridge | Pro |
| 5 · The Practice | Habit stacking, NVC, passing on emotional literacy | Pro + Certificate |

Certificates are stored server-side with a UUID4 verification URL. Teachers can create classes with a 6-character code and track student progress via the dashboard.

---

## Features

| Feature | Status |
|---------|--------|
| 94 emotions (incl. 6 untranslatables) | ✓ |
| 15 languages | ✓ |
| 11 game modes | ✓ |
| 5 AI guides with illustrated portrait faces | ✓ |
| SEL Masterclass (5 modules, free core) | ✓ |
| Server-side certificates with UUID verification | ✓ |
| Teacher dashboard + class codes | ✓ |
| 4-step onboarding | ✓ |
| Streak + weekly recap + milestone messages | ✓ |
| Daily challenge (deterministic, date-seeded) | ✓ |
| Resonance buttons + persona memory | ✓ |
| Tandem mode (language partner worldwide) | ✓ |
| Physical card set configuration | ✓ |
| AI without own API key (backend covers costs) | ✓ |
| Generative SVG card art | ✓ |
| Cultural perspectives (AI Cultural Bridge, RAG) | ✓ |
| Streaming AI responses (SSE) | ✓ |
| Audio pronunciation | ✓ |
| Dark mode | ✓ |
| Multiplayer (2–4 players) | ✓ |
| PWA (installable, offline) | ✓ |
| Spaced repetition | ✓ |
| FastAPI backend + SQLite | ✓ |
| Journal analysis (AI) | ✓ |
| Emotion Detective (rank system) | ✓ |
| Needs Map (40-need framework) | ✓ |

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

The optional FastAPI backend enables AI conversations, streamed responses, journal analysis, Masterclass certificates, and stats synced across devices.

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

The frontend auto-detects whether the backend is running. Without it, everything works via localStorage. With it, users get AI features and server-side certificates without needing their own API key.

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
  data.js               — 94 emotions, 40 needs, UI text (15 languages)
  lang-supplement.js    — Runtime patches for JA/ZH/KO/SA
  game.js               — Game engine (all modes, onboarding, streak, profile)
  api.js                — Backend client (graceful fallback to localStorage)
  ai.js                 — OpenRouter integration, cultural bridge + persona memory
  culture.js            — Handwritten cultural comparisons DE/VN/EL
  culture-insights.js   — Static cultural perspectives for 20 emotions
  funfacts.js           — Fun Facts modal
  card-art.js           — Generative SVG art per emotion category
  personas.js           — 5 AI guides with SVG portrait faces + system prompts
  tandem.js             — Tandem learning mode
  detective.js          — Emotion Detective (scenarios, rank system)
  learn.js              — Flashcard engine with spaced repetition
  learn-data.js         — Scenarios, exercises, quiz types
  wotd-insights.js      — Word of the Day: psychology, body, world words, quotes
  masterclass-data.js   — SEL curriculum (5 modules × 4 lessons, badges)
  masterclass.js        — Masterclass engine (quiz, certificates, teacher dashboard)
manifest.json           — PWA manifest
sw.js                   — Service worker (offline cache)

backend/
  main.py               — FastAPI app + CORS + SQLite migration
  routers/
    checkins.py         — POST /checkins/, GET /checkins/stats/{user_id}
    journal.py          — POST /journal/, GET /journal/{user_id}
    users.py            — POST /users/init, PUT /users/{user_id}
    ai.py               — POST /ai/cultural-bridge, /stream, /journal-analysis
    masterclass.py      — Progress, certificates (UUID verify), class management
  data/
    knowledge_base.md   — RAG knowledge base (cultural emotion vocabulary)
```

---

## The AI Guides

| Guide | Background | Specialty |
|-------|-----------|-----------|
| Hana | Kyoto | Mindfulness, mono no aware, komorebi |
| Nadia | Moscow → Berlin | Psychology, toska, dusha, Weltschmerz |
| Karim | Marrakech | Sufi poetry, ya'aburnee, tarab |
| Lena | Frankfurt | Linguistics, etymology, untranslatability |
| Soo | Seoul | Nunchi, han, jeong — Korean emotional intelligence |

Each guide has an illustrated SVG portrait face and a full cultural system prompt.

---

## Monetization Model

The core stays **free forever** for all people:
- Modules 1–2 of the Masterclass are always free
- All 11 game modes are free
- All 94 emotions and 15 languages are free

Revenue comes from **B2B** (schools, therapy practices, integration courses):
- Teacher dashboard: class codes, student enrollment, progress tracking
- School tier: ~€2/student/year
- Individual Pro: access to Masterclass Modules 3–5 + certificate

---

## Adding Languages

Add a language code to each emotion in `js/data.js`, plus entries in `LANGUAGES` and `UI_TEXT`:

```javascript
{ id: 'freude', de: 'Freude', vi: 'Niem vui', en: 'Joy', el: 'Xara', ... }
```

`backend/tools/add_tamil.py` shows how to automate this — use it as a template.

---

## Roadmap

- [x] 94 emotions, 6 categories, 15 languages
- [x] 11 game modes
- [x] Audio pronunciation
- [x] Dark mode + PWA (offline)
- [x] Multiplayer (pass-and-play)
- [x] AI integration (free models, RAG)
- [x] Spaced repetition flashcards
- [x] FastAPI backend + SQLite
- [x] 5 AI guides with illustrated faces
- [x] Tandem learning mode
- [x] Emotion Detective + Needs Map
- [x] Word of the Day with deep insights
- [x] SEL Masterclass (5 modules, free core)
- [x] Server-side certificates (UUID verification)
- [x] Teacher dashboard (B2B)
- [ ] Push notifications (iOS Safari)
- [ ] Real-time tandem matching (WebSocket)
- [ ] B2B onboarding + billing (schools, therapy)
- [ ] Physical card deck (print-on-demand)

---

## Contributing

Contributions welcome — especially:
- New language translations (add to `data.js`)
- Additional Detective scenarios
- Cultural insights and untranslatable words
- Accessibility improvements

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — architecture overview, data formats, and good first issues.

Open an issue first for larger changes.

---

## License

MIT — take it, share it, make something beautiful.

*Made with love to help people talk about feelings.*
