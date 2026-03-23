/**
 * Gefühle-Memory — AI Integration (OpenRouter)
 * Settings modal, AI cultural bridge, journal pattern analysis.
 */

const GefuehleAI = (function () {
  'use strict';

  const STORAGE_KEY_API = 'gefuehle-ai-apikey';
  const STORAGE_KEY_MODEL = 'gefuehle-ai-model';
  const STORAGE_KEY_ENABLED = 'gefuehle-ai-enabled';
  const CACHE_PREFIX = 'gefuehle-ai-cache-';

  // OpenAI is the default provider (key on server — no user key needed)
  const DEFAULT_MODEL = 'gpt-4o-mini';
  const DEMO_API_KEY = '';

  const MODEL_OPTIONS = [
    // OpenAI — handled by backend (no user key needed)
    { value: 'gpt-4o-mini',  label: 'GPT-4o Mini (default)',  provider: 'openai' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini',           provider: 'openai' },
    { value: 'gpt-5-mini',   label: 'GPT-5 Mini',             provider: 'openai' },
    // OpenRouter — requires your own OpenRouter key
    { value: 'google/gemma-3-27b-it:free',                    label: 'Gemma 3 27B (OpenRouter, free)',       provider: 'openrouter' },
    { value: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral Small 3.1 (OpenRouter, free)',  provider: 'openrouter' },
    { value: 'anthropic/claude-sonnet-4-6',                   label: 'Claude Sonnet 4.6 (OpenRouter)',        provider: 'openrouter' },
  ];

  function getApiKey() { return localStorage.getItem(STORAGE_KEY_API) || DEMO_API_KEY || ''; }
  function setApiKey(key) { localStorage.setItem(STORAGE_KEY_API, key); }
  function isOpenAIModel() { const m = getModel(); return MODEL_OPTIONS.find(o => o.value === m)?.provider === 'openai'; }
  function isUsingFreeModel() { return isOpenAIModel(); } // OpenAI via backend = no user cost
  // Validate stored model is still in the list; fall back to default if removed
  function getModel() {
    const stored = localStorage.getItem(STORAGE_KEY_MODEL);
    if (stored && MODEL_OPTIONS.some(o => o.value === stored)) return stored;
    return DEFAULT_MODEL;
  }
  function setModel(m) { localStorage.setItem(STORAGE_KEY_MODEL, m); }
  function isEnabled() { return localStorage.getItem(STORAGE_KEY_ENABLED) !== 'false'; }
  function setEnabled(v) { localStorage.setItem(STORAGE_KEY_ENABLED, v ? 'true' : 'false'); }

  function isConfigured() { return !!(getApiKey() && isEnabled()); }

  // ── API Call ──
  async function callOpenRouter(prompt, systemPrompt) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No API key configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': location.href,
        'X-Title': 'Gefühle-Memory'
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error: ${response.status} ${err}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ── Cached cultural insight ──
  function getCultureCacheKey(emotionId, lang1, lang2) {
    return CACHE_PREFIX + 'culture-' + emotionId + '-' + lang1 + '-' + lang2;
  }

  function getCachedCultureInsight(emotionId, lang1, lang2) {
    return localStorage.getItem(getCultureCacheKey(emotionId, lang1, lang2));
  }

  function cacheCultureInsight(emotionId, lang1, lang2, text) {
    localStorage.setItem(getCultureCacheKey(emotionId, lang1, lang2), text);
  }

  async function generateCultureInsight(emotionId, emotionName, lang1, lang2) {
    const cached = getCachedCultureInsight(emotionId, lang1, lang2);
    if (cached) return cached;

    // Try backend RAG endpoint first (richer, knowledge-grounded response)
    if (typeof GefuehleAPI !== 'undefined') {
      try {
        const res = await GefuehleAPI.culturalBridge({
          emotion_id: emotionId,
          emotion_name: emotionName,
          source_lang: lang1,
          target_lang: lang2,
          response_lang: lang1,
        });
        if (res?.insight) {
          const vocabText = res.vocabulary?.length
            ? '\n\n' + res.vocabulary.map(v => `• ${v.word}: ${v.meaning}`).join('\n')
            : '';
          const result = res.insight + vocabText;
          cacheCultureInsight(emotionId, lang1, lang2, result);
          return result;
        }
      } catch (_) {}
    }

    // Fallback: direct OpenRouter call (requires user API key)
    const langNames = {
      de: 'German', vi: 'Vietnamese', en: 'English', tr: 'Turkish',
      ar: 'Arabic', es: 'Spanish', fr: 'French', uk: 'Ukrainian',
      pl: 'Polish', el: 'Greek', ta: 'Tamil',
    };
    const writeLang = langNames[lang1] || 'English';
    const srcName = langNames[lang1] || lang1;
    const tgtName = langNames[lang2] || lang2;
    const prompt = `You are a cultural psychologist. In 2-3 sentences, explain how the emotion "${emotionName}" is experienced and expressed differently in ${srcName} vs ${tgtName} culture. Be specific, nuanced, and mention concrete examples (phrases, behaviors, social norms). Write in ${writeLang}.`;

    const result = await callOpenRouter(prompt);
    cacheCultureInsight(emotionId, lang1, lang2, result);
    return result;
  }

  // ── Journal pattern analysis ──
  function getJournalCacheKey(lang) {
    const weekNum = getWeekNumber();
    return CACHE_PREFIX + 'journal-insight-' + lang + '-' + weekNum;
  }

  function getWeekNumber() {
    const d = new Date();
    const oneJan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  }

  async function generateJournalInsight(entries, lang) {
    const cacheKey = getJournalCacheKey(lang);
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    const langNames = {
      de: 'German', vi: 'Vietnamese', en: 'English', tr: 'Turkish',
      ar: 'Arabic', es: 'Spanish', fr: 'French', uk: 'Ukrainian',
      pl: 'Polish', el: 'Greek', ta: 'Tamil',
    };
    const writeLang = langNames[lang] || 'English';
    const last7 = entries.slice(-7);
    const entriesJson = JSON.stringify(last7.map(e => ({
      date: e.date,
      emotions: e.emotions,
      note: e.note || ''
    })));

    const prompt = `You are a compassionate emotional wellness guide. Analyze these emotion journal entries and identify patterns, trends, and gentle insights. Be warm, not clinical. Write 3-4 sentences in ${writeLang}. Entries: ${entriesJson}`;

    const result = await callOpenRouter(prompt);
    localStorage.setItem(cacheKey, result);
    return result;
  }

  // ── Settings Modal ──
  function createSettingsModal(uiLang) {
    let modal = document.querySelector('.settings-modal-overlay');
    if (modal) { modal.classList.add('visible'); return; }

    modal = document.createElement('div');
    modal.className = 'settings-modal-overlay';
    const freeHint = {
      de: '🆓 Kostenlose KI-Modelle verfügbar! Du brauchst nur einen kostenlosen OpenRouter-Key.',
      vi: '🆓 Có mô hình AI miễn phí! Bạn chỉ cần một khóa OpenRouter miễn phí.',
      en: '🆓 Free AI models available! You just need a free OpenRouter key.'
    };
    const keyHint = {
      de: 'Kostenlos erstellen auf <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">openrouter.ai/keys</a> (30 Sekunden, kein Abo)',
      vi: 'Tạo miễn phí tại <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">openrouter.ai/keys</a> (30 giây, không cần đăng ký)',
      en: 'Create for free at <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">openrouter.ai/keys</a> (30 seconds, no subscription)'
    };
    modal.innerHTML = `
      <div class="settings-modal">
        <h3 class="settings-title">⚙️ ${uiLang === 'de' ? 'KI-Einstellungen' : uiLang === 'vi' ? 'Cài đặt AI' : 'AI Settings'}</h3>
        <div class="settings-hint">${freeHint[uiLang] || freeHint.en}</div>
        <div class="settings-field">
          <label>OpenRouter API Key</label>
          <input type="password" class="settings-input" id="ai-api-key" placeholder="sk-or-..." value="${getApiKey() === DEMO_API_KEY ? '' : getApiKey()}">
          <small class="settings-help">${keyHint[uiLang] || keyHint.en}</small>
        </div>
        <div class="settings-field">
          <label>${uiLang === 'de' ? 'KI-Modell' : uiLang === 'vi' ? 'Mô hình AI' : 'AI Model'}</label>
          <select class="settings-select" id="ai-model">
            ${MODEL_OPTIONS.map(m => `<option value="${m.value}" ${m.value === getModel() ? 'selected' : ''}>${m.label}</option>`).join('')}
          </select>
          <small class="settings-help" style="color:var(--text-soft)">🆓 = ${uiLang === 'de' ? 'kostenlos, keine Kosten' : uiLang === 'vi' ? 'miễn phí, không tốn tiền' : 'free, no cost'} · ⭐ = ${uiLang === 'de' ? 'besser, kostet pro Nachricht' : uiLang === 'vi' ? 'tốt hơn, tốn phí mỗi tin nhắn' : 'better quality, costs per message'}</small>
        </div>
        <div class="settings-field settings-toggle-row">
          <label>${uiLang === 'de' ? 'KI-Funktionen' : uiLang === 'vi' ? 'Tính năng AI' : 'AI Features'}</label>
          <button class="settings-toggle ${isEnabled() ? 'on' : ''}" id="ai-toggle">${isEnabled() ? 'ON' : 'OFF'}</button>
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary settings-save">${uiLang === 'de' ? 'Speichern' : uiLang === 'vi' ? 'Lưu' : 'Save'}</button>
          <button class="btn btn-secondary settings-close">${uiLang === 'de' ? 'Schließen' : uiLang === 'vi' ? 'Đóng' : 'Close'}</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const toggleBtn = modal.querySelector('#ai-toggle');
    toggleBtn.addEventListener('click', () => {
      const isOn = toggleBtn.classList.toggle('on');
      toggleBtn.textContent = isOn ? 'ON' : 'OFF';
    });

    modal.querySelector('.settings-save').addEventListener('click', () => {
      setApiKey(modal.querySelector('#ai-api-key').value.trim());
      setModel(modal.querySelector('#ai-model').value);
      setEnabled(toggleBtn.classList.contains('on'));
      modal.classList.remove('visible');
    });

    modal.querySelector('.settings-close').addEventListener('click', () => {
      modal.classList.remove('visible');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('visible');
    });

    requestAnimationFrame(() => modal.classList.add('visible'));
  }

  return {
    isConfigured,
    isEnabled,
    getApiKey,
    createSettingsModal,
    generateCultureInsight,
    generateJournalInsight,
    callOpenRouter,
    MODEL_OPTIONS
  };
})();
