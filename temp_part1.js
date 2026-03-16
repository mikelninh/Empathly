/**
 * Gefühle-Memory — Complete Card Data
 * Based on the original Gefühlsliste + Bedürfnisliste
 * 67 emotions in 6 categories + 40 needs in 5 dimensions
 * German + Vietnamese + English + Turkish + Arabic + Spanish + French + Ukrainian + Polish
 */

// ============================================================
// EMOTION CATEGORIES
// ============================================================

const CATEGORIES = [
  { id: 'licht',    emoji: '🌟', de: 'Licht & Weite',      vi: 'Ánh sáng & Sự rộng mở', en: 'Light & Expanse',    tr: 'Işık & Genişlik',     ar: 'نور و رحابة',          es: 'Luz & Amplitud',       fr: 'Lumière & Étendue',     uk: 'Світло & Простір',     pl: 'Światło & Przestrzeń',   color: '#F6C344', colorLight: '#FEF3D0' },
  { id: 'mitte',    emoji: '🌊', de: 'Sanfte Mitte',        vi: 'Trạng thái dịu nhẹ',    en: 'Gentle Middle',      tr: 'Yumuşak Orta',        ar: 'الوسط الهادئ',          es: 'Centro Suave',         fr: 'Milieu Doux',           uk: 'Лагідна Середина',     pl: 'Łagodny Środek',         color: '#7BAFD4', colorLight: '#DDE9F3' },
  { id: 'schwere',  emoji: '🌑', de: 'Schwere & Tiefe',     vi: 'Cảm xúc nặng nề',       en: 'Heavy & Deep',       tr: 'Ağırlık & Derinlik',  ar: 'ثقل و عمق',            es: 'Pesadez & Profundidad', fr: 'Lourdeur & Profondeur', uk: 'Тяжкість & Глибина',   pl: 'Ciężar & Głębia',        color: '#6B6570', colorLight: '#E0DCE3' },
  { id: 'sturm',    emoji: '🔥', de: 'Sturm & Reibung',     vi: 'Cảm xúc bùng cháy',     en: 'Storm & Friction',   tr: 'Fırtına & Sürtünme',  ar: 'عاصفة و احتكاك',        es: 'Tormenta & Fricción',  fr: 'Tempête & Friction',    uk: 'Буря & Тертя',         pl: 'Burza & Tarcie',          color: '#E74C3C', colorLight: '#FADBD8' },
  { id: 'angst',    emoji: '⚡', de: 'Angst & Schutz',      vi: 'Cảm xúc báo động',       en: 'Fear & Protection',  tr: 'Korku & Korunma',     ar: 'خوف و حماية',           es: 'Miedo & Protección',   fr: 'Peur & Protection',     uk: 'Страх & Захист',       pl: 'Lęk & Ochrona',          color: '#8E44AD', colorLight: '#E8DAEF' },
  { id: 'schatten', emoji: '🌘', de: 'Verdeckte Schatten',   vi: 'Bóng tối ẩn sâu',       en: 'Hidden Shadows',     tr: 'Gizli Gölgeler',      ar: 'ظلال خفية',             es: 'Sombras Ocultas',      fr: 'Ombres Cachées',        uk: 'Приховані Тіні',       pl: 'Ukryte Cienie',           color: '#5D6D7E', colorLight: '#D5D8DC' }
];

// ============================================================
// ALL 67 EMOTIONS
// ============================================================

