/**
 * Gefühle-Memory — Language Supplement
 * Adds Japanese (ja), Chinese Simplified (zh), Korean (ko), Sanskrit (sa)
 * to the EMOTIONS array after data.js loads.
 * Also provides LANGUAGE_INSIGHTS — unique cultural/linguistic facts per language.
 */

// ── Translations for all 67 emotions in 4 new languages ──────────────────────
// Format: { emotionId: [ja, zh, ko, sa] }
// sa uses Devanagari + romanization in parens for screen readers
const EMOTION_TRANSLATIONS_NEW = {
  // ── Licht & Weite ──
  freude:        ['喜び',     '喜悦',    '기쁨',    'आनन्द'],
  dankbarkeit:   ['感謝',     '感激',    '감사',    'कृतज्ञता'],
  frieden:       ['平和',     '平静',    '평화',    'शान्ति'],
  liebe:         ['愛',       '爱',      '사랑',    'प्रेम'],
  begeisterung:  ['興奮',     '热情',    '열정',    'उत्साह'],
  hoffnung:      ['希望',     '希望',    '희망',    'आशा'],
  stolz:         ['誇り',     '自豪',    '자부심',  'गर्व'],
  neugier:       ['好奇心',   '好奇心',  '호기심',  'जिज्ञासा'],
  staunen:       ['驚嘆',     '惊叹',    '경이',    'विस्मय'],
  heiterkeit:    ['陽気さ',   '愉快',    '명랑함',  'प्रसन्नता'],
  verbundenheit: ['絆',       '联系感',  '유대감',  'सम्बन्ध'],
  geborgenheit:  ['安らぎ',   '安全感',  '안정감',  'सुरक्षा'],
  zufriedenheit: ['満足',     '满足',    '만족',    'तृप्ति'],
  inspiration:   ['インスピレーション', '灵感', '영감', 'प्रेरणा'],
  // ── Sanfte Mitte ──
  ruhe:          ['静けさ',   '平静',    '고요함',  'शान्ति'],
  akzeptanz:     ['受容',     '接受',    '수용',    'स्वीकृति'],
  mitgefühl:     ['共感',     '同情',    '공감',    'करुणा'],
  vertrauen:     ['信頼',     '信任',    '신뢰',    'विश्वास'],
  offenheit:     ['開放性',   '开放',    '개방성',  'उन्मुक्तता'],
  klarheit:      ['明晰さ',   '清晰',    '명확함',  'स्पष्टता'],
  gelassenheit:  ['落ち着き', '淡然',    '평온',    'समता'],
  sanftmut:      ['温和さ',   '温和',    '온화함',  'मृदुता'],
  wärme:         ['温かさ',   '温暖',    '따뜻함',  'उष्णता'],
  // ── Schwere & Tiefe ──
  trauer:        ['悲しみ',   '悲伤',    '슬픔',    'शोक'],
  einsamkeit:    ['孤独',     '孤独',    '외로움',  'एकाकिता'],
  sehnsucht:     ['憧れ',     '渴望',    '그리움',  'विरह'],
  erschöpfung:   ['疲弊',     '精疲力竭','탈진',    'श्रान्ति'],
  niedergeschlagenheit: ['落ち込み', '沮丧', '낙담', 'विषाद'],
  verzweiflung:  ['絶望',     '绝望',    '절망',    'निराशा'],
  leere:         ['虚しさ',   '空虚',    '공허함',  'शून्यता'],
  hilflosigkeit: ['無力感',   '无助',    '무력감',  'असहायता'],
  melancholie:   ['メランコリー', '忧郁', '우울',   'विषण्णता'],
  wehmut:        ['哀愁',     '哀愁',    '서글픔',  'व्याकुलता'],
  // ── Sturm & Reibung ──
  wut:           ['怒り',     '愤怒',    '분노',    'क्रोध'],
  frustration:   ['フラストレーション', '沮丧', '좌절', 'निराशा'],
  ungeduld:      ['苛立ち',   '不耐烦',  '조급함',  'आतुरता'],
  neid:          ['嫉妬',     '嫉妒',    '시기심',  'ईर्ष्या'],
  eifersucht:    ['嫉妬心',   '嫉妒',    '질투',    'डाह'],
  enttäuschung:  ['失望',     '失望',    '실망',    'विरोध'],
  verachtung:    ['軽蔑',     '蔑视',    '경멸',    'अवज्ञा'],
  // ── Angst & Schutz ──
  angst:         ['恐れ',     '恐惧',    '불안',    'भय'],
  nervosität:    ['緊張',     '紧张',    '긴장',    'व्यग्रता'],
  unsicherheit:  ['不安',     '不安全感', '불확실성', 'अनिश्चितता'],
  überwältigung: ['圧倒感',   '不知所措', '압도감',  'अभिभूति'],
  panik:         ['パニック', '恐慌',    '공황',    'आतंक'],
  scham:         ['恥',       '羞耻',    '수치심',  'लज्जा'],
  schuldgefühl:  ['罪悪感',   '内疚',    '죄책감',  'अपराधबोध'],
  // ── Verdeckte Schatten ──
  gleichgültigkeit: ['無関心', '漠然',   '무관심',  'उदासीनता'],
  langeweile:    ['退屈',     '无聊',    '지루함',  'विरक्ति'],
  verwirrung:    ['混乱',     '困惑',    '혼란',    'भ्रम'],
  ohnmacht:      ['無力感',   '无能为力', '무력함',  'निःशक्तता'],
  bitterkeit:    ['苦さ',     '苦涩',    '씁쓸함',  'कटुता'],
  numb:          ['麻痺',     '麻木',    '무감각',  'जड़ता'],
  resignation:   ['諦め',     '听天由命', '체념',   'विरक्ति'],
  zerrissenheit: ['引き裂かれ', '矛盾',   '갈등',   'द्वन्द्व'],
};

