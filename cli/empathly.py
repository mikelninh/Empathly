#!/usr/bin/env python3
"""
Empathly — Emotion Game CLI
A terminal companion for emotional awareness.
No external dependencies required.
"""

import os
import sys
import json
import random
import datetime
from pathlib import Path

# ─────────────────────────────────────────────
# ANSI COLORS & STYLES
# ─────────────────────────────────────────────

RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
ITALIC = "\033[3m"

# Foreground colors
BLACK   = "\033[30m"
RED     = "\033[31m"
GREEN   = "\033[32m"
YELLOW  = "\033[33m"
BLUE    = "\033[34m"
MAGENTA = "\033[35m"
CYAN    = "\033[36m"
WHITE   = "\033[37m"

# Bright foreground
BRED    = "\033[91m"
BGREEN  = "\033[92m"
BYELLOW = "\033[93m"
BBLUE   = "\033[94m"
BMAGENTA= "\033[95m"
BCYAN   = "\033[96m"
BWHITE  = "\033[97m"

# Background colors
BG_BLACK   = "\033[40m"
BG_RED     = "\033[41m"
BG_GREEN   = "\033[42m"
BG_YELLOW  = "\033[43m"
BG_BLUE    = "\033[44m"
BG_MAGENTA = "\033[45m"
BG_CYAN    = "\033[46m"
BG_WHITE   = "\033[47m"

# Category colors
CAT_COLOR = {
    'licht':    BYELLOW,
    'mitte':    BCYAN,
    'schwere':  DIM + WHITE,
    'sturm':    BRED,
    'angst':    BMAGENTA,
    'schatten': DIM + CYAN,
}

CAT_EMOJI = {
    'licht':    '🌟',
    'mitte':    '🌊',
    'schwere':  '🌑',
    'sturm':    '🔥',
    'angst':    '⚡',
    'schatten': '🌘',
}

CAT_NAME = {
    'licht':    'Light & Expanse',
    'mitte':    'Gentle Middle',
    'schwere':  'Heavy & Deep',
    'sturm':    'Storm & Friction',
    'angst':    'Fear & Protection',
    'schatten': 'Hidden Shadows',
}

# ─────────────────────────────────────────────
# EMOTION DATA (hardcoded subset, 25 emotions)
# ─────────────────────────────────────────────

