"""
Tamil Translation Injector for data.js

Reads data.js, injects Tamil (ta) translations for all 67 emotions + prompts,
and writes the result back.

Run from backend/:
    python tools/add_tamil.py --dry-run   # preview first line of each change
    python tools/add_tamil.py             # apply changes to ../js/data.js
"""

import re
import sys
import argparse
from pathlib import Path

DATA_JS = Path(__file__).parent.parent.parent / "js" / "data.js"

# ── Tamil translations ─────────────────────────────────────────────────────
# Format: emotion_id -> {"ta": "word", "prompt_ta": "question"}
# Tamil script — reviewed against standard usage

TAMIL = {
    # ── Licht & Weite ──────────────────────────────────────────────────────
    "freude": {
        "ta": "மகிழ்ச்சி",
        "prompt_ta": "கடைசியாக எப்போது உண்மையான மகிழ்ச்சியை உணர்ந்தீர்கள்?",
    },
    "dankbarkeit": {
        "ta": "நன்றியுணர்வு",
        "prompt_ta": "இன்று நீங்கள் எதற்காக நன்றி சொல்கிறீர்கள்?",
    },
    "frieden": {
        "ta": "அமைதி",
        "prompt_ta": "கடைசியாக எப்போது மனம் அமைதியாக இருந்தது?",
    },
    "leichtigkeit": {
        "ta": "இலகுவான உணர்வு",
        "prompt_ta": "உங்களுக்கு இலகுவான உணர்வை என்ன தருகிறது?",
    },
    "begeisterung": {
        "ta": "உற்சாகம்",
        "prompt_ta": "இப்போது உங்களை என்ன உற்சாகப்படுத்துகிறது?",
    },
    "zaertlichkeit": {
        "ta": "மென்மை",
        "prompt_ta": "கடைசியாக எப்போது மென்மையான உணர்வை உணர்ந்தீர்கள்?",
    },
    "verbundenheit": {
        "ta": "இணைப்புணர்வு",
        "prompt_ta": "யாருடன் நெருங்கிய தொடர்பு உணர்கிறீர்கள்?",
    },
    "liebe": {
        "ta": "அன்பு",
        "prompt_ta": "உங்களுக்கு அன்பு என்றால் என்ன?",
    },
    "staunen": {
        "ta": "வியப்பு",
        "prompt_ta": "சமீபத்தில் என்ன உங்களை வியப்பில் ஆழ்த்தியது?",
    },
    "vertrauen": {
        "ta": "நம்பிக்கை",
        "prompt_ta": "யாரை மிகவும் நம்புகிறீர்கள்?",
    },
    "hoffnung": {
        "ta": "நம்பம்",
        "prompt_ta": "இப்போது எதை நம்பிக்கையுடன் எதிர்பார்க்கிறீர்கள்?",
    },
    "klarheit": {
        "ta": "தெளிவு",
        "prompt_ta": "கடைசியாக எப்போது தெளிவான எண்ணம் உங்களுக்கு வந்தது?",
    },
    "freiheit": {
        "ta": "சுதந்திரம்",
        "prompt_ta": "உங்களுக்கு சுதந்திரம் என்றால் என்ன?",
    },
    "ehrfurcht": {
        "ta": "ஆச்சரியம்",
        "prompt_ta": "என்ன உங்களை ஆழமான வியப்பில் மூழ்கடிக்கிறது?",
    },

    # ── Sanfte Mitte ───────────────────────────────────────────────────────
    "zufriedenheit": {
        "ta": "திருப்தி",
        "prompt_ta": "இருப்பதில் திருப்தியாக இருக்கும் தருணம் எது?",
    },
    "melancholie": {
        "ta": "மனச்சோர்வு",
        "prompt_ta": "அழகான வலியை நீங்கள் உணர்ந்திருக்கிறீர்களா?",
    },
    "nachdenklichkeit": {
        "ta": "சிந்தனை",
        "prompt_ta": "சமீபத்தில் எதைப் பற்றி அதிகமாக யோசிக்கிறீர்கள்?",
    },
    "sehnsucht": {
        "ta": "ஏக்கம்",
        "prompt_ta": "யாரை அல்லது எதை இப்போது ஏங்குகிறீர்கள்?",
    },
    "sensibilitaet": {
        "ta": "உணர்வுமிகுதி",
        "prompt_ta": "நீங்கள் மிகவும் உணர்வுமிகுந்தவர் என்று எப்போது உணர்கிறீர்கள்?",
    },
    "nostalgie": {
        "ta": "கடந்தகால நினைவு",
        "prompt_ta": "எந்த நினைவு உங்கள் மனதில் இனிமையாக தங்கியிருக்கிறது?",
    },
    "offenheit": {
        "ta": "திறந்த மனம்",
        "prompt_ta": "இப்போது நீங்கள் எதற்கு திறந்த மனதுடன் இருக்கிறீர்கள்?",
    },
    "verletzlichkeit": {
        "ta": "பாதிப்புணர்வு",
        "prompt_ta": "கடைசியாக எப்போது உங்களை எளிதில் பாதிக்கக்கூடியவராக உணர்ந்தீர்கள்?",
    },
    "muedigkeit": {
        "ta": "சோர்வு",
        "prompt_ta": "இப்போது உடல் அல்லது மனம் சோர்வாக இருக்கிறதா?",
    },
    "langeweile": {
        "ta": "சலிப்பு",
        "prompt_ta": "சலிப்பு உணரும்போது என்ன செய்கிறீர்கள்?",
    },
    "neutralitaet": {
        "ta": "நடுநிலை",
        "prompt_ta": "இப்போது உங்கள் மனநிலை எப்படி இருக்கிறது?",
    },
    "beduerfnis": {
        "ta": "தேவையுணர்வு",
        "prompt_ta": "இப்போது உங்களுக்கு எந்த ஆதரவு தேவை?",
    },
    "weichheit": {
        "ta": "மென்மையான மனம்",
        "prompt_ta": "யாரிடம் உங்கள் மனம் மிகவும் மென்மையாக இருக்கிறது?",
    },

    # ── Schwere & Tiefe ────────────────────────────────────────────────────
    "traurigkeit": {
        "ta": "துக்கம்",
        "prompt_ta": "உங்களை என்ன வருத்தப்படுத்துகிறது?",
    },
    "einsamkeit": {
        "ta": "தனிமை",
        "prompt_ta": "தனிமையை எப்போது மிகவும் உணர்கிறீர்கள்?",
    },
    "enttaeuschung": {
        "ta": "ஏமாற்றம்",
        "prompt_ta": "சமீபத்தில் என்ன உங்களை ஏமாற்றியது?",
    },
    "hilflosigkeit": {
        "ta": "இயலாமை",
        "prompt_ta": "எப்போது நீங்கள் இயலாமையாக உணர்கிறீர்கள்?",
    },
    "ueberforderung": {
        "ta": "அதிக சுமை",
        "prompt_ta": "இப்போது என்ன உங்களை அதிகமாக அழுத்துகிறது?",
    },
    "ohnmacht": {
        "ta": "சக்தியின்மை",
        "prompt_ta": "நீங்கள் சக்தியற்றவராக உணர்ந்த நேரம் எது?",
    },
    "scham": {
        "ta": "வெட்கம்",
        "prompt_ta": "வெட்கம் என்பது உங்களுக்கு என்னை உணர்த்துகிறது?",
    },
    "schuld": {
        "ta": "குற்றவுணர்வு",
        "prompt_ta": "எதற்காக குற்றவுணர்வு உணர்கிறீர்கள்?",
    },
    "leere": {
        "ta": "வெறுமை",
        "prompt_ta": "வெறுமையை உணரும்போது என்ன செய்கிறீர்கள்?",
    },
    "verlorenheit": {
        "ta": "தொலைந்த உணர்வு",
        "prompt_ta": "வழி தெரியாமல் தடுமாறிய நேரம் எது?",
    },
    "hoffnungslosigkeit": {
        "ta": "நம்பிக்கையின்மை",
        "prompt_ta": "நம்பிக்கை இழந்த நேரத்தில் என்ன உதவியது?",
    },
    "verlassenheit": {
        "ta": "கைவிடப்பட்ட உணர்வு",
        "prompt_ta": "கைவிடப்பட்டதாக உணர்ந்த நேரம் எது?",
    },

    # ── Sturm & Reibung ────────────────────────────────────────────────────
    "wut": {
        "ta": "கோபம்",
        "prompt_ta": "என்ன உங்களை கோபப்படுத்துகிறது?",
    },
    "frustration": {
        "ta": "விரக்தி",
        "prompt_ta": "எப்போது விரக்தி அதிகமாக உணர்கிறீர்கள்?",
    },
    "aerger": {
        "ta": "எரிச்சல்",
        "prompt_ta": "சிறிய விஷயங்கள் உங்களை எரிச்சலடையச் செய்யுமா?",
    },
    "neid": {
        "ta": "பொறாமை",
        "prompt_ta": "யாரிடம் அல்லது எதைப் பார்த்து பொறாமைப்படுகிறீர்கள்?",
    },
    "eifersucht": {
        "ta": "ஊடல்",
        "prompt_ta": "காதல் ஊடல் உணர்வை எப்படி கையாள்கிறீர்கள்?",
    },
    "groll": {
        "ta": "மனக்கசப்பு",
        "prompt_ta": "மனக்கசப்பை மனதில் வைத்திருக்கிறீர்களா?",
    },
    "ungeduld": {
        "ta": "பொறுமையின்மை",
        "prompt_ta": "எதற்காக பொறுமை இழக்கிறீர்கள்?",
    },
    "gereiztheit": {
        "ta": "எரிமலை உணர்வு",
        "prompt_ta": "எப்போது சின்ன விஷயங்களும் பொறுக்காமல் போகிறது?",
    },
    "trotz": {
        "ta": "பிடிவாதம்",
        "prompt_ta": "எதை மறுத்து நிற்கிறீர்கள்?",
    },
    "empoerung": {
        "ta": "ஆவேசம்",
        "prompt_ta": "எது உங்களை ஆவேசப்படுத்துகிறது?",
    },
    "rebellion": {
        "ta": "எதிர்ப்பு",
        "prompt_ta": "எதை மாற்ற வேண்டும் என்று உணர்கிறீர்கள்?",
    },

    # ── Angst & Schutz ─────────────────────────────────────────────────────
    "angst_gefuehl": {
        "ta": "பயம்",
        "prompt_ta": "இப்போது உங்களுக்கு எது பயமாக இருக்கிறது?",
    },
    "sorge": {
        "ta": "கவலை",
        "prompt_ta": "எதைப் பற்றி அதிகமாக கவலைப்படுகிறீர்கள்?",
    },
    "unsicherheit": {
        "ta": "நிச்சயமின்மை",
        "prompt_ta": "எதில் நம்பிக்கையின்மை உணர்கிறீர்கள்?",
    },
    "panik": {
        "ta": "பீதி",
        "prompt_ta": "பீதியான நேரத்தில் என்ன செய்கிறீர்கள்?",
    },
    "nervositaet": {
        "ta": "பதட்டம்",
        "prompt_ta": "எப்போது பதட்டமாக உணர்கிறீர்கள்?",
    },
    "misstrauen": {
        "ta": "சந்தேகம்",
        "prompt_ta": "நம்பிக்கை இல்லாமல் போகும் நேரம் எது?",
    },
    "bedrohung": {
        "ta": "அச்சுறுத்தல்",
        "prompt_ta": "எது உங்களை அச்சுறுத்துவதாக உணர்கிறீர்கள்?",
    },
    "kontrollverlust": {
        "ta": "கட்டுப்பாட்டை இழக்கும் உணர்வு",
        "prompt_ta": "கட்டுப்பாடு இழந்த நேரத்தில் என்ன உதவியது?",
    },
    "ueberwachsamkeit": {
        "ta": "மிகுந்த விழிப்புணர்வு",
        "prompt_ta": "எப்போதும் கவனமாக இருக்க வேண்டும் என்று உணர்கிறீர்களா?",
    },

    # ── Verdeckte Schatten ─────────────────────────────────────────────────
    "resignation": {
        "ta": "விரக்தி துறத்தல்",
        "prompt_ta": "எதை விட்டுக் கொடுத்தீர்கள்?",
    },
    "bitterkeit": {
        "ta": "கசப்பு",
        "prompt_ta": "மனதில் கசப்பான நினைவு தங்கியிருக்கிறதா?",
    },
    "selbstzweifel": {
        "ta": "சுயசந்தேகம்",
        "prompt_ta": "உங்களையே சந்தேகிக்கும் நேரம் எது?",
    },
    "selbstverurteilung": {
        "ta": "சுயகுற்றவுணர்வு",
        "prompt_ta": "உங்களையே குற்றப்படுத்திக்கொள்கிறீர்களா?",
    },
    "verhaertung": {
        "ta": "மனகடினம்",
        "prompt_ta": "எப்போது மனம் கல்லாக மாறுவதாக உணர்கிறீர்கள்?",
    },
    "taubheit": {
        "ta": "உணர்வற்ற நிலை",
        "prompt_ta": "எப்போது எதுவும் உணர முடியாமல் போகிறது?",
    },
    "zynismus": {
        "ta": "நம்பிக்கையற்ற நகை",
        "prompt_ta": "நம்பிக்கை இழந்தது எப்போது தொடங்கியது?",
    },
    "hoffnungsmuedigkeit": {
        "ta": "நம்பிக்கை சோர்வு",
        "prompt_ta": "நம்பிக்கையுடன் இருக்க சோர்வாக இருக்கிறதா?",
    },
}


