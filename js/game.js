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
  const LANG_SPEECH_MAP = { de: 'de-DE', vi: 'vi-VN', en: 'en-GB' };

  /* ---- State ---- */
  let state = {
    lang1: 'de',
    lang2: 'vi',
    uiLang: 'de',
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
  }

  function hideLanding() {
    state.showLanding = false;
    document.body.classList.remove('show-landing');
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
      name: { de: 'Journal', vi: 'Nhật ký', en: 'Journal' },
      desc: { de: 'Tägliche Reflexion', vi: 'Suy ngẫm hàng ngày', en: 'Daily reflection' }
    }
  };

  const MODE_GROUPS = {
    de: { spielen: 'Spielen', entdecken: 'Entdecken', lernen: 'Lernen' },
    vi: { spielen: 'Chơi', entdecken: 'Khám phá', lernen: 'Học' },
    en: { spielen: 'Play', entdecken: 'Discover', lernen: 'Learn' }
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
      if (nameEl) nameEl.textContent = data.name[lang] || data.name.de;
      if (descEl) descEl.textContent = data.desc[lang] || data.desc.de;
    });

    // Update group labels
    const groups = MODE_GROUPS[lang] || MODE_GROUPS.de;
    const labels = $$('.mode-group-label');
    if (labels[0]) labels[0].textContent = groups.spielen;
    if (labels[1]) labels[1].textContent = groups.entdecken;
    if (labels[2]) labels[2].textContent = groups.lernen;

    // Update landing hero
    const heroTitle = $('.landing-title');
    const heroSubtitle = $('.landing-subtitle');
    if (heroTitle) heroTitle.textContent = t('title');
    if (heroSubtitle) {
      heroSubtitle.textContent = lang === 'de' ? '67 Gefühle · 6 Kategorien · 3 Sprachen'
        : lang === 'vi' ? '67 cảm xúc · 6 loại · 3 ngôn ngữ'
        : '67 emotions · 6 categories · 3 languages';
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

    dom.board.style.display = isClassic ? '' : 'none';
    dom.statsBar.style.display = isClassic ? '' : 'none';
    dom.controlsRow2.style.display = (isCheckin || isWheel || isJournal || isLearn) ? 'none' : '';
    dom.talkMode.classList.toggle('active', isTalk);
    dom.storyMode.classList.toggle('active', isStory);
    dom.checkinMode.classList.toggle('active', isCheckin);
    dom.wheelMode.classList.toggle('active', isWheel);
    dom.journalMode.classList.toggle('active', isJournal);
    if (dom.learnMode) dom.learnMode.classList.toggle('active', isLearn);
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
        $(`.card[data-index="${i}"]`, dom.board).classList.add('matched');
        $(`.card[data-index="${j}"]`, dom.board).classList.add('matched');
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
    const cultureNote = (typeof getCultureNote === 'function') ? getCultureNote(emo.id, state.uiLang) : null;
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
          <div class="hint-word-row"><span class="hint-flag">🇩🇪</span> <strong>${emo.de}</strong> ${makeSpeakButton(emo.de, 'de')}</div>
          <div class="hint-word-row"><span class="hint-flag">🇻🇳</span> <strong>${emo.vi}</strong> ${makeSpeakButton(emo.vi, 'vi')}</div>
          <div class="hint-word-row"><span class="hint-flag">🇬🇧</span> <strong>${emo.en}</strong> ${makeSpeakButton(emo.en, 'en')}</div>
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
            state.uiLang
          );
          resultEl.innerHTML = `<div class="ai-insight-box">🤖 ${text}</div>`;
          aiBtn.style.display = 'none';
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
  function initTalkMode() {
    const container = dom.talkMode;
    const deck = shuffle(getEmotions());
    let index = 0;
    const cardDisplay = $('.talk-card-display', container);
    const prompt = $('.talk-prompt', container);
    const drawBtn = $('.draw-btn', container);
    const intro = $('.talk-intro', container);
    intro.textContent = t('talkIntro');
    drawBtn.textContent = t('drawCard');

    function show() {
      const emo = deck[index % deck.length];
      const color = getCategoryColor(emo.category);
      cardDisplay.innerHTML = `
        <span class="card-emoji">${emo.emoji}</span>
        <span class="card-word" style="color:${color}">${emo[state.lang1]} ${makeSpeakButton(emo[state.lang1], state.lang1)}</span>
        <span class="card-word-secondary">${emo[state.lang2]} ${makeSpeakButton(emo[state.lang2], state.lang2)}</span>`;
      cardDisplay.style.borderTop = `4px solid ${color}`;
      prompt.textContent = emo.prompt[state.uiLang] || emo.prompt.de;
    }
    drawBtn.onclick = () => {
      index++;
      cardDisplay.style.transform = 'scale(.9) rotateZ(-3deg)';
      setTimeout(() => { show(); cardDisplay.style.transform = ''; }, 200);
    };

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

    function draw() {
      const three = shuffle(getEmotions()).slice(0, 3);
      cardsEl.innerHTML = '';
      three.forEach(emo => {
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
  function initCheckinMode() {
    const container = dom.checkinMode;
    state.checkinSelections = {};
    const lang = state.uiLang;

    let html = `
      <h2 class="checkin-title">${t('checkinTitle')}</h2>
      <p class="checkin-subtitle">${t('checkinSubtitle')}</p>
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
      list.innerHTML = selected.map(needId => {
        const need = NEEDS.find(n => n.id === needId);
        return `<span class="chosen-tag">${need.emoji} ${need[lang] || need.de}</span>`;
      }).join('');
    } else {
      summary.style.display = 'none';
    }
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

    const aiAvailable = typeof GefuehleAI !== 'undefined';
    let aiPatternHTML = '';
    if (entries.length >= 3) {
      if (aiAvailable && GefuehleAI.isConfigured()) {
        aiPatternHTML = `
          <button class="ai-culture-btn journal-pattern-btn">${t('journalPattern')}</button>
          <div class="journal-ai-result"></div>`;
      } else if (aiAvailable) {
        aiPatternHTML = `<div class="ai-setup-hint">${t('aiSetup')}</div>`;
      }
    }

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
      ${aiPatternHTML}
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

    container.querySelector('.journal-save-btn')?.addEventListener('click', () => {
      if (selectedEmotions.size === 0) return;
      const note = container.querySelector('.journal-note-field')?.value || '';
      const entry = {
        date: dateStr,
        emotions: [...selectedEmotions],
        note,
        aiInsight: ''
      };
      const allEntries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
      allEntries.push(entry);
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(allEntries));
      const msg = container.querySelector('.journal-saved-msg');
      msg.classList.add('show');
      setTimeout(() => {
        msg.classList.remove('show');
        initJournalMode();
      }, 1500);
    });

    container.querySelectorAll('.journal-entry').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('expanded');
      });
    });

    const patternBtn = container.querySelector('.journal-pattern-btn');
    if (patternBtn) {
      patternBtn.addEventListener('click', async () => {
        const resultEl = container.querySelector('.journal-ai-result');
        patternBtn.disabled = true;
        patternBtn.innerHTML = `<span class="ai-spinner"></span>${t('aiLoading')}`;
        try {
          const allEntries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
          const insight = await GefuehleAI.generateJournalInsight(allEntries, state.uiLang);
          resultEl.innerHTML = `<div class="journal-ai-card"><h4>🤖 ${t('journalPattern')}</h4><p>${insight}</p></div>`;
          patternBtn.style.display = 'none';
        } catch (err) {
          resultEl.innerHTML = `<div class="ai-setup-hint">Error: ${err.message}</div>`;
          patternBtn.disabled = false;
          patternBtn.textContent = t('journalPattern');
        }
      });
    }
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
  function init() {
    cacheDom();
    initDarkMode();
    bindEvents();
    updateUIText();
    // Skip landing — start classic game immediately
    state.mode = 'classic';
    hideLanding();
    startGame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