// ── Language insights: what makes each language emotionally unique ─────────────
const LANGUAGE_INSIGHTS = {
  ja: {
    name: 'Japanese · 日本語',
    flag: '🇯🇵',
    intro: {
      de: 'Japanisch hat einzigartige Wörter für Gefühle, die im Deutschen nicht existieren.',
      en: 'Japanese has unique words for feelings that exist in no other language.',
      vi: 'Tiếng Nhật có những từ độc đáo cho cảm xúc không có trong ngôn ngữ khác.',
      el: 'Τα Ιαπωνικά έχουν μοναδικές λέξεις για συναισθήματα που δεν υπάρχουν αλλού.',
    },
    concepts: [
      {
        word: '物の哀れ',
        romanization: 'Mono no aware',
        en: 'The bittersweet awareness that beautiful things are impermanent — like cherry blossoms that fall just as they peak.',
        de: 'Das bittersüße Bewusstsein, dass schöne Dinge vergänglich sind — wie Kirschblüten, die genau in ihrer Blüte fallen.',
      },
      {
        word: '甘え',
        romanization: 'Amae',
        en: 'The comfort and joy of depending on someone\'s unconditional acceptance — the feeling that you can let your guard completely down.',
        de: 'Die Geborgenheit, sich auf jemandes bedingungslose Akzeptanz verlassen zu dürfen — das Gefühl, die Maske fallen zu lassen.',
      },
      {
        word: '木漏れ日',
        romanization: 'Komorebi',
        en: 'The interplay of sunlight filtering through leaves — there is no single word for this in English.',
        de: 'Das Spiel des Sonnenlichts, das durch Blätter fällt — dafür gibt es kein einzelnes deutsches Wort.',
      },
      {
        word: '侘び寂び',
        romanization: 'Wabi-sabi',
        en: 'Finding beauty in imperfection and transience — a cracked tea bowl is more beautiful than a perfect one.',
        de: 'Schönheit in Unvollkommenheit und Vergänglichkeit finden — eine gesprungene Teeschale ist schöner als eine perfekte.',
      },
      {
        word: '生き甲斐',
        romanization: 'Ikigai',
        en: 'Your reason for getting up in the morning — the intersection of what you love, what you\'re good at, and what the world needs.',
        de: 'Dein Grund, morgens aufzustehen — die Schnittmenge aus dem, was du liebst, kannst und was die Welt braucht.',
      },
    ],
  },
  zh: {
    name: 'Chinese · 中文',
    flag: '🇨🇳',
    intro: {
      de: 'Chinesisch hat eine jahrtausendealte Tradition, Gefühle durch Metaphern und Zeichen auszudrücken.',
      en: 'Chinese has a millennia-old tradition of expressing emotion through metaphor and character.',
      vi: 'Tiếng Trung có truyền thống hàng nghìn năm biểu đạt cảm xúc qua ẩn dụ và chữ tượng hình.',
      el: 'Τα Κινεζικά έχουν χιλιετή παράδοση έκφρασης συναισθημάτων μέσω μεταφορών και χαρακτήρων.',
    },
    concepts: [
      {
        word: '缘分',
        romanization: 'Yuánfèn',
        en: 'The invisible thread of fate connecting two people — not romantic love, but a destined bond that brought you together.',
        de: 'Der unsichtbare Faden des Schicksals, der zwei Menschen verbindet — nicht romantische Liebe, sondern eine bestimmte Verbindung.',
      },
      {
        word: '思念',
        romanization: 'Sīniàn',
        en: 'A deep, aching longing for someone absent — stronger than "missing", it implies the person lives in your thoughts.',
        de: 'Ein tiefes, schmerzliches Sehnen nach einem abwesenden Menschen — stärker als "vermissen", die Person lebt in deinen Gedanken.',
      },
      {
        word: '面子',
        romanization: 'Miànzi',
        en: 'Social face — the dignity and reputation that must be preserved, both for yourself and for others in your presence.',
        de: 'Soziales Gesicht — die Würde und den Ruf, der bewahrt werden muss, für dich und für andere in deiner Gegenwart.',
      },
      {
        word: '辛苦',
        romanization: 'Xīnkǔ',
        en: 'The bittersweet feeling of hard work and suffering — acknowledging that something cost you greatly, with dignity.',
        de: 'Das bittersüße Gefühl harter Arbeit und Leiden — anerkennend, dass etwas dich viel gekostet hat, mit Würde.',
      },
    ],
  },
  ko: {
    name: 'Korean · 한국어',
    flag: '🇰🇷',
    intro: {
      de: 'Koreanisch hat einige der reichhaltigsten Emotionswörter der Welt — besonders für soziale Gefühle.',
      en: 'Korean has some of the richest emotion words in the world — especially for social and collective feelings.',
      vi: 'Tiếng Hàn có một số từ cảm xúc phong phú nhất thế giới — đặc biệt là cảm xúc xã hội và tập thể.',
      el: 'Τα Κορεατικά έχουν μερικές από τις πλουσιότερες λέξεις συναισθήματος στον κόσμο.',
    },
    concepts: [
      {
        word: '눈치',
        romanization: 'Nunchi',
        en: 'The ability to read the emotional atmosphere of a room — knowing what is felt but not said, and responding accordingly.',
        de: 'Die Fähigkeit, die emotionale Atmosphäre eines Raumes zu lesen — zu spüren, was gefühlt aber nicht gesagt wird.',
      },
      {
        word: '한',
        romanization: 'Han',
        en: 'A uniquely Korean collective emotion — grief, resentment, and longing woven together, yet also the resilience that comes from bearing it.',
        de: 'Ein einzigartiges koreanisches kollektives Gefühl — Trauer, Groll und Sehnsucht verwoben, aber auch die Stärke, die daraus entsteht.',
      },
      {
        word: '정',
        romanization: 'Jeong',
        en: 'A bond that grows slowly and imperceptibly — the feeling between old friends or family that cannot be named but cannot be broken.',
        de: 'Eine Bindung, die langsam und unmerklich wächst — das Gefühl zwischen alten Freunden oder Familie, das nicht benannt, aber nicht gebrochen werden kann.',
      },
      {
        word: '흥',
        romanization: 'Heung',
        en: 'Spontaneous, contagious joy that rises when music begins, people gather, or beauty appears — it cannot be forced, only felt.',
        de: 'Spontane, ansteckende Freude, die aufsteigt, wenn Musik beginnt, Menschen sich versammeln oder Schönheit erscheint — sie kann nicht erzwungen, nur gefühlt werden.',
      },
      {
        word: '기분',
        romanization: 'Kibun',
        en: 'The emotional mood or energy of a moment or person — it must be read and respected before any interaction can go well.',
        de: 'Die emotionale Stimmung oder Energie eines Moments oder einer Person — sie muss gelesen und respektiert werden.',
      },
    ],
  },
  sa: {
    name: 'Sanskrit · संस्कृत',
    flag: '🇮🇳',
    intro: {
      de: 'Sanskrit hat die präziseste Sprache für Bewusstseinszustände und innere Erfahrungen entwickelt.',
      en: 'Sanskrit developed the most precise language for states of consciousness and inner experience ever created.',
      vi: 'Tiếng Sanskrit phát triển ngôn ngữ chính xác nhất cho các trạng thái ý thức và trải nghiệm nội tâm.',
      el: 'Η Σανσκριτική ανέπτυξε την πιο ακριβή γλώσσα για καταστάσεις συνείδησης και εσωτερικής εμπειρίας.',
    },
    concepts: [
      {
        word: 'आनन्द',
        romanization: 'Ānanda',
        en: 'Pure, unconditional bliss — not the happiness that depends on circumstances, but a state of being that is already complete.',
        de: 'Reines, bedingungsloses Glückseligkeit — nicht das Glück, das von Umständen abhängt, sondern ein Seinszustand, der bereits vollständig ist.',
      },
      {
        word: 'करुणा',
        romanization: 'Karuṇā',
        en: 'Compassion in its deepest sense — not pity, but the wish to remove the suffering of all beings, felt with the whole body.',
        de: 'Mitgefühl in seinem tiefsten Sinne — nicht Mitleid, sondern der Wunsch, das Leid aller Wesen zu beseitigen.',
      },
      {
        word: 'शान्ति',
        romanization: 'Śānti',
        en: 'A peace that passes understanding — not the absence of conflict, but a stillness that holds even when the storm rages.',
        de: 'Ein Frieden, der Verstehen übersteigt — nicht die Abwesenheit von Konflikt, sondern eine Stille, die auch im Sturm hält.',
      },
      {
        word: 'विरह',
        romanization: 'Viraha',
        en: 'The ache of separation from someone you love — in Sanskrit poetics, this longing was considered the highest form of love.',
        de: 'Der Schmerz der Trennung von jemandem, den man liebt — in der Sanskrit-Poetik galt diese Sehnsucht als die höchste Form der Liebe.',
      },
      {
        word: 'सत्चित्आनन्द',
        romanization: 'Satchitānanda',
        en: 'Being-Consciousness-Bliss — three qualities of pure existence, said to be the true nature of the self when all else falls away.',
        de: 'Sein-Bewusstsein-Seligkeit — drei Qualitäten des reinen Seins, die als wahre Natur des Selbst gelten, wenn alles andere abfällt.',
      },
    ],
  },
};