def inject_tamil(content: str) -> tuple[str, int]:
    """
    Inject Tamil into each emotion block.
    Returns (new_content, count_of_changes).

    Strategy:
    1. Find each emotion by its id field: id: 'freude'
    2. After the last existing language (el: '...'), insert ta: '...'
    3. Inside the prompt object, after el: '...', insert ta: '...'
    """
    changes = 0

    for emotion_id, translations in TAMIL.items():
        ta_word = translations["ta"]
        ta_prompt = translations["prompt_ta"]

        # ── Inject emotion word after el: '...' line ──
        # IMPORTANT: require ", category: '" after the id to match EMOTION objects only,
        # not category objects (which also have id: 'angst' etc. but no category field).
        pattern_word = (
            r"(id: '" + re.escape(emotion_id) + r"', category: '\w+'.*?)"
            r"(el: '[^']*')"
            r"(?!\s*\n\s*ta:)"  # not already there
        )

        def add_ta_word(m):
            nonlocal changes
            changes += 1
            return m.group(1) + m.group(2) + f",\n    ta: '{ta_word}'"

        new_content, n = re.subn(pattern_word, add_ta_word, content, count=1, flags=re.DOTALL)
        if n:
            content = new_content

        # ── Inject Tamil prompt after el prompt line ──
        # Same fix: require ", category: '" to anchor to emotion objects only.
        prompt_pattern = (
            r"(id: '" + re.escape(emotion_id) + r"', category: '\w+'.*?prompt:\s*\{[^}]*?)"
            r"(el: '[^']*')"
            r"(?!\s*\n\s*ta:)"
            r"(\s*\})"
        )

        def add_ta_prompt(m):
            nonlocal changes
            changes += 1
            return (
                m.group(1)
                + m.group(2)
                + f",\n      ta: '{ta_prompt}'"
                + m.group(3)
            )

        new_content, n = re.subn(prompt_pattern, add_ta_prompt, content, count=1, flags=re.DOTALL)
        if n:
            content = new_content

    return content, changes