EMOTIONS = [
    # ── Light & Expanse ──────────────────────
    {
        'id': 'freude', 'category': 'licht', 'emoji': '😊',
        'de': 'Freude', 'en': 'Joy', 'vi': 'Niềm vui', 'el': 'Χαρά',
        'fr': 'Joie', 'es': 'Alegría',
        'prompt': 'When did you last feel real joy?',
    },
    {
        'id': 'dankbarkeit', 'category': 'licht', 'emoji': '🙏',
        'de': 'Dankbarkeit', 'en': 'Gratitude', 'vi': 'Lòng biết ơn', 'el': 'Ευγνωμοσύνη',
        'fr': 'Gratitude', 'es': 'Gratitud',
        'prompt': 'What are you grateful for today?',
    },
    {
        'id': 'frieden', 'category': 'licht', 'emoji': '🕊️',
        'de': 'Frieden', 'en': 'Peace', 'vi': 'Bình an', 'el': 'Ειρήνη',
        'fr': 'Paix', 'es': 'Paz',
        'prompt': 'When did you last feel at peace?',
    },
    {
        'id': 'begeisterung', 'category': 'licht', 'emoji': '✨',
        'de': 'Begeisterung', 'en': 'Enthusiasm', 'vi': 'Hứng khởi', 'el': 'Ενθουσιασμός',
        'fr': 'Enthousiasme', 'es': 'Entusiasmo',
        'prompt': 'What excites you right now?',
    },
    {
        'id': 'liebe', 'category': 'licht', 'emoji': '❤️',
        'de': 'Liebe', 'en': 'Love', 'vi': 'Tình yêu', 'el': 'Αγάπη',
        'fr': 'Amour', 'es': 'Amor',
        'prompt': 'What does love mean to you?',
    },
    {
        'id': 'staunen', 'category': 'licht', 'emoji': '🤩',
        'de': 'Staunen', 'en': 'Wonder', 'vi': 'Ngạc nhiên thích thú', 'el': 'Θαυμασμός',
        'fr': 'Émerveillement', 'es': 'Asombro',
        'prompt': 'What recently filled you with wonder?',
    },
    {
        'id': 'hoffnung', 'category': 'licht', 'emoji': '🌱',
        'de': 'Hoffnung', 'en': 'Hope', 'vi': 'Hy vọng', 'el': 'Ελπίδα',
        'fr': 'Espoir', 'es': 'Esperanza',
        'prompt': 'What are you hoping for right now?',
    },
    {
        'id': 'freiheit', 'category': 'licht', 'emoji': '🦅',
        'de': 'Freiheit', 'en': 'Freedom', 'vi': 'Tự do', 'el': 'Ελευθερία',
        'fr': 'Liberté', 'es': 'Libertad',
        'prompt': 'What does freedom mean to you?',
    },
    # ── Gentle Middle ────────────────────────
    {
        'id': 'zufriedenheit', 'category': 'mitte', 'emoji': '😌',
        'de': 'Zufriedenheit', 'en': 'Contentment', 'vi': 'Hài lòng', 'el': 'Ικανοποίηση',
        'fr': 'Contentement', 'es': 'Satisfacción',
        'prompt': 'When are you content with what is?',
    },
    {
        'id': 'melancholie', 'category': 'mitte', 'emoji': '🌧️',
        'de': 'Melancholie', 'en': 'Melancholy', 'vi': 'Man mác buồn', 'el': 'Μελαγχολία',
        'fr': 'Mélancolie', 'es': 'Melancolía',
        'prompt': 'Is there a beautiful sadness you know?',
    },
    {
        'id': 'sehnsucht', 'category': 'mitte', 'emoji': '🥺',
        'de': 'Sehnsucht', 'en': 'Longing', 'vi': 'Nhớ nhung', 'el': 'Νοσταλγία',
        'fr': 'Nostalgie', 'es': 'Anhelo',
        'prompt': 'Who or what do you long for?',
    },
    {
        'id': 'nostalgie', 'category': 'mitte', 'emoji': '📷',
        'de': 'Nostalgie', 'en': 'Nostalgia', 'vi': 'Hoài niệm', 'el': 'Αναπόληση',
        'fr': 'Nostalgie', 'es': 'Nostalgia',
        'prompt': 'Which memory warms your heart?',
    },
    {
        'id': 'verletzlichkeit', 'category': 'mitte', 'emoji': '🫧',
        'de': 'Verletzlichkeit', 'en': 'Vulnerability', 'vi': 'Dễ tổn thương', 'el': 'Ευαλωτότητα',
        'fr': 'Vulnérabilité', 'es': 'Vulnerabilidad',
        'prompt': 'When did you last show your vulnerability?',
    },
    # ── Heavy & Deep ─────────────────────────
    {
        'id': 'traurigkeit', 'category': 'schwere', 'emoji': '😢',
        'de': 'Traurigkeit', 'en': 'Sadness', 'vi': 'Buồn bã', 'el': 'Θλίψη',
        'fr': 'Tristesse', 'es': 'Tristeza',
        'prompt': 'What sometimes makes you sad?',
    },
    {
        'id': 'einsamkeit', 'category': 'schwere', 'emoji': '🌙',
        'de': 'Einsamkeit', 'en': 'Loneliness', 'vi': 'Cô đơn', 'el': 'Μοναξιά',
        'fr': 'Solitude', 'es': 'Soledad',
        'prompt': 'When do you feel lonely?',
    },
    {
        'id': 'ueberforderung', 'category': 'schwere', 'emoji': '🤯',
        'de': 'Überforderung', 'en': 'Overwhelm', 'vi': 'Quá tải', 'el': 'Υπερφόρτωση',
        'fr': 'Surcharge', 'es': 'Agobio',
        'prompt': 'What overwhelms you sometimes?',
    },
    {
        'id': 'leere', 'category': 'schwere', 'emoji': '🫥',
        'de': 'Leere', 'en': 'Emptiness', 'vi': 'Trống rỗng', 'el': 'Κενό',
        'fr': 'Vide', 'es': 'Vacío',
        'prompt': 'Do you know the feeling of inner emptiness?',
    },
    # ── Storm & Friction ─────────────────────
    {
        'id': 'wut', 'category': 'sturm', 'emoji': '😤',
        'de': 'Wut', 'en': 'Anger', 'vi': 'Tức giận', 'el': 'Θυμός',
        'fr': 'Colère', 'es': 'Ira',
        'prompt': 'What last made you really angry?',
    },
    {
        'id': 'frustration', 'category': 'sturm', 'emoji': '😩',
        'de': 'Frustration', 'en': 'Frustration', 'vi': 'Bực bội', 'el': 'Ματαίωση',
        'fr': 'Frustration', 'es': 'Frustración',
        'prompt': 'What frustrates you right now?',
    },
    {
        'id': 'neid', 'category': 'sturm', 'emoji': '👀',
        'de': 'Neid', 'en': 'Envy', 'vi': 'Ghen tị', 'el': 'Φθόνος',
        'fr': 'Envie', 'es': 'Envidia',
        'prompt': 'Who or what have you been envious of?',
    },
    {
        'id': 'ungeduld', 'category': 'sturm', 'emoji': '⏰',
        'de': 'Ungeduld', 'en': 'Impatience', 'vi': 'Thiếu kiên nhẫn', 'el': 'Ανυπομονησία',
        'fr': 'Impatience', 'es': 'Impaciencia',
        'prompt': 'What makes you lose patience fastest?',
    },
    # ── Fear & Protection ────────────────────
    {
        'id': 'angst', 'category': 'angst', 'emoji': '😰',
        'de': 'Angst', 'en': 'Fear', 'vi': 'Sợ hãi', 'el': 'Φόβος',
        'fr': 'Peur', 'es': 'Miedo',
        'prompt': 'What are you most afraid of right now?',
    },
    {
        'id': 'unsicherheit', 'category': 'angst', 'emoji': '😟',
        'de': 'Unsicherheit', 'en': 'Insecurity', 'vi': 'Bất an', 'el': 'Ανασφάλεια',
        'fr': 'Insécurité', 'es': 'Inseguridad',
        'prompt': 'When do you feel most insecure?',
    },
    {
        'id': 'sorge', 'category': 'angst', 'emoji': '😧',
        'de': 'Sorge', 'en': 'Worry', 'vi': 'Lo lắng', 'el': 'Ανησυχία',
        'fr': 'Inquiétude', 'es': 'Preocupación',
        'prompt': 'What are you worried about lately?',
    },
    # ── Hidden Shadows ───────────────────────
    {
        'id': 'scham', 'category': 'schatten', 'emoji': '😳',
        'de': 'Scham', 'en': 'Shame', 'vi': 'Xấu hổ', 'el': 'Ντροπή',
        'fr': 'Honte', 'es': 'Vergüenza',
        'prompt': 'What shames you — and should it really?',
    },
    {
        'id': 'schuld', 'category': 'schatten', 'emoji': '⚖️',
        'de': 'Schuld', 'en': 'Guilt', 'vi': 'Tội lỗi', 'el': 'Ενοχή',
        'fr': 'Culpabilité', 'es': 'Culpa',
        'prompt': 'Do you carry guilt you could let go of?',
    },
]