// ── Patch EMOTIONS with new language keys ─────────────────────────────────────
(function patchEmotions() {
  if (typeof EMOTIONS === 'undefined') return;
  const LANG_KEYS = ['ja', 'zh', 'ko', 'sa'];
  EMOTIONS.forEach(emo => {
    const translations = EMOTION_TRANSLATIONS_NEW[emo.id];
    if (translations) {
      LANG_KEYS.forEach((lang, i) => {
        if (!emo[lang]) emo[lang] = translations[i] || null;
      });
    }
    // Ensure prompt fallback for new languages (use English)
    if (emo.prompt) {
      LANG_KEYS.forEach(lang => {
        if (!emo.prompt[lang]) emo.prompt[lang] = emo.prompt.en || emo.prompt.de;
      });
    }
  });
  // Patch categories too
  if (typeof CATEGORIES !== 'undefined') {
    const CAT_NAMES = {
      licht:    { ja: '光と広がり', zh: '光与辽阔', ko: '빛과 확장', sa: 'प्रकाश' },
      mitte:    { ja: '穏やかな中心', zh: '平静中心', ko: '부드러운 중심', sa: 'मध्य' },
      schwere:  { ja: '重さと深さ', zh: '沉重与深邃', ko: '무거움과 깊이', sa: 'गाम्भीर्य' },
      sturm:    { ja: '嵐と摩擦', zh: '风暴与摩擦', ko: '폭풍과 마찰', sa: 'तूफ़ान' },
      angst:    { ja: '恐怖と保護', zh: '恐惧与保护', ko: '두려움과 보호', sa: 'भय' },
      schatten: { ja: '隠れた影', zh: '隐藏的阴影', ko: '숨겨진 그림자', sa: 'छाया' },
    };
    CATEGORIES.forEach(cat => {
      const names = CAT_NAMES[cat.id];
      if (names) {
        ['ja', 'zh', 'ko', 'sa'].forEach(lang => {
          if (!cat[lang]) cat[lang] = names[lang];
        });
      }
    });
  }
})();

// Convenience: get language insight for a given lang code
function getLanguageInsight(langCode) {
  return LANGUAGE_INSIGHTS[langCode] || null;
}
