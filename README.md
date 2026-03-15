# 💛 Gefühle-Memory

**Ein Kartenspiel über Gefühle — auf Deutsch und Vietnamesisch.**

Finde Paare. Sprich darüber. Lerne über Emotionen — in deiner Sprache und in der Sprache deiner Familie.

## Warum?

Über Gefühle zu reden ist schwer. In jeder Sprache. Dieses Spiel macht es leichter — durch Spielen, nicht durch Belehren.

- 🇩🇪🇻🇳 **Zweisprachig** — Deutsch ↔ Vietnamesisch (erweiterbar auf beliebig viele Sprachen)
- 👨‍👩‍👧‍👦 **Generationsübergreifend** — Oma mit Enkel, Familie, Freunde, Paare
- 🎯 **Drei Spielmodi** — Klassisches Memory, Gesprächsrunde, Geschichten
- 📱 **Mobil-optimiert** — Spielbar auf jedem Gerät
- 🖨 **Druckbar** — Als physisches Kartendeck bestellbar (bald)

## Spielmodi

### 🃏 Klassisch
Finde Paare: „Sehnsucht" gehört zu „Nỗi nhớ". Wenn du ein Paar findest, beantworte die Gesprächsfrage.

### 💬 Gesprächsrunde
Zieh eine Karte, lies das Gefühl vor, beantworte die Frage. Perfekt für Familienabende, Therapie, Schulprojekte.

### 📖 Geschichten
Drei zufällige Gefühle — erzähl eine Geschichte, die alle drei enthält.

## Emotionen (20 Paare)

Freude · Traurigkeit · Wut · Angst · Sehnsucht · Stolz · Scham · Dankbarkeit · Einsamkeit · Geborgenheit · Neugier · Eifersucht · Hoffnung · Überraschung · Vertrauen · Frustration · Gelassenheit · Aufregung · Mitgefühl · Mut

## Tech

Reines HTML + CSS + JS. Kein Framework. Kein Build-Step. Einfach `index.html` öffnen.

```bash
# Lokal starten
open index.html
# oder mit einem einfachen Server
npx serve .
```

## Erweiterung

Neue Sprachen hinzufügen: In `js/data.js` einfach einen neuen Sprachcode zu jedem Emotion-Objekt hinzufügen und in `LANGUAGES` + `UI_TEXT` registrieren.

```javascript
// Beispiel: Türkisch hinzufügen
{
  id: 'freude',
  de: 'Freude',
  vi: 'Niềm vui',
  en: 'Joy',
  tr: 'Sevinç',  // ← neue Sprache
  // ...
}
```

## Roadmap

- [x] Digital spielbar (Web)
- [x] Deutsch + Vietnamesisch + Englisch
- [x] 3 Spielmodi
- [ ] Multiplayer (WebSocket, Raum-Codes)
- [ ] Mehr Sprachen (Türkisch, Arabisch, Polnisch)
- [ ] Audio-Aussprache per Klick
- [ ] PWA (offline spielbar, installierbar)
- [ ] Physisches Kartendeck (Print-on-Demand)
- [ ] Erweiterungspacks (Kinder, Therapie, Team-Workshop)

## Lizenz

MIT — Nimm es, teil es, mach was Schönes draus.

---

*Made with 💛 to help people talk about feelings.*
*Được tạo với 💛 để giúp mọi người nói về cảm xúc.*
