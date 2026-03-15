/**
 * Gefühle-Memory — Flashcard Learning Mode
 * Spaced repetition, 6 quiz types, progress dashboard, session summary, export
 */

(function () {
  'use strict';

  /* ---- Constants ---- */
  const STORAGE_KEY = 'gefuehle-learn-progress';
  const STREAK_KEY = 'gefuehle-learn-streak';
  const CARDS_PER_SESSION = 10;
  const NEW_CARDS_BATCH = 5;
  const MASTERY_COLORS = { new: '#9E9589', learning: '#F6C344', known: '#27AE60', mastered: '#F39C12' };

  /* ---- State ---- */
  let learnState = {
    view: 'dashboard', // 'dashboard' | 'quiz' | 'summary'
    sessionCards: [],
    currentIndex: 0,
    sessionCorrect: 0,
    sessionWrong: 0,
    sessionNewLearned: 0,
    sessionUpgrades: [],
    sessionEmotionIds: []
  };

  /* ---- Helpers (mirror game.js patterns) ---- */
  function getLang1() { return document.getElementById('lang1').value; }
  function getLang2() { return document.getElementById('lang2').value; }
  function getUILang() { return getLang1(); }
  function t(key) { return (UI_TEXT[getUILang()] || UI_TEXT.de)[key] || key; }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr, n) { return shuffle(arr).slice(0, n); }

  function getCategoryForEmotion(emotionId) {
    const e = EMOTIONS.find(em => em.id === emotionId);
    return e ? CATEGORIES.find(c => c.id === e.category) : null;
  }

  /* ---- Progress Storage ---- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function getEmotionProgress(progress, emotionId) {
    return progress[emotionId] || { correct: 0, wrong: 0, streak: 0, nextReview: 0, mastery: 'new' };
  }

  function computeMastery(correct) {
    if (correct >= 10) return 'mastered';
    if (correct >= 5) return 'known';
    if (correct >= 2) return 'learning';
    return 'new';
  }

  function recordAnswer(emotionId, isCorrect) {
    const progress = loadProgress();
    const p = getEmotionProgress(progress, emotionId);
    const oldMastery = p.mastery;

    if (isCorrect) {
      p.correct++;
      p.streak++;
      const intervalIndex = Math.min(p.streak - 1, SR_INTERVALS.length - 1);
      p.nextReview = Date.now() + SR_INTERVALS[Math.max(0, intervalIndex)] * 3600000;
    } else {
      p.wrong++;
      p.streak = 0;
      p.nextReview = Date.now() + SR_INTERVALS[0] * 3600000;
    }

    p.mastery = computeMastery(p.correct);
    progress[emotionId] = p;
    saveProgress(progress);

    // Track upgrade
    if (p.mastery !== oldMastery && isCorrect) {
      const ml = MASTERY_LEVELS;
      const oldEmoji = (ml.find(m => m.id === oldMastery) || ml[0]).emoji;
      const newEmoji = (ml.find(m => m.id === p.mastery) || ml[0]).emoji;
      const emo = EMOTIONS.find(e => e.id === emotionId);
      const word = emo ? emo[getUILang()] || emo.de : emotionId;
      learnState.sessionUpgrades.push(`${oldEmoji}\u2192${newEmoji} ${word}`);
    }

    return p;
  }

  /* ---- Streak ---- */
  function loadStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null }; } catch { return { count: 0, lastDate: null }; }
  }

  function updateStreak() {
    const s = loadStreak();
    const today = new Date().toISOString().slice(0, 10);
    if (s.lastDate === today) return s;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (s.lastDate === yesterday) {
      s.count++;
    } else if (s.lastDate !== today) {
      s.count = 1;
    }
    s.lastDate = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
    return s;
  }

  /* ---- Card Selection ---- */
  function selectSessionCards(mode) {
    const progress = loadProgress();
    const now = Date.now();

    if (mode === 'new') {
      // Pick emotions with no progress yet
      const unseen = EMOTIONS.filter(e => !progress[e.id] || progress[e.id].correct === 0);
      return pick(unseen, NEW_CARDS_BATCH).map(e => e.id);
    }

    // Default: due cards first, then new
    const due = EMOTIONS.filter(e => {
      const p = progress[e.id];
      return p && p.nextReview && p.nextReview <= now && p.mastery !== 'mastered';
    }).sort((a, b) => (progress[a.id].nextReview || 0) - (progress[b.id].nextReview || 0));

    const dueIds = due.map(e => e.id).slice(0, CARDS_PER_SESSION);

    if (dueIds.length >= CARDS_PER_SESSION) return dueIds;

    // Fill remaining with new cards
    const remaining = CARDS_PER_SESSION - dueIds.length;
    const unseen = EMOTIONS.filter(e => !progress[e.id] && !dueIds.includes(e.id));
    const newIds = pick(unseen, remaining).map(e => e.id);

    // If still not enough, add learning/known cards
    const combined = [...dueIds, ...newIds];
    if (combined.length < CARDS_PER_SESSION) {
      const extra = EMOTIONS.filter(e => !combined.includes(e.id) && progress[e.id] && progress[e.id].mastery !== 'mastered');
      const extraIds = pick(extra, CARDS_PER_SESSION - combined.length).map(e => e.id);
      combined.push(...extraIds);
    }

    return combined;
  }

  /* ---- Quiz Type Selection ---- */
  function pickQuizType(emotionId) {
    const types = ['emoji-to-word', 'word-to-translation', 'scenario-to-emotion', 'audio-to-word', 'fill-blank', 'category-sort'];

    // Check if scenario exists for this emotion
    const hasScenario = SCENARIOS[emotionId] && SCENARIOS[emotionId].length > 0;
    const available = types.filter(type => {
      if (type === 'scenario-to-emotion' && !hasScenario) return false;
      if (type === 'fill-blank' && !hasScenario) return false;
      if (type === 'audio-to-word' && !window.gefuhleSpeakWord) return false;
      return true;
    });

    return available[Math.floor(Math.random() * available.length)];
  }

  function getDistractors(correctEmotion, count, sameCategory) {
    let pool;
    if (sameCategory) {
      pool = EMOTIONS.filter(e => e.category === correctEmotion.category && e.id !== correctEmotion.id);
    } else {
      pool = EMOTIONS.filter(e => e.id !== correctEmotion.id);
    }
    if (pool.length < count) pool = EMOTIONS.filter(e => e.id !== correctEmotion.id);
    return pick(pool, count);
  }

  /* ---- Quiz Renderers ---- */
  function renderQuiz(container, emotionId, quizType, onAnswer) {
    const emotion = EMOTIONS.find(e => e.id === emotionId);
    if (!emotion) return;
    const cat = getCategoryForEmotion(emotionId);
    const lang1 = getLang1();
    const lang2 = getLang2();

    container.innerHTML = '';

    switch (quizType) {
      case 'emoji-to-word':
        renderEmojiToWord(container, emotion, cat, lang1, onAnswer);
        break;
      case 'word-to-translation':
        renderWordToTranslation(container, emotion, lang1, lang2, onAnswer);
        break;
      case 'scenario-to-emotion':
        renderScenarioToEmotion(container, emotion, lang1, onAnswer);
        break;
      case 'audio-to-word':
        renderAudioToWord(container, emotion, lang1, lang2, onAnswer);
        break;
      case 'fill-blank':
        renderFillBlank(container, emotion, lang1, onAnswer);
        break;
      case 'category-sort':
        renderCategorySort(container, emotion, lang1, onAnswer);
        break;
    }
  }

  function makeAnswerGrid(container, options, correctIndex, onAnswer, cols) {
    const grid = document.createElement('div');
    grid.className = 'learn-answer-grid' + (cols === 6 ? ' learn-answer-grid-6' : '');

    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'learn-answer-btn';
      btn.innerHTML = opt.html;
      btn.addEventListener('click', () => {
        if (grid.dataset.answered) return;
        grid.dataset.answered = 'true';

        const isCorrect = i === correctIndex;
        btn.classList.add(isCorrect ? 'answer-correct' : 'answer-wrong');

        if (!isCorrect) {
          grid.children[correctIndex].classList.add('answer-correct');
        }

        setTimeout(() => onAnswer(isCorrect), isCorrect ? 1500 : 2500);
      });
      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }

  function renderEmojiToWord(container, emotion, cat, lang, onAnswer) {
    const prompt = document.createElement('div');
    prompt.className = 'learn-quiz-prompt';
    prompt.innerHTML = `<span class="learn-big-emoji" style="background:${cat ? cat.colorLight : ''};border-color:${cat ? cat.color : ''}">${emotion.emoji}</span>`;
    container.appendChild(prompt);

    const distractors = getDistractors(emotion, 3, true);
    const allOptions = shuffle([emotion, ...distractors]);
    const correctIdx = allOptions.indexOf(emotion);

    makeAnswerGrid(container, allOptions.map(e => ({
      html: `<span class="answer-word">${e[lang] || e.de}</span>`
    })), correctIdx, onAnswer);
  }

  function renderWordToTranslation(container, emotion, lang1, lang2, onAnswer) {
    const prompt = document.createElement('div');
    prompt.className = 'learn-quiz-prompt';
    prompt.innerHTML = `<span class="learn-prompt-word">${emotion[lang1] || emotion.de}</span>
      <span class="learn-prompt-hint">${emotion.emoji}</span>`;
    container.appendChild(prompt);

    const distractors = getDistractors(emotion, 3, false);
    const allOptions = shuffle([emotion, ...distractors]);
    const correctIdx = allOptions.indexOf(emotion);

    makeAnswerGrid(container, allOptions.map(e => ({
      html: `<span class="answer-word">${e[lang2] || e.vi}</span>`
    })), correctIdx, onAnswer);
  }

  function renderScenarioToEmotion(container, emotion, lang, onAnswer) {
    const scenarios = SCENARIOS[emotion.id];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const prompt = document.createElement('div');
    prompt.className = 'learn-quiz-prompt';
    prompt.innerHTML = `<span class="learn-scenario-text">${scenario[lang] || scenario.de}</span>`;
    container.appendChild(prompt);

    const distractors = getDistractors(emotion, 3, false);
    const allOptions = shuffle([emotion, ...distractors]);
    const correctIdx = allOptions.indexOf(emotion);

    makeAnswerGrid(container, allOptions.map(e => ({
      html: `<span class="answer-emoji">${e.emoji}</span><span class="answer-word">${e[lang] || e.de}</span>`
    })), correctIdx, onAnswer);
  }

  function renderAudioToWord(container, emotion, lang1, lang2, onAnswer) {
    const prompt = document.createElement('div');
    prompt.className = 'learn-quiz-prompt';
    prompt.innerHTML = `<button class="learn-audio-btn" title="Play">&#128264;</button>
      <span class="learn-prompt-hint learn-audio-hint">?</span>`;
    container.appendChild(prompt);

    // Auto-play
    const playAudio = () => {
      if (window.gefuhleSpeakWord) {
        window.gefuhleSpeakWord(emotion[lang1] || emotion.de, lang1);
      }
    };
    prompt.querySelector('.learn-audio-btn').addEventListener('click', playAudio);
    setTimeout(playAudio, 300);

    const distractors = getDistractors(emotion, 3, false);
    const allOptions = shuffle([emotion, ...distractors]);
    const correctIdx = allOptions.indexOf(emotion);

    makeAnswerGrid(container, allOptions.map(e => ({
      html: `<span class="answer-word">${e[lang2] || e.vi}</span>`
    })), correctIdx, onAnswer);
  }

  function renderFillBlank(container, emotion, lang, onAnswer) {
    const scenarios = SCENARIOS[emotion.id];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const text = scenario[lang] || scenario.de;
    // Replace a key word or just show with blank
    const blanked = text.length > 30 ? text.slice(0, Math.floor(text.length * 0.6)) + ' ___.' : '___ ' + text;

    const prompt = document.createElement('div');
    prompt.className = 'learn-quiz-prompt';
    prompt.innerHTML = `<span class="learn-scenario-text">${blanked}</span>
      <span class="learn-prompt-hint">${emotion.emoji}</span>`;
    container.appendChild(prompt);

    const distractors = getDistractors(emotion, 3, false);
    const allOptions = shuffle([emotion, ...distractors]);
    const correctIdx = allOptions.indexOf(emotion);

    makeAnswerGrid(container, allOptions.map(e => ({
      html: `<span class="answer-word">${e[lang] || e.de}</span>`
    })), correctIdx, onAnswer);
  }

  function renderCategorySort(container, emotion, lang, onAnswer) {
    const cat = getCategoryForEmotion(emotion.id);

    const prompt = document.createElement('div');
    prompt.className = 'learn-quiz-prompt';
    prompt.innerHTML = `<span class="learn-big-emoji">${emotion.emoji}</span>
      <span class="learn-prompt-word">${emotion[lang] || emotion.de}</span>`;
    container.appendChild(prompt);

    const allCats = [...CATEGORIES];
    const correctIdx = allCats.findIndex(c => c.id === emotion.category);

    makeAnswerGrid(container, allCats.map(c => ({
      html: `<span class="answer-emoji">${c.emoji}</span><span class="answer-word">${c[lang] || c.de}</span>`
    })), correctIdx, onAnswer, 6);
  }

  /* ---- Dashboard ---- */
  function renderDashboard(container) {
    learnState.view = 'dashboard';
    const progress = loadProgress();
    const streak = loadStreak();
    const lang = getUILang();
    const now = Date.now();

    // Compute stats
    let counts = { new: 0, learning: 0, known: 0, mastered: 0 };
    let catCounts = {};
    CATEGORIES.forEach(c => { catCounts[c.id] = { total: 0, learning: 0, known: 0, mastered: 0 }; });

    EMOTIONS.forEach(e => {
      const p = getEmotionProgress(progress, e.id);
      counts[p.mastery]++;
      if (catCounts[e.category]) {
        catCounts[e.category].total++;
        if (p.mastery !== 'new') catCounts[e.category][p.mastery]++;
      }
    });

    const dueCount = EMOTIONS.filter(e => {
      const p = progress[e.id];
      return p && p.nextReview && p.nextReview <= now && p.mastery !== 'mastered';
    }).length;

    const total = EMOTIONS.length;

    // Last studied
    let lastStudiedStr = '—';
    const allTimes = Object.values(progress).map(p => p.nextReview).filter(Boolean);
    if (allTimes.length > 0) {
      // nextReview is set after answering, so the most recently set one indicates last activity
      const lastDate = streak.lastDate;
      if (lastDate) {
        const d = new Date(lastDate);
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (lastDate === today) lastStudiedStr = lang === 'de' ? 'Heute' : lang === 'vi' ? 'Hôm nay' : 'Today';
        else if (lastDate === yesterday) lastStudiedStr = lang === 'de' ? 'Gestern' : lang === 'vi' ? 'Hôm qua' : 'Yesterday';
        else lastStudiedStr = d.toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'vi' ? 'vi-VN' : 'en-GB');
      }
    }

    container.innerHTML = `
      <div class="learn-dashboard">
        <h2 class="learn-title">${t('learnTitle')}</h2>
        <p class="learn-subtitle">${t('learnSubtitle')}</p>

        <div class="learn-streak-row">
          <span class="learn-streak-fire">&#128293;</span>
          <span class="learn-streak-count">${streak.count}</span>
          <span class="learn-streak-label">${t('streakDays')} ${t('streak')}</span>
        </div>

        <div class="learn-mastery-bar">
          ${counts.mastered > 0 ? `<div class="learn-mastery-seg" style="flex:${counts.mastered};background:${MASTERY_COLORS.mastered}" title="${t('masteryMastered')}: ${counts.mastered}"></div>` : ''}
          ${counts.known > 0 ? `<div class="learn-mastery-seg" style="flex:${counts.known};background:${MASTERY_COLORS.known}" title="${t('masteryKnown')}: ${counts.known}"></div>` : ''}
          ${counts.learning > 0 ? `<div class="learn-mastery-seg" style="flex:${counts.learning};background:${MASTERY_COLORS.learning}" title="${t('masteryLearning')}: ${counts.learning}"></div>` : ''}
          ${counts.new > 0 ? `<div class="learn-mastery-seg" style="flex:${counts.new};background:${MASTERY_COLORS.new}" title="${t('masteryNew')}: ${counts.new}"></div>` : ''}
        </div>
        <div class="learn-mastery-legend">
          <span><span class="learn-legend-dot" style="background:${MASTERY_COLORS.mastered}"></span>${t('masteryMastered')} ${counts.mastered}</span>
          <span><span class="learn-legend-dot" style="background:${MASTERY_COLORS.known}"></span>${t('masteryKnown')} ${counts.known}</span>
          <span><span class="learn-legend-dot" style="background:${MASTERY_COLORS.learning}"></span>${t('masteryLearning')} ${counts.learning}</span>
          <span><span class="learn-legend-dot" style="background:${MASTERY_COLORS.new}"></span>${t('masteryNew')} ${counts.new}</span>
        </div>

        <div class="learn-stats-row">
          <div class="learn-stat-card">
            <div class="learn-stat-number">${dueCount}</div>
            <div class="learn-stat-label">${t('dueToday')}</div>
          </div>
          <div class="learn-stat-card">
            <div class="learn-stat-number">${total - counts.new}</div>
            <div class="learn-stat-label">${t('newLearned')}</div>
          </div>
          <div class="learn-stat-card">
            <div class="learn-stat-number">${lastStudiedStr}</div>
            <div class="learn-stat-label">${t('lastStudied')}</div>
          </div>
        </div>

        <div class="learn-cat-breakdown">
          <h3>${t('categoryBreakdown')}</h3>
          ${CATEGORIES.map(cat => {
            const cc = catCounts[cat.id];
            const pct = cc.total > 0 ? Math.round(((cc.learning + cc.known + cc.mastered) / cc.total) * 100) : 0;
            return `<div class="learn-cat-row">
              <span class="learn-cat-label">${cat.emoji} ${cat[lang] || cat.de}</span>
              <div class="learn-cat-bar-bg">
                <div class="learn-cat-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
              </div>
              <span class="learn-cat-pct">${pct}%</span>
            </div>`;
          }).join('')}
        </div>

        <div class="learn-actions">
          <button class="btn btn-primary learn-btn-study" ${dueCount === 0 && counts.new === 0 ? '' : ''}>${t('studyNow')}</button>
          <button class="btn btn-secondary learn-btn-new">${t('newCards')}</button>
        </div>

        <button class="learn-export-btn">${t('exportProgress')}</button>
      </div>
    `;

    // Wire buttons
    container.querySelector('.learn-btn-study').addEventListener('click', () => startSession(container, 'due'));
    container.querySelector('.learn-btn-new').addEventListener('click', () => startSession(container, 'new'));
    container.querySelector('.learn-export-btn').addEventListener('click', () => exportProgress());
  }

  /* ---- Session (Quiz) ---- */
  function startSession(container, mode) {
    const cardIds = selectSessionCards(mode);
    if (cardIds.length === 0) {
      // Nothing to study
      renderDashboard(container);
      return;
    }

    learnState.view = 'quiz';
    learnState.sessionCards = cardIds;
    learnState.currentIndex = 0;
    learnState.sessionCorrect = 0;
    learnState.sessionWrong = 0;
    learnState.sessionNewLearned = 0;
    learnState.sessionUpgrades = [];
    learnState.sessionEmotionIds = [...cardIds];

    updateStreak();
    showCard(container);
  }

  function showCard(container) {
    const idx = learnState.currentIndex;
    const total = learnState.sessionCards.length;

    if (idx >= total) {
      renderSummary(container);
      return;
    }

    const emotionId = learnState.sessionCards[idx];
    const emotion = EMOTIONS.find(e => e.id === emotionId);
    const progress = loadProgress();
    const p = getEmotionProgress(progress, emotionId);
    const quizType = pickQuizType(emotionId);

    container.innerHTML = `
      <div class="learn-quiz">
        <div class="learn-progress-bar-bg">
          <div class="learn-progress-bar-fill" style="width:${((idx) / total) * 100}%"></div>
        </div>
        <div class="learn-quiz-header">
          <span class="learn-card-counter">${idx + 1} / ${total}</span>
          <span class="learn-score-display">${learnState.sessionCorrect} ${t('correct')} · ${learnState.sessionWrong} ${t('wrong')}</span>
        </div>
        <div class="learn-quiz-type-label">${(QUIZ_TYPES.find(q => q.id === quizType) || {})[getUILang()] || quizType}</div>
        <div class="learn-quiz-body"></div>
      </div>
    `;

    const body = container.querySelector('.learn-quiz-body');
    renderQuiz(body, emotionId, quizType, (isCorrect) => {
      const wasNew = p.mastery === 'new' && p.correct === 0;
      recordAnswer(emotionId, isCorrect);

      if (isCorrect) {
        learnState.sessionCorrect++;
        if (wasNew) learnState.sessionNewLearned++;
      } else {
        learnState.sessionWrong++;
      }

      // Show correct answer briefly
      const emotion = EMOTIONS.find(e => e.id === emotionId);
      const feedback = document.createElement('div');
      feedback.className = 'learn-feedback ' + (isCorrect ? 'learn-feedback-correct' : 'learn-feedback-wrong');
      feedback.innerHTML = `<span>${emotion.emoji}</span> <strong>${emotion[getLang1()] || emotion.de}</strong> · ${emotion[getLang2()] || emotion.vi}`;
      body.appendChild(feedback);

      learnState.currentIndex++;
      setTimeout(() => showCard(container), isCorrect ? 1500 : 2500);
    });
  }

  /* ---- Session Summary ---- */
  function renderSummary(container) {
    learnState.view = 'summary';
    const total = learnState.sessionCards.length;
    const correct = learnState.sessionCorrect;
    const lang = getUILang();

    // Pick a random exercise for a word from this session
    let exerciseHtml = '';
    if (EXERCISES[lang] && learnState.sessionEmotionIds.length > 0) {
      const randEmoId = learnState.sessionEmotionIds[Math.floor(Math.random() * learnState.sessionEmotionIds.length)];
      const emo = EMOTIONS.find(e => e.id === randEmoId);
      const exercises = EXERCISES[lang];
      const exercise = exercises[Math.floor(Math.random() * exercises.length)];
      const word = emo ? (emo[lang] || emo.de) : '';
      exerciseHtml = `
        <div class="learn-exercise">
          <h4>${t('exercisePrompt')}</h4>
          <p>${exercise.prompt.replace('{word}', word)}</p>
        </div>
      `;
    }

    // Words to review (wrong answers)
    const wrongIds = learnState.sessionEmotionIds.filter((id, i) => {
      // We don't track per-card results separately, so show count
      return false;
    });

    container.innerHTML = `
      <div class="learn-summary">
        <div class="learn-summary-emoji">${correct >= total * 0.8 ? '&#127881;' : correct >= total * 0.5 ? '&#128170;' : '&#128161;'}</div>
        <h2>${t('sessionComplete')}</h2>
        <div class="learn-summary-score">${t('score')}: <strong>${correct}/${total}</strong></div>
        <div class="learn-summary-details">
          <div>${t('newLearned')}: ${learnState.sessionNewLearned}</div>
          <div>${t('toReview')}: ${learnState.sessionWrong}</div>
        </div>
        ${learnState.sessionUpgrades.length > 0 ? `
          <div class="learn-summary-upgrades">
            ${learnState.sessionUpgrades.map(u => `<div class="learn-upgrade-item">${u}</div>`).join('')}
          </div>
        ` : ''}
        ${exerciseHtml}
        <div class="learn-summary-actions">
          <button class="btn btn-primary learn-btn-again">${t('nochmal')}</button>
          <button class="btn btn-secondary learn-btn-back">${t('backToDashboard')}</button>
        </div>
      </div>
    `;

    container.querySelector('.learn-btn-again').addEventListener('click', () => startSession(container, 'due'));
    container.querySelector('.learn-btn-back').addEventListener('click', () => renderDashboard(container));
  }

  /* ---- Export ---- */
  function exportProgress() {
    const progress = loadProgress();
    const streak = loadStreak();
    const lang = getUILang();

    // Compute stats
    let counts = { new: 0, learning: 0, known: 0, mastered: 0 };
    let catCounts = {};
    CATEGORIES.forEach(c => { catCounts[c.id] = { total: 0, new: 0, learning: 0, known: 0, mastered: 0 }; });

    EMOTIONS.forEach(e => {
      const p = getEmotionProgress(progress, e.id);
      counts[p.mastery]++;
      if (catCounts[e.category]) {
        catCounts[e.category].total++;
        catCounts[e.category][p.mastery]++;
      }
    });

    const total = EMOTIONS.length;
    const learned = total - counts.new;

    // Text summary
    let text = `Student progress: ${learned}/${total} emotions learned. Mastered: ${counts.mastered}. Known: ${counts.known}. Learning: ${counts.learning}. New: ${counts.new}.\n\nPer category:\n`;
    CATEGORIES.forEach(c => {
      const cc = catCounts[c.id];
      text += `  ${c.en}: ${cc.total - cc.new}/${cc.total} learned (Mastered: ${cc.mastered}, Known: ${cc.known}, Learning: ${cc.learning})\n`;
    });
    text += `\nStreak: ${streak.count} days\nLast studied: ${streak.lastDate || 'never'}\n`;

    // Build JSON export
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: { total, learned, counts, streak },
      categories: catCounts,
      emotions: progress
    };

    // Download JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gefuehle-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also copy text summary to clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  /* ---- Init ---- */
  function initLearnMode() {
    const container = document.querySelector('.learn-mode');
    if (!container) return;
    renderDashboard(container);
  }

  // Expose for game.js
  window.initLearnMode = initLearnMode;

})();
