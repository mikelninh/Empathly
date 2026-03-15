/**
 * Gefühle-Memory — Learning Data
 * Context sentences, scenarios, and application exercises
 * For flashcard/study mode with spaced repetition
 */

// Real-life scenarios for each emotion (2-3 per emotion)
// Used in: flashcard quiz, context learning, scenario identification
const SCENARIOS = {
  // ── 🌟 Licht & Weite ──────────────────────────────
  freude: [
    { de: 'Dein bester Freund überrascht dich zum Geburtstag.', vi: 'Bạn thân bất ngờ tổ chức sinh nhật cho bạn.', en: 'Your best friend surprises you for your birthday.' },
    { de: 'Du schaffst eine Prüfung, vor der du Angst hattest.', vi: 'Bạn đậu một kỳ thi mà bạn từng lo sợ.', en: 'You pass an exam you were afraid of.' },
    { de: 'Ein Kind lacht und es steckt dich an.', vi: 'Một đứa trẻ cười và bạn cũng cười theo.', en: 'A child laughs and it makes you laugh too.' }
  ],
  dankbarkeit: [
    { de: 'Jemand hilft dir, ohne dass du darum gebeten hast.', vi: 'Ai đó giúp bạn mà bạn không cần phải nhờ.', en: 'Someone helps you without being asked.' },
    { de: 'Du sitzt am Fenster und die Sonne scheint herein.', vi: 'Bạn ngồi bên cửa sổ và ánh nắng chiếu vào.', en: 'You sit by the window and the sun shines in.' }
  ],
  frieden: [
    { de: 'Du sitzt allein am See und hörst nur die Natur.', vi: 'Bạn ngồi một mình bên hồ và chỉ nghe tiếng thiên nhiên.', en: 'You sit alone by the lake hearing only nature.' },
    { de: 'Nach einem Streit versöhnt ihr euch endlich.', vi: 'Sau một cuộc cãi vã, hai bạn cuối cùng cũng hòa giải.', en: 'After an argument, you finally make peace.' }
  ],
  leichtigkeit: [
    { de: 'Du gibst eine Sorge ab und fühlst dich plötzlich frei.', vi: 'Bạn buông bỏ một lo lắng và bỗng cảm thấy tự do.', en: 'You let go of a worry and suddenly feel free.' },
    { de: 'Ein Problem löst sich von allein.', vi: 'Một vấn đề tự giải quyết.', en: 'A problem resolves itself.' }
  ],
  liebe: [
    { de: 'Du siehst deine Eltern nach langer Zeit wieder.', vi: 'Bạn gặp lại bố mẹ sau thời gian dài.', en: 'You see your parents again after a long time.' },
    { de: 'Jemand sagt dir: „Ich bin froh, dass es dich gibt."', vi: 'Ai đó nói với bạn: "Mình vui vì có bạn."', en: 'Someone says: "I\'m glad you exist."' }
  ],
  vertrauen: [
    { de: 'Du erzählst einem Freund ein Geheimnis.', vi: 'Bạn kể cho bạn bè một bí mật.', en: 'You tell a friend a secret.' },
    { de: 'Du lehnst dich zurück und lässt jemand anderen fahren.', vi: 'Bạn ngả người ra sau và để người khác lái xe.', en: 'You lean back and let someone else drive.' }
  ],
  hoffnung: [
    { de: 'Du bewirbst dich auf deinen Traumjob.', vi: 'Bạn nộp đơn xin công việc mơ ước.', en: 'You apply for your dream job.' },
    { de: 'Der Arzt sagt, die Behandlung könnte helfen.', vi: 'Bác sĩ nói phương pháp điều trị có thể hiệu quả.', en: 'The doctor says the treatment might help.' }
  ],
  verbundenheit: [
    { de: 'Du und dein Team habt ein schwieriges Projekt geschafft.', vi: 'Bạn và nhóm đã hoàn thành một dự án khó khăn.', en: 'You and your team completed a difficult project.' },
    { de: 'In einer fremden Stadt triffst du jemanden aus deiner Heimat.', vi: 'Ở một thành phố xa lạ, bạn gặp người đồng hương.', en: 'In a foreign city, you meet someone from your hometown.' }
  ],

  // ── 🌊 Sanfte Mitte ──────────────────────────────
  sehnsucht: [
    { de: 'Du hörst ein Lied, das dich an deine Kindheit erinnert.', vi: 'Bạn nghe một bài hát gợi nhớ tuổi thơ.', en: 'You hear a song that reminds you of childhood.' },
    { de: 'Du scrollst durch alte Fotos von einem verstorbenen Verwandten.', vi: 'Bạn lướt xem ảnh cũ của người thân đã mất.', en: 'You scroll through old photos of a deceased relative.' }
  ],
  nostalgie: [
    { de: 'Du gehst durch die Straße, in der du aufgewachsen bist.', vi: 'Bạn đi qua con đường nơi bạn lớn lên.', en: 'You walk through the street where you grew up.' },
    { de: 'Der Geruch von Omas Küche kommt dir plötzlich in den Sinn.', vi: 'Bạn chợt nhớ mùi bếp của bà.', en: 'The smell of grandma\'s kitchen suddenly comes to mind.' }
  ],
  verletzlichkeit: [
    { de: 'Du sagst „Ich brauche Hilfe" und meinst es ernst.', vi: 'Bạn nói "Tôi cần giúp đỡ" và thật lòng.', en: 'You say "I need help" and mean it.' },
    { de: 'Du weinst vor jemandem, den du kaum kennst.', vi: 'Bạn khóc trước mặt người mà bạn ít quen biết.', en: 'You cry in front of someone you barely know.' }
  ],
  melancholie: [
    { de: 'Es regnet und du sitzt am Fenster mit einem Tee.', vi: 'Trời mưa và bạn ngồi bên cửa sổ với một tách trà.', en: 'It\'s raining and you sit by the window with tea.' },
    { de: 'Der letzte Tag eines wunderschönen Urlaubs.', vi: 'Ngày cuối cùng của một kỳ nghỉ tuyệt đẹp.', en: 'The last day of a beautiful vacation.' }
  ],

  // ── 🌑 Schwere & Tiefe ──────────────────────────────
  traurigkeit: [
    { de: 'Dein Haustier stirbt.', vi: 'Thú cưng của bạn qua đời.', en: 'Your pet dies.' },
    { de: 'Ein Freund zieht in eine andere Stadt.', vi: 'Một người bạn chuyển đến thành phố khác.', en: 'A friend moves to another city.' }
  ],
  einsamkeit: [
    { de: 'Silvester und du bist allein zu Hause.', vi: 'Đêm giao thừa và bạn ở nhà một mình.', en: 'New Year\'s Eve and you\'re home alone.' },
    { de: 'Du sitzt in einer Gruppe, aber niemand redet mit dir.', vi: 'Bạn ngồi trong nhóm nhưng không ai nói chuyện với bạn.', en: 'You sit in a group but nobody talks to you.' }
  ],
  scham: [
    { de: 'Du stolperst vor vielen Leuten.', vi: 'Bạn vấp ngã trước mặt nhiều người.', en: 'You trip in front of many people.' },
    { de: 'Jemand liest dein Tagebuch ohne dein Wissen.', vi: 'Ai đó đọc nhật ký của bạn mà bạn không biết.', en: 'Someone reads your diary without your knowledge.' }
  ],
  schuld: [
    { de: 'Du vergisst den Geburtstag deiner besten Freundin.', vi: 'Bạn quên sinh nhật của bạn thân nhất.', en: 'You forget your best friend\'s birthday.' },
    { de: 'Du sagst etwas Verletzendes im Streit.', vi: 'Bạn nói điều gì đó tổn thương trong lúc cãi nhau.', en: 'You say something hurtful in an argument.' }
  ],
  ueberforderung: [
    { de: 'Drei Deadlines am selben Tag.', vi: 'Ba deadline trong cùng một ngày.', en: 'Three deadlines on the same day.' },
    { de: 'Dein Kind weint, das Telefon klingelt, und das Essen brennt an.', vi: 'Con bạn khóc, điện thoại reo, và đồ ăn cháy khét.', en: 'Your child cries, the phone rings, and the food is burning.' }
  ],

  // ── 🔥 Sturm & Reibung ──────────────────────────────
  wut: [
    { de: 'Jemand schneidet dich im Verkehr.', vi: 'Ai đó cắt ngang bạn trên đường.', en: 'Someone cuts you off in traffic.' },
    { de: 'Man beschuldigt dich für etwas, das du nicht getan hast.', vi: 'Bạn bị đổ lỗi cho điều bạn không làm.', en: 'You\'re blamed for something you didn\'t do.' }
  ],
  frustration: [
    { de: 'Du versuchst zum zehnten Mal, und es klappt immer noch nicht.', vi: 'Bạn thử lần thứ mười mà vẫn không được.', en: 'You try for the tenth time and it still doesn\'t work.' },
    { de: 'Das Internet fällt mitten in einem wichtigen Videocall aus.', vi: 'Internet mất giữa cuộc họp video quan trọng.', en: 'The internet drops during an important video call.' }
  ],
  eifersucht: [
    { de: 'Dein Partner verbringt viel Zeit mit einer neuen Bekanntschaft.', vi: 'Bạn đời dành nhiều thời gian với một người quen mới.', en: 'Your partner spends a lot of time with a new acquaintance.' },
    { de: 'Ein Kollege wird befördert und du nicht.', vi: 'Đồng nghiệp được thăng chức còn bạn thì không.', en: 'A colleague gets promoted and you don\'t.' }
  ],
  trotz: [
    { de: 'Alle sagen dir, du sollst aufgeben — und du machst weiter.', vi: 'Mọi người bảo bạn từ bỏ — nhưng bạn tiếp tục.', en: 'Everyone tells you to give up — and you keep going.' },
    { de: 'Deine Eltern wollen etwas für dich entscheiden.', vi: 'Bố mẹ muốn quyết định thay cho bạn.', en: 'Your parents want to decide something for you.' }
  ],

  // ── ⚡ Angst & Schutz ──────────────────────────────
  angst_gefuehl: [
    { de: 'Du musst eine Rede vor 200 Leuten halten.', vi: 'Bạn phải phát biểu trước 200 người.', en: 'You have to give a speech in front of 200 people.' },
    { de: 'Du hörst nachts ein Geräusch im Haus.', vi: 'Bạn nghe thấy tiếng động trong nhà lúc đêm.', en: 'You hear a noise in the house at night.' }
  ],
  unsicherheit: [
    { de: 'Der erste Tag an einer neuen Schule.', vi: 'Ngày đầu tiên ở trường mới.', en: 'First day at a new school.' },
    { de: 'Du weißt nicht, ob die andere Person dich mag.', vi: 'Bạn không biết người kia có thích bạn không.', en: 'You don\'t know if the other person likes you.' }
  ],
  panik: [
    { de: 'Du kannst dein Kind im Supermarkt nicht finden.', vi: 'Bạn không tìm thấy con mình trong siêu thị.', en: 'You can\'t find your child in the supermarket.' },
    { de: 'Du merkst, dass dein Portemonnaie weg ist.', vi: 'Bạn nhận ra ví tiền của mình đã mất.', en: 'You realize your wallet is gone.' }
  ],

  // ── 🌘 Verdeckte Schatten ──────────────────────────────
  resignation: [
    { de: 'Du hast dich dreimal beworben und dreimal eine Absage bekommen.', vi: 'Bạn đã nộp đơn ba lần và ba lần bị từ chối.', en: 'You applied three times and got rejected three times.' },
    { de: 'Du sagst: „Es bringt eh nichts."', vi: 'Bạn nói: "Dù sao cũng chẳng ích gì."', en: 'You say: "It won\'t make a difference anyway."' }
  ],
  selbstzweifel: [
    { de: 'Du vergleichst dich auf Social Media mit anderen.', vi: 'Bạn so sánh mình với người khác trên mạng xã hội.', en: 'You compare yourself to others on social media.' },
    { de: 'Du denkst: „Alle anderen schaffen das — nur ich nicht."', vi: 'Bạn nghĩ: "Ai cũng làm được — chỉ mình tôi không."', en: 'You think: "Everyone else can do it — just not me."' }
  ],
  hoffnungsmuedigkeit: [
    { de: 'Jedes Mal wenn du denkst es wird besser, kommt der nächste Rückschlag.', vi: 'Mỗi lần bạn nghĩ mọi thứ sẽ tốt hơn, lại có một trở ngại mới.', en: 'Every time you think it\'s getting better, the next setback comes.' },
    { de: 'Du sagst nicht mehr „ich hoffe", sondern „mal sehen".', vi: 'Bạn không còn nói "tôi hy vọng" mà nói "để xem sao".', en: 'You no longer say "I hope" but "we\'ll see".' }
  ]
};

