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
    { de: 'Dein bester Freund überrascht dich zum Geburtstag.', vi: 'Bạn thân bất ngờ tổ chức sinh nhật cho bạn.', en: 'Your best friend surprises you for your birthday.', el: 'Ο καλύτερός σου φίλος σε εκπλήσσει για τα γενέθλιά σου.' },
    { de: 'Du schaffst eine Prüfung, vor der du Angst hattest.', vi: 'Bạn đậu một kỳ thi mà bạn từng lo sợ.', en: 'You pass an exam you were afraid of.', el: 'Περνάς μια εξέταση που φοβόσουν.' },
    { de: 'Ein Kind lacht und es steckt dich an.', vi: 'Một đứa trẻ cười và bạn cũng cười theo.', en: 'A child laughs and it makes you laugh too.', el: 'Ένα παιδί γελάει και σε κολλάει.' }
  ],
  dankbarkeit: [
    { de: 'Jemand hilft dir, ohne dass du darum gebeten hast.', vi: 'Ai đó giúp bạn mà bạn không cần phải nhờ.', en: 'Someone helps you without being asked.', el: 'Κάποιος σε βοηθάει χωρίς να το ζητήσεις.' },
    { de: 'Du sitzt am Fenster und die Sonne scheint herein.', vi: 'Bạn ngồi bên cửa sổ và ánh nắng chiếu vào.', en: 'You sit by the window and the sun shines in.', el: 'Κάθεσαι στο παράθυρο και ο ήλιος λάμπει μέσα.' }
  ],
  frieden: [
    { de: 'Du sitzt allein am See und hörst nur die Natur.', vi: 'Bạn ngồi một mình bên hồ và chỉ nghe tiếng thiên nhiên.', en: 'You sit alone by the lake hearing only nature.', el: 'Κάθεσαι μόνος/η στη λίμνη ακούγοντας μόνο τη φύση.' },
    { de: 'Nach einem Streit versöhnt ihr euch endlich.', vi: 'Sau một cuộc cãi vã, hai bạn cuối cùng cũng hòa giải.', en: 'After an argument, you finally make peace.', el: 'Μετά από καβγά, επιτέλους συμφιλιώνεστε.' }
  ],
  leichtigkeit: [
    { de: 'Du gibst eine Sorge ab und fühlst dich plötzlich frei.', vi: 'Bạn buông bỏ một lo lắng và bỗng cảm thấy tự do.', en: 'You let go of a worry and suddenly feel free.', el: 'Αφήνεις μια ανησυχία και ξαφνικά νιώθεις ελεύθερος/η.' },
    { de: 'Ein Problem löst sich von allein.', vi: 'Một vấn đề tự giải quyết.', en: 'A problem resolves itself.', el: 'Ένα πρόβλημα λύνεται από μόνο του.' }
  ],
  liebe: [
    { de: 'Du siehst deine Eltern nach langer Zeit wieder.', vi: 'Bạn gặp lại bố mẹ sau thời gian dài.', en: 'You see your parents again after a long time.', el: 'Βλέπεις τους γονείς σου ξανά μετά από πολύ καιρό.' },
    { de: 'Jemand sagt dir: „Ich bin froh, dass es dich gibt."', vi: 'Ai đó nói với bạn: "Mình vui vì có bạn."', en: 'Someone says: "I\'m glad you exist."', el: 'Κάποιος σου λέει: «Χαίρομαι που υπάρχεις.»' }
  ],
  vertrauen: [
    { de: 'Du erzählst einem Freund ein Geheimnis.', vi: 'Bạn kể cho bạn bè một bí mật.', en: 'You tell a friend a secret.', el: 'Λες σε έναν φίλο ένα μυστικό.' },
    { de: 'Du lehnst dich zurück und lässt jemand anderen fahren.', vi: 'Bạn ngả người ra sau và để người khác lái xe.', en: 'You lean back and let someone else drive.', el: 'Γέρνεις πίσω και αφήνεις κάποιον άλλο να οδηγεί.' }
  ],
  hoffnung: [
    { de: 'Du bewirbst dich auf deinen Traumjob.', vi: 'Bạn nộp đơn xin công việc mơ ước.', en: 'You apply for your dream job.', el: 'Κάνεις αίτηση για τη δουλειά των ονείρων σου.' },
    { de: 'Der Arzt sagt, die Behandlung könnte helfen.', vi: 'Bác sĩ nói phương pháp điều trị có thể hiệu quả.', en: 'The doctor says the treatment might help.', el: 'Ο γιατρός λέει ότι η θεραπεία μπορεί να βοηθήσει.' }
  ],
  verbundenheit: [
    { de: 'Du und dein Team habt ein schwieriges Projekt geschafft.', vi: 'Bạn và nhóm đã hoàn thành một dự án khó khăn.', en: 'You and your team completed a difficult project.', el: 'Εσύ και η ομάδα σου ολοκληρώσατε ένα δύσκολο έργο.' },
    { de: 'In einer fremden Stadt triffst du jemanden aus deiner Heimat.', vi: 'Ở một thành phố xa lạ, bạn gặp người đồng hương.', en: 'In a foreign city, you meet someone from your hometown.', el: 'Σε μια ξένη πόλη, συναντάς κάποιον από την πατρίδα σου.' }
  ],

  // ── 🌊 Sanfte Mitte ──────────────────────────────
  sehnsucht: [
    { de: 'Du hörst ein Lied, das dich an deine Kindheit erinnert.', vi: 'Bạn nghe một bài hát gợi nhớ tuổi thơ.', en: 'You hear a song that reminds you of childhood.', el: 'Ακούς ένα τραγούδι που σου θυμίζει τα παιδικά σου χρόνια.' },
    { de: 'Du scrollst durch alte Fotos von einem verstorbenen Verwandten.', vi: 'Bạn lướt xem ảnh cũ của người thân đã mất.', en: 'You scroll through old photos of a deceased relative.', el: 'Ξεφυλλίζεις παλιές φωτογραφίες ενός συγγενή που έφυγε.' }
  ],
  nostalgie: [
    { de: 'Du gehst durch die Straße, in der du aufgewachsen bist.', vi: 'Bạn đi qua con đường nơi bạn lớn lên.', en: 'You walk through the street where you grew up.', el: 'Περπατάς στο δρόμο όπου μεγάλωσες.' },
    { de: 'Der Geruch von Omas Küche kommt dir plötzlich in den Sinn.', vi: 'Bạn chợt nhớ mùi bếp của bà.', en: 'The smell of grandma\'s kitchen suddenly comes to mind.', el: 'Η μυρωδιά της κουζίνας της γιαγιάς σου έρχεται ξαφνικά στο μυαλό σου.' }
  ],
  verletzlichkeit: [
    { de: 'Du sagst „Ich brauche Hilfe" und meinst es ernst.', vi: 'Bạn nói "Tôi cần giúp đỡ" và thật lòng.', en: 'You say "I need help" and mean it.', el: 'Λες «Χρειάζομαι βοήθεια» και το εννοείς.' },
    { de: 'Du weinst vor jemandem, den du kaum kennst.', vi: 'Bạn khóc trước mặt người mà bạn ít quen biết.', en: 'You cry in front of someone you barely know.', el: 'Κλαις μπροστά σε κάποιον που μόλις γνωρίζεις.' }
  ],
  melancholie: [
    { de: 'Es regnet und du sitzt am Fenster mit einem Tee.', vi: 'Trời mưa và bạn ngồi bên cửa sổ với một tách trà.', en: 'It\'s raining and you sit by the window with tea.', el: 'Βρέχει και κάθεσαι στο παράθυρο με ένα τσάι.' },
    { de: 'Der letzte Tag eines wunderschönen Urlaubs.', vi: 'Ngày cuối cùng của một kỳ nghỉ tuyệt đẹp.', en: 'The last day of a beautiful vacation.', el: 'Η τελευταία μέρα μιας υπέροχης διακοπής.' }
  ],

  // ── 🌑 Schwere & Tiefe ──────────────────────────────
  traurigkeit: [
    { de: 'Dein Haustier stirbt.', vi: 'Thú cưng của bạn qua đời.', en: 'Your pet dies.', el: 'Το κατοικίδιό σου πεθαίνει.' },
    { de: 'Ein Freund zieht in eine andere Stadt.', vi: 'Một người bạn chuyển đến thành phố khác.', en: 'A friend moves to another city.', el: 'Ένας φίλος μετακομίζει σε άλλη πόλη.' }
  ],
  einsamkeit: [
    { de: 'Silvester und du bist allein zu Hause.', vi: 'Đêm giao thừa và bạn ở nhà một mình.', en: 'New Year\'s Eve and you\'re home alone.', el: 'Παραμονή Πρωτοχρονιάς και είσαι μόνος/η στο σπίτι.' },
    { de: 'Du sitzt in einer Gruppe, aber niemand redet mit dir.', vi: 'Bạn ngồi trong nhóm nhưng không ai nói chuyện với bạn.', en: 'You sit in a group but nobody talks to you.', el: 'Κάθεσαι σε μια παρέα αλλά κανείς δε σου μιλάει.' }
  ],
  scham: [
    { de: 'Du stolperst vor vielen Leuten.', vi: 'Bạn vấp ngã trước mặt nhiều người.', en: 'You trip in front of many people.', el: 'Σκοντάφτεις μπροστά σε πολλούς ανθρώπους.' },
    { de: 'Jemand liest dein Tagebuch ohne dein Wissen.', vi: 'Ai đó đọc nhật ký của bạn mà bạn không biết.', en: 'Someone reads your diary without your knowledge.', el: 'Κάποιος διαβάζει το ημερολόγιό σου χωρίς να το ξέρεις.' }
  ],
  schuld: [
    { de: 'Du vergisst den Geburtstag deiner besten Freundin.', vi: 'Bạn quên sinh nhật của bạn thân nhất.', en: 'You forget your best friend\'s birthday.', el: 'Ξεχνάς τα γενέθλια της καλύτερής σου φίλης.' },
    { de: 'Du sagst etwas Verletzendes im Streit.', vi: 'Bạn nói điều gì đó tổn thương trong lúc cãi nhau.', en: 'You say something hurtful in an argument.', el: 'Λες κάτι πληγωτικό σε έναν καβγά.' }
  ],
  ueberforderung: [
    { de: 'Drei Deadlines am selben Tag.', vi: 'Ba deadline trong cùng một ngày.', en: 'Three deadlines on the same day.', el: 'Τρεις προθεσμίες την ίδια μέρα.' },
    { de: 'Dein Kind weint, das Telefon klingelt, und das Essen brennt an.', vi: 'Con bạn khóc, điện thoại reo, và đồ ăn cháy khét.', en: 'Your child cries, the phone rings, and the food is burning.', el: 'Το παιδί σου κλαίει, το τηλέφωνο χτυπάει και το φαγητό καίγεται.' }
  ],

  // ── 🔥 Sturm & Reibung ──────────────────────────────
  wut: [
    { de: 'Jemand schneidet dich im Verkehr.', vi: 'Ai đó cắt ngang bạn trên đường.', en: 'Someone cuts you off in traffic.', el: 'Κάποιος σε κόβει στην κυκλοφορία.' },
    { de: 'Man beschuldigt dich für etwas, das du nicht getan hast.', vi: 'Bạn bị đổ lỗi cho điều bạn không làm.', en: 'You\'re blamed for something you didn\'t do.', el: 'Σε κατηγορούν για κάτι που δεν έκανες.' }
  ],
  frustration: [
    { de: 'Du versuchst zum zehnten Mal, und es klappt immer noch nicht.', vi: 'Bạn thử lần thứ mười mà vẫn không được.', en: 'You try for the tenth time and it still doesn\'t work.', el: 'Δοκιμάζεις για δέκατη φορά και ακόμα δεν πετυχαίνει.' },
    { de: 'Das Internet fällt mitten in einem wichtigen Videocall aus.', vi: 'Internet mất giữa cuộc họp video quan trọng.', en: 'The internet drops during an important video call.', el: 'Το ίντερνετ κόβεται στη μέση μιας σημαντικής βιντεοκλήσης.' }
  ],
  eifersucht: [
    { de: 'Dein Partner verbringt viel Zeit mit einer neuen Bekanntschaft.', vi: 'Bạn đời dành nhiều thời gian với một người quen mới.', en: 'Your partner spends a lot of time with a new acquaintance.', el: 'Ο/Η σύντροφός σου περνάει πολύ χρόνο με μια νέα γνωριμία.' },
    { de: 'Ein Kollege wird befördert und du nicht.', vi: 'Đồng nghiệp được thăng chức còn bạn thì không.', en: 'A colleague gets promoted and you don\'t.', el: 'Ένας συνάδελφος προάγεται και εσύ όχι.' }
  ],
  trotz: [
    { de: 'Alle sagen dir, du sollst aufgeben — und du machst weiter.', vi: 'Mọi người bảo bạn từ bỏ — nhưng bạn tiếp tục.', en: 'Everyone tells you to give up — and you keep going.', el: 'Όλοι σου λένε να τα παρατήσεις — κι εσύ συνεχίζεις.' },
    { de: 'Deine Eltern wollen etwas für dich entscheiden.', vi: 'Bố mẹ muốn quyết định thay cho bạn.', en: 'Your parents want to decide something for you.', el: 'Οι γονείς σου θέλουν να αποφασίσουν κάτι για σένα.' }
  ],

  // ── ⚡ Angst & Schutz ──────────────────────────────
  angst_gefuehl: [
    { de: 'Du musst eine Rede vor 200 Leuten halten.', vi: 'Bạn phải phát biểu trước 200 người.', en: 'You have to give a speech in front of 200 people.', el: 'Πρέπει να βγάλεις λόγο μπροστά σε 200 άτομα.' },
    { de: 'Du hörst nachts ein Geräusch im Haus.', vi: 'Bạn nghe thấy tiếng động trong nhà lúc đêm.', en: 'You hear a noise in the house at night.', el: 'Ακούς έναν θόρυβο στο σπίτι τη νύχτα.' }
  ],
  unsicherheit: [
    { de: 'Der erste Tag an einer neuen Schule.', vi: 'Ngày đầu tiên ở trường mới.', en: 'First day at a new school.', el: 'Η πρώτη μέρα σε ένα νέο σχολείο.' },
    { de: 'Du weißt nicht, ob die andere Person dich mag.', vi: 'Bạn không biết người kia có thích bạn không.', en: 'You don\'t know if the other person likes you.', el: 'Δεν ξέρεις αν σε συμπαθεί ο άλλος.' }
  ],
  panik: [
    { de: 'Du kannst dein Kind im Supermarkt nicht finden.', vi: 'Bạn không tìm thấy con mình trong siêu thị.', en: 'You can\'t find your child in the supermarket.', el: 'Δεν μπορείς να βρεις το παιδί σου στο σούπερ μάρκετ.' },
    { de: 'Du merkst, dass dein Portemonnaie weg ist.', vi: 'Bạn nhận ra ví tiền của mình đã mất.', en: 'You realize your wallet is gone.', el: 'Συνειδητοποιείς ότι το πορτοφόλι σου χάθηκε.' }
  ],

  // ── 🌘 Verdeckte Schatten ──────────────────────────────
  resignation: [
    { de: 'Du hast dich dreimal beworben und dreimal eine Absage bekommen.', vi: 'Bạn đã nộp đơn ba lần và ba lần bị từ chối.', en: 'You applied three times and got rejected three times.', el: 'Έκανες αίτηση τρεις φορές και απορρίφθηκες τρεις φορές.' },
    { de: 'Du sagst: „Es bringt eh nichts."', vi: 'Bạn nói: "Dù sao cũng chẳng ích gì."', en: 'You say: "It won\'t make a difference anyway."', el: 'Λες: «Δεν αλλάζει τίποτα ούτως ή άλλως.»' }
  ],
  selbstzweifel: [
    { de: 'Du vergleichst dich auf Social Media mit anderen.', vi: 'Bạn so sánh mình với người khác trên mạng xã hội.', en: 'You compare yourself to others on social media.', el: 'Συγκρίνεις τον εαυτό σου με άλλους στα social media.' },
    { de: 'Du denkst: „Alle anderen schaffen das — nur ich nicht."', vi: 'Bạn nghĩ: "Ai cũng làm được — chỉ mình tôi không."', en: 'You think: "Everyone else can do it — just not me."', el: 'Σκέφτεσαι: «Όλοι τα καταφέρνουν — εκτός από μένα.»' }
  ],
  hoffnungsmuedigkeit: [
    { de: 'Jedes Mal wenn du denkst es wird besser, kommt der nächste Rückschlag.', vi: 'Mỗi lần bạn nghĩ mọi thứ sẽ tốt hơn, lại có một trở ngại mới.', en: 'Every time you think it\'s getting better, the next setback comes.', el: 'Κάθε φορά που νομίζεις ότι γίνεται καλύτερα, έρχεται το επόμενο χτύπημα.' },
    { de: 'Du sagst nicht mehr „ich hoffe", sondern „mal sehen".', vi: 'Bạn không còn nói "tôi hy vọng" mà nói "để xem sao".', en: 'You no longer say "I hope" but "we\'ll see".', el: 'Δεν λες πια «ελπίζω» αλλά «θα δούμε».' }
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
  ],
  tr: [
    { type: 'write', prompt: '"{word}" kelimesiyle bir cümle yaz.' },
    { type: 'describe', prompt: '"{word}" hissettiğin bir durumu anlat.' },
    { type: 'opposite', prompt: '"{word}" kelimesinin zıttı nedir? Biri ne zaman diğerine dönüşür?' },
    { type: 'body', prompt: '"{word}" hissini vücudunda nerede hissediyorsun? Fiziksel olarak nasıl hissettiriyor?' },
    { type: 'letter', prompt: '"{word}" duygusuna kısa bir mektup yaz: Bu duyguya ne söylerdin?' },
    { type: 'color', prompt: '"{word}" senin için hangi renk? Neden?' },
    { type: 'advice', prompt: '"{word}" hisseden bir arkadaşına ne söylerdin?' }
  ],
  ar: [
    { type: 'write', prompt: 'اكتب جملة تستخدم فيها كلمة "{word}".' },
    { type: 'describe', prompt: 'صف موقفاً شعرت فيه بـ"{word}".' },
    { type: 'opposite', prompt: 'ما عكس "{word}"؟ متى يتحول أحدهما إلى الآخر؟' },
    { type: 'body', prompt: 'أين تشعر بـ"{word}" في جسدك؟ كيف يبدو الشعور جسدياً؟' },
    { type: 'letter', prompt: 'اكتب رسالة قصيرة إلى "{word}": ماذا ستقول لهذا الشعور؟' },
    { type: 'color', prompt: 'ما لون "{word}" بالنسبة لك؟ لماذا؟' },
    { type: 'advice', prompt: 'ماذا ستقول لصديق يشعر بـ"{word}"؟' }
  ],
  es: [
    { type: 'write', prompt: 'Escribe una frase con la palabra "{word}".' },
    { type: 'describe', prompt: 'Describe una situación en la que sentiste "{word}".' },
    { type: 'opposite', prompt: '¿Cuál es lo opuesto de "{word}"? ¿Cuándo se convierte uno en el otro?' },
    { type: 'body', prompt: '¿Dónde sientes "{word}" en tu cuerpo? ¿Cómo se siente físicamente?' },
    { type: 'letter', prompt: 'Escribe una carta corta a "{word}": ¿Qué le dirías a este sentimiento?' },
    { type: 'color', prompt: '¿De qué color es "{word}" para ti? ¿Por qué?' },
    { type: 'advice', prompt: '¿Qué le dirías a un amigo que siente "{word}"?' }
  ],
  fr: [
    { type: 'write', prompt: 'Écris une phrase avec le mot « {word} ».' },
    { type: 'describe', prompt: 'Décris une situation où tu as ressenti « {word} ».' },
    { type: 'opposite', prompt: 'Quel est le contraire de « {word} » ? Quand l\'un se transforme-t-il en l\'autre ?' },
    { type: 'body', prompt: 'Où ressens-tu « {word} » dans ton corps ? Comment cela se manifeste-t-il physiquement ?' },
    { type: 'letter', prompt: 'Écris une courte lettre à « {word} » : Que dirais-tu à ce sentiment ?' },
    { type: 'color', prompt: 'De quelle couleur est « {word} » pour toi ? Pourquoi ?' },
    { type: 'advice', prompt: 'Que dirais-tu à un ami qui ressent « {word} » ?' }
  ],
  uk: [
    { type: 'write', prompt: 'Напиши речення зі словом «{word}».' },
    { type: 'describe', prompt: 'Опиши ситуацію, коли ти відчував/ла «{word}».' },
    { type: 'opposite', prompt: 'Що є протилежністю «{word}»? Коли одне переходить в інше?' },
    { type: 'body', prompt: 'Де в тілі ти відчуваєш «{word}»? Як це відчувається фізично?' },
    { type: 'letter', prompt: 'Напиши короткого листа до «{word}»: Що б ти сказав/ла цьому почуттю?' },
    { type: 'color', prompt: 'Якого кольору «{word}» для тебе? Чому?' },
    { type: 'advice', prompt: 'Що б ти порадив/ла другу, який відчуває «{word}»?' }
  ],
  pl: [
    { type: 'write', prompt: 'Napisz zdanie ze słowem „{word}".' },
    { type: 'describe', prompt: 'Opisz sytuację, w której czułeś/aś „{word}".' },
    { type: 'opposite', prompt: 'Co jest przeciwieństwem „{word}"? Kiedy jedno przechodzi w drugie?' },
    { type: 'body', prompt: 'Gdzie w ciele czujesz „{word}"? Jak to odczuwasz fizycznie?' },
    { type: 'letter', prompt: 'Napisz krótki list do „{word}": Co powiedziałbyś/abyś temu uczuciu?' },
    { type: 'color', prompt: 'Jaki kolor ma „{word}" dla ciebie? Dlaczego?' },
    { type: 'advice', prompt: 'Co powiedziałbyś/abyś przyjacielowi, który czuje „{word}"?' }
  ],
  el: [
    { type: 'write', prompt: 'Γράψε μια πρόταση με τη λέξη «{word}».' },
    { type: 'describe', prompt: 'Περιέγραψε μια κατάσταση που ένιωσες «{word}».' },
    { type: 'opposite', prompt: 'Ποιο είναι το αντίθετο του «{word}»; Πότε μετατρέπεται το ένα στο άλλο;' },
    { type: 'body', prompt: 'Πού στο σώμα σου νιώθεις «{word}»; Πώς αισθάνεσαι σωματικά;' },
    { type: 'letter', prompt: 'Γράψε ένα σύντομο γράμμα στο «{word}»: Τι θα έλεγες σε αυτό το συναίσθημα;' },
    { type: 'color', prompt: 'Τι χρώμα έχει το «{word}» για σένα; Γιατί;' },
    { type: 'advice', prompt: 'Τι θα έλεγες σε ένα φίλο που νιώθει «{word}»;' }
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
  { id: 'new',      emoji: '⬜', de: 'Neu',        vi: 'Mới',       en: 'New',       tr: 'Yeni',       ar: 'جديد',      es: 'Nuevo',      fr: 'Nouveau',       uk: 'Нове',       pl: 'Nowe',        el: 'Νέο',          minCorrect: 0 },
  { id: 'learning', emoji: '🟨', de: 'Lernend',    vi: 'Đang học',  en: 'Learning',  tr: 'Öğreniyor',  ar: 'يتعلم',     es: 'Aprendiendo', fr: 'En apprentissage', uk: 'Вивчається', pl: 'W nauce',    el: 'Μαθαίνεις',    minCorrect: 2 },
  { id: 'known',    emoji: '🟩', de: 'Bekannt',    vi: 'Đã biết',   en: 'Known',     tr: 'Bilinen',    ar: 'معروف',     es: 'Conocido',   fr: 'Connu',         uk: 'Відоме',     pl: 'Znane',       el: 'Γνωστό',       minCorrect: 5 },
  { id: 'mastered', emoji: '⭐', de: 'Gemeistert', vi: 'Thành thạo', en: 'Mastered', tr: 'Ustalaşmış', ar: 'متقن',      es: 'Dominado',   fr: 'Maîtrisé',      uk: 'Опановане',  pl: 'Opanowane',   el: 'Κατακτημένο',  minCorrect: 10 }
];
