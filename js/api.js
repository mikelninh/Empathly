/**
 * Gefühle-Memory — Backend API Client
 *
 * Connects the frontend to the FastAPI backend.
 * Graceful fallback: if backend is unreachable, LocalStorage is used transparently.
 *
 * Usage:
 *   GefuehleAPI.saveJournal(entry)      → saves to backend + LocalStorage
 *   GefuehleAPI.getStats(userId)        → returns emotion statistics
 *   GefuehleAPI.culturalBridge(req)     → RAG-powered cultural comparison
 *   GefuehleAPI.streamCulturalBridge()  → streaming version (word by word)
 */

const GefuehleAPI = (function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  // Priority: APP_CONFIG.API_URL (set after deployment) → localhost
  const BASE_URL = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.API_URL)
    ? APP_CONFIG.API_URL.replace(/\/$/, '')
    : 'http://localhost:8000';
  const DEVICE_ID_KEY = 'gefuehle-device-id';

  let _backendAvailable = null; // null = not checked yet

  function getDeviceId() {
    // Generate a stable UUID-like ID for this browser/device, stored in localStorage.
    // This is what the backend uses to identify the user without any login flow.
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'device-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  // Keep getUserId as alias for backward compatibility
  function getUserId() { return getDeviceId(); }

  // ── Health check (cached) ─────────────────────────────────────────────────

  async function checkBackend() {
    if (_backendAvailable === true) return true; // only cache success; always re-check if previously failed
    try {
      const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      _backendAvailable = res.ok ? true : null;
    } catch {
      _backendAvailable = null;
    }
    updateStatusIndicator(_backendAvailable === true);
    return _backendAvailable === true;
  }

  function updateStatusIndicator(online) {
    const el = document.getElementById('backend-status');
    if (!el) return;
    el.className = 'backend-status ' + (online ? 'online' : 'offline');
    el.title = online ? 'Backend verbunden (FastAPI)' : 'Offline-Modus (LocalStorage)';
  }

  // ── Generic fetch with timeout ────────────────────────────────────────────

  async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: options.signal || AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // ── Journal ───────────────────────────────────────────────────────────────

  const JOURNAL_KEY = 'gefuehle-journal';

  async function saveJournal({ emotions, note, lang }) {
    const dateStr = new Date().toISOString().split('T')[0];
    const entry = { date: dateStr, emotions, note: note || '', aiInsight: '' };

    // Always save to LocalStorage first (instant, offline-safe)
    const all = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    all.push(entry);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));

    // Fire-and-forget to backend
    if (await checkBackend()) {
      apiFetch('/journal/', {
        method: 'POST',
        body: JSON.stringify({ device_id: getDeviceId(), emotion_ids: emotions, note, lang }),
      }).catch(() => {}); // silent — LocalStorage is source of truth for now
    }

    return entry;
  }

  function getJournalEntries() {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
  }

  // ── Check-ins ─────────────────────────────────────────────────────────────

  async function saveCheckin({ emotion_ids, category, intensity, lang }) {
    if (await checkBackend()) {
      return apiFetch('/checkins/', {
        method: 'POST',
        body: JSON.stringify({
          device_id: getDeviceId(),
          emotion_ids,
          intensity: intensity || 3,
          lang: lang || 'de',
        }),
      }).catch(() => null);
    }
    return null;
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  async function getStats() {
    if (!(await checkBackend())) return null;
    return apiFetch(`/checkins/stats/${getDeviceId()}`).catch(() => null);
  }

  // ── Cultural Bridge (via backend RAG) ─────────────────────────────────────

  async function culturalBridge({ emotion_id, emotion_name, source_lang, target_lang, response_lang }) {
    if (!(await checkBackend())) return null;
    return apiFetch('/ai/cultural-bridge', {
      method: 'POST',
      body: JSON.stringify({ emotion_id, emotion_name, source_lang, target_lang, response_lang }),
    });
  }

  // ── Streaming Cultural Bridge ─────────────────────────────────────────────
  // Calls the streaming endpoint and yields text chunks via onChunk callback.

  async function streamCulturalBridge({ emotion_id, emotion_name, source_lang, target_lang, response_lang }, onChunk) {
    if (!(await checkBackend())) return false;

    try {
      const res = await fetch(`${BASE_URL}/ai/cultural-bridge/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion_id, emotion_name, source_lang, target_lang, response_lang }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) return false;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE lines: "data: <text>\n\n"
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6);
            if (chunk !== '[DONE]') onChunk(chunk);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  // ── Stats widget (renders into landing screen) ────────────────────────────

  async function renderStatsWidget() {
    const container = document.getElementById('stats-widget');
    if (!container) return;

    const stats = await getStats();
    if (!stats || stats.total_checkins === 0) {
      container.style.display = 'none';
      return;
    }

    const top = stats.top_emotions.slice(0, 3);
    const topHTML = top.map(e => {
      const emo = (typeof EMOTIONS !== 'undefined')
        ? EMOTIONS.find(x => x.id === e.emotion_id) : null;
      const label = emo ? (emo.de || e.emotion_id) : e.emotion_id;
      const emoji = emo ? emo.emoji : '💛';
      return `<span class="sw-tag">${emoji} ${label} <em>${e.count}×</em></span>`;
    }).join('');

    const streakText = stats.streak_days > 1
      ? `🔥 ${stats.streak_days} Tage Streak`
      : stats.streak_days === 1 ? '🌱 Heute dabei' : '';

    container.innerHTML = `
      <div class="sw-inner">
        <div class="sw-row">
          <span class="sw-num">${stats.total_checkins}</span>
          <span class="sw-label">Check-ins</span>
          ${streakText ? `<span class="sw-streak">${streakText}</span>` : ''}
        </div>
        ${top.length ? `<div class="sw-emotions">${topHTML}</div>` : ''}
      </div>`;
    container.style.display = '';
  }

  // ── Ask (RAG Q&A) ─────────────────────────────────────────────────────────

  async function streamAsk({ question, lang }, onChunk) {
    if (!(await checkBackend())) return { ok: false, error: 'backend_down' };
    try {
      const res = await fetch(`${BASE_URL}/ai/ask/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          return { ok: false, error: err.detail || `HTTP ${res.status}` };
        } catch {
          return { ok: false, error: `HTTP ${res.status}` };
        }
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6);
            if (chunk !== '[DONE]' && chunk !== '[ERROR]') onChunk(chunk);
          }
        }
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'backend_down' };
    }
  }

  // ── Dynamic Prompt ────────────────────────────────────────────────────────

  async function dynamicPrompt({ type, emotion_ids = [], emotion_names = [], needs = [], context = '', user_text = '', lang }) {
    if (!(await checkBackend())) return null;
    return apiFetch('/ai/dynamic-prompt', {
      method: 'POST',
      body: JSON.stringify({ type, emotion_ids, emotion_names, needs, context, user_text, lang }),
    }).catch(() => null);
  }

  // ── Share an emotion card ─────────────────────────────────────────────────

  async function shareEmotion({ emotionId, lang1, lang2 }) {
    const emo = (typeof EMOTIONS !== 'undefined')
      ? EMOTIONS.find(e => e.id === emotionId) : null;
    if (!emo) return;

    const word1 = emo[lang1] || emo.de;
    const word2 = emo[lang2] || emo.en;
    const langNames = { de: 'Deutsch', vi: 'Vietnamesisch', en: 'English',
      ta: 'Tamil', el: 'Griechisch', tr: 'Türkçe', ar: 'Arabisch',
      es: 'Español', fr: 'Français', uk: 'Ukrainisch', pl: 'Polski' };

    const text = `${emo.emoji} "${word1}" auf ${langNames[lang1] || lang1} · "${word2}" auf ${langNames[lang2] || lang2}\n\n67 Gefühle · 11 Sprachen · Gefühle-Memory`;
    const url = 'https://mikelninh.github.io/Gefuehle-Memory/';

    if (navigator.share) {
      try {
        await navigator.share({ title: `${emo.emoji} ${word1}`, text, url });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(text + '\n' + url).catch(() => {});
    showToast('In Zwischenablage kopiert!');
  }

  function showToast(msg) {
    let toast = document.getElementById('share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'share-toast';
      toast.className = 'share-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    // Check backend in background, don't block page load
    setTimeout(() => checkBackend().then(() => renderStatsWidget()), 500);
  }

  return {
    init,
    getUserId,
    apiFetch,
    saveJournal,
    getJournalEntries,
    saveCheckin,
    getStats,
    culturalBridge,
    streamCulturalBridge,
    streamAsk,
    dynamicPrompt,
    renderStatsWidget,
    shareEmotion,
    checkBackend,
  };
})();
