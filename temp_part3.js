
// ============================================================
// NEEDS — 5 Dimensions, 8 each (40 total)
// ============================================================

const NEED_DIMENSIONS = [
  { id: 'koerper',   emoji: '🧍', de: 'Körper',    vi: 'Cơ thể',      en: 'Body',          tr: 'Beden',      ar: 'الجسد',      es: 'Cuerpo',    fr: 'Corps',      uk: 'Тіло',       pl: 'Ciało',       question: { de: 'Was braucht mein Körper jetzt?', vi: 'Cơ thể tôi cần gì lúc này?', en: 'What does my body need right now?', tr: 'Bedenim şu anda neye ihtiyaç duyuyor?', ar: 'ماذا يحتاج جسدي الآن؟', es: '¿Qué necesita mi cuerpo ahora?', fr: 'De quoi mon corps a-t-il besoin maintenant?', uk: 'Що зараз потребує моє тіло?', pl: 'Czego teraz potrzebuje moje ciało?' } },
  { id: 'herz',      emoji: '💛', de: 'Herz',      vi: 'Trái tim',     en: 'Heart',         tr: 'Kalp',       ar: 'القلب',      es: 'Corazón',   fr: 'Cœur',       uk: 'Серце',      pl: 'Serce',       question: { de: 'Was braucht mein emotionales Selbst?', vi: 'Trái tim tôi cần gì?', en: 'What does my emotional self need?', tr: 'Duygusal benliğimin neye ihtiyacı var?', ar: 'ماذا يحتاج ذاتي العاطفية؟', es: '¿Qué necesita mi ser emocional?', fr: 'De quoi mon moi émotionnel a-t-il besoin?', uk: 'Що потребує моє емоційне «я»?', pl: 'Czego potrzebuje moje emocjonalne ja?' } },
  { id: 'geist',     emoji: '🧠', de: 'Geist',     vi: 'Tâm trí',      en: 'Mind',          tr: 'Zihin',      ar: 'العقل',      es: 'Mente',     fr: 'Esprit',     uk: 'Розум',      pl: 'Umysł',       question: { de: 'Was braucht mein Denken?', vi: 'Tâm trí tôi cần gì?', en: 'What does my mind need?', tr: 'Zihnim neye ihtiyaç duyuyor?', ar: 'ماذا يحتاج عقلي؟', es: '¿Qué necesita mi mente?', fr: 'De quoi mon esprit a-t-il besoin?', uk: 'Що потребує мій розум?', pl: 'Czego potrzebuje mój umysł?' } },
  { id: 'seele',     emoji: '🔮', de: 'Seele',     vi: 'Tâm hồn',      en: 'Soul',          tr: 'Ruh',        ar: 'الروح',      es: 'Alma',      fr: 'Âme',        uk: 'Душа',       pl: 'Dusza',       question: { de: 'Was ruft mich von innen?', vi: 'Tâm hồn tôi khao khát gì?', en: 'What calls me from within?', tr: 'İçimden beni ne çağırıyor?', ar: 'ما الذي يناديني من الداخل؟', es: '¿Qué me llama desde dentro?', fr: 'Qu\'est-ce qui m\'appelle de l\'intérieur?', uk: 'Що кличе мене зсередини?', pl: 'Co woła mnie od wewnątrz?' } },
  { id: 'beziehung', emoji: '👥', de: 'Beziehung', vi: 'Mối quan hệ', en: 'Relationship',  tr: 'İlişki',     ar: 'العلاقات',   es: 'Relación',  fr: 'Relation',   uk: 'Стосунки',   pl: 'Relacja',     question: { de: 'Was brauche ich von anderen?', vi: 'Tôi cần gì trong mối quan hệ?', en: 'What do I need from others?', tr: 'Başkalarından neye ihtiyacım var?', ar: 'ماذا أحتاج من الآخرين؟', es: '¿Qué necesito de los demás?', fr: 'De quoi ai-je besoin des autres?', uk: 'Що мені потрібно від інших?', pl: 'Czego potrzebuję od innych?' } }
];