JOURNAL_FILE = Path.home() / '.empathly_journal.json'

# ─────────────────────────────────────────────
# UTILITY HELPERS
# ─────────────────────────────────────────────

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def cprint(text, color='', end='\n'):
    print(f"{color}{text}{RESET}", end=end)

def hr(char='─', width=60, color=DIM):
    cprint(char * width, color)

def pause(msg='  Press Enter to continue...'):
    cprint(f'\n{msg}', DIM)
    input()

def cat_color(cat):
    return CAT_COLOR.get(cat, WHITE)

def emotion_label(e, width=16):
    """Return a padded, colored emotion label."""
    col = cat_color(e['category'])
    label = f"{e['emoji']} {e['en']}"
    return f"{col}{BOLD}{label:<{width}}{RESET}"

def wrap(text, width=60, indent='  '):
    """Simple word-wrapper."""
    words = text.split()
    lines, current = [], ''
    for w in words:
        if len(current) + len(w) + 1 <= width:
            current = (current + ' ' + w).lstrip()
        else:
            lines.append(indent + current)
            current = w
    if current:
        lines.append(indent + current)
    return '\n'.join(lines)

# ─────────────────────────────────────────────
# ASCII HEADER
# ─────────────────────────────────────────────

HEADER = rf"""
{BMAGENTA}{BOLD}  _____                       _   _     _
 | ____|_ __ ___  _ __   __ _| |_| |__ | |_   _
 |  _| | '_ ` _ \| '_ \ / _` | __| '_ \| | | | |
 | |___| | | | | | |_) | (_| | |_| | | | | |_| |
 |_____|_| |_| |_| .__/ \__,_|\__|_| |_|_|\__, |
                 |_|                       |___/{RESET}
{CYAN}            Emotional Awareness · Spiel & Reflexion{RESET}
"""

