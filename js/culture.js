/**
 * Gefühle-Memory — Cultural Bridge / Kulturbrücke
 * The subtle differences in how emotions live across cultures.
 *
 * Not every emotion has a note — only where the cultural gap
 * is interesting, surprising, or healing to understand.
 *
 * Format: { emotionId: { de: "...", vi: "...", en: "...", el: "..." } }
 */

const CULTURE_NOTES = {

  // ── 🌟 Licht & Weite ──────────────────────────────

  freude: {
    de: 'In Deutschland zeigt man Freude oft zurückhaltend — zu viel Begeisterung gilt schnell als „übertrieben". Man freut sich leise.',
    vi: 'Trong văn hóa Việt Nam, niềm vui thường được chia sẻ tập thể — một người vui là cả nhà vui. Niềm vui riêng lẻ cảm thấy chưa trọn vẹn.',
    en: 'Germans often express joy quietly — too much enthusiasm can feel "over the top". In Vietnam, joy is collective — one person\'s happiness belongs to the whole family.',
    el: 'Στην Ελλάδα η χαρά δεν κρύβεται — φωνάζουμε, χορεύουμε, σπάμε πιάτα! Η χαρά είναι κοινοτική υπόθεση: αν δεν τη μοιραστείς, δεν μετράει. Το κέφι μας είναι μεταδοτικό και δεν ζητάμε συγγνώμη γι\' αυτό.'
  },

  dankbarkeit: {
    de: '„Danke" sagt man in Deutschland oft — aber tiefe Dankbarkeit auszusprechen fühlt sich schnell verletzlich an. Man zeigt sie lieber durch Taten.',
    vi: 'Người Việt thường không nói "cảm ơn" trong gia đình — vì sự biết ơn được thể hiện qua hành động, không qua lời nói. Nói "cảm ơn" với bố mẹ có thể cảm thấy xa cách.',
    en: 'Germans say "Danke" often but struggle with deep gratitude — it feels vulnerable. Vietnamese rarely say "thank you" within family — gratitude is shown through actions, not words. Saying it can feel oddly distant.',
    el: 'Εμείς οι Έλληνες εκφράζουμε την ευγνωμοσύνη μέσα από τη φιλοξενία — σου ανοίγουμε το σπίτι, σου δίνουμε φαγητό, σε κάνουμε να νιώσεις σαν οικογένεια. Δεν λέμε πάντα «ευχαριστώ» — σου δείχνουμε ότι σε εκτιμούμε βάζοντας ένα γεμάτο πιάτο μπροστά σου.'
  },

  zaertlichkeit: {
    de: 'Körperliche Zärtlichkeit in der Öffentlichkeit? In Deutschland okay, aber viele sind trotzdem zurückhaltend. Zärtlichkeit wird oft durch Worte statt Berührung gezeigt.',
    vi: 'Người Việt hiếm khi thể hiện sự âu yếm trước mặt người khác. Ôm nhau hay nói "anh yêu em" ở nơi công cộng vẫn còn rất hiếm. Tình cảm sống trong những hành động nhỏ: nấu ăn, lo lắng, hỏi "ăn cơm chưa?"',
    en: 'Vietnamese rarely show physical affection in public — no hugging, no "I love you" out loud. Love lives in small acts: cooking for someone, worrying about them, asking "have you eaten yet?" (ăn cơm chưa?) — the most Vietnamese way to say "I care".',
    el: 'Εμείς οι Έλληνες αγγίζουμε, αγκαλιάζουμε, φιλάμε — χωρίς δεύτερη σκέψη. Φιλιά στα μάγουλα, χέρι στον ώμο, αγκαλιές ακόμα και μεταξύ αντρών. Η τρυφερότητα είναι σωματική και δεν ντρεπόμαστε γι\' αυτό.'
  },

  liebe: {
    de: '„Ich liebe dich" — drei Worte, die in Deutschland oft schwer über die Lippen kommen. Viele sagen es erst nach Monaten. Es wiegt schwer.',
    vi: '"Anh yêu em" — nhiều người Việt chưa bao giờ nói câu này với bố mẹ. Tình yêu gia đình không cần lời nói — nó tồn tại trong sự hy sinh hàng ngày. Nhưng thế hệ trẻ đang bắt đầu thay đổi.',
    en: '"I love you" is heavy in German culture — said rarely, meant deeply. Many Vietnamese have never said it to their parents. Family love doesn\'t need words — it exists in daily sacrifice. But younger generations are starting to change this.',
    el: '«Σ\' αγαπώ» — το λέμε εύκολα, δυνατά, χωρίς φόβο. Στην Ελλάδα η αγάπη είναι θορυβώδης: φωνάζουμε, μαλώνουμε, και αγαπάμε με πάθος. Η οικογένεια είναι τα πάντα — η μάνα είναι ιερή. Η αγάπη δεν είναι ήσυχη ποτέ.'
  },

  vertrauen: {
    de: 'Vertrauen wird in Deutschland langsam aufgebaut und schnell zerstört. „Vertrauen ist gut, Kontrolle ist besser" — ein deutsches Sprichwort.',
    vi: 'Người Việt thường tin tưởng gia đình tuyệt đối, nhưng cẩn thận với người ngoài. "Tin người thì được, nhưng tin mình trước." Sự tin tưởng chảy theo dòng máu.',
    en: 'Germans build trust slowly and systematically — "trust is good, control is better" is an actual German proverb. Vietnamese trust family absolutely but are cautious with outsiders. Trust flows through bloodlines.',
    el: 'Στην Ελλάδα η εμπιστοσύνη χτίζεται γύρω από την παρέα — τους στενούς σου φίλους που γίνονται σαν οικογένεια. Στον ξένο δείχνουμε φιλοξενία, αλλά η βαθιά εμπιστοσύνη δίνεται μόνο στους «δικούς μας». Η λέξη «μάγκας» σημαίνει κάποιον που μπορείς να εμπιστευτείς.'
  },

  // ── 🌊 Sanfte Mitte ──────────────────────────────

  sehnsucht: {
    de: '„Sehnsucht" ist eines der berühmtesten unübersetzbaren deutschen Wörter. Eine tiefe, schmerzhafte Sehnsucht nach etwas, das vielleicht nie existiert hat. Die Deutschen haben dafür ein eigenes Wort — das sagt alles.',
    vi: '"Nhớ nhung" — nỗi nhớ trong tiếng Việt luôn gắn liền với xa cách. Người Việt xa xứ mang nỗi nhớ nhung như một vết thương không bao giờ lành. Nhớ mùi phở, nhớ tiếng mưa, nhớ giọng nói của mẹ.',
    en: '"Sehnsucht" is one of German\'s most famous untranslatable words — a deep, painful longing for something that may never have existed. "Nhớ nhung" in Vietnamese is always tied to physical distance — diaspora Vietnamese carry it like an open wound. Missing the smell of phở, the sound of rain, a mother\'s voice.',
    el: 'Οι Έλληνες γνωρίζουμε βαθιά τον πόθο — η ξενιτιά μας σημάδεψε. Εκατομμύρια Έλληνες σε Αμερική, Αυστραλία, Γερμανία νοσταλγούν τη θάλασσα, τη γιαγιά, το χωριό. Η λέξη «ξενιτιά» κουβαλάει τον πόνο ολόκληρων γενεών.'
  },

  nostalgie: {
    de: 'Deutsche Nostalgie ist kompliziert — die Geschichte macht es schwer, unkritisch auf „die gute alte Zeit" zurückzublicken. Nostalgie muss immer reflektiert sein.',
    vi: 'Hoài niệm Việt Nam thường gắn với quê hương và gia đình. Người Việt xa xứ có thể hoài niệm về một Việt Nam mà họ chưa bao giờ sống — qua câu chuyện của bố mẹ.',
    en: 'German nostalgia is complicated — history makes it hard to look back uncritically at "the good old days". Vietnamese nostalgia often centers on homeland — diaspora kids can be nostalgic for a Vietnam they never lived in, built from their parents\' stories.',
    el: 'Η νοσταλγία μας είναι αρχαία — η ίδια η λέξη είναι ελληνική: νόστος (επιστροφή) και άλγος (πόνος). Ο Οδυσσέας είναι ο πρώτος νοσταλγός. Κάθε Έλληνας της διασποράς κουβαλάει μέσα του τον δικό του Οδυσσέα.'
  },

  melancholie: {
    de: 'Melancholie hat in der deutschen Kultur einen fast edlen Status — Dichter, Musiker, Philosophen. Es ist erlaubt, melancholisch zu sein. Fast erwartet.',
    vi: 'Trong văn hóa Việt Nam, sự buồn man mác thường được thể hiện qua thơ ca và nhạc — nhưng không qua cuộc trò chuyện hàng ngày. "Buồn gì?" - "Không có gì." Nỗi buồn đẹp tồn tại trong nghệ thuật, không trong lời nói.',
    en: 'Melancholy has an almost noble status in German culture — poets, musicians, philosophers embraced it. In Vietnam, gentle sadness flows through poetry and music but rarely through conversation. "What\'s wrong?" — "Nothing." Beautiful sadness lives in art, not in words.',
    el: 'Η μελαγχολία στην Ελλάδα ζει στο ρεμπέτικο — τη μουσική των περιθωριοποιημένων, των ξεριζωμένων. Τραγουδάμε τον πόνο μας δυνατά, σε ταβέρνες, με μπουζούκι. Η ελληνική μελαγχολία δεν είναι σιωπηλή — βγαίνει ως τραγούδι.'
  },

  verletzlichkeit: {
    de: 'Sich verletzlich zu zeigen gilt in Deutschland oft als Schwäche — besonders bei Männern. „Reiß dich zusammen" ist ein Satz, den viele als Kind gehört haben.',
    vi: 'Trong văn hóa Việt Nam, thể hiện sự yếu đuối là mất mặt — không chỉ cho mình mà cho cả gia đình. Đặc biệt đàn ông Việt Nam hiếm khi được phép khóc. "Con trai không được khóc."',
    en: 'Showing vulnerability is often seen as weakness in Germany — especially for men. "Pull yourself together" is a phrase many heard as children. In Vietnam, showing weakness means losing face — not just yours, but your family\'s. "Boys don\'t cry" exists in both cultures.',
    el: 'Στην Ελλάδα η ευαλωτότητα έχει δύο πρόσωπα: οι άντρες «δεν κλαίνε» — αλλά ταυτόχρονα, στο γλέντι ή στην κηδεία, το κλάμα είναι αποδεκτό. Οι γυναίκες μοιρολογούν δυνατά, θρηνούν με το σώμα τους. Η ευαλωτότητα είναι θέμα πλαισίου, όχι απαγόρευσης.'
  },

  // ── 🌑 Schwere & Tiefe ──────────────────────────────

  traurigkeit: {
    de: 'In Deutschland ist es gesellschaftlich akzeptierter, traurig zu sein — es gibt sogar ein Recht auf Trauer (Trauerurlaub). Aber „wie geht\'s?" wird trotzdem meist mit „gut" beantwortet.',
    vi: 'Người Việt thường giấu nỗi buồn đằng sau nụ cười. "Không sao" (không sao đâu) — câu nói phổ biến nhất khi ai đó đau khổ. Khóc trước mặt người khác vẫn là điều nhiều người tránh.',
    en: 'Germany has bereavement leave built into law — sadness has institutional recognition. Yet "how are you?" still gets answered with "fine." Vietnamese hide sadness behind smiles. "Không sao" (it\'s nothing) — the most common response to someone in pain.',
    el: 'Στην Ελλάδα η λύπη εκφράζεται ανοιχτά — ειδικά στο πένθος. Τα μοιρολόγια, ο θρήνος, τα μαύρα ρούχα για χρόνια. Δεν κρύβουμε τη θλίψη — τη ζούμε δημόσια. Η κοινότητα έρχεται κοντά, φέρνει φαγητό, κάθεται μαζί σου στη σιωπή.'
  },

  einsamkeit: {
    de: 'Deutschland ist eines der Länder mit den meisten Single-Haushalten weltweit. Einsamkeit ist ein stilles Massenphänomen — aber darüber reden? Schwer.',
    vi: 'Khái niệm "cô đơn" trong văn hóa Việt Nam gần như không tồn tại theo nghĩa phương Tây — vì gia đình luôn ở đó. Nhưng người Việt xa xứ hiểu sự cô đơn sâu sắc hơn ai hết: cô đơn giữa hai nền văn hóa.',
    en: 'Germany has one of the highest rates of single-person households in the world. Loneliness is a silent epidemic. In traditional Vietnamese culture, loneliness barely exists as a concept — family is always there. But diaspora Vietnamese know a deeper loneliness: being caught between two cultures, fully belonging to neither.',
    el: 'Η μοναξιά στην Ελλάδα είναι σχεδόν αδιανόητη — πάντα υπάρχει κάποιος: η μάνα, ο γείτονας, ο καφετζής. Αλλά στην ξενιτιά, οι Έλληνες νιώθουν μια μοναξιά που δεν ήξεραν ότι υπάρχει. Γι\' αυτό φτιάχνουμε ελληνικές κοινότητες παντού στον κόσμο.'
  },

  scham: {
    de: 'Scham in Deutschland ist sehr individuell: „Ich habe etwas Falsches getan." Es geht um die eigene Handlung.',
    vi: 'Xấu hổ trong văn hóa Việt Nam là tập thể: "Tôi đã làm mất mặt gia đình." Sự xấu hổ không chỉ thuộc về bạn — nó thuộc về cả dòng họ. "Mất mặt" (losing face) là một trong những nỗi sợ lớn nhất.',
    en: 'Shame in Germany is individual: "I did something wrong." In Vietnam, shame is collective: "I brought shame to my family." It doesn\'t just belong to you — it belongs to your entire lineage. "Mất mặt" (losing face) is one of the deepest fears.',
    el: 'Η ντροπή στην Ελλάδα είναι βαθιά κοινωνική — «τι θα πει ο κόσμος;» Η ντροπή δεν αφορά μόνο εσένα, αλλά την οικογένεια, το σόι, ακόμα και το χωριό. Το φιλότιμο — η τιμή μπροστά στους άλλους — είναι ο αντίποδας της ντροπής. Χωρίς φιλότιμο, δεν είσαι τίποτα.'
  },

  schuld: {
    de: 'Deutschland hat eine einzigartige Beziehung zu kollektiver Schuld — die Aufarbeitung der Geschichte hat „Schuld" zu einem gesellschaftlichen Dauerthema gemacht.',
    vi: 'Trong văn hóa Việt Nam, tội lỗi thường gắn với đạo hiếu — cảm giác có lỗi khi không đủ hiếu thảo với bố mẹ. Đặc biệt thế hệ thứ hai ở nước ngoài: "Bố mẹ đã hy sinh tất cả, mà mình..."',
    en: 'Germany has a unique relationship with collective guilt — processing history has made "Schuld" (guilt) a permanent societal theme. Vietnamese guilt is often tied to filial piety — feeling guilty for not being a good enough child. Especially second-generation diaspora: "My parents sacrificed everything, and I..."',
    el: 'Η ενοχή στην ελληνική κουλτούρα έχει βαθιές ρίζες — ορθόδοξη εκκλησία, οικογενειακό καθήκον, κοινωνική πίεση. «Η μάνα σου θυσιάστηκε για σένα» — αυτή η φράση μπορεί να σε στοιχειώνει μια ζωή. Η ελληνική ενοχή είναι σχεσιακή: νιώθεις ένοχος απέναντι σε πρόσωπα, όχι σε κανόνες.'
  },

  // ── 🔥 Sturm & Reibung ──────────────────────────────

  wut: {
    de: 'Wut zeigen ist in Deutschland eher akzeptiert als in vielen asiatischen Kulturen — aber trotzdem reguliert. Laut werden im Büro? Geht nicht. Laut werden beim Fußball? Normal.',
    vi: 'Thể hiện sự tức giận trực tiếp trong văn hóa Việt Nam là điều rất hiếm và bị coi là mất kiểm soát. Sự giận dữ thường được nuốt xuống hoặc thể hiện gián tiếp — qua im lặng, qua ánh mắt, qua người thứ ba.',
    en: 'Expressing anger directly is more accepted in Germany than in many Asian cultures — but still regulated. Raising your voice at work? No. At a football match? Fine. In Vietnamese culture, direct anger is rare and seen as loss of control. Anger is often swallowed or expressed indirectly — through silence, through glances, through a third person.',
    el: 'Στην Ελλάδα ο θυμός εκφράζεται ελεύθερα — φωνάζουμε, κάνουμε χειρονομίες, μαλώνουμε δυνατά. Και πέντε λεπτά μετά; Τελείωσε, πάμε για καφέ. Ο ελληνικός θυμός είναι σαν καταιγίδα: έρχεται γρήγορα, φεύγει γρήγορα. Δεν τον κρατάμε μέσα μας.'
  },

  trotz: {
    de: '„Trotzphase" — im Deutschen gibt es sogar ein eigenes Wort für die Trotzphase von Kleinkindern. Trotz wird als Entwicklungsschritt gesehen.',
    vi: 'Bướng bỉnh trong văn hóa Việt Nam bị coi là bất hiếu — đặc biệt khi đối với bố mẹ hoặc người lớn tuổi. "Cãi lại bố mẹ" là một trong những điều tồi tệ nhất mà con cái có thể làm.',
    en: 'German has a special word "Trotzphase" for children\'s defiant phase — it\'s seen as healthy development. In Vietnamese culture, defiance toward parents or elders is one of the worst things a child can do. "Cãi lại bố mẹ" (talking back to parents) carries deep stigma.',
    el: 'Στην Ελλάδα το πείσμα είναι εθνικό χαρακτηριστικό — λέμε «είναι πεισματάρης σαν Έλληνας» με υπερηφάνεια! Τα παιδιά μαθαίνουν να έχουν γνώμη νωρίς. Αλλά πείσμα προς τους γονείς; Η γιαγιά θα σου πει: «Θα φας ξύλο.»'
  },

  // ── ⚡ Angst & Schutz ──────────────────────────────

  angst_gefuehl: {
    de: '„Angst" ist so deutsch, dass das Wort direkt ins Englische übernommen wurde. Deutsche planen gerne voraus — Angst vor dem Unbekannten treibt eine Kultur der Versicherungen und Vorsorge.',
    vi: 'Người Việt thường không nói trực tiếp về nỗi sợ — sợ bị coi là yếu đuối. Nhưng sự lo lắng thường thể hiện qua sự bảo vệ quá mức: "Đừng đi ra ngoài khuya!" "Ăn đi, gầy quá!"',
    en: '"Angst" is so German that English borrowed the word directly. Germans plan ahead obsessively — fear of the unknown drives a culture of insurance and preparation. Vietnamese rarely name their fears directly, but anxiety shows through overprotection: "Don\'t go out late!" "Eat more, you\'re too thin!"',
    el: 'Στην Ελλάδα δεν σχεδιάζουμε τόσο — ζούμε πιο πολύ στο «τώρα». Αλλά ο φόβος υπάρχει: το μάτι (κακό μάτι), η βασκανία. Η γιαγιά σου θα σε ξεματιάσει πριν καν ονομάσεις τον φόβο σου. Η ελληνική αντιμετώπιση του φόβου είναι μαγική, κυριολεκτικά.'
  },

  // ── 🌘 Verdeckte Schatten ──────────────────────────────

  resignation: {
    de: 'Deutsche Resignation äußert sich oft als Zynismus oder schwarzer Humor — „wird eh nichts" ist eine Schutzstrategie.',
    vi: 'Trong văn hóa Việt Nam, buông xuôi thường mang hình thức chấp nhận số phận: "Số mình nó vậy." Đây không phải là thua cuộc — mà là triết lý: chấp nhận những gì không thể thay đổi.',
    en: 'German resignation often manifests as cynicism or dark humor — "it won\'t work anyway" is a protective strategy. Vietnamese resignation takes the form of fate acceptance: "Số mình nó vậy" (that\'s my destiny). It\'s not giving up — it\'s philosophy: accepting what cannot be changed.',
    el: 'Η ελληνική παραίτηση λέγεται «μοιρολατρία» — αποδοχή της μοίρας. «Έτσι ήταν γραφτό.» Αλλά πίσω από αυτή κρύβεται κάτι πιο βαθύ: η πίστη ότι κάποια πράγματα ξεπερνούν τον ανθρώπινο έλεγχο — και αυτό δεν είναι αδυναμία, είναι σοφία.'
  },

  zynismus: {
    de: 'Deutschland hat eine lange Tradition des intellektuellen Zynismus — von Schopenhauer bis heute. Zynismus gilt fast als Zeichen von Intelligenz.',
    vi: 'Sự châm biếm trong văn hóa Việt Nam thường nhẹ nhàng hơn — thể hiện qua câu nói đùa, qua ca dao, qua câu chuyện ngụ ngôn. Trực tiếp châm biếm bị coi là thiếu tế nhị.',
    en: 'Germany has a long tradition of intellectual cynicism — from Schopenhauer to today. Cynicism is almost a badge of intelligence. Vietnamese cynicism is gentler — expressed through jokes, proverbs, folk tales. Direct cynicism is considered lacking in tact.',
    el: 'Οι αρχαίοι Κυνικοί ήταν Έλληνες — ο Διογένης ζούσε σε βαρέλι! Ο κυνισμός έχει ελληνικές ρίζες, κυριολεκτικά. Σήμερα, ο ελληνικός κυνισμός εκφράζεται μέσω χιούμορ — κοφτερό, πολιτικό, αυτοσαρκαστικό. Γελάμε για να μην κλάψουμε.'
  },

  hoffnungsmuedigkeit: {
    de: 'Ein typisch deutsches Gefühl: Man hat so oft gehofft und wurde enttäuscht, dass man müde wird vom Hoffen. Aber man gibt nicht auf — man hofft leiser.',
    vi: 'Thế hệ Việt Nam trải qua chiến tranh, di cư, và xây dựng lại biết rõ sự mệt mỏi vì hy vọng. Nhưng có câu: "Còn nước còn tát." Dù mệt, họ vẫn tát nước.',
    en: 'A very German feeling: you\'ve hoped so often and been disappointed so many times that you grow tired of hoping. But you don\'t stop — you just hope more quietly. Vietnamese who survived war, migration, and rebuilding know hope fatigue intimately. But there\'s a saying: "Còn nước còn tát" — as long as there\'s water, keep bailing. Even when tired, they keep going.',
    el: 'Η Ελλάδα γνωρίζει την κόπωση της ελπίδας — κρίση χρέους, λιτότητα, μετανάστευση νέων. Αλλά ο Έλληνας δεν σταματά να ελπίζει — απλά πίνει ένα τσίπουρο, κοιτάζει τη θάλασσα, και λέει «αύριο θα είναι καλύτερα». Η ελπίδα μας είναι πεισματάρικη.'
  }
};

/**
 * Get cultural note for an emotion in a given language
 * Returns null if no cultural note exists for this emotion
 */
function getCultureNote(emotionId, lang) {
  const note = CULTURE_NOTES[emotionId];
  if (!note) return null;
  return note[lang] || note.en || null;
}

/**
 * Check if an emotion has cultural notes
 */
function hasCultureNote(emotionId) {
  return !!CULTURE_NOTES[emotionId];
}
