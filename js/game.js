/**
 * Gefühle-Memory — Game Engine
 * Classic memory + Talk + Story + Check-in + Emotion Wheel modes
 * Bilingual card matching with 67 emotions in 6 categories
 * Features: Audio pronunciation, Dark mode, Star rating, Multiplayer
 * UI: Landing screen with mode grid, collapsible settings, back navigation
 */

(function () {
  'use strict';

  /* ---- Constants ---- */
  const PLAYER_COLORS = ['#F6C344', '#7BAFD4', '#E74C3C', '#8E44AD'];
  const LANG_SPEECH_MAP = { de: 'de-DE', vi: 'vi-VN', en: 'en-GB', tr: 'tr-TR', ar: 'ar-SA', es: 'es-ES', fr: 'fr-FR', uk: 'uk-UA', pl: 'pl-PL', el: 'el-GR' };

  /* ---- State ---- */
  let state = {
    lang1: 'en',
    lang2: 'el',
    uiLang: 'en',
    mode: 'classic',
    category: 'all',
    difficulty: 'medium',
    cards: [],
    flipped: [],
    matched: new Set(),
    moves: 0,
    pairsFound: 0,
    totalPairs: 0,
    timerStart: null,
    timerInterval: null,
    locked: false,
    peeking: false,
    checkinSelections: {},
    // Dark mode
    darkMode: false,
    // Multiplayer
    playerCount: 1,
    currentPlayer: 0,
    playerNames: [],
    playerScores: [],
    multiplayerStarted: false,
    // Landing
    showLanding: true
  };

  /* ---- DOM ---- */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const dom = {};

  function cacheDom() {
    dom.board = $('.board');
    dom.moves = $('#stat-moves');
    dom.pairs = $('#stat-pairs');
    dom.time = $('#stat-time');
    dom.title = $('.header h1');
    dom.subtitle = $('.header .subtitle');
    dom.promptOverlay = $('.prompt-overlay');
    dom.promptEmoji = $('.prompt-emoji');
    dom.promptWordPrimary = $('.prompt-word-primary');
    dom.promptWordSecondary = $('.prompt-word-secondary');
    dom.promptLabel = $('.prompt-label');
    dom.promptQuestion = $('.prompt-question');
    dom.promptClose = $('.prompt-close');
    dom.promptShare = $('.prompt-share');
    dom.promptCulture = $('.prompt-culture');
    dom.congratsOverlay = $('.congrats-overlay');
    dom.congratsTitle = $('.congrats-title');
    dom.congratsText = $('.congrats-text');
    dom.congratsStats = $('.congrats-stats');
    dom.congratsStars = $('.congrats-stars');
    dom.congratsBest = $('.congrats-best');
    dom.congratsScoreboard = $('.congrats-scoreboard');
    dom.talkMode = $('.talk-mode');
    dom.storyMode = $('.story-mode');
    dom.checkinMode = $('.checkin-mode');
    dom.wheelMode = $('.wheel-mode');
    dom.statsBar = $('.stats');
    // Landing settings bar selects
    dom.lang1Select = $('#lang1');
    dom.lang2Select = $('#lang2');
    dom.categorySelect = $('#category');
    dom.difficultySelect = $('#difficulty');
    // Active mode selects (duplicated in active container)
    dom.difficultySelectActive = $('#difficulty-active');
    dom.categorySelectActive = $('#category-active');
    dom.playerCountSelectActive = $('#player-count-active');
    dom.newGameBtn = $('#btn-new-game');
    dom.controlsRow2 = $('.controls-row-2');
    dom.darkModeBtn = $('#btn-dark-mode');
    dom.playerCountSelect = $('#player-count');
    dom.playerSetup = $('#player-setup');
    dom.turnIndicator = $('#turn-indicator');
    dom.passOverlay = $('#pass-overlay');
    dom.journalMode = $('.journal-mode');
    dom.learnMode = $('.learn-mode');
    dom.askMode = $('.ask-mode');
    dom.settingsBtn = $('#btn-settings');
    // Landing & navigation
    dom.landingScreen = $('#landing-screen');
    dom.activeModeContainer = $('#active-mode-container');
    dom.backBtn = $('#btn-back');
    dom.settingsBar = $('#settings-bar');
    dom.settingsBarToggle = $('#settings-bar-toggle');
    dom.settingsBarContent = $('#settings-bar-content');
    dom.settingsSummaryText = $('#settings-summary-text');
    dom.modeCards = $$('.mode-card');
    // Legacy: still need modeTabs reference for updateUIText
    dom.modeTabs = [];
  }

  /* ---- Helpers ---- */
  function t(key) { return (UI_TEXT[state.uiLang] || UI_TEXT.de)[key] || key; }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function getCategoryColor(catId) {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : '#F6C344';
  }

  function getCategoryColorLight(catId) {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.colorLight : '#FEF3D0';
  }

  function getDifficulty() {
    return DIFFICULTIES.find(d => d.id === state.difficulty) || DIFFICULTIES[2];
  }

  function getEmotions() {
    const diff = getDifficulty();
    let pool = EMOTIONS;
    if (state.category !== 'all') {
      pool = pool.filter(e => e.category === state.category);
    } else if (diff.categories) {
      pool = pool.filter(e => diff.categories.includes(e.category));
    }
    return pool;
  }

  /* ---- Audio Pronunciation ---- */
  let voiceCache = {};

  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    Object.entries(LANG_SPEECH_MAP).forEach(([key, langTag]) => {
      const prefix = langTag.split('-')[0];
      const exact = voices.find(v => v.lang === langTag);
      const prefixMatch = voices.find(v => v.lang.startsWith(prefix + '-'));
      const loose = voices.find(v => v.lang.startsWith(prefix));
      voiceCache[key] = exact || prefixMatch || loose || null;
    });
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  function speakWord(word, lang) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = LANG_SPEECH_MAP[lang] || 'de-DE';
    const voice = voiceCache[lang];
    if (voice) utter.voice = voice;
    utter.rate = 0.8;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  }
  window.gefuhleSpeakWord = speakWord;

  function makeSpeakButton(word, lang, extraClass) {
    return `<button class="speak-btn ${extraClass || ''}" data-speak-word="${word}" data-speak-lang="${lang}" title="${t('speak')}">🔊</button>`;
  }

  /* ---- Dark Mode ---- */
  function initDarkMode() {
    const saved = localStorage.getItem('gefuehle-dark-mode');
    if (saved !== null) {
      state.darkMode = saved === 'true';
    } else {
      state.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyDarkMode();
  }

  function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    localStorage.setItem('gefuehle-dark-mode', state.darkMode);
    applyDarkMode();
  }

  function applyDarkMode() {
    document.body.classList.toggle('dark-mode', state.darkMode);
    document.body.classList.toggle('light-mode', !state.darkMode);
    dom.darkModeBtn.textContent = state.darkMode ? '☀️' : '🌙';
    dom.darkModeBtn.title = t('darkMode');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = state.darkMode ? '#1A1714' : '#FFF8F0';
  }

  /* ---- Star Rating ---- */
  function calculateStars(moves, totalPairs) {
    if (moves <= totalPairs * 2) return 3;
    if (moves <= totalPairs * 3) return 2;
    return 1;
  }

  function getStarStorageKey() {
    return `gefuehle-stars-${state.difficulty}-${state.category}`;
  }

  function saveBestStars(stars) {
    const key = getStarStorageKey();
    const prev = parseInt(localStorage.getItem(key)) || 0;
    if (stars > prev) {
      localStorage.setItem(key, stars);
      return true;
    }
    return false;
  }

  function renderStars(container, starCount) {
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = `congrats-star ${i < starCount ? 'earned' : 'empty'}`;
      span.textContent = '★';
      container.appendChild(span);
    }
  }

  /* ---- Landing / Navigation ---- */
  function showLanding() {
    state.showLanding = true;
    document.body.classList.add('show-landing');
    clearInterval(state.timerInterval);
    updateSettingsSummary();
    renderStreakCard();
    renderWeeklyRecap();
  }

  function hideLanding() {
    state.showLanding = false;
    const ls = document.getElementById('landing-screen');
    if (ls) ls.classList.add('landing-exiting');
    setTimeout(() => {
      document.body.classList.remove('show-landing');
      if (ls) ls.classList.remove('landing-exiting');
    }, 220);
  }

  function updateSettingsSummary() {
    const lang1 = LANGUAGES[state.lang1];
    const lang2 = LANGUAGES[state.lang2];
    const diff = getDifficulty();
    const diffLabel = diff[state.uiLang] || diff.de;
    const diffEmoji = diff.emoji;
    dom.settingsSummaryText.textContent =
      `${lang1.flag} ${lang1.name} ↔ ${lang2.flag} ${lang2.name} · ${diffEmoji} ${diffLabel}`;
  }

  /* ---- Mode card descriptions (localized) ---- */
  const MODE_CARD_DATA = {
    classic: {
      icon: '🃏',
      name: { de: 'Klassisch', vi: 'Cổ điển', en: 'Classic' },
      desc: { de: 'Finde passende Paare', vi: 'Tìm các cặp phù hợp', en: 'Find matching pairs' }
    },
    talk: {
      icon: '💬',
      name: { de: 'Gesprächsrunde', vi: 'Trò chuyện', en: 'Talk Round' },
      desc: { de: 'Zieh Karten & sprich', vi: 'Rút thẻ & chia sẻ', en: 'Draw cards & talk' }
    },
    story: {
      icon: '📖',
      name: { de: 'Geschichten', vi: 'Kể chuyện', en: 'Stories' },
      desc: { de: 'Erzähle eine Geschichte', vi: 'Kể một câu chuyện', en: 'Tell a story' }
    },
    wheel: {
      icon: '🎡',
      name: { de: 'Emotions-Rad', vi: 'Vòng cảm xúc', en: 'Emotion Wheel' },
      desc: { de: 'Alle 67 Gefühle erkunden', vi: 'Khám phá 67 cảm xúc', en: 'Explore all 67 emotions' }
    },
    checkin: {
      icon: '🌿',
      name: { de: 'Check-in', vi: 'Tự vấn', en: 'Check-in' },
      desc: { de: 'Was brauchst du heute?', vi: 'Hôm nay bạn cần gì?', en: 'What do you need today?' }
    },
    learn: {
      icon: '🧠',
      name: { de: 'Karteikarten', vi: 'Thẻ ghi nhớ', en: 'Flashcards' },
      desc: { de: 'Vokabeln mit Wiederholung', vi: 'Từ vựng lặp lại', en: 'Vocabulary with repetition' }
    },
    journal: {
      icon: '📓',
      name: { de: 'Journal', vi: 'Nhật ký', en: 'Journal', el: 'Ημερολόγιο' },
      desc: { de: 'Tägliche Reflexion', vi: 'Suy ngẫm hàng ngày', en: 'Daily reflection', el: 'Καθημερινός στοχασμός' }
    },
    ask: {
      icon: '💬',
      name: { de: 'Frag die App', vi: 'Hỏi ứng dụng', en: 'Ask the App', el: 'Ρώτα την εφαρμογή' },
      desc: { de: 'Stell eine Frage', vi: 'Đặt một câu hỏi', en: 'Ask a question', el: 'Κάνε μια ερώτηση' }
    }
  };

  const MODE_GROUPS = {
    de: { spielen: 'Spielen', entdecken: 'Entdecken', lernen: 'Lernen' },
    vi: { spielen: 'Chơi', entdecken: 'Khám phá', lernen: 'Học' },
    en: { spielen: 'Play', entdecken: 'Discover', lernen: 'Learn' },
    el: { spielen: 'Παίξε', entdecken: 'Ανακάλυψε', lernen: 'Μάθε' }
  };

  function updateModeCards() {
    const lang = state.uiLang;
    dom.modeCards.forEach(card => {
      const mode = card.dataset.mode;
      const data = MODE_CARD_DATA[mode];
      if (!data) return;
      const iconEl = card.querySelector('.mode-card-icon');
      const nameEl = card.querySelector('.mode-card-name');
      const descEl = card.querySelector('.mode-card-desc');
      if (iconEl) iconEl.textContent = data.icon;
      if (nameEl) nameEl.textContent = data.name[lang] || data.name.en;
      if (descEl) descEl.textContent = data.desc[lang] || data.desc.en;
    });

    // Update group labels
    const groups = MODE_GROUPS[lang] || MODE_GROUPS.en;
    const labels = $$('.mode-group-label');
    if (labels[0]) labels[0].textContent = groups.spielen;
    if (labels[1]) labels[1].textContent = groups.entdecken;
    if (labels[2]) labels[2].textContent = groups.lernen;

    // Update landing hero
    const heroTitle = $('.landing-title');
    const heroSubtitle = $('.landing-subtitle');
    if (heroTitle) heroTitle.textContent = t('title');
    if (heroSubtitle) {
      heroSubtitle.textContent = lang === 'de' ? '67 Gefühle · 6 Kategorien · 11 Sprachen'
        : lang === 'vi' ? '67 cảm xúc · 6 loại · 11 ngôn ngữ'
        : lang === 'el' ? '67 συναισθήματα · 6 κατηγορίες · 11 γλώσσες'
        : '67 emotions · 6 categories · 11 languages';
    }
  }

  /* ---- UI text updates ---- */
  function updateUIText() {
    dom.title.textContent = t('title');
    dom.subtitle.textContent = t('subtitle');
    dom.newGameBtn.title = t('newGame');

    // Back button text
    dom.backBtn.textContent = '← ' + (state.uiLang === 'de' ? 'Zurück' : state.uiLang === 'vi' ? 'Quay lại' : 'Back');

    // Category select (landing)
    const catSelect = dom.categorySelect;
    catSelect.innerHTML = `<option value="all">${t('allCategories')}</option>`;
    CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.emoji} ${cat[state.uiLang] || cat.de}`;
      catSelect.appendChild(opt);
    });
    catSelect.value = state.category;

    // Category select (active mode)
    if (dom.categorySelectActive) {
      dom.categorySelectActive.innerHTML = catSelect.innerHTML;
      dom.categorySelectActive.value = state.category;
    }

    // Difficulty select (landing)
    const diffSelect = dom.difficultySelect;
    diffSelect.innerHTML = '';
    DIFFICULTIES.forEach(diff => {
      const opt = document.createElement('option');
      opt.value = diff.id;
      opt.textContent = `${diff.emoji} ${diff[state.uiLang] || diff.de}`;
      opt.title = diff.desc[state.uiLang] || diff.desc.de;
      diffSelect.appendChild(opt);
    });
    diffSelect.value = state.difficulty;

    // Difficulty select (active mode)
    if (dom.difficultySelectActive) {
      dom.difficultySelectActive.innerHTML = diffSelect.innerHTML;
      dom.difficultySelectActive.value = state.difficulty;
    }

    // Player count select (landing)
    const pcSelect = dom.playerCountSelect;
    const opts = pcSelect.options;
    opts[0].textContent = t('solo');
    for (let i = 1; i < opts.length; i++) {
      opts[i].textContent = `${i + 1} ${t('player')}`;
    }

    // Player count select (active)
    if (dom.playerCountSelectActive) {
      const aOpts = dom.playerCountSelectActive.options;
      aOpts[0].textContent = t('solo');
      for (let i = 1; i < aOpts.length; i++) {
        aOpts[i].textContent = `${i + 1} ${t('player')}`;
      }
      dom.playerCountSelectActive.value = String(state.playerCount);
    }

    // Language flag labels
    const flag1El = $('#flag1');
    const flag2El = $('#flag2');
    if (flag1El) flag1El.textContent = LANGUAGES[state.lang1]?.flag || '';
    if (flag2El) flag2El.textContent = LANGUAGES[state.lang2]?.flag || '';

    updateModeCards();
    updateSettingsSummary();
  }

  /* ---- Card rendering ---- */
  function buildDeck() {
    const pool = getEmotions();
    const diff = getDifficulty();
    const maxPairs = diff.pairs || 12;
    const subset = shuffle(pool).slice(0, Math.min(pool.length, maxPairs));
    const cards = [];
    subset.forEach(emo => {
      cards.push({
        emotionId: emo.id, lang: state.lang1,
        word: emo[state.lang1], emoji: emo.emoji,
        color: getCategoryColor(emo.category),
        colorLight: getCategoryColorLight(emo.category),
        emotion: emo
      });
      cards.push({
        emotionId: emo.id, lang: state.lang2,
        word: emo[state.lang2], emoji: emo.emoji,
        color: getCategoryColor(emo.category),
        colorLight: getCategoryColorLight(emo.category),
        emotion: emo
      });
    });
    return shuffle(cards);
  }

  function renderCard(card, index) {
    const flag = LANGUAGES[card.lang]?.flag || '';
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.index = index;
    el.style.setProperty('--emotion-color', card.color);
    el.style.animationDelay = `${Math.min(index * 0.025, 0.5)}s`;
    const hasCulture = (typeof hasCultureNote === 'function') && hasCultureNote(card.emotionId);
    const artSvg = (typeof CardArt !== 'undefined') ? CardArt.generateCardArt(card.emotionId, card.emotion.category) : '';
    el.innerHTML = `
      <div class="card-face card-back">
        <div class="card-back-pattern"></div>
      </div>
      <div class="card-face card-front" style="border-top: 3px solid ${card.color}">
        ${artSvg ? `<div class="card-art-bg">${artSvg}</div>` : ''}
        <span class="card-lang-badge">${flag}</span>
        ${hasCulture ? '<span class="card-culture-badge" title="Kulturbrücke">🌍</span>' : ''}
        <span class="card-emoji">${card.emoji}</span>
        <span class="card-word">${card.word}</span>
        <button class="card-speak-btn" title="${t('speak')}">🔊</button>
      </div>`;
    el.addEventListener('click', (e) => {
      if (e.target.closest('.card-speak-btn')) {
        e.stopPropagation();
        speakWord(card.word, card.lang);
        return;
      }
      onCardClick(index);
    });
    return el;
  }

  /* ---- Multiplayer ---- */
  function isMultiplayer() {
    return state.playerCount > 1;
  }

  function showPlayerSetup() {
    const container = dom.playerSetup;
    let html = `<p style="font-size:.95rem;color:var(--text-soft)">${t('enterNames')}</p>`;
    for (let i = 0; i < state.playerCount; i++) {
      const defaultName = `${t('player')} ${i + 1}`;
      html += `<input type="text" class="player-name-input" data-player="${i}" placeholder="${defaultName}" value="${state.playerNames[i] || ''}" maxlength="20">`;
    }
    html += `<button class="btn btn-primary" id="btn-start-multi">${t('startGame')}</button>`;
    container.innerHTML = html;
    container.classList.add('active');

    $('#btn-start-multi').addEventListener('click', () => {
      $$('.player-name-input', container).forEach(input => {
        const idx = parseInt(input.dataset.player);
        state.playerNames[idx] = input.value.trim() || `${t('player')} ${idx + 1}`;
      });
      state.multiplayerStarted = true;
      container.classList.remove('active');
      startClassicGame();
    });

    const firstInput = $('.player-name-input', container);
    if (firstInput) firstInput.focus();
  }

  function updateTurnIndicator() {
    if (!isMultiplayer()) {
      dom.turnIndicator.classList.remove('active');
      return;
    }
    dom.turnIndicator.classList.add('active');
    let html = '';
    for (let i = 0; i < state.playerCount; i++) {
      const isCurrent = i === state.currentPlayer;
      html += `
        <div class="player-badge ${isCurrent ? 'current' : ''}" style="--player-color:${PLAYER_COLORS[i]}">
          <span class="player-dot"></span>
          <span>${state.playerNames[i] || (t('player') + ' ' + (i + 1))}</span>
          <span class="player-score">${state.playerScores[i] || 0}</span>
        </div>`;
    }
    dom.turnIndicator.innerHTML = html;
  }

  function advanceTurn() {
    state.currentPlayer = (state.currentPlayer + 1) % state.playerCount;
    updateTurnIndicator();
    showPassOverlay();
  }

  function showPassOverlay() {
    const name = state.playerNames[state.currentPlayer] || (t('player') + ' ' + (state.currentPlayer + 1));
    const card = $('.pass-card', dom.passOverlay);
    card.innerHTML = `
      <div class="pass-name" style="color:${PLAYER_COLORS[state.currentPlayer]}">${t('playerTurn').replace('{name}', name)}</div>
      <div class="pass-hint">${t('tapToContinue')}</div>`;
    dom.passOverlay.classList.add('visible');
    const dismiss = () => {
      dom.passOverlay.classList.remove('visible');
      dom.passOverlay.removeEventListener('click', dismiss);
    };
    setTimeout(() => dom.passOverlay.addEventListener('click', dismiss), 100);
  }

  /* ---- Classic game logic ---- */
  function startGame() {
    clearInterval(state.timerInterval);
    state.flipped = [];
    state.matched = new Set();
    state.moves = 0;
    state.pairsFound = 0;
    state.timerStart = null;
    state.timerInterval = null;
    state.locked = false;

    // Show/hide sections
    const isClassic = state.mode === 'classic';
    const isTalk = state.mode === 'talk';
    const isStory = state.mode === 'story';
    const isCheckin = state.mode === 'checkin';
    const isWheel = state.mode === 'wheel';
    const isJournal = state.mode === 'journal';
    const isLearn = state.mode === 'learn';
    const isAsk = state.mode === 'ask';

    dom.board.style.display = isClassic ? '' : 'none';
    dom.statsBar.style.display = isClassic ? '' : 'none';
    dom.controlsRow2.style.display = (isCheckin || isWheel || isJournal || isLearn || isAsk) ? 'none' : '';
    dom.talkMode.classList.toggle('active', isTalk);
    dom.storyMode.classList.toggle('active', isStory);
    dom.checkinMode.classList.toggle('active', isCheckin);
    dom.wheelMode.classList.toggle('active', isWheel);
    dom.journalMode.classList.toggle('active', isJournal);
    if (dom.learnMode) dom.learnMode.classList.toggle('active', isLearn);
    if (dom.askMode) dom.askMode.classList.toggle('active', isAsk);
    dom.turnIndicator.classList.remove('active');
    dom.playerSetup.classList.remove('active');

    if (isClassic) {
      if (isMultiplayer() && !state.multiplayerStarted) {
        dom.board.style.display = 'none';
        dom.statsBar.style.display = 'none';
        showPlayerSetup();
        return;
      }
      startClassicGame();
    }
    if (isTalk) initTalkMode();
    if (isStory) initStoryMode();
    if (isCheckin) initCheckinMode();
    if (isWheel) initWheelMode();
    if (isJournal) initJournalMode();
    if (isLearn && window.initLearnMode) window.initLearnMode();
    if (isAsk) initAskMode();
  }

  function startClassicGame() {
    state.currentPlayer = 0;
    state.playerScores = new Array(state.playerCount).fill(0);

    state.cards = buildDeck();
    state.totalPairs = state.cards.length / 2;
    state.peeking = false;

    dom.board.style.display = '';
    dom.statsBar.style.display = '';
    updateStats();
    dom.time.textContent = '0:00';
    dom.board.innerHTML = '';
    state.cards.forEach((card, i) => dom.board.appendChild(renderCard(card, i)));

    if (isMultiplayer()) {
      updateTurnIndicator();
    }

    const diff = getDifficulty();
    if (diff.peekSeconds > 0) {
      state.peeking = true;
      state.locked = true;
      const allCards = $$('.card', dom.board);
      allCards.forEach(c => c.classList.add('flipped'));
      setTimeout(() => {
        allCards.forEach(c => { if (!state.matched.has(+c.dataset.index)) c.classList.remove('flipped'); });
        state.peeking = false;
        state.locked = false;
      }, diff.peekSeconds * 1000);
    }
  }

  function onCardClick(index) {
    if (state.flipped.includes(index) || state.matched.has(index)) {
      const card = state.cards[index];
      if (card) showCardHint(card);
      return;
    }
    if (state.locked || state.flipped.length >= 2) return;
    if (!state.timerStart) {
      state.timerStart = Date.now();
      state.timerInterval = setInterval(updateTimer, 500);
    }
    $(`.card[data-index="${index}"]`, dom.board).classList.add('flipped');
    state.flipped.push(index);
    if (state.flipped.length === 2) { state.moves++; updateStats(); checkMatch(); }
  }

  function checkMatch() {
    const [i, j] = state.flipped;
    const a = state.cards[i], b = state.cards[j];
    if (a.emotionId === b.emotionId && a.lang !== b.lang) {
      state.locked = true;
      setTimeout(() => {
        state.matched.add(i); state.matched.add(j); state.pairsFound++;
        if (isMultiplayer()) {
          state.playerScores[state.currentPlayer]++;
          updateTurnIndicator();
        }
        updateStats();
        [i, j].forEach(idx => {
          const c = $(`.card[data-index="${idx}"]`, dom.board);
          c.classList.add('matched', 'match-burst');
          setTimeout(() => c.classList.remove('match-burst'), 650);
        });
        if ('vibrate' in navigator) navigator.vibrate([20, 8, 20]);
        state.flipped = []; state.locked = false;
        showPrompt(a.emotion);
        if (state.pairsFound === state.totalPairs) setTimeout(showCongrats, 1200);
      }, 500);
    } else {
      state.locked = true;
      showDismissBar();
      const dismiss = () => {
        hideDismissBar();
        $(`.card[data-index="${i}"]`, dom.board)?.classList.remove('flipped');
        $(`.card[data-index="${j}"]`, dom.board)?.classList.remove('flipped');
        state.flipped = []; state.locked = false;
        document.removeEventListener('click', dismiss, true);
        if (isMultiplayer()) {
          advanceTurn();
        }
      };
      setTimeout(() => document.addEventListener('click', dismiss, true), 200);
    }
  }

  function updateStats() {
    dom.moves.textContent = state.moves;
    dom.pairs.textContent = `${state.pairsFound}/${state.totalPairs}`;
  }
  function updateTimer() {
    if (state.timerStart) dom.time.textContent = formatTime(Date.now() - state.timerStart);
  }

  /* ---- Dismiss bar (no-match) ---- */
  function showDismissBar() {
    let bar = $('.dismiss-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'dismiss-bar';
      document.body.appendChild(bar);
    }
    const a = state.cards[state.flipped[0]];
    const b = state.cards[state.flipped[1]];
    bar.innerHTML = `
      <span class="dismiss-hint">
        <strong>${a.emoji} ${a.word}</strong> ≠ <strong>${b.emoji} ${b.word}</strong>
      </span>
      <span class="dismiss-tip">${t('tapToContinue')}</span>`;
    bar.classList.add('visible');
  }

  function hideDismissBar() {
    const bar = $('.dismiss-bar');
    if (bar) bar.classList.remove('visible');
  }

  /* ---- Card hint (tap flipped card for explanation) ---- */
  function showCardHint(card) {
    const emo = card.emotion;
    let hint = $('.card-hint-overlay');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'card-hint-overlay';
      hint.addEventListener('click', (e) => {
        if (e.target.closest('.speak-btn')) {
          e.stopPropagation();
          const btn = e.target.closest('.speak-btn');
          speakWord(btn.dataset.speakWord, btn.dataset.speakLang);
          return;
        }
        hint.classList.remove('visible');
      });
      document.body.appendChild(hint);
    }
    const cat = CATEGORIES.find(c => c.id === emo.category);
    const catLabel = cat ? `${cat.emoji} ${cat[state.uiLang] || cat.de}` : '';
    // Only show a static note if one is written for the actual target language — no fallback to unrelated de/vi content
    const _cultureNotes = (typeof CULTURE_NOTES !== 'undefined') ? CULTURE_NOTES[emo.id] : null;
    // Show note in the reading language (lang1); only if it exists natively for that key
    const cultureNote = _cultureNotes ? (_cultureNotes[state.lang1] || null) : null;
    const cultureHTML = cultureNote ? `
        <div class="hint-divider"></div>
        <div class="hint-culture">
          <div class="hint-culture-label">🌍 ${state.uiLang === 'de' ? 'Kulturbrücke' : state.uiLang === 'vi' ? 'Cầu văn hóa' : 'Culture Bridge'}</div>
          <div class="hint-culture-text">${cultureNote}</div>
        </div>` : '';

    const aiAvailable = typeof GefuehleAI !== 'undefined';
    let aiHTML = '';
    if (aiAvailable) {
      if (GefuehleAI.isConfigured()) {
        aiHTML = `<div class="hint-ai-section" data-emotion-id="${emo.id}" data-emotion-name="${emo.en}">
          <button class="ai-culture-btn">${t('aiGenerate')}</button>
          <div class="ai-culture-result"></div>
        </div>`;
      } else {
        aiHTML = `<div class="ai-setup-hint">${t('aiSetup')}</div>`;
      }
    }

    hint.innerHTML = `
      <div class="card-hint-card">
        <div class="hint-emoji">${emo.emoji}</div>
        <div class="hint-words">
          <div class="hint-word-row"><span class="hint-flag">${LANGUAGES[state.lang1]?.flag}</span> <strong>${emo[state.lang1]}</strong> ${makeSpeakButton(emo[state.lang1], state.lang1)}</div>
          <div class="hint-word-row"><span class="hint-flag">${LANGUAGES[state.lang2]?.flag}</span> <strong>${emo[state.lang2]}</strong> ${makeSpeakButton(emo[state.lang2], state.lang2)}</div>
        </div>
        <div class="hint-category">${catLabel}</div>
        <div class="hint-divider"></div>
        <div class="hint-prompt">${emo.prompt[state.uiLang] || emo.prompt.de}</div>
        ${cultureHTML}
        ${aiHTML}
        <div class="hint-close-tip">${t('tapToClose')}</div>
      </div>`;
    hint.classList.add('visible');

    const aiBtn = hint.querySelector('.ai-culture-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const section = aiBtn.closest('.hint-ai-section');
        const resultEl = section.querySelector('.ai-culture-result');
        aiBtn.disabled = true;
        aiBtn.innerHTML = `<span class="ai-spinner"></span>${t('aiLoading')}`;
        try {
          const text = await GefuehleAI.generateCultureInsight(
            section.dataset.emotionId,
            section.dataset.emotionName,
            state.lang1,
            state.lang2
          );
          resultEl.innerHTML = `<div class="ai-insight-box">🤖 ${text}</div>
            <button class="ai-save-btn">${state.uiLang === 'de' ? '💾 Speichern' : '💾 Save'}</button>`;
          aiBtn.style.display = 'none';
          const saveBtn = resultEl.querySelector('.ai-save-btn');
          saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const saved = JSON.parse(localStorage.getItem('gefuehle-saved-insights') || '[]');
            saved.push({
              date: new Date().toISOString().split('T')[0],
              emotionId: section.dataset.emotionId,
              emotionName: section.dataset.emotionName,
              lang1: state.lang1, lang2: state.lang2,
              text,
            });
            localStorage.setItem('gefuehle-saved-insights', JSON.stringify(saved));
            saveBtn.textContent = state.uiLang === 'de' ? '✓ Gespeichert' : '✓ Saved';
            saveBtn.disabled = true;
          });
        } catch (err) {
          resultEl.innerHTML = `<div class="ai-setup-hint">Error: ${err.message}</div>`;
          aiBtn.disabled = false;
          aiBtn.textContent = t('aiGenerate');
        }
      });
    }
  }

  /* ---- Prompt overlay ---- */
  function showPrompt(emotion) {
    const color = getCategoryColor(emotion.category);
    dom.promptEmoji.textContent = emotion.emoji;
    dom.promptWordPrimary.innerHTML = `${emotion[state.lang1]} ${makeSpeakButton(emotion[state.lang1], state.lang1)}`;
    dom.promptWordSecondary.innerHTML = `${emotion[state.lang2]} ${makeSpeakButton(emotion[state.lang2], state.lang2)}`;
    dom.promptLabel.textContent = t('promptIntro');
    dom.promptQuestion.textContent = emotion.prompt[state.uiLang] || emotion.prompt.de;
    dom.promptClose.style.background = color;
    dom.promptClose.style.color = '#fff';
    if (dom.promptShare) dom.promptShare.dataset.emotionId = emotion.id;
    // Show culture note if available
    if (dom.promptCulture) {
      const note = (typeof CULTURE_NOTES !== 'undefined') ? CULTURE_NOTES[emotion.id]?.[state.uiLang] : null;
      if (note) {
        dom.promptCulture.innerHTML = `<span class="prompt-culture-label">🌍 Kulturbrücke</span>${note}`;
        dom.promptCulture.style.display = '';
      } else {
        dom.promptCulture.style.display = 'none';
      }
    }
    dom.promptOverlay.classList.add('visible');
  }
  function hidePrompt() { dom.promptOverlay.classList.remove('visible'); }

  /* ---- Congrats ---- */
  function showCongrats() {
    clearInterval(state.timerInterval);
    const elapsed = formatTime(Date.now() - state.timerStart);
    dom.congratsTitle.textContent = t('congratsTitle');

    if (isMultiplayer()) {
      dom.congratsText.textContent = '';
      dom.congratsStars.innerHTML = '';
      dom.congratsBest.textContent = '';
      dom.congratsStats.textContent = t('congratsStats').replace('{moves}', state.moves).replace('{time}', elapsed);

      const maxScore = Math.max(...state.playerScores);
      const winners = state.playerScores.reduce((acc, s, i) => s === maxScore ? [...acc, i] : acc, []);
      const isTie = winners.length > 1;

      let sbHTML = `<p style="font-weight:700;margin-bottom:8px">${t('scoreboard')}</p>`;
      for (let i = 0; i < state.playerCount; i++) {
        const isWinner = state.playerScores[i] === maxScore;
        sbHTML += `
          <div class="scoreboard-row ${isWinner ? 'winner' : ''}" style="--player-color:${PLAYER_COLORS[i]}">
            <span class="scoreboard-name">
              <span class="player-dot" style="background:${PLAYER_COLORS[i]}"></span>
              ${state.playerNames[i]}
              ${isWinner ? (isTie ? ` 🤝 ${t('tie')}` : ` 🏆 ${t('winner')}`) : ''}
            </span>
            <span>${state.playerScores[i]} ${t('points')}</span>
          </div>`;
      }
      dom.congratsScoreboard.innerHTML = sbHTML;
    } else {
      dom.congratsScoreboard.innerHTML = '';
      dom.congratsText.textContent = t('congratsText');
      dom.congratsStats.textContent = t('congratsStats').replace('{moves}', state.moves).replace('{time}', elapsed);

      const stars = calculateStars(state.moves, state.totalPairs);
      renderStars(dom.congratsStars, stars);

      const isNewBest = saveBestStars(stars);
      dom.congratsBest.textContent = isNewBest ? `⭐ ${t('newBest')}` : '';
    }

    dom.congratsOverlay.classList.add('visible');
  }
  function hideCongrats() { dom.congratsOverlay.classList.remove('visible'); }

  /* ---- Talk mode ---- */
  const TALK_EXPLORED_KEY = 'gefuehle-talk-explored';

  function initTalkMode() {
    const container = dom.talkMode;
    // Sort deck: unexplored first, then explored — so users always see new cards
    const explored = new Set(JSON.parse(localStorage.getItem(TALK_EXPLORED_KEY) || '[]'));
    const allEmos = getEmotions();
    const fresh = shuffle(allEmos.filter(e => !explored.has(e.id)));
    const seen = shuffle(allEmos.filter(e => explored.has(e.id)));
    const deck = [...fresh, ...seen];
    let index = 0;
    let currentEmo = null;
    const cardDisplay = $('.talk-card-display', container);
    const prompt = $('.talk-prompt', container);
    const drawBtn = $('.draw-btn', container);
    const deepBtn = $('.btn-deep-question', container);
    const deepResult = $('.talk-deep-result', container);
    const intro = $('.talk-intro', container);
    intro.textContent = t('talkIntro');
    drawBtn.textContent = t('drawCard');
    // Add progress tracker if not present
    if (!container.querySelector('.talk-progress')) {
      const prog = document.createElement('span');
      prog.className = 'talk-progress';
      const exploredCount = JSON.parse(localStorage.getItem(TALK_EXPLORED_KEY) || '[]').length;
      prog.textContent = `${Math.min(exploredCount, allEmos.length)} / ${allEmos.length} erkundet`;
      intro.after(prog);
    }

    function show() {
      currentEmo = deck[index % deck.length];
      // Mark as explored
      const explored = new Set(JSON.parse(localStorage.getItem(TALK_EXPLORED_KEY) || '[]'));
      explored.add(currentEmo.id);
      localStorage.setItem(TALK_EXPLORED_KEY, JSON.stringify([...explored]));

      const color = getCategoryColor(currentEmo.category);
      const isNew = !explored.has(currentEmo.id) || index < fresh.length;
      cardDisplay.innerHTML = `
        <span class="card-emoji">${currentEmo.emoji}</span>
        <span class="card-word" style="color:${color}">${currentEmo[state.lang1]} ${makeSpeakButton(currentEmo[state.lang1], state.lang1)}</span>
        <span class="card-word-secondary">${currentEmo[state.lang2]} ${makeSpeakButton(currentEmo[state.lang2], state.lang2)}</span>`;
      cardDisplay.style.borderTop = `4px solid ${color}`;
      prompt.textContent = currentEmo.prompt[state.uiLang] || currentEmo.prompt.de;
      // Progress counter
      const exploredCount = JSON.parse(localStorage.getItem(TALK_EXPLORED_KEY) || '[]').length;
      const progressEl = container.querySelector('.talk-progress');
      if (progressEl) progressEl.textContent = `${Math.min(exploredCount, allEmos.length)} / ${allEmos.length} erkundet`;
      // Reset deep question on new card
      deepResult.textContent = '';
      deepResult.className = 'talk-deep-result';
      if (deepBtn) { deepBtn.disabled = false; deepBtn.textContent = 'Tiefere Frage 🤖'; }
    }

    drawBtn.onclick = () => {
      index++;
      cardDisplay.style.transform = 'scale(.9) rotateZ(-3deg)';
      setTimeout(() => { show(); cardDisplay.style.transform = ''; }, 200);
    };

    if (deepBtn) {
      deepBtn.addEventListener('click', async () => {
        if (!currentEmo || typeof GefuehleAPI === 'undefined') return;
        deepBtn.disabled = true;
        deepBtn.innerHTML = '<span class="ai-spinner"></span>';
        const res = await GefuehleAPI.dynamicPrompt({
          type: 'talk_followup',
          emotion_names: [currentEmo[state.uiLang] || currentEmo.de, currentEmo.en],
          context: 'open conversation',
          lang: state.uiLang,
        });
        deepBtn.textContent = 'Tiefere Frage 🤖';
        deepBtn.disabled = false;
        if (res?.text) {
          deepResult.textContent = res.text;
          deepResult.className = 'talk-deep-result visible';
        }
      });
    }

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.speak-btn');
      if (btn) {
        e.stopPropagation();
        speakWord(btn.dataset.speakWord, btn.dataset.speakLang);
      }
    });
    show();
  }

  /* ---- Story mode ---- */
  function initStoryMode() {
    const container = dom.storyMode;
    const cardsEl = $('.story-cards', container);
    const intro = $('.story-intro', container);
    const drawBtn = $('.draw-btn', container);
    intro.textContent = t('storyIntro');
    drawBtn.textContent = t('newCards');

    let currentThree = [];

    function draw() {
      currentThree = shuffle(getEmotions()).slice(0, 3);
      cardsEl.innerHTML = '';
      currentThree.forEach(emo => {
        const color = getCategoryColor(emo.category);
        const card = document.createElement('div');
        card.className = 'story-card';
        card.style.borderTop = `4px solid ${color}`;
        card.innerHTML = `
          <span class="card-emoji">${emo.emoji}</span>
          <span class="card-word" style="color:${color}">${emo[state.lang1]} ${makeSpeakButton(emo[state.lang1], state.lang1)}</span>
          <span class="card-word" style="color:${color};opacity:.7;font-weight:400">${emo[state.lang2]}</span>`;
        cardsEl.appendChild(card);
      });
      // Reset AI panel on new draw
      const panel = container.querySelector('.story-ai-panel');
      if (panel) panel.remove();
      renderStoryAiPanel();
    }

    function renderStoryAiPanel() {
      const panel = document.createElement('div');
      panel.className = 'story-ai-panel';
      panel.innerHTML = `
        <button class="btn-story-starter">KI-Anfang 🤖</button>
        <div class="story-ai-starter"></div>
        <div class="story-write-area" style="display:none">
          <textarea class="story-textarea" placeholder="Schreib weiter..."></textarea>
          <button class="btn-story-feedback">Geschichte reflektieren 🤖</button>
          <div class="story-feedback-result"></div>
        </div>`;
      container.appendChild(panel);

      panel.querySelector('.btn-story-starter').addEventListener('click', async () => {
        if (typeof GefuehleAPI === 'undefined') return;
        const btn = panel.querySelector('.btn-story-starter');
        btn.disabled = true;
        btn.innerHTML = '<span class="ai-spinner"></span>';
        const names = currentThree.map(e => e[state.uiLang] || e.de);
        const res = await GefuehleAPI.dynamicPrompt({
          type: 'story_starter',
          emotion_names: names,
          lang: state.uiLang,
        });
        btn.textContent = 'KI-Anfang 🤖';
        btn.disabled = false;
        if (res?.text) {
          const starterEl = panel.querySelector('.story-ai-starter');
          starterEl.textContent = res.text;
          starterEl.classList.add('visible');
          panel.querySelector('.story-write-area').style.display = '';
        }
      });

      panel.querySelector('.btn-story-feedback').addEventListener('click', async () => {
        if (typeof GefuehleAPI === 'undefined') return;
        const storyText = panel.querySelector('.story-textarea').value.trim();
        if (!storyText) return;
        const btn = panel.querySelector('.btn-story-feedback');
        btn.disabled = true;
        btn.innerHTML = '<span class="ai-spinner"></span>';
        const names = currentThree.map(e => e[state.uiLang] || e.de);
        const res = await GefuehleAPI.dynamicPrompt({
          type: 'story_feedback',
          emotion_names: names,
          user_text: storyText,
          lang: state.uiLang,
        });
        btn.textContent = 'Geschichte reflektieren 🤖';
        btn.disabled = false;
        if (res?.text) {
          const fbEl = panel.querySelector('.story-feedback-result');
          fbEl.textContent = res.text;
          fbEl.classList.add('visible');
        }
      });
    }

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.speak-btn');
      if (btn) {
        e.stopPropagation();
        speakWord(btn.dataset.speakWord, btn.dataset.speakLang);
      }
    });
    drawBtn.onclick = draw;
    draw();
  }

  /* ---- Check-in mode ---- */
  const DIMENSION_META = {
    koerper:   { color: '#E8836B', emoji: '🧍', de: 'Körper',    en: 'Body',          vi: 'Thân thể', el: 'Σώμα' },
    herz:      { color: '#F6C344', emoji: '💛', de: 'Herz',      en: 'Heart',         vi: 'Trái tim', el: 'Καρδιά' },
    geist:     { color: '#7BAFD4', emoji: '🧠', de: 'Geist',     en: 'Mind',          vi: 'Tâm trí',  el: 'Μυαλό' },
    seele:     { color: '#C27AE0', emoji: '🔮', de: 'Seele',     en: 'Soul',          vi: 'Tâm hồn',  el: 'Ψυχή' },
    beziehung: { color: '#4CAF82', emoji: '👥', de: 'Beziehung', en: 'Relationships', vi: 'Quan hệ',  el: 'Σχέσεις' },
  };

  function initCheckinMode() {
    const container = dom.checkinMode;
    state.checkinSelections = {};
    const lang = state.uiLang;

    // Returning user prompt
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const allCheckins = typeof GefuehleAPI !== 'undefined' ? GefuehleAPI.getCheckinEntries() : [];
    const todayCheckin = allCheckins.find(c => c.date === today);
    const yesterdayCheckin = allCheckins.find(c => c.date === yesterday);
    let returningHTML = '';
    if (todayCheckin?.need_ids?.length) {
      const names = todayCheckin.need_ids.slice(0, 3).map(id => {
        const n = NEEDS.find(x => x.id === id); return n ? `${n.emoji} ${n[lang] || n.de}` : id;
      }).join(', ');
      returningHTML = `<div class="ci-returning ci-returning-done">✓ ${lang === 'de' ? 'Heute schon:' : lang === 'el' ? 'Σήμερα:' : 'Today:'} ${names}</div>`;
    } else if (yesterdayCheckin?.need_ids?.length) {
      const names = yesterdayCheckin.need_ids.slice(0, 2).map(id => {
        const n = NEEDS.find(x => x.id === id); return n ? (n[lang] || n.de) : id;
      }).join(', ');
      returningHTML = `<div class="ci-returning">💭 ${lang === 'de' ? `Gestern: ${names}. Heute?` : lang === 'el' ? `Χθες: ${names}. Σήμερα;` : `Yesterday: ${names}. Today?`}</div>`;
    }

    let html = `
      <h2 class="checkin-title">${t('checkinTitle')}</h2>
      <p class="checkin-subtitle">${t('checkinSubtitle')}</p>
      ${returningHTML}
      <div class="checkin-dimensions">`;

    NEED_DIMENSIONS.forEach(dim => {
      const dimNeeds = NEEDS.filter(n => n.dimension === dim.id);
      html += `
        <div class="checkin-dimension" data-dim="${dim.id}">
          <h3 class="dim-title">${dim.emoji} ${dim[lang] || dim.de}</h3>
          <p class="dim-question">${dim.question[lang] || dim.question.de}</p>
          <div class="dim-needs">`;
      dimNeeds.forEach(need => {
        html += `
            <button class="need-btn" data-need="${need.id}" data-dim="${dim.id}">
              <span class="need-emoji">${need.emoji}</span>
              <span class="need-label">${need[lang] || need.de}</span>
              <span class="need-label-secondary">${need[state.lang2 !== lang ? state.lang2 : (lang === 'vi' ? 'de' : 'vi')]}</span>
            </button>`;
      });
      html += `
          </div>
          <div class="dim-chosen" data-dim-chosen="${dim.id}"></div>
        </div>`;
    });

    html += `
      </div>
      <div class="checkin-summary" style="display:none">
        <p class="checkin-done-text">${t('checkinDone')}</p>
        <div class="checkin-chosen-list"></div>
        <button class="draw-btn checkin-reset">${t('checkinReset')}</button>
      </div>`;

    container.innerHTML = html;

    $$('.need-btn', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const need = btn.dataset.need;
        const wasSelected = btn.classList.contains('selected');
        btn.classList.toggle('selected');
        if (wasSelected) {
          delete state.checkinSelections[need];
        } else {
          state.checkinSelections[need] = btn.dataset.dim;
        }
        updateCheckinSummary(container);
        // Auto-save to backend whenever selection changes
        if (typeof GefuehleAPI !== 'undefined') {
          const needIds = Object.keys(state.checkinSelections);
          const dims = [...new Set(Object.values(state.checkinSelections))];
          GefuehleAPI.saveCheckin({ need_ids: needIds, dimensions: dims, lang: state.uiLang });
        }
      });
    });

    container.querySelector('.checkin-reset')?.addEventListener('click', () => initCheckinMode());
  }

  function updateCheckinSummary(container) {
    const summary = $('.checkin-summary', container);
    const list = $('.checkin-chosen-list', container);
    const selected = Object.keys(state.checkinSelections);

    if (selected.length > 0) {
      summary.style.display = '';
      const lang = state.uiLang;
      const needNames = selected.map(needId => {
        const need = NEEDS.find(n => n.id === needId);
        return need ? (need[lang] || need.de) : needId;
      });
      list.innerHTML = needNames.map((name, i) => {
        const need = NEEDS.find(n => n.id === selected[i]);
        return `<span class="chosen-tag">${need ? need.emoji : ''} ${name}</span>`;
      }).join('');

      // Dimension summary bars
      const dimGroups = {};
      Object.entries(state.checkinSelections).forEach(([needId, dim]) => {
        if (!dimGroups[dim]) dimGroups[dim] = [];
        const need = NEEDS.find(n => n.id === needId);
        if (need) dimGroups[dim].push(`${need.emoji} ${need[lang] || need.de}`);
      });
      const dimBarsHTML = Object.entries(dimGroups).map(([dim, needs]) => {
        const meta = DIMENSION_META[dim] || { color: '#F6C344', emoji: '•', de: dim, en: dim, el: dim, vi: dim };
        return `<div class="ci-dim-row">
          <span class="ci-dim-pill" style="background:${meta.color}22;color:${meta.color};border-color:${meta.color}55">${meta.emoji} ${meta[lang] || meta.en}</span>
          <span class="ci-dim-needs">${needs.join(' · ')}</span>
        </div>`;
      }).join('');
      let dimEl = summary.querySelector('.ci-dim-summary');
      if (!dimEl) { dimEl = document.createElement('div'); dimEl.className = 'ci-dim-summary'; list.after(dimEl); }
      dimEl.innerHTML = dimBarsHTML;

      // Request notification permission after 2nd check-in
      const allCI = typeof GefuehleAPI !== 'undefined' ? GefuehleAPI.getCheckinEntries() : [];
      if (allCI.length === 2 && 'Notification' in window && Notification.permission === 'default') {
        setTimeout(() => requestNotificationPermission(lang), 1500);
      }

      // Add AI reflection button if not already present
      if (!summary.querySelector('.btn-checkin-reflection')) {
        const reflBtn = document.createElement('button');
        reflBtn.className = 'btn-checkin-reflection';
        reflBtn.textContent = state.uiLang === 'de' ? 'KI-Reflexion 🤖' : state.uiLang === 'el' ? 'Αντανάκλαση AI 🤖' : 'AI Reflection 🤖';
        const reflResult = document.createElement('div');
        reflResult.className = 'checkin-reflection-box';
        summary.appendChild(reflBtn);
        summary.appendChild(reflResult);

        reflBtn.addEventListener('click', async () => {
          if (typeof GefuehleAPI === 'undefined') return;
          reflBtn.disabled = true;
          reflBtn.innerHTML = '<span class="ai-spinner"></span>';
          const res = await GefuehleAPI.dynamicPrompt({
            type: 'checkin_reflection',
            needs: needNames,
            lang: state.uiLang,
          });
          reflBtn.textContent = state.uiLang === 'de' ? 'KI-Reflexion 🤖' : state.uiLang === 'el' ? 'Αντανάκλαση AI 🤖' : 'AI Reflection 🤖';
          reflBtn.disabled = false;
          if (res?.text) {
            reflResult.textContent = res.text;
            reflResult.classList.add('visible');
          }
        });
      }
      // Ritual completion button — appears once selections are made
      if (!summary.querySelector('.btn-checkin-fertig')) {
        const fertigBtn = document.createElement('button');
        fertigBtn.className = 'btn-checkin-fertig';
        fertigBtn.textContent = lang === 'de' ? 'Moment der Stille ✓' : lang === 'el' ? 'Στιγμή ησυχίας ✓' : 'Moment of stillness ✓';
        summary.appendChild(fertigBtn);
        fertigBtn.addEventListener('click', () => showCheckinRitual(state.uiLang, state.checkinSelections));
      }
    } else {
      summary.style.display = 'none';
    }
  }

  function showCheckinRitual(lang, selections) {
    const dims = [...new Set(Object.values(selections))];
    const AFFIRMATIONS = {
      koerper:   { de: 'Dein Körper hat gesprochen. Hör ihm zu.', en: 'Your body has spoken. Listen to it.', el: 'Το σώμα σου μίλησε. Άκουσέ το.', vi: 'Cơ thể bạn đã nói. Hãy lắng nghe.', tr: 'Vücudun konuştu. Onu dinle.', ar: 'جسدك تكلّم. استمع إليه.', es: 'Tu cuerpo ha hablado. Escúchalo.', fr: 'Ton corps a parlé. Écoute-le.', uk: 'Твоє тіло говорило. Слухай його.', pl: 'Twoje ciało przemówiło. Słuchaj go.', ta: 'உங்கள் உடல் பேசியது. கேளுங்கள்.' },
      herz:      { de: 'Dein Herz weiß, was es braucht.', en: 'Your heart knows what it needs.', el: 'Η καρδιά σου ξέρει τι χρειάζεται.', vi: 'Trái tim bạn biết điều nó cần.', tr: 'Kalbin neye ihtiyacı olduğunu biliyor.', ar: 'قلبك يعرف ما يحتاجه.', es: 'Tu corazón sabe lo que necesita.', fr: 'Ton cœur sait ce dont il a besoin.', uk: 'Твоє серце знає, що йому потрібно.', pl: 'Twoje serce wie, czego potrzebuje.', ta: 'உங்கள் இதயம் என்ன வேண்டும் என்று அறியும்.' },
      geist:     { de: 'Dein Geist sucht Klarheit. Gib ihm Raum.', en: 'Your mind seeks clarity. Give it space.', el: 'Ο νους σου ζητά καθαρότητα. Δώσε χώρο.', vi: 'Tâm trí bạn tìm kiếm sự rõ ràng.', tr: 'Zihnin netlik arıyor. Ona alan ver.', ar: 'عقلك يبحث عن الوضوح. أعطه مساحة.', es: 'Tu mente busca claridad. Dale espacio.', fr: 'Ton esprit cherche la clarté. Donne-lui de l\'espace.', uk: 'Твій розум шукає ясності. Дай йому простір.', pl: 'Twój umysł szuka jasności. Daj mu przestrzeń.', ta: 'உங்கள் மனம் தெளிவைத் தேடுகிறது.' },
      seele:     { de: 'Deine Seele ist in Bewegung. Das ist gut.', en: 'Your soul is in motion. That is good.', el: 'Η ψυχή σου κινείται. Αυτό είναι καλό.', vi: 'Tâm hồn bạn đang chuyển động.', tr: 'Ruhun hareket halinde. Bu iyi.', ar: 'روحك في حركة. هذا جيد.', es: 'Tu alma está en movimiento. Eso es bueno.', fr: 'Ton âme est en mouvement. C\'est bien.', uk: 'Твоя душа в русі. Це добре.', pl: 'Twoja dusza jest w ruchu. To dobrze.', ta: 'உங்கள் ஆன்மா இயக்கத்தில் உள்ளது.' },
      beziehung: { de: 'Verbindung nährt. Du bist nicht allein.', en: 'Connection nourishes. You are not alone.', el: 'Η σύνδεση τρέφει. Δεν είσαι μόνος.', vi: 'Kết nối nuôi dưỡng. Bạn không đơn độc.', tr: 'Bağlantı besler. Yalnız değilsin.', ar: 'التواصل يُغذّي. أنت لست وحدك.', es: 'La conexión nutre. No estás solo.', fr: 'La connexion nourrit. Tu n\'es pas seul.', uk: 'Зв\'язок живить. Ти не один.', pl: 'Połączenie karmi. Nie jesteś sam.', ta: 'தொடர்பு வளர்க்கிறது. நீங்கள் தனியில்லை.' },
    };
    const aff = dims.map(d => { const a = AFFIRMATIONS[d]; return a ? (a[lang] || a.en) : ''; }).filter(Boolean).join(' ');
    const breathLabel = lang === 'de' ? 'Atme tief durch.' : lang === 'el' ? 'Ανάπνευσε βαθιά.' : lang === 'vi' ? 'Hít thở sâu.' : lang === 'tr' ? 'Derin nefes al.' : lang === 'ar' ? 'خذ نفسًا عميقًا.' : lang === 'es' ? 'Respira profundo.' : lang === 'fr' ? 'Respirez profondément.' : lang === 'uk' ? 'Зроби глибокий вдих.' : lang === 'pl' ? 'Weź głęboki oddech.' : lang === 'ta' ? 'ஆழமாக சுவாசி.' : 'Take a deep breath.';
    const closeLabel = lang === 'de' ? 'Zurück zur Übersicht' : lang === 'el' ? 'Επιστροφή' : lang === 'vi' ? 'Trở về' : lang === 'tr' ? 'Geri dön' : lang === 'ar' ? 'عودة' : lang === 'es' ? 'Volver' : lang === 'fr' ? 'Retour' : lang === 'uk' ? 'Повернутись' : lang === 'pl' ? 'Wróć' : lang === 'ta' ? 'திரும்பு' : 'Back to home';
    const fallback = lang === 'de' ? 'Du hast gut auf dich gehört.' : lang === 'el' ? 'Άκουσες τον εαυτό σου.' : 'You listened to yourself.';

    const overlay = document.createElement('div');
    overlay.className = 'ritual-overlay';
    overlay.innerHTML = `
      <div class="ritual-card">
        <div class="ritual-breath">
          <div class="ritual-circle"></div>
          <p class="ritual-breath-label">${breathLabel}</p>
        </div>
        <p class="ritual-affirmation">${aff || fallback}</p>
        <button class="ritual-close">${closeLabel}</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
    overlay.querySelector('.ritual-close').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.remove(); showLanding(); }, 400);
    });
  }

  /* ---- Emotion Wheel mode ---- */
  function initWheelMode() {
    const container = dom.wheelMode;
    const lang = state.uiLang;

    const catEmotions = {};
    CATEGORIES.forEach(cat => {
      catEmotions[cat.id] = EMOTIONS.filter(e => e.category === cat.id);
    });

    const size = 500;
    const cx = size / 2, cy = size / 2;
    const outerR = 220, innerR = 65;
    const catCount = CATEGORIES.length;
    const anglePerCat = (Math.PI * 2) / catCount;

    function lightenHex(hex, amount) {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, ((num >> 16) & 0xff) + amount);
      const g = Math.min(255, ((num >> 8) & 0xff) + amount);
      const b = Math.min(255, (num & 0xff) + amount);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function arcPath(cxp, cyp, r1, r2, a1, a2) {
      const x1o = cxp + r2 * Math.cos(a1), y1o = cyp + r2 * Math.sin(a1);
      const x2o = cxp + r2 * Math.cos(a2), y2o = cyp + r2 * Math.sin(a2);
      const x1i = cxp + r1 * Math.cos(a1), y1i = cyp + r1 * Math.sin(a1);
      const x2i = cxp + r1 * Math.cos(a2), y2i = cyp + r1 * Math.sin(a2);
      return 'M ' + x1i + ' ' + y1i + ' L ' + x1o + ' ' + y1o +
        ' A ' + r2 + ' ' + r2 + ' 0 0 1 ' + x2o + ' ' + y2o +
        ' L ' + x2i + ' ' + y2i +
        ' A ' + r1 + ' ' + r1 + ' 0 0 0 ' + x1i + ' ' + y1i + ' Z';
    }

    const decoGen = {
      licht: function(cxp, cyp, r1, r2, a1, a2, color) {
        let d = '';
        for (let i = 0; i < 8; i++) {
          const a = a1 + (a2 - a1) * (0.1 + 0.8 * Math.random());
          const r = r1 + (r2 - r1) * (0.2 + 0.6 * Math.random());
          const px = cxp + r * Math.cos(a), py = cyp + r * Math.sin(a);
          const s = 2 + Math.random() * 3;
          d += '<polygon points="' + px + ',' + (py - s) + ' ' + (px + s * 0.4) + ',' + (py - s * 0.3) + ' ' + (px + s) + ',' + py + ' ' + (px + s * 0.4) + ',' + (py + s * 0.3) + ' ' + px + ',' + (py + s) + ' ' + (px - s * 0.4) + ',' + (py + s * 0.3) + ' ' + (px - s) + ',' + py + ' ' + (px - s * 0.4) + ',' + (py - s * 0.3) + '" fill="' + color + '" class="wheel-deco"/>';
        }
        return d;
      },
      mitte: function(cxp, cyp, r1, r2, a1, a2, color) {
        let d = '';
        for (let i = 0; i < 4; i++) {
          const a = a1 + (a2 - a1) * (0.15 + 0.7 * i / 3);
          const rr = r1 + (r2 - r1) * (0.3 + 0.4 * (i % 2));
          const px = cxp + rr * Math.cos(a), py = cyp + rr * Math.sin(a);
          d += '<path d="M ' + (px - 6) + ' ' + py + ' Q ' + (px - 3) + ' ' + (py - 4) + ', ' + px + ' ' + py + ' Q ' + (px + 3) + ' ' + (py + 4) + ', ' + (px + 6) + ' ' + py + '" stroke="' + color + '" stroke-width="1.2" fill="none" class="wheel-deco"/>';
        }
        return d;
      },
      schwere: function(cxp, cyp, r1, r2, a1, a2, color) {
        let d = '';
        for (let i = 0; i < 6; i++) {
          const a = a1 + (a2 - a1) * (0.1 + 0.8 * Math.random());
          const r = r1 + (r2 - r1) * (0.2 + 0.6 * Math.random());
          const px = cxp + r * Math.cos(a), py = cyp + r * Math.sin(a);
          d += '<path d="M ' + px + ' ' + (py - 4) + ' Q ' + (px - 2) + ' ' + py + ', ' + px + ' ' + (py + 3) + ' Q ' + (px + 2) + ' ' + py + ', ' + px + ' ' + (py - 4) + ' Z" fill="' + color + '" class="wheel-deco"/>';
        }
        return d;
      },
      sturm: function(cxp, cyp, r1, r2, a1, a2, color) {
        let d = '';
        for (let i = 0; i < 5; i++) {
          const a = a1 + (a2 - a1) * (0.1 + 0.8 * Math.random());
          const r = r1 + (r2 - r1) * (0.2 + 0.6 * Math.random());
          const px = cxp + r * Math.cos(a), py = cyp + r * Math.sin(a);
          d += '<polyline points="' + (px - 2) + ',' + (py - 5) + ' ' + (px + 1) + ',' + (py - 1) + ' ' + (px - 1) + ',' + (py + 1) + ' ' + (px + 2) + ',' + (py + 5) + '" stroke="' + color + '" stroke-width="1.3" fill="none" stroke-linecap="round" class="wheel-deco"/>';
        }
        return d;
      },
      angst: function(cxp, cyp, r1, r2, a1, a2, color) {
        let d = '';
        for (let i = 0; i < 5; i++) {
          const a = a1 + (a2 - a1) * (0.1 + 0.8 * Math.random());
          const r = r1 + (r2 - r1) * (0.25 + 0.5 * Math.random());
          const px = cxp + r * Math.cos(a), py = cyp + r * Math.sin(a);
          d += '<circle cx="' + px + '" cy="' + py + '" r="2" fill="none" stroke="' + color + '" stroke-width=".8" class="wheel-deco"/>';
          d += '<circle cx="' + px + '" cy="' + py + '" r="4.5" fill="none" stroke="' + color + '" stroke-width=".5" class="wheel-deco"/>';
        }
        return d;
      },
      schatten: function(cxp, cyp, r1, r2, a1, a2, color) {
        let d = '';
        for (let i = 0; i < 4; i++) {
          const a = a1 + (a2 - a1) * (0.15 + 0.7 * i / 3);
          const rr = r1 + (r2 - r1) * (0.3 + 0.3 * (i % 2));
          const px = cxp + rr * Math.cos(a), py = cyp + rr * Math.sin(a);
          d += '<path d="M ' + (px - 5) + ' ' + (py + 1) + ' Q ' + (px - 2) + ' ' + (py - 3) + ', ' + px + ' ' + py + ' Q ' + (px + 2) + ' ' + (py - 3) + ', ' + (px + 5) + ' ' + (py + 1) + '" stroke="' + color + '" stroke-width="1" fill="none" opacity=".6" class="wheel-deco"/>';
          d += '<path d="M ' + (px - 4) + ' ' + (py + 3) + ' Q ' + px + ' ' + py + ', ' + (px + 4) + ' ' + (py + 3) + '" stroke="' + color + '" stroke-width=".7" fill="none" opacity=".4" class="wheel-deco"/>';
        }
        return d;
      }
    };

    let defs = '<defs>';
    CATEGORIES.forEach(function(cat, i) {
      const midAngle = i * anglePerCat - Math.PI / 2 + anglePerCat / 2;
      const gx1 = Math.round(50 + 40 * Math.cos(midAngle));
      const gy1 = Math.round(50 + 40 * Math.sin(midAngle));
      defs += '<radialGradient id="wg-' + cat.id + '" cx="' + gx1 + '%" cy="' + gy1 + '%" r="65%">' +
        '<stop offset="0%" stop-color="' + lightenHex(cat.color, 80) + '"/>' +
        '<stop offset="50%" stop-color="' + cat.colorLight + '"/>' +
        '<stop offset="100%" stop-color="' + lightenHex(cat.color, 40) + '"/>' +
        '</radialGradient>';
    });
    defs += '<filter id="wheel-center-shadow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,.12)"/>' +
      '</filter>';
    defs += '</defs>';

    let segments = '';
    CATEGORIES.forEach(function(cat, catIdx) {
      const startAngle = catIdx * anglePerCat - Math.PI / 2;
      const endAngle = startAngle + anglePerCat;
      const midAngle = startAngle + anglePerCat / 2;
      const emotions = catEmotions[cat.id];
      const catLabel = cat[lang] || cat.de;

      segments += '<g class="wheel-segment-group" data-cat="' + cat.id + '">';

      segments += '<path class="wheel-segment" d="' + arcPath(cx, cy, innerR, outerR, startAngle, endAngle) + '"' +
        ' fill="url(#wg-' + cat.id + ')" stroke="' + cat.color + '" stroke-width="1.5" opacity="0.82"' +
        ' tabindex="0" role="button" aria-label="' + catLabel + '"/>';

      if (decoGen[cat.id]) {
        segments += decoGen[cat.id](cx, cy, innerR, outerR, startAngle, endAngle, cat.color);
      }

      const emojiR = innerR + 20;
      const elx = cx + emojiR * Math.cos(midAngle);
      const ely = cy + emojiR * Math.sin(midAngle);
      segments += '<text class="wheel-cat-emoji" x="' + elx + '" y="' + ely + '" text-anchor="middle" dominant-baseline="middle">' + cat.emoji + '</text>';

      const nameR = outerR - 22;
      const nlx = cx + nameR * Math.cos(midAngle);
      const nly = cy + nameR * Math.sin(midAngle);
      const rotDeg = midAngle * 180 / Math.PI;
      const textRot = (rotDeg > 90 || rotDeg < -90) ? rotDeg + 180 : rotDeg;
      segments += '<text class="wheel-cat-name" x="' + nlx + '" y="' + nly + '" text-anchor="middle" dominant-baseline="middle"' +
        ' transform="rotate(' + textRot + ', ' + nlx + ', ' + nly + ')">' + catLabel + '</text>';

      emotions.forEach(function(emo, emoIdx) {
        const padAngle = 0.04;
        const usableAngle = anglePerCat - padAngle * 2;
        const emoAngle = startAngle + padAngle + (emoIdx + 0.5) * (usableAngle / emotions.length);
        const rings = emotions.length > 9 ? 3 : 2;
        const ring = emoIdx % rings;
        const bandStart = innerR + 35;
        const bandEnd = outerR - 30;
        const dotR = bandStart + ring * ((bandEnd - bandStart) / (rings - 1 || 1));
        const dx = cx + dotR * Math.cos(emoAngle);
        const dy = cy + dotR * Math.sin(emoAngle);
        const emoLabel = emo[lang] || emo.de;

        segments += '<text class="wheel-emoji-dot" x="' + dx + '" y="' + dy + '" text-anchor="middle" dominant-baseline="central"' +
          ' font-size="14" data-emotion-id="' + emo.id + '" data-emoji="' + emo.emoji + '" data-label="' + emoLabel + '"' +
          ' tabindex="0" role="button" aria-label="' + emoLabel + ' ' + emo.emoji + '"' +
          ' style="transform-origin: ' + dx + 'px ' + dy + 'px">' + emo.emoji + '</text>';
      });

      segments += '</g>';
    });

    const defaultCenterText = lang === 'de' ? 'Tippe zum Erkunden' : lang === 'vi' ? 'Chạm để khám phá' : 'Tap to explore';
    let center = '<g class="wheel-center-pulse">';
    center += '<circle class="wheel-center-circle" cx="' + cx + '" cy="' + cy + '" r="' + (innerR - 5) + '"' +
      ' fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2.5" filter="url(#wheel-center-shadow)"/>';
    center += '<text class="wheel-center-emoji" x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" dominant-baseline="central" font-size="28">💛</text>';
    center += '<text class="wheel-center-text" x="' + cx + '" y="' + (cy + 22) + '" text-anchor="middle" font-size="9" fill="var(--text-soft)">' + defaultCenterText + '</text>';
    center += '</g>';

    container.innerHTML = '<p class="wheel-intro">' + t('wheelIntro') + '</p>' +
      '<div class="wheel-svg-container">' +
        '<svg class="wheel-spin-in" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' +
          defs + segments + center +
        '</svg>' +
        '<div class="wheel-tooltip" aria-hidden="true"></div>' +
      '</div>';

    const svgEl = container.querySelector('svg');
    const tooltip = container.querySelector('.wheel-tooltip');
    const svgContainer = container.querySelector('.wheel-svg-container');

    function showWheelTooltip(dotEl, label) {
      tooltip.textContent = label;
      tooltip.classList.add('visible');
      const containerRect = svgContainer.getBoundingClientRect();
      const svgRect = svgEl.getBoundingClientRect();
      const dotX = parseFloat(dotEl.getAttribute('x'));
      const dotY = parseFloat(dotEl.getAttribute('y'));
      const scaleX = svgRect.width / size;
      const scaleY = svgRect.height / size;
      const px = dotX * scaleX + (svgRect.left - containerRect.left);
      const py = dotY * scaleY + (svgRect.top - containerRect.top);
      tooltip.style.left = px + 'px';
      tooltip.style.top = (py - 30) + 'px';
      tooltip.style.transform = 'translate(-50%, -100%)';
    }

    function hideWheelTooltip() {
      tooltip.classList.remove('visible');
    }

    function setCenterText(text) {
      const ct = svgEl.querySelector('.wheel-center-text');
      if (ct) ct.textContent = text;
    }

    svgEl.addEventListener('mouseover', function(e) {
      var dot = e.target.closest('.wheel-emoji-dot');
      if (dot) {
        showWheelTooltip(dot, dot.dataset.label);
        setCenterText(dot.dataset.label);
      }
    });
    svgEl.addEventListener('mouseout', function(e) {
      if (e.target.closest('.wheel-emoji-dot')) {
        hideWheelTooltip();
        setCenterText(defaultCenterText);
      }
    });

    svgEl.addEventListener('focusin', function(e) {
      var dot = e.target.closest('.wheel-emoji-dot');
      if (dot) {
        showWheelTooltip(dot, dot.dataset.label);
        setCenterText(dot.dataset.label);
      }
    });
    svgEl.addEventListener('focusout', function(e) {
      if (e.target.closest('.wheel-emoji-dot')) {
        hideWheelTooltip();
        setCenterText(defaultCenterText);
      }
    });

    function activateDot(dotEl) {
      var emoId = dotEl.dataset.emotionId;
      var emo = EMOTIONS.find(function(em) { return em.id === emoId; });
      if (!emo) return;
      dotEl.classList.add('wheel-dot-selected');
      setCenterText(dotEl.dataset.label);
      setTimeout(function() {
        dotEl.classList.remove('wheel-dot-selected');
        showCardHint({
          emotionId: emo.id,
          lang: state.lang1,
          word: emo[state.lang1],
          emoji: emo.emoji,
          color: getCategoryColor(emo.category),
          emotion: emo
        });
      }, 350);
    }

    svgEl.addEventListener('click', function(e) {
      var dot = e.target.closest('.wheel-emoji-dot');
      if (dot) activateDot(dot);
    });

    svgEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var dot = e.target.closest('.wheel-emoji-dot');
        if (dot) { e.preventDefault(); activateDot(dot); }
      }
    });

    svgEl.addEventListener('animationend', function() {
      svgEl.classList.remove('wheel-spin-in');
    }, { once: true });
  }

  /* ---- Emotion Timeline (6-month bar chart) ---- */
  function buildEmotionTimeline(entries, lang) {
    if (entries.length < 3) return '';

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: d.toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        catCounts: {},
        total: 0,
      };
    });

    entries.forEach(e => {
      const d = new Date(e.date);
      const bucket = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (!bucket) return;
      (e.emotions || []).forEach(eid => {
        const emo = EMOTIONS.find(em => em.id === eid);
        if (emo) {
          bucket.catCounts[emo.category] = (bucket.catCounts[emo.category] || 0) + 1;
          bucket.total++;
        }
      });
    });

    const hasData = months.some(m => m.total > 0);
    if (!hasData) return '';

    const maxTotal = Math.max(...months.map(m => m.total), 1);

    const bars = months.map(m => {
      const height = Math.max(4, Math.round((m.total / maxTotal) * 60));
      // Dominant category color
      let domCat = 'mitte';
      let domCount = 0;
      Object.entries(m.catCounts).forEach(([cat, count]) => {
        if (count > domCount) { domCat = cat; domCount = count; }
      });
      const cat = CATEGORIES.find(c => c.id === domCat);
      const color = cat ? cat.color : 'var(--accent)';
      return `<div class="timeline-col">
        <div class="timeline-bar" style="height:${height}px;background:${color}" title="${m.total} Einträge"></div>
        <div class="timeline-label">${m.label}</div>
      </div>`;
    }).join('');

    return `<div class="journal-timeline">
      <h4 class="timeline-title">6-Monats-Überblick</h4>
      <div class="timeline-bars">${bars}</div>
    </div>`;
  }

  /* ---- Journal Mode ---- */
  function initJournalMode() {
    const container = dom.journalMode;
    const lang = state.uiLang;
    const JOURNAL_KEY = 'gefuehle-journal';
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dateDisplay = today.toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'vi' ? 'vi-VN' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const selectedEmotions = new Set();

    let catHTML = '';
    CATEGORIES.forEach(cat => {
      const emotions = EMOTIONS.filter(e => e.category === cat.id);
      catHTML += `
        <div class="journal-cat-section" style="--cat-color:${cat.color}">
          <div class="journal-cat-header">
            ${cat.emoji} ${cat[lang] || cat.de}
            <span class="arrow">▶</span>
          </div>
          <div class="journal-cat-emotions">
            ${emotions.map(emo => `
              <button class="journal-emo-btn" data-emo-id="${emo.id}" style="--cat-color:${cat.color}">
                <span>${emo.emoji}</span>
                <span>${emo[lang] || emo.de}</span>
              </button>
            `).join('')}
          </div>
        </div>`;
    });

    const entries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
    const catCounts = {};
    CATEGORIES.forEach(c => { catCounts[c.id] = 0; });
    weekEntries.forEach(entry => {
      (entry.emotions || []).forEach(emoId => {
        const emo = EMOTIONS.find(e => e.id === emoId);
        if (emo) catCounts[emo.category] = (catCounts[emo.category] || 0) + 1;
      });
    });
    const maxCount = Math.max(1, ...Object.values(catCounts));

    let heatmapHTML = `
      <div class="journal-heatmap">
        <h4>${t('journalWeek')}</h4>
        <div class="heatmap-grid">
          ${CATEGORIES.map(cat => {
            const count = catCounts[cat.id] || 0;
            const dots = Array.from({ length: 7 }, (_, i) => {
              const active = i < count;
              return `<div class="heatmap-dot ${active ? 'active' : ''}" style="background:${cat.color}"></div>`;
            }).join('');
            return `<div class="heatmap-cat">
              <span class="heatmap-cat-label">${cat.emoji}</span>
              <div class="heatmap-dots">${dots}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    let historyHTML = '';
    if (entries.length > 0) {
      historyHTML = `
        <div class="journal-history">
          <h3>${t('journalHistory')}</h3>
          <div class="journal-entry-list">
            ${entries.slice().reverse().map((entry, idx) => {
              const emojis = (entry.emotions || []).map(eid => {
                const em = EMOTIONS.find(e => e.id === eid);
                return em ? em.emoji : '';
              }).join(' ');
              const noteSnippet = entry.note ? entry.note.substring(0, 80) + (entry.note.length > 80 ? '...' : '') : '';
              return `
                <div class="journal-entry" data-entry-idx="${idx}">
                  <div class="journal-entry-date">${entry.date}</div>
                  <div class="journal-entry-emojis">${emojis || '—'}</div>
                  ${noteSnippet ? `<div class="journal-entry-note">${noteSnippet}</div>` : ''}
                  ${entry.aiInsight ? `<div class="journal-entry-ai"><div class="ai-insight-box">🤖 ${entry.aiInsight}</div></div>` : ''}
                </div>`;
            }).join('')}
          </div>
        </div>`;
    } else {
      historyHTML = `<p style="color:var(--text-soft);font-size:.9rem">${t('journalNoEntries')}</p>`;
    }

    const backendReady = typeof GefuehleAPI !== 'undefined';
    const localAiReady = typeof GefuehleAI !== 'undefined' && GefuehleAI.isConfigured();
    let aiPatternHTML = '';
    if (entries.length >= 2 && (backendReady || localAiReady)) {
      aiPatternHTML = `
        <button class="ai-culture-btn journal-pattern-btn">${t('journalPattern')}</button>
        <div class="journal-ai-result"></div>`;
    }

    const timelineHTML = buildEmotionTimeline(entries, lang);

    container.innerHTML = `
      <div class="journal-date">${dateDisplay}</div>
      <h2 class="journal-title">${t('journalTitle')}</h2>
      <div class="journal-categories">${catHTML}</div>
      <textarea class="journal-note-field" placeholder="${t('journalNote')}"></textarea>
      <div class="journal-save-row">
        <button class="btn btn-primary journal-save-btn">${t('journalSave')}</button>
        <span class="journal-saved-msg">${t('journalSaved')}</span>
      </div>
      ${heatmapHTML}
      ${timelineHTML}
      ${aiPatternHTML}
      <div class="journal-tools">
        <button class="btn-journal-export">📥 Journal exportieren</button>
        <button class="btn-journal-reminder">🔔 Tägliche Erinnerung</button>
      </div>
      ${historyHTML}`;

    container.querySelectorAll('.journal-cat-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('open');
      });
    });

    container.querySelectorAll('.journal-emo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoId = btn.dataset.emoId;
        if (selectedEmotions.has(emoId)) {
          selectedEmotions.delete(emoId);
          btn.classList.remove('selected');
        } else {
          selectedEmotions.add(emoId);
          btn.classList.add('selected');
        }
      });
    });

    container.querySelector('.journal-save-btn')?.addEventListener('click', async () => {
      if (selectedEmotions.size === 0) return;
      const note = container.querySelector('.journal-note-field')?.value || '';

      // Save via API client (handles both backend + LocalStorage)
      if (typeof GefuehleAPI !== 'undefined') {
        await GefuehleAPI.saveJournal({ emotions: [...selectedEmotions], note, lang });
      } else {
        const entry = { date: dateStr, emotions: [...selectedEmotions], note, aiInsight: '' };
        const all = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
        all.push(entry);
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
      }

      const msg = container.querySelector('.journal-saved-msg');
      msg.classList.add('show');
      setTimeout(() => {
        msg.classList.remove('show');
        initJournalMode();
        // Refresh stats widget after new entry
        if (typeof GefuehleAPI !== 'undefined') GefuehleAPI.renderStatsWidget();
      }, 1500);
    });

    container.querySelectorAll('.journal-entry').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('expanded');
      });
    });

    // Export button
    container.querySelector('.btn-journal-export')?.addEventListener('click', () => {
      const allEntries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
      const blob = new Blob([JSON.stringify(allEntries, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `gefuehle-journal-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Reminder button
    const reminderBtn = container.querySelector('.btn-journal-reminder');
    if (reminderBtn) {
      const REMINDER_KEY = 'gefuehle-reminder-enabled';
      if (localStorage.getItem(REMINDER_KEY)) {
        reminderBtn.textContent = '✓ Erinnerung aktiv';
        reminderBtn.classList.add('active');
      }
      reminderBtn.addEventListener('click', async () => {
        if (!('Notification' in window)) {
          reminderBtn.textContent = '⚠ Nicht unterstützt';
          return;
        }
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          localStorage.setItem(REMINDER_KEY, '1');
          reminderBtn.textContent = '✓ Erinnerung aktiv';
          reminderBtn.classList.add('active');
          new Notification('Gefühle-Memory 💛', {
            body: 'Erinnerung aktiviert! Wir sehen uns heute Abend.',
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💛</text></svg>',
          });
        } else {
          reminderBtn.textContent = '⚠ Erlaubnis verweigert';
        }
      });
    }

    const patternBtn = container.querySelector('.journal-pattern-btn');
    if (patternBtn) {
      patternBtn.addEventListener('click', async () => {
        const resultEl = container.querySelector('.journal-ai-result');
        patternBtn.disabled = true;
        patternBtn.innerHTML = `<span class="ai-spinner"></span>${t('aiLoading')}`;
        try {
          // Try backend analysis first (richer: patterns + suggestion + follow-up question)
          let insight = '';
          let followUp = '';
          if (typeof GefuehleAPI !== 'undefined') {
            const res = await GefuehleAPI.apiFetch?.('/ai/journal-analysis', {
              method: 'POST',
              body: JSON.stringify({ user_id: GefuehleAPI.getUserId(), lang: state.uiLang }),
            }).catch(() => null);
            if (res?.insight) {
              insight = res.insight;
              if (res.patterns?.length) insight += '\n\n' + res.patterns.map(p => `• ${p}`).join('\n');
              if (res.suggestion) insight += '\n\n' + res.suggestion;
              followUp = res.follow_up_question || '';
            }
          }
          // Fallback to local AI
          if (!insight && typeof GefuehleAI !== 'undefined') {
            const allEntries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
            insight = await GefuehleAI.generateJournalInsight(allEntries, state.uiLang);
          }
          // Fallback: local dynamic prompt for follow-up question
          if (!followUp && typeof GefuehleAPI !== 'undefined') {
            const allEntries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
            const recentEmotions = [...new Set(allEntries.slice(-5).flatMap(e => e.emotions || []))]
              .slice(0, 5)
              .map(id => { const em = EMOTIONS.find(e => e.id === id); return em ? (em[state.uiLang] || em.de) : id; });
            if (recentEmotions.length) {
              const fq = await GefuehleAPI.dynamicPrompt({ type: 'journal_question', emotion_names: recentEmotions, lang: state.uiLang });
              followUp = fq?.text || '';
            }
          }
          resultEl.innerHTML = `<div class="journal-ai-card">
            <h4>🤖 ${t('journalPattern')}</h4>
            <p>${insight.replace(/\n/g, '<br>')}</p>
            ${followUp ? `<div class="journal-follow-up"><span class="follow-up-label">Frage für dich</span><p>${followUp}</p></div>` : ''}
          </div>`;
          patternBtn.style.display = 'none';
        } catch (err) {
          resultEl.innerHTML = `<div class="ai-setup-hint">Error: ${err.message}</div>`;
          patternBtn.disabled = false;
          patternBtn.textContent = t('journalPattern');
        }
      });
    }
  }

  /* ---- Ask Mode (RAG Q&A chat) ---- */
  function initAskMode() {
    const container = dom.askMode;
    const lang = state.uiLang;

    const EXAMPLES = {
      de: [
        'Was ist der Unterschied zwischen Scham und Schuld?',
        'Warum hat Tamil so viele Wörter für Liebe?',
        'Was bedeutet Philotimo auf Griechisch?',
        'Was ist Weltschmerz?',
        'Wie fühlt sich Einsamkeit im Körper an?',
      ],
      vi: [
        'Sự khác biệt giữa thương và yêu là gì?',
        'Alexithymia có nghĩa là gì?',
        'Tại sao tiếng Đức có từ Sehnsucht?',
        'Tự hào khác gì với kiêu ngạo?',
      ],
      en: [
        'What is the difference between shame and guilt?',
        'Why does Vietnamese have multiple words for love?',
        'What does Philotimo mean in Greek?',
        'What is Weltschmerz?',
        'How does loneliness feel in the body?',
      ],
      el: [
        'Τι σημαίνει φιλότιμο;',
        'Ποια είναι η διαφορά μεταξύ ντροπής και ενοχής;',
        'Γιατί τα Ελληνικά έχουν τόσες λέξεις για την αγάπη;',
        'Πώς εκφράζεται η μελαγχολία στην ελληνική κουλτούρα;',
        'Τι είναι το Weltschmerz;',
      ],
    };

    const introText = {
      de: 'Stell eine Frage über Gefühle, Sprache oder Kulturen — ich antworte mit Wissen aus der App.',
      vi: 'Đặt câu hỏi về cảm xúc, ngôn ngữ hoặc văn hóa.',
      en: 'Ask about emotions, language, or cultures — I answer from the app\'s knowledge base.',
      el: 'Ρώτα για συναισθήματα, γλώσσα ή πολιτισμούς — απαντώ με βάση τη γνώση της εφαρμογής.',
    };
    const placeholderText = {
      de: 'Deine Frage...', vi: 'Câu hỏi của bạn...', en: 'Your question...', el: 'Η ερώτησή σου...',
    };
    const chips = EXAMPLES[lang] || EXAMPLES.en;

    container.innerHTML = `
      <p class="ask-intro">${introText[lang] || introText.en}</p>
      <div class="ask-examples">${chips.map(q => `<button class="ask-example-chip">${q}</button>`).join('')}</div>
      <div class="ask-chat" id="ask-chat"></div>
      <div class="ask-input-row">
        <input class="ask-input" type="text" placeholder="${placeholderText[lang] || placeholderText.en}" maxlength="300">
        <button class="ask-send-btn" aria-label="Senden">→</button>
      </div>`;

    const chat = container.querySelector('#ask-chat');
    const input = container.querySelector('.ask-input');
    const sendBtn = container.querySelector('.ask-send-btn');

    function addMsg(role, text) {
      const div = document.createElement('div');
      div.className = `ask-msg ask-msg-${role}`;
      div.innerHTML = role === 'ai'
        ? `<span class="ask-msg-icon">💛</span><span class="ask-msg-text">${text}</span>`
        : `<span class="ask-msg-text">${text}</span>`;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
      return div;
    }

    async function send() {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      sendBtn.disabled = true;
      addMsg('user', q);

      const aiDiv = addMsg('ai', '<span class="ask-dots"><span></span><span></span><span></span></span>');
      const textEl = aiDiv.querySelector('.ask-msg-text');

      if (typeof GefuehleAPI === 'undefined') {
        textEl.textContent = lang === 'de'
          ? 'KI nicht verfügbar.'
          : 'AI not available.';
        sendBtn.disabled = false;
        return;
      }

      let fullText = '';
      const result = await GefuehleAPI.streamAsk({ question: q, lang }, (chunk) => {
        if (!fullText) textEl.textContent = '';
        fullText += chunk;
        textEl.textContent = fullText;
        chat.scrollTop = chat.scrollHeight;
      });

      if (!result.ok) {
        const isRateLimit = result.error && result.error.includes('429');
        textEl.textContent = isRateLimit
          ? (lang === 'de' ? 'KI momentan überlastet — bitte kurz warten und nochmal versuchen.' : 'AI is currently rate-limited — please try again in a moment.')
          : (lang === 'de' ? 'Keine Antwort von der KI erhalten.' : 'No response from AI.');
      }

      sendBtn.disabled = false;
      input.focus();
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    container.querySelectorAll('.ask-example-chip').forEach(chip => {
      chip.addEventListener('click', () => { input.value = chip.textContent; send(); });
    });
  }

  /* ---- Share ---- */
  function shareGame() {
    const text = t('shareText')
      .replace('{lang1}', LANGUAGES[state.lang1]?.name)
      .replace('{lang2}', LANGUAGES[state.lang2]?.name);
    if (navigator.share) {
      navigator.share({ title: t('title'), text, url: location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + ' ' + location.href).then(() => alert('Link copied! ✓'));
    }
  }

  /* ---- Sync settings between landing and active selects ---- */
  function syncSettingsFromLanding() {
    state.lang1 = dom.lang1Select.value;
    state.lang2 = dom.lang2Select.value;
    state.uiLang = state.lang1;
    state.difficulty = dom.difficultySelect.value;
    state.category = dom.categorySelect.value;
    state.playerCount = parseInt(dom.playerCountSelect.value);
  }

  function syncSettingsFromActive() {
    if (dom.difficultySelectActive) {
      state.difficulty = dom.difficultySelectActive.value;
      dom.difficultySelect.value = state.difficulty;
    }
    if (dom.categorySelectActive) {
      state.category = dom.categorySelectActive.value;
      dom.categorySelect.value = state.category;
    }
    if (dom.playerCountSelectActive) {
      state.playerCount = parseInt(dom.playerCountSelectActive.value);
      dom.playerCountSelect.value = String(state.playerCount);
    }
  }

  /* ---- Events ---- */
  function bindEvents() {
    dom.promptClose.addEventListener('click', hidePrompt);
    if (dom.promptShare) {
      dom.promptShare.addEventListener('click', e => {
        e.stopPropagation();
        if (typeof GefuehleAPI !== 'undefined' && dom.promptShare.dataset.emotionId) {
          GefuehleAPI.shareEmotion({ emotionId: dom.promptShare.dataset.emotionId, lang1: state.lang1, lang2: state.lang2 });
        }
      });
    }
    dom.promptOverlay.addEventListener('click', e => {
      if (e.target.closest('.speak-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.speak-btn');
        speakWord(btn.dataset.speakWord, btn.dataset.speakLang);
        return;
      }
      if (e.target === dom.promptOverlay) hidePrompt();
    });
    $('#btn-play-again').addEventListener('click', () => {
      hideCongrats();
      state.multiplayerStarted = false;
      startGame();
    });
    $('#btn-share').addEventListener('click', () => { hideCongrats(); shareGame(); });
    dom.newGameBtn.addEventListener('click', () => {
      state.multiplayerStarted = false;
      startGame();
    });

    // Mode card clicks (landing grid)
    dom.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        syncSettingsFromLanding();
        state.mode = card.dataset.mode;
        state.multiplayerStarted = false;
        hideLanding();
        updateUIText();
        startGame();
      });
    });

    // Back button
    dom.backBtn.addEventListener('click', () => {
      clearInterval(state.timerInterval);
      showLanding();
    });

    // Settings bar toggle
    dom.settingsBarToggle.addEventListener('click', () => {
      dom.settingsBar.classList.toggle('open');
    });

    // Landing settings changes
    dom.lang1Select.addEventListener('change', () => {
      state.lang1 = dom.lang1Select.value;
      state.uiLang = state.lang1;
      updateUIText();
      updateSettingsSummary();
    });
    dom.lang2Select.addEventListener('change', () => {
      state.lang2 = dom.lang2Select.value;
      updateSettingsSummary();
    });
    dom.categorySelect.addEventListener('change', () => {
      state.category = dom.categorySelect.value;
      updateSettingsSummary();
    });
    dom.difficultySelect.addEventListener('change', () => {
      state.difficulty = dom.difficultySelect.value;
      updateSettingsSummary();
    });
    dom.playerCountSelect.addEventListener('change', () => {
      state.playerCount = parseInt(dom.playerCountSelect.value);
    });

    // Active mode settings changes
    if (dom.difficultySelectActive) {
      dom.difficultySelectActive.addEventListener('change', () => {
        syncSettingsFromActive();
        state.multiplayerStarted = false;
        startGame();
      });
    }
    if (dom.categorySelectActive) {
      dom.categorySelectActive.addEventListener('change', () => {
        syncSettingsFromActive();
        state.multiplayerStarted = false;
        startGame();
      });
    }
    if (dom.playerCountSelectActive) {
      dom.playerCountSelectActive.addEventListener('change', () => {
        syncSettingsFromActive();
        state.multiplayerStarted = false;
        state.playerNames = [];
        state.playerScores = [];
        if (state.mode === 'classic') startGame();
      });
    }

    dom.darkModeBtn.addEventListener('click', toggleDarkMode);

    // Settings button
    if (dom.settingsBtn) {
      dom.settingsBtn.addEventListener('click', () => {
        if (typeof GefuehleAI !== 'undefined') {
          GefuehleAI.createSettingsModal(state.uiLang);
        }
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        hidePrompt();
        hideCongrats();
        // If in a mode, go back to landing
        if (!state.showLanding) {
          clearInterval(state.timerInterval);
          showLanding();
        }
      }
    });
  }

  /* ---- Init ---- */
  /* ---- Onboarding ---- */
  function initOnboarding() {
    const ONBOARDING_KEY = 'gefuehle-onboarded';
    if (localStorage.getItem(ONBOARDING_KEY)) return;

    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    let step = 1;
    let pendingLang1 = 'en', pendingLang2 = 'el', pendingMode = 'classic';

    // Detect browser language for onboarding UI text
    const _bl = (navigator.language || 'en').split('-')[0];
    const OB_LANG = Object.keys(UI_TEXT).includes(_bl) ? _bl : 'en';
    const OB_T = {
      welcome: { de: 'Willkommen!', vi: 'Chào mừng!', en: 'Welcome!', tr: 'Hoş geldiniz!', ar: 'أهلاً بك!', es: '¡Bienvenido!', fr: 'Bienvenue!', uk: 'Ласкаво просимо!', pl: 'Witaj!', el: 'Καλωσόρισες!', ta: 'வரவேற்கிறோம்!' },
      langQ:   { de: 'Welche Sprachen verbindest du?', vi: 'Bạn muốn kết nối ngôn ngữ nào?', en: 'Which languages connect you?', tr: 'Hangi dilleri bağlıyorsun?', ar: 'أي لغات تربطك؟', es: '¿Qué idiomas te conectan?', fr: 'Quelles langues te connectent?', uk: 'Які мови тебе з\'єднують?', pl: 'Jakie języki Cię łączą?', el: 'Ποιες γλώσσες σε ενώνουν;', ta: 'எந்த மொழிகள் உங்களை இணைக்கின்றன?' },
      next:    { de: 'Weiter →', vi: 'Tiếp →', en: 'Next →', tr: 'İleri →', ar: 'التالي →', es: 'Siguiente →', fr: 'Suivant →', uk: 'Далі →', pl: 'Dalej →', el: 'Επόμενο →', ta: 'அடுத்து →' },
      skip:    { de: 'Direkt loslegen →', vi: 'Bắt đầu ngay →', en: 'Skip intro →', tr: 'Hemen başla →', ar: 'ابدأ مباشرة →', es: 'Empezar →', fr: 'Commencer →', uk: 'Одразу почати →', pl: 'Od razu zacznij →', el: 'Ξεκίνα →', ta: 'நேரடியாக தொடங்கு →' },
      modeQ:   { de: 'Wie möchtest du starten?', vi: 'Bạn muốn bắt đầu như thế nào?', en: 'How do you want to start?', tr: 'Nasıl başlamak istersin?', ar: 'كيف تريد أن تبدأ؟', es: '¿Cómo quieres empezar?', fr: 'Comment veux-tu commencer?', uk: 'Як ти хочеш почати?', pl: 'Jak chcesz zacząć?', el: 'Πώς θέλεις να ξεκινήσεις;', ta: 'எப்படி தொடங்க விரும்புகிறீர்கள்?' },
      back:    { de: '← Zurück', vi: '← Quay lại', en: '← Back', tr: '← Geri', ar: '← رجوع', es: '← Volver', fr: '← Retour', uk: '← Назад', pl: '← Wstecz', el: '← Πίσω', ta: '← திரும்பு' },
      nameQ:   { de: 'Wie soll ich dich nennen?', vi: 'Tôi nên gọi bạn là gì?', en: 'What should I call you?', tr: 'Seni nasıl çağırayım?', ar: 'ماذا أسميك؟', es: '¿Cómo debo llamarte?', fr: 'Comment dois-je t\'appeler?', uk: 'Як мені тебе звати?', pl: 'Jak mam cię nazywać?', el: 'Πώς να σε αποκαλώ;', ta: 'உங்களை என்னவென்று அழைக்கலாம்?' },
      namePh:  { de: 'Dein Name...', vi: 'Tên của bạn...', en: 'Your name...', tr: 'Adın...', ar: 'اسمك...', es: 'Tu nombre...', fr: 'Ton prénom...', uk: 'Твоє ім\'я...', pl: 'Twoje imię...', el: 'Το όνομά σου...', ta: 'உங்கள் பெயர்...' },
      letsgo:  { de: "Los geht's 🚀", vi: 'Bắt đầu thôi 🚀', en: "Let's go 🚀", tr: 'Hadi gidelim 🚀', ar: 'هيا نبدأ 🚀', es: '¡Vamos! 🚀', fr: 'Allons-y 🚀', uk: 'Поїхали 🚀', pl: 'Ruszamy 🚀', el: 'Πάμε 🚀', ta: 'போகலாம் 🚀' },
    };
    function obt(key) { return OB_T[key][OB_LANG] || OB_T[key].en; }

    const LANG_PAIRS = [
      { l1: 'de', l2: 'vi', f1: '🇩🇪', f2: '🇻🇳', label: 'Deutsch · Tiếng Việt' },
      { l1: 'de', l2: 'tr', f1: '🇩🇪', f2: '🇹🇷', label: 'Deutsch · Türkçe' },
      { l1: 'de', l2: 'ar', f1: '🇩🇪', f2: '🇦🇪', label: 'Deutsch · العربية' },
      { l1: 'de', l2: 'uk', f1: '🇩🇪', f2: '🇺🇦', label: 'Deutsch · Українська' },
      { l1: 'en', l2: 'el', f1: '🇬🇧', f2: '🇬🇷', label: 'English · Ελληνικά' },
      { l1: 'en', l2: 'ta', f1: '🇬🇧', f2: '🇮🇳', label: 'English · Tamil' },
    ];

    const MODE_OPTIONS = [
      { mode: 'classic', players: 2, icon: '👨‍👩‍👧‍👦', de: 'Familie',    en: 'Family',    desc_de: 'Memory zusammen spielen',    desc_en: 'Play Memory together' },
      { mode: 'talk',                  icon: '💬',        de: 'Gespräch',   en: 'Talk',      desc_de: 'Karten ziehen & reden',       desc_en: 'Draw cards & talk' },
      { mode: 'checkin',               icon: '🌿',        de: 'Täglich',    en: 'Daily',     desc_de: 'Check-in & Bedürfnisse',     desc_en: 'Daily check-in & needs' },
      { mode: 'learn',                 icon: '🧠',        de: 'Lernen',     en: 'Learn',     desc_de: 'Vokabeln & Sprache',          desc_en: 'Vocabulary & language' },
    ];

    const PROFILE_EMOJIS = ['💛', '🌙', '🌿', '🦋', '🔥', '⭐', '🌸', '🎯', '🧠', '💬', '🐬', '☀️'];

    function stepIndicator() {
      return `<div class="ob-step-indicator">${[1,2,3].map(i =>
        `<span class="ob-dot ${i === step ? 'active' : i < step ? 'done' : ''}"></span>`
      ).join('')}</div>`;
    }

    function renderStep1() {
      const langPairHTML = LANG_PAIRS.map(p =>
        `<button class="ob-lang-btn ${p.l1 === pendingLang1 && p.l2 === pendingLang2 ? 'selected' : ''}" data-l1="${p.l1}" data-l2="${p.l2}">
          <span class="ob-lang-flags">${p.f1} ↔ ${p.f2}</span>
          <span class="ob-lang-label">${p.label}</span>
        </button>`
      ).join('');
      const langOptions = Object.entries(LANGUAGES).map(([code, l]) =>
        `<option value="${code}"${code === pendingLang1 ? ' selected' : ''}>${l.flag} ${l.name}</option>`
      ).join('');
      const langOptions2 = Object.entries(LANGUAGES).map(([code, l]) =>
        `<option value="${code}"${code === pendingLang2 ? ' selected' : ''}>${l.flag} ${l.name}</option>`
      ).join('');
      return `
        <div class="ob-emoji">💛</div>
        <h2 class="ob-title">${obt('welcome')}</h2>
        <p class="ob-subtitle">${obt('langQ')}</p>
        <div class="ob-lang-pairs">${langPairHTML}</div>
        <div class="ob-custom-row">
          <select class="ob-select" id="ob-l1">${langOptions}</select>
          <span class="ob-lang-sep">↔</span>
          <select class="ob-select" id="ob-l2">${langOptions2}</select>
        </div>
        <button class="ob-next-btn ob-primary">${obt('next')}</button>
        <button class="ob-skip">${obt('skip')}</button>`;
    }

    function renderStep2() {
      const lang = pendingLang1;
      return `
        <p class="ob-subtitle" style="margin-bottom:16px">${obt('modeQ')}</p>
        <div class="ob-mode-grid">
          ${MODE_OPTIONS.map(m => `
            <button class="ob-mode-btn" data-mode="${m.mode}"${m.players ? ` data-players="${m.players}"` : ''}>
              <span class="ob-mode-icon">${m.icon}</span>
              <span class="ob-mode-name">${OB_LANG === 'de' ? m.de : m.en}</span>
              <span class="ob-mode-desc">${OB_LANG === 'de' ? m.desc_de : m.desc_en}</span>
            </button>`).join('')}
        </div>
        <button class="ob-back ob-link">${obt('back')}</button>
        <button class="ob-skip">${obt('skip')}</button>`;
    }

    function renderStep3() {
      const lang = pendingLang1;
      const saved = JSON.parse(localStorage.getItem('gefuehle-profile') || '{}');
      return `
        <p class="ob-subtitle" style="margin-bottom:16px">${obt('nameQ')}</p>
        <input class="ob-name-input" type="text" placeholder="${obt('namePh')}" maxlength="30" value="${saved.name || ''}">
        <div class="ob-emoji-grid">
          ${PROFILE_EMOJIS.map(e => `<button class="ob-emoji-btn${(saved.emoji || '💛') === e ? ' selected' : ''}" data-emoji="${e}">${e}</button>`).join('')}
        </div>
        <button class="ob-start-btn ob-primary">${obt('letsgo')}</button>
        <button class="ob-back ob-link">${obt('back')}</button>`;
    }

    function render() {
      const card = overlay.querySelector('.onboarding-card');
      const steps = { 1: renderStep1, 2: renderStep2, 3: renderStep3 };
      card.innerHTML = stepIndicator() + steps[step]();
      bindStep();
    }

    function bindStep() {
      // Step 1 — language pair buttons
      overlay.querySelectorAll('.ob-lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.querySelectorAll('.ob-lang-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          pendingLang1 = btn.dataset.l1;
          pendingLang2 = btn.dataset.l2;
          const s1 = overlay.querySelector('#ob-l1'), s2 = overlay.querySelector('#ob-l2');
          if (s1) s1.value = pendingLang1;
          if (s2) s2.value = pendingLang2;
        });
      });
      overlay.querySelector('#ob-l1')?.addEventListener('change', e => {
        pendingLang1 = e.target.value;
        overlay.querySelectorAll('.ob-lang-btn').forEach(b => b.classList.remove('selected'));
      });
      overlay.querySelector('#ob-l2')?.addEventListener('change', e => {
        pendingLang2 = e.target.value;
        overlay.querySelectorAll('.ob-lang-btn').forEach(b => b.classList.remove('selected'));
      });

      // Step 2 — mode buttons (click → go to step 3)
      overlay.querySelectorAll('.ob-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          pendingMode = btn.dataset.mode;
          if (btn.dataset.players) state.playerCount = parseInt(btn.dataset.players);
          step = 3; render();
        });
      });

      // Next (step 1)
      overlay.querySelector('.ob-next-btn')?.addEventListener('click', () => { step = 2; render(); });

      // Back
      overlay.querySelector('.ob-back')?.addEventListener('click', () => { step = Math.max(1, step - 1); render(); });

      // Skip
      overlay.querySelector('.ob-skip')?.addEventListener('click', () => { applyAndDismiss(false); });

      // Step 3 — emoji picker
      overlay.querySelectorAll('.ob-emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.querySelectorAll('.ob-emoji-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });

      // Step 3 — start
      overlay.querySelector('.ob-start-btn')?.addEventListener('click', () => {
        const name = (overlay.querySelector('.ob-name-input')?.value || '').trim();
        const emoji = overlay.querySelector('.ob-emoji-btn.selected')?.dataset.emoji || '💛';
        const profile = { name, emoji };
        localStorage.setItem('gefuehle-profile', JSON.stringify(profile));
        renderProfileInHeader(profile);
        if (typeof GefuehleAPI !== 'undefined') {
          GefuehleAPI.updateProfile({ display_name: name, avatar_emoji: emoji });
        }
        applyAndDismiss(true);
      });
    }

    function applyAndDismiss(startGame_) {
      state.lang1 = pendingLang1;
      state.lang2 = pendingLang2;
      state.uiLang = state.lang1;
      state.mode = pendingMode;
      dom.lang1Select.value = pendingLang1;
      dom.lang2Select.value = pendingLang2;
      updateUIText();
      updateSettingsSummary();
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
      localStorage.setItem(ONBOARDING_KEY, '1');
      if (startGame_) {
        showLanding();
        setTimeout(() => { hideLanding(); startGame(); }, 50);
      } else {
        showLanding();
      }
    }

    render();
    overlay.style.display = '';
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }

  /* ---- Profile display in header ---- */
  function renderProfileInHeader(profile) {
    const el = document.getElementById('user-profile-display');
    if (!el || !profile) return;
    el.innerHTML = profile.name
      ? `${profile.emoji} <span class="profile-name">${profile.name}</span>`
      : profile.emoji;
    el.style.display = '';
  }

  /* ---- Notification permission banner ---- */
  function requestNotificationPermission(lang) {
    if (document.querySelector('.notification-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'notification-banner';
    const yes = lang === 'de' ? 'Ja, gerne' : lang === 'el' ? 'Ναι' : 'Yes please';
    const no  = lang === 'de' ? 'Nein' : lang === 'el' ? 'Όχι' : 'No';
    const msg = lang === 'de' ? '🔔 Tägliche Erinnerung aktivieren?' : lang === 'el' ? '🔔 Ενεργοποίηση ημερήσιας υπενθύμισης;' : '🔔 Enable daily reminder?';
    banner.innerHTML = `<span class="notif-msg">${msg}</span>
      <button class="notif-yes">${yes}</button>
      <button class="notif-no">${no}</button>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));
    const hide = () => { banner.classList.remove('visible'); setTimeout(() => banner.remove(), 300); };
    banner.querySelector('.notif-yes').addEventListener('click', async () => {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') localStorage.setItem('gefuehle-reminder-enabled', '1');
      hide();
    });
    banner.querySelector('.notif-no').addEventListener('click', hide);
  }

  /* ---- Streak card on landing ---- */
  function computeLocalStreak(entries) {
    if (!entries.length) return 0;
    const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    let streak = 0, expected = dates[0];
    for (const d of dates) {
      if (d === expected) {
        streak++;
        const dt = new Date(expected); dt.setDate(dt.getDate() - 1);
        expected = dt.toISOString().split('T')[0];
      } else break;
    }
    return streak;
  }

  function renderStreakCard() {
    const el = document.getElementById('streak-card');
    if (!el) return;
    const entries = typeof GefuehleAPI !== 'undefined' ? GefuehleAPI.getCheckinEntries() : [];
    if (!entries.length) {
      const lang = state.uiLang;
      el.innerHTML = `<div class="streak-empty">
        <span class="streak-empty-icon">🌱</span>
        <div class="streak-empty-body">
          <span class="streak-empty-text">${lang === 'de' ? 'Wie geht es dir heute?' : lang === 'el' ? 'Πώς νιώθεις σήμερα;' : lang === 'vi' ? 'Hôm nay bạn cảm thấy thế nào?' : 'How are you feeling today?'}</span>
          <button class="streak-cta">${lang === 'de' ? 'Check-in starten →' : lang === 'el' ? 'Ξεκίνα check-in →' : lang === 'vi' ? 'Bắt đầu →' : 'Start check-in →'}</button>
        </div>
      </div>`;
      el.style.display = '';
      el.querySelector('.streak-cta').addEventListener('click', () => {
        syncSettingsFromLanding(); state.mode = 'checkin'; hideLanding(); startGame();
      });
      return;
    }
    const streak = computeLocalStreak(entries);
    // Update PWA badge icon with streak count (iOS Safari 16.4+, Chrome)
    if ('setAppBadge' in navigator) {
      if (streak > 0) navigator.setAppBadge(streak).catch(() => {});
      else navigator.clearAppBadge().catch(() => {});
    }
    const lang = state.uiLang;
    const today = new Date().toISOString().split('T')[0];
    const hasToday = entries.some(e => e.date === today);
    const streakBadge = streak > 1
      ? `<span class="streak-badge">🔥 ${streak} ${lang === 'de' ? 'Tage am Stück' : lang === 'el' ? 'μέρες συνεχόμενα' : 'days in a row'}</span>`
      : streak === 1
        ? `<span class="streak-badge">🌱 ${lang === 'de' ? 'Heute dabei!' : lang === 'el' ? 'Σήμερα εδώ!' : 'You showed up!'}</span>`
        : '';
    const statusText = hasToday
      ? `✓ ${lang === 'de' ? 'Heute eingecheckt' : lang === 'el' ? 'Σήμερα check-in' : 'Checked in today'}`
      : `${lang === 'de' ? 'Noch kein Check-in heute' : lang === 'el' ? 'Δεν έγινε check-in σήμερα' : 'No check-in yet today'}`;
    const actionText = hasToday
      ? (lang === 'de' ? 'Check-in anschauen →' : lang === 'el' ? 'Προβολή check-in →' : 'View check-in →')
      : (lang === 'de' ? 'Jetzt einchecken →' : lang === 'el' ? 'Check-in τώρα →' : 'Check in now →');
    el.innerHTML = `<div class="streak-inner">
      ${streakBadge}
      <span class="streak-status">${statusText}</span>
      <button class="streak-cta">${actionText}</button>
    </div>`;
    el.style.display = '';
    el.querySelector('.streak-cta').addEventListener('click', () => {
      syncSettingsFromLanding(); state.mode = 'checkin'; hideLanding(); startGame();
    });
  }

  /* ---- Weekly AI recap card on landing ---- */
  function renderWeeklyRecap() {
    const el = document.getElementById('weekly-recap-card');
    if (!el) return;
    const JOURNAL_KEY = 'gefuehle-journal';
    const entries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    if (entries.length < 3) { el.style.display = 'none'; return; }
    const lang = state.uiLang;
    const weekKey = 'gefuehle-weekly-recap-' + (function(){
      const d = new Date(), j = new Date(d.getFullYear(),0,1);
      return Math.ceil(((d-j)/86400000+j.getDay()+1)/7);
    })();
    const cached = localStorage.getItem(weekKey);
    el.innerHTML = `<div class="recap-inner">
      <span class="recap-label">🤖 ${lang === 'de' ? 'Wöchentlicher Rückblick' : lang === 'el' ? 'Εβδομαδιαία ανασκόπηση' : 'Weekly Recap'}</span>
      ${cached
        ? `<p class="recap-text">${cached}</p>`
        : `<button class="recap-btn">${lang === 'de' ? 'Muster erkennen' : lang === 'el' ? 'Ανάλυση προτύπων' : 'Analyze patterns'}</button>
           <div class="recap-result"></div>`}
    </div>`;
    el.style.display = '';
    el.querySelector('.recap-btn')?.addEventListener('click', async () => {
      const btn = el.querySelector('.recap-btn');
      btn.disabled = true; btn.innerHTML = '<span class="ai-spinner"></span>';
      try {
        let result = '';
        if (typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline()) {
          const userId = await GefuehleAPI.getOrFetchUserId();
          const res = await GefuehleAPI.apiFetch('/ai/journal-analysis', {
            method: 'POST', body: JSON.stringify({ user_id: userId, lang })
          }).catch(() => null);
          if (res?.insight) result = res.insight;
        }
        if (!result && typeof GefuehleAI !== 'undefined') {
          result = await GefuehleAI.generateJournalInsight(entries, lang);
        }
        if (result) {
          localStorage.setItem(weekKey, result);
          el.querySelector('.recap-result').textContent = result;
          btn.style.display = 'none';
        } else { btn.disabled = false; btn.textContent = lang === 'de' ? 'Muster erkennen' : 'Analyze patterns'; }
      } catch { btn.disabled = false; btn.textContent = lang === 'de' ? 'Muster erkennen' : 'Analyze patterns'; }
    });
  }

  /* ---- Notification reminder on app open ---- */
  function checkReminder() {
    const REMINDER_KEY = 'gefuehle-reminder-enabled';
    const JOURNAL_KEY = 'gefuehle-journal';
    if (!localStorage.getItem(REMINDER_KEY)) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const today = new Date().toISOString().split('T')[0];
    const entries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    const hasToday = entries.some(e => e.date === today);
    if (!hasToday) {
      const hour = new Date().getHours();
      if (hour >= 19) { // Only show reminder in the evening
        new Notification('Gefühle-Memory 💛', {
          body: 'Wie war dein Tag? Dein Journal wartet.',
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💛</text></svg>',
        });
      }
    }
  }

  function init() {
    cacheDom();
    initDarkMode();
    bindEvents();
    updateUIText();
    checkReminder();
    // Restore profile display
    const savedProfile = JSON.parse(localStorage.getItem('gefuehle-profile') || 'null');
    if (savedProfile) renderProfileInHeader(savedProfile);
    // When backend comes online, refresh AI-dependent UI
    document.addEventListener('backend-online', () => {
      renderStreakCard();
      renderWeeklyRecap();
    });
    // Check onboarding before showing landing
    const ONBOARDING_KEY = 'gefuehle-onboarded';
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      // Show landing first, then onboarding overlay
      showLanding();
      initOnboarding();
    } else {
      showLanding();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