# ─────────────────────────────────────────────
# 1. MEMORY GAME
# ─────────────────────────────────────────────

def memory_game():
    clear()
    cprint(HEADER)
    hr()
    cprint(f'\n  {BYELLOW}{BOLD}MEMORY GAME{RESET}', end='\n\n')
    cprint('  Pick a difficulty:', BOLD)
    cprint('    [1]  Easy    —  6 pairs  (12 cards)', BGREEN)
    cprint('    [2]  Medium  — 12 pairs  (24 cards)', BYELLOW)
    cprint('    [3]  Back to menu', DIM)
    print()

    choice = input('  Your choice: ').strip()
    if choice == '3' or choice == '':
        return
    n_pairs = 6 if choice == '1' else 12

    pool = random.sample(EMOTIONS, n_pairs)
    # Build deck: each emotion appears twice
    deck = []
    for e in pool:
        deck.append(e)
        deck.append(e)
    random.shuffle(deck)

    n = len(deck)
    cols = 4 if n_pairs == 6 else 6
    rows = n // cols

    # State
    revealed  = [False] * n   # permanently matched
    flipped   = []             # up to 2 currently open card indices
    moves     = 0
    matches   = 0

    def render_board():
        clear()
        cprint(HEADER)
        hr()
        cprint(f'\n  {BYELLOW}{BOLD}MEMORY GAME{RESET}  '
               f'{DIM}(pairs: {n_pairs}  moves: {moves}  matches: {matches}/{n_pairs}){RESET}\n')
        for row in range(rows):
            line = '  '
            for col in range(cols):
                idx = row * cols + col
                num = f'{idx+1:>2}'
                if revealed[idx]:
                    # Matched — show emotion name
                    e = deck[idx]
                    col_c = cat_color(e['category'])
                    line += f'{col_c}{BOLD} {e["emoji"]} {e["en"][:10]:<10}{RESET}  '
                elif idx in flipped:
                    # Currently flipped face-up
                    e = deck[idx]
                    col_c = cat_color(e['category'])
                    line += f'{BG_BLUE}{BOLD} {e["emoji"]} {e["en"][:10]:<10}{RESET}  '
                else:
                    # Face down
                    line += f'{DIM}{BG_BLACK}[{num}]{"?"*9}{RESET}  '
            print(line)
        print()

    while matches < n_pairs:
        render_board()

        if len(flipped) == 2:
            # Check for match
            a, b = flipped
            if deck[a]['id'] == deck[b]['id']:
                revealed[a] = True
                revealed[b] = True
                matches += 1
                cprint(f'  {BGREEN}{BOLD}Match! {deck[a]["emoji"]} {deck[a]["en"]}{RESET}', end='')
                if matches == n_pairs:
                    break
            else:
                cprint(f'  {BRED}No match — {deck[a]["en"]} vs {deck[b]["en"]}{RESET}', end='')
            input('  (press Enter)')
            flipped = []
            render_board()

        # Prompt input
        cprint('  Enter card number to flip (or 0 to quit): ', CYAN, end='')
        raw = input().strip()
        if raw == '0':
            cprint('\n  Game aborted.', DIM)
            pause()
            return
        try:
            idx = int(raw) - 1
        except ValueError:
            continue
        if idx < 0 or idx >= n:
            cprint('  Out of range.', BRED)
            continue
        if revealed[idx]:
            cprint('  Already matched!', DIM)
            continue
        if idx in flipped:
            cprint('  Already flipped!', DIM)
            continue
        if len(flipped) >= 2:
            continue

        flipped.append(idx)
        moves += 1

    # Victory screen
    render_board()
    cprint(f'\n  {BGREEN}{BOLD}You matched all {n_pairs} pairs in {moves} moves!{RESET}', end='\n\n')
    rating = 'Excellent!' if moves <= n_pairs + 4 else 'Well done!' if moves <= n_pairs * 2 else 'Keep practising!'
    cprint(f'  {BYELLOW}★  {rating}{RESET}', end='\n\n')
    pause()

