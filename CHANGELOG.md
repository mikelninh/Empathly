# Changelog

## v3.0.0 — 2026-03-15

### New Features

#### 1. Beautiful Card Art (Generative SVG)
- Each card front now shows unique generative watercolor-inspired SVG art
- 6 distinct visual styles per emotion category:
  - Licht: radial sun bursts, floating particles, warm gradients
  - Mitte: flowing waves, soft circles, horizontal mist layers
  - Schwere: falling drips, dark pools, deep gradients
  - Sturm: lightning bolts, sharp triangles, energy lines
  - Angst: concentric pressure circles, spikes, vortex spirals
  - Schatten: layered shadows, fog, crack lines, fading shapes
- Uses SVG filters (feTurbulence, feDisplacementMap, feGaussianBlur)
- Deterministic art per emotion via seeded random
- Emoji and word overlay with text-shadow for readability
- Matched cards get a glowing animation
- New file: `js/card-art.js`

#### 2. AI Cultural Bridge (OpenRouter Integration)
- Settings button (⚙️) in header opens API configuration modal
- OpenRouter API key input (saved to localStorage, masked)
- AI model selector (Claude Sonnet 4.6, GPT-4o Mini, Gemini Flash 1.5)
- AI features toggle (on/off)
- "Generate cultural insight" button in card hint overlay
- AI-generated cultural comparisons (German vs Vietnamese)
- Results cached in localStorage per emotion+language pair
- Graceful degradation when no API key is set
- New file: `js/ai.js`

#### 3. Daily Emotion Journal
- New mode tab: Journal / Nhật ký / Journal
- Today's date with localized formatting
- All 6 emotion categories as expandable sections
- Multi-select emotions with visual feedback
- Free text note field
- Entries saved to localStorage with timestamp
- Scrollable history of past entries (click to expand)
- Weekly heatmap showing emotion frequency per category
- AI pattern analysis button (after 3+ entries)
- Sends last 7 entries to OpenRouter for warm, non-clinical insights
- AI insight cached per week

### UI Text
- All new keys added to `UI_TEXT` in German, Vietnamese, and English
- Journal, AI, and settings translations in all 3 languages

### Technical
- Service worker cache updated to v2 with new files
- `js/culture.js` preserved unchanged
- All AI features gracefully degrade without API key

---

## v2.0.0 — 2026-03-15

### New Features

#### 1. Audio Pronunciation
- Speaker icon (🔊) on flipped/matched cards using Web Speech API
- Supports `de-DE`, `vi-VN`, `en-GB` voices
- Speak buttons in hint overlay, prompt overlay, talk mode, and story mode cards
- Graceful fallback when voices are unavailable

#### 2. Dark Mode
- Moon/sun toggle button in header
- Warm dark color palette (not cold blue) via CSS custom properties
- Persisted to `localStorage`
- Respects `prefers-color-scheme: dark` on first visit
- `body.dark-mode` class for easy CSS targeting

#### 3. Star Rating
- Shown on congrats screen after classic game completion
- 1 star = completed, 2 stars = under pairs×3 moves, 3 stars = under pairs×2 moves
- Animated star pop-in with staggered delays
- Best rating saved per difficulty+category in `localStorage`
- "New record!" indicator when beating previous best

#### 4. Emotion Wheel (Gefühlsrad)
- New mode tab: Rad / Vòng / Wheel
- SVG radial chart with 6 category segments using CATEGORIES colors
- Emotion dots positioned within their category wedges
- Click any dot to open the hint overlay with full emotion details
- Responsive — scales to any screen size

#### 5. PWA (Progressive Web App)
- `manifest.json` with app name, standalone display, SVG data URI icons
- `sw.js` service worker with cache-first strategy and version-based cache busting
- Registered in `index.html` (only over HTTP, not `file://`)
- iOS meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`

#### 6. Multiplayer Pass-and-Play
- 2–4 players on the same device via player count selector
- Name entry screen before game starts
- Color-coded turn indicator bar with pulsing animation for current player
- Points awarded per matched pair
- Pass-device overlay between turns on mismatch
- Full scoreboard on congrats screen with winner/tie detection
- Solo/Mehrspieler toggle in classic mode controls

### UI Text
- All new keys added to `UI_TEXT` in German, Vietnamese, and English

### Technical
- No frameworks, no npm, no build tools
- Mobile-first responsive design
- Works with `file://` protocol (except service worker)
- `js/culture.js` preserved unchanged