const NEEDS = [
  // 🧍 Körper
  { id: 'ruhe',       dimension: 'koerper',   de: 'Ruhe / Schlaf',           vi: 'Nghỉ ngơi / Ngủ',           en: 'Rest / Sleep',          tr: 'Dinlenme / Uyku',          ar: 'راحة / نوم',              es: 'Descanso / Sueño',         fr: 'Repos / Sommeil',          uk: 'Відпочинок / Сон',         pl: 'Odpoczynek / Sen',          emoji: '😴' },
  { id: 'bewegung',   dimension: 'koerper',   de: 'Bewegung / Dehnung',      vi: 'Vận động / Giãn cơ',        en: 'Movement / Stretching', tr: 'Hareket / Esneme',         ar: 'حركة / تمدد',             es: 'Movimiento / Estiramiento', fr: 'Mouvement / Étirement',   uk: 'Рух / Розтяжка',           pl: 'Ruch / Rozciąganie',        emoji: '🏃' },
  { id: 'beruehrung', dimension: 'koerper',   de: 'Berührung / Nähe',        vi: 'Chạm / Gần gũi',            en: 'Touch / Closeness',     tr: 'Dokunuş / Yakınlık',       ar: 'لمس / قرب',               es: 'Tacto / Cercanía',         fr: 'Toucher / Proximité',      uk: 'Дотик / Близькість',       pl: 'Dotyk / Bliskość',          emoji: '🤗' },
  { id: 'nahrung',    dimension: 'koerper',   de: 'Nährende Nahrung',        vi: 'Thức ăn bổ dưỡng',          en: 'Nourishing food',       tr: 'Besleyici yiyecek',        ar: 'غذاء مغذٍ',               es: 'Alimento nutritivo',       fr: 'Nourriture saine',         uk: 'Поживна їжа',              pl: 'Pożywne jedzenie',          emoji: '🥗' },
  { id: 'wasser',     dimension: 'koerper',   de: 'Wasser / Hydration',      vi: 'Uống nước',                  en: 'Water / Hydration',     tr: 'Su / Hidrasyon',           ar: 'ماء / ترطيب',             es: 'Agua / Hidratación',       fr: 'Eau / Hydratation',        uk: 'Вода / Гідратація',        pl: 'Woda / Nawodnienie',        emoji: '💧' },
  { id: 'luft',       dimension: 'koerper',   de: 'Frische Luft',            vi: 'Không khí trong lành',       en: 'Fresh air',             tr: 'Temiz hava',               ar: 'هواء نقي',                es: 'Aire fresco',              fr: 'Air frais',                uk: 'Свіже повітря',            pl: 'Świeże powietrze',          emoji: '🌬️' },
  { id: 'atmen',      dimension: 'koerper',   de: 'Langsames Atmen',         vi: 'Thở chậm',                   en: 'Slow breathing',        tr: 'Yavaş nefes alma',         ar: 'تنفس بطيء',               es: 'Respiración lenta',        fr: 'Respiration lente',        uk: 'Повільне дихання',         pl: 'Wolne oddychanie',          emoji: '🫁' },
  { id: 'waerme',     dimension: 'koerper',   de: 'Wärme / Bad / Tee',       vi: 'Sự ấm áp / Tắm / Trà nóng', en: 'Warmth / Bath / Tea',   tr: 'Sıcaklık / Banyo / Çay',   ar: 'دفء / حمام / شاي',        es: 'Calidez / Baño / Té',      fr: 'Chaleur / Bain / Thé',     uk: 'Тепло / Ванна / Чай',      pl: 'Ciepło / Kąpiel / Herbata', emoji: '☕' },

  // 💛 Herz
  { id: 'gesehen',    dimension: 'herz',      de: 'Gesehen werden',          vi: 'Được thấu hiểu',             en: 'Being seen',            tr: 'Görülmek',                 ar: 'أن يُرى',                 es: 'Ser visto/a',              fr: 'Être vu(e)',               uk: 'Бути поміченим',           pl: 'Być widzianym',             emoji: '👁️' },
  { id: 'liebe_n',    dimension: 'herz',      de: 'Zärtlichkeit / Liebe',    vi: 'Yêu thương / Âu yếm',       en: 'Tenderness / Love',     tr: 'Şefkat / Sevgi',           ar: 'حنان / حب',               es: 'Ternura / Amor',           fr: 'Tendresse / Amour',        uk: 'Ніжність / Любов',         pl: 'Czułość / Miłość',          emoji: '💕' },
  { id: 'trost',      dimension: 'herz',      de: 'Trost',                   vi: 'An ủi',                      en: 'Comfort',               tr: 'Teselli',                  ar: 'عزاء',                    es: 'Consuelo',                 fr: 'Réconfort',                uk: 'Розрада',                  pl: 'Pocieszenie',               emoji: '🫂' },
  { id: 'spiel',      dimension: 'herz',      de: 'Freude / Spiel',          vi: 'Niềm vui / Vui đùa',        en: 'Joy / Play',            tr: 'Neşe / Oyun',             ar: 'فرح / لعب',               es: 'Alegría / Juego',          fr: 'Joie / Jeu',              uk: 'Радість / Гра',            pl: 'Radość / Zabawa',           emoji: '🎈' },
  { id: 'lachen',     dimension: 'herz',      de: 'Lachen',                  vi: 'Cười',                        en: 'Laughter',              tr: 'Gülmek',                   ar: 'ضحك',                     es: 'Risa',                     fr: 'Rire',                     uk: 'Сміх',                     pl: 'Śmiech',                    emoji: '😂' },
  { id: 'dank_ausdruck', dimension: 'herz',   de: 'Dankbarkeit ausdrücken',  vi: 'Bày tỏ lòng biết ơn',       en: 'Express gratitude',     tr: 'Şükranı ifade etmek',     ar: 'التعبير عن الامتنان',      es: 'Expresar gratitud',        fr: 'Exprimer sa gratitude',    uk: 'Висловити вдячність',      pl: 'Wyrazić wdzięczność',       emoji: '🙏' },
  { id: 'weinen',     dimension: 'herz',      de: 'Weinen dürfen',           vi: 'Được khóc',                   en: 'Permission to cry',     tr: 'Ağlayabilmek',             ar: 'الإذن بالبكاء',            es: 'Permiso para llorar',      fr: 'Permission de pleurer',    uk: 'Дозвіл плакати',           pl: 'Pozwolenie na płacz',       emoji: '💧' },
  { id: 'sicherheit', dimension: 'herz',      de: 'Sicherheit',              vi: 'Cảm giác an toàn',           en: 'Safety',                tr: 'Güvenlik',                 ar: 'أمان',                    es: 'Seguridad',                fr: 'Sécurité',                 uk: 'Безпека',                  pl: 'Bezpieczeństwo',            emoji: '🛡️' },

  // 🧠 Geist
  { id: 'geist_klarheit', dimension: 'geist', de: 'Klarheit',                vi: 'Rõ ràng',                    en: 'Clarity',               tr: 'Netlik',                   ar: 'وضوح',                    es: 'Claridad',                 fr: 'Clarté',                   uk: 'Ясність',                 pl: 'Jasność',                   emoji: '💎' },
  { id: 'stille',     dimension: 'geist',     de: 'Stille',                  vi: 'Tĩnh lặng',                  en: 'Silence',               tr: 'Sessizlik',                ar: 'صمت',                     es: 'Silencio',                 fr: 'Silence',                  uk: 'Тиша',                    pl: 'Cisza',                     emoji: '🤫' },
  { id: 'fokus',      dimension: 'geist',     de: 'Fokus',                   vi: 'Tập trung',                   en: 'Focus',                 tr: 'Odaklanma',                ar: 'تركيز',                   es: 'Enfoque',                  fr: 'Concentration',            uk: 'Фокус',                   pl: 'Skupienie',                 emoji: '🎯' },
  { id: 'inspiration', dimension: 'geist',    de: 'Inspiration',             vi: 'Cảm hứng',                   en: 'Inspiration',           tr: 'İlham',                    ar: 'إلهام',                   es: 'Inspiración',              fr: 'Inspiration',              uk: 'Натхнення',               pl: 'Inspiracja',                emoji: '💡' },
  { id: 'ordnung',    dimension: 'geist',     de: 'Struktur / Ordnung',      vi: 'Trật tự / Sắp xếp',         en: 'Structure / Order',     tr: 'Yapı / Düzen',             ar: 'هيكل / نظام',             es: 'Estructura / Orden',       fr: 'Structure / Ordre',        uk: 'Структура / Порядок',      pl: 'Struktura / Porządek',      emoji: '📋' },
  { id: 'lernen',     dimension: 'geist',     de: 'Lernen',                  vi: 'Học hỏi',                    en: 'Learning',              tr: 'Öğrenmek',                 ar: 'تعلم',                    es: 'Aprendizaje',              fr: 'Apprentissage',            uk: 'Навчання',                pl: 'Nauka',                     emoji: '📚' },
  { id: 'sinn',       dimension: 'geist',     de: 'Sinn',                    vi: 'Ý nghĩa',                    en: 'Meaning',               tr: 'Anlam',                    ar: 'معنى',                    es: 'Sentido',                  fr: 'Sens',                     uk: 'Сенс',                    pl: 'Sens',                      emoji: '🧩' },
  { id: 'perspektive', dimension: 'geist',    de: 'Perspektivwechsel',       vi: 'Thay đổi góc nhìn',          en: 'Change of perspective', tr: 'Bakış açısı değişimi',     ar: 'تغيير المنظور',           es: 'Cambio de perspectiva',    fr: 'Changement de perspective', uk: 'Зміна перспективи',       pl: 'Zmiana perspektywy',        emoji: '🔄' },

  // 🔮 Seele
  { id: 'seele_verbundenheit', dimension: 'seele', de: 'Verbundenheit',      vi: 'Kết nối',                    en: 'Connection',            tr: 'Bağlılık',                 ar: 'ترابط',                   es: 'Conexión',                 fr: 'Connexion',                uk: 'Єднання',                 pl: 'Więź',                      emoji: '🔗' },
  { id: 'seele_vertrauen', dimension: 'seele', de: 'Vertrauen',              vi: 'Tin tưởng',                   en: 'Trust',                 tr: 'Güven',                    ar: 'ثقة',                     es: 'Confianza',                fr: 'Confiance',                uk: 'Довіра',                  pl: 'Zaufanie',                  emoji: '🤝' },
  { id: 'hingabe',    dimension: 'seele',     de: 'Hingabe',                 vi: 'Buông mình',                  en: 'Surrender',             tr: 'Teslim olma',              ar: 'استسلام',                  es: 'Entrega',                  fr: 'Abandon',                  uk: 'Віддача',                 pl: 'Oddanie',                   emoji: '🙌' },
  { id: 'wahrheit',   dimension: 'seele',     de: 'Wahrheit aussprechen',    vi: 'Nói ra sự thật',             en: 'Speaking truth',        tr: 'Gerçeği söylemek',         ar: 'قول الحقيقة',             es: 'Decir la verdad',          fr: 'Dire la vérité',           uk: 'Говорити правду',          pl: 'Mówienie prawdy',           emoji: '🗣️' },
  { id: 'kreativ',    dimension: 'seele',     de: 'Kreativer Ausdruck',      vi: 'Sáng tạo',                   en: 'Creative expression',   tr: 'Yaratıcı ifade',           ar: 'تعبير إبداعي',            es: 'Expresión creativa',       fr: 'Expression créative',      uk: 'Творче вираження',         pl: 'Twórczy wyraz',             emoji: '🎨' },
  { id: 'meditation', dimension: 'seele',     de: 'Meditation / Gebet',      vi: 'Thiền / Cầu nguyện',         en: 'Meditation / Prayer',   tr: 'Meditasyon / Dua',         ar: 'تأمل / صلاة',             es: 'Meditación / Oración',     fr: 'Méditation / Prière',      uk: 'Медитація / Молитва',      pl: 'Medytacja / Modlitwa',      emoji: '🧘' },
  { id: 'natur',      dimension: 'seele',     de: 'Natur',                   vi: 'Thiên nhiên',                 en: 'Nature',                tr: 'Doğa',                     ar: 'طبيعة',                   es: 'Naturaleza',               fr: 'Nature',                   uk: 'Природа',                 pl: 'Natura',                    emoji: '🌿' },
  { id: 'bedeutung',  dimension: 'seele',     de: 'Bedeutung erleben',       vi: 'Cảm nhận ý nghĩa sống',     en: 'Experience meaning',    tr: 'Anlam deneyimlemek',       ar: 'تجربة المعنى',            es: 'Experimentar sentido',     fr: 'Vivre le sens',            uk: 'Переживати сенс',          pl: 'Doświadczać sensu',         emoji: '✨' },

  // 👥 Beziehung
  { id: 'ehrlichkeit', dimension: 'beziehung', de: 'Ehrlichkeit',            vi: 'Trung thực',                 en: 'Honesty',               tr: 'Dürüstlük',                ar: 'صدق',                     es: 'Honestidad',               fr: 'Honnêteté',                uk: 'Чесність',                pl: 'Uczciwość',                 emoji: '💯' },
  { id: 'grenzen',    dimension: 'beziehung', de: 'Grenzen',                 vi: 'Ranh giới',                   en: 'Boundaries',            tr: 'Sınırlar',                 ar: 'حدود',                    es: 'Límites',                  fr: 'Limites',                  uk: 'Межі',                    pl: 'Granice',                   emoji: '🚧' },
  { id: 'naehe',      dimension: 'beziehung', de: 'Nähe',                    vi: 'Gần gũi',                    en: 'Closeness',             tr: 'Yakınlık',                 ar: 'قرب',                     es: 'Cercanía',                 fr: 'Proximité',                uk: 'Близькість',              pl: 'Bliskość',                  emoji: '💑' },
  { id: 'raum',       dimension: 'beziehung', de: 'Raum',                    vi: 'Không gian riêng',           en: 'Space',                 tr: 'Alan',                     ar: 'مساحة',                   es: 'Espacio',                  fr: 'Espace',                   uk: 'Простір',                 pl: 'Przestrzeń',                emoji: '🌌' },
  { id: 'unterstuetzung', dimension: 'beziehung', de: 'Unterstützung',       vi: 'Được hỗ trợ',               en: 'Support',               tr: 'Destek',                   ar: 'دعم',                     es: 'Apoyo',                    fr: 'Soutien',                  uk: 'Підтримка',               pl: 'Wsparcie',                  emoji: '🤲' },
  { id: 'zuhoeren',   dimension: 'beziehung', de: 'Zuhören',                 vi: 'Được lắng nghe',             en: 'Being heard',           tr: 'Dinlenmek',                ar: 'الإصغاء',                 es: 'Ser escuchado/a',          fr: 'Être écouté(e)',           uk: 'Бути почутим',             pl: 'Być wysłuchanym',           emoji: '👂' },
  { id: 'wertschaetzung', dimension: 'beziehung', de: 'Wertschätzung',       vi: 'Được trân trọng',            en: 'Appreciation',          tr: 'Takdir',                   ar: 'تقدير',                   es: 'Apreciación',              fr: 'Appréciation',             uk: 'Цінування',               pl: 'Uznanie',                   emoji: '🌻' },
  { id: 'vergebung',  dimension: 'beziehung', de: 'Vergebung',               vi: 'Tha thứ',                    en: 'Forgiveness',           tr: 'Bağışlama',                ar: 'مغفرة',                   es: 'Perdón',                   fr: 'Pardon',                   uk: 'Прощення',                pl: 'Przebaczenie',              emoji: '🕊️' }
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
    de: 'Kinder', vi: 'Trẻ em', en: 'Kids', tr: 'Çocuklar', ar: 'أطفال', es: 'Niños', fr: 'Enfants', uk: 'Діти', pl: 'Dzieci',
    desc: { de: '6 Paare · nur helle Gefühle · 3s Vorschau', vi: '6 cặp · cảm xúc tích cực · xem trước 3 giây', en: '6 pairs · bright feelings only · 3s peek', tr: '6 çift · sadece parlak duygular · 3sn önizleme', ar: '6 أزواج · مشاعر مشرقة فقط · معاينة 3 ثوانٍ', es: '6 parejas · solo sentimientos luminosos · 3s vista previa', fr: '6 paires · sentiments lumineux · 3s aperçu', uk: '6 пар · лише світлі почуття · 3с попередній перегляд', pl: '6 par · tylko jasne uczucia · 3s podgląd' }
  },
  {
    id: 'easy',
    emoji: '🌿',
    pairs: 8,
    peekSeconds: 2,
    categories: ['licht', 'mitte'],
    de: 'Leicht', vi: 'Dễ', en: 'Easy', tr: 'Kolay', ar: 'سهل', es: 'Fácil', fr: 'Facile', uk: 'Легко', pl: 'Łatwy',
    desc: { de: '8 Paare · Licht & Sanfte Mitte · 2s Vorschau', vi: '8 cặp · Ánh sáng & Dịu nhẹ · xem trước 2 giây', en: '8 pairs · Light & Gentle · 2s peek', tr: '8 çift · Işık & Yumuşak · 2sn önizleme', ar: '8 أزواج · نور و وسط هادئ · معاينة ثانيتين', es: '8 parejas · Luz & Suave · 2s vista previa', fr: '8 paires · Lumière & Doux · 2s aperçu', uk: '8 пар · Світло & Лагідна · 2с попередній перегляд', pl: '8 par · Światło & Łagodny · 2s podgląd' }
  },
  {
    id: 'medium',
    emoji: '🌊',
    pairs: 12,
    peekSeconds: 0,
    categories: null,
    de: 'Mittel', vi: 'Trung bình', en: 'Medium', tr: 'Orta', ar: 'متوسط', es: 'Medio', fr: 'Moyen', uk: 'Середній', pl: 'Średni',
    desc: { de: '12 Paare · alle Kategorien', vi: '12 cặp · tất cả', en: '12 pairs · all categories', tr: '12 çift · tüm kategoriler', ar: '12 زوجاً · جميع الفئات', es: '12 parejas · todas las categorías', fr: '12 paires · toutes catégories', uk: '12 пар · усі категорії', pl: '12 par · wszystkie kategorie' }
  },
  {
    id: 'hard',
    emoji: '🔥',
    pairs: 20,
    peekSeconds: 0,
    categories: null,
    de: 'Schwer', vi: 'Khó', en: 'Hard', tr: 'Zor', ar: 'صعب', es: 'Difícil', fr: 'Difficile', uk: 'Складний', pl: 'Trudny',
    desc: { de: '20 Paare · alle Kategorien', vi: '20 cặp · tất cả', en: '20 pairs · all categories', tr: '20 çift · tüm kategoriler', ar: '20 زوجاً · جميع الفئات', es: '20 parejas · todas las categorías', fr: '20 paires · toutes catégories', uk: '20 пар · усі категорії', pl: '20 par · wszystkie kategorie' }
  },
  {
    id: 'master',
    emoji: '🌑',
    pairs: 30,
    peekSeconds: 0,
    categories: null,
    de: 'Meister', vi: 'Bậc thầy', en: 'Master', tr: 'Usta', ar: 'خبير', es: 'Maestro', fr: 'Maître', uk: 'Майстер', pl: 'Mistrz',
    desc: { de: '30 Paare · alle 67 Gefühle', vi: '30 cặp · tất cả 67 cảm xúc', en: '30 pairs · all 67 emotions', tr: '30 çift · tüm 67 duygu', ar: '30 زوجاً · جميع المشاعر الـ67', es: '30 parejas · las 67 emociones', fr: '30 paires · les 67 émotions', uk: '30 пар · усі 67 емоцій', pl: '30 par · wszystkie 67 emocji' }
  }
];
