/**
 * Gefühle-Memory — Complete Card Data
 * Based on the original Gefühlsliste + Bedürfnisliste
 * 67 emotions in 6 categories + 40 needs in 5 dimensions
 * German + Vietnamese + English
 */

// ============================================================
// EMOTION CATEGORIES
// ============================================================

const CATEGORIES = [
  { id: 'licht',    emoji: '🌟', de: 'Licht & Weite',      vi: 'Ánh sáng & Sự rộng mở', en: 'Light & Expanse',    color: '#F6C344', colorLight: '#FEF3D0' },
  { id: 'mitte',    emoji: '🌊', de: 'Sanfte Mitte',        vi: 'Trạng thái dịu nhẹ',    en: 'Gentle Middle',      color: '#7BAFD4', colorLight: '#DDE9F3' },
  { id: 'schwere',  emoji: '🌑', de: 'Schwere & Tiefe',     vi: 'Cảm xúc nặng nề',       en: 'Heavy & Deep',       color: '#6B6570', colorLight: '#E0DCE3' },
  { id: 'sturm',    emoji: '🔥', de: 'Sturm & Reibung',     vi: 'Cảm xúc bùng cháy',     en: 'Storm & Friction',   color: '#E74C3C', colorLight: '#FADBD8' },
  { id: 'angst',    emoji: '⚡', de: 'Angst & Schutz',      vi: 'Cảm xúc báo động',       en: 'Fear & Protection',  color: '#8E44AD', colorLight: '#E8DAEF' },
  { id: 'schatten', emoji: '🌘', de: 'Verdeckte Schatten',   vi: 'Bóng tối ẩn sâu',       en: 'Hidden Shadows',     color: '#5D6D7E', colorLight: '#D5D8DC' }
];

// ============================================================
// ALL 67 EMOTIONS
// ============================================================