// Application exercises — prompts for deeper learning
const EXERCISES = {
  de: [
    { type: 'write', prompt: 'Schreibe einen Satz mit dem Wort „{word}".' },
    { type: 'describe', prompt: 'Beschreibe eine Situation, in der du „{word}" gefühlt hast.' },
    { type: 'opposite', prompt: 'Was ist das Gegenteil von „{word}"? Wann wechselt das eine ins andere?' },
    { type: 'body', prompt: 'Wo im Körper spürst du „{word}"? Wie fühlt es sich physisch an?' },
    { type: 'letter', prompt: 'Schreibe einen kurzen Brief an „{word}": Was möchtest du diesem Gefühl sagen?' },
    { type: 'color', prompt: 'Welche Farbe hat „{word}" für dich? Warum?' },
    { type: 'advice', prompt: 'Was würdest du einem Freund raten, der „{word}" fühlt?' }
  ],
  vi: [
    { type: 'write', prompt: 'Viết một câu với từ "{word}".' },
    { type: 'describe', prompt: 'Mô tả một tình huống khi bạn cảm thấy "{word}".' },
    { type: 'opposite', prompt: '"{word}" ngược lại với cảm xúc nào? Khi nào chúng chuyển đổi?' },
    { type: 'body', prompt: 'Bạn cảm nhận "{word}" ở đâu trong cơ thể? Cảm giác thể chất như thế nào?' },
    { type: 'letter', prompt: 'Viết một lá thư ngắn cho "{word}": Bạn muốn nói gì với cảm xúc này?' },
    { type: 'color', prompt: '"{word}" có màu gì đối với bạn? Tại sao?' },
    { type: 'advice', prompt: 'Bạn sẽ khuyên gì cho một người bạn đang cảm thấy "{word}"?' }
  ],
  en: [
    { type: 'write', prompt: 'Write a sentence using the word "{word}".' },
    { type: 'describe', prompt: 'Describe a situation where you felt "{word}".' },
    { type: 'opposite', prompt: 'What is the opposite of "{word}"? When does one turn into the other?' },
    { type: 'body', prompt: 'Where in your body do you feel "{word}"? What does it feel like physically?' },
    { type: 'letter', prompt: 'Write a short letter to "{word}": What would you say to this feeling?' },
    { type: 'color', prompt: 'What color is "{word}" to you? Why?' },
    { type: 'advice', prompt: 'What would you tell a friend who feels "{word}"?' }
  ]
};

