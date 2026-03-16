# 💛 Gefühle-Memory

**Ein Kartenspiel über Gefühle — auf Deutsch, Vietnamesisch und Englisch.**

Finde Paare. Sprich darüber. Lerne Emotionen — in deiner Sprache und der Sprache deiner Familie.

🌐 **Live spielen:** [mikelninh.github.io/Gefuehle-Memory](https://mikelninh.github.io/Gefuehle-Memory/)

## Warum?

Über Gefühle zu reden ist schwer. In jeder Sprache. Dieses Spiel macht es leichter — durch Spielen, nicht durch Belehren.

<<<<<<< HEAD
- 🇩🇪🇻🇳🇬🇧🇹🇷🇸🇦🇪🇸🇫🇷🇺🇦🇵🇱🇬🇷 **10 Sprachen** — Deutsch · Vietnamesisch · Englisch · Türkisch · Arabisch · Spanisch · Französisch · Ukrainisch · Polnisch · Griechisch
=======
- 🇩🇪🇻🇳🇬🇧 **Dreisprachig** — Deutsch · Vietnamesisch · Englisch
>>>>>>> f284a2ef676d2ca5085262eadf9c7ab6d5c244f0
- 💛 **67 Emotionen** in 6 Kategorien (Licht, Mitte, Schwere, Sturm, Angst, Schatten)
- 🧠 **40 Bedürfnisse** in 5 Dimensionen (Körper, Herz, Geist, Seele, Beziehung)
- 👨‍👩‍👧‍👦 **Generationsübergreifend** — Oma mit Enkel, Familie, Freunde, Paare
- 📱 **Mobil-optimiert** — Spielbar auf jedem Gerät
- 🌙 **Dark Mode** — Warme dunkle Optik
- 🤖 **KI-Features** — Kulturbrücke, Journal-Analyse, kostenlose Modelle

## Spielmodi

### 🃏 Klassisches Memory
Finde Paare: „Sehnsucht" gehört zu „Nỗi nhớ". 5 Schwierigkeitsstufen von Kids (6 Paare) bis Master (30 Paare). Sterne-Bewertung und Bestzeiten.

### 💬 Gesprächsrunde
Zieh eine Karte, lies das Gefühl vor, beantworte die Frage. Perfekt für Familienabende, Therapie, Schulprojekte.

### 📖 Geschichten
Drei zufällige Gefühle — erzähl eine Geschichte, die alle drei enthält.

### 🧘 Bedürfnis-Check-in
Täglicher Check-in: Was brauchst du gerade? 40 Bedürfnisse in 5 Dimensionen.

### 🎡 Emotions-Rad
Interaktives SVG-Rad mit allen 67 Emotionen. Emojis schweben, Hover zeigt Details, Klick öffnet Lernkarte.

### 📚 Karteikarten (Lernen)
Spaced Repetition mit 5 Quiz-Typen: Übersetzen, Situation→Gefühl, Hören, Lückentext, Kategorie zuordnen. Fortschritt-Dashboard, Streak-Zähler, Export für Schulen.

### 📔 Emotions-Journal
Tägliche Gefühls-Einträge mit optionaler KI-Muster-Erkennung nach 3+ Einträgen.

## Features

| Feature | Status |
|---------|--------|
| 🃏 6 Spielmodi | ✅ |
<<<<<<< HEAD
| 🌍 10 Sprachen | ✅ |
=======
| 🇩🇪🇻🇳🇬🇧 3 Sprachen | ✅ |
>>>>>>> f284a2ef676d2ca5085262eadf9c7ab6d5c244f0
| 🎴 Generative SVG-Kartenkunst | ✅ |
| 🌍 Kulturbrücke (DE↔VN) | ✅ |
| 🤖 KI Cultural Bridge (dynamisch) | ✅ |
| 🆓 Kostenlose KI-Modelle | ✅ |
| 🔊 Audio-Aussprache | ✅ |
| 🌙 Dark Mode | ✅ |
| ⭐ Sterne-Bewertung | ✅ |
| 👥 Multiplayer (2–4 Spieler) | ✅ |
| 📱 PWA (installierbar) | ✅ |
| 📚 Spaced Repetition | ✅ |
| 🏫 Fortschritt-Export | ✅ |

## Tech

Reines HTML + CSS + JS. Kein Framework. Kein Build-Step. Kein npm.

```bash
# Einfach öffnen
open index.html

# Oder mit Server
npx serve .
```

### Dateistruktur

```
index.html          — Hauptseite
css/style.css       — Responsive Styles + Dark Mode
js/data.js          — 67 Emotionen, 40 Bedürfnisse, UI-Texte (DE/VI/EN)
js/game.js          — Game Engine (alle Modi)
js/culture.js       — 20 handgeschriebene Kulturvergleiche DE↔VN
js/ai.js            — OpenRouter-Integration, Settings, KI-Kulturbrücke
js/card-art.js      — Generative SVG-Kunst pro Kategorie
js/learn.js         — Flashcard-Engine mit Spaced Repetition
js/learn-data.js    — Szenarien, Übungen, Quiz-Typen
manifest.json       — PWA-Manifest
sw.js               — Service Worker (Offline-Cache)
```

## Sprachen erweitern

In `js/data.js` einen neuen Sprachcode zu jedem Emotion-Objekt + `LANGUAGES` + `UI_TEXT` hinzufügen:

```javascript
{ id: 'freude', de: 'Freude', vi: 'Niềm vui', en: 'Joy', tr: 'Sevinç' }
```

## KI-Features

Nutzt [OpenRouter](https://openrouter.ai) mit kostenlosen Modellen als Default (Llama 3.1, Gemma 2, Qwen 2, Mistral 7B). Kein Abo nötig — nur einen kostenlosen API-Key erstellen.

- **KI-Kulturbrücke** — Generiert kulturelle Vergleiche für jede Sprachkombination
- **Journal-Analyse** — Erkennt Muster in täglichen Emotions-Einträgen
- **Graceful Degradation** — Alles funktioniert auch ohne KI

## Roadmap

- [x] 67 Emotionen in 6 Kategorien
<<<<<<< HEAD
- [x] 10 Sprachen (DE/VI/EN/TR/AR/ES/FR/UK/PL/EL)
=======
- [x] 3 Sprachen (DE/VI/EN)
>>>>>>> f284a2ef676d2ca5085262eadf9c7ab6d5c244f0
- [x] 7 Spielmodi
- [x] Audio-Aussprache
- [x] Dark Mode + PWA
- [x] Multiplayer (Pass-and-Play)
- [x] KI-Integration (kostenlose Modelle)
- [x] Flashcard-Lernsystem
- [x] Generative Kartenkunst
<<<<<<< HEAD
- [x] Weitere Sprachen (TR, AR, ES, FR, UK, PL, EL) ✅
=======
- [ ] Weitere Sprachen (TR, AR, ES, FR, UK, PL)
>>>>>>> f284a2ef676d2ca5085262eadf9c7ab6d5c244f0
- [ ] KI-Emotions-Coach
- [ ] Physisches Kartendeck (Print-on-Demand)
- [ ] B2B-Lizenzen (Schulen, Therapie, Integrationskurse)

## Lizenz

MIT — Nimm es, teil es, mach was Schönes draus.

---

*Made with 💛 to help people talk about feelings.*
*Được tạo với 💛 để giúp mọi người nói về cảm xúc.*
*Mit 💛 gemacht, damit Menschen über Gefühle reden können.*