const EMOTIONS = [
  // ── 🌟 Licht & Weite (14) ──────────────────────────────
  {
    id: 'freude', category: 'licht',
    de: 'Freude', vi: 'Niềm vui', en: 'Joy',
    emoji: '😊',
    prompt: {
      de: 'Wann hast du dich zuletzt richtig gefreut?',
      vi: 'Lần cuối bạn thật sự vui là khi nào?',
      en: 'When did you last feel real joy?'
    }
  },
  {
    id: 'dankbarkeit', category: 'licht',
    de: 'Dankbarkeit', vi: 'Lòng biết ơn', en: 'Gratitude',
    emoji: '🙏',
    prompt: {
      de: 'Wofür bist du heute dankbar?',
      vi: 'Hôm nay bạn biết ơn điều gì?',
      en: 'What are you grateful for today?'
    }
  },
  {
    id: 'frieden', category: 'licht',
    de: 'Frieden', vi: 'Bình an', en: 'Peace',
    emoji: '🕊️',
    prompt: {
      de: 'Wann hast du dich zuletzt friedlich gefühlt?',
      vi: 'Lần cuối bạn cảm thấy bình yên là khi nào?',
      en: 'When did you last feel at peace?'
    }
  },
  {
    id: 'leichtigkeit', category: 'licht',
    de: 'Leichtigkeit', vi: 'Nhẹ nhõm', en: 'Lightness',
    emoji: '🎈',
    prompt: {
      de: 'Was gibt dir ein Gefühl von Leichtigkeit?',
      vi: 'Điều gì làm bạn cảm thấy nhẹ nhõm?',
      en: 'What gives you a feeling of lightness?'
    }
  },
  {
    id: 'begeisterung', category: 'licht',
    de: 'Begeisterung', vi: 'Hứng khởi', en: 'Enthusiasm',
    emoji: '✨',
    prompt: {
      de: 'Was begeistert dich gerade?',
      vi: 'Điều gì đang làm bạn hứng khởi?',
      en: 'What excites you right now?'
    }
  },
  {
    id: 'zaertlichkeit', category: 'licht',
    de: 'Zärtlichkeit', vi: 'Dịu dàng', en: 'Tenderness',
    emoji: '🤲',
    prompt: {
      de: 'Wann hast du zuletzt Zärtlichkeit gespürt?',
      vi: 'Lần cuối bạn cảm nhận sự dịu dàng là khi nào?',
      en: 'When did you last feel tenderness?'
    }
  },
  {
    id: 'verbundenheit', category: 'licht',
    de: 'Verbundenheit', vi: 'Gắn kết', en: 'Connection',
    emoji: '🔗',
    prompt: {
      de: 'Mit wem fühlst du dich verbunden?',
      vi: 'Bạn cảm thấy gắn kết với ai?',
      en: 'Who do you feel connected to?'
    }
  },
  {
    id: 'liebe', category: 'licht',
    de: 'Liebe', vi: 'Tình yêu', en: 'Love',
    emoji: '❤️',
    prompt: {
      de: 'Was bedeutet Liebe für dich?',
      vi: 'Tình yêu có ý nghĩa gì với bạn?',
      en: 'What does love mean to you?'
    }
  },
  {
    id: 'staunen', category: 'licht',
    de: 'Staunen', vi: 'Ngạc nhiên thích thú', en: 'Wonder',
    emoji: '🤩',
    prompt: {
      de: 'Was hat dich zuletzt zum Staunen gebracht?',
      vi: 'Điều gì gần đây khiến bạn ngạc nhiên thích thú?',
      en: 'What recently filled you with wonder?'
    }
  },
  {
    id: 'vertrauen', category: 'licht',
    de: 'Vertrauen', vi: 'Tin tưởng', en: 'Trust',
    emoji: '🤝',
    prompt: {
      de: 'Wem vertraust du am meisten?',
      vi: 'Bạn tin tưởng ai nhất?',
      en: 'Who do you trust the most?'
    }
  },
  {
    id: 'hoffnung', category: 'licht',
    de: 'Hoffnung', vi: 'Hy vọng', en: 'Hope',
    emoji: '🌱',
    prompt: {
      de: 'Worauf hoffst du gerade?',
      vi: 'Bạn đang hy vọng điều gì?',
      en: 'What are you hoping for?'
    }
  },
  {
    id: 'klarheit', category: 'licht',
    de: 'Klarheit', vi: 'Sự rõ ràng', en: 'Clarity',
    emoji: '💎',
    prompt: {
      de: 'Wann hattest du zuletzt einen Moment der Klarheit?',
      vi: 'Khi nào bạn có khoảnh khắc rõ ràng gần đây nhất?',
      en: 'When did you last have a moment of clarity?'
    }
  },
  {
    id: 'freiheit', category: 'licht',
    de: 'Freiheit', vi: 'Tự do', en: 'Freedom',
    emoji: '🦅',
    prompt: {
      de: 'Was bedeutet Freiheit für dich?',
      vi: 'Tự do có ý nghĩa gì với bạn?',
      en: 'What does freedom mean to you?'
    }
  },
  {
    id: 'ehrfurcht', category: 'licht',
    de: 'Ehrfurcht', vi: 'Kính trọng sâu sắc', en: 'Awe',
    emoji: '🌌',
    prompt: {
      de: 'Was erfüllt dich mit Ehrfurcht?',
      vi: 'Điều gì khiến bạn kính sợ thiêng liêng?',
      en: 'What fills you with awe?'
    }
  },

  // ── 🌊 Sanfte Mitte (13) ──────────────────────────────
  {
    id: 'zufriedenheit', category: 'mitte',
    de: 'Zufriedenheit', vi: 'Hài lòng', en: 'Contentment',
    emoji: '😌',
    prompt: {
      de: 'Wann bist du zufrieden mit dem, was ist?',
      vi: 'Khi nào bạn hài lòng với những gì đang có?',
      en: 'When are you content with what is?'
    }
  },
  {
    id: 'melancholie', category: 'mitte',
    de: 'Melancholie', vi: 'Man mác buồn', en: 'Melancholy',
    emoji: '🌧️',
    prompt: {
      de: 'Gibt es eine schöne Traurigkeit, die du kennst?',
      vi: 'Có nỗi buồn đẹp nào bạn từng cảm nhận không?',
      en: 'Is there a beautiful sadness you know?'
    }
  },
  {
    id: 'nachdenklichkeit', category: 'mitte',
    de: 'Nachdenklichkeit', vi: 'Trầm tư', en: 'Thoughtfulness',
    emoji: '🤔',
    prompt: {
      de: 'Worüber denkst du in letzter Zeit viel nach?',
      vi: 'Gần đây bạn suy nghĩ nhiều về điều gì?',
      en: 'What have you been thinking about lately?'
    }
  },
  {
    id: 'sehnsucht', category: 'mitte',
    de: 'Sehnsucht', vi: 'Nhớ nhung', en: 'Longing',
    emoji: '🥺',
    prompt: {
      de: 'Nach wem oder was sehnst du dich?',
      vi: 'Bạn nhớ nhung ai hoặc điều gì?',
      en: 'Who or what do you long for?'
    }
  },
  {
    id: 'sensibilitaet', category: 'mitte',
    de: 'Sensibilität', vi: 'Nhạy cảm', en: 'Sensitivity',
    emoji: '🦋',
    prompt: {
      de: 'Wann merkst du, dass du besonders sensibel bist?',
      vi: 'Khi nào bạn nhận ra mình đặc biệt nhạy cảm?',
      en: 'When do you notice you are especially sensitive?'
    }
  },
  {
    id: 'nostalgie', category: 'mitte',
    de: 'Nostalgie', vi: 'Hoài niệm', en: 'Nostalgia',
    emoji: '📷',
    prompt: {
      de: 'Welche Erinnerung wärmt dein Herz?',
      vi: 'Kỷ niệm nào sưởi ấm trái tim bạn?',
      en: 'Which memory warms your heart?'
    }
  },
  {
    id: 'offenheit', category: 'mitte',
    de: 'Offenheit', vi: 'Cởi mở', en: 'Openness',
    emoji: '🚪',
    prompt: {
      de: 'Für was bist du gerade offen?',
      vi: 'Bạn đang cởi mở với điều gì?',
      en: 'What are you open to right now?'
    }
  },
  {
    id: 'verletzlichkeit', category: 'mitte',
    de: 'Verletzlichkeit', vi: 'Dễ tổn thương', en: 'Vulnerability',
    emoji: '🫧',
    prompt: {
      de: 'Wann hast du dich zuletzt verletzlich gezeigt?',
      vi: 'Lần cuối bạn cho thấy sự dễ tổn thương là khi nào?',
      en: 'When did you last show your vulnerability?'
    }
  },
  {
    id: 'muedigkeit', category: 'mitte',
    de: 'Müdigkeit', vi: 'Mệt mỏi', en: 'Tiredness',
    emoji: '😴',
    prompt: {
      de: 'Was macht dich müde — und was gibt dir Energie?',
      vi: 'Điều gì làm bạn mệt — và điều gì cho bạn năng lượng?',
      en: 'What tires you — and what gives you energy?'
    }
  },
  {
    id: 'langeweile', category: 'mitte',
    de: 'Langeweile', vi: 'Chán chường', en: 'Boredom',
    emoji: '🥱',
    prompt: {
      de: 'Kann Langeweile auch etwas Gutes sein?',
      vi: 'Sự chán có thể là điều tốt không?',
      en: 'Can boredom be a good thing?'
    }
  },
  {
    id: 'neutralitaet', category: 'mitte',
    de: 'Neutralität', vi: 'Trung tính', en: 'Neutrality',
    emoji: '⚖️',
    prompt: {
      de: 'Wie fühlt es sich an, einfach nichts zu fühlen?',
      vi: 'Không cảm thấy gì cả thì có cảm giác như thế nào?',
      en: 'What does it feel like to feel nothing?'
    }
  },
  {
    id: 'beduerfnis', category: 'mitte',
    de: 'Bedürftigkeit', vi: 'Cần được quan tâm', en: 'Neediness',
    emoji: '🫶',
    prompt: {
      de: 'Was brauchst du gerade am meisten?',
      vi: 'Lúc này bạn cần điều gì nhất?',
      en: 'What do you need most right now?'
    }
  },
  {
    id: 'weichheit', category: 'mitte',
    de: 'Weichheit', vi: 'Mềm mỏng', en: 'Softness',
    emoji: '☁️',
    prompt: {
      de: 'Wann erlaubst du dir, weich zu sein?',
      vi: 'Khi nào bạn cho phép mình mềm mỏng?',
      en: 'When do you allow yourself to be soft?'
    }
  },

  // ── 🌑 Schwere & Tiefe (12) ──────────────────────────────
  {
    id: 'traurigkeit', category: 'schwere',
    de: 'Traurigkeit', vi: 'Buồn bã', en: 'Sadness',
    emoji: '😢',
    prompt: {
      de: 'Was macht dich manchmal traurig?',
      vi: 'Điều gì đôi khi làm bạn buồn?',
      en: 'What sometimes makes you sad?'
    }
  },
  {
    id: 'einsamkeit', category: 'schwere',
    de: 'Einsamkeit', vi: 'Cô đơn', en: 'Loneliness',
    emoji: '🌙',
    prompt: {
      de: 'Wann fühlst du dich einsam?',
      vi: 'Khi nào bạn cảm thấy cô đơn?',
      en: 'When do you feel lonely?'
    }
  },
  {
    id: 'enttaeuschung', category: 'schwere',
    de: 'Enttäuschung', vi: 'Thất vọng', en: 'Disappointment',
    emoji: '😞',
    prompt: {
      de: 'Wann hat dich zuletzt jemand enttäuscht?',
      vi: 'Lần cuối ai đó làm bạn thất vọng là khi nào?',
      en: 'When did someone last disappoint you?'
    }
  },
  {
    id: 'hilflosigkeit', category: 'schwere',
    de: 'Hilflosigkeit', vi: 'Bất lực', en: 'Helplessness',
    emoji: '😶',
    prompt: {
      de: 'Wann hast du dich hilflos gefühlt?',
      vi: 'Khi nào bạn cảm thấy bất lực?',
      en: 'When did you feel helpless?'
    }
  },
  {
    id: 'ueberforderung', category: 'schwere',
    de: 'Überforderung', vi: 'Quá tải', en: 'Overwhelm',
    emoji: '🤯',
    prompt: {
      de: 'Was überwältigt dich manchmal?',
      vi: 'Điều gì đôi khi làm bạn quá tải?',
      en: 'What overwhelms you sometimes?'
    }
  },
  {
    id: 'ohnmacht', category: 'schwere',
    de: 'Ohnmacht', vi: 'Bất lực hoàn toàn', en: 'Powerlessness',
    emoji: '🕳️',
    prompt: {
      de: 'Gab es einen Moment, wo du gar nichts tun konntest?',
      vi: 'Có khoảnh khắc nào bạn không thể làm gì không?',
      en: 'Was there a moment you could do nothing at all?'
    }
  },
  {
    id: 'scham', category: 'schwere',
    de: 'Scham', vi: 'Xấu hổ', en: 'Shame',
    emoji: '😳',
    prompt: {
      de: 'Worüber schämst du dich — und solltest du das wirklich?',
      vi: 'Bạn xấu hổ về điều gì — và bạn có nên vậy không?',
      en: 'What shames you — and should it really?'
    }
  },
  {
    id: 'schuld', category: 'schwere',
    de: 'Schuld', vi: 'Tội lỗi', en: 'Guilt',
    emoji: '⚖️',
    prompt: {
      de: 'Trägst du eine Schuld mit dir, die du loslassen könntest?',
      vi: 'Bạn có mang tội lỗi nào có thể buông bỏ không?',
      en: 'Do you carry guilt you could let go of?'
    }
  },
  {
    id: 'leere', category: 'schwere',
    de: 'Leere', vi: 'Trống rỗng', en: 'Emptiness',
    emoji: '🫥',
    prompt: {
      de: 'Kennst du das Gefühl von innerer Leere?',
      vi: 'Bạn có biết cảm giác trống rỗng bên trong không?',
      en: 'Do you know the feeling of inner emptiness?'
    }
  },
  {
    id: 'verlorenheit', category: 'schwere',
    de: 'Verlorenheit', vi: 'Lạc lõng', en: 'Lostness',
    emoji: '🧭',
    prompt: {
      de: 'Wann hast du dich verloren gefühlt?',
      vi: 'Khi nào bạn cảm thấy lạc lõng?',
      en: 'When did you feel lost?'
    }
  },
  {
    id: 'hoffnungslosigkeit', category: 'schwere',
    de: 'Hoffnungslosigkeit', vi: 'Tuyệt vọng', en: 'Hopelessness',
    emoji: '🖤',
    prompt: {
      de: 'Was hilft dir, wenn alles hoffnungslos scheint?',
      vi: 'Điều gì giúp bạn khi mọi thứ dường như tuyệt vọng?',
      en: 'What helps you when everything seems hopeless?'
    }
  },
  {
    id: 'verlassenheit', category: 'schwere',
    de: 'Verlassenheit', vi: 'Cảm giác bị bỏ rơi', en: 'Abandonment',
    emoji: '🚶',
    prompt: {
      de: 'Hast du dich jemals verlassen gefühlt?',
      vi: 'Bạn đã bao giờ cảm thấy bị bỏ rơi chưa?',
      en: 'Have you ever felt abandoned?'
    }
  },

  // ── 🔥 Sturm & Reibung (11) ──────────────────────────────
  {
    id: 'wut', category: 'sturm',
    de: 'Wut', vi: 'Tức giận', en: 'Anger',
    emoji: '😤',
    prompt: {
      de: 'Worüber hast du dich zuletzt richtig geärgert?',
      vi: 'Lần cuối bạn thật sự tức giận là vì điều gì?',
      en: 'What last made you really angry?'
    }
  },
  {
    id: 'frustration', category: 'sturm',
    de: 'Frustration', vi: 'Bực bội', en: 'Frustration',
    emoji: '😩',
    prompt: {
      de: 'Was frustriert dich im Moment?',
      vi: 'Điều gì đang làm bạn bực bội?',
      en: 'What frustrates you right now?'
    }
  },
  {
    id: 'aerger', category: 'sturm',
    de: 'Ärger', vi: 'Cáu giận', en: 'Annoyance',
    emoji: '😠',
    prompt: {
      de: 'Was ärgert dich am meisten im Alltag?',
      vi: 'Điều gì làm bạn cáu nhất hàng ngày?',
      en: 'What annoys you most in daily life?'
    }
  },
  {
    id: 'neid', category: 'sturm',
    de: 'Neid', vi: 'Ghen tị', en: 'Envy',
    emoji: '👀',
    prompt: {
      de: 'Auf wen oder was warst du schon mal neidisch?',
      vi: 'Bạn đã bao giờ ghen tị với ai hoặc điều gì?',
      en: 'Who or what have you been envious of?'
    }
  },
  {
    id: 'eifersucht', category: 'sturm',
    de: 'Eifersucht', vi: 'Ghen tuông', en: 'Jealousy',
    emoji: '💚',
    prompt: {
      de: 'Was steckt hinter Eifersucht?',
      vi: 'Đằng sau sự ghen tuông là gì?',
      en: 'What lies behind jealousy?'
    }
  },
  {
    id: 'groll', category: 'sturm',
    de: 'Groll', vi: 'Oán giận', en: 'Resentment',
    emoji: '😒',
    prompt: {
      de: 'Trägst du einen Groll mit dir? Gegen wen?',
      vi: 'Bạn có oán giận ai không?',
      en: 'Do you hold a grudge? Against whom?'
    }
  },
  {
    id: 'ungeduld', category: 'sturm',
    de: 'Ungeduld', vi: 'Thiếu kiên nhẫn', en: 'Impatience',
    emoji: '⏰',
    prompt: {
      de: 'Wobei verlierst du am schnellsten die Geduld?',
      vi: 'Khi nào bạn mất kiên nhẫn nhanh nhất?',
      en: 'What makes you lose patience fastest?'
    }
  },
  {
    id: 'gereiztheit', category: 'sturm',
    de: 'Gereiztheit', vi: 'Dễ nổi nóng', en: 'Irritability',
    emoji: '😡',
    prompt: {
      de: 'Was reizt dich, wenn du ehrlich bist?',
      vi: 'Thật lòng, điều gì làm bạn khó chịu?',
      en: 'What irritates you, if you are honest?'
    }
  },
  {
    id: 'trotz', category: 'sturm',
    de: 'Trotz', vi: 'Bướng bỉnh', en: 'Defiance',
    emoji: '✊',
    prompt: {
      de: 'Wann bist du trotzig — und ist das manchmal gut?',
      vi: 'Khi nào bạn bướng bỉnh — và đôi khi điều đó có tốt không?',
      en: 'When are you defiant — and is that sometimes good?'
    }
  },
  {
    id: 'empoerung', category: 'sturm',
    de: 'Empörung', vi: 'Phẫn nộ', en: 'Outrage',
    emoji: '🗯️',
    prompt: {
      de: 'Was empört dich zutiefst?',
      vi: 'Điều gì khiến bạn phẫn nộ tận đáy lòng?',
      en: 'What outrages you deeply?'
    }
  },
  {
    id: 'rebellion', category: 'sturm',
    de: 'Rebellion', vi: 'Phản kháng', en: 'Rebellion',
    emoji: '🏴',
    prompt: {
      de: 'Wogegen möchtest du manchmal rebellieren?',
      vi: 'Đôi khi bạn muốn phản kháng điều gì?',
      en: 'What do you sometimes want to rebel against?'
    }
  },

  // ── ⚡ Angst & Schutz (9) ──────────────────────────────
  {
    id: 'angst_gefuehl', category: 'angst',
    de: 'Angst', vi: 'Sợ hãi', en: 'Fear',
    emoji: '😨',
    prompt: {
      de: 'Wovor hast du Angst — und wovor hattest du als Kind Angst?',
      vi: 'Bạn sợ điều gì — và lúc nhỏ bạn sợ gì?',
      en: 'What do you fear — and what did you fear as a child?'
    }
  },
  {
    id: 'sorge', category: 'angst',
    de: 'Sorge', vi: 'Lo lắng', en: 'Worry',
    emoji: '😟',
    prompt: {
      de: 'Was bereitet dir gerade Sorgen?',
      vi: 'Điều gì đang khiến bạn lo lắng?',
      en: 'What worries you right now?'
    }
  },
  {
    id: 'unsicherheit', category: 'angst',
    de: 'Unsicherheit', vi: 'Bất an', en: 'Insecurity',
    emoji: '🫣',
    prompt: {
      de: 'Wobei fühlst du dich unsicher?',
      vi: 'Bạn cảm thấy bất an về điều gì?',
      en: 'What makes you feel insecure?'
    }
  },
  {
    id: 'panik', category: 'angst',
    de: 'Panik', vi: 'Hoảng loạn', en: 'Panic',
    emoji: '😱',
    prompt: {
      de: 'Hast du schon mal Panik erlebt? Was hat geholfen?',
      vi: 'Bạn đã trải qua hoảng loạn chưa? Điều gì đã giúp bạn?',
      en: 'Have you experienced panic? What helped?'
    }
  },
  {
    id: 'nervositaet', category: 'angst',
    de: 'Nervosität', vi: 'Hồi hộp', en: 'Nervousness',
    emoji: '😬',
    prompt: {
      de: 'Wobei wirst du nervös?',
      vi: 'Điều gì làm bạn hồi hộp?',
      en: 'What makes you nervous?'
    }
  },
  {
    id: 'misstrauen', category: 'angst',
    de: 'Misstrauen', vi: 'Nghi ngờ', en: 'Distrust',
    emoji: '🤨',
    prompt: {
      de: 'Wann fällt es dir schwer, zu vertrauen?',
      vi: 'Khi nào bạn khó tin tưởng người khác?',
      en: 'When is it hard for you to trust?'
    }
  },
  {
    id: 'bedrohung', category: 'angst',
    de: 'Bedrohung', vi: 'Bị đe dọa', en: 'Threat',
    emoji: '⚠️',
    prompt: {
      de: 'Wann hast du dich bedroht gefühlt?',
      vi: 'Khi nào bạn cảm thấy bị đe dọa?',
      en: 'When did you feel threatened?'
    }
  },
  {
    id: 'kontrollverlust', category: 'angst',
    de: 'Kontrollverlust', vi: 'Mất kiểm soát', en: 'Loss of control',
    emoji: '🌀',
    prompt: {
      de: 'Was passiert mit dir, wenn du die Kontrolle verlierst?',
      vi: 'Điều gì xảy ra khi bạn mất kiểm soát?',
      en: 'What happens when you lose control?'
    }
  },
  {
    id: 'ueberwachsamkeit', category: 'angst',
    de: 'Überwachsamkeit', vi: 'Cảnh giác quá mức', en: 'Hypervigilance',
    emoji: '👁️',
    prompt: {
      de: 'Bist du manchmal zu wachsam? Wovor schützt du dich?',
      vi: 'Đôi khi bạn có quá cảnh giác không? Bạn đang bảo vệ mình khỏi điều gì?',
      en: 'Are you sometimes too watchful? What are you protecting yourself from?'
    }
  },

  // ── 🌘 Verdeckte Schatten (8) ──────────────────────────────
  {
    id: 'resignation', category: 'schatten',
    de: 'Resignation', vi: 'Buông xuôi', en: 'Resignation',
    emoji: '😔',
    prompt: {
      de: 'Hast du bei etwas aufgegeben, das dir wichtig war?',
      vi: 'Bạn đã bao giờ bỏ cuộc điều quan trọng với mình chưa?',
      en: 'Have you given up on something that mattered to you?'
    }
  },
  {
    id: 'bitterkeit', category: 'schatten',
    de: 'Bitterkeit', vi: 'Cay đắng', en: 'Bitterness',
    emoji: '🍋',
    prompt: {
      de: 'Gibt es etwas, das dich bitter gemacht hat?',
      vi: 'Có điều gì đã làm bạn cay đắng không?',
      en: 'Is there something that has made you bitter?'
    }
  },
  {
    id: 'selbstzweifel', category: 'schatten',
    de: 'Selbstzweifel', vi: 'Tự nghi ngờ', en: 'Self-doubt',
    emoji: '🪞',
    prompt: {
      de: 'Woran zweifelst du bei dir selbst?',
      vi: 'Bạn nghi ngờ điều gì ở bản thân?',
      en: 'What do you doubt about yourself?'
    }
  },
  {
    id: 'selbstverurteilung', category: 'schatten',
    de: 'Selbstverurteilung', vi: 'Tự trách móc', en: 'Self-judgment',
    emoji: '⚖️',
    prompt: {
      de: 'Verurteilst du dich manchmal zu hart?',
      vi: 'Đôi khi bạn có quá khắt khe với bản thân không?',
      en: 'Are you sometimes too hard on yourself?'
    }
  },
  {
    id: 'verhaertung', category: 'schatten',
    de: 'Verhärtung', vi: 'Chai sạn', en: 'Hardening',
    emoji: '🪨',
    prompt: {
      de: 'Wo bist du hart geworden — und willst du dort wieder weich werden?',
      vi: 'Bạn đã chai sạn ở đâu — và bạn có muốn mềm lại không?',
      en: 'Where have you hardened — and do you want to soften again?'
    }
  },
  {
    id: 'taubheit', category: 'schatten',
    de: 'Taubheit', vi: 'Tê liệt cảm xúc', en: 'Numbness',
    emoji: '🧊',
    prompt: {
      de: 'Kennst du das Gefühl, gar nichts mehr zu fühlen?',
      vi: 'Bạn có biết cảm giác không còn cảm nhận gì nữa không?',
      en: 'Do you know the feeling of not feeling anything anymore?'
    }
  },
  {
    id: 'zynismus', category: 'schatten',
    de: 'Zynismus', vi: 'Bi quan châm biếm', en: 'Cynicism',
    emoji: '🎭',
    prompt: {
      de: 'Ist dein Zynismus ein Schutzschild? Wogegen?',
      vi: 'Sự châm biếm của bạn có phải là lá chắn không? Chống lại điều gì?',
      en: 'Is your cynicism a shield? Against what?'
    }
  },
  {
    id: 'hoffnungsmuedigkeit', category: 'schatten',
    de: 'Hoffnungsmüdigkeit', vi: 'Mệt mỏi vì hy vọng', en: 'Hope fatigue',
    emoji: '🕯️',
    prompt: {
      de: 'Bist du müde vom Hoffen? Was würde helfen?',
      vi: 'Bạn có mệt mỏi vì hy vọng không? Điều gì sẽ giúp bạn?',
      en: 'Are you tired of hoping? What would help?'
    }
  }
];