# ─────────────────────────────────────────────
# 2. TALK ROUND
# ─────────────────────────────────────────────

def talk_round():
    clear()
    cprint(HEADER)
    hr()
    cprint(f'\n  {BCYAN}{BOLD}TALK ROUND{RESET}', end='\n\n')
    cprint('  A random emotion card and a reflection question.', DIM)
    cprint('  Take a moment. Share if you wish.', DIM)

    while True:
        print()
        e = random.choice(EMOTIONS)
        col = cat_color(e['category'])
        cat_em = CAT_EMOJI.get(e['category'], '')
        cat_nm = CAT_NAME.get(e['category'], '')

        # Card box
        card_w = 50
        cprint(f'  ╔{"═" * card_w}╗', col)
        cprint(f'  ║{" " * card_w}║', col)
        title = f'  {e["emoji"]}  {e["en"]}  /  {e["de"]}'
        cprint(f'  ║  {BOLD}{col}{e["emoji"]}  {e["en"]:^14}  /  {e["de"]:<14}{RESET}{col}   ║', col)
        cprint(f'  ║{" " * card_w}║', col)
        langs = f'  vi: {e["vi"]}   el: {e["el"]}   fr: {e["fr"]}   es: {e["es"]}'
        langs_padded = langs[:card_w - 2].ljust(card_w - 2)
        cprint(f'  ║  {DIM}{langs_padded}{RESET}{col}  ║', col)
        cprint(f'  ║{" " * card_w}║', col)
        cat_line = f'{cat_em} {cat_nm}'.ljust(card_w - 2)
        cprint(f'  ║  {DIM}{cat_line}{RESET}{col}  ║', col)
        cprint(f'  ╚{"═" * card_w}╝', col)

        print()
        cprint(f'  {ITALIC}{BYELLOW}"{e["prompt"]}"{RESET}', end='\n\n')
        hr('·', 56, DIM)
        print()
        cprint('  [Enter] Next card     [q + Enter] Back to menu: ', CYAN, end='')
        raw = input().strip().lower()
        if raw == 'q':
            break

# ─────────────────────────────────────────────
# 3. EMOTION OF THE DAY
# ─────────────────────────────────────────────

def emotion_of_the_day():
    clear()
    cprint(HEADER)
    hr()
    cprint(f'\n  {BMAGENTA}{BOLD}EMOTION OF THE DAY{RESET}', end='\n\n')

    today = datetime.date.today()
    seed  = today.year * 10000 + today.month * 100 + today.day
    rng   = random.Random(seed)
    e     = rng.choice(EMOTIONS)
    col   = cat_color(e['category'])

    cprint(f'  {DIM}Today is {today.strftime("%A, %d %B %Y")}{RESET}', end='\n\n')

    card_w = 52
    cprint(f'  ╔{"═" * card_w}╗', col)
    cprint(f'  ║{" " * card_w}║', col)

    centre = f'{e["emoji"]}  {e["en"]}'
    cprint(f'  ║  {BOLD}{col}{centre:^{card_w - 4}}{RESET}{col}  ║', col)
    cprint(f'  ║{" " * card_w}║', col)

    de_line = f'🇩🇪  {e["de"]}'.ljust(card_w - 2)
    cprint(f'  ║  {de_line} ║', col)
    vi_line = f'🇻🇳  {e["vi"]}'.ljust(card_w - 2)
    cprint(f'  ║  {vi_line} ║', col)
    el_line = f'🇬🇷  {e["el"]}'.ljust(card_w - 2)
    cprint(f'  ║  {el_line} ║', col)
    fr_line = f'🇫🇷  {e["fr"]}'.ljust(card_w - 2)
    cprint(f'  ║  {fr_line} ║', col)
    es_line = f'🇪🇸  {e["es"]}'.ljust(card_w - 2)
    cprint(f'  ║  {es_line} ║', col)

    cprint(f'  ║{" " * card_w}║', col)
    cat_em = CAT_EMOJI.get(e['category'], '')
    cat_nm = CAT_NAME.get(e['category'], '')
    cat_line = f'{cat_em} {cat_nm}'.ljust(card_w - 2)
    cprint(f'  ║  {DIM}{cat_line}{RESET}{col}  ║', col)
    cprint(f'  ╚{"═" * card_w}╝', col)

    print()
    cprint(f'  {ITALIC}{BYELLOW}Today\'s reflection:{RESET}')
    cprint(wrap(f'"{e["prompt"]}"', 58, '  '), BYELLOW)
    print()
    cprint('  Carry this feeling with you today.', DIM)
    pause()