// Quiz types for flashcard mode
const QUIZ_TYPES = [
  { id: 'emoji-to-word',   de: 'Emoji → Wort',      vi: 'Emoji → Từ',       en: 'Emoji → Word',     desc: { de: 'Sieh das Emoji, rate das Gefühl', vi: 'Xem emoji, đoán cảm xúc', en: 'See the emoji, guess the feeling' } },
  { id: 'word-to-translation', de: 'Übersetzen',     vi: 'Dịch',             en: 'Translate',         desc: { de: 'Übersetze das Wort in die andere Sprache', vi: 'Dịch từ sang ngôn ngữ khác', en: 'Translate the word to the other language' } },
  { id: 'scenario-to-emotion', de: 'Situation → Gefühl', vi: 'Tình huống → Cảm xúc', en: 'Scenario → Feeling', desc: { de: 'Lies die Situation, finde das passende Gefühl', vi: 'Đọc tình huống, tìm cảm xúc phù hợp', en: 'Read the scenario, find the matching feeling' } },
  { id: 'audio-to-word',   de: 'Hören → Wort',      vi: 'Nghe → Từ',        en: 'Listen → Word',    desc: { de: 'Hör das Wort, wähl die richtige Übersetzung', vi: 'Nghe từ, chọn bản dịch đúng', en: 'Hear the word, pick the right translation' } },
  { id: 'fill-blank',      de: 'Lückentext',        vi: 'Điền vào chỗ trống', en: 'Fill the blank',  desc: { de: 'Ergänze den Satz mit dem richtigen Gefühl', vi: 'Hoàn thành câu với cảm xúc đúng', en: 'Complete the sentence with the right feeling' } },
  { id: 'category-sort',   de: 'Einordnen',         vi: 'Phân loại',         en: 'Categorize',       desc: { de: 'Ordne das Gefühl der richtigen Kategorie zu', vi: 'Xếp cảm xúc vào đúng nhóm', en: 'Sort the feeling into the right category' } }
];

// Spaced repetition intervals (in hours)
// Based on simplified SM-2: if correct, increase interval; if wrong, reset
const SR_INTERVALS = [0.5, 4, 12, 24, 72, 168, 336, 720]; // 30min → 1mo

// Mastery levels
const MASTERY_LEVELS = [
  { id: 'new',      emoji: '⬜', de: 'Neu',        vi: 'Mới',       en: 'New',       minCorrect: 0 },
  { id: 'learning', emoji: '🟨', de: 'Lernend',    vi: 'Đang học',  en: 'Learning',  minCorrect: 2 },
  { id: 'known',    emoji: '🟩', de: 'Bekannt',    vi: 'Đã biết',   en: 'Known',     minCorrect: 5 },
  { id: 'mastered', emoji: '⭐', de: 'Gemeistert', vi: 'Thành thạo', en: 'Mastered', minCorrect: 10 }
];