const EMOTIONS = [
  // ── 🌟 Licht & Weite (14) ──────────────────────────────
  {
    id: 'freude', category: 'licht',
    de: 'Freude', vi: 'Niềm vui', en: 'Joy',
    tr: 'Sevinç', ar: 'فرح', es: 'Alegría', fr: 'Joie', uk: 'Радість', pl: 'Radość',
    emoji: '😊',
    prompt: {
      de: 'Wann hast du dich zuletzt richtig gefreut?',
      vi: 'Lần cuối bạn thật sự vui là khi nào?',
      en: 'When did you last feel real joy?',
      tr: 'En son ne zaman gerçekten sevindin?',
      ar: 'متى كانت آخر مرة شعرت فيها بفرح حقيقي؟',
      es: '¿Cuándo fue la última vez que sentiste verdadera alegría?',
      fr: 'Quand as-tu ressenti une vraie joie pour la dernière fois?',
      uk: 'Коли ти востаннє по-справжньому радів/раділа?',
      pl: 'Kiedy ostatnio naprawdę się ucieszyłeś/aś?'
    }
  },
  {
    id: 'dankbarkeit', category: 'licht',
    de: 'Dankbarkeit', vi: 'Lòng biết ơn', en: 'Gratitude',
    tr: 'Şükran', ar: 'امتنان', es: 'Gratitud', fr: 'Gratitude', uk: 'Вдячність', pl: 'Wdzięczność',
    emoji: '🙏',
    prompt: {
      de: 'Wofür bist du heute dankbar?',
      vi: 'Hôm nay bạn biết ơn điều gì?',
      en: 'What are you grateful for today?',
      tr: 'Bugün neye şükrediyorsun?',
      ar: 'على ماذا تشعر بالامتنان اليوم؟',
      es: '¿Por qué estás agradecido/a hoy?',
      fr: 'Pour quoi es-tu reconnaissant(e) aujourd\'hui?',
      uk: 'За що ти вдячний/вдячна сьогодні?',
      pl: 'Za co jesteś dziś wdzięczny/a?'
    }
  },
  {
    id: 'frieden', category: 'licht',
    de: 'Frieden', vi: 'Bình an', en: 'Peace',
    tr: 'Huzur', ar: 'سلام', es: 'Paz', fr: 'Paix', uk: 'Спокій', pl: 'Spokój',
    emoji: '🕊️',
    prompt: {
      de: 'Wann hast du dich zuletzt friedlich gefühlt?',
      vi: 'Lần cuối bạn cảm thấy bình yên là khi nào?',
      en: 'When did you last feel at peace?',
      tr: 'En son ne zaman huzurlu hissettin?',
      ar: 'متى شعرت بالسلام الداخلي آخر مرة؟',
      es: '¿Cuándo fue la última vez que te sentiste en paz?',
      fr: 'Quand t\'es-tu senti(e) en paix pour la dernière fois?',
      uk: 'Коли ти востаннє відчував/ла спокій?',
      pl: 'Kiedy ostatnio czułeś/aś spokój?'
    }
  },
  {
    id: 'leichtigkeit', category: 'licht',
    de: 'Leichtigkeit', vi: 'Nhẹ nhõm', en: 'Lightness',
    tr: 'Hafiflik', ar: 'خفة', es: 'Ligereza', fr: 'Légèreté', uk: 'Легкість', pl: 'Lekkość',
    emoji: '🎈',
    prompt: {
      de: 'Was gibt dir ein Gefühl von Leichtigkeit?',
      vi: 'Điều gì làm bạn cảm thấy nhẹ nhõm?',
      en: 'What gives you a feeling of lightness?',
      tr: 'Sana hafiflik hissi veren şey ne?',
      ar: 'ما الذي يمنحك شعوراً بالخفة؟',
      es: '¿Qué te da una sensación de ligereza?',
      fr: 'Qu\'est-ce qui te donne un sentiment de légèreté?',
      uk: 'Що дарує тобі відчуття легкості?',
      pl: 'Co daje ci poczucie lekkości?'
    }
  },
  {
    id: 'begeisterung', category: 'licht',
    de: 'Begeisterung', vi: 'Hứng khởi', en: 'Enthusiasm',
    tr: 'Coşku', ar: 'حماس', es: 'Entusiasmo', fr: 'Enthousiasme', uk: 'Захоплення', pl: 'Entuzjazm',
    emoji: '✨',
    prompt: {
      de: 'Was begeistert dich gerade?',
      vi: 'Điều gì đang làm bạn hứng khởi?',
      en: 'What excites you right now?',
      tr: 'Şu anda seni heyecanlandıran ne?',
      ar: 'ما الذي يثير حماسك الآن؟',
      es: '¿Qué te entusiasma en este momento?',
      fr: 'Qu\'est-ce qui t\'enthousiasme en ce moment?',
      uk: 'Що тебе зараз захоплює?',
      pl: 'Co cię teraz ekscytuje?'
    }
  },
  {
    id: 'zaertlichkeit', category: 'licht',
    de: 'Zärtlichkeit', vi: 'Dịu dàng', en: 'Tenderness',
    tr: 'Şefkat', ar: 'حنان', es: 'Ternura', fr: 'Tendresse', uk: 'Ніжність', pl: 'Czułość',
    emoji: '🤲',
    prompt: {
      de: 'Wann hast du zuletzt Zärtlichkeit gespürt?',
      vi: 'Lần cuối bạn cảm nhận sự dịu dàng là khi nào?',
      en: 'When did you last feel tenderness?',
      tr: 'En son ne zaman şefkat hissettin?',
      ar: 'متى شعرت بالحنان آخر مرة؟',
      es: '¿Cuándo sentiste ternura por última vez?',
      fr: 'Quand as-tu ressenti de la tendresse pour la dernière fois?',
      uk: 'Коли ти востаннє відчував/ла ніжність?',
      pl: 'Kiedy ostatnio poczułeś/aś czułość?'
    }
  },
  {
    id: 'verbundenheit', category: 'licht',
    de: 'Verbundenheit', vi: 'Gắn kết', en: 'Connection',
    tr: 'Bağlılık', ar: 'ترابط', es: 'Conexión', fr: 'Connexion', uk: 'Єднання', pl: 'Więź',
    emoji: '🔗',
    prompt: {
      de: 'Mit wem fühlst du dich verbunden?',
      vi: 'Bạn cảm thấy gắn kết với ai?',
      en: 'Who do you feel connected to?',
      tr: 'Kendini kime bağlı hissediyorsun?',
      ar: 'بمن تشعر بالترابط؟',
      es: '¿Con quién te sientes conectado/a?',
      fr: 'Avec qui te sens-tu connecté(e)?',
      uk: 'З ким ти відчуваєш єднання?',
      pl: 'Z kim czujesz się związany/a?'
    }
  },
  {
    id: 'liebe', category: 'licht',
    de: 'Liebe', vi: 'Tình yêu', en: 'Love',
    tr: 'Aşk', ar: 'حب', es: 'Amor', fr: 'Amour', uk: 'Любов', pl: 'Miłość',
    emoji: '❤️',
    prompt: {
      de: 'Was bedeutet Liebe für dich?',
      vi: 'Tình yêu có ý nghĩa gì với bạn?',
      en: 'What does love mean to you?',
      tr: 'Aşk senin için ne anlama geliyor?',
      ar: 'ماذا يعني الحب بالنسبة لك؟',
      es: '¿Qué significa el amor para ti?',
      fr: 'Que signifie l\'amour pour toi?',
      uk: 'Що для тебе означає любов?',
      pl: 'Co dla ciebie oznacza miłość?'
    }
  },
  {
    id: 'staunen', category: 'licht',
    de: 'Staunen', vi: 'Ngạc nhiên thích thú', en: 'Wonder',
    tr: 'Hayret', ar: 'دهشة', es: 'Asombro', fr: 'Émerveillement', uk: 'Подив', pl: 'Zdumienie',
    emoji: '🤩',
    prompt: {
      de: 'Was hat dich zuletzt zum Staunen gebracht?',
      vi: 'Điều gì gần đây khiến bạn ngạc nhiên thích thú?',
      en: 'What recently filled you with wonder?',
      tr: 'Son zamanlarda seni hayrete düşüren ne oldu?',
      ar: 'ما الذي أثار دهشتك مؤخراً؟',
      es: '¿Qué te llenó de asombro recientemente?',
      fr: 'Qu\'est-ce qui t\'a récemment émerveillé(e)?',
      uk: 'Що нещодавно тебе вразило?',
      pl: 'Co ostatnio wprawiło cię w zdumienie?'
    }
  },
  {
    id: 'vertrauen', category: 'licht',
    de: 'Vertrauen', vi: 'Tin tưởng', en: 'Trust',
    tr: 'Güven', ar: 'ثقة', es: 'Confianza', fr: 'Confiance', uk: 'Довіра', pl: 'Zaufanie',
    emoji: '🤝',
    prompt: {
      de: 'Wem vertraust du am meisten?',
      vi: 'Bạn tin tưởng ai nhất?',
      en: 'Who do you trust the most?',
      tr: 'En çok kime güveniyorsun?',
      ar: 'بمن تثق أكثر؟',
      es: '¿En quién confías más?',
      fr: 'En qui as-tu le plus confiance?',
      uk: 'Кому ти довіряєш найбільше?',
      pl: 'Komu ufasz najbardziej?'
    }
  },
  {
    id: 'hoffnung', category: 'licht',
    de: 'Hoffnung', vi: 'Hy vọng', en: 'Hope',
    tr: 'Umut', ar: 'أمل', es: 'Esperanza', fr: 'Espoir', uk: 'Надія', pl: 'Nadzieja',
    emoji: '🌱',
    prompt: {
      de: 'Worauf hoffst du gerade?',
      vi: 'Bạn đang hy vọng điều gì?',
      en: 'What are you hoping for?',
      tr: 'Şu anda neyi umut ediyorsun?',
      ar: 'فيمَ تأمل حالياً؟',
      es: '¿Qué estás esperando con ilusión?',
      fr: 'En quoi espères-tu en ce moment?',
      uk: 'На що ти зараз сподіваєшся?',
      pl: 'Na co teraz masz nadzieję?'
    }
  },
  {
    id: 'klarheit', category: 'licht',
    de: 'Klarheit', vi: 'Sự rõ ràng', en: 'Clarity',
    tr: 'Netlik', ar: 'وضوح', es: 'Claridad', fr: 'Clarté', uk: 'Ясність', pl: 'Jasność',
    emoji: '💎',
    prompt: {
      de: 'Wann hattest du zuletzt einen Moment der Klarheit?',
      vi: 'Khi nào bạn có khoảnh khắc rõ ràng gần đây nhất?',
      en: 'When did you last have a moment of clarity?',
      tr: 'En son ne zaman bir netlik anı yaşadın?',
      ar: 'متى كانت آخر لحظة وضوح عشتها؟',
      es: '¿Cuándo tuviste tu último momento de claridad?',
      fr: 'Quand as-tu eu un moment de clarté pour la dernière fois?',
      uk: 'Коли ти востаннє відчув/ла момент ясності?',
      pl: 'Kiedy ostatnio miałeś/aś chwilę jasności?'
    }
  },
  {
    id: 'freiheit', category: 'licht',
    de: 'Freiheit', vi: 'Tự do', en: 'Freedom',
    tr: 'Özgürlük', ar: 'حرية', es: 'Libertad', fr: 'Liberté', uk: 'Свобода', pl: 'Wolność',
    emoji: '🦅',
    prompt: {
      de: 'Was bedeutet Freiheit für dich?',
      vi: 'Tự do có ý nghĩa gì với bạn?',
      en: 'What does freedom mean to you?',
      tr: 'Özgürlük senin için ne anlama geliyor?',
      ar: 'ماذا تعني الحرية بالنسبة لك؟',
      es: '¿Qué significa la libertad para ti?',
      fr: 'Que signifie la liberté pour toi?',
      uk: 'Що для тебе означає свобода?',
      pl: 'Co dla ciebie oznacza wolność?'
    }
  },
  {
    id: 'ehrfurcht', category: 'licht',
    de: 'Ehrfurcht', vi: 'Kính trọng sâu sắc', en: 'Awe',
    tr: 'Huşu', ar: 'رهبة', es: 'Reverencia', fr: 'Révérence', uk: 'Благоговіння', pl: 'Trwoga',
    emoji: '🌌',
    prompt: {
      de: 'Was erfüllt dich mit Ehrfurcht?',
      vi: 'Điều gì khiến bạn kính sợ thiêng liêng?',
      en: 'What fills you with awe?',
      tr: 'Seni huşu ile dolduran şey ne?',
      ar: 'ما الذي يملؤك بالرهبة؟',
      es: '¿Qué te llena de reverencia?',
      fr: 'Qu\'est-ce qui te remplit de révérence?',
      uk: 'Що наповнює тебе благоговінням?',
      pl: 'Co napełnia cię trwogą?'
    }
  },

  // ── 🌊 Sanfte Mitte (13) ──────────────────────────────
  {
    id: 'zufriedenheit', category: 'mitte',
    de: 'Zufriedenheit', vi: 'Hài lòng', en: 'Contentment',
    tr: 'Memnuniyet', ar: 'رضا', es: 'Satisfacción', fr: 'Contentement', uk: 'Задоволення', pl: 'Zadowolenie',
    emoji: '😌',
    prompt: {
      de: 'Wann bist du zufrieden mit dem, was ist?',
      vi: 'Khi nào bạn hài lòng với những gì đang có?',
      en: 'When are you content with what is?',
      tr: 'Ne zaman olduğun haliyle memnunsun?',
      ar: 'متى تكون راضياً بما هو موجود؟',
      es: '¿Cuándo estás satisfecho/a con lo que hay?',
      fr: 'Quand es-tu content(e) de ce qui est?',
      uk: 'Коли ти задоволений/задоволена тим, що є?',
      pl: 'Kiedy jesteś zadowolony/a z tego, co jest?'
    }
  },
  {
    id: 'melancholie', category: 'mitte',
    de: 'Melancholie', vi: 'Man mác buồn', en: 'Melancholy',
    tr: 'Melankoli', ar: 'كآبة', es: 'Melancolía', fr: 'Mélancolie', uk: 'Меланхолія', pl: 'Melancholia',
    emoji: '🌧️',
    prompt: {
      de: 'Gibt es eine schöne Traurigkeit, die du kennst?',
      vi: 'Có nỗi buồn đẹp nào bạn từng cảm nhận không?',
      en: 'Is there a beautiful sadness you know?',
      tr: 'Tanıdığın güzel bir hüzün var mı?',
      ar: 'هل هناك حزن جميل تعرفه؟',
      es: '¿Conoces una tristeza hermosa?',
      fr: 'Connais-tu une belle tristesse?',
      uk: 'Чи знаєш ти красивий сум?',
      pl: 'Czy znasz piękny smutek?'
    }
  },
  {
    id: 'nachdenklichkeit', category: 'mitte',
    de: 'Nachdenklichkeit', vi: 'Trầm tư', en: 'Thoughtfulness',
    tr: 'Düşüncelilik', ar: 'تأمل', es: 'Reflexión', fr: 'Réflexion', uk: 'Задумливість', pl: 'Zamyślenie',
    emoji: '🤔',
    prompt: {
      de: 'Worüber denkst du in letzter Zeit viel nach?',
      vi: 'Gần đây bạn suy nghĩ nhiều về điều gì?',
      en: 'What have you been thinking about lately?',
      tr: 'Son zamanlarda çok düşündüğün şey ne?',
      ar: 'فيمَ تفكر كثيراً مؤخراً؟',
      es: '¿Sobre qué has estado reflexionando últimamente?',
      fr: 'À quoi penses-tu beaucoup ces derniers temps?',
      uk: 'Про що ти багато думаєш останнім часом?',
      pl: 'O czym ostatnio dużo myślisz?'
    }
  },
  {
    id: 'sehnsucht', category: 'mitte',
    de: 'Sehnsucht', vi: 'Nhớ nhung', en: 'Longing',
    tr: 'Özlem', ar: 'شوق', es: 'Anhelo', fr: 'Nostalgie', uk: 'Туга', pl: 'Tęsknota',
    emoji: '🥺',
    prompt: {
      de: 'Nach wem oder was sehnst du dich?',
      vi: 'Bạn nhớ nhung ai hoặc điều gì?',
      en: 'Who or what do you long for?',
      tr: 'Kimi ya da neyi özlüyorsun?',
      ar: 'إلى من أو ماذا تشتاق؟',
      es: '¿A quién o qué anhelas?',
      fr: 'Qui ou quoi te manque?',
      uk: 'За ким або за чим ти сумуєш?',
      pl: 'Za kim lub czym tęsknisz?'
    }
  },
  {
    id: 'sensibilitaet', category: 'mitte',
    de: 'Sensibilität', vi: 'Nhạy cảm', en: 'Sensitivity',
    tr: 'Hassasiyet', ar: 'حساسية', es: 'Sensibilidad', fr: 'Sensibilité', uk: 'Чутливість', pl: 'Wrażliwość',
    emoji: '🦋',
    prompt: {
      de: 'Wann merkst du, dass du besonders sensibel bist?',
      vi: 'Khi nào bạn nhận ra mình đặc biệt nhạy cảm?',
      en: 'When do you notice you are especially sensitive?',
      tr: 'Ne zaman özellikle hassas olduğunu fark ediyorsun?',
      ar: 'متى تلاحظ أنك حساس بشكل خاص؟',
      es: '¿Cuándo notas que eres especialmente sensible?',
      fr: 'Quand remarques-tu que tu es particulièrement sensible?',
      uk: 'Коли ти помічаєш, що ти особливо чутливий/а?',
      pl: 'Kiedy zauważasz, że jesteś szczególnie wrażliwy/a?'
    }
  },
  {
    id: 'nostalgie', category: 'mitte',
    de: 'Nostalgie', vi: 'Hoài niệm', en: 'Nostalgia',
    tr: 'Nostalji', ar: 'حنين', es: 'Nostalgia', fr: 'Nostalgie', uk: 'Ностальгія', pl: 'Nostalgia',
    emoji: '📷',
    prompt: {
      de: 'Welche Erinnerung wärmt dein Herz?',
      vi: 'Kỷ niệm nào sưởi ấm trái tim bạn?',
      en: 'Which memory warms your heart?',
      tr: 'Hangi anı kalbini ısıtıyor?',
      ar: 'أي ذكرى تدفئ قلبك؟',
      es: '¿Qué recuerdo calienta tu corazón?',
      fr: 'Quel souvenir réchauffe ton cœur?',
      uk: 'Який спогад зігріває твоє серце?',
      pl: 'Które wspomnienie ogrzewa twoje serce?'
    }
  },
  {
    id: 'offenheit', category: 'mitte',
    de: 'Offenheit', vi: 'Cởi mở', en: 'Openness',
    tr: 'Açıklık', ar: 'انفتاح', es: 'Apertura', fr: 'Ouverture', uk: 'Відкритість', pl: 'Otwartość',
    emoji: '🚪',
    prompt: {
      de: 'Für was bist du gerade offen?',
      vi: 'Bạn đang cởi mở với điều gì?',
      en: 'What are you open to right now?',
      tr: 'Şu anda neye açıksın?',
      ar: 'لماذا أنت منفتح حالياً؟',
      es: '¿A qué estás abierto/a ahora mismo?',
      fr: 'À quoi es-tu ouvert(e) en ce moment?',
      uk: 'До чого ти зараз відкритий/а?',
      pl: 'Na co jesteś teraz otwarty/a?'
    }
  },
  {
    id: 'verletzlichkeit', category: 'mitte',
    de: 'Verletzlichkeit', vi: 'Dễ tổn thương', en: 'Vulnerability',
    tr: 'Kırılganlık', ar: 'هشاشة', es: 'Vulnerabilidad', fr: 'Vulnérabilité', uk: 'Вразливість', pl: 'Wrażliwość',
    emoji: '🫧',
    prompt: {
      de: 'Wann hast du dich zuletzt verletzlich gezeigt?',
      vi: 'Lần cuối bạn cho thấy sự dễ tổn thương là khi nào?',
      en: 'When did you last show your vulnerability?',
      tr: 'En son ne zaman kırılganlığını gösterdin?',
      ar: 'متى أظهرت هشاشتك آخر مرة؟',
      es: '¿Cuándo mostraste tu vulnerabilidad por última vez?',
      fr: 'Quand as-tu montré ta vulnérabilité pour la dernière fois?',
      uk: 'Коли ти востаннє показав/ла свою вразливість?',
      pl: 'Kiedy ostatnio okazałeś/aś swoją wrażliwość?'
    }
  },
  {
    id: 'muedigkeit', category: 'mitte',
    de: 'Müdigkeit', vi: 'Mệt mỏi', en: 'Tiredness',
    tr: 'Yorgunluk', ar: 'تعب', es: 'Cansancio', fr: 'Fatigue', uk: 'Втома', pl: 'Zmęczenie',
    emoji: '😴',
    prompt: {
      de: 'Was macht dich müde — und was gibt dir Energie?',
      vi: 'Điều gì làm bạn mệt — và điều gì cho bạn năng lượng?',
      en: 'What tires you — and what gives you energy?',
      tr: 'Seni ne yoruyor — ve ne enerji veriyor?',
      ar: 'ما الذي يُتعبك — وما الذي يمنحك الطاقة؟',
      es: '¿Qué te cansa — y qué te da energía?',
      fr: 'Qu\'est-ce qui te fatigue — et qu\'est-ce qui te donne de l\'énergie?',
      uk: 'Що тебе втомлює — а що дає енергію?',
      pl: 'Co cię męczy — a co daje energię?'
    }
  },
  {
    id: 'langeweile', category: 'mitte',
    de: 'Langeweile', vi: 'Chán chường', en: 'Boredom',
    tr: 'Can sıkıntısı', ar: 'ملل', es: 'Aburrimiento', fr: 'Ennui', uk: 'Нудьга', pl: 'Nuda',
    emoji: '🥱',
    prompt: {
      de: 'Kann Langeweile auch etwas Gutes sein?',
      vi: 'Sự chán có thể là điều tốt không?',
      en: 'Can boredom be a good thing?',
      tr: 'Can sıkıntısı iyi bir şey olabilir mi?',
      ar: 'هل يمكن أن يكون الملل شيئاً جيداً؟',
      es: '¿Puede el aburrimiento ser algo bueno?',
      fr: 'L\'ennui peut-il être une bonne chose?',
      uk: 'Чи може нудьга бути чимось добрим?',
      pl: 'Czy nuda może być czymś dobrym?'
    }
  },
  {
    id: 'neutralitaet', category: 'mitte',
    de: 'Neutralität', vi: 'Trung tính', en: 'Neutrality',
    tr: 'Tarafsızlık', ar: 'حياد', es: 'Neutralidad', fr: 'Neutralité', uk: 'Нейтральність', pl: 'Neutralność',
    emoji: '⚖️',
    prompt: {
      de: 'Wie fühlt es sich an, einfach nichts zu fühlen?',
      vi: 'Không cảm thấy gì cả thì có cảm giác như thế nào?',
      en: 'What does it feel like to feel nothing?',
      tr: 'Hiçbir şey hissetmemek nasıl bir duygu?',
      ar: 'كيف يبدو الشعور بعدم الشعور بشيء؟',
      es: '¿Cómo se siente no sentir nada?',
      fr: 'Quel effet ça fait de ne rien ressentir?',
      uk: 'Як це — нічого не відчувати?',
      pl: 'Jak to jest — nic nie czuć?'
    }
  },
  {
    id: 'beduerfnis', category: 'mitte',
    de: 'Bedürftigkeit', vi: 'Cần được quan tâm', en: 'Neediness',
    tr: 'Muhtaçlık', ar: 'احتياج', es: 'Necesidad', fr: 'Besoin', uk: 'Потреба', pl: 'Potrzeba',
    emoji: '🫶',
    prompt: {
      de: 'Was brauchst du gerade am meisten?',
      vi: 'Lúc này bạn cần điều gì nhất?',
      en: 'What do you need most right now?',
      tr: 'Şu anda en çok neye ihtiyacın var?',
      ar: 'ما أكثر شيء تحتاجه الآن؟',
      es: '¿Qué es lo que más necesitas ahora mismo?',
      fr: 'De quoi as-tu le plus besoin en ce moment?',
      uk: 'Що тобі зараз найбільше потрібно?',
      pl: 'Czego teraz najbardziej potrzebujesz?'
    }
  },
  {
    id: 'weichheit', category: 'mitte',
    de: 'Weichheit', vi: 'Mềm mỏng', en: 'Softness',
    tr: 'Yumuşaklık', ar: 'لين', es: 'Suavidad', fr: 'Douceur', uk: 'М\'якість', pl: 'Miękkość',
    emoji: '☁️',
    prompt: {
      de: 'Wann erlaubst du dir, weich zu sein?',
      vi: 'Khi nào bạn cho phép mình mềm mỏng?',
      en: 'When do you allow yourself to be soft?',
      tr: 'Ne zaman kendine yumuşak olmayı izin veriyorsun?',
      ar: 'متى تسمح لنفسك بأن تكون ليناً؟',
      es: '¿Cuándo te permites ser suave?',
      fr: 'Quand te permets-tu d\'être doux/douce?',
      uk: 'Коли ти дозволяєш собі бути м\'яким/м\'якою?',
      pl: 'Kiedy pozwalasz sobie być miękkim/ą?'
    }
  },

  // ── 🌑 Schwere & Tiefe (12) ──────────────────────────────
  {
    id: 'traurigkeit', category: 'schwere',
    de: 'Traurigkeit', vi: 'Buồn bã', en: 'Sadness',
    tr: 'Üzüntü', ar: 'حزن', es: 'Tristeza', fr: 'Tristesse', uk: 'Сум', pl: 'Smutek',
    emoji: '😢',
    prompt: {
      de: 'Was macht dich manchmal traurig?',
      vi: 'Điều gì đôi khi làm bạn buồn?',
      en: 'What sometimes makes you sad?',
      tr: 'Bazen seni ne üzüyor?',
      ar: 'ما الذي يحزنك أحياناً؟',
      es: '¿Qué te entristece a veces?',
      fr: 'Qu\'est-ce qui te rend parfois triste?',
      uk: 'Що тебе іноді засмучує?',
      pl: 'Co cię czasem smuci?'
    }
  },
  {
    id: 'einsamkeit', category: 'schwere',
    de: 'Einsamkeit', vi: 'Cô đơn', en: 'Loneliness',
    tr: 'Yalnızlık', ar: 'وحدة', es: 'Soledad', fr: 'Solitude', uk: 'Самотність', pl: 'Samotność',
    emoji: '🌙',
    prompt: {
      de: 'Wann fühlst du dich einsam?',
      vi: 'Khi nào bạn cảm thấy cô đơn?',
      en: 'When do you feel lonely?',
      tr: 'Ne zaman yalnız hissediyorsun?',
      ar: 'متى تشعر بالوحدة؟',
      es: '¿Cuándo te sientes solo/a?',
      fr: 'Quand te sens-tu seul(e)?',
      uk: 'Коли ти відчуваєш самотність?',
      pl: 'Kiedy czujesz się samotny/a?'
    }
  },
  {
    id: 'enttaeuschung', category: 'schwere',
    de: 'Enttäuschung', vi: 'Thất vọng', en: 'Disappointment',
    tr: 'Hayal kırıklığı', ar: 'خيبة أمل', es: 'Decepción', fr: 'Déception', uk: 'Розчарування', pl: 'Rozczarowanie',
    emoji: '😞',
    prompt: {
      de: 'Wann hat dich zuletzt jemand enttäuscht?',
      vi: 'Lần cuối ai đó làm bạn thất vọng là khi nào?',
      en: 'When did someone last disappoint you?',
      tr: 'En son seni kim hayal kırıklığına uğrattı?',
      ar: 'متى خيّبك أحد آخر مرة؟',
      es: '¿Cuándo te decepcionó alguien por última vez?',
      fr: 'Quand quelqu\'un t\'a-t-il déçu(e) pour la dernière fois?',
      uk: 'Коли тебе востаннє хтось розчарував?',
      pl: 'Kiedy ostatnio ktoś cię rozczarował?'
    }
  },
  {
    id: 'hilflosigkeit', category: 'schwere',
    de: 'Hilflosigkeit', vi: 'Bất lực', en: 'Helplessness',
    tr: 'Çaresizlik', ar: 'عجز', es: 'Impotencia', fr: 'Impuissance', uk: 'Безпорадність', pl: 'Bezradność',
    emoji: '😶',
    prompt: {
      de: 'Wann hast du dich hilflos gefühlt?',
      vi: 'Khi nào bạn cảm thấy bất lực?',
      en: 'When did you feel helpless?',
      tr: 'Ne zaman çaresiz hissettin?',
      ar: 'متى شعرت بالعجز؟',
      es: '¿Cuándo te sentiste impotente?',
      fr: 'Quand t\'es-tu senti(e) impuissant(e)?',
      uk: 'Коли ти відчував/ла безпорадність?',
      pl: 'Kiedy czułeś/aś się bezradny/a?'
    }
  },
  {
    id: 'ueberforderung', category: 'schwere',
    de: 'Überforderung', vi: 'Quá tải', en: 'Overwhelm',
    tr: 'Bunalmışlık', ar: 'إرهاق', es: 'Agobio', fr: 'Surcharge', uk: 'Перевантаження', pl: 'Przeciążenie',
    emoji: '🤯',
    prompt: {
      de: 'Was überwältigt dich manchmal?',
      vi: 'Điều gì đôi khi làm bạn quá tải?',
      en: 'What overwhelms you sometimes?',
      tr: 'Bazen seni bunaltan şey ne?',
      ar: 'ما الذي يُرهقك أحياناً؟',
      es: '¿Qué te agobia a veces?',
      fr: 'Qu\'est-ce qui te submerge parfois?',
      uk: 'Що тебе іноді перевантажує?',
      pl: 'Co cię czasem przytłacza?'
    }
  },
  {
    id: 'ohnmacht', category: 'schwere',
    de: 'Ohnmacht', vi: 'Bất lực hoàn toàn', en: 'Powerlessness',
    tr: 'Güçsüzlük', ar: 'عجز تام', es: 'Impotencia total', fr: 'Impuissance totale', uk: 'Безсилля', pl: 'Bezsilność',
    emoji: '🕳️',
    prompt: {
      de: 'Gab es einen Moment, wo du gar nichts tun konntest?',
      vi: 'Có khoảnh khắc nào bạn không thể làm gì không?',
      en: 'Was there a moment you could do nothing at all?',
      tr: 'Hiçbir şey yapamadığın bir an oldu mu?',
      ar: 'هل كانت هناك لحظة لم تستطع فيها فعل أي شيء؟',
      es: '¿Hubo un momento en que no pudiste hacer nada?',
      fr: 'Y a-t-il eu un moment où tu ne pouvais rien faire?',
      uk: 'Чи був момент, коли ти нічого не міг/могла зробити?',
      pl: 'Czy był moment, gdy nie mogłeś/aś nic zrobić?'
    }
  },
  {
    id: 'scham', category: 'schwere',
    de: 'Scham', vi: 'Xấu hổ', en: 'Shame',
    tr: 'Utanç', ar: 'خجل', es: 'Vergüenza', fr: 'Honte', uk: 'Сором', pl: 'Wstyd',
    emoji: '😳',
    prompt: {
      de: 'Worüber schämst du dich — und solltest du das wirklich?',
      vi: 'Bạn xấu hổ về điều gì — và bạn có nên vậy không?',
      en: 'What shames you — and should it really?',
      tr: 'Neden utanıyorsun — ve gerçekten utanmalı mısın?',
      ar: 'مما تخجل — وهل يجب عليك ذلك حقاً؟',
      es: '¿De qué te avergüenzas — y deberías realmente?',
      fr: 'De quoi as-tu honte — et le devrais-tu vraiment?',
      uk: 'Чого ти соромишся — і чи варто?',
      pl: 'Czego się wstydzisz — i czy naprawdę powinieneś/aś?'
    }
  },
