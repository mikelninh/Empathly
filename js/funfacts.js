/**
 * Gefühle-Memory — Fun Facts
 * Surprising linguistic & cultural facts about emotions across languages.
 * Shown via a modal triggered by the "Wusstest du?" button on the landing screen.
 */

const FunFacts = (function () {
  'use strict';

  // ── Facts data ────────────────────────────────────────────────────────────
  // Each fact: word, flag, langName, title, body, wow, tag, color

  const FACTS = [
    {
      word: 'thương',
      flag: '🇻🇳',
      langName: 'Vietnamesisch',
      title: 'Nicht alle Liebe ist gleich',
      body: 'Im Vietnamesischen gibt es mindestens 5 Wörter für Liebe: <em>yêu</em> (romantisch), <em>thương</em> (sorgende, schützende Liebe — für Familie und enge Partner), <em>mến</em> (freundschaftliche Zuneigung), <em>quý</em> (respektvolle Wertschätzung) und <em>thích</em> (mögen).',
      wow: 'Ein Kind sagt zu Eltern "con <strong>thương</strong> ba mẹ" — niemals "yêu". Das fühlt sich falsch an. <em>Thương</em> trägt Liebe + Schutz + Sorge in einem Wort.',
      tag: 'Liebe',
      color: '#E8836B',
    },
    {
      word: 'Sehnsucht',
      flag: '🇩🇪',
      langName: 'Deutsch',
      title: 'Das unübersetzbare Sehnen',
      body: 'Englische Sprecher haben das Wort "Sehnsucht" einfach übernommen, weil es kein Äquivalent gibt. Es ist eine tiefe, bittersüße Sehnsucht — nach etwas Undefiniertem, das sein könnte, das war, oder das vielleicht nie existiert.',
      wow: '"Longing" trifft es nicht. "Yearning" kommt näher. Aber Sehnsucht hat eine eigene Schwere: Es ist schön, sie zu fühlen. C.S. Lewis nannte es "the inconsolable longing" — ein Zeichen auf etwas Größeres.',
      tag: 'Sehnsucht',
      color: '#7BAFD4',
    },
    {
      word: 'அன்பு · காதல் · ஊடல்',
      flag: '🇮🇳',
      langName: 'Tamil',
      title: 'Tamil hat über 20 Wörter für Liebe',
      body: 'Die tamilische Sangam-Literatur (2000+ Jahre alt) unterscheidet: <em>anbu</em> (universelle Liebe), <em>kadhal</em> (romantisches Verlangen), <em>paasam</em> (familiäres Band), <em>nesam</em> (Freundschaftsliebe), <em>moham</em> (Begehren) — und noch viele mehr.',
      wow: '<em>ஊடல் (uudal)</em> bedeutet "liebevoller Streit" — der kleine Konflikt zwischen Liebenden als <strong>Beweis ihrer Liebe</strong>. Tamilische Dichter galten dieser Emotion als so schön, dass sie ihr eigene Verse widmeten.',
      tag: 'Liebe',
      color: '#F6C344',
    },
    {
      word: 'Geborgenheit',
      flag: '🇩🇪',
      langName: 'Deutsch',
      title: 'Warm geborgen — unübersetzbar',
      body: 'Das Gefühl, sicher gehalten zu sein. Nicht nur "safe" (Sicherheit), nicht nur "cozy" (Gemütlichkeit) — sondern das warme Geborgensein: zu Hause, bei Menschen, die einen halten.',
      wow: 'Englischsprachige sagen manchmal: "I feel <em>geborgenheit</em> here" — und können es nicht anders ausdrücken. Kinder beschreiben Geborgenheit oft als "wenn Mama da ist". Es ist ein Grundbedürfnis mit eigenem Namen.',
      tag: 'Zugehörigkeit',
      color: '#F6C344',
    },
    {
      word: 'nỗi nhớ',
      flag: '🇻🇳',
      langName: 'Vietnamesisch',
      title: 'Vermissen als Kunstform',
      body: '<em>Nỗi nhớ</em> bedeutet Vermissen — aber im Vietnamesischen ist Vermissen ästhetisiert. Die Musik-Tradition <em>nhạc vàng</em> (Goldene Musik) ist gesättigt damit. Schmerzhaft vermissen und es gleichzeitig schön finden.',
      wow: 'Wo Deutsche sagen "Ich vermisse dich", können Vietnamesen sagen "Anh nhớ em đến nao lòng" — "Ich vermisse dich bis ins Herz hinein". Vermissen hat Poesie.',
      tag: 'Sehnsucht',
      color: '#7BAFD4',
    },
    {
      word: 'Schadenfreude',
      flag: '🇩🇪',
      langName: 'Deutsch',
      title: 'Das Wort, das die Welt übernahm',
      body: 'Schadenfreude — Freude am Unglück anderer — ist eines der wenigen deutschen Wörter, das global verwendet wird. Im Englischen, Japanischen, Arabischen, Chinesischen — immer als "Schadenfreude".',
      wow: 'Neurowissenschaftler haben gezeigt: das Gehirn aktiviert das Belohnungszentrum bei Schadenfreude. Es gibt dafür kein Gegenwort: Freude am Glück anderer. Das Japanische hat dafür <em>mudita</em> (buddhistisch) — aber kein echtes Alltagswort.',
      tag: 'Sprache',
      color: '#E8836B',
    },
    {
      word: 'ἀγάπη · ἔρως · φιλία',
      flag: '🇬🇷',
      langName: 'Griechisch (klassisch)',
      title: '7 Arten der Liebe',
      body: 'Die alten Griechen unterschieden: <em>Eros</em> (romantisch), <em>Philia</em> (Freundschaft), <em>Storge</em> (familiär), <em>Agape</em> (bedingungslose Liebe), <em>Pragma</em> (reife, dauerhafte Liebe), <em>Ludus</em> (spielerisch, flirtend), <em>Philautia</em> (Selbstliebe).',
      wow: 'Aristoteles: "Selbstliebe ist die Basis aller Liebe." Agape (das höchste) kommt im Neuen Testament vor — "Gott ist Agape". Unser einziges Wort "Liebe" trägt all das in sich — komprimiert.',
      tag: 'Liebe',
      color: '#8E44AD',
    },
    {
      word: 'Saudade',
      flag: '🇵🇹',
      langName: 'Portugiesisch',
      title: 'Das schmerzhaft schöne Vermissen',
      body: '<em>Saudade</em> ist eine melancholische Sehnsucht nach etwas Geliebtem, das abwesend ist — und vielleicht nie zurückkommt. Das Besondere: <em>das Fühlen von Saudade ist selbst ein Genuss</em>.',
      wow: 'Verwandt mit deutschem <em>Sehnsucht</em>, walisischem <em>Hiraeth</em> und vietnamesischem <em>nỗi nhớ</em>. Jede Kultur hat dieses Gefühl — aber jede kultiviert es anders. Saudade ist Portugals nationales Gefühl.',
      tag: 'Sehnsucht',
      color: '#7BAFD4',
    },
    {
      word: 'عشق · حب · مودة',
      flag: '🇸🇦',
      langName: 'Arabisch',
      title: 'Die 6 Stufen der Liebe',
      body: 'Klassische arabische Dichter beschrieben Liebe als Progression: <em>hawa</em> (Anziehung) → <em>hubb</em> (allg. Liebe) → <em>ishq</em> (leidenschaftlich) → <em>wajd</em> (Ekstase) → <em>walah</em> (Kummer-Liebe) → <em>hayam</em> (Besessenheit des Herzens).',
      wow: 'Der Koran verwendet <em>mawadda</em> (warme Zuneigung) und <em>rahma</em> (Barmherzigkeit-Liebe) für Ehe-Partner — Liebe als Fürsorge, nicht nur als Gefühl. <em>Rahma</em> ist dieselbe Wurzel wie "Barmherzigkeit Gottes".',
      tag: 'Liebe',
      color: '#27AE60',
    },
    {
      word: 'Weltschmerz',
      flag: '🇩🇪',
      langName: 'Deutsch',
      title: 'Der Schmerz der Welt',
      body: '<em>Weltschmerz</em> — der Schmerz über die Lücke zwischen der Welt, wie sie ist, und wie sie sein sollte. Heinrich Heine prägte das Wort 1827. Heute kennen es Philosophen weltweit.',
      wow: 'Gen Z kennt es als "the world is broken" Gefühl. Psychologen sagen: Weltschmerz ist Empathie auf Weltebene. Wer keinen Weltschmerz kennt, denkt vielleicht nicht tief genug nach.',
      tag: 'Tiefe',
      color: '#6B6570',
    },
    {
      word: 'Hiraeth',
      flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      langName: 'Walisisch',
      title: 'Heimweh nach einem Ort, der nie existierte',
      body: '<em>Hiraeth</em> ist Trauer um verlorene Orte, Zeiten, Menschen. Das Besondere: die Erinnerung muss nicht real sein. Es ist Heimweh nach einer Version der Heimat, die man vielleicht nie hatte.',
      wow: 'Verwandt mit Sehnsucht und Saudade — aber mit einer walisischen Note: es ist tief verknüpft mit dem Verlust des Landes, der Sprache, der Kultur. Walisisch zu sprechen <em>heilt</em> Hiraeth — weil die Sprache selbst Heimat ist.',
      tag: 'Sehnsucht',
      color: '#27AE60',
    },
    {
      word: 'Ἀλεξιθυμία',
      flag: '🇬🇷',
      langName: 'Griechisch',
      title: 'Keine Worte für Gefühle — und ihr Gegenteil',
      body: '<em>Alexithymia</em> (ἀ-λέξι-θυμία) bedeutet wörtlich "keine Worte für Gefühle" — ein griechisches Wort für eine echte psychologische Störung. Betroffene können Emotionen physisch spüren, aber nicht benennen. Arzt Peter Sifneos prägte den Begriff 1973.',
      wow: '<strong>Diese App ist das direkte Gegenteil von Alexithymia.</strong> Sie gibt Menschen Worte für Gefühle — in 11 Sprachen. Und zeigt gleichzeitig, dass jede Sprache andere Nuancen kennt. Wer die Worte hat, kann fühlen, ausdrücken, verbinden.',
      tag: 'Sprache',
      color: '#8E44AD',
    },
    {
      word: 'ơn nghĩa',
      flag: '🇻🇳',
      langName: 'Vietnamesisch',
      title: 'Dankbarkeit als moralische Schuld',
      body: 'Im Vietnamesischen ist Dankbarkeit nicht nur ein Gefühl — sie ist eine soziale Verpflichtung. <em>Ơn</em> ist eine empfangene Wohltat, die man "trägt". Wer dir hilft, dem schuldest du <em>ơn</em> — und das zählt über Jahre.',
      wow: 'Ein Satz wie "Tôi mang ơn anh" (Ich trage deine Wohltat) schafft eine dauerhafte Bindung. Deutsche "Danke" schließt die Interaktion ab. Vietnamesisches <em>ơn nghĩa</em> öffnet eine lebenslange Beziehung.',
      tag: 'Verbundenheit',
      color: '#F6C344',
    },
  ];

  let currentIndex = 0;
  let modal = null;

  // ── Render one fact card ──────────────────────────────────────────────────

  function renderFact(fact) {
    return `
      <div class="ff-tag" style="background:${fact.color}22; color:${fact.color}">${fact.tag}</div>
      <div class="ff-lang">${fact.flag} ${fact.langName}</div>
      <div class="ff-word">${fact.word}</div>
      <h3 class="ff-title">${fact.title}</h3>
      <p class="ff-body">${fact.body}</p>
      <div class="ff-wow">
        <span class="ff-wow-label">Wow-Moment</span>
        <p>${fact.wow}</p>
      </div>
    `;
  }

  // ── Build modal ───────────────────────────────────────────────────────────

  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'ff-overlay';
    modal.innerHTML = `
      <div class="ff-modal" role="dialog" aria-modal="true">
        <button class="ff-close" aria-label="Schließen">✕</button>
        <div class="ff-card" id="ff-card"></div>
        <div class="ff-nav">
          <button class="ff-prev" aria-label="Vorheriger Fakt">←</button>
          <span class="ff-counter" id="ff-counter"></span>
          <button class="ff-next" aria-label="Nächster Fakt">→</button>
        </div>
        <p class="ff-cta">Diese Nuancen stecken alle in diesem Spiel. Fang an — und entdecke sie!</p>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.ff-close').addEventListener('click', close);
    modal.querySelector('.ff-next').addEventListener('click', () => navigate(1));
    modal.querySelector('.ff-prev').addEventListener('click', () => navigate(-1));
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', onKey);
  }

  function updateDisplay() {
    const fact = FACTS[currentIndex];
    const card = modal.querySelector('#ff-card');

    // Fade out → update → fade in
    card.classList.add('ff-fade-out');
    setTimeout(() => {
      card.innerHTML = renderFact(fact);
      modal.querySelector('#ff-counter').textContent =
        `${currentIndex + 1} / ${FACTS.length}`;
      card.classList.remove('ff-fade-out');
    }, 180);
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + FACTS.length) % FACTS.length;
    updateDisplay();
  }

  function onKey(e) {
    if (!modal || !modal.classList.contains('ff-visible')) return;
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'Escape')     close();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function open(startRandom = true) {
    if (!modal) buildModal();
    if (startRandom) {
      currentIndex = Math.floor(Math.random() * FACTS.length);
    }
    updateDisplay();
    requestAnimationFrame(() => modal.classList.add('ff-visible'));
  }

  function close() {
    if (modal) {
      modal.classList.remove('ff-visible');
      document.removeEventListener('keydown', onKey);
    }
  }

  function init() {
    const btn = document.getElementById('btn-funfact');
    if (btn) btn.addEventListener('click', () => open(true));
  }

  return { init, open, close };
})();
