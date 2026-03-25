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

  function isConfigured() {
    if (!isEnabled()) return false;
    // Backend online → AI works without user key (server handles it)
    if (typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline()) return true;
    return !!getApiKey();
  }

  // ── Persona memory context ──
  function buildPersonaMemoryContext() {
    try {
      const mem = JSON.parse(localStorage.getItem('gefuehle-persona-memory') || '{}');
      const persona = (typeof GefuehlePersonas !== 'undefined') ? GefuehlePersonas.getActivePersona() : null;
      const personaId = persona ? persona.id : 'default';
      const entries = mem[personaId] || [];
      if (!entries.length) return '';
      const feels = entries.filter(e => e.resonance === 'feel').slice(0, 5).map(e => `${e.emoji} ${e.word}`);
      const knows = entries.filter(e => e.resonance === 'know').slice(0, 3).map(e => `${e.emoji} ${e.word}`);
      const surprises = entries.filter(e => e.resonance === 'surprise').slice(0, 3).map(e => `${e.emoji} ${e.word}`);
      let ctx = '\n\nUser emotional context (from their interactions):';
      if (feels.length) ctx += `\n- Currently resonating with: ${feels.join(', ')}`;
      if (knows.length) ctx += `\n- Familiar emotions: ${knows.join(', ')}`;
      if (surprises.length) ctx += `\n- Surprised by: ${surprises.join(', ')}`;
      return ctx;
    } catch (e) { return ''; }
  }

  // ── API Call ──
  async function callOpenRouter(prompt, systemPrompt) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No API key configured');

    // Inject active persona system prompt unless a custom one is provided
    let _uiLang = 'en';
    try { _uiLang = state?.lang1 || 'en'; } catch (_) {}
    const baseSystem = systemPrompt || (
      typeof GefuehlePersonas !== 'undefined'
        ? GefuehlePersonas.getPersonaSystemPrompt(_uiLang)
        : null
    );
    // Append persona memory context
    const memCtx = buildPersonaMemoryContext();
    const effectiveSystem = baseSystem ? (baseSystem + memCtx) : (memCtx || null);

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
          ...(effectiveSystem ? [{ role: 'system', content: effectiveSystem }] : []),
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
    if (typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline()) {
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
    if (!getApiKey()) {
      throw new Error('KI nicht verfügbar — Backend offline und kein eigener API-Key. Bitte in den Einstellungen einen OpenRouter-Key eingeben.');
    }
    const langNames = {
      de: 'German', vi: 'Vietnamese', en: 'English', tr: 'Turkish',
      ar: 'Arabic', es: 'Spanish', fr: 'French', uk: 'Ukrainian',
      pl: 'Polish', el: 'Greek', ta: 'Tamil',
    };
    const writeLang = langNames[lang1] || 'English';
    const srcName = langNames[lang1] || lang1;
    const tgtName = langNames[lang2] || lang2;

    const systemPrompt = `You are a cultural psychologist. You MUST respond exclusively in ${writeLang} — never use any other language, not even for a single word. Write exactly 2-3 sentences of flowing prose. No bullet points, no headers, no markdown, no line breaks. Stay concise and grounded.`;
    const prompt = `How is the emotion "${emotionName}" experienced and expressed differently in ${srcName}-speaking culture vs ${tgtName}-speaking culture? Give concrete examples (phrases, behaviors, social norms). Write in ${writeLang}.`;

    const result = await callOpenRouter(prompt, systemPrompt);
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

    const systemPrompt = `You are a compassionate emotional wellness guide. You MUST respond exclusively in ${writeLang} — never switch languages. Write exactly 3-4 sentences of warm, flowing prose. No bullet points, no headers, no markdown. Be personal and gentle, not clinical.`;
    const prompt = `Analyze these emotion journal entries and share a gentle insight about patterns or themes you notice. Write in ${writeLang}. Entries: ${entriesJson}`;

    const result = await callOpenRouter(prompt, systemPrompt);
    localStorage.setItem(cacheKey, result);
    return result;
  }

  // ── Settings Modal ──
  function createSettingsModal(uiLang) {
    const existing = document.querySelector('.settings-modal-overlay');
    if (existing) existing.remove(); // rebuild to reflect current backend state

    const backendOnline = typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline();
    const L = (de, en, vi) => uiLang === 'de' ? de : uiLang === 'vi' ? vi : en;

    const statusBlock = backendOnline
      ? `<div class="settings-status settings-status-ok">
           ✅ ${L('KI aktiv — kein eigener Key nötig', 'AI active — no key required', 'AI đang hoạt động — không cần khóa')}
         </div>`
      : `<div class="settings-status settings-status-warn">
           ⚡ ${L('Server nicht erreichbar — eigenen Key verwenden', 'Server unavailable — use your own key', 'Máy chủ không khả dụng')}
         </div>`;

    const keyHint = `<a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">openrouter.ai/keys</a>`;
    const advancedFields = `
      <div class="settings-field">
        <label>OpenRouter API Key</label>
        <input type="password" class="settings-input" id="ai-api-key" placeholder="sk-or-..." value="${getApiKey() === DEMO_API_KEY ? '' : getApiKey()}">
        <small class="settings-help">${L('Kostenlos auf', 'Free at', 'Miễn phí tại')} ${keyHint}</small>
      </div>
      <div class="settings-field">
        <label>${L('KI-Modell', 'AI Model', 'Mô hình AI')}</label>
        <select class="settings-select" id="ai-model">
          ${MODEL_OPTIONS.map(m => `<option value="${m.value}" ${m.value === getModel() ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>`;

    const modal = document.createElement('div');
    modal.className = 'settings-modal-overlay';
    modal.innerHTML = `
      <div class="settings-modal">
        <h3 class="settings-title">⚙️ ${L('KI-Einstellungen', 'AI Settings', 'Cài đặt AI')}</h3>
        ${statusBlock}
        ${backendOnline
          ? `<details class="settings-advanced"><summary>${L('Eigenen Key / Modell verwenden', 'Use custom key / model', 'Dùng khóa/mô hình riêng')}</summary><div class="settings-advanced-body">${advancedFields}</div></details>`
          : advancedFields}
        <div class="settings-field settings-toggle-row">
          <label>${L('KI-Funktionen', 'AI Features', 'Tính năng AI')}</label>
          <button class="settings-toggle ${isEnabled() ? 'on' : ''}" id="ai-toggle">${isEnabled() ? 'ON' : 'OFF'}</button>
        </div>
        <div class="settings-actions">
          <button class="btn btn-primary settings-save">${L('Speichern', 'Save', 'Lưu')}</button>
          <button class="btn btn-secondary settings-close">${L('Schließen', 'Close', 'Đóng')}</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const toggleBtn = modal.querySelector('#ai-toggle');
    toggleBtn.addEventListener('click', () => {
      const isOn = toggleBtn.classList.toggle('on');
      toggleBtn.textContent = isOn ? 'ON' : 'OFF';
    });

    modal.querySelector('.settings-save').addEventListener('click', () => {
      const keyInput = modal.querySelector('#ai-api-key');
      const modelSelect = modal.querySelector('#ai-model');
      if (keyInput) setApiKey(keyInput.value.trim());
      if (modelSelect) setModel(modelSelect.value);
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