// ============================================================
// NEEDS — 5 Dimensions, 8 each (40 total)
// ============================================================

const NEED_DIMENSIONS = [
  { id: 'koerper',   emoji: '🧍', de: 'Körper',    vi: 'Cơ thể',      en: 'Body',          question: { de: 'Was braucht mein Körper jetzt?', vi: 'Cơ thể tôi cần gì lúc này?', en: 'What does my body need right now?' } },
  { id: 'herz',      emoji: '💛', de: 'Herz',      vi: 'Trái tim',     en: 'Heart',         question: { de: 'Was braucht mein emotionales Selbst?', vi: 'Trái tim tôi cần gì?', en: 'What does my emotional self need?' } },
  { id: 'geist',     emoji: '🧠', de: 'Geist',     vi: 'Tâm trí',      en: 'Mind',          question: { de: 'Was braucht mein Denken?', vi: 'Tâm trí tôi cần gì?', en: 'What does my mind need?' } },
  { id: 'seele',     emoji: '🔮', de: 'Seele',     vi: 'Tâm hồn',      en: 'Soul',          question: { de: 'Was ruft mich von innen?', vi: 'Tâm hồn tôi khao khát gì?', en: 'What calls me from within?' } },
  { id: 'beziehung', emoji: '👥', de: 'Beziehung', vi: 'Mối quan hệ', en: 'Relationship',  question: { de: 'Was brauche ich von anderen?', vi: 'Tôi cần gì trong mối quan hệ?', en: 'What do I need from others?' } }
];

