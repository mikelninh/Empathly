# Contributing to Empathly

First: thank you for being here. This project exists because people care about emotional intelligence, language, and connection. Every contribution — big or small — moves that forward.

---

## What we need most

### 1. New language translations
The highest-impact contribution. Add a language to all 67 emotions in `js/data.js` and the `UI_TEXT` object.

```js
// In EMOTIONS array — add your language code to each object:
{ id: 'freude', de: 'Freude', en: 'Joy', vi: 'Niềm vui', your_code: 'Your word', ... }

// In UI_TEXT — add translations for all UI strings:
UI_TEXT.your_code = { play: '...', learn: '...', ... }
```

See `backend/tools/add_tamil.py` for a semi-automated approach. Languages we'd love next: **Hindi, Portuguese, Italian, Persian, Swahili, Dutch.**

### 2. Emotion Detective scenarios
The most fun to contribute. Each scenario is a realistic life situation where a surface behavior hides a deeper emotion.

```js
// In js/detective.js, add to the SCENARIOS array:
{
  id: 'sc_your_scenario',
  difficulty: 'easy' | 'medium' | 'hard',
  hidden: 'emotion_id',          // must match an ID in EMOTIONS array
  choices: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6'],  // 6 choices, hidden emotion included
  situation: {
    de: 'German situation text — concrete, specific, relatable.',
    en: 'English situation text.',
    vi: 'Vietnamese situation text.',
  },
  clues: {
    de: ['Clue 1', 'Clue 2', 'Clue 3'],
    en: ['Clue 1', 'Clue 2', 'Clue 3'],
  },
  persona_note: {
    de: 'Psychological explanation in German — 2-3 sentences.',
    en: 'Psychological explanation in English.',
  }
}
```

Good scenarios have: a surprising but recognizable situation, a non-obvious hidden emotion, and a persona note that genuinely teaches something.

### 3. Cultural insights
Add to `js/culture-insights.js` — handwritten comparisons of how an emotion is experienced differently across cultures. Format follows the existing entries.

### 4. Accessibility improvements
- Keyboard navigation for card games
- Screen reader labels for SVG emotion wheel
- High-contrast mode
- Reduced motion support

### 5. Bug reports
Open an issue with:
- Steps to reproduce
- Browser + OS
- Screenshot if visual

---

## Architecture in 5 minutes

```
index.html          One page. All modes rendered by JS into mode containers.
css/style.css       ~5000 lines. CSS variables for theming. No preprocessor.
js/
  data.js           The brain: 67 emotions, 40 needs, 15 languages, all UI text.
  game.js           The engine: onboarding, all 9 game modes, streak, profile.
  detective.js      Self-contained detective module. IIFE pattern.
  ai.js             OpenRouter integration. Cultural bridge + journal analysis.
  personas.js       5 AI guides with system prompts and personality.
  learn.js          Spaced repetition flashcard engine.
backend/
  main.py           FastAPI. SQLite. CORS. Migration on startup.
  routers/          One file per domain: users, journal, checkins, ai.
  data/             RAG knowledge base in plain markdown.
```

**Key pattern:** Everything is an IIFE or module-level function. No global state except `state` in `game.js`. The backend is optional — the app detects whether it's running and falls back to localStorage.

**Adding a game mode:**
1. Add a `.your-mode` container in `index.html`
2. Add an `initYourMode()` function in `game.js`
3. Add a mode card to the landing grid
4. Wire it up in `showGame()` and the mode nav

---

## Running locally

```bash
# Frontend only (no backend needed)
open index.html
# or
npx serve .

# With backend
cd backend
pip install -r requirements.txt
echo "OPENAI_API_KEY=sk-..." > .env
uvicorn main:app --reload
```

No npm. No webpack. No build step. Open the file, it works.

---

## Before you open a PR

- Test in Firefox and Chrome (Safari too if possible)
- Test offline (DevTools → Network → Offline)
- Test dark mode
- Emotion IDs must match exactly — check `EMOTIONS` array in `data.js`
- Keep the zero-dependency constraint for the frontend

---

## Not sure where to start?

Look for issues labeled `good first issue`. Or translate 5 emotions to a language you speak — that's already valuable.

Questions? Open an issue or discussion. We read everything.

---

*Made with care. Contribute with care.*
