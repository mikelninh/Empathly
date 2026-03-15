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

  // Free models (cost $0 on OpenRouter) — available to ALL users
  const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
  const DEMO_API_KEY = ''; // Set a shared demo key here for zero-config experience

  const MODEL_OPTIONS = [
    // 🆓 Free models (no cost)
    { value: 'meta-llama/llama-3.1-8b-instruct:free', label: '🆓 Llama 3.1 8B (kostenlos)', free: true },
    { value: 'google/gemma-2-9b-it:free',              label: '🆓 Gemma 2 9B (kostenlos)',   free: true },
    { value: 'qwen/qwen-2-7b-instruct:free',           label: '🆓 Qwen 2 7B (kostenlos)',    free: true },
    { value: 'mistralai/mistral-7b-instruct:free',      label: '🆓 Mistral 7B (kostenlos)',   free: true },
    // ⭐ Premium models (require paid key)
    { value: 'anthropic/claude-sonnet-4-6',       label: '⭐ Claude Sonnet 4.6',  free: false },
    { value: 'openai/gpt-4o-mini',                     label: '⭐ GPT-4o Mini',        free: false },
    { value: 'google/gemini-flash-1.5',                 label: '⭐ Gemini Flash 1.5',   free: false }
  ];

  function getApiKey() { return localStorage.getItem(STORAGE_KEY_API) || DEMO_API_KEY || ''; }
  function setApiKey(key) { localStorage.setItem(STORAGE_KEY_API, key); }
  function isUsingFreeModel() { const m = getModel(); return MODEL_OPTIONS.find(o => o.value === m)?.free === true; }
  function getModel() { return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL; }
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
  function getCultureCacheKey(emotionId, lang) {
    return CACHE_PREFIX + 'culture-' + emotionId + '-' + lang;
  }

  function getCachedCultureInsight(emotionId, lang) {
    const key = getCultureCacheKey(emotionId, lang);
    return localStorage.getItem(key);
  }

  function cacheCultureInsight(emotionId, lang, text) {
    localStorage.setItem(getCultureCacheKey(emotionId, lang), text);
  }

  async function generateCultureInsight(emotionId, emotionName, lang) {
    const cached = getCachedCultureInsight(emotionId, lang);
    if (cached) return cached;

    const langNames = { de: 'German', vi: 'Vietnamese', en: 'English' };
    const writeLang = langNames[lang] || 'English';
    const prompt = `You are a cultural psychologist. In 2-3 sentences, explain how the emotion "${emotionName}" is experienced and expressed differently in German vs Vietnamese culture. Be specific, nuanced, and mention concrete examples (phrases, behaviors, social norms). Write in ${writeLang}.`;

    const result = await callOpenRouter(prompt);
    cacheCultureInsight(emotionId, lang, result);
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

    const langNames = { de: 'German', vi: 'Vietnamese', en: 'English' };
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