const NEEDS = [
  // 🧍 Körper
  { id: 'ruhe',       dimension: 'koerper',   de: 'Ruhe / Schlaf',           vi: 'Nghỉ ngơi / Ngủ',           en: 'Rest / Sleep',          emoji: '😴' },
  { id: 'bewegung',   dimension: 'koerper',   de: 'Bewegung / Dehnung',      vi: 'Vận động / Giãn cơ',        en: 'Movement / Stretching', emoji: '🏃' },
  { id: 'beruehrung', dimension: 'koerper',   de: 'Berührung / Nähe',        vi: 'Chạm / Gần gũi',            en: 'Touch / Closeness',     emoji: '🤗' },
  { id: 'nahrung',    dimension: 'koerper',   de: 'Nährende Nahrung',        vi: 'Thức ăn bổ dưỡng',          en: 'Nourishing food',       emoji: '🥗' },
  { id: 'wasser',     dimension: 'koerper',   de: 'Wasser / Hydration',      vi: 'Uống nước',                  en: 'Water / Hydration',     emoji: '💧' },
  { id: 'luft',       dimension: 'koerper',   de: 'Frische Luft',            vi: 'Không khí trong lành',       en: 'Fresh air',             emoji: '🌬️' },
  { id: 'atmen',      dimension: 'koerper',   de: 'Langsames Atmen',         vi: 'Thở chậm',                   en: 'Slow breathing',        emoji: '🫁' },
  { id: 'waerme',     dimension: 'koerper',   de: 'Wärme / Bad / Tee',       vi: 'Sự ấm áp / Tắm / Trà nóng', en: 'Warmth / Bath / Tea',   emoji: '☕' },

  // 💛 Herz
  { id: 'gesehen',    dimension: 'herz',      de: 'Gesehen werden',          vi: 'Được thấu hiểu',             en: 'Being seen',            emoji: '👁️' },
  { id: 'liebe_n',    dimension: 'herz',      de: 'Zärtlichkeit / Liebe',    vi: 'Yêu thương / Âu yếm',       en: 'Tenderness / Love',     emoji: '💕' },
  { id: 'trost',      dimension: 'herz',      de: 'Trost',                   vi: 'An ủi',                      en: 'Comfort',               emoji: '🫂' },
  { id: 'spiel',      dimension: 'herz',      de: 'Freude / Spiel',          vi: 'Niềm vui / Vui đùa',        en: 'Joy / Play',            emoji: '🎈' },
  { id: 'lachen',     dimension: 'herz',      de: 'Lachen',                  vi: 'Cười',                        en: 'Laughter',              emoji: '😂' },
  { id: 'dank_ausdruck', dimension: 'herz',   de: 'Dankbarkeit ausdrücken',  vi: 'Bày tỏ lòng biết ơn',       en: 'Express gratitude',     emoji: '🙏' },
  { id: 'weinen',     dimension: 'herz',      de: 'Weinen dürfen',           vi: 'Được khóc',                   en: 'Permission to cry',     emoji: '💧' },
  { id: 'sicherheit', dimension: 'herz',      de: 'Sicherheit',              vi: 'Cảm giác an toàn',           en: 'Safety',                emoji: '🛡️' },

  // 🧠 Geist
  { id: 'geist_klarheit', dimension: 'geist', de: 'Klarheit',                vi: 'Rõ ràng',                    en: 'Clarity',               emoji: '💎' },
  { id: 'stille',     dimension: 'geist',     de: 'Stille',                  vi: 'Tĩnh lặng',                  en: 'Silence',               emoji: '🤫' },
  { id: 'fokus',      dimension: 'geist',     de: 'Fokus',                   vi: 'Tập trung',                   en: 'Focus',                 emoji: '🎯' },
  { id: 'inspiration', dimension: 'geist',    de: 'Inspiration',             vi: 'Cảm hứng',                   en: 'Inspiration',           emoji: '💡' },
  { id: 'ordnung',    dimension: 'geist',     de: 'Struktur / Ordnung',      vi: 'Trật tự / Sắp xếp',         en: 'Structure / Order',     emoji: '📋' },
  { id: 'lernen',     dimension: 'geist',     de: 'Lernen',                  vi: 'Học hỏi',                    en: 'Learning',              emoji: '📚' },
  { id: 'sinn',       dimension: 'geist',     de: 'Sinn',                    vi: 'Ý nghĩa',                    en: 'Meaning',               emoji: '🧩' },
  { id: 'perspektive', dimension: 'geist',    de: 'Perspektivwechsel',       vi: 'Thay đổi góc nhìn',          en: 'Change of perspective', emoji: '🔄' },

  // 🔮 Seele
  { id: 'seele_verbundenheit', dimension: 'seele', de: 'Verbundenheit',      vi: 'Kết nối',                    en: 'Connection',            emoji: '🔗' },
  { id: 'seele_vertrauen', dimension: 'seele', de: 'Vertrauen',              vi: 'Tin tưởng',                   en: 'Trust',                 emoji: '🤝' },
  { id: 'hingabe',    dimension: 'seele',     de: 'Hingabe',                 vi: 'Buông mình',                  en: 'Surrender',             emoji: '🙌' },
  { id: 'wahrheit',   dimension: 'seele',     de: 'Wahrheit aussprechen',    vi: 'Nói ra sự thật',             en: 'Speaking truth',        emoji: '🗣️' },
  { id: 'kreativ',    dimension: 'seele',     de: 'Kreativer Ausdruck',      vi: 'Sáng tạo',                   en: 'Creative expression',   emoji: '🎨' },
  { id: 'meditation', dimension: 'seele',     de: 'Meditation / Gebet',      vi: 'Thiền / Cầu nguyện',         en: 'Meditation / Prayer',   emoji: '🧘' },
  { id: 'natur',      dimension: 'seele',     de: 'Natur',                   vi: 'Thiên nhiên',                 en: 'Nature',                emoji: '🌿' },
  { id: 'bedeutung',  dimension: 'seele',     de: 'Bedeutung erleben',       vi: 'Cảm nhận ý nghĩa sống',     en: 'Experience meaning',    emoji: '✨' },

  // 👥 Beziehung
  { id: 'ehrlichkeit', dimension: 'beziehung', de: 'Ehrlichkeit',            vi: 'Trung thực',                 en: 'Honesty',               emoji: '💯' },
  { id: 'grenzen',    dimension: 'beziehung', de: 'Grenzen',                 vi: 'Ranh giới',                   en: 'Boundaries',            emoji: '🚧' },
  { id: 'naehe',      dimension: 'beziehung', de: 'Nähe',                    vi: 'Gần gũi',                    en: 'Closeness',             emoji: '💑' },
  { id: 'raum',       dimension: 'beziehung', de: 'Raum',                    vi: 'Không gian riêng',           en: 'Space',                 emoji: '🌌' },
  { id: 'unterstuetzung', dimension: 'beziehung', de: 'Unterstützung',       vi: 'Được hỗ trợ',               en: 'Support',               emoji: '🤲' },
  { id: 'zuhoeren',   dimension: 'beziehung', de: 'Zuhören',                 vi: 'Được lắng nghe',             en: 'Being heard',           emoji: '👂' },
  { id: 'wertschaetzung', dimension: 'beziehung', de: 'Wertschätzung',       vi: 'Được trân trọng',            en: 'Appreciation',          emoji: '🌻' },
  { id: 'vergebung',  dimension: 'beziehung', de: 'Vergebung',               vi: 'Tha thứ',                    en: 'Forgiveness',           emoji: '🕊️' }
];

