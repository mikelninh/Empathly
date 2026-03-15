/**
 * Gefühle-Memory — Game Engine
 * Classic memory + Talk + Story + Check-in modes
 * Bilingual card matching with 67 emotions in 6 categories
 */

(function () {
  'use strict';

  /* ---- State ---- */
  let state = {
    lang1: 'de',
    lang2: 'vi',
    uiLang: 'de',
    mode: 'classic',
    category: 'all',        // 'all' or category id
    cards: [],
    flipped: [],
    matched: new Set(),
    moves: 0,
    pairsFound: 0,
    totalPairs: 0,
    timerStart: null,
    timerInterval: null,
    locked: false,
    checkinSelections: {}
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
    dom.talkMode = $('.talk-mode');
    dom.storyMode = $('.story-mode');
    dom.checkinMode = $('.checkin-mode');
    dom.statsBar = $('.stats');
    dom.lang1Select = $('#lang1');
    dom.lang2Select = $('#lang2');
    dom.categorySelect = $('#category');
    dom.newGameBtn = $('#btn-new-game');
    dom.modeTabs = $$('.mode-tab');
    dom.controlsRow2 = $('.controls-row-2');
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

  function getEmotions() {
    if (state.category === 'all') return EMOTIONS;
    return EMOTIONS.filter(e => e.category === state.category);
  }

  /* ---- UI text updates ---- */
  function updateUIText() {
    dom.title.textContent = t('title');
    dom.subtitle.textContent = t('subtitle');
    dom.newGameBtn.title = t('newGame');
    dom.modeTabs.forEach(tab => {
      const mode = tab.dataset.mode;
      const key = 'mode' + mode.charAt(0).toUpperCase() + mode.slice(1);
      if (UI_TEXT[state.uiLang][key]) tab.textContent = UI_TEXT[state.uiLang][key];
    });

    // Category select
    const catSelect = dom.categorySelect;
    catSelect.innerHTML = `<option value="all">${t('allCategories')}</option>`;
    CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.emoji} ${cat[state.uiLang] || cat.de}`;
      catSelect.appendChild(opt);
    });
    catSelect.value = state.category;

    // Language flag labels
    const flag1El = $('#flag1');
    const flag2El = $('#flag2');
    if (flag1El) flag1El.textContent = LANGUAGES[state.lang1]?.flag || '';
    if (flag2El) flag2El.textContent = LANGUAGES[state.lang2]?.flag || '';
  }

  /* ---- Card rendering ---- */
  function buildDeck() {
    const pool = getEmotions();
    const subset = shuffle(pool).slice(0, Math.min(pool.length, 20));
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
    el.innerHTML = `
      <div class="card-face card-back">
        <div class="card-back-pattern"></div>
      </div>
      <div class="card-face card-front" style="border-top: 3px solid ${card.color}">
        <span class="card-lang-badge">${flag}</span>
        <span class="card-emoji">${card.emoji}</span>
        <span class="card-word">${card.word}</span>
      </div>`;
    el.addEventListener('click', () => onCardClick(index));
    return el;
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

    dom.board.style.display = isClassic ? '' : 'none';
    dom.statsBar.style.display = isClassic ? '' : 'none';
    dom.controlsRow2.style.display = isCheckin ? 'none' : '';
    dom.talkMode.classList.toggle('active', isTalk);
    dom.storyMode.classList.toggle('active', isStory);
    dom.checkinMode.classList.toggle('active', isCheckin);

    if (isClassic) {
      state.cards = buildDeck();
      state.totalPairs = state.cards.length / 2;
      updateStats();
      dom.time.textContent = '0:00';
      dom.board.innerHTML = '';
      state.cards.forEach((card, i) => dom.board.appendChild(renderCard(card, i)));
    }
    if (isTalk) initTalkMode();
    if (isStory) initStoryMode();
    if (isCheckin) initCheckinMode();
  }

  function onCardClick(index) {
    if (state.locked || state.matched.has(index) || state.flipped.includes(index) || state.flipped.length >= 2) return;
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
        updateStats();
        $(`.card[data-index="${i}"]`, dom.board).classList.add('matched');
        $(`.card[data-index="${j}"]`, dom.board).classList.add('matched');
        state.flipped = []; state.locked = false;
        showPrompt(a.emotion);
        if (state.pairsFound === state.totalPairs) setTimeout(showCongrats, 1200);
      }, 500);
    } else {
      state.locked = true;
      setTimeout(() => {
        $(`.card[data-index="${i}"]`, dom.board).classList.remove('flipped');
        $(`.card[data-index="${j}"]`, dom.board).classList.remove('flipped');
        state.flipped = []; state.locked = false;
      }, 900);
    }
  }

  function updateStats() {
    dom.moves.textContent = state.moves;
    dom.pairs.textContent = `${state.pairsFound}/${state.totalPairs}`;
  }
  function updateTimer() {
    if (state.timerStart) dom.time.textContent = formatTime(Date.now() - state.timerStart);
  }

  /* ---- Prompt overlay ---- */
  function showPrompt(emotion) {
    const color = getCategoryColor(emotion.category);
    dom.promptEmoji.textContent = emotion.emoji;
    dom.promptWordPrimary.textContent = emotion[state.lang1];
    dom.promptWordSecondary.textContent = emotion[state.lang2];
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
    dom.congratsText.textContent = t('congratsText');
    dom.congratsStats.textContent = t('congratsStats').replace('{moves}', state.moves).replace('{time}', elapsed);
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
        <span class="card-word" style="color:${color}">${emo[state.lang1]}</span>
        <span class="card-word-secondary">${emo[state.lang2]}</span>`;
      cardDisplay.style.borderTop = `4px solid ${color}`;
      prompt.textContent = emo.prompt[state.uiLang] || emo.prompt.de;
    }
    drawBtn.onclick = () => {
      index++;
      cardDisplay.style.transform = 'scale(.9) rotateZ(-3deg)';
      setTimeout(() => { show(); cardDisplay.style.transform = ''; }, 200);
    };
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
          <span class="card-word" style="color:${color}">${emo[state.lang1]}</span>
          <span class="card-word" style="color:${color};opacity:.7;font-weight:400">${emo[state.lang2]}</span>`;
        cardsEl.appendChild(card);
      });
    }
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

    // Bind need buttons
    $$('.need-btn', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const dim = btn.dataset.dim;
        const need = btn.dataset.need;
        // Toggle selection within dimension
        const wasSelected = btn.classList.contains('selected');
        // Allow multiple selections per dimension
        btn.classList.toggle('selected');
        if (wasSelected) {
          delete state.checkinSelections[need];
        } else {
          state.checkinSelections[need] = dim;
        }
        updateCheckinSummary(container);
      });
    });

    // Reset
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

  /* ---- Events ---- */
  function bindEvents() {
    dom.promptClose.addEventListener('click', hidePrompt);
    dom.promptOverlay.addEventListener('click', e => { if (e.target === dom.promptOverlay) hidePrompt(); });
    $('#btn-play-again').addEventListener('click', () => { hideCongrats(); startGame(); });
    $('#btn-share').addEventListener('click', () => { hideCongrats(); shareGame(); });
    dom.newGameBtn.addEventListener('click', startGame);

    dom.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.mode = tab.dataset.mode;
        dom.modeTabs.forEach(t => t.classList.toggle('active', t === tab));
        startGame();
      });
    });

    dom.lang1Select.addEventListener('change', () => {
      state.lang1 = dom.lang1Select.value;
      state.uiLang = state.lang1;
      updateUIText();
      startGame();
    });
    dom.lang2Select.addEventListener('change', () => {
      state.lang2 = dom.lang2Select.value;
      startGame();
    });
    dom.categorySelect.addEventListener('change', () => {
      state.category = dom.categorySelect.value;
      startGame();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hidePrompt(); hideCongrats(); }
    });
  }

  /* ---- Init ---- */
  function init() {
    cacheDom();
    bindEvents();
    updateUIText();
    startGame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