# ─────────────────────────────────────────────
# 4. JOURNAL
# ─────────────────────────────────────────────

def load_journal():
    if JOURNAL_FILE.exists():
        try:
            with open(JOURNAL_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_journal(entries):
    with open(JOURNAL_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

def journal():
    clear()
    cprint(HEADER)
    hr()
    cprint(f'\n  {BGREEN}{BOLD}JOURNAL{RESET}', end='\n\n')

    entries = load_journal()

    # Show last 3 entries
    if entries:
        cprint(f'  {BOLD}Recent entries:{RESET}', end='\n\n')
        recent = entries[-3:][::-1]
        for entry in recent:
            ts = entry.get('timestamp', '?')
            emo = entry.get('emotion_en', '?')
            emo_emoji = entry.get('emotion_emoji', '')
            note = entry.get('note', '')
            cprint(f'  {DIM}{ts}{RESET}  {BCYAN}{emo_emoji} {emo}{RESET}')
            cprint(wrap(note, 56, '    '), ITALIC)
            print()
        hr('·', 56, DIM)
        print()
    else:
        cprint('  No journal entries yet.', DIM)
        print()

    # Pick an emotion
    cprint(f'  {BOLD}Write a new entry{RESET}', end='\n\n')
    cprint('  Choose an emotion by number:', CYAN)
    print()

    for i, e in enumerate(EMOTIONS, 1):
        col = cat_color(e['category'])
        print(f'  {DIM}{i:>2}.{RESET}  {col}{e["emoji"]} {e["en"]:<14}{RESET}  {DIM}/{e["de"]}{RESET}')

    print()
    cprint('  Emotion number (or 0 to cancel): ', CYAN, end='')
    raw = input().strip()
    if raw == '0' or raw == '':
        return
    try:
        idx = int(raw) - 1
        if idx < 0 or idx >= len(EMOTIONS):
            raise ValueError
        chosen = EMOTIONS[idx]
    except ValueError:
        cprint('  Invalid choice.', BRED)
        pause()
        return

    col = cat_color(chosen['category'])
    cprint(f'\n  {col}{BOLD}{chosen["emoji"]}  {chosen["en"]}  /  {chosen["de"]}{RESET}')
    cprint(f'  {ITALIC}{BYELLOW}"{chosen["prompt"]}"{RESET}', end='\n\n')
    cprint('  Write your note (press Enter twice to finish):', DIM)
    print()

    lines = []
    while True:
        line = input('  ')
        if line == '' and lines and lines[-1] == '':
            break
        lines.append(line)

    note = '\n'.join(lines).strip()
    if not note:
        cprint('  Empty note — nothing saved.', DIM)
        pause()
        return

    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    entry = {
        'timestamp':    now,
        'emotion_id':   chosen['id'],
        'emotion_en':   chosen['en'],
        'emotion_de':   chosen['de'],
        'emotion_emoji': chosen['emoji'],
        'note':         note,
    }
    entries.append(entry)
    save_journal(entries)

    cprint(f'\n  {BGREEN}Saved!{RESET}  Entry #{len(entries)} stored in {JOURNAL_FILE}', end='\n\n')
    pause()

# ─────────────────────────────────────────────
# EMOTION DETECTIVE
# ─────────────────────────────────────────────

DETECTIVE_SCENARIOS = [
    {
        'id': 'sc_promotion',
        'difficulty': 'easy',
        'situation': 'Lea gets the promotion she has worked toward for two years. But she tells no one — not even her family.',
        'options': ['Joy', 'Shame', 'Loneliness', 'Gratitude', 'Fear', 'Excitement'],
        'hidden': 'Shame',
        'hidden_idx': 1,
        'insight': 'When achievement falls silent, shame is often there. The question "Do I really deserve this?" can be louder than the joy.',
    },
    {
        'id': 'sc_cold',
        'difficulty': 'easy',
        'situation': "Marco does not come to his best friend's birthday party. He says he is sick. Afterwards he becomes quiet and withdraws.",
        'options': ['Guilt', 'Sadness', 'Shame', 'Fear', 'Loneliness', 'Anger'],
        'hidden': 'Shame',
        'hidden_idx': 2,
        'insight': 'Withdrawal after a mistake is often shame — not indifference. Those who hide usually do so because they feel bad, not because they do not care.',
    },
    {
        'id': 'sc_anger_home',
        'difficulty': 'medium',
        'situation': 'Selin comes home from work and explodes over a small misunderstanding with her partner. Later she cries alone in the kitchen.',
        'options': ['Anger', 'Frustration', 'Overwhelm', 'Loneliness', 'Shame', 'Sadness'],
        'hidden': 'Overwhelm',
        'hidden_idx': 2,
        'insight': 'Anger that comes from nowhere is often overwhelm in disguise. The body says "I cannot take any more" — and the mouth says "you always do this."',
    },
    {
        'id': 'sc_perfect',
        'difficulty': 'medium',
        'situation': 'Jonas does everything perfectly. His home is spotless, his work impeccable, his Instagram profile radiant. He has slept badly for months.',
        'options': ['Excitement', 'Fear', 'Overwhelm', 'Emptiness', 'Shame', 'Loneliness'],
        'hidden': 'Fear',
        'hidden_idx': 1,
        'insight': 'Perfectionism is almost always fear — the fear that if you stop performing, no one will stay.',
    },
    {
        'id': 'sc_dismissive',
        'difficulty': 'medium',
        'situation': 'When her children call, Marta always says: "I\'m fine, don\'t worry." She says this even when she is crying.',
        'options': ['Loneliness', 'Sadness', 'Excitement', 'Vulnerability', 'Overwhelm', 'Longing'],
        'hidden': 'Vulnerability',
        'hidden_idx': 3,
        'insight': 'Those who say "I\'m fine" and don\'t mean it often long most for someone to ask: "Are you sure?"',
    },
    {
        'id': 'sc_avoiding',
        'difficulty': 'hard',
        'situation': "Tariq keeps busy. He works 12-hour days, fills every weekend with plans, never sits still. He hasn't been bored in three years.",
        'options': ['Ambition', 'Fear', 'Anxiety', 'Grief', 'Emptiness', 'Excitement'],
        'hidden': 'Grief',
        'hidden_idx': 3,
        'insight': 'Constant busyness is often unprocessed grief. Stillness would mean feeling what he is running from.',
    },
    {
        'id': 'sc_critic',
        'difficulty': 'hard',
        'situation': "Whenever someone shares good news, Nina finds a problem with it. She's the first to point out what could go wrong.",
        'options': ['Cynicism', 'Envy', 'Sadness', 'Fear', 'Anger', 'Shame'],
        'hidden': 'Envy',
        'hidden_idx': 1,
        'insight': "Compulsive criticism of others' joy is often envy that has nowhere to go. It hurts to see others have what you want.",
    },
    {
        'id': 'sc_helper',
        'difficulty': 'hard',
        'situation': 'Carlos never says no. He helps everyone, even when exhausted. He feels guilty if he takes time for himself.',
        'options': ['Kindness', 'Fear', 'Guilt', 'Loneliness', 'Shame', 'Love'],
        'hidden': 'Fear',
        'hidden_idx': 1,
        'insight': "Compulsive helping often comes from fear — fear that you are only lovable when you are useful. Rest feels like a risk.",
    },
]

RANKS = [
    (0,  2, '🔍 Novice',       CYAN),
    (3,  4, '🕵️  Apprentice',   BGREEN),
    (5,  6, '🧠 Detective',     BYELLOW),
    (7,  7, '💡 Soul Master',   BMAGENTA),
]

def detective_rank(score):
    for lo, hi, label, color in RANKS:
        if lo <= score <= hi:
            return label, color
    return RANKS[-1][2], RANKS[-1][3]

def emotion_detective():
    clear()
    cprint(f'\n  {BOLD}🔍 Emotion Detective{RESET}')
    cprint(f'  {DIM}Read the scenario. What is the REAL feeling hiding beneath the surface?{RESET}\n')
    hr()

    scenarios = random.sample(DETECTIVE_SCENARIOS, min(5, len(DETECTIVE_SCENARIOS)))
    score = 0
    total = len(scenarios)

    for i, sc in enumerate(scenarios, 1):
        clear()
        diff_color = BGREEN if sc['difficulty'] == 'easy' else BYELLOW if sc['difficulty'] == 'medium' else BRED
        cprint(f'\n  {DIM}Question {i}/{total}  ·  {diff_color}{sc["difficulty"].upper()}{RESET}\n')

        # Scenario box
        width = 60
        cprint(f'  ╔{"═" * width}╗')
        words = sc['situation'].split()
        line = ''
        for word in words:
            if len(line) + len(word) + 1 > width - 2:
                cprint(f'  ║  {line:<{width-4}}  ║')
                line = word
            else:
                line = (line + ' ' + word).strip()
        if line:
            cprint(f'  ║  {line:<{width-4}}  ║')
        cprint(f'  ╚{"═" * width}╝\n')

        cprint(f'  {BOLD}What is the hidden emotion?{RESET}\n')
        for j, opt in enumerate(sc['options'], 1):
            cprint(f'    {DIM}[{j}]{RESET}  {opt}')

        print()
        cprint('  Your answer (1–6): ', CYAN, end='')
        try:
            ans = input().strip()
            chosen = int(ans) - 1
            if 0 <= chosen < len(sc['options']):
                chosen_name = sc['options'][chosen]
                if chosen_name == sc['hidden']:
                    score += 1
                    cprint(f'\n  {BGREEN}✓ Correct!{RESET}  {sc["hidden"]} is the hidden emotion.\n')
                else:
                    cprint(f'\n  {BRED}✗ Not quite.{RESET}  The hidden emotion was {BOLD}{sc["hidden"]}{RESET}.\n')
            else:
                cprint(f'\n  {DIM}Invalid choice. The answer was {sc["hidden"]}.{RESET}\n')
        except (ValueError, EOFError):
            cprint(f'\n  {DIM}Skipped. The answer was {sc["hidden"]}.{RESET}\n')

        # Insight
        cprint(f'  {ITALIC}{DIM}💡 {sc["insight"]}{RESET}\n')
        pause()

    # Results
    clear()
    rank_label, rank_color = detective_rank(score)
    cprint(f'\n  {BOLD}🔍 Detective Results{RESET}\n')
    hr()
    cprint(f'\n  Score: {BOLD}{score}/{total}{RESET}')
    cprint(f'  Rank:  {rank_color}{BOLD}{rank_label}{RESET}\n')

    if score == total:
        cprint(f'  {BMAGENTA}Perfect. You see what others miss.{RESET}')
    elif score >= total * 0.6:
        cprint(f'  {BGREEN}Strong emotional reading. Keep going.{RESET}')
    else:
        cprint(f'  {DIM}Every emotion is a puzzle. You\'ll get sharper.{RESET}')

    print()
    pause()


# ─────────────────────────────────────────────
# MAIN MENU
# ─────────────────────────────────────────────

def main_menu():
    while True:
        clear()
        cprint(HEADER)
        hr()
        print()
        cprint('  What would you like to do?', BOLD)
        print()
        cprint('    [1]  Memory Game          — flip cards, find pairs',  BGREEN)
        cprint('    [2]  Talk Round           — reflect on a random emotion', BCYAN)
        cprint('    [3]  Emotion of the Day   — today\'s seed-picked feeling', BMAGENTA)
        cprint('    [4]  Journal              — write a note, tag an emotion', BYELLOW)
        cprint('    [5]  🔍 Emotion Detective  — find the hidden feeling', BRED)
        cprint('    [6]  Quit', DIM)
        print()
        hr()
        cprint('  Your choice: ', CYAN, end='')
        choice = input().strip()

        if choice == '1':
            memory_game()
        elif choice == '2':
            talk_round()
        elif choice == '3':
            emotion_of_the_day()
        elif choice == '4':
            journal()
        elif choice == '5':
            emotion_detective()
        elif choice == '6' or choice.lower() in ('q', 'quit', 'exit'):
            clear()
            cprint(f'\n  {BMAGENTA}Take care of your feelings. See you next time!{RESET}\n')
            break
        else:
            cprint('  Please enter 1–6.', DIM)
            import time; time.sleep(0.8)

# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == '__main__':
    try:
        main_menu()
    except KeyboardInterrupt:
        cprint(f'\n\n  {DIM}Interrupted. Goodbye!{RESET}\n')
        sys.exit(0)