// ============================================================
// DIFFICULTY LEVELS
// ============================================================

const DIFFICULTIES = [
  {
    id: 'kids',
    emoji: '🧒',
    pairs: 6,
    peekSeconds: 3,
    categories: ['licht'],
    de: 'Kinder', vi: 'Trẻ em', en: 'Kids',
    desc: { de: '6 Paare · nur helle Gefühle · 3s Vorschau', vi: '6 cặp · cảm xúc tích cực · xem trước 3 giây', en: '6 pairs · bright feelings only · 3s peek' }
  },
  {
    id: 'easy',
    emoji: '🌿',
    pairs: 8,
    peekSeconds: 2,
    categories: ['licht', 'mitte'],
    de: 'Leicht', vi: 'Dễ', en: 'Easy',
    desc: { de: '8 Paare · Licht & Sanfte Mitte · 2s Vorschau', vi: '8 cặp · Ánh sáng & Dịu nhẹ · xem trước 2 giây', en: '8 pairs · Light & Gentle · 2s peek' }
  },
  {
    id: 'medium',
    emoji: '🌊',
    pairs: 12,
    peekSeconds: 0,
    categories: null,
    de: 'Mittel', vi: 'Trung bình', en: 'Medium',
    desc: { de: '12 Paare · alle Kategorien', vi: '12 cặp · tất cả', en: '12 pairs · all categories' }
  },
  {
    id: 'hard',
    emoji: '🔥',
    pairs: 20,
    peekSeconds: 0,
    categories: null,
    de: 'Schwer', vi: 'Khó', en: 'Hard',
    desc: { de: '20 Paare · alle Kategorien', vi: '20 cặp · tất cả', en: '20 pairs · all categories' }
  },
  {
    id: 'master',
    emoji: '🌑',
    pairs: 30,
    peekSeconds: 0,
    categories: null,
    de: 'Meister', vi: 'Bậc thầy', en: 'Master',
    desc: { de: '30 Paare · alle 67 Gefühle', vi: '30 cặp · tất cả 67 cảm xúc', en: '30 pairs · all 67 emotions' }
  }
];

