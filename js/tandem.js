/**
 * Empathly — Tandem Mode
 * Real-time partner matching for emotion learning across languages.
 * WebSocket-based when backend is available; waitlist mode otherwise.
 */

const GefuehleTandem = (function () {
  'use strict';

  let _socket = null;
  let _partnerId = null;
  let _roomId = null;
  let _myTurn = false;
  let _onMatchCallback = null;
  let _onGameCallback = null;

  const PARTNER_NAMES = [
    'Ayumi', 'Carlos', 'Nour', 'Priya', 'Felix', 'Yuki', 'Amara', 'Lucas',
    'Selin', 'Mei', 'Ivan', 'Fatima', 'Liam', 'Hana', 'Marco',
  ];

  const PARTNER_FLAGS = ['🇯🇵', '🇧🇷', '🇱🇧', '🇮🇳', '🇩🇪', '🇰🇷', '🇳🇬', '🇫🇷',
    '🇹🇷', '🇨🇳', '🇷🇺', '🇸🇦', '🇮🇪', '🇵🇭', '🇮🇹'];

  function getRandomPartner() {
    const i = Math.floor(Math.random() * PARTNER_NAMES.length);
    return { name: PARTNER_NAMES[i], flag: PARTNER_FLAGS[i] };
  }

  // ── Connection ───────────────────────────────────────────────────────────────

  function connect(myLang, learningLang, onMatch, onGame) {
    _onMatchCallback = onMatch;
    _onGameCallback = onGame;

    const backendOnline = typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline();
    if (!backendOnline) return { mode: 'waitlist' };

    try {
      const wsBase = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL)
        ? CONFIG.API_BASE_URL.replace(/^http/, 'ws')
        : 'wss://gefuehle-memory.up.railway.app';

      _socket = new WebSocket(`${wsBase}/tandem/match?lang=${myLang}&learning=${learningLang}`);

      _socket.onopen = () => {
        _socket.send(JSON.stringify({ type: 'join', lang: myLang, learning: learningLang }));
      };

      _socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'matched') {
            _partnerId = msg.partner_id;
            _roomId = msg.room_id;
            _myTurn = msg.first_turn;
            if (_onMatchCallback) _onMatchCallback(msg);
          } else if (msg.type === 'game_event') {
            if (_onGameCallback) _onGameCallback(msg);
          }
        } catch (_) {}
      };

      _socket.onerror = () => { if (_onMatchCallback) _onMatchCallback({ error: true }); };
      _socket.onclose = () => {};
      return { mode: 'connecting' };
    } catch (_) {
      return { mode: 'waitlist' };
    }
  }

  function sendGameEvent(payload) {
    if (_socket && _socket.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify({ type: 'game_event', room_id: _roomId, ...payload }));
    }
  }

  function disconnect() {
    if (_socket) { _socket.close(); _socket = null; }
    _partnerId = null; _roomId = null;
  }

  // ── Demo / offline simulation ─────────────────────────────────────────────────

  function simulateMatch(onMatch, delayMs) {
    const partner = getRandomPartner();
    setTimeout(() => {
      onMatch({
        partner_name: partner.name,
        partner_flag: partner.flag,
        partner_learning: 'de',
        first_turn: Math.random() > 0.5,
        simulated: true,
      });
    }, delayMs || 2200 + Math.random() * 1800);
  }

  // ── Render helpers ────────────────────────────────────────────────────────────

  function renderWaitlistForm(container, uiLang) {
    const L = (de, en, vi, el) => uiLang === 'de' ? de : uiLang === 'vi' ? vi : uiLang === 'el' ? el : en;
    container.innerHTML = `
      <div class="tandem-waitlist">
        <div class="tandem-waitlist-icon">🌍</div>
        <h3 class="tandem-waitlist-title">${L('Tandem-Lernen kommt bald!', 'Tandem learning is coming!', 'Học Tandem sắp ra mắt!', 'Η εκμάθηση Tandem έρχεται!')}</h3>
        <p class="tandem-waitlist-desc">${L(
          'Lerne Gefühle mit echten Menschen weltweit — in deiner Sprache, ihrer Sprache.',
          'Learn emotions with real people worldwide — in your language and theirs.',
          'Học cảm xúc với người thật khắp thế giới — ngôn ngữ của bạn và của họ.',
          'Μάθε συναισθήματα με πραγματικούς ανθρώπους παγκοσμίως.'
        )}</p>
        <div class="tandem-features">
          <div class="tandem-feature">🎯 ${L('Live-Paare weltweit finden', 'Find live partners worldwide', 'Tìm đối tác trực tiếp', 'Βρες συνεργάτες')}</div>
          <div class="tandem-feature">🃏 ${L('Gemeinsam Emotionskarten spielen', 'Play emotion cards together', 'Cùng chơi thẻ cảm xúc', 'Παίξτε κάρτες μαζί')}</div>
          <div class="tandem-feature">💬 ${L('In echter Sprache kommunizieren', 'Communicate in real language', 'Giao tiếp bằng ngôn ngữ thật', 'Επικοινωνία στην πραγματική γλώσσα')}</div>
        </div>
        <form class="tandem-waitlist-form" id="tandem-waitlist-form">
          <input type="email" class="tandem-email-input" placeholder="${L('Deine E-Mail', 'Your email', 'Email của bạn', 'Το email σου')}" required>
          <button type="submit" class="tandem-waitlist-btn">${L('Benachrichtigen', 'Notify me', 'Thông báo cho tôi', 'Ειδοποίησέ με')}</button>
        </form>
        <p class="tandem-waitlist-note">${L('Keine Werbung. Nur wenn Tandem live geht.', 'No spam. Only when Tandem goes live.', 'Không spam. Chỉ khi Tandem ra mắt.', 'Χωρίς spam. Μόνο όταν ξεκινήσει.')}</p>
      </div>`;

    container.querySelector('#tandem-waitlist-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('.tandem-email-input').value.trim();
      if (!email) return;
      // Save locally + try backend
      const saved = JSON.parse(localStorage.getItem('gefuehle-tandem-waitlist') || '[]');
      if (!saved.includes(email)) {
        saved.push(email);
        localStorage.setItem('gefuehle-tandem-waitlist', JSON.stringify(saved));
      }
      if (typeof GefuehleAPI !== 'undefined' && GefuehleAPI.isBackendOnline()) {
        GefuehleAPI.apiFetch?.('/waitlist', { method: 'POST', body: JSON.stringify({ email, feature: 'tandem' }) }).catch(() => {});
      }
      const form = container.querySelector('.tandem-waitlist-form');
      form.innerHTML = `<p class="tandem-waitlist-success">✓ ${L('Du bist auf der Liste!', 'You\'re on the list!', 'Bạn đã đăng ký!', 'Είσαι στη λίστα!')}</p>`;
    });
  }

  function renderMatchingScreen(container, myLang, learningLang, uiLang) {
    const L = (de, en, vi, el) => uiLang === 'de' ? de : uiLang === 'vi' ? vi : uiLang === 'el' ? el : en;
    const myFlag = (typeof LANGUAGES !== 'undefined' && LANGUAGES[myLang]?.flag) || '🌐';
    const learningFlag = (typeof LANGUAGES !== 'undefined' && LANGUAGES[learningLang]?.flag) || '🌐';

    container.innerHTML = `
      <div class="tandem-matching">
        <div class="tandem-matching-cards">
          <div class="tandem-lang-chip my">${myFlag} ${(typeof LANGUAGES !== 'undefined' && LANGUAGES[myLang]?.name) || myLang}</div>
          <div class="tandem-matching-dots">
            <span></span><span></span><span></span>
          </div>
          <div class="tandem-lang-chip learning">${learningFlag} ${(typeof LANGUAGES !== 'undefined' && LANGUAGES[learningLang]?.name) || learningLang}</div>
        </div>
        <p class="tandem-matching-text">${L('Suche nach einem Lernpartner…', 'Looking for a learning partner…', 'Đang tìm đối tác học…', 'Αναζήτηση συνεργάτη…')}</p>
        <p class="tandem-matching-sub">${L('In der ganzen Welt.', 'Across the entire world.', 'Khắp thế giới.', 'Σε όλο τον κόσμο.')}</p>
        <button class="tandem-cancel-btn">${L('Abbrechen', 'Cancel', 'Hủy', 'Ακύρωση')}</button>
      </div>`;
  }

  function renderMatchedScreen(container, matchData, uiLang) {
    const L = (de, en, vi, el) => uiLang === 'de' ? de : uiLang === 'vi' ? vi : uiLang === 'el' ? el : en;
    container.innerHTML = `
      <div class="tandem-matched">
        <div class="tandem-matched-icon">🤝</div>
        <h3 class="tandem-matched-title">${L('Partner gefunden!', 'Partner found!', 'Đã tìm thấy đối tác!', 'Βρέθηκε συνεργάτης!')}</h3>
        <div class="tandem-partner-badge">
          <span class="tandem-partner-flag">${matchData.partner_flag || '🌐'}</span>
          <span class="tandem-partner-name">${matchData.partner_name || 'Anonymous'}</span>
          <span class="tandem-partner-learning">${L('lernt', 'learning', 'đang học', 'μαθαίνει')} ${matchData.partner_learning || '?'}</span>
        </div>
        <p class="tandem-matched-desc">${L(
          'Ihr spielt abwechselnd. Beschreibe ein Gefühl — dein Partner rät.',
          'You take turns. Describe an emotion — your partner guesses.',
          'Các bạn thay nhau. Mô tả một cảm xúc — đối tác đoán.',
          'Παίζετε εναλλάξ. Περιέγραψε ένα συναίσθημα — ο συνεργάτης μαντεύει.'
        )}</p>
        <button class="tandem-start-btn">${L('Spielen!', 'Let\'s play!', 'Chơi thôi!', 'Ας παίξουμε!')}</button>
      </div>`;
  }

  return {
    connect,
    disconnect,
    sendGameEvent,
    simulateMatch,
    renderWaitlistForm,
    renderMatchingScreen,
    renderMatchedScreen,
    getRandomPartner,
  };
})();
