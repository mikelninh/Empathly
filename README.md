# Gefühle-Memory

**Ein Kartenspiel über Gefühle — in 11 Sprachen.**

Finde Paare. Sprich darüber. Lerne Emotionen — in deiner Sprache und der Sprache deiner Familie.

Live spielen: [mikelninh.github.io/Gefuehle-Memory](https://mikelninh.github.io/Gefuehle-Memory/)

## Warum?

Über Gefühle zu reden ist schwer. In jeder Sprache. Dieses Spiel macht es leichter — durch Spielen, nicht durch Belehren.

- **11 Sprachen** — Deutsch · Vietnamesisch · Englisch · Türkisch · Arabisch · Spanisch · Französisch · Ukrainisch · Polnisch · Griechisch · Tamil
- **67 Emotionen** in 6 Kategorien (Licht, Mitte, Schwere, Sturm, Angst, Schatten)
- **40 Bedürfnisse** in 5 Dimensionen (Körper, Herz, Geist, Seele, Beziehung)
- **Generationsübergreifend** — Oma mit Enkel, Familie, Freunde, Paare
- **Mobil-optimiert** — Spielbar auf jedem Gerät, installierbar als PWA
- **Dark Mode** — Warme dunkle Optik
- **FastAPI Backend** — Statistiken, Journal, KI-Kulturbrücke mit RAG
- **KI ohne eigenen Key** — Backend übernimmt die AI-Kosten

## Onboarding

Drei Schritte beim ersten Öffnen:

1. **Sprachpaar wählen** — 6 Schnell-Auswahl-Buttons (z.B. Deutsch↔Türkisch) oder eigene Dropdowns
2. **Modus wählen** — Spielen, Entdecken oder Lernen
3. **Profil** — Name + Emoji für die persönliche Note

Danach startet das Spiel direkt — ohne Registrierung, ohne Account.

## Spielmodi

### Klassisches Memory
Finde Paare: „Sehnsucht" gehört zu „Nỗi nhớ". 5 Schwierigkeitsstufen von Kids (6 Paare) bis Master (30 Paare). Sterne-Bewertung und Bestzeiten.

### Gesprächsrunde
Zieh eine Karte, lies das Gefühl vor, beantworte die Frage. Perfekt für Familienabende, Therapie, Schulprojekte.

### Geschichten
Drei zufällige Gefühle — erzähl eine Geschichte, die alle drei enthält.

### Bedürfnis-Check-in
Täglicher Check-in: Was brauchst du gerade? 40 Bedürfnisse in 5 Dimensionen (Körper · Herz · Geist · Seele · Beziehung). Rückkehr-Prompt zeigt gestrige Bedürfnisse — „Gestern brauchtest du Ruhe. Heute?" Dimensionsbalken zeigen Muster auf einen Blick.

### Emotions-Rad
Interaktives SVG-Rad mit allen 67 Emotionen. Emojis schweben, Hover zeigt Details, Klick öffnet Lernkarte.

### Karteikarten (Lernen)
Spaced Repetition mit 5 Quiz-Typen: Übersetzen, Situation→Gefühl, Hören, Lückentext, Kategorie zuordnen. Fortschritt-Dashboard, Streak-Zähler, Export für Schulen.

### Emotions-Journal
Tägliche Gefühls-Einträge mit optionaler KI-Muster-Erkennung nach 3+ Einträgen.

## Features

| Feature | Status |
|---------|--------|
| 7 Spielmodi | ✅ |
| 11 Sprachen (inkl. Tamil) | ✅ |
| 3-Schritt-Onboarding | ✅ |
| Nutzerprofil (Name + Emoji) | ✅ |
| Streak + Wochen-Recap | ✅ |
| Benachrichtigungen (Banner) | ✅ |
| KI ohne eigenen API-Key | ✅ |
| Check-in mit 5 Dimensionen | ✅ |
| Rückkehr-Prompt (gestern/heute) | ✅ |
| Generative SVG-Kartenkunst | ✅ |
| Kulturbrücke (handgeschrieben DE/VN/EL) | ✅ |
| KI Cultural Bridge (RAG-powered) | ✅ |
| Streaming AI-Antworten (SSE) | ✅ |
| Fun Facts Modal (13 Sprachfakten) | ✅ |
| Audio-Aussprache | ✅ |
| Dark Mode | ✅ |
| Sterne-Bewertung | ✅ |
| Multiplayer (2–4 Spieler) | ✅ |
| PWA (installierbar) | ✅ |
| Spaced Repetition | ✅ |
| Fortschritt-Export | ✅ |
| FastAPI Backend | ✅ |
| SQLite Datenbank | ✅ |
| Check-in Statistiken + Dimension-Verteilung | ✅ |
| Journal-Analyse (KI) | ✅ |
| Emotion teilen (Web Share API) | ✅ |
| Stats Widget (Landing Screen) | ✅ |

## Tech Stack

### Frontend
Reines HTML + CSS + JS. Kein Framework. Kein Build-Step. Kein npm.

```bash
# Einfach öffnen
open index.html

# Oder mit lokalem Server
npx serve .
```

### Backend (optional, erweitert Funktionen)

FastAPI + SQLite + OpenAI/OpenRouter (RAG-powered AI)

```bash
cd backend
pip install -r requirements.txt

# .env anlegen
echo "OPENAI_API_KEY=sk-..." > .env
# oder
echo "OPENROUTER_API_KEY=sk-or-..." > .env

# Server starten
uvicorn main:app --reload
# API-Docs: http://localhost:8000/docs
```

Das Frontend erkennt automatisch ob das Backend läuft und nutzt es. Ist das Backend online, funktioniert KI ohne eigenen API-Key — der Server übernimmt die Anfragen. Ohne Backend: alles funktioniert per LocalStorage (Graceful Degradation).

**Railway Cold Starts:** Der Health-Check-Timeout ist auf 8s erhöht, mit automatischem Retry nach 10s. Das `backend-online` DOM-Event aktualisiert dann die UI ohne Seitenreload.

## Dateistruktur

```
index.html              — Hauptseite
css/style.css           — Responsive Styles + Dark Mode
js/
  data.js               — 67 Emotionen, 40 Bedürfnisse, UI-Texte (11 Sprachen)
  game.js               — Game Engine (alle Modi, Onboarding, Streak, Profil)
  api.js                — Backend-Client (graceful fallback auf LocalStorage)
  ai.js                 — OpenRouter-Integration, KI-Kulturbrücke
  culture.js            — Handgeschriebene Kulturvergleiche DE/VN/EL
  funfacts.js           — Fun Facts Modal (13 Sprachfakten)
  card-art.js           — Generative SVG-Kunst pro Kategorie
  learn.js              — Flashcard-Engine mit Spaced Repetition
  learn-data.js         — Szenarien, Übungen, Quiz-Typen
manifest.json           — PWA-Manifest
sw.js                   — Service Worker (Offline-Cache)

backend/
  main.py               — FastAPI App + CORS + Startup + SQLite-Migration
  config.py             — Einstellungen via .env (pydantic-settings)
  database.py           — SQLAlchemy Setup, get_db() Dependency
  models.py             — ORM: CheckIn (inkl. needs_json, dimensions), JournalEntry, User
  schemas.py            — Pydantic Schemas (Request/Response, UserUpdate, DimensionCount)
  routers/
    checkins.py         — POST /checkins/, GET /checkins/stats/{user_id} (inkl. Dimension-Verteilung)
    journal.py          — POST /journal/, GET /journal/{user_id}
    users.py            — POST /users/init, PUT /users/{user_id} (Profil-Update)
    ai.py               — POST /ai/cultural-bridge, /stream, /journal-analysis
  data/
    knowledge_base.md   — RAG Wissensbasis (10 Chunks: Liebe, Angst, Freude...)
  tools/
    compare_models.py   — Vergleich freier LLM-Modelle (CLI)
    add_tamil.py        — Tamil-Injektor für data.js
```

## KI-Features

Nutzt [OpenRouter](https://openrouter.ai) oder OpenAI — eine API für viele Modelle.

**Kein eigener Key nötig**
Wenn das Backend online ist, leitet es alle KI-Anfragen über den Server-Key weiter. Nutzer müssen nichts konfigurieren. Die KI-Einstellungen zeigen `✅ KI aktiv — kein eigener Key nötig`. Der eigene Key bleibt optional (erreichbar über "Eigenen Key / Modell verwenden").

**KI-Kulturbrücke (RAG)**
Das Backend hat eine Wissensbasis (`knowledge_base.md`) mit kulturellen Emotionsvokabeln in 11 Sprachen. Bei einer Anfrage:
1. Relevante Chunks per Keyword-Suche abrufen
2. Chunks in den System-Prompt injizieren
3. LLM generiert kontextreiche, korrekte Antwort

Frontend-Fallback: Direkter OpenRouter-Call wenn Backend nicht läuft.

**Streaming**
Die `/ai/cultural-bridge/stream` Endpoint liefert die Antwort Wort für Wort via SSE (Server-Sent Events).

**Journal-Analyse**
Nach 3+ Einträgen: Das LLM erkennt emotionale Muster und gibt sanfte Impulse. Wöchentlicher Cache verhindert wiederholte API-Aufrufe.

**Verfügbare Modelle**
- GPT-4o Mini (default, via Backend — kostenlos für Nutzer)
- GPT-4.1 Mini / GPT-5 Mini (via Backend)
- Gemma 3 27B, Mistral Small 3.1 (OpenRouter, free tier)
- Claude Sonnet 4.6 (OpenRouter, eigener Key)

## Retention & Wiederkehr

- **Streak-Badge** auf der Landing-Seite: Aktuelle Serie + Motivation zum Weiterspielen
- **Wochen-Recap**: KI-Analyse der letzten 7 Einträge — erscheint nach 3+ Check-ins
- **Benachrichtigungs-Banner**: Nach dem 2. Check-in — Browser-Notifications anfragen (kein Alert, sondern eingebettetes Banner)
- **Rückkehr-Prompt**: Check-in zeigt gestrige Bedürfnisse mit Frage „Heute?"
- **Offline-first**: Streak und Check-ins funktionieren vollständig per LocalStorage

## Sprachen erweitern

In `js/data.js` einen neuen Sprachcode zu jedem Emotion-Objekt + `LANGUAGES` + `UI_TEXT` hinzufügen:

```javascript
{ id: 'freude', de: 'Freude', vi: 'Niềm vui', en: 'Joy', el: 'Χαρά', ta: 'மகிழ்ச்சி', ... }
```

Das Tool `backend/tools/add_tamil.py` zeigt wie das automatisch geht — als Vorlage für neue Sprachen.

## Roadmap

- [x] 67 Emotionen in 6 Kategorien
- [x] 11 Sprachen (DE/VI/EN/TR/AR/ES/FR/UK/PL/EL/TA)
- [x] 7 Spielmodi
- [x] Audio-Aussprache
- [x] Dark Mode + PWA
- [x] Multiplayer (Pass-and-Play)
- [x] KI-Integration (kostenlose Modelle, RAG)
- [x] Flashcard-Lernsystem
- [x] Generative Kartenkunst
- [x] FastAPI Backend + SQLite
- [x] Check-in mit 5 Dimensionen + Dimension-Statistiken
- [x] Streaming AI (SSE)
- [x] Fun Facts Modal
- [x] 3-Schritt-Onboarding (Sprachpaar → Modus → Profil)
- [x] KI ohne eigenen API-Key (Backend übernimmt)
- [x] Nutzerprofil (Name + Emoji) + Backend-Sync
- [x] Streak + Wochen-Recap (Retention-Loop)
- [x] Benachrichtigungs-Banner
- [ ] Push Notifications (iOS Safari)
- [ ] Visuelles Redesign für jüngere Nutzer
- [ ] B2B-Lizenzen (Schulen, Therapie, Integrationskurse)
- [ ] Physisches Kartendeck (Print-on-Demand)

## Lizenz

MIT — Nimm es, teil es, mach was Schönes draus.

---

*Made with love to help people talk about feelings.*
*Được tạo với tình yêu để giúp mọi người nói về cảm xúc.*
*Mit Liebe gemacht, damit Menschen über Gefühle reden können.*
*Φτιαγμένο με αγάπη για να βοηθήσει τους ανθρώπους να μιλούν για τα συναισθήματά τους.*
*அன்போடு உருவாக்கப்பட்டது — மக்கள் உணர்வுகளைப் பற்றி பேச உதவ.*