// ============================================================
// LANGUAGES & UI TEXT
// ============================================================

const LANGUAGES = {
  de: { name: 'Deutsch',     flag: '🇩🇪' },
  vi: { name: 'Tiếng Việt',  flag: '🇻🇳' },
  en: { name: 'English',     flag: '🇬🇧' }
};

const UI_TEXT = {
  de: {
    title: 'Gefühle-Memory',
    subtitle: 'Finde die Paare — und sprich über deine Gefühle',
    moves: 'Züge',
    pairs: 'Paare',
    time: 'Zeit',
    newGame: 'Neues Spiel',
    modeClassic: 'Klassisch',
    modeStory: 'Geschichten',
    modeTalk: 'Gesprächsrunde',
    modeCheckin: 'Check-in',
    langLabel: 'Sprachen',
    pairFound: 'Paar gefunden!',
    promptIntro: 'Gesprächsimpuls:',
    congratsTitle: '🎉 Geschafft!',
    congratsText: 'Du hast alle Paare gefunden!',
    congratsStats: '{moves} Züge in {time}',
    playAgain: 'Nochmal spielen',
    storyIntro: 'Erzähl eine kurze Geschichte, in der diese Gefühle vorkommen:',
    talkIntro: 'Zieh eine Karte und erzähl davon:',
    drawCard: 'Karte ziehen',
    newCards: 'Neue Karten',
    allCategories: 'Alle Kategorien',
    share: 'Teilen',
    shareText: 'Ich spiele Gefühle-Memory — ein Spiel über Emotionen in {lang1} und {lang2}! 💛',
    checkinTitle: 'Was brauchst du heute?',
    checkinSubtitle: 'Wähle in jeder Dimension, was sich gerade richtig anfühlt.',
    todayIChoose: 'Heute wähle ich:',
    checkinDone: '🌿 Gut gemacht. Hör auf dich.',
    checkinReset: 'Neu beginnen'
  },
  vi: {
    title: 'Trò Chơi Cảm Xúc',
    subtitle: 'Tìm các cặp — và nói về cảm xúc của bạn',
    moves: 'Lượt',
    pairs: 'Cặp',
    time: 'Thời gian',
    newGame: 'Ván mới',
    modeClassic: 'Cổ điển',
    modeStory: 'Kể chuyện',
    modeTalk: 'Trò chuyện',
    modeCheckin: 'Tự vấn',
    langLabel: 'Ngôn ngữ',
    pairFound: 'Tìm được cặp!',
    promptIntro: 'Câu hỏi gợi ý:',
    congratsTitle: '🎉 Tuyệt vời!',
    congratsText: 'Bạn đã tìm được tất cả các cặp!',
    congratsStats: '{moves} lượt trong {time}',
    playAgain: 'Chơi lại',
    storyIntro: 'Kể một câu chuyện ngắn có những cảm xúc này:',
    talkIntro: 'Rút một thẻ và chia sẻ:',
    drawCard: 'Rút thẻ',
    newCards: 'Thẻ mới',
    allCategories: 'Tất cả',
    share: 'Chia sẻ',
    shareText: 'Tôi đang chơi Trò Chơi Cảm Xúc — trò chơi về cảm xúc bằng {lang1} và {lang2}! 💛',
    checkinTitle: 'Hôm nay bạn cần gì?',
    checkinSubtitle: 'Chọn trong mỗi chiều những gì cảm thấy phù hợp.',
    todayIChoose: 'Hôm nay tôi chọn:',
    checkinDone: '🌿 Tốt lắm. Hãy lắng nghe bản thân.',
    checkinReset: 'Bắt đầu lại'
  },
  en: {
    title: 'Feelings Memory',
    subtitle: 'Find the pairs — and talk about your feelings',
    moves: 'Moves',
    pairs: 'Pairs',
    time: 'Time',
    newGame: 'New Game',
    modeClassic: 'Classic',
    modeStory: 'Stories',
    modeTalk: 'Talk Round',
    modeCheckin: 'Check-in',
    langLabel: 'Languages',
    pairFound: 'Pair found!',
    promptIntro: 'Talk about it:',
    congratsTitle: '🎉 Well done!',
    congratsText: 'You found all the pairs!',
    congratsStats: '{moves} moves in {time}',
    playAgain: 'Play again',
    storyIntro: 'Tell a short story that includes these feelings:',
    talkIntro: 'Draw a card and share:',
    drawCard: 'Draw card',
    newCards: 'New cards',
    allCategories: 'All categories',
    share: 'Share',
    shareText: "I'm playing Feelings Memory — a game about emotions in {lang1} and {lang2}! 💛",
    checkinTitle: 'What do you need today?',
    checkinSubtitle: 'Choose what feels right in each dimension.',
    todayIChoose: 'Today I choose:',
    checkinDone: '🌿 Well done. Listen to yourself.',
    checkinReset: 'Start over'
  }
};
