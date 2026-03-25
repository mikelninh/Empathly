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
    dom.wotdMode = $('.wotd-mode');
    dom.detectiveMode = $('.detective-mode');
    dom.needsMapMode = $('.needsmap-mode');
    dom.settingsBtn = $('#btn-settings');
    dom.soundBtn = $('#btn-sound');
    dom.classroomBtn = $('#btn-classroom');
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
      // Dark is default; only switch to light if user explicitly prefers light
      state.darkMode = !window.matchMedia('(prefers-color-scheme: light)').matches;
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
    if (meta) meta.content = state.darkMode ? '#0D0B14' : '#FFF8F0';
  }

  /* ---- Emotion Bookmarks ---- */
  const BOOKMARKS_KEY = 'gefuehle-bookmarks';

  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); }
    catch { return []; }
  }

  function toggleBookmark(emotionId) {
    const bookmarks = getBookmarks();
    const idx = bookmarks.indexOf(emotionId);
    if (idx === -1) {
      bookmarks.push(emotionId);
    } else {
      bookmarks.splice(idx, 1);
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return idx === -1; // true = added
  }

  function isBookmarked(emotionId) {
    return getBookmarks().includes(emotionId);
  }

  function renderFavoritesSection() {
    const el = document.getElementById('favorites-section');
    if (!el) return;
    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) { el.style.display = 'none'; return; }
    const lang = state.uiLang;
    const title = lang === 'de' ? 'Meine Favoriten' : lang === 'vi' ? 'Yêu thích của tôi'
      : lang === 'el' ? 'Τα αγαπημένα μου' : 'My Favourites';
    const chips = bookmarks.map(id => {
      const emo = EMOTIONS.find(e => e.id === id);
      if (!emo) return '';
      const color = getCategoryColor(emo.category);
      return `<button class="fav-chip" data-id="${id}" style="--fav-color:${color}">${emo.emoji} ${emo[lang] || emo.de}</button>`;
    }).join('');
    el.style.display = '';
    el.innerHTML = `<h3 class="fav-title">★ ${title}</h3><div class="fav-chips">${chips}</div>`;
    el.querySelectorAll('.fav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const emo = EMOTIONS.find(e => e.id === chip.dataset.id);
        if (!emo) return;
        // Show the card hint for this emotion
        showCardHint({ emotion: emo, emotionId: emo.id, lang: state.lang1, word: emo[state.lang1] });
      });
    });
  }

  /* ---- Emotion Collection ---- */
  const COLLECTION_KEY = 'gefuehle-collection';

  function getCollection() {
    try { return new Set(JSON.parse(localStorage.getItem(COLLECTION_KEY) || '[]')); }
    catch { return new Set(); }
  }

  function discoverEmotion(emotionId) {
    const col = getCollection();
    const isNew = !col.has(emotionId);
    col.add(emotionId);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify([...col]));
    return isNew;
  }

  function renderCollectionBar() {
    const el = document.getElementById('collection-bar');
    if (!el) return;
    const col = getCollection();
    const count = col.size;
    const total = EMOTIONS.length;
    const pct = Math.round((count / total) * 100);
    const lang = state.uiLang;
    const label = lang === 'de' ? `Du hast ${count} von ${total} Gefühlen entdeckt`
      : lang === 'vi' ? `Bạn đã khám phá ${count}/${total} cảm xúc`
      : lang === 'el' ? `Ανακάλυψες ${count} από ${total} συναισθήματα`
      : `You've discovered ${count} of ${total} emotions`;
    el.style.display = count > 0 ? '' : 'none';
    el.innerHTML = `
      <div class="cbar-label"><span class="cbar-icon">🌟</span>${label}</div>
      <div class="cbar-track"><div class="cbar-fill" style="width:${pct}%"></div></div>`;
  }

  function showDiscoveryBadge(emotionId, emotionName, emoji) {
    const lang = state.uiLang;
    const text = lang === 'de' ? `✨ Neu entdeckt: ${emoji} ${emotionName}`
      : lang === 'vi' ? `✨ Mới khám phá: ${emoji} ${emotionName}`
      : lang === 'el' ? `✨ Νέα ανακάλυψη: ${emoji} ${emotionName}`
      : `✨ New discovery: ${emoji} ${emotionName}`;
    let badge = document.getElementById('discovery-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'discovery-badge';
      badge.className = 'discovery-badge';
      document.body.appendChild(badge);
    }
    badge.textContent = text;
    badge.classList.add('visible');
    clearTimeout(badge._timer);
    badge._timer = setTimeout(() => badge.classList.remove('visible'), 2800);
  }

  /* ---- Sound Engine ---- */
  let _audioCtx = null;
  function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  function isSoundOn() {
    return localStorage.getItem('gefuehle-sound') !== 'false';
  }

  function toggleSound() {
    const on = !isSoundOn();
    localStorage.setItem('gefuehle-sound', on ? 'true' : 'false');
    if (dom.soundBtn) dom.soundBtn.textContent = on ? '🔊' : '🔇';
  }

  function initSound() {
    if (dom.soundBtn) {
      dom.soundBtn.textContent = isSoundOn() ? '🔊' : '🔇';
      dom.soundBtn.addEventListener('click', toggleSound);
    }
  }

  function playMatchSound() {
    if (!isSoundOn()) return;
    try {
      const ctx = getAudioCtx();
      // Two-note chime: root + fifth
      [[523.25, 0, 0.12], [784, 0.08, 0.18]].forEach(([freq, delay, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.05);
      });
    } catch (_) {}
  }

  function playNoMatchSound() {
    if (!isSoundOn()) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  }

  function playCongratsSound() {
    if (!isSoundOn()) return;
    try {
      const ctx = getAudioCtx();
      // Ascending arpeggio
      [523.25, 659.25, 784, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (_) {}
  }

  /* ---- Classroom / Presentation Mode ---- */
  let _classroomMode = false;

  function isClassroomMode() { return _classroomMode; }

  function toggleClassroomMode() {
    _classroomMode = !_classroomMode;
    document.body.classList.toggle('classroom-mode', _classroomMode);
    if (dom.classroomBtn) {
      dom.classroomBtn.textContent = _classroomMode ? '🏫' : '📽';
      dom.classroomBtn.title = _classroomMode ? 'Präsentationsmodus beenden' : 'Präsentationsmodus';
    }
    if (_classroomMode) {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function initClassroomMode() {
    if (dom.classroomBtn) {
      dom.classroomBtn.addEventListener('click', toggleClassroomMode);
    }
    // Exit classroom mode on Escape
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && _classroomMode) {
        _classroomMode = false;
        document.body.classList.remove('classroom-mode');
        if (dom.classroomBtn) dom.classroomBtn.textContent = '📽';
      }
    });
  }

  // Auto-speak prompt in classroom mode
  function classroomSpeakPrompt(text, lang) {
    if (!_classroomMode || !isSoundOn()) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANG_SPEECH_MAP[lang] || 'de-DE';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
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

  /* ---- Premium ---- */
  function isPremium() {
    return localStorage.getItem('gefuehle-premium') === 'true';
  }

  function showPremiumGate(uiLang) {
    const L = (de, en, vi, el) => uiLang === 'de' ? de : uiLang === 'vi' ? vi : uiLang === 'el' ? el : en;
    const overlay = document.createElement('div');
    overlay.className = 'premium-gate-overlay';
    overlay.innerHTML = `
      <div class="premium-gate-card">
        <div class="premium-gate-icon">✨</div>
        <h3>${L('Premium freischalten', 'Unlock Premium', 'Mở khóa Premium', 'Ξεκλείδωσε Premium')}</h3>
        <p>${L('Alle KI-Funktionen, Tandem-Modus und mehr — für €4,99 / Monat.', 'All AI features, Tandem mode and more — €4.99 / month.', 'Tất cả tính năng AI và chế độ Tandem — €4,99/tháng.', 'Όλες οι λειτουργίες AI και Tandem — €4,99/μήνα.')}</p>
        <div class="premium-gate-features">
          <div>🤖 ${L('Unbegrenzte KI-Gespräche', 'Unlimited AI conversations', 'Hội thoại AI không giới hạn', 'Απεριόριστες συνομιλίες AI')}</div>
          <div>🌍 ${L('Tandem mit echten Partnern', 'Tandem with real partners', 'Tandem với đối tác thật', 'Tandem με πραγματικούς συνεργάτες')}</div>
          <div>🎴 ${L('Physisches Kartenset (Rabatt)', 'Physical card deck (discount)', 'Bộ bài vật lý (giảm giá)', 'Φυσική τράπουλα (έκπτωση)')}</div>
          <div>📊 ${L('Fortschritts-Analytics', 'Progress analytics', 'Phân tích tiến độ', 'Ανάλυση προόδου')}</div>
        </div>
        <button class="btn btn-primary premium-upgrade-btn">
          ${L('Jetzt upgraden — €4,99/Monat', 'Upgrade now — €4.99/month', 'Nâng cấp ngay — €4,99/tháng', 'Αναβάθμιση τώρα — €4,99/μήνα')}
        </button>
        <button class="btn btn-ghost premium-demo-btn">
          ${L('Demo ausprobieren', 'Try demo', 'Dùng thử demo', 'Δοκίμασε demo')}
        </button>
        <button class="premium-gate-close">✕</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
    overlay.querySelector('.premium-gate-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.premium-demo-btn').addEventListener('click', () => {
      // Demo: temporarily grant premium
      localStorage.setItem('gefuehle-premium', 'true');
      overlay.remove();
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  /* ---- Tandem Overlay ---- */
  function showTandemOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'tandem-overlay';
    const container = document.createElement('div');
    container.className = 'tandem-overlay-inner';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tandem-overlay-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    if (typeof GefuehleTandem === 'undefined') {
      container.innerHTML = '<p style="padding:2rem;text-align:center;color:var(--text-muted)">Tandem module not loaded.</p>';
      return;
    }

    const result = GefuehleTandem.connect(
      state.lang1, state.lang2,
      (matchData) => {
        if (matchData.error) {
          GefuehleTandem.renderWaitlistForm(container, state.uiLang);
          return;
        }
        GefuehleTandem.renderMatchedScreen(container, matchData, state.uiLang);
      },
      () => {}
    );

    if (result.mode === 'waitlist') {
      GefuehleTandem.renderWaitlistForm(container, state.uiLang);
    } else {
      GefuehleTandem.renderMatchingScreen(container, state.lang1, state.lang2, state.uiLang);
      // Simulate a match after a few seconds for demo purposes
      GefuehleTandem.simulateMatch((matchData) => {
        if (overlay.isConnected) GefuehleTandem.renderMatchedScreen(container, matchData, state.uiLang);
      });
      const cancelBtn = container.querySelector?.('.tandem-cancel-btn');
      if (cancelBtn) cancelBtn.addEventListener('click', () => { GefuehleTandem.disconnect(); overlay.remove(); });
    }
  }

  /* ---- Physical Deck Configurator ---- */
  function showDeckConfigurator() {
    const uiLang = state.uiLang;
    const L = (de, en, vi, el) => uiLang === 'de' ? de : uiLang === 'vi' ? vi : uiLang === 'el' ? el : en;
    const overlay = document.createElement('div');
    overlay.className = 'deck-overlay';
    overlay.innerHTML = `
      <div class="deck-configurator">
        <button class="deck-close-btn">✕</button>
        <div class="deck-header">
          <div class="deck-header-icon">🎴</div>
          <h2>${L('Dein Gefühle-Kartenset', 'Your Emotion Card Deck', 'Bộ bài cảm xúc của bạn', 'Η τράπουλά σου')}</h2>
          <p>${L('Wähle deine Sprachkombination — wir drucken und liefern weltweit.', 'Choose your language pair — we print and ship worldwide.', 'Chọn cặp ngôn ngữ — chúng tôi in và giao toàn cầu.', 'Διάλεξε ζεύγος γλωσσών — τυπώνουμε και στέλνουμε παγκοσμίως.')}</p>
        </div>
        <div class="deck-preview-row">
          <div class="deck-card-preview" id="deck-preview">
            <div class="deck-preview-word" id="deck-preview-word">Freude</div>
            <div class="deck-preview-translation" id="deck-preview-trans">Joy</div>
            <div class="deck-preview-langs" id="deck-preview-langs">🇩🇪 · 🇬🇧</div>
          </div>
          <div class="deck-options">
            <div class="deck-option-group">
              <label>${L('Sprache 1', 'Language 1', 'Ngôn ngữ 1', 'Γλώσσα 1')}</label>
              <select id="deck-lang1">${Object.entries(LANGUAGES).map(([k,v]) => `<option value="${k}" ${k===state.lang1?'selected':''}>${v.flag} ${v.name}</option>`).join('')}</select>
            </div>
            <div class="deck-option-group">
              <label>${L('Sprache 2', 'Language 2', 'Ngôn ngữ 2', 'Γλώσσα 2')}</label>
              <select id="deck-lang2">${Object.entries(LANGUAGES).map(([k,v]) => `<option value="${k}" ${k===state.lang2?'selected':''}>${v.flag} ${v.name}</option>`).join('')}</select>
            </div>
            <div class="deck-option-group">
              <label>${L('Format', 'Format', 'Định dạng', 'Μορφή')}</label>
              <select id="deck-format">
                <option value="67">67 ${L('Gefühle', 'Emotions', 'Cảm xúc', 'Συναισθήματα')} (${L('Komplett', 'Complete', 'Đầy đủ', 'Πλήρης')})</option>
                <option value="30">30 ${L('Gefühle', 'Emotions', 'Cảm xúc', 'Συναισθήματα')} (${L('Starter', 'Starter', 'Khởi đầu', 'Εκκίνηση')})</option>
              </select>
            </div>
            <div class="deck-price-display">
              <span class="deck-price" id="deck-price">€24,99</span>
              <span class="deck-price-note">${L('inkl. Versand weltweit', 'incl. worldwide shipping', 'gồm giao hàng toàn cầu', 'συμπ. παγκόσμια αποστολή')}</span>
            </div>
          </div>
        </div>
        <div class="deck-actions">
          <button class="btn btn-primary deck-order-btn" id="deck-order-btn">
            🎴 ${L('Jetzt bestellen', 'Order Now', 'Đặt hàng ngay', 'Παράγγειλε τώρα')}
          </button>
          <p class="deck-waitlist-note">${L('Aktuell in Entwicklung — trage dich für Early Access ein!', 'Currently in development — join the waitlist for early access!', 'Đang phát triển — đăng ký để truy cập sớm!', 'Σε ανάπτυξη — εγγράψου για πρώιμη πρόσβαση!')}</p>
          <form class="deck-waitlist-form" id="deck-waitlist-form">
            <input type="email" class="deck-email-input" placeholder="${L('E-Mail', 'Email', 'Email', 'Email')}" required>
            <button type="submit" class="btn btn-secondary">${L('Benachrichtigen', 'Notify me', 'Thông báo', 'Ειδοποίησέ με')}</button>
          </form>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.querySelector('.deck-close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // Live preview update
    function updatePreview() {
      const l1 = overlay.querySelector('#deck-lang1').value;
      const l2 = overlay.querySelector('#deck-lang2').value;
      const sampleEmotion = EMOTIONS[0];
      overlay.querySelector('#deck-preview-word').textContent = sampleEmotion[l1] || sampleEmotion.de;
      overlay.querySelector('#deck-preview-trans').textContent = sampleEmotion[l2] || sampleEmotion.en;
      overlay.querySelector('#deck-preview-langs').textContent = `${LANGUAGES[l1]?.flag || ''} · ${LANGUAGES[l2]?.flag || ''}`;
      const format = overlay.querySelector('#deck-format').value;
      overlay.querySelector('#deck-price').textContent = format === '30' ? '€14,99' : '€24,99';
    }
    overlay.querySelector('#deck-lang1').addEventListener('change', updatePreview);
    overlay.querySelector('#deck-lang2').addEventListener('change', updatePreview);
    overlay.querySelector('#deck-format').addEventListener('change', updatePreview);

    overlay.querySelector('#deck-waitlist-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = overlay.querySelector('.deck-email-input').value.trim();
      if (!email) return;
      const saved = JSON.parse(localStorage.getItem('gefuehle-deck-waitlist') || '[]');
      if (!saved.includes(email)) { saved.push(email); localStorage.setItem('gefuehle-deck-waitlist', JSON.stringify(saved)); }
      overlay.querySelector('#deck-waitlist-form').innerHTML = `<p style="color:var(--success);font-weight:600">✓ ${L('Du bist dabei!', 'You\'re on the list!', 'Bạn đã đăng ký!', 'Είσαι στη λίστα!')}</p>`;
    });
  }

  /* ---- Landing / Navigation ---- */
  function showLanding() {
    state.showLanding = true;
    document.body.classList.add('show-landing');
    clearInterval(state.timerInterval);
    updateSettingsSummary();
    renderStreakCard();
    renderWeeklyRecap();
    renderDailyFunFact();
    renderTodaysEmotion();
    renderDailyChallengeCard();
    renderCollectionBar();
    renderFavoritesSection();
    if (typeof GefuehlePersonas !== 'undefined') {
      GefuehlePersonas.renderPersonaPicker(state.uiLang);
    }
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
      name: { de: 'Klassisch', vi: 'Cổ điển', en: 'Classic', tr: 'Klasik', ar: 'كلاسيكي', es: 'Clásico', fr: 'Classique', uk: 'Класика', pl: 'Klasyk', el: 'Κλασικό', ta: 'கிளாசிக்' },
      desc: { de: 'Wer findet zuerst alle Paare?', vi: 'Ai tìm đủ cặp trước?', en: 'Who finds all pairs first?', tr: 'Kim önce tüm çiftleri bulur?', ar: 'من يجد كل الأزواج أولاً؟', es: '¿Quién encuentra todos los pares primero?', fr: 'Qui trouve toutes les paires en premier?', uk: 'Хто знайде всі пари першим?', pl: 'Kto pierwszy znajdzie wszystkie pary?', el: 'Ποιος βρίσκει πρώτος όλα τα ζεύγη;', ta: 'யார் முதலில் அனைத்து ஜோடிகளையும் கண்டுபிடிப்பார்?' }
    },
    talk: {
      icon: '💬',
      name: { de: 'Gesprächsrunde', vi: 'Trò chuyện', en: 'Talk Round', tr: 'Konuşma Turu', ar: 'جولة الحديث', es: 'Ronda de Conversación', fr: 'Tour de Parole', uk: 'Коло розмови', pl: 'Runda rozmowy', el: 'Γύρος Συζήτησης', ta: 'உரையாடல் சுற்று' },
      desc: { de: 'Zieh eine Karte — wer redet zuerst?', vi: 'Rút thẻ — ai nói trước?', en: 'Draw a card — who speaks first?', tr: 'Kart çek — kim önce konuşur?', ar: 'اسحب بطاقة — من يتحدث أولاً؟', es: 'Saca una carta — ¿quién habla primero?', fr: 'Tire une carte — qui parle en premier?', uk: 'Витягни картку — хто говорить першим?', pl: 'Wyciągnij kartę — kto mówi pierwszy?', el: 'Τράβα κάρτα — ποιος μιλά πρώτος;', ta: 'ஒரு அட்டையை எடு — யார் முதலில் பேசுவார்?' }
    },
    story: {
      icon: '📖',
      name: { de: 'Geschichten', vi: 'Kể chuyện', en: 'Stories', tr: 'Hikayeler', ar: 'القصص', es: 'Historias', fr: 'Histoires', uk: 'Історії', pl: 'Historie', el: 'Ιστορίες', ta: 'கதைகள்' },
      desc: { de: 'Drei Gefühle. Eine Geschichte. Los.', vi: 'Ba cảm xúc. Một câu chuyện. Bắt đầu.', en: 'Three emotions. One story. Go.', tr: 'Üç duygu. Bir hikaye. Başla.', ar: 'ثلاثة مشاعر. قصة واحدة. ابدأ.', es: 'Tres emociones. Una historia. ¡Adelante!', fr: 'Trois émotions. Une histoire. Partez.', uk: 'Три почуття. Одна історія. Вперед.', pl: 'Trzy emocje. Jedna historia. Zaczynaj.', el: 'Τρία συναισθήματα. Μια ιστορία. Ε, λοιπόν.', ta: 'மூன்று உணர்வுகள். ஒரு கதை. போ.' }
    },
    wheel: {
      icon: '🎡',
      name: { de: 'Emotions-Rad', vi: 'Vòng cảm xúc', en: 'Emotion Wheel', tr: 'Duygu Çarkı', ar: 'عجلة المشاعر', es: 'Rueda de Emociones', fr: 'Roue des Émotions', uk: 'Колесо емоцій', pl: 'Koło Emocji', el: 'Τροχός Συναισθημάτων', ta: 'உணர்வு சக்கரம்' },
      desc: { de: 'Alle 67 Gefühle — welche kennst du schon?', vi: 'Tất cả 67 cảm xúc — bạn biết bao nhiêu?', en: 'All 67 emotions — how many do you know?', tr: 'Tüm 67 duygu — kaçını biliyorsun?', ar: '67 مشعوراً — كم منها تعرف؟', es: '67 emociones — ¿cuántas conoces?', fr: '67 émotions — combien en connais-tu?', uk: '67 емоцій — скільки ти знаєш?', pl: '67 emocji — ile znasz?', el: '67 συναισθήματα — πόσα ξέρεις;', ta: '67 உணர்வுகள் — எத்தனை உங்களுக்குத் தெரியும்?' }
    },
    checkin: {
      icon: '🌿',
      name: { de: 'Check-in', vi: 'Tự vấn', en: 'Check-in', tr: 'Kontrol', ar: 'تسجيل الحضور', es: 'Check-in', fr: 'Check-in', uk: 'Чек-ін', pl: 'Check-in', el: 'Αυτοέλεγχος', ta: 'செக்-இன்' },
      desc: { de: '2 Minuten: Wie geht\'s dir wirklich?', vi: '2 phút: Bạn thực sự cảm thấy thế nào?', en: '2 minutes: How are you, really?', tr: '2 dakika: Gerçekten nasılsın?', ar: 'دقيقتان: كيف حالك حقاً؟', es: '2 minutos: ¿Cómo estás de verdad?', fr: '2 minutes: Comment tu vas vraiment?', uk: '2 хвилини: Як ти насправді?', pl: '2 minuty: Jak naprawdę się czujesz?', el: '2 λεπτά: Πώς είσαι πραγματικά;', ta: '2 நிமிடங்கள்: நீங்கள் உண்மையில் எப்படி இருக்கிறீர்கள்?' }
    },
    learn: {
      icon: '🧠',
      name: { de: 'Karteikarten', vi: 'Thẻ ghi nhớ', en: 'Flashcards', tr: 'Kartlar', ar: 'البطاقات', es: 'Tarjetas', fr: 'Fiches', uk: 'Картки', pl: 'Fiszki', el: 'Κάρτες', ta: 'ஃபிளாஷ்கார்டுகள்' },
      desc: { de: 'Lerne Gefühle — Wort für Wort', vi: 'Học cảm xúc — từng từ một', en: 'Learn emotions — word by word', tr: 'Duyguları öğren — kelime kelime', ar: 'تعلّم المشاعر — كلمة بكلمة', es: 'Aprende emociones — palabra a palabra', fr: 'Apprends les émotions — mot à mot', uk: 'Вчи емоції — слово за словом', pl: 'Ucz się emocji — słowo po słowie', el: 'Μάθε συναισθήματα — λέξη προς λέξη', ta: 'உணர்வுகளைக் கற்றுக்கொள் — வார்த்தை வார்த்தையாக' }
    },
    journal: {
      icon: '📓',
      name: { de: 'Journal', vi: 'Nhật ký', en: 'Journal', tr: 'Günlük', ar: 'مفكرة', es: 'Diario', fr: 'Journal', uk: 'Щоденник', pl: 'Dziennik', el: 'Ημερολόγιο', ta: 'நாட்குறிப்பு' },
      desc: { de: 'Schreib auf, was dich bewegt', vi: 'Viết những gì chạm đến bạn', en: 'Write what moves you', tr: 'Seni etkileyen şeyi yaz', ar: 'اكتب ما يحرّكك', es: 'Escribe lo que te mueve', fr: 'Écris ce qui te touche', uk: 'Запиши те, що тебе хвилює', pl: 'Zapisz to, co cię porusza', el: 'Γράψε ό,τι σε συγκινεί', ta: 'உன்னை நகர்த்துவதை எழுது' }
    },
    wotd: {
      icon: '🌅',
      name: { de: 'Wort des Tages', vi: 'Từ của ngày', en: 'Word of the Day', tr: 'Günün Kelimesi', ar: 'كلمة اليوم', es: 'Palabra del Día', fr: 'Mot du Jour', uk: 'Слово дня', pl: 'Słowo dnia', el: 'Λέξη της ημέρας', ta: 'இன்றைய வார்த்தை' },
      desc: { de: 'Ein neues Gefühl täglich entdecken', vi: 'Khám phá một cảm xúc mỗi ngày', en: 'Discover one new emotion daily', tr: 'Her gün yeni bir duygu keşfet', ar: 'اكتشف شعوراً جديداً يومياً', es: 'Descubre una emoción nueva cada día', fr: 'Découvre une nouvelle émotion chaque jour', uk: 'Відкривай нову емоцію щодня', pl: 'Odkrywaj nową emocję każdego dnia', el: 'Ανακάλυψε ένα νέο συναίσθημα κάθε μέρα', ta: 'ஒவ்வொரு நாளும் ஒரு புதிய உணர்வைக் கண்டறியுங்கள்' }
    },
    ask: {
      icon: '🤖',
      name: { de: 'Frag die App', vi: 'Hỏi ứng dụng', en: 'Ask the App', tr: 'Uygulamaya Sor', ar: 'اسأل التطبيق', es: 'Pregunta a la App', fr: 'Demande à l\'App', uk: 'Запитай додаток', pl: 'Zapytaj aplikację', el: 'Ρώτα την εφαρμογή', ta: 'ஆப்பை கேள்' },
      desc: { de: 'Deine Frage zu Gefühlen — KI antwortet', vi: 'Câu hỏi về cảm xúc — AI trả lời', en: 'Your emotion question — AI answers', tr: 'Duygularla ilgili sorun — AI yanıtlar', ar: 'سؤالك عن المشاعر — الذكاء الاصطناعي يجيب', es: 'Tu pregunta emocional — la IA responde', fr: 'Ta question émotionnelle — l\'IA répond', uk: 'Твоє питання про емоції — ШІ відповідає', pl: 'Twoje pytanie o emocje — AI odpowiada', el: 'Η ερώτησή σου για τα συναισθήματα — η AI απαντά', ta: 'உணர்வு கேள்வி — AI பதிலளிக்கும்' }
    },
    tandem: {
      icon: '🌍',
      name: { de: 'Tandem', vi: 'Tandem', en: 'Tandem', tr: 'Tandem', ar: 'تاندم', es: 'Tándem', fr: 'Tandem', uk: 'Тандем', pl: 'Tandem', el: 'Tandem', ta: 'டான்டம்' },
      desc: { de: 'Lerne Gefühle mit echten Menschen weltweit', vi: 'Học cảm xúc với người thật', en: 'Learn emotions with real people worldwide', tr: 'Dünya genelinde gerçek insanlarla', ar: 'تعلم المشاعر مع أشخاص حقيقيين', es: 'Aprende emociones con personas reales', fr: 'Apprends avec de vraies personnes', uk: 'Вчися з реальними людьми', pl: 'Ucz się z prawdziwymi ludźmi', el: 'Μάθε με πραγματικούς ανθρώπους', ta: 'உண்மையான மனிதர்களுடன் கற்றுக்கொள்' }
    },
    deck: {
      icon: '🎴',
      name: { de: 'Kartenset', vi: 'Bộ bài', en: 'Card Deck', tr: 'Kart Seti', ar: 'مجموعة البطاقات', es: 'Mazo de Cartas', fr: 'Jeu de Cartes', uk: 'Набір карт', pl: 'Talia kart', el: 'Τράπουλα', ta: 'அட்டை தொகுப்பு' },
      desc: { de: 'Dein physisches Gefühle-Kartenset gestalten', vi: 'Tạo bộ bài vật lý của bạn', en: 'Design your physical emotion card deck', tr: 'Fiziksel duygu kartı setini tasarla', ar: 'صمم مجموعة بطاقات المشاعر الفيزيائية', es: 'Diseña tu baraja física de emociones', fr: 'Crée ton jeu de cartes physique', uk: 'Створи свій фізичний набір карток', pl: 'Zaprojektuj swój fizyczny zestaw kart', el: 'Σχεδίασε τη φυσική τράπουλα συναισθημάτων', ta: 'உங்கள் இயற்பியல் அட்டை தொகுப்பை வடிவமைக்கவும்' }
    },
    detective: {
      icon: '🔍',
      name: { de: 'Gefühls-Detektiv', vi: 'Thám tử cảm xúc', en: 'Emotion Detective', tr: 'Duygu Dedektifi', ar: 'محقق المشاعر', es: 'Detective Emocional', fr: 'Détective des Émotions', uk: 'Детектив емоцій', pl: 'Detektyw emocji', el: 'Ντετέκτιβ Συναισθημάτων', ta: 'உணர்வு துப்பறிவாளர்' },
      desc: { de: 'Finde das versteckte Gefühl hinter der Oberfläche', vi: 'Tìm cảm xúc ẩn phía sau bề mặt', en: 'Find the hidden emotion beneath the surface', tr: 'Yüzeyin altındaki gizli duyguyu bul', ar: 'اعثر على المشاعر الخفية تحت السطح', es: 'Encuentra la emoción oculta bajo la superficie', fr: 'Trouve l\'émotion cachée sous la surface', uk: 'Знайди приховану емоцію під поверхнею', pl: 'Znajdź ukrytą emocję pod powierzchnią', el: 'Βρες το κρυφό συναίσθημα κάτω από την επιφάνεια', ta: 'மேற்பரப்பிற்கு அடியில் உள்ள மறைந்த உணர்வைக் கண்டுபிடி' }
    },
    needsmap: {
      icon: '🗺️',
      name: { de: 'Bedürfnis-Karte', vi: 'Bản đồ nhu cầu', en: 'Needs Map', tr: 'İhtiyaç Haritası', ar: 'خريطة الاحتياجات', es: 'Mapa de Necesidades', fr: 'Carte des Besoins', uk: 'Карта потреб', pl: 'Mapa potrzeb', el: 'Χάρτης αναγκών', ta: 'தேவைகள் வரைபடம்' },
      desc: { de: 'Welche Bedürfnisse stecken hinter deinen Gefühlen?', vi: 'Nhu cầu nào ẩn sau cảm xúc của bạn?', en: 'What needs are behind your emotions?', tr: 'Duygularının arkasındaki ihtiyaçlar neler?', ar: 'ما الاحتياجات الكامنة وراء مشاعرك؟', es: '¿Qué necesidades hay detrás de tus emociones?', fr: 'Quels besoins se cachent derrière tes émotions?', uk: 'Які потреби стоять за твоїми емоціями?', pl: 'Jakie potrzeby kryją się za twoimi emocjami?', el: 'Ποιες ανάγκες κρύβονται πίσω από τα συναισθήματά σου;', ta: 'உங்கள் உணர்வுகளுக்கு பின்னால் என்ன தேவைகள் இருக்கின்றன?' }
    }
  };

  const MODE_GROUPS = {
    de: { spielen: 'Spielen', entdecken: 'Entdecken', lernen: 'Lernen' },
    vi: { spielen: 'Chơi', entdecken: 'Khám phá', lernen: 'Học' },
    en: { spielen: 'Play', entdecken: 'Discover', lernen: 'Learn' },
    el: { spielen: 'Παίξε', entdecken: 'Ανακάλυψε', lernen: 'Μάθε' }
  };

  const MODE_TIME_ESTIMATES = {
    classic: '5–10 min', talk: '10–20 min', story: '5–15 min',
    wheel: '5 min', checkin: '2 min', ask: '2 min',
    wotd: '1 min', learn: '5–10 min', journal: '5 min',
    detective: '10–15 min', needsmap: '5–10 min'
  };

  function updateModeCards() {
    const lang = state.uiLang;
    const sessionCount = parseInt(localStorage.getItem('gefuehle-session-count') || '0');
    const showRecommended = sessionCount < 4;
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
      // Add time estimate (Win 6)
      let timeEl = card.querySelector('.mode-card-time');
      if (MODE_TIME_ESTIMATES[mode]) {
        if (!timeEl) {
          timeEl = document.createElement('span');
          timeEl.className = 'mode-card-time';
          card.appendChild(timeEl);
        }
        timeEl.textContent = `⏱ ${MODE_TIME_ESTIMATES[mode]}`;
      }
      // Add "Empfohlen" badge to Talk Mode for first 4 sessions
      let badge = card.querySelector('.mode-card-badge');
      if (mode === 'talk' && showRecommended) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'mode-card-badge';
          card.appendChild(badge);
        }
        badge.textContent = lang === 'de' ? '✨ Empfohlen' : lang === 'vi' ? '✨ Đề xuất' : lang === 'el' ? '✨ Προτείνεται' : '✨ Recommended';
      } else if (badge) {
        badge.remove();
      }
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
    state._sessionEmotions = [];
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
    const isWotd = state.mode === 'wotd';
    const isDetective = state.mode === 'detective';
    const isNeedsMap = state.mode === 'needsmap';

    dom.board.style.display = isClassic ? '' : 'none';
    dom.statsBar.style.display = isClassic ? '' : 'none';
    dom.controlsRow2.style.display = (isCheckin || isWheel || isJournal || isLearn || isAsk || isWotd || isDetective || isNeedsMap) ? 'none' : '';
    dom.talkMode.classList.toggle('active', isTalk);
    dom.storyMode.classList.toggle('active', isStory);
    dom.checkinMode.classList.toggle('active', isCheckin);
    dom.wheelMode.classList.toggle('active', isWheel);
    dom.journalMode.classList.toggle('active', isJournal);
    if (dom.learnMode) dom.learnMode.classList.toggle('active', isLearn);
    if (dom.askMode) dom.askMode.classList.toggle('active', isAsk);
    if (dom.wotdMode) dom.wotdMode.classList.toggle('active', isWotd);
    const detModeEl = document.querySelector('.detective-mode');
    if (detModeEl) detModeEl.classList.toggle('active', isDetective);
    const needsModeEl = document.querySelector('.needsmap-mode');
    if (needsModeEl) needsModeEl.classList.toggle('active', isNeedsMap);
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
    if (isWotd) initWotdMode();
    if (isDetective) initDetectiveMode();
    if (isNeedsMap) initNeedsMapMode();
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
        playMatchSound();
        const isNewDiscovery = discoverEmotion(a.emotionId);
        if (isNewDiscovery) showDiscoveryBadge(a.emotionId, a.emotion[state.lang1] || a.emotion.de, a.emotion.emoji);
        state.flipped = []; state.locked = false;
        // Track session emotions for congrats summary
        if (!state._sessionEmotions) state._sessionEmotions = [];
        if (!state._sessionEmotions.includes(a.emotionId)) state._sessionEmotions.push(a.emotionId);
        showPrompt(a.emotion);
        if (state.pairsFound === state.totalPairs) setTimeout(showCongrats, 1200);
      }, 500);
    } else {
      state.locked = true;
      playNoMatchSound();
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
  const RESONANCE_KEY = 'gefuehle-resonance';

  function getResonanceData() {
    return JSON.parse(localStorage.getItem(RESONANCE_KEY) || '{}');
  }

  function saveResonance(emotionId, type) {
    const data = getResonanceData();
    if (!data[emotionId]) data[emotionId] = [];
    const entry = { type, date: new Date().toISOString().split('T')[0] };
    // Keep only last 5 per emotion
    data[emotionId] = [entry, ...data[emotionId]].slice(0, 5);
    localStorage.setItem(RESONANCE_KEY, JSON.stringify(data));
    // Also feed into persona memory
    savePersonaMemory(emotionId, type);
  }

  function savePersonaMemory(emotionId, resonanceType) {
    const PERSONA_MEMORY_KEY = 'gefuehle-persona-memory';
    const mem = JSON.parse(localStorage.getItem(PERSONA_MEMORY_KEY) || '{}');
    const persona = (typeof GefuehlePersonas !== 'undefined') ? GefuehlePersonas.getActivePersona() : null;
    const personaId = persona ? persona.id : 'default';
    if (!mem[personaId]) mem[personaId] = [];
    const emo = EMOTIONS.find(e => e.id === emotionId);
    if (emo) {
      const entry = {
        emotionId,
        word: emo[state.lang1] || emo.de,
        emoji: emo.emoji,
        resonance: resonanceType,
        date: new Date().toISOString().split('T')[0]
      };
      mem[personaId] = [entry, ...mem[personaId].filter(e => e.emotionId !== emotionId)].slice(0, 20);
      localStorage.setItem(PERSONA_MEMORY_KEY, JSON.stringify(mem));
    }
  }

  function getPersonaMemoryContext() {
    const PERSONA_MEMORY_KEY = 'gefuehle-persona-memory';
    const mem = JSON.parse(localStorage.getItem(PERSONA_MEMORY_KEY) || '{}');
    const persona = (typeof GefuehlePersonas !== 'undefined') ? GefuehlePersonas.getActivePersona() : null;
    const personaId = persona ? persona.id : 'default';
    const entries = mem[personaId] || [];
    if (!entries.length) return '';
    const feels = entries.filter(e => e.resonance === 'feel').slice(0, 5).map(e => `${e.emoji} ${e.word}`);
    const knows = entries.filter(e => e.resonance === 'know').slice(0, 3).map(e => `${e.emoji} ${e.word}`);
    const surprises = entries.filter(e => e.resonance === 'surprise').slice(0, 3).map(e => `${e.emoji} ${e.word}`);
    let ctx = '\n\nUser emotional context:';
    if (feels.length) ctx += `\n- Currently resonating with: ${feels.join(', ')}`;
    if (knows.length) ctx += `\n- Familiar emotions: ${knows.join(', ')}`;
    if (surprises.length) ctx += `\n- Surprised by: ${surprises.join(', ')}`;
    return ctx;
  }

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

    // Show culture insight (culture-insights.js) or fallback to culture notes
    if (dom.promptCulture) {
      let insightHTML = '';
      if (typeof getRandomCultureInsight !== 'undefined') {
        const insight = getRandomCultureInsight(emotion.id);
        if (insight) insightHTML = `<span class="prompt-culture-label">${insight.flag} Kulturelle Perspektive</span>${insight.text}`;
      }
      if (!insightHTML) {
        const note = (typeof CULTURE_NOTES !== 'undefined') ? CULTURE_NOTES[emotion.id]?.[state.uiLang] : null;
        if (note) insightHTML = `<span class="prompt-culture-label">🌍 Kulturbrücke</span>${note}`;
      }
      if (insightHTML) {
        dom.promptCulture.innerHTML = insightHTML;
        dom.promptCulture.style.display = '';
      } else {
        dom.promptCulture.style.display = 'none';
      }
    }

    // Resonance buttons (Win 1)
    const resonanceEl = dom.promptOverlay.querySelector('.prompt-resonance');
    if (resonanceEl) {
      const resonanceData = getResonanceData();
      const existing = resonanceData[emotion.id]?.[0]?.type;
      const labels = {
        know: state.uiLang === 'de' ? '🤝 Kenn ich' : state.uiLang === 'vi' ? '🤝 Tôi biết' : state.uiLang === 'el' ? '🤝 Το ξέρω' : '🤝 I know this',
        feel: state.uiLang === 'de' ? '💛 Fühle ich gerade' : state.uiLang === 'vi' ? '💛 Đang cảm thấy' : state.uiLang === 'el' ? '💛 Το νιώθω' : '💛 Feeling this now',
        surprise: state.uiLang === 'de' ? '✨ Überraschend' : state.uiLang === 'vi' ? '✨ Bất ngờ' : state.uiLang === 'el' ? '✨ Εκπληκτικό' : '✨ Surprising'
      };
      resonanceEl.innerHTML = Object.entries(labels).map(([type, label]) =>
        `<button class="resonance-btn${existing === type ? ' active' : ''}" data-resonance="${type}">${label}</button>`
      ).join('');
      resonanceEl.querySelectorAll('.resonance-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const type = btn.dataset.resonance;
          saveResonance(emotion.id, type);
          resonanceEl.querySelectorAll('.resonance-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          // Visual feedback
          btn.style.transform = 'scale(1.15)';
          setTimeout(() => { btn.style.transform = ''; }, 200);
        });
      });
    }

    // Auto-speak the prompt question in classroom mode
    classroomSpeakPrompt(emotion.prompt[state.uiLang] || emotion.prompt.de, state.uiLang);
    // Bookmark button in prompt overlay
    const shareBtn = dom.promptShare;
    if (shareBtn) {
      const bookmarked = isBookmarked(emotion.id);
      shareBtn.textContent = bookmarked ? '★' : '☆';
      shareBtn.title = bookmarked ? (state.uiLang === 'de' ? 'Gespeichert' : 'Saved') : (state.uiLang === 'de' ? 'Speichern' : 'Save');
      shareBtn.onclick = (e) => {
        e.stopPropagation();
        const added = toggleBookmark(emotion.id);
        shareBtn.textContent = added ? '★' : '☆';
        shareBtn.title = added ? (state.uiLang === 'de' ? 'Gespeichert' : 'Saved') : (state.uiLang === 'de' ? 'Speichern' : 'Save');
      };
    }
    dom.promptOverlay.classList.add('visible');
  }
  function hidePrompt() { dom.promptOverlay.classList.remove('visible'); }

  /* ---- Congrats ---- */
  function showCongrats() {
    clearInterval(state.timerInterval);
    const elapsed = formatTime(Date.now() - state.timerStart);
    dom.congratsTitle.textContent = t('congratsTitle');

    // Mark daily challenge complete if applicable
    markDailyChallengeComplete();

    if (isMultiplayer()) {
      dom.congratsText.textContent = '';
      dom.congratsStars.innerHTML = '';
      dom.congratsBest.textContent = '';
      dom.congratsStats.textContent = t('congratsStats').replace('{moves}', state.moves).replace('{time}', elapsed);
      if (dom.congratsOverlay.querySelector('.congrats-emotion-summary')) dom.congratsOverlay.querySelector('.congrats-emotion-summary').innerHTML = '';
      if (dom.congratsOverlay.querySelector('.congrats-persona-msg')) dom.congratsOverlay.querySelector('.congrats-persona-msg').innerHTML = '';

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

      // Emotion summary — show discovered emotions from this session (Win 7)
      const summaryEl = dom.congratsOverlay.querySelector('.congrats-emotion-summary');
      if (summaryEl && state._sessionEmotions && state._sessionEmotions.length) {
        const emojis = [...new Set(state._sessionEmotions.map(id => {
          const e = EMOTIONS.find(em => em.id === id);
          return e ? e.emoji : null;
        }).filter(Boolean))].slice(0, 8);
        summaryEl.innerHTML = `<div class="congrats-emoji-row">${emojis.join('')}</div>`;
      } else if (summaryEl) {
        summaryEl.innerHTML = '';
      }

      // Persona message (Win 7)
      const personaMsgEl = dom.congratsOverlay.querySelector('.congrats-persona-msg');
      if (personaMsgEl) {
        const persona = (typeof GefuehlePersonas !== 'undefined') ? GefuehlePersonas.getActivePersona() : null;
        if (persona) {
          const msgs = {
            hana: { de: 'Gut gemacht! Jedes Gefühl, das du kennst, macht dich stärker 🌸', en: 'Well done! Every emotion you know makes you stronger 🌸' },
            nadia: { de: 'Wunderschön. Lass die Gefühle in dir nachklingen 🌙', en: 'Beautiful. Let the emotions resonate within you 🌙' },
            karim: { de: 'Stark! Dieses Wissen trägt dich weit 💪', en: 'Strong! This knowledge carries you far 💪' },
            lena: { de: 'Super! Gefühle zu kennen ist der erste Schritt 🌿', en: 'Super! Knowing feelings is the first step 🌿' },
            soo: { de: 'Sehr schön. Gefühle verbinden uns alle 🎋', en: 'Very nice. Emotions connect us all 🎋' }
          };
          const msg = msgs[persona.id];
          if (msg) {
            personaMsgEl.innerHTML = `<div class="congrats-persona-bubble">
              <span class="congrats-persona-avatar">${persona.emoji}</span>
              <span>${msg[state.uiLang] || msg.en}</span>
            </div>`;
          } else {
            personaMsgEl.innerHTML = '';
          }
        } else {
          personaMsgEl.innerHTML = '';
        }
      }
    }

    playCongratsSound();
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
      // Mark as explored + discovered
      const explored = new Set(JSON.parse(localStorage.getItem(TALK_EXPLORED_KEY) || '[]'));
      explored.add(currentEmo.id);
      localStorage.setItem(TALK_EXPLORED_KEY, JSON.stringify([...explored]));
      const isTalkNew = discoverEmotion(currentEmo.id);
      if (isTalkNew) showDiscoveryBadge(currentEmo.id, currentEmo[state.lang1] || currentEmo.de, currentEmo.emoji);

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
          // Discover emotions when story starter is generated
          currentThree.forEach(e => discoverEmotion(e.id));
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
          // Show "Save to journal" button after reflection
          if (!panel.querySelector('.btn-story-save')) {
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn-story-save';
            const lang = state.uiLang;
            saveBtn.textContent = lang === 'de' ? '📓 In Journal speichern'
              : lang === 'vi' ? '📓 Lưu vào nhật ký'
              : lang === 'el' ? '📓 Αποθήκευση στο ημερολόγιο'
              : '📓 Save to Journal';
            fbEl.after(saveBtn);
            saveBtn.addEventListener('click', () => {
              const starterEl = panel.querySelector('.story-ai-starter');
              const JOURNAL_KEY = 'gefuehle-journal';
              const entries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
              entries.push({
                date: new Date().toISOString().split('T')[0],
                type: 'story',
                emotions: names,
                starter: starterEl ? starterEl.textContent : '',
                text: storyText,
                reflection: res.text,
              });
              localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
              saveBtn.textContent = lang === 'de' ? '✓ Gespeichert!' : lang === 'vi' ? '✓ Đã lưu!' : '✓ Saved!';
              saveBtn.disabled = true;
              if (typeof GefuehleAPI !== 'undefined') {
                GefuehleAPI.saveJournal({ date: entries[entries.length - 1].date, note: storyText, emotions: names });
              }
            });
          }
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

  /* ---- Emotion Journey Paths ---- */
  const EMOTION_JOURNEYS = {
    angst: {
      de: 'Du hast Gefühle der Schutzzone gespürt. Möchtest du tiefer gehen?',
      en: 'You felt some protective emotions. Want to explore deeper?',
      el: 'Αισθάνθηκες συναισθήματα προστασίας. Θέλεις να εξερευνήσεις;',
      vi: 'Bạn cảm thấy một số cảm xúc bảo vệ. Muốn khám phá sâu hơn?',
      emotions: ['angst', 'einsamkeit', 'scham', 'erschoepfung', 'niedergeschlagenheit'],
      icon: '⚡',
    },
    licht: {
      de: 'Schöne Energie! Lass uns in Freude und Weite eintauchen.',
      en: 'Great energy! Let\'s dive into joy and expanse.',
      el: 'Θαυμάσια ενέργεια! Ας εμβαθύνουμε στη χαρά.',
      vi: 'Năng lượng tuyệt vời! Hãy đắm chìm vào niềm vui.',
      emotions: ['freude', 'dankbarkeit', 'frieden', 'leichtigkeit', 'begeisterung'],
      icon: '🌟',
    },
    schwere: {
      de: 'Tiefe Gefühle verdienen Raum. Diese Karten begleiten dich.',
      en: 'Deep feelings deserve space. These cards will accompany you.',
      el: 'Τα βαθιά συναισθήματα αξίζουν χώρο.',
      vi: 'Cảm xúc sâu sắc xứng đáng có không gian.',
      emotions: ['trauer', 'einsamkeit', 'sehnsucht', 'nostalgie', 'mitgefuehl'],
      icon: '🌑',
    },
    beziehung: {
      de: 'Verbindung und Beziehung stehen im Mittelpunkt. Diese Runde ist für dich und deine Menschen.',
      en: 'Connection and relationship are central. This round is for you and your people.',
      el: 'Η σύνδεση είναι κεντρική. Αυτή η σειρά είναι για σας.',
      vi: 'Kết nối là trung tâm. Vòng này dành cho bạn và những người thân.',
      emotions: ['liebe', 'vertrauen', 'dankbarkeit', 'mitgefuehl', 'zugehoerigkeit'],
      icon: '💛',
    },
  };

  function showJourneyOffer(lang, dominantCategory) {
    const journey = EMOTION_JOURNEYS[dominantCategory];
    if (!journey) return;
    const overlay = document.createElement('div');
    overlay.className = 'journey-offer-overlay';
    const exploreLabel = lang === 'de' ? 'Jetzt erkunden' : lang === 'vi' ? 'Khám phá ngay' : lang === 'el' ? 'Εξερεύνησε' : 'Explore now';
    const skipLabel = lang === 'de' ? 'Nicht jetzt' : lang === 'vi' ? 'Không phải bây giờ' : lang === 'el' ? 'Όχι τώρα' : 'Not now';
    overlay.innerHTML = `
      <div class="journey-offer-card">
        <div class="journey-offer-icon">${journey.icon}</div>
        <div class="journey-offer-text">${journey[lang] || journey.en}</div>
        <div class="journey-offer-actions">
          <button class="journey-explore-btn">${exploreLabel}</button>
          <button class="journey-skip-btn">${skipLabel}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.querySelector('.journey-explore-btn').addEventListener('click', () => {
      overlay.remove();
      // Start Talk Mode with journey emotions
      const journeyEmotions = journey.emotions
        .map(id => EMOTIONS.find(e => e.id === id))
        .filter(Boolean);
      state.mode = 'talk';
      state._journeyEmotions = journeyEmotions;
      hideLanding();
      startGame();
    });

    overlay.querySelector('.journey-skip-btn').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.remove(); showLanding(); }, 350);
    });
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
      // Determine dominant emotional category to offer a journey
      const dimCounts = {};
      dims.forEach(d => { dimCounts[d] = (dimCounts[d] || 0) + 1; });
      const dominant = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const CATEGORY_MAP = { koerper: 'schwere', herz: 'licht', geist: 'angst', seele: 'schwere', beziehung: 'beziehung' };
      const emotionCategory = CATEGORY_MAP[dominant];
      setTimeout(() => {
        overlay.remove();
        if (emotionCategory && EMOTION_JOURNEYS[emotionCategory]) {
          showJourneyOffer(lang, emotionCategory);
        } else {
          showLanding();
        }
      }, 400);
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
      const gx1 = Math.round(50 + 38 * Math.cos(midAngle));
      const gy1 = Math.round(50 + 38 * Math.sin(midAngle));
      // Rich gradient: bright inner, mid saturated, darker outer edge
      defs += '<radialGradient id="wg-' + cat.id + '" cx="' + gx1 + '%" cy="' + gy1 + '%" r="72%">' +
        '<stop offset="0%" stop-color="' + cat.colorLight + '" stop-opacity="0.95"/>' +
        '<stop offset="45%" stop-color="' + cat.color + '" stop-opacity="0.72"/>' +
        '<stop offset="100%" stop-color="' + cat.color + '" stop-opacity="0.45"/>' +
        '</radialGradient>';
      // Glow filter per category
      defs += '<filter id="glow-' + cat.id + '" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>' +
        '<feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -6" result="glow"/>' +
        '<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>';
    });
    defs += '<filter id="wheel-center-shadow" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feDropShadow dx="0" dy="3" stdDeviation="8" flood-color="rgba(0,0,0,.35)"/>' +
      '</filter>';
    defs += '<filter id="dot-glow" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>';
    // Radial gradient for center circle
    defs += '<radialGradient id="center-grad" cx="50%" cy="40%" r="60%">' +
      '<stop offset="0%" stop-color="var(--bg-card2)"/>' +
      '<stop offset="100%" stop-color="var(--bg-card)"/>' +
      '</radialGradient>';
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
        ' fill="url(#wg-' + cat.id + ')" stroke="' + cat.color + '" stroke-width="2.5" opacity="0.92"' +
        ' data-cat-id="' + cat.id + '"' +
        ' tabindex="0" role="button" aria-label="' + catLabel + '"/>';

      if (decoGen[cat.id]) {
        segments += decoGen[cat.id](cx, cy, innerR, outerR, startAngle, endAngle, cat.color);
      }

      const emojiR = innerR + 18;
      const elx = cx + emojiR * Math.cos(midAngle);
      const ely = cy + emojiR * Math.sin(midAngle);
      segments += '<text class="wheel-cat-emoji" x="' + elx + '" y="' + ely + '" text-anchor="middle" dominant-baseline="middle" font-size="18">' + cat.emoji + '</text>';

      // Outer label ring — always visible at low opacity, full on hover
      const nameR = outerR - 18;
      const nlx = cx + nameR * Math.cos(midAngle);
      const nly = cy + nameR * Math.sin(midAngle);
      const rotDeg = midAngle * 180 / Math.PI;
      const textRot = (rotDeg > 90 || rotDeg < -90) ? rotDeg + 180 : rotDeg;
      segments += '<text class="wheel-cat-name wheel-cat-name-always" x="' + nlx + '" y="' + nly + '" text-anchor="middle" dominant-baseline="middle"' +
        ' font-size="9" fill="' + cat.color + '"' +
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
          ' font-size="17" data-emotion-id="' + emo.id + '" data-emoji="' + emo.emoji + '" data-label="' + emoLabel + '"' +
          ' tabindex="0" role="button" aria-label="' + emoLabel + ' ' + emo.emoji + '"' +
          ' style="transform-origin: ' + dx + 'px ' + dy + 'px">' + emo.emoji + '</text>';
      });

      segments += '</g>';
    });

    const defaultCenterText = lang === 'de' ? 'Erkunden' : lang === 'vi' ? 'Khám phá' : 'Explore';
    let center = '<g class="wheel-center-pulse">';
    // Outer glow ring
    center += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (innerR + 2) + '"' +
      ' fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.2"/>';
    // Main center circle with gradient
    center += '<circle class="wheel-center-circle" cx="' + cx + '" cy="' + cy + '" r="' + (innerR - 4) + '"' +
      ' fill="url(#center-grad)" stroke="var(--accent)" stroke-width="2" filter="url(#wheel-center-shadow)"/>';
    // Inner accent ring
    center += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (innerR - 14) + '"' +
      ' fill="none" stroke="var(--accent)" stroke-width="0.8" opacity="0.3"/>';
    center += '<text class="wheel-center-emoji" x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" dominant-baseline="central" font-size="26">💛</text>';
    center += '<text class="wheel-center-text" x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle" font-size="8.5" fill="var(--text-soft)" font-family="var(--font)">' + defaultCenterText + '</text>';
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
  function initJournalMode(prefillText) {
    const container = dom.journalMode;
    const lang = state.uiLang;
    // Check for prefill from Needs Map
    if (!prefillText) {
      const stored = localStorage.getItem('gefuehle-journal-prefill');
      if (stored) { prefillText = stored; localStorage.removeItem('gefuehle-journal-prefill'); }
    }
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
      <textarea class="journal-note-field" placeholder="${t('journalNote')}">${prefillText ? prefillText + '\n\n' : ''}</textarea>
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

  /* ---- Word of the Day Mode ---- */
  function initWotdMode() {
    const container = dom.wotdMode;
    const lang = state.uiLang;
    const dayIndex = Math.floor(Date.now() / 86400000) % EMOTIONS.length;
    const emo = EMOTIONS[dayIndex];
    const color = getCategoryColor(emo.category);
    const cat = CATEGORIES.find(c => c.id === emo.category);
    const catLabel = cat ? `${cat.emoji} ${cat[lang] || cat.en}` : '';

    const WOTD_KEY = 'gefuehle-wotd-date';
    const todayStr = new Date().toISOString().split('T')[0];
    const learnedToday = localStorage.getItem(WOTD_KEY) === todayStr;

    const L = (de, en, vi, el) => lang === 'de' ? de : lang === 'vi' ? vi : lang === 'el' ? el : en;
    const titleLabel = L('Wort des Tages', 'Word of the Day', 'Từ của ngày', 'Λέξη της ημέρας');
    const learnBtnLabel = learnedToday
      ? L('✓ Heute gelernt', '✓ Learned today', '✓ Đã học hôm nay', '✓ Έμαθα σήμερα')
      : L('✓ Gelernt — nächstes Wort morgen', '✓ Mark as learned', '✓ Đánh dấu đã học', '✓ Σήμανση ως μαθημένο');
    const journalLabel = L('📓 Im Journal notieren', '📓 Reflect in journal', '📓 Viết vào nhật ký', '📓 Γράψε στο ημερολόγιο');

    // Rich insights
    const insights = (typeof getWotdInsights !== 'undefined') ? getWotdInsights(emo.id) : null;

    // Related emotions
    const relatedHtml = insights?.related?.length ? `
      <div class="wotd-related">
        <div class="wotd-section-label">${L('Verwandte Gefühle', 'Related emotions', 'Cảm xúc liên quan', 'Συγγενή συναισθήματα')}</div>
        <div class="wotd-related-pills">
          ${insights.related.slice(0, 4).map(id => {
            const e = EMOTIONS.find(x => x.id === id);
            return e ? `<button class="wotd-related-pill" data-id="${e.id}">${e.emoji} ${e[lang] || e.en}</button>` : '';
          }).join('')}
        </div>
      </div>` : '';

    // Cultural world words
    const worldHtml = insights?.world?.length ? `
      <div class="wotd-section wotd-world-section">
        <div class="wotd-section-label">🌍 ${L('Rund um die Welt', 'Around the world', 'Khắp nơi trên thế giới', 'Παγκοσμίως')}</div>
        <div class="wotd-world-words">
          ${insights.world.map(w => `
            <div class="wotd-world-item">
              <span class="wotd-world-word">${w.word}</span>
              <span class="wotd-world-lang">${w.lang.toUpperCase()}</span>
              <span class="wotd-world-meaning">${w.meaning[lang === 'de' ? 'de' : 'en']}</span>
            </div>`).join('')}
        </div>
      </div>` : '';

    // Quote
    const quoteHtml = insights?.quote ? `
      <div class="wotd-section wotd-quote-section">
        <div class="wotd-quote-text">&ldquo;${insights.quote.text}&rdquo;</div>
        <div class="wotd-quote-author">— ${insights.quote.author}</div>
      </div>` : '';

    container.innerHTML = `
      <div class="wotd-card" style="--wotd-color:${color}">

        <!-- Header -->
        <div class="wotd-header-bar">
          <span class="wotd-label">${titleLabel}</span>
          <span class="wotd-date-badge">${new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div class="wotd-hero">
          <div class="wotd-emoji">${emo.emoji}</div>
          <div class="wotd-words-block">
            <div class="wotd-word">${emo[state.lang1] || emo.de}
              <button class="wotd-speak-inline" data-speak-word="${emo[state.lang1] || emo.de}" data-speak-lang="${state.lang1}" title="${LANGUAGES[state.lang1]?.name || state.lang1}">🔊</button>
            </div>
            <div class="wotd-word-secondary">${emo[state.lang2] || emo.en}
              <button class="wotd-speak-inline" data-speak-word="${emo[state.lang2] || emo.en}" data-speak-lang="${state.lang2}" title="${LANGUAGES[state.lang2]?.name || state.lang2}">🔊</button>
            </div>
          </div>
        </div>
        <div class="wotd-category-badge">${catLabel}</div>

        ${insights?.insight ? `
        <!-- Insight -->
        <div class="wotd-section wotd-insight-section">
          <div class="wotd-section-label">💡 ${L('Psychologische Tiefe', 'Psychological insight', 'Hiểu sâu tâm lý', 'Ψυχολογική κατανόηση')}</div>
          <div class="wotd-insight-text">${insights.insight[lang] || insights.insight.en}</div>
        </div>` : ''}

        ${insights?.body ? `
        <!-- Body -->
        <div class="wotd-section wotd-body-section">
          <div class="wotd-section-label">🫀 ${L('Im Körper', 'In your body', 'Trong cơ thể', 'Στο σώμα')}</div>
          <div class="wotd-body-text">${insights.body[lang === 'de' ? 'de' : 'en']}</div>
        </div>` : ''}

        ${worldHtml}
        ${quoteHtml}

        ${insights?.presence ? `
        <!-- Presence / Mindfulness -->
        <div class="wotd-section wotd-presence-section">
          <div class="wotd-section-label">🌬️ ${L('Moment der Stille', 'A moment of stillness', 'Khoảnh khắc tĩnh lặng', 'Στιγμή ησυχίας')}</div>
          <div class="wotd-presence-text">${insights.presence[lang] || insights.presence.en}</div>
        </div>` : ''}

        <!-- Today's question -->
        <div class="wotd-section wotd-question-section">
          <div class="wotd-section-label">💬 ${L('Frage für heute', 'Today\'s question', 'Câu hỏi hôm nay', 'Ερώτηση της ημέρας')}</div>
          <div class="wotd-prompt">${emo.prompt[lang] || emo.prompt.en || emo.prompt.de}</div>
        </div>

        ${relatedHtml}

        <!-- Actions -->
        <div class="wotd-actions">
          <button class="wotd-learn-btn${learnedToday ? ' learned' : ''}"${learnedToday ? ' disabled' : ''}>${learnBtnLabel}</button>
          <button class="wotd-journal-btn">${journalLabel}</button>
        </div>
        <div class="wotd-journal-area" style="display:none">
          <textarea class="wotd-textarea" placeholder="${L('Deine Gedanken...', 'Your thoughts...', 'Suy nghĩ của bạn...', 'Οι σκέψεις σου...')}"></textarea>
          <button class="wotd-journal-save">${L('Speichern', 'Save', 'Lưu', 'Αποθήκευση')}</button>
        </div>
      </div>`;

    container.querySelectorAll('.wotd-speak-inline').forEach(btn => {
      btn.addEventListener('click', () => speakWord(btn.dataset.speakWord, btn.dataset.speakLang));
    });

    // Related pill clicks — navigate to that emotion in wheel mode
    container.querySelectorAll('.wotd-related-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const relEmo = EMOTIONS.find(e => e.id === btn.dataset.id);
        if (relEmo) showCardHint({ emotion: relEmo, emotionId: relEmo.id, lang: state.lang1, word: relEmo[state.lang1] || relEmo.de });
      });
    });

    const learnBtn = container.querySelector('.wotd-learn-btn');
    if (learnBtn && !learnedToday) {
      learnBtn.addEventListener('click', () => {
        discoverEmotion(emo.id);
        localStorage.setItem(WOTD_KEY, todayStr);
        learnBtn.classList.add('learned');
        learnBtn.disabled = true;
        learnBtn.textContent = L('✓ Gelernt!', '✓ Learned!', '✓ Đã học!', '✓ Έμαθα!');
        playMatchSound();
      });
    }

    const journalBtn = container.querySelector('.wotd-journal-btn');
    const journalArea = container.querySelector('.wotd-journal-area');
    journalBtn.addEventListener('click', () => {
      journalArea.style.display = journalArea.style.display === 'none' ? '' : 'none';
      if (journalArea.style.display !== 'none') container.querySelector('.wotd-textarea')?.focus();
    });

    container.querySelector('.wotd-journal-save')?.addEventListener('click', () => {
      const text = container.querySelector('.wotd-textarea').value.trim();
      if (!text) return;
      const JOURNAL_KEY = 'gefuehle-journal';
      const entries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
      entries.push({ date: todayStr, type: 'wotd', emotions: [emo[lang] || emo.de], note: text });
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
      if (typeof GefuehleAPI !== 'undefined') {
        GefuehleAPI.saveJournal({ date: todayStr, note: text, emotions: [emo.id] });
      }
      const saveBtn = container.querySelector('.wotd-journal-save');
      saveBtn.textContent = L('✓ Gespeichert', '✓ Saved', '✓ Đã lưu', '✓ Αποθηκεύτηκε');
      saveBtn.disabled = true;
    });
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

    const backendOnline = typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline();
    const offlineMsg = {
      de: '⚡ Backend gerade nicht erreichbar — Fragen werden gespeichert, sobald die Verbindung steht.',
      vi: '⚡ Backend chưa kết nối — câu hỏi sẽ hoạt động khi kết nối lại.',
      en: '⚡ Backend offline — questions will work once the connection is restored.',
      el: '⚡ Backend εκτός σύνδεσης — οι ερωτήσεις θα λειτουργούν όταν αποκατασταθεί η σύνδεση.',
    };
    const offlineBanner = !backendOnline
      ? `<div class="ask-offline-banner">${offlineMsg[lang] || offlineMsg.en}
           <div class="ask-offline-hint">${lang === 'de' ? 'Du kannst schon tippen — die App merkt sich deine Frage.' : lang === 'vi' ? 'Bạn có thể gõ trước — ứng dụng sẽ nhớ câu hỏi.' : 'You can still type — the app will remember your question.'}</div>
         </div>`
      : '';

    container.innerHTML = `
      <p class="ask-intro">${introText[lang] || introText.en}</p>
      ${offlineBanner}
      <div class="ask-examples">
        <p class="ask-examples-label">${lang === 'de' ? 'Zum Beispiel:' : lang === 'vi' ? 'Ví dụ:' : lang === 'el' ? 'Για παράδειγμα:' : 'For example:'}</p>
        ${chips.map(q => `<button class="ask-example-chip">${q}</button>`).join('')}
      </div>
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

      if (typeof GefuehleAPI === 'undefined' || !GefuehleAPI.isBackendOnline()) {
        textEl.textContent = lang === 'de'
          ? '🔌 Backend gerade nicht erreichbar. Versuch es in ein paar Sekunden noch einmal — Railway-Server starten manchmal etwas langsam.'
          : lang === 'vi'
          ? '🔌 Backend chưa kết nối. Thử lại sau vài giây — máy chủ Railway đôi khi khởi động chậm.'
          : lang === 'el'
          ? '🔌 Το backend δεν είναι διαθέσιμο. Δοκίμασε ξανά σε λίγα δευτερόλεπτα.'
          : '🔌 Backend not reachable right now. Try again in a few seconds — Railway servers sometimes take a moment to wake up.';
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
    // Build a richer share text with session emotions (Win 10)
    const lang1 = LANGUAGES[state.lang1]?.name;
    const lang2 = LANGUAGES[state.lang2]?.name;
    const emotions = (state._sessionEmotions || []).slice(0, 5).map(id => {
      const e = EMOTIONS.find(em => em.id === id);
      return e ? e.emoji : null;
    }).filter(Boolean);
    const emojiStr = emotions.join('');
    const uiLang = state.uiLang;
    let text;
    if (uiLang === 'de') {
      text = `Ich habe gerade Gefühle-Memory gespielt${emojiStr ? ' und diese Gefühle entdeckt: ' + emojiStr : ''}! ${lang1} ↔ ${lang2} — 67 Gefühle kennenlernen.`;
    } else if (uiLang === 'vi') {
      text = `Tôi vừa chơi Gefühle-Memory${emojiStr ? ' và khám phá: ' + emojiStr : ''}! ${lang1} ↔ ${lang2}`;
    } else {
      text = `I just played Gefühle-Memory${emojiStr ? ' and discovered: ' + emojiStr : ''}! ${lang1} ↔ ${lang2} — learning 67 emotions.`;
    }
    if (navigator.share) {
      navigator.share({ title: 'Gefühle-Memory 💛', text, url: location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + ' ' + location.href).then(() => {
        const msg = uiLang === 'de' ? 'Link kopiert! ✓' : 'Link copied! ✓';
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      });
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
        const mode = card.dataset.mode;
        if (mode === 'tandem') { showTandemOverlay(); return; }
        if (mode === 'deck') { showDeckConfigurator(); return; }
        syncSettingsFromLanding();
        state.mode = mode;
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
      { mode: 'talk',    recommended: true,  icon: '💬', de: 'Gesprächsrunde', en: 'Talk Round',  desc_de: 'Zieh eine Karte — wer redet zuerst?',   desc_en: 'Draw a card — who speaks first?' },
      { mode: 'classic', players: 2,         icon: '🃏', de: 'Klassisch',      en: 'Classic',     desc_de: 'Wer findet zuerst alle Paare?',          desc_en: 'Who finds all pairs first?' },
      { mode: 'checkin',                     icon: '🌿', de: 'Check-in',       en: 'Check-in',    desc_de: '2 Minuten: Wie geht\'s dir wirklich?',   desc_en: '2 minutes: How are you, really?' },
      { mode: 'learn',                       icon: '🧠', de: 'Karteikarten',   en: 'Flashcards',  desc_de: 'Lerne Gefühle — Wort für Wort',          desc_en: 'Learn emotions — word by word' },
    ];

    const PROFILE_EMOJIS = ['💛', '🌙', '🌿', '🦋', '🔥', '⭐', '🌸', '🎯', '🧠', '💬', '🐬', '☀️'];

    const TOTAL_STEPS = 4;
    function stepIndicator() {
      return `<div class="ob-step-indicator">${Array.from({length: TOTAL_STEPS}, (_, i) => i + 1).map(i =>
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
            <button class="ob-mode-btn${m.recommended ? ' ob-mode-recommended' : ''}" data-mode="${m.mode}"${m.players ? ` data-players="${m.players}"` : ''}>
              ${m.recommended ? `<span class="ob-recommended-badge">${OB_LANG === 'de' ? '✨ Empfohlen' : OB_LANG === 'vi' ? '✨ Đề xuất' : '✨ Recommended'}</span>` : ''}
              <span class="ob-mode-icon">${m.icon}</span>
              <span class="ob-mode-name">${OB_LANG === 'de' ? m.de : m.en}</span>
              <span class="ob-mode-desc">${OB_LANG === 'de' ? m.desc_de : m.desc_en}</span>
            </button>`).join('')}
        </div>
        <button class="ob-back ob-link">${obt('back')}</button>
        <button class="ob-skip">${obt('skip')}</button>`;
    }

    function renderStep3() {
      const saved = JSON.parse(localStorage.getItem('gefuehle-profile') || '{}');
      const emailLabel = { de: 'E-Mail (optional, für späteren Zugriff)', en: 'Email (optional, to restore your progress)', vi: 'Email (tùy chọn, để khôi phục tiến trình)', el: 'Email (προαιρετικό)' };
      const emailPh   = { de: 'deine@email.de', en: 'your@email.com', vi: 'email@của bạn.com', el: 'το@email.σου' };
      return `
        <p class="ob-subtitle" style="margin-bottom:16px">${obt('nameQ')}</p>
        <input class="ob-name-input" type="text" placeholder="${obt('namePh')}" maxlength="30" value="${saved.name || ''}">
        <div class="ob-emoji-grid">
          ${PROFILE_EMOJIS.map(e => `<button class="ob-emoji-btn${(saved.emoji || '💛') === e ? ' selected' : ''}" data-emoji="${e}">${e}</button>`).join('')}
        </div>
        <label class="ob-email-label">${emailLabel[OB_LANG] || emailLabel.en}</label>
        <input class="ob-email-input" type="email" placeholder="${emailPh[OB_LANG] || emailPh.en}" maxlength="80" value="${saved.email || ''}">
        <button class="ob-start-btn ob-primary">${obt('letsgo')}</button>
        <button class="ob-back ob-link">${obt('back')}</button>`;
    }

    function renderStep4() {
      if (typeof GefuehlePersonas === 'undefined') return renderStep3();
      const personas = GefuehlePersonas.getAllPersonas ? GefuehlePersonas.getAllPersonas() : [];
      if (!personas.length) return renderStep3();
      const activeId = GefuehlePersonas.getActivePersona()?.id;
      const guideQ = { de: 'Wer begleitet dich?', en: 'Who guides you?', vi: 'Ai hướng dẫn bạn?', el: 'Ποιος σε συνοδεύει;' };
      return `
        <p class="ob-subtitle" style="margin-bottom:16px">${guideQ[OB_LANG] || guideQ.en}</p>
        <div class="ob-persona-grid">
          ${personas.map(p => `
            <button class="ob-persona-btn${p.id === activeId ? ' selected' : ''}" data-persona-id="${p.id}">
              <span class="ob-persona-emoji">${p.emoji}</span>
              <span class="ob-persona-name">${p.name}</span>
              <span class="ob-persona-desc">${p.tagline?.[OB_LANG] || p.tagline?.en || ''}</span>
            </button>`).join('')}
        </div>
        <button class="ob-start-btn ob-primary">${obt('letsgo')}</button>
        <button class="ob-back ob-link">${obt('back')}</button>`;
    }

    function render() {
      const card = overlay.querySelector('.onboarding-card');
      const steps = { 1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4 };
      card.innerHTML = stepIndicator() + (steps[step] || renderStep3)();
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

      // Step 3 — go to persona step
      overlay.querySelector('.ob-start-btn')?.addEventListener('click', () => {
        if (step === 3) {
          const name = (overlay.querySelector('.ob-name-input')?.value || '').trim();
          const emoji = overlay.querySelector('.ob-emoji-btn.selected')?.dataset.emoji || '💛';
          const email = (overlay.querySelector('.ob-email-input')?.value || '').trim().toLowerCase();
          const profile = { name, emoji, ...(email ? { email } : {}) };
          localStorage.setItem('gefuehle-profile', JSON.stringify(profile));
          renderProfileInHeader(profile);
          if (typeof GefuehleAPI !== 'undefined') {
            GefuehleAPI.updateProfile({ display_name: name, avatar_emoji: emoji, ...(email ? { email } : {}) });
          }
          // Go to persona step if personas available
          if (typeof GefuehlePersonas !== 'undefined' && GefuehlePersonas.getAllPersonas?.().length) {
            step = 4; render();
          } else {
            applyAndDismiss(true);
          }
        } else if (step === 4) {
          // Persona selected — apply and start
          const selected = overlay.querySelector('.ob-persona-btn.selected');
          if (selected && typeof GefuehlePersonas !== 'undefined') {
            GefuehlePersonas.setActivePersona(selected.dataset.personaId);
          }
          applyAndDismiss(true);
        }
      });

      // Step 4 — persona buttons
      overlay.querySelectorAll('.ob-persona-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.querySelectorAll('.ob-persona-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
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

  /* ---- Daily Fun Fact card on landing ---- */
  function renderDailyFunFact() {
    const el = document.getElementById('daily-funfact-card');
    if (!el || typeof FunFacts === 'undefined') return;
    const fact = FunFacts.getDailyFact();
    const idx = FunFacts.getDailyIndex();
    if (!fact) return;
    // Strip HTML tags for the preview teaser
    const plainBody = fact.body.replace(/<[^>]+>/g, '');
    const teaser = plainBody.length > 110 ? plainBody.slice(0, 110) + '…' : plainBody;
    el.style.display = '';
    el.innerHTML = `
      <div class="dff-tag" style="background:${fact.color}22;color:${fact.color}">${fact.tag}</div>
      <div class="dff-header">
        <span class="dff-flag">${fact.flag}</span>
        <span class="dff-word">${fact.word}</span>
        <span class="dff-lang">${fact.langName}</span>
      </div>
      <div class="dff-title">${fact.title}</div>
      <div class="dff-teaser">${teaser}</div>
      <button class="dff-cta">💡 Mehr erfahren</button>`;
    el.querySelector('.dff-cta').addEventListener('click', () => FunFacts.open(false, idx));
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.dff-cta')) FunFacts.open(false, idx);
    });
  }

  /* ---- Today's Emotion card on landing ---- */
  function renderTodaysEmotion() {
    const el = document.getElementById('todays-emotion-card');
    if (!el) return;
    const dayIndex = Math.floor(Date.now() / 86400000) % EMOTIONS.length;
    const emo = EMOTIONS[dayIndex];
    if (!emo) return;
    const lang1 = state.lang1;
    const lang2 = state.lang2;
    const color = getCategoryColor(emo.category);
    const cat = CATEGORIES.find(c => c.id === emo.category);
    const catLabel = cat ? `${cat.emoji} ${cat[state.uiLang] || cat.en}` : '';
    const todayLabel = state.uiLang === 'de' ? 'Gefühl des Tages'
      : state.uiLang === 'vi' ? 'Cảm xúc hôm nay'
      : state.uiLang === 'el' ? 'Συναίσθημα της ημέρας'
      : 'Emotion of the Day';
    const exploreLabel = state.uiLang === 'de' ? 'Jetzt erkunden →'
      : state.uiLang === 'vi' ? 'Khám phá ngay →'
      : state.uiLang === 'el' ? 'Εξερεύνησε τώρα →'
      : 'Explore now →';
    el.style.display = '';
    el.style.setProperty('--tde-color', color);
    el.innerHTML = `
      <div class="tde-label">${todayLabel}</div>
      <div class="tde-emoji">${emo.emoji}</div>
      <div class="tde-word">${emo[lang1] || emo.de}</div>
      <div class="tde-word-secondary">${emo[lang2] || emo.en}</div>
      <div class="tde-category">${catLabel}</div>
      <button class="tde-cta">${exploreLabel}</button>`;
    el.querySelector('.tde-cta').addEventListener('click', (e) => {
      e.stopPropagation();
      // Open Talk Mode pre-loaded with today's emotion
      state.mode = 'talk';
      state._todaysEmotion = emo;
      hideLanding();
      startGame();
    });
  }

  /* ---- Daily Challenge card (Win 3) ---- */
  function getDailyChallengeSeed() {
    // Deterministic seed from today's date string
    const dateStr = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function renderDailyChallengeCard() {
    const el = document.getElementById('daily-challenge-card');
    if (!el) return;
    const DAILY_CHALLENGE_KEY = 'gefuehle-daily-challenge';
    const today = new Date().toISOString().split('T')[0];
    const saved = JSON.parse(localStorage.getItem(DAILY_CHALLENGE_KEY) || '{}');
    const lang = state.uiLang;

    // Deterministic daily config
    const seed = getDailyChallengeSeed();
    const DIFFS = ['easy', 'medium', 'hard'];
    const CATS = ['all', ...CATEGORIES.map(c => c.id)];
    const dailyDiff = DIFFS[seed % DIFFS.length];
    const dailyCat = CATS[(seed >> 3) % CATS.length];
    const cat = CATEGORIES.find(c => c.id === dailyCat);
    const catLabel = cat ? `${cat.emoji} ${cat[lang] || cat.en}` : (lang === 'de' ? 'Alle' : 'All');
    const diffLabels = { easy: { de: 'Leicht', en: 'Easy', vi: 'Dễ', el: 'Εύκολο' }, medium: { de: 'Mittel', en: 'Medium', vi: 'Vừa', el: 'Μεσαίο' }, hard: { de: 'Schwer', en: 'Hard', vi: 'Khó', el: 'Δύσκολο' } };
    const diffLabel = (diffLabels[dailyDiff] || diffLabels.medium)[lang] || (diffLabels[dailyDiff] || diffLabels.medium).en;

    const done = saved.date === today && saved.completed;
    const label = lang === 'de' ? 'Tägliche Challenge' : lang === 'vi' ? 'Thử thách hôm nay' : lang === 'el' ? 'Ημερήσια πρόκληση' : 'Daily Challenge';
    const btnLabel = done
      ? (lang === 'de' ? '✓ Erledigt!' : lang === 'vi' ? '✓ Xong!' : lang === 'el' ? '✓ Έγινε!' : '✓ Done!')
      : (lang === 'de' ? 'Jetzt spielen →' : lang === 'vi' ? 'Chơi ngay →' : lang === 'el' ? 'Παίξε τώρα →' : 'Play now →');

    el.style.display = '';
    el.className = `daily-challenge-card${done ? ' done' : ''}`;
    el.innerHTML = `
      <div class="dc-label">${label}</div>
      <div class="dc-details">
        <span class="dc-cat">${catLabel}</span>
        <span class="dc-sep">·</span>
        <span class="dc-diff">${diffLabel}</span>
        ${done ? '<span class="dc-stars">⭐⭐⭐</span>' : ''}
      </div>
      <button class="dc-btn"${done ? ' disabled' : ''}>${btnLabel}</button>`;

    if (!done) {
      el.querySelector('.dc-btn').addEventListener('click', () => {
        // Apply daily challenge settings
        state.difficulty = dailyDiff;
        state.category = dailyCat;
        state.mode = 'classic';
        // Mark as started
        const rec = JSON.parse(localStorage.getItem(DAILY_CHALLENGE_KEY) || '{}');
        if (rec.date !== today) localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify({ date: today, completed: false }));
        // Sync selects
        if (dom.difficultySelect) dom.difficultySelect.value = dailyDiff;
        if (dom.categorySelect) dom.categorySelect.value = dailyCat;
        if (dom.difficultySelectActive) dom.difficultySelectActive.value = dailyDiff;
        if (dom.categorySelectActive) dom.categorySelectActive.value = dailyCat;
        hideLanding();
        startGame();
      });
    }
  }

  function markDailyChallengeComplete() {
    const DAILY_CHALLENGE_KEY = 'gefuehle-daily-challenge';
    const today = new Date().toISOString().split('T')[0];
    const rec = JSON.parse(localStorage.getItem(DAILY_CHALLENGE_KEY) || '{}');
    if (rec.date === today) {
      rec.completed = true;
      localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(rec));
    }
  }

  function renderStreakCard() {
    const el = document.getElementById('streak-card');
    if (!el) return;
    const entries = typeof GefuehleAPI !== 'undefined' ? GefuehleAPI.getCheckinEntries() : [];
    const lang = state.uiLang;
    const today = new Date().toISOString().split('T')[0];
    const hasToday = entries.some(e => e.date === today);
    const streak = entries.length ? computeLocalStreak(entries) : 0;

    // Build 7-day heatmap
    const heatDots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const done = entries.some(e => e.date === dateStr);
      const isToday = dateStr === today;
      return `<span class="streak-dot${done ? ' done' : ''}${isToday ? ' today' : ''}" title="${dateStr}"></span>`;
    }).join('');

    // Update PWA badge icon with streak count (iOS Safari 16.4+, Chrome)
    if ('setAppBadge' in navigator) {
      if (streak > 0) navigator.setAppBadge(streak).catch(() => {});
      else navigator.clearAppBadge().catch(() => {});
    }

    const flameIcon = streak >= 30 ? '🏆' : streak >= 21 ? '💫' : streak >= 14 ? '⚡' : streak >= 7 ? '🌟' : streak >= 3 ? '🔥' : streak >= 1 ? '🌱' : '💭';
    const streakClass = streak >= 7 ? 'streak-fire streak-milestone' : streak >= 3 ? 'streak-fire' : '';

    // Milestone messages (Win 2)
    const MILESTONES = {
      3:  { de: '3 Tage! Du bist dabei 🔥', en: '3 days! You\'re on a roll 🔥', vi: '3 ngày! Bạn đang tiến lên 🔥', el: '3 μέρες! Συνέχισε 🔥' },
      7:  { de: '1 Woche! Das ist Hingabe 🌟', en: '1 week! That\'s dedication 🌟', vi: '1 tuần! Thật tuyệt vời 🌟', el: '1 εβδομάδα! Αυτό είναι αφοσίωση 🌟' },
      14: { de: '14 Tage! Gewohnheit geformt ⚡', en: '14 days! Habit forming ⚡', vi: '14 ngày! Thói quen hình thành ⚡', el: '14 μέρες! Η συνήθεια σχηματίζεται ⚡' },
      21: { de: '3 Wochen! Du bist außergewöhnlich 💫', en: '3 weeks! You\'re extraordinary 💫', vi: '3 tuần! Bạn thật phi thường 💫', el: '3 εβδομάδες! Είσαι εξαιρετικός 💫' },
      30: { de: '30 Tage! Eine Transformation 🏆', en: '30 days! A transformation 🏆', vi: '30 ngày! Một sự chuyển đổi 🏆', el: '30 μέρες! Μια μεταμόρφωση 🏆' },
    };
    const milestoneMsg = MILESTONES[streak] ? (MILESTONES[streak][lang] || MILESTONES[streak].en) : null;

    let topLine, actionText;
    if (!entries.length) {
      topLine = lang === 'de' ? 'Wie geht es dir heute wirklich?' : lang === 'el' ? 'Πώς νιώθεις σήμερα;' : lang === 'vi' ? 'Hôm nay bạn cảm thấy thế nào?' : 'How are you, really?';
      actionText = lang === 'de' ? 'Check-in starten →' : lang === 'el' ? 'Ξεκίνα check-in →' : lang === 'vi' ? 'Bắt đầu →' : 'Start check-in →';
    } else if (hasToday) {
      if (milestoneMsg) {
        topLine = milestoneMsg;
      } else {
        topLine = streak > 1
          ? `${flameIcon} ${streak} ${lang === 'de' ? 'Tage am Stück' : lang === 'el' ? 'μέρες συνεχόμενα' : 'days in a row'}`
          : `${flameIcon} ${lang === 'de' ? 'Heute dabei!' : lang === 'el' ? 'Σήμερα εδώ!' : 'You showed up today!'}`;
      }
      actionText = lang === 'de' ? 'Check-in anschauen →' : lang === 'el' ? 'Προβολή →' : 'View today →';
    } else {
      topLine = streak > 0
        ? `🔥 ${lang === 'de' ? `${streak} Tage — heute noch nicht!` : lang === 'el' ? `${streak} μέρες — όχι σήμερα ακόμα!` : `${streak} days — not yet today!`}`
        : (lang === 'de' ? 'Heute noch kein Check-in' : lang === 'el' ? 'Δεν έγινε check-in σήμερα' : 'No check-in yet today');
      actionText = lang === 'de' ? 'Jetzt einchecken →' : lang === 'el' ? 'Check-in τώρα →' : 'Check in now →';
    }

    el.innerHTML = `
      <div class="streak-inner ${streakClass}">
        <div class="streak-top">${topLine}</div>
        <div class="streak-heatmap">${heatDots}</div>
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

  /* ---- Emotion Detective mode ---- */
  function initDetectiveMode() {
    const container = document.querySelector('.detective-mode');
    if (!container) return;
    if (typeof GefuehleDetective === 'undefined') {
      container.innerHTML = `<div class="mode-placeholder"><p>🔍 Gefühls-Detektiv wird geladen...</p></div>`;
      return;
    }
    GefuehleDetective.initDetectiveMode(container, state.uiLang, (score, total) => {
      // On complete — show a mini congrats
      const lang = state.uiLang;
      const msg = lang === 'de'
        ? `Detektiv-Session abgeschlossen! ${score}/${total} richtig.`
        : lang === 'vi' ? `Hoàn thành! ${score}/${total} đúng.`
        : `Detective session complete! ${score}/${total} correct.`;
      const banner = document.createElement('div');
      banner.className = 'detective-complete-banner';
      banner.innerHTML = `<span>🔍 ${msg}</span><button>${lang === 'de' ? 'Nochmal' : 'Again'}</button>`;
      container.appendChild(banner);
      banner.querySelector('button').addEventListener('click', () => {
        banner.remove();
        initDetectiveMode();
      });
    });
  }

  /* ---- Needs Map mode ---- */
  function initNeedsMapMode() {
    const container = document.querySelector('.needsmap-mode');
    if (!container) return;
    const lang = state.uiLang;
    const L = (de, en, vi, el) => lang === 'de' ? de : lang === 'vi' ? vi : lang === 'el' ? el : en;

    // Build needs map: user selects an emotion → see connected needs
    const emotions = getEmotions().slice(0, 24); // Show a manageable grid
    const titleText = L('Welches Gefühl hast du gerade?', 'What emotion do you feel right now?', 'Bạn đang cảm thấy gì?', 'Τι συναίσθημα έχεις τώρα;');
    const subtitleText = L('Tippe auf ein Gefühl, um die dahinterliegenden Bedürfnisse zu sehen.', 'Tap an emotion to see the underlying needs.', 'Chạm vào cảm xúc để xem nhu cầu bên dưới.', 'Πάτησε ένα συναίσθημα για να δεις τις ανάγκες πίσω από αυτό.');

    container.innerHTML = `
      <div class="needsmap-wrap">
        <h2 class="needsmap-title">${titleText}</h2>
        <p class="needsmap-subtitle">${subtitleText}</p>
        <div class="needsmap-emotion-grid">
          ${emotions.map(e => `
            <button class="nm-emotion-btn" data-id="${e.id}" style="--cat-color:${getCategoryColor(e.category)}">
              <span class="nm-emoji">${e.emoji}</span>
              <span class="nm-word">${e[lang] || e.de}</span>
            </button>`).join('')}
        </div>
        <div class="needsmap-result" id="needsmap-result"></div>
      </div>`;

    container.querySelectorAll('.nm-emotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.nm-emotion-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const emo = EMOTIONS.find(e => e.id === btn.dataset.id);
        if (emo) showNeedsForEmotion(emo, lang);
      });
    });
  }

  function showNeedsForEmotion(emotion, lang) {
    const resultEl = document.getElementById('needsmap-result');
    if (!resultEl) return;
    if (typeof NEEDS === 'undefined' || typeof NEED_DIMENSIONS === 'undefined') {
      resultEl.innerHTML = '<p>Bedürfnis-Daten nicht verfügbar.</p>';
      return;
    }
    const L = (de, en, vi, el) => lang === 'de' ? de : lang === 'vi' ? vi : lang === 'el' ? el : en;

    // Map emotions to needs by category & emotional valence
    const needsMap = {
      freude:        ['verbundenheit', 'anerkennung', 'freude', 'leichtigkeit', 'sicherheit'],
      trauer:        ['verbundenheit', 'mitgefuehl', 'verstaendnis', 'trost', 'gehoert_werden'],
      wut:           ['respekt', 'gerechtigkeit', 'autonomie', 'grenzen', 'sicherheit'],
      angst:         ['sicherheit', 'schutz', 'geborgenheit', 'vertrauen', 'stabilität'],
      ekel:          ['respekt', 'sauberkeit', 'grenzen', 'autonomie', 'wuerde'],
      überraschung:  ['verstaendnis', 'orientierung', 'kontrolle', 'sicherheit', 'neugier'],
      scham:         ['akzeptanz', 'zugehoerigkeit', 'verstaendnis', 'selbstmitgefuehl', 'wuerde'],
      schuld:        ['reue', 'verbundenheit', 'gerechtigkeit', 'wiedergutmachung', 'vergebung'],
      einsamkeit:    ['verbundenheit', 'zugehoerigkeit', 'kontakt', 'liebe', 'gemeinschaft'],
      liebe:         ['verbundenheit', 'zuneigung', 'intimität', 'sicherheit', 'akzeptanz'],
      hoffnung:      ['sinn', 'orientierung', 'zukunft', 'vertrauen', 'moeglichkeit'],
      neugier:       ['lernen', 'entdeckung', 'verstaendnis', 'stimulation', 'wachstum'],
      erschoepfung:  ['ruhe', 'erholung', 'unterstuetzung', 'grenzen', 'selbstfuersorge'],
      dankbarkeit:   ['verbundenheit', 'anerkennung', 'wertschaetzung', 'sinn', 'zugehoerigkeit'],
      mitgefuehl:    ['verbundenheit', 'verstaendnis', 'mitgefuehl', 'liebe', 'fuersorge'],
    };

    // Real dimensions: koerper · herz · geist · seele · beziehung
    // Real category IDs: licht · mitte · schwere · sturm · angst · schatten
    const catToDimension = {
      licht:    'herz',
      mitte:    'seele',
      schwere:  'herz',
      sturm:    'beziehung',
      angst:    'koerper',
      schatten: 'seele'
    };
    const emotionToDimension = {
      freude: 'herz', dankbarkeit: 'herz', liebe: 'beziehung',
      frieden: 'seele', geborgenheit: 'beziehung', sehnsucht: 'beziehung',
      einsamkeit: 'beziehung', trauer: 'herz', verlust: 'herz',
      wut: 'beziehung', frustration: 'geist', enttaeuschung: 'beziehung',
      angst: 'koerper', panik: 'koerper', unsicherheit: 'koerper',
      scham: 'beziehung', schuld: 'beziehung', peinlichkeit: 'beziehung',
      hoffnung: 'seele', neugier: 'geist', begeisterung: 'geist',
      erschoepfung: 'koerper', mitgefuehl: 'herz', staunen: 'seele',
      leere: 'seele', zerrissenheit: 'seele', weltschmerz: 'seele',
      stolz: 'herz', verbundenheit: 'beziehung', eifersucht: 'beziehung',
      neid: 'beziehung', ekel: 'koerper', verwirrung: 'geist',
      erleichterung: 'seele', zufriedenheit: 'seele', langeweile: 'geist',
      überwaeltigung: 'koerper', überwaeltigt: 'koerper'
    };
    const dim = emotionToDimension[emotion.id] || catToDimension[emotion.category] || 'herz';

    // Seeded shuffle so each emotion consistently shows different needs from that dimension
    const seed = emotion.id.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
    const seededSort = arr => [...arr].sort((a, b) => {
      const ha = Math.abs((seed ^ a.id.charCodeAt(0) * 17) % 23);
      const hb = Math.abs((seed ^ b.id.charCodeAt(0) * 17) % 23);
      return ha - hb;
    });
    const dimNeeds = NEEDS.filter(n => n.dimension === dim);
    const otherNeeds = NEEDS.filter(n => n.dimension !== dim);
    const displayNeeds = [...seededSort(dimNeeds), ...seededSort(otherNeeds)].slice(0, 6);

    const color = getCategoryColor(emotion.category);
    const headerText = L(`${emotion.de} verbindet sich mit...`, `${emotion.en} connects to...`, `${emotion.vi} kết nối với...`, `${emotion.el} συνδέεται με...`);
    const questionText = L('Welches dieser Bedürfnisse sprichst du an?', 'Which of these needs resonates?', 'Nhu cầu nào đang nói với bạn?', 'Ποια από αυτές τις ανάγκες σε αγγίζει;');
    const journalText = L('Im Journal festhalten', 'Note in Journal', 'Ghi vào nhật ký', 'Σημείωσε στο ημερολόγιο');

    resultEl.innerHTML = `
      <div class="nm-result-card" style="--cat-color:${color}">
        <div class="nm-result-header">
          <span class="nm-result-emoji">${emotion.emoji}</span>
          <span class="nm-result-title">${headerText}</span>
        </div>
        <div class="nm-needs-grid">
          ${displayNeeds.map(n => `
            <button class="nm-need-btn" data-need="${n.de || n.en}">
              <span class="nm-need-icon">${n.emoji || '🌱'}</span>
              <span class="nm-need-name">${n[lang] || n.de || n.en}</span>
            </button>`).join('')}
        </div>
        <p class="nm-question">${questionText}</p>
        <div class="nm-selected-need"></div>
        <button class="nm-journal-btn">${journalText}</button>
      </div>`;

    let selectedNeed = null;
    resultEl.querySelectorAll('.nm-need-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        resultEl.querySelectorAll('.nm-need-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedNeed = btn.dataset.need;
        const selectedEl = resultEl.querySelector('.nm-selected-need');
        const needMsg = L(
          `Du spürst ein Bedürfnis nach "${selectedNeed}".`,
          `You sense a need for "${selectedNeed}".`,
          `Bạn cảm thấy cần "${selectedNeed}".`,
          `Αισθάνεσαι ανάγκη για "${selectedNeed}".`
        );
        if (selectedEl) selectedEl.textContent = needMsg;
      });
    });

    resultEl.querySelector('.nm-journal-btn').addEventListener('click', () => {
      // Pre-fill journal with emotion + need reflection
      const journalEntry = selectedNeed
        ? `${emotion.emoji} ${emotion[lang] || emotion.de} → Bedürfnis: ${selectedNeed}`
        : `${emotion.emoji} ${emotion[lang] || emotion.de}`;
      localStorage.setItem('gefuehle-journal-prefill', journalEntry);
      state.mode = 'journal';
      const container2 = document.querySelector('.needsmap-mode');
      if (container2) container2.classList.remove('active');
      const jMode = document.querySelector('.journal-mode');
      if (jMode) jMode.classList.add('active');
      initJournalMode(journalEntry);
    });

    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---- Emotion Map (Win 8) ---- */
  function initEmotionMapMode() {
    const wheelContainer = dom.wheelMode;
    if (!wheelContainer) return;
    // Emotion map is rendered within the existing wheel mode
    // No changes needed — it's handled by initWheelMode()
  }

  function init() {
    cacheDom();
    initDarkMode();
    initSound();
    initClassroomMode();
    bindEvents();
    updateUIText();
    checkReminder();
    // Restore profile display
    const savedProfile = JSON.parse(localStorage.getItem('gefuehle-profile') || 'null');
    if (savedProfile) renderProfileInHeader(savedProfile);
    // Track session count for progressive disclosure
    const sessionCount = parseInt(localStorage.getItem('gefuehle-session-count') || '0');
    localStorage.setItem('gefuehle-session-count', sessionCount + 1);
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
