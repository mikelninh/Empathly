/**
 * Gefühle-Memory — Emotion Detective Mode
 * "Was steckt dahinter?" — Given a scenario, identify the hidden emotion beneath the obvious ones.
 * Teaches emotional intelligence: reading what is not said.
 */

const GefuehleDetective = (function () {
  'use strict';

  // Scenarios: each has a situation, obvious emotions, and the hidden emotion beneath.
  // surface: the emotions the player sees on the grid (mix of decoys + hidden)
  // hidden: the emotion ID that is the real answer
  // obvious: emotion IDs that are clearly present (shown as "already found")
  const SCENARIOS = [
    {
      id: 'sc_promotion',
      difficulty: 'easy',
      situation: {
        de: 'Lea bekommt die Beförderung, auf die sie zwei Jahre hingearbeitet hat. Aber sie erzählt niemandem davon — nicht mal ihrer Familie.',
        en: 'Lea gets the promotion she has worked toward for two years. But she tells no one — not even her family.',
        vi: 'Lea được thăng chức sau hai năm nỗ lực. Nhưng cô không nói với ai — kể cả gia đình.',
        el: 'Η Λέα παίρνει την προαγωγή που δούλευε γι\' αυτή δύο χρόνια. Αλλά δεν το λέει σε κανένα — ούτε στην οικογένειά της.'
      },
      surface_emotions: ['freude', 'begeisterung', 'scham', 'angst_gefuehl', 'einsamkeit', 'dankbarkeit'],
      hidden: 'scham',
      persona_note: {
        de: 'Wenn Erfolg verstummt, steckt oft Scham dahinter. Die Frage „Verdiene ich das wirklich?" kann lauter sein als die Freude.',
        en: 'When achievement falls silent, shame is often there. The question "Do I really deserve this?" can be louder than the joy.',
      }
    },
    {
      id: 'sc_cold',
      difficulty: 'easy',
      situation: {
        de: 'Marco kommt nicht zur Geburtstagsfeier seiner besten Freundin. Er sagt, er ist krank. Danach wird er einsilbig und zieht sich zurück.',
        en: 'Marco does not come to his best friend\'s birthday party. He says he is sick. Afterwards he becomes quiet and withdraws.',
        vi: 'Marco không đến tiệc sinh nhật của người bạn thân nhất. Anh nói mình bệnh. Sau đó anh trở nên lạnh lùng và thu mình lại.',
        el: 'Ο Μάρκο δεν πηγαίνει στα γενέθλια της καλύτερης φίλης του. Λέει ότι είναι άρρωστος. Μετά γίνεται σιωπηλός και αποσύρεται.'
      },
      surface_emotions: ['schuld', 'traurigkeit', 'scham', 'angst_gefuehl', 'einsamkeit', 'wut'],
      hidden: 'scham',
      persona_note: {
        de: 'Rückzug nach einem Fehler ist oft Scham — nicht Gleichgültigkeit. Wer sich versteckt, tut das meist, weil er sich schlecht fühlt, nicht weil ihm egal ist.',
        en: 'Withdrawal after a mistake is often shame — not indifference. Those who hide usually do so because they feel bad, not because they do not care.',
      }
    },
    {
      id: 'sc_anger_home',
      difficulty: 'medium',
      situation: {
        de: 'Selin kommt von der Arbeit nach Hause und explodiert wegen eines kleinen Missverständnisses mit ihrem Partner. Später weint sie allein in der Küche.',
        en: 'Selin comes home from work and explodes over a small misunderstanding with her partner. Later she cries alone in the kitchen.',
        vi: 'Selin về nhà sau giờ làm và bùng nổ vì một hiểu lầm nhỏ với bạn đời. Sau đó, cô ngồi khóc một mình trong bếp.',
        el: 'Η Σελίν έρχεται σπίτι από τη δουλειά και ξεσπά για μια μικρή παρεξήγηση με τον σύντροφό της. Αργότερα κλαίει μόνη στην κουζίνα.'
      },
      surface_emotions: ['wut', 'frustration', 'ueberforderung', 'einsamkeit', 'scham', 'traurigkeit'],
      hidden: 'ueberforderung',
      persona_note: {
        de: 'Wut, die aus dem Nichts kommt, ist oft Überforderung in Verkleidung. Der Körper sagt: „Ich kann nicht mehr" — und der Mund sagt: „Du machst alles falsch."',
        en: 'Anger that comes from nowhere is often overwhelm in disguise. The body says "I cannot take any more" — and the mouth says "you always do this."',
      }
    },
    {
      id: 'sc_perfect',
      difficulty: 'medium',
      situation: {
        de: 'Jonas macht alles perfekt. Sein Haus ist makellos, seine Arbeit tadellos, sein Instagram-Profil strahlend. Er schläft seit Monaten schlecht.',
        en: 'Jonas does everything perfectly. His home is spotless, his work impeccable, his Instagram profile radiant. He has slept badly for months.',
        vi: 'Jonas làm mọi thứ hoàn hảo. Nhà anh gọn gàng, công việc xuất sắc, hồ sơ Instagram tỏa sáng. Nhưng anh ngủ không ngon suốt mấy tháng qua.',
        el: 'Ο Ιωνάς κάνει τα πάντα τέλεια. Το σπίτι του είναι άψογο, η δουλειά του άμεμπτη. Δεν κοιμάται καλά εδώ και μήνες.'
      },
      surface_emotions: ['begeisterung', 'angst_gefuehl', 'ueberforderung', 'leere', 'scham', 'einsamkeit'],
      hidden: 'angst_gefuehl',
      persona_note: {
        de: 'Perfektionismus ist fast immer Angst — die Angst, dass wenn man aufhört zu performen, niemand mehr bleibt.',
        en: 'Perfectionism is almost always fear — the fear that if you stop performing, no one will stay.',
      }
    },
    {
      id: 'sc_dismissive',
      difficulty: 'medium',
      situation: {
        de: 'Wenn ihre Kinder sie anrufen, sagt Marta immer: „Mir geht\'s gut, macht euch keine Sorgen." Sie sagt das auch, wenn sie weint.',
        en: 'When her children call, Marta always says: "I\'m fine, don\'t worry." She says this even when she is crying.',
        vi: 'Khi con gọi điện, Marta luôn nói: "Mẹ ổn, đừng lo lắng." Bà nói vậy ngay cả khi đang khóc.',
        el: 'Όταν τα παιδιά της τηλεφωνούν, η Μάρτα πάντα λέει: "Είμαι καλά, μην ανησυχείτε." Το λέει ακόμα και όταν κλαίει.'
      },
      surface_emotions: ['einsamkeit', 'traurigkeit', 'begeisterung', 'verletzlichkeit', 'ueberforderung', 'sehnsucht'],
      hidden: 'verletzlichkeit',
      persona_note: {
        de: 'Wer sagt „Mir geht\'s gut" und meint es nicht, sehnt sich oft am meisten danach, dass jemand fragt: „Bist du sicher?"',
        en: 'Those who say "I\'m fine" and don\'t mean it often long most for someone to ask: "Are you sure?"',
      }
    },
    {
      id: 'sc_leave',
      difficulty: 'hard',
      situation: {
        de: 'Farid verlässt ein gut bezahltes, sicheres Unternehmen ohne neuen Job. Seine Familie versteht es nicht. Er erklärt: „Ich musste einfach."',
        en: 'Farid leaves a well-paid, secure company without another job. His family does not understand. He explains: "I just had to."',
        vi: 'Farid rời khỏi một công ty ổn định, lương cao mà không có việc mới. Gia đình không hiểu. Anh giải thích: "Tôi phải làm vậy thôi."',
        el: 'Ο Φαρίντ φεύγει από μια καλοπληρωμένη, σταθερή εταιρεία χωρίς άλλη δουλειά. Η οικογένειά του δεν καταλαβαίνει. Εξηγεί: "Απλώς έπρεπε."'
      },
      surface_emotions: ['angst_gefuehl', 'verletzlichkeit', 'freiheit', 'leere', 'sehnsucht', 'hoffnung'],
      hidden: 'leere',
      persona_note: {
        de: 'Manchmal verlässt man nicht, weil man woanders hin möchte, sondern weil dort, wo man ist, innerlich nichts mehr ist. Leere als Antrieb.',
        en: 'Sometimes we leave not because we want to go somewhere, but because where we are has become hollow. Emptiness as a catalyst.',
      }
    },
    {
      id: 'sc_reunion',
      difficulty: 'easy',
      situation: {
        de: 'Nach 10 Jahren Kontaktlosigkeit schreibt Anouk ihrer Schwester. Sie schreibt: „Ich wollte nur sehen, ob es dir gut geht." Sie schreibt diese Nachricht dreimal um, bevor sie sie schickt.',
        en: 'After 10 years of no contact, Anouk writes to her sister. She writes: "I just wanted to see if you\'re okay." She rewrites this message three times before sending.',
        vi: 'Sau 10 năm mất liên lạc, Anouk nhắn tin cho chị gái. Cô viết: "Tôi chỉ muốn biết bạn có ổn không." Cô viết lại tin nhắn đó ba lần trước khi gửi.',
        el: 'Μετά από 10 χρόνια αποσύνδεσης, η Ανούκ γράφει στην αδερφή της. Γράφει: "Ήθελα μόνο να δω αν είσαι καλά." Ξαναγράφει αυτό το μήνυμα τρεις φορές.'
      },
      surface_emotions: ['sehnsucht', 'angst_gefuehl', 'hoffnung', 'scham', 'liebe', 'verletzlichkeit'],
      hidden: 'sehnsucht',
      persona_note: {
        de: 'Eine Nachricht dreimal umschreiben ist kein Zögern — es ist Sehnsucht, die nach Worten sucht.',
        en: 'Rewriting a message three times is not hesitation — it is longing searching for words.',
      }
    },
    {
      id: 'sc_criticism',
      difficulty: 'hard',
      situation: {
        de: 'Jedes Mal wenn Theo Feedback bekommt — auch mildes, konstruktives — wird er still, schaut auf den Boden und sagt nichts mehr für den Rest des Meetings.',
        en: 'Every time Theo receives feedback — even mild, constructive feedback — he goes quiet, looks at the floor, and says nothing for the rest of the meeting.',
        vi: 'Mỗi khi Theo nhận được phản hồi — dù là nhẹ nhàng và mang tính xây dựng — anh im lặng, nhìn xuống sàn và không nói gì thêm.',
        el: 'Κάθε φορά που ο Θέο λαμβάνει feedback — ακόμα και ήπιο, εποικοδομητικό — σωπαίνει, κοιτά το πάτωμα και δεν λέει τίποτα άλλο.'
      },
      surface_emotions: ['scham', 'wut', 'traurigkeit', 'angst_gefuehl', 'verlassenheit', 'ohnmacht'],
      hidden: 'verlassenheit',
      persona_note: {
        de: 'Sich nach Kritik zurückzuziehen kann nicht Scham, sondern Verlassenheitsangst sein: „Jetzt werde ich abgelehnt." Eine alte Wunde, die aufgeht.',
        en: 'Withdrawing after criticism may not be shame but abandonment fear: "Now I will be rejected." An old wound reopening.',
      }
    },
    {
      id: 'sc_care',
      difficulty: 'medium',
      situation: {
        de: 'Eva pflegt ihren kranken Vater seit drei Jahren. Sie sagt, sie liebt ihn und würde es nicht anders wollen. Aber manchmal, wenn er schläft, sitzt sie einfach da und weint lautlos.',
        en: 'Eva has cared for her sick father for three years. She says she loves him and would not want it any other way. But sometimes, when he is asleep, she just sits and cries silently.',
        vi: 'Eva chăm sóc cha bệnh của mình được ba năm. Cô nói cô yêu ông và không muốn gì khác. Nhưng đôi khi, khi ông ngủ, cô chỉ ngồi đó và khóc thầm.',
        el: 'Η Εύα φροντίζει τον άρρωστο πατέρα της εδώ και τρία χρόνια. Λέει ότι τον αγαπά και δεν θα το άλλαζε. Αλλά μερικές φορές, όταν κοιμάται, κάθεται και κλαίει αθόρυβα.'
      },
      surface_emotions: ['ueberforderung', 'traurigkeit', 'liebe', 'einsamkeit', 'schuld', 'sehnsucht'],
      hidden: 'einsamkeit',
      persona_note: {
        de: 'Man kann jemanden intensiv lieben und trotzdem zutiefst einsam sein. Beides schließt sich nicht aus.',
        en: 'You can love someone intensely and still be profoundly lonely. Both can be true at the same time.',
      }
    },
    {
      id: 'sc_success_sadness',
      difficulty: 'hard',
      situation: {
        de: 'Am Tag, als Kira ihren ersten Roman veröffentlicht, fühlt sie sich merkwürdig traurig. Sie weiß nicht warum.',
        en: 'On the day her first novel is published, Kira feels strangely sad. She does not know why.',
        vi: 'Vào ngày cuốn tiểu thuyết đầu tiên của Kira được xuất bản, cô cảm thấy buồn kỳ lạ. Cô không biết tại sao.',
        el: 'Την ημέρα που κυκλοφορεί το πρώτο της μυθιστόρημα, η Κίρα νιώθει παράξενα λυπημένη. Δεν ξέρει γιατί.'
      },
      surface_emotions: ['freude', 'traurigkeit', 'leere', 'sehnsucht', 'angst_gefuehl', 'ueberforderung'],
      hidden: 'leere',
      persona_note: {
        de: 'Ein großes Ziel zu erreichen kann Leere hinterlassen — nicht weil es nicht gut war, sondern weil das Ziel die Richtung war, und die Richtung jetzt fehlt.',
        en: 'Reaching a big goal can leave emptiness — not because it was not good, but because the goal was the direction, and now the direction is gone.',
      }
    },
  ];

  // Difficulty star ratings
  const DIFFICULTY_STARS = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' };

  // Persona-to-psychology note mapping
  const PSYCHOLOGY_LABELS = {
    de: { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', case: 'Fall', of: 'von',
          whats_hidden: 'Was steckt wirklich dahinter?',
          clues: 'Beobachtete Hinweise',
          instruction: 'Wähle das tiefste Gefühl — das, das nicht direkt sichtbar ist.',
          correct: 'Richtig erkannt!', wrong: 'Das verborgene Gefühl war',
          psychology: 'Psychologischer Hintergrund',
          next: 'Nächster Fall →', results: 'Auswertung sehen',
          rank_legend: 'Detective-Rang', play_again: 'Nochmal spielen', back: 'Zurück',
          pts: 'Pkt', case_closed: 'Fall gelöst', case_missed: 'Fall offen',
    },
    en: { easy: 'Easy', medium: 'Medium', hard: 'Hard', case: 'Case', of: 'of',
          whats_hidden: 'What really lies beneath?',
          clues: 'Observed clues',
          instruction: 'Choose the deepest emotion — the one not directly visible.',
          correct: 'Correctly identified!', wrong: 'The hidden emotion was',
          psychology: 'Psychological insight',
          next: 'Next case →', results: 'See results',
          rank_legend: 'Detective rank', play_again: 'Play again', back: 'Back',
          pts: 'pts', case_closed: 'Case closed', case_missed: 'Case open',
    },
    vi: { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó', case: 'Vụ', of: '/',
          whats_hidden: 'Điều gì thực sự ẩn sau?',
          clues: 'Manh mối quan sát',
          instruction: 'Chọn cảm xúc sâu nhất — cái không thể thấy rõ.',
          correct: 'Nhận diện chính xác!', wrong: 'Cảm xúc ẩn là',
          psychology: 'Hiểu biết tâm lý',
          next: 'Vụ tiếp theo →', results: 'Xem kết quả',
          rank_legend: 'Cấp bậc thám tử', play_again: 'Chơi lại', back: 'Quay lại',
          pts: 'đ', case_closed: 'Vụ đã giải', case_missed: 'Còn mở',
    },
    el: { easy: 'Εύκολο', medium: 'Μέτριο', hard: 'Δύσκολο', case: 'Υπόθεση', of: 'από',
          whats_hidden: 'Τι κρύβεται πραγματικά από κάτω;',
          clues: 'Παρατηρηθείσες ενδείξεις',
          instruction: 'Επίλεξε το βαθύτερο συναίσθημα — αυτό που δεν φαίνεται άμεσα.',
          correct: 'Σωστή αναγνώριση!', wrong: 'Το κρυμμένο συναίσθημα ήταν',
          psychology: 'Ψυχολογική κατανόηση',
          next: 'Επόμενη υπόθεση →', results: 'Δες τα αποτελέσματα',
          rank_legend: 'Βαθμός ντετέκτιβ', play_again: 'Παίξε ξανά', back: 'Πίσω',
          pts: 'β', case_closed: 'Λύθηκε', case_missed: 'Ανοιχτή',
    },
  };

  // Detective ranks by performance
  const RANKS = {
    de: ['Anfänger', 'Beobachter', 'Spurenleser', 'Empathie-Detektiv', 'Meister der Seelen'],
    en: ['Novice', 'Observer', 'Clue Reader', 'Empathy Detective', 'Soul Master'],
    vi: ['Người mới', 'Quan sát viên', 'Đọc dấu vết', 'Thám tử đồng cảm', 'Bậc thầy tâm hồn'],
    el: ['Αρχάριος', 'Παρατηρητής', 'Αναγνώστης ιχνών', 'Ντετέκτιβ ενσυναίσθησης', 'Δάσκαλος ψυχών'],
  };

  function getRank(score, total, lang) {
    const pct = score / total;
    const ranks = RANKS[lang] || RANKS.en;
    if (pct === 1) return { rank: ranks[4], badge: '🏆', color: '#F6C344' };
    if (pct >= 0.8) return { rank: ranks[3], badge: '🔍', color: '#A78BFA' };
    if (pct >= 0.6) return { rank: ranks[2], badge: '🕵️', color: '#06D6A0' };
    if (pct >= 0.4) return { rank: ranks[1], badge: '👁️', color: '#74C0FC' };
    return { rank: ranks[0], badge: '📖', color: '#F6C344' };
  }

  function getScenarios(difficulty) {
    if (difficulty === 'all') return SCENARIOS;
    return SCENARIOS.filter(s => s.difficulty === difficulty);
  }

  function initDetectiveMode(container, uiLang, onComplete) {
    const T = PSYCHOLOGY_LABELS[uiLang] || PSYCHOLOGY_LABELS.en;

    const all = shuffleArr([...SCENARIOS]);
    let index = 0;
    let score = 0;
    let streak = 0;
    let maxStreak = 0;
    const total = Math.min(6, all.length);
    const history = []; // { correct: bool }

    function shuffleArr(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function render() {
      if (index >= total) { showResults(); return; }
      const sc = all[index];
      const situation = sc.situation[uiLang] || sc.situation.en;
      const diffStars = DIFFICULTY_STARS[sc.difficulty] || '⭐';

      // Extract behavioral clues from the situation text (first sentence clues)
      const clueEmojis = extractClueEmojis(sc, situation);

      const emotionPool = sc.surface_emotions
        .map(id => typeof EMOTIONS !== 'undefined' ? EMOTIONS.find(e => e.id === id) : null)
        .filter(Boolean);
      const shuffledPool = shuffleArr([...emotionPool]);

      // Progress dots
      const progressDots = Array.from({length: total}, (_, i) => {
        if (i < history.length) return `<span class="det-dot ${history[i].correct ? 'correct' : 'wrong'}"></span>`;
        if (i === index) return `<span class="det-dot active"></span>`;
        return `<span class="det-dot"></span>`;
      }).join('');

      container.innerHTML = `
        <div class="det-wrapper">
          <!-- Progress Bar -->
          <div class="det-topbar">
            <div class="det-progress-dots">${progressDots}</div>
            <div class="det-score-pill">${score} ${T.pts}</div>
          </div>

          <!-- Case File Card -->
          <div class="det-case-file">
            <div class="det-case-header">
              <div class="det-case-meta">
                <span class="det-case-num">🔍 ${T.case} ${index + 1} ${T.of} ${total}</span>
                <span class="det-difficulty">${diffStars} ${T[sc.difficulty]}</span>
              </div>
            </div>

            <!-- Observed clues -->
            ${clueEmojis.length ? `
            <div class="det-clues">
              <div class="det-clues-label">${T.clues}</div>
              <div class="det-clues-row">${clueEmojis.map(c => `<span class="det-clue-chip">${c}</span>`).join('')}</div>
            </div>` : ''}

            <!-- Scenario -->
            <div class="det-scenario-bubble">
              <div class="det-scenario-text">${situation}</div>
            </div>

            <!-- Question -->
            <div class="det-question">${T.whats_hidden}</div>
            <p class="det-instruction">${T.instruction}</p>

            <!-- Emotion choices -->
            <div class="det-choices-grid">
              ${shuffledPool.map(e => `
                <button class="det-choice" data-id="${e.id}">
                  <span class="det-choice-emoji">${e.emoji}</span>
                  <span class="det-choice-label">${e[uiLang] || e.en}</span>
                </button>`).join('')}
            </div>
          </div>
        </div>`;

      container.querySelectorAll('.det-choice').forEach(btn => {
        btn.addEventListener('click', () => handleChoice(btn.dataset.id, sc));
      });
    }

    function extractClueEmojis(sc, situationText) {
      // Build behavioral clue emojis from the scenario context
      const clueMap = {
        silent: '🤐', withdraw: '🚶', cry: '😢', alone: '🚪', hide: '🫥',
        sleep: '😴', perfect: '✨', control: '🔒', help: '🤝', angry: '🌋',
        quiet: '🤫', smile: '😊', work: '💼', family: '👨‍👩‍👧', letter: '✉️',
        leave: '🚪', night: '🌙', phone: '📱', rewrite: '✏️', door: '🚪',
      };
      const clues = [];
      const text = situationText.toLowerCase();
      if (text.includes('weint') || text.includes('cries') || text.includes('tears')) clues.push('😢');
      if (text.includes('still') || text.includes('silent') || text.includes('quiet')) clues.push('🤐');
      if (text.includes('zieht sich zurück') || text.includes('withdraws') || text.includes('retreat')) clues.push('🚶');
      if (text.includes('allein') || text.includes('alone') || text.includes('nobody')) clues.push('🚪');
      if (text.includes('perfekt') || text.includes('perfect') || text.includes('makellos')) clues.push('✨');
      if (text.includes('schläft') || text.includes('sleeps') || text.includes('schlafen')) clues.push('😴');
      if (text.includes('lacht') || text.includes('laugh') || text.includes('smile')) clues.push('😊');
      if (text.includes('erzählt niemandem') || text.includes('tells no one') || text.includes('nobody knows')) clues.push('🤫');
      if (text.includes('arbeitet') || text.includes('works') || text.includes('job') || text.includes('arbeit')) clues.push('💼');
      if (text.includes('schreibt') || text.includes('writes') || text.includes('message')) clues.push('✉️');
      if (text.includes('verlässt') || text.includes('leaves') || text.includes('leave')) clues.push('🚪');
      if (text.includes('explodiert') || text.includes('explodes') || text.includes('anger')) clues.push('🌋');
      // Deduplicate and limit
      return [...new Set(clues)].slice(0, 5);
    }

    function handleChoice(chosenId, sc) {
      const isCorrect = chosenId === sc.hidden;
      if (isCorrect) { score++; streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 0;

      history.push({ correct: isCorrect });

      const hiddenEmotion = typeof EMOTIONS !== 'undefined'
        ? EMOTIONS.find(e => e.id === sc.hidden) : null;
      const personaNote = sc.persona_note[uiLang] || sc.persona_note.en;
      const persona = typeof GefuehlePersonas !== 'undefined'
        ? GefuehlePersonas.getActivePersona() : { emoji: '💡', name: 'Guide' };

      // Mark choices + disable
      container.querySelectorAll('.det-choice').forEach(btn => {
        if (btn.dataset.id === sc.hidden) btn.classList.add('correct');
        else if (btn.dataset.id === chosenId && !isCorrect) btn.classList.add('wrong');
        btn.disabled = true;
      });

      // Update score pill immediately
      const scorePill = container.querySelector('.det-score-pill');
      if (scorePill) {
        scorePill.textContent = `${score} ${T.pts}`;
        if (isCorrect) { scorePill.classList.add('bump'); setTimeout(() => scorePill.classList.remove('bump'), 400); }
      }

      // Reveal panel
      const reveal = document.createElement('div');
      reveal.className = `det-reveal ${isCorrect ? 'correct' : 'wrong'}`;
      reveal.innerHTML = `
        <div class="det-reveal-result">
          ${isCorrect
            ? `<span class="det-reveal-icon">✓</span>
               <span class="det-reveal-title">${T.correct}</span>
               ${streak >= 2 ? `<span class="det-streak-badge">🔥 ×${streak}</span>` : ''}`
            : `<span class="det-reveal-icon">○</span>
               <span class="det-reveal-title">${T.wrong}: ${hiddenEmotion?.emoji || ''} <strong>${hiddenEmotion?.[uiLang] || hiddenEmotion?.en || sc.hidden}</strong></span>`
          }
        </div>
        <div class="det-psychology">
          <div class="det-psychology-label">🧠 ${T.psychology}</div>
          <div class="det-psychology-text">${personaNote}</div>
          <div class="det-persona-credit">${persona.emoji} ${persona.name}</div>
        </div>
        <button class="det-next-btn btn btn-primary">
          ${index + 1 < total ? T.next : T.results}
        </button>`;

      const caseFile = container.querySelector('.det-case-file');
      if (caseFile) caseFile.appendChild(reveal);
      requestAnimationFrame(() => reveal.classList.add('visible'));

      reveal.querySelector('.det-next-btn').addEventListener('click', () => {
        index++;
        render();
      });
    }

    function showResults() {
      const pct = Math.round((score / total) * 100);
      const rank = getRank(score, total, uiLang);

      const historyDots = history.map((h, i) => `
        <div class="det-history-item ${h.correct ? 'correct' : 'wrong'}">
          ${h.correct ? '✓' : '○'}
          <span>${T.case} ${i + 1}</span>
        </div>`).join('');

      container.innerHTML = `
        <div class="det-results">
          <div class="det-results-header">
            <div class="det-results-badge">${rank.badge}</div>
            <div class="det-results-rank" style="color:${rank.color}">${rank.rank}</div>
            <div class="det-results-score">${score} / ${total}</div>
            <div class="det-results-bar-wrap">
              <div class="det-results-bar">
                <div class="det-results-fill" style="width:${pct}%;background:${rank.color}"></div>
              </div>
            </div>
          </div>

          <div class="det-history-grid">${historyDots}</div>

          ${maxStreak >= 2 ? `<div class="det-streak-result">🔥 ${maxStreak}× ${uiLang === 'de' ? 'Serie' : 'streak'}</div>` : ''}

          <div class="det-results-actions">
            <button class="btn btn-primary det-play-again">${T.play_again}</button>
            <button class="btn btn-secondary det-to-landing">${T.back}</button>
          </div>
        </div>`;

      container.querySelector('.det-play-again').addEventListener('click', () => {
        index = 0; score = 0; streak = 0; maxStreak = 0; history.length = 0;
        shuffleArr(all);
        render();
      });
      container.querySelector('.det-to-landing').addEventListener('click', () => {
        if (onComplete) onComplete();
      });
    }

    render();
  }

  return { initDetectiveMode, SCENARIOS };
})();