def add_ta_to_languages(content: str) -> str:
    """Add Tamil to LANGUAGES object."""
    return content.replace(
        "el: { name: 'Ελληνικά',   flag: '🇬🇷' }\n};",
        "el: { name: 'Ελληνικά',   flag: '🇬🇷' },\n  ta: { name: 'தமிழ்',      flag: '🇮🇳' }\n};"
    )


def add_ta_to_categories(content: str) -> str:
    """Add Tamil category names."""
    replacements = [
        ("pl: 'Światło & Przestrzeń',", "pl: 'Światło & Przestrzeń',   ta: 'ஒளி & விரிவு',"),
        ("pl: 'Łagodny Środek',",       "pl: 'Łagodny Środek',         ta: 'மென்மையான நடு',"),
        ("pl: 'Ciężar & Głębia',",      "pl: 'Ciężar & Głębia',        ta: 'கனம் & ஆழம்',"),
        ("pl: 'Burza & Tarcie',",       "pl: 'Burza & Tarcie',         ta: 'புயல் & உராய்வு',"),
        ("pl: 'Lęk & Ochrona',",        "pl: 'Lęk & Ochrona',          ta: 'பயம் & பாதுகாப்பு',"),
        ("pl: 'Ukryte Cienie',",        "pl: 'Ukryte Cienie',          ta: 'மறைந்த நிழல்கள்',"),
    ]
    for old, new in replacements:
        content = content.replace(old, new)
    return content


