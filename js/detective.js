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
      surface_emotions: ['freude', 'stolz', 'scham', 'angst', 'einsamkeit', 'dankbarkeit'],
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
      surface_emotions: ['schuld', 'trauer', 'scham', 'angst', 'einsamkeit', 'wut'],
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
      surface_emotions: ['wut', 'frustration', 'erschoepfung', 'einsamkeit', 'scham', 'trauer'],
      hidden: 'erschoepfung',
      persona_note: {
        de: 'Wut, die aus dem Nichts kommt, ist oft Erschöpfung in Verkleidung. Der Körper sagt: „Ich kann nicht mehr" — und der Mund sagt: „Du machst alles falsch."',
        en: 'Anger that comes from nowhere is often exhaustion in disguise. The body says "I cannot take any more" — and the mouth says "you always do this."',
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
      surface_emotions: ['stolz', 'angst', 'erschoepfung', 'leere', 'scham', 'einsamkeit'],
      hidden: 'angst',
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
      surface_emotions: ['einsamkeit', 'trauer', 'stolz', 'schutzbeduerfnis', 'erschoepfung', 'sehnsucht'],
      hidden: 'schutzbeduerfnis',
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
      surface_emotions: ['angst', 'mut', 'freiheit', 'leere', 'sehnsucht', 'hoffnung'],
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
      surface_emotions: ['sehnsucht', 'angst', 'hoffnung', 'scham', 'liebe', 'mut'],
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
      surface_emotions: ['scham', 'wut', 'trauer', 'angst', 'verlassenheit', 'ohnmacht'],
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
      surface_emotions: ['erschoepfung', 'trauer', 'liebe', 'einsamkeit', 'schuld', 'sehnsucht'],
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
      surface_emotions: ['freude', 'trauer', 'leere', 'sehnsucht', 'angst', 'erschoepfung'],
      hidden: 'leere',
      persona_note: {
        de: 'Ein großes Ziel zu erreichen kann Leere hinterlassen — nicht weil es nicht gut war, sondern weil das Ziel die Richtung war, und die Richtung jetzt fehlt.',
        en: 'Reaching a big goal can leave emptiness — not because it was not good, but because the goal was the direction, and now the direction is gone.',
      }
    },
  ];

  function getScenarios(difficulty) {
    if (difficulty === 'all') return SCENARIOS;
    return SCENARIOS.filter(s => s.difficulty === difficulty);
  }

  function initDetectiveMode(container, uiLang, onComplete) {
    const L = (de, en, vi, el) =>
      uiLang === 'de' ? de : uiLang === 'vi' ? vi : uiLang === 'el' ? el : en;

    const all = shuffle([...SCENARIOS]);
    let index = 0;
    let score = 0;
    const total = Math.min(5, all.length);

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function render() {
      if (index >= total) {
        showResults();
        return;
      }
      const sc = all[index];
      const situation = sc.situation[uiLang] || sc.situation.en;

      // Build emotion choices from surface_emotions
      const emotionPool = sc.surface_emotions
        .map(id => typeof EMOTIONS !== 'undefined' ? EMOTIONS.find(e => e.id === id) : null)
        .filter(Boolean);

      const shuffledPool = shuffle([...emotionPool]);

      container.innerHTML = `
        <div class="detective-header">
          <div class="detective-progress">${index + 1} / ${total}</div>
          <div class="detective-score">${L('Punkte', 'Score', 'Điểm', 'Βαθμοί')}: ${score}</div>
        </div>
        <div class="detective-card">
          <div class="detective-badge">🔍 ${L('Was steckt dahinter?', 'What lies beneath?', 'Điều gì ẩn sau?', 'Τι κρύβεται από κάτω;')}</div>
          <div class="detective-situation">${situation}</div>
          <p class="detective-instruction">
            ${L(
              'Was ist das tiefste Gefühl dieser Person — das, das nicht direkt sichtbar ist?',
              'What is the deepest feeling here — the one not directly visible?',
              'Cảm xúc sâu nhất của người này là gì — cái không thể thấy rõ?',
              'Ποιο είναι το βαθύτερο συναίσθημα — αυτό που δεν φαίνεται άμεσα;'
            )}
          </p>
          <div class="detective-grid">
            ${shuffledPool.map(e => `
              <button class="detective-choice" data-id="${e.id}">
                <span class="detective-choice-emoji">${e.emoji}</span>
                <span class="detective-choice-word">${e[uiLang] || e.en}</span>
              </button>`).join('')}
          </div>
        </div>`;

      container.querySelectorAll('.detective-choice').forEach(btn => {
        btn.addEventListener('click', () => handleChoice(btn.dataset.id, sc));
      });
    }

    function handleChoice(chosenId, sc) {
      const isCorrect = chosenId === sc.hidden;
      if (isCorrect) score++;

      const hiddenEmotion = typeof EMOTIONS !== 'undefined'
        ? EMOTIONS.find(e => e.id === sc.hidden) : null;

      const personaNote = sc.persona_note[uiLang] || sc.persona_note.en;
      const persona = typeof GefuehlePersonas !== 'undefined'
        ? GefuehlePersonas.getActivePersona() : { emoji: '💡', name: 'Guide' };

      // Mark all buttons
      container.querySelectorAll('.detective-choice').forEach(btn => {
        if (btn.dataset.id === sc.hidden) btn.classList.add('correct');
        else if (btn.dataset.id === chosenId && !isCorrect) btn.classList.add('wrong');
        btn.disabled = true;
      });

      // Add feedback panel
      const feedback = document.createElement('div');
      feedback.className = `detective-feedback ${isCorrect ? 'correct' : 'wrong'}`;
      feedback.innerHTML = `
        <div class="detective-feedback-result">
          ${isCorrect
            ? `✓ ${L('Genau', 'Exactly', 'Chính xác', 'Ακριβώς')}!`
            : `${L('Das verborgene Gefühl war', 'The hidden emotion was', 'Cảm xúc ẩn là', 'Το κρυμμένο συναίσθημα ήταν')}: ${hiddenEmotion?.emoji || ''} <strong>${hiddenEmotion?.[uiLang] || hiddenEmotion?.en || sc.hidden}</strong>`
          }
        </div>
        <div class="detective-persona-note">
          <span class="detective-persona-badge">${persona.emoji} ${persona.name}</span>
          <span>${personaNote}</span>
        </div>
        <button class="detective-next-btn btn btn-primary">
          ${index + 1 < total
            ? L('Weiter →', 'Next →', 'Tiếp →', 'Επόμενο →')
            : L('Ergebnis sehen', 'See results', 'Xem kết quả', 'Δες αποτελέσματα')}
        </button>`;
      container.querySelector('.detective-card').appendChild(feedback);
      feedback.querySelector('.detective-next-btn').addEventListener('click', () => {
        index++;
        render();
      });
    }

    function showResults() {
      const pct = Math.round((score / total) * 100);
      const msg =
        pct === 100 ? L('Außergewöhnlich. Du liest zwischen den Zeilen.', 'Exceptional. You read between the lines.', 'Xuất sắc. Bạn đọc được những điều ẩn.', 'Εξαιρετικό. Διαβάζεις ανάμεσα στις γραμμές.')
        : pct >= 60 ? L('Gut. Du spürst, was nicht gesagt wird.', 'Good. You sense what is not said.', 'Tốt. Bạn cảm nhận được điều không nói ra.', 'Καλό. Νιώθεις αυτό που δεν λέγεται.')
        : L('Jede Übung schärft die Wahrnehmung.', 'Every practice sharpens perception.', 'Luyện tập sẽ giúp cảm nhận sâu hơn.', 'Κάθε εξάσκηση οξύνει την αντίληψη.');

      container.innerHTML = `
        <div class="detective-results">
          <div class="detective-results-icon">🔍</div>
          <h3>${score} / ${total}</h3>
          <div class="detective-results-bar">
            <div class="detective-results-fill" style="width:${pct}%"></div>
          </div>
          <p class="detective-results-msg">${msg}</p>
          <div class="detective-results-actions">
            <button class="btn btn-primary detective-play-again">${L('Nochmal', 'Play again', 'Chơi lại', 'Ξανά')}</button>
            <button class="btn btn-secondary detective-to-landing">${L('Zurück', 'Back', 'Quay lại', 'Πίσω')}</button>
          </div>
        </div>`;
      container.querySelector('.detective-play-again').addEventListener('click', () => {
        index = 0; score = 0;
        shuffle(all);
        render();
      });
      container.querySelector('.detective-to-landing').addEventListener('click', () => {
        if (onComplete) onComplete();
      });
    }

    render();
  }

  return { initDetectiveMode, SCENARIOS };
})();