def main():
    parser = argparse.ArgumentParser(description="Inject Tamil into data.js")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    args = parser.parse_args()

    print(f"Reading {DATA_JS}")
    original = DATA_JS.read_text(encoding="utf-8")

    content = original
    content = add_ta_to_languages(content)
    content = add_ta_to_categories(content)
    content, changes = inject_tamil(content)

    print(f"Changes made: {changes} (expect ~{len(TAMIL) * 2} for {len(TAMIL)} emotions)")

    if args.dry_run:
        # Show a diff snippet
        orig_lines = original.splitlines()
        new_lines = content.splitlines()
        diffs = [(i, o, n) for i, (o, n) in enumerate(zip(orig_lines, new_lines)) if o != n]
        print(f"\nFirst 10 changed lines:")
        for i, old, new in diffs[:10]:
            print(f"  line {i+1}: {old.strip()[:60]}")
            print(f"        → {new.strip()[:60]}")
        new_only = [l for l in new_lines if "ta:" in l and "தமிழ்" not in l][:5]
        print(f"\nSample Tamil injections:")
        for l in new_only:
            print(f"  {l.strip()}")
    else:
        DATA_JS.write_text(content, encoding="utf-8")
        print(f"Written to {DATA_JS}")


if __name__ == "__main__":
    main()
