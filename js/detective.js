/**
 * Empathly — Emotion Detective Mode
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

    // ── New scenarios ──────────────────────────────────────────────────────────

    {
      id: 'sc_compliment',
      difficulty: 'easy',
      situation: {
        de: 'Tom bekommt ein Lob von seinem Chef. Er sagt sofort: „Ach, das war doch nichts Besonderes." Den Rest des Tages denkt er: Hab ich es wirklich verdient?',
        en: 'Tom receives praise from his boss. He immediately says: "Oh, it was nothing special." For the rest of the day he wonders: did I really deserve it?',
        vi: 'Tom được sếp khen. Anh ngay lập tức nói: "Ồ, điều đó chẳng có gì đặc biệt." Suốt buổi chiều anh tự hỏi: mình có thực sự xứng đáng không?',
      },
      surface_emotions: ['freude', 'dankbarkeit', 'scham', 'selbstzweifel', 'verletzlichkeit', 'unsicherheit'],
      hidden: 'selbstzweifel',
      persona_note: {
        de: 'Lob abzuwehren ist oft kein Bescheidenheit — es ist Selbstzweifel. Die Überzeugung, dass man es nicht verdient, ist lauter als jede Anerkennung von außen.',
        en: 'Deflecting praise is often not modesty — it is self-doubt. The belief that you do not deserve it is louder than any recognition from outside.',
      }
    },
    {
      id: 'sc_apology',
      difficulty: 'easy',
      situation: {
        de: 'Nach einem heftigen Streit entschuldigt sich Mias Freundin aufrichtig. Mia sagt: „Ist gut." Aber sie kann ihr wochenlang nicht in die Augen schauen.',
        en: 'After a big fight, Mia\'s friend sincerely apologizes. Mia says: "It\'s fine." But she cannot look her in the eyes for weeks.',
        vi: 'Sau một cuộc cãi vã lớn, bạn của Mia xin lỗi thành tâm. Mia nói: "Không sao." Nhưng cô không thể nhìn vào mắt bạn suốt nhiều tuần.',
      },
      surface_emotions: ['frieden', 'traurigkeit', 'scham', 'groll', 'enttaeuschung', 'verletzlichkeit'],
      hidden: 'groll',
      persona_note: {
        de: 'Wer sagt „Ist gut" und es nicht meint, trägt Groll — keinen Hass, aber einen stillen Stachel. Echter Friede braucht mehr als ein gesprochenes Wort.',
        en: 'Someone who says "it\'s fine" and doesn\'t mean it carries resentment — not hatred, but a quiet thorn. Real peace needs more than a spoken word.',
      }
    },
    {
      id: 'sc_goodbye_train',
      difficulty: 'easy',
      situation: {
        de: 'Felix zieht in eine neue Stadt. Er freut sich. Beim Abschied am Bahnhof hält er sich zusammen. Im Zug dreht er die Musik laut und schaut nicht aus dem Fenster.',
        en: 'Felix moves to a new city. He is excited. At the farewell at the station he holds himself together. On the train he turns the music up loud and does not look out of the window.',
        vi: 'Felix chuyển đến thành phố mới. Anh hào hứng. Khi chia tay ở ga, anh cố kìm nén. Trên tàu anh bật nhạc thật to và không nhìn ra cửa sổ.',
      },
      surface_emotions: ['freude', 'begeisterung', 'angst_gefuehl', 'traurigkeit', 'verletzlichkeit', 'sehnsucht'],
      hidden: 'traurigkeit',
      persona_note: {
        de: 'Musik auflaut stellen, wenn das Herz schmerzt, ist eine Form von Trauer — die Sorte, die man sich erlaubt, solange niemand zuschaut.',
        en: 'Turning the music up when your heart hurts is a form of grief — the kind you allow yourself as long as no one is watching.',
      }
    },
    {
      id: 'sc_social_likes',
      difficulty: 'medium',
      situation: {
        de: 'Yasmin postet ein Foto und bekommt 300 Likes. Sie checkt alle paar Minuten ihr Handy. Als keine neuen Likes kommen, fühlt sie sich seltsam hohl.',
        en: 'Yasmin posts a photo and gets 300 likes. She checks her phone every few minutes. When no new likes come, she feels strangely hollow.',
        vi: 'Yasmin đăng ảnh và nhận 300 lượt thích. Cô kiểm tra điện thoại mỗi vài phút. Khi không còn lượt thích mới, cô cảm thấy kỳ lạ và trống rỗng.',
      },
      surface_emotions: ['freude', 'begeisterung', 'unsicherheit', 'leere', 'angst_gefuehl', 'neid'],
      hidden: 'leere',
      persona_note: {
        de: 'Externe Bestätigung stillt kurzfristig — aber sie trägt nicht. Wenn 300 Likes nicht reichen, fragt man sich: Was suche ich wirklich?',
        en: 'External validation satisfies briefly — but it does not sustain. When 300 likes are not enough, the question becomes: what am I really looking for?',
      }
    },
    {
      id: 'sc_wedding_tears',
      difficulty: 'medium',
      situation: {
        de: 'Auf der Hochzeit seiner Schwester weint Daniel — aber nicht vor Freude. Er kann es sich selbst nicht erklären. Er lächelt trotzdem.',
        en: 'At his sister\'s wedding, Daniel cries — but not from joy. He cannot explain it to himself. He smiles anyway.',
        vi: 'Tại đám cưới của chị gái, Daniel khóc — nhưng không phải vì vui. Anh không thể tự giải thích. Anh vẫn mỉm cười.',
      },
      surface_emotions: ['freude', 'traurigkeit', 'nostalgie', 'sehnsucht', 'einsamkeit', 'verletzlichkeit'],
      hidden: 'sehnsucht',
      persona_note: {
        de: 'Manchmal weinen wir bei Hochzeiten nicht für die Braut, sondern für uns selbst — für etwas, das wir vermissen, noch suchen oder nie hatten.',
        en: 'Sometimes we cry at weddings not for the bride, but for ourselves — for something we miss, are still searching for, or never had.',
      }
    },
    {
      id: 'sc_anger_cry',
      difficulty: 'medium',
      situation: {
        de: 'Immer wenn Amir versucht, ein ernstes Gespräch zu führen, fängt er an zu weinen — statt wütend zu werden. Er schämt sich dafür und schweigt lieber.',
        en: 'Whenever Amir tries to have a serious conversation, he starts crying instead of getting angry. He is ashamed of this and prefers to stay silent.',
        vi: 'Mỗi khi Amir cố gắng nói chuyện nghiêm túc, anh lại khóc thay vì tức giận. Anh xấu hổ về điều này và thích im lặng hơn.',
      },
      surface_emotions: ['wut', 'scham', 'traurigkeit', 'ohnmacht', 'verletzlichkeit', 'hilflosigkeit'],
      hidden: 'ohnmacht',
      persona_note: {
        de: 'Weinen statt Wut ist oft Ohnmacht — der Körper sagt: „Ich weiß nicht, wie ich das ausdrücken soll." Das Schweigen danach ist das eigentliche Gewicht.',
        en: 'Crying instead of anger is often powerlessness — the body saying: "I do not know how to express this." The silence that follows is the real weight.',
      }
    },
    {
      id: 'sc_phone_check',
      difficulty: 'medium',
      situation: {
        de: 'Kai checkt sein Handy 80 Mal am Tag. Er weiß es. Er hasst es. Er tut es trotzdem. Er weiß nicht, wonach er sucht.',
        en: 'Kai checks his phone 80 times a day. He knows it. He hates it. He does it anyway. He does not know what he is looking for.',
        vi: 'Kai kiểm tra điện thoại 80 lần mỗi ngày. Anh biết. Anh ghét điều đó. Anh vẫn làm. Anh không biết mình đang tìm gì.',
      },
      surface_emotions: ['langeweile', 'einsamkeit', 'leere', 'ueberwachsamkeit', 'angst_gefuehl', 'verlorenheit'],
      hidden: 'einsamkeit',
      persona_note: {
        de: 'Endloses Handy-Scrollen ist selten Langeweile — es ist oft eine Suche nach Verbindung. Jede Benachrichtigung könnte bedeuten: Jemand denkt an mich.',
        en: 'Endless phone scrolling is rarely boredom — it is often a search for connection. Every notification could mean: someone is thinking of me.',
      }
    },
    {
      id: 'sc_helper',
      difficulty: 'medium',
      situation: {
        de: 'Nora ist immer die Erste, die hilft, und die Letzte, die um Hilfe bittet. In der Therapie stellt sie fest: Sie hilft anderen, um dem eigenen Schmerz nicht begegnen zu müssen.',
        en: 'Nora is always the first to help and the last to ask for help. In therapy she discovers: she helps others to avoid encountering her own pain.',
        vi: 'Nora luôn là người đầu tiên giúp đỡ và người cuối cùng nhờ giúp. Trong trị liệu cô nhận ra: cô giúp người khác để tránh đối mặt với nỗi đau của chính mình.',
      },
      surface_emotions: ['begeisterung', 'liebe', 'schuld', 'hilflosigkeit', 'verletzlichkeit', 'ueberforderung'],
      hidden: 'hilflosigkeit',
      persona_note: {
        de: 'Wer immer hilft, flüchtet oft vor sich selbst. Helfen gibt Kontrolle — und wo man kontrolliert, spürt man die eigene Hilflosigkeit nicht.',
        en: 'Those who always help are often fleeing from themselves. Helping gives a sense of control — and where there is control, one cannot feel one\'s own helplessness.',
      }
    },
    {
      id: 'sc_nothing_wrong',
      difficulty: 'hard',
      situation: {
        de: 'Sophies Leben ist „objektiv gut". Guter Job, lieber Partner, gesunde Kinder. Warum wacht sie um 3 Uhr nachts mit einem Gefühl auf, das sie nicht benennen kann?',
        en: 'Sophie\'s life is "objectively good." Good job, kind partner, healthy children. Why does she wake at 3am with a feeling she cannot name?',
        vi: 'Cuộc sống của Sophie "khách quan mà nói là tốt." Công việc tốt, bạn đời tử tế, con cái khỏe mạnh. Tại sao cô thức dậy lúc 3 giờ sáng với một cảm giác không thể đặt tên?',
      },
      surface_emotions: ['zufriedenheit', 'leere', 'verlorenheit', 'angst_gefuehl', 'sorge', 'nachdenklichkeit'],
      hidden: 'verlorenheit',
      persona_note: {
        de: 'Ein gutes Leben zu haben und sich darin verloren zu fühlen ist kein Undank — es ist ein Ruf des Selbst nach mehr Tiefe, mehr Wahrheit, mehr Lebendigkeit.',
        en: 'Having a good life and feeling lost within it is not ingratitude — it is the self calling for more depth, more truth, more aliveness.',
      }
    },
    {
      id: 'sc_numbness',
      difficulty: 'hard',
      situation: {
        de: 'Brunos Vater entschuldigt sich nach 20 Jahren. Bruno sagt die richtigen Worte. Aber er fühlt... nichts. Nur Müdigkeit.',
        en: 'Bruno\'s father apologizes after 20 years. Bruno says the right words. But he feels... nothing. Just tiredness.',
        vi: 'Cha của Bruno xin lỗi sau 20 năm. Bruno nói những lời đúng đắn. Nhưng anh cảm thấy... không có gì. Chỉ là mệt mỏi.',
      },
      surface_emotions: ['frieden', 'traurigkeit', 'wut', 'taubheit', 'leere', 'hoffnung'],
      hidden: 'taubheit',
      persona_note: {
        de: 'Taubheit ist kein Fehlen von Gefühlen — es ist Schutz. Nach langen Jahren des Schmerzes sperrt der Geist die Türen ab, bevor eine neue Verletzung eintreten kann.',
        en: 'Numbness is not the absence of feeling — it is protection. After long years of pain, the mind locks the doors before a new hurt can enter.',
      }
    },
    {
      id: 'sc_retirement',
      difficulty: 'hard',
      situation: {
        de: 'Nach 40 Jahren Arbeit geht Werner in Rente. Kollegen feiern ihn. Er lächelt. Zu Hause sitzt er vor dem Fernseher und weiß nicht, was er mit seinen Händen anfangen soll.',
        en: 'After 40 years of work, Werner retires. Colleagues celebrate him. He smiles. At home he sits in front of the TV and does not know what to do with his hands.',
        vi: 'Sau 40 năm làm việc, Werner về hưu. Đồng nghiệp tổ chức tiệc cho ông. Ông mỉm cười. Ở nhà ông ngồi trước TV và không biết làm gì với đôi tay.',
      },
      surface_emotions: ['frieden', 'leere', 'verlorenheit', 'traurigkeit', 'nostalgie', 'zufriedenheit'],
      hidden: 'verlorenheit',
      persona_note: {
        de: 'Wer 40 Jahre lang „Ich bin Buchhalter" war, verliert mit der Arbeit auch ein Stück Identität. Verlorensein nach der Rente ist kein Zeichen von Schwäche — sondern von Menschlichkeit.',
        en: 'Someone who was "the accountant" for 40 years loses a piece of identity with the job. Feeling lost after retirement is not weakness — it is humanity.',
      }
    },
    {
      id: 'sc_no',
      difficulty: 'hard',
      situation: {
        de: 'Pia hat in ihrem Leben noch nie Nein gesagt. Als sie es endlich tut — zu einer Party-Einladung — schläft sie drei Nächte nicht. Sie weiß nicht warum.',
        en: 'Pia has never said no in her life. When she finally does — to a party invitation — she cannot sleep for three nights. She does not know why.',
        vi: 'Pia chưa bao giờ nói không trong cuộc đời. Khi cuối cùng cô làm vậy — với lời mời dự tiệc — cô không ngủ được ba đêm. Cô không biết tại sao.',
      },
      surface_emotions: ['angst_gefuehl', 'schuld', 'verlassenheit', 'ueberwachsamkeit', 'verletzlichkeit', 'sorge'],
      hidden: 'verlassenheit',
      persona_note: {
        de: 'Wer nie Nein sagt, hat oft gelernt: Nein zu sagen bedeutet, verlassen zu werden. Das ist kein Charakter — das ist eine alte Wunde.',
        en: 'Those who never say no have often learned: saying no means being abandoned. That is not character — it is an old wound.',
      }
    },
    {
      id: 'sc_best_friend_job',
      difficulty: 'medium',
      situation: {
        de: 'Als ihre beste Freundin genau die Stelle bekommt, auf die Sara sich auch beworben hatte, gratuliert Sara aufrichtig. Abends kann sie nicht essen.',
        en: 'When her best friend gets exactly the job Sara had also applied for, Sara congratulates her sincerely. That evening she cannot eat.',
        vi: 'Khi người bạn thân nhất được nhận vào đúng vị trí mà Sara cũng ứng tuyển, Sara chúc mừng bạn thành tâm. Buổi tối cô không thể ăn được.',
      },
      surface_emotions: ['freude', 'neid', 'eifersucht', 'selbstzweifel', 'traurigkeit', 'einsamkeit'],
      hidden: 'selbstzweifel',
      persona_note: {
        de: 'Neid auf enge Freunde ist oft verkleiderter Selbstzweifel — nicht „Ich will, was du hast", sondern „Vielleicht bin ich nicht gut genug."',
        en: 'Envy toward close friends is often disguised self-doubt — not "I want what you have," but "maybe I am not good enough."',
      }
    },
    {
      id: 'sc_funeral_laugh',
      difficulty: 'hard',
      situation: {
        de: 'Beim Begräbnis seines Großvaters muss Tom plötzlich lachen. Er kann es nicht aufhalten. Er ist entsetzt über sich selbst. Alle schauen.',
        en: 'At his grandfather\'s funeral, Tom suddenly cannot stop laughing. He cannot stop it. He is horrified at himself. Everyone stares.',
        vi: 'Tại đám tang ông nội, Tom đột nhiên không thể ngừng cười. Anh không thể dừng lại. Anh kinh hoàng với bản thân. Mọi người nhìn chằm chằm.',
      },
      surface_emotions: ['scham', 'traurigkeit', 'wut', 'ohnmacht', 'angst_gefuehl', 'verletzlichkeit'],
      hidden: 'ohnmacht',
      persona_note: {
        de: 'Lachen bei Trauer ist ein bekanntes Phänomen — das Nervensystem sucht Entlastung. Es ist nicht Respektlosigkeit, sondern Ohnmacht gegenüber dem überwältigenden Schmerz.',
        en: 'Laughing in grief is a known phenomenon — the nervous system searches for relief. It is not disrespect, it is powerlessness in the face of overwhelming pain.',
      }
    },
    {
      id: 'sc_hardening',
      difficulty: 'hard',
      situation: {
        de: 'Als der Hund der Familie stirbt, weinen alle. Außer Vater. Er spricht sofort davon, einen neuen zu holen.',
        en: 'When the family dog dies, everyone cries. Except Father. He immediately starts talking about getting a new one.',
        vi: 'Khi con chó của gia đình chết, tất cả đều khóc. Ngoại trừ cha. Ông ngay lập tức nói về việc mua con mới.',
      },
      surface_emotions: ['traurigkeit', 'scham', 'verhaertung', 'einsamkeit', 'verletzlichkeit', 'schuld'],
      hidden: 'verhaertung',
      persona_note: {
        de: 'Sofort nach vorne schauen, wenn man trauern sollte, ist oft Verhärtung — ein erlerntes Schutzmuster, das sagt: Fühlen ist gefährlich. Weitermachen ist sicher.',
        en: 'Immediately looking forward when one should grieve is often hardening — a learned protective pattern that says: feeling is dangerous. Moving on is safe.',
      }
    },
    {
      id: 'sc_control',
      difficulty: 'medium',
      situation: {
        de: 'Vor jedem Urlaub prüft Luca zehnmal das Wetter, packt und packt die Koffer um. Sein Partner lacht darüber. Luca selbst findet es erschöpfend.',
        en: 'Before every holiday, Luca checks the weather ten times and repacks his bags repeatedly. His partner finds it funny. Luca himself finds it exhausting.',
        vi: 'Trước mỗi kỳ nghỉ, Luca kiểm tra thời tiết mười lần và đóng gói lại hành lý liên tục. Bạn đời thấy buồn cười. Còn Luca thấy mệt mỏi.',
      },
      surface_emotions: ['ueberwachsamkeit', 'angst_gefuehl', 'ueberforderung', 'kontrollverlust', 'nervositaet', 'sorge'],
      hidden: 'kontrollverlust',
      persona_note: {
        de: 'Zwanghaftes Kontrollieren ist der Versuch, Kontrollverlust zu verhindern. Ironischerweise erschöpft es uns genau mit dem, wovor wir Angst haben: der Ohnmacht.',
        en: 'Compulsive checking is an attempt to prevent loss of control. Ironically, it exhausts us with exactly what we fear: powerlessness.',
      }
    },
    {
      id: 'sc_mirror',
      difficulty: 'hard',
      situation: {
        de: 'Dina meidet Spiegel. Nicht weil sie sich hässlich findet — sondern weil sie der Person darin nicht begegnen will.',
        en: 'Dina avoids mirrors. Not because she thinks she is ugly — but because she does not want to encounter the person she sees there.',
        vi: 'Dina tránh gương. Không phải vì cô nghĩ mình xấu — mà vì cô không muốn đối mặt với người cô thấy trong đó.',
      },
      surface_emotions: ['scham', 'selbstzweifel', 'angst_gefuehl', 'einsamkeit', 'traurigkeit', 'selbstverurteilung'],
      hidden: 'selbstverurteilung',
      persona_note: {
        de: 'Spiegel zu meiden ist oft keine Körperbildstörung — es ist die Flucht vor der eigenen Stimme, die urteilt. Die strenge Richterin sitzt innen, nicht außen.',
        en: 'Avoiding mirrors is often not a body image disorder — it is flight from one\'s own judging voice. The harsh judge sits inside, not outside.',
      }
    },
    {
      id: 'sc_saying_fine',
      difficulty: 'easy',
      situation: {
        de: 'Auf die Frage „Wie geht\'s?" antwortet Ravi immer „Gut, danke." Auch wenn er gerade einen schlechten Tag hat. Auch wenn er weinen möchte.',
        en: 'When asked "How are you?", Ravi always answers "Fine, thanks." Even when he is having a bad day. Even when he wants to cry.',
        vi: 'Khi được hỏi "Bạn khỏe không?", Ravi luôn trả lời "Tốt, cảm ơn." Dù đang trải qua ngày tệ. Dù muốn khóc.',
      },
      surface_emotions: ['traurigkeit', 'scham', 'einsamkeit', 'verletzlichkeit', 'angst_gefuehl', 'ueberforderung'],
      hidden: 'einsamkeit',
      persona_note: {
        de: '„Gut, danke" kann die einsamste Antwort der Welt sein — weil sie bedeutet: Ich zeige mich dir nicht wirklich. Und das macht uns noch einsamer.',
        en: '"Fine, thanks" can be the loneliest answer in the world — because it means: I am not really showing myself to you. And that makes us even more alone.',
      }
    },
    {
      id: 'sc_bitterness',
      difficulty: 'hard',
      situation: {
        de: 'Rolf war einmal voller Ideen und Pläne. Jetzt sagt er über jüngere Kollegen: „Die werden schon sehen." Er glaubt selbst nicht mehr daran, dass sich etwas ändert.',
        en: 'Rolf was once full of ideas and plans. Now he says about younger colleagues: "They will see." He no longer believes himself that anything will change.',
        vi: 'Rolf từng đầy ý tưởng và kế hoạch. Bây giờ anh nói về các đồng nghiệp trẻ hơn: "Rồi họ sẽ thấy." Anh không còn tin bản thân rằng mọi thứ sẽ thay đổi.',
      },
      surface_emotions: ['wut', 'neid', 'resignation', 'bitterkeit', 'hoffnungslosigkeit', 'zynismus'],
      hidden: 'bitterkeit',
      persona_note: {
        de: 'Bitterkeit ist geronnene Enttäuschung — Trauer, die keine Sprache gefunden hat und sich in Zynismus verwandelt. Dahinter wohnt oft ein Mensch, der sich viel erhofft hatte.',
        en: 'Bitterness is congealed disappointment — grief that found no language and transformed into cynicism. Behind it often lives a person who had hoped for much.',
      }
    },
    {
      id: 'sc_oversharing',
      difficulty: 'medium',
      situation: {
        de: 'In jedem Gespräch erzählt Lena sofort sehr Persönliches — über ihre Krisen, ihre Familie, ihre Ängste. Menschen ziehen sich zurück. Sie versteht nicht warum.',
        en: 'In every conversation, Lena immediately shares very personal things — about her crises, her family, her fears. People pull back. She does not understand why.',
        vi: 'Trong mọi cuộc trò chuyện, Lena ngay lập tức chia sẻ những điều rất riêng tư — về khủng hoảng, gia đình, nỗi sợ. Mọi người rút lui. Cô không hiểu tại sao.',
      },
      surface_emotions: ['einsamkeit', 'verletzlichkeit', 'angst_gefuehl', 'verbundenheit', 'verlassenheit', 'ueberforderung'],
      hidden: 'verlassenheit',
      persona_note: {
        de: 'Zu schnell zu viel teilen ist oft keine Offenheit — es ist der Schrei nach Verbindung von jemandem, der Verlassenheit kennt. Die Nähe, die man zu erzwingen versucht, entsteht so nicht.',
        en: 'Sharing too much too fast is often not openness — it is the cry for connection from someone who knows abandonment. The closeness one tries to force does not grow this way.',
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
          reflection_prompt: 'Kennst du das aus deinem Leben?',
          reflection_placeholder: 'Schreib hier... (optional)',
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
          reflection_prompt: 'Do you recognize this from your own life?',
          reflection_placeholder: 'Write here... (optional)',
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
          reflection_prompt: 'Bạn có nhận ra điều này trong cuộc sống của mình không?',
          reflection_placeholder: 'Viết ở đây... (tùy chọn)',
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
          reflection_prompt: 'Το αναγνωρίζεις αυτό από τη ζωή σου;',
          reflection_placeholder: 'Γράψε εδώ... (προαιρετικό)',
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
        ${isCorrect ? `
        <div class="det-reflection">
          <label class="det-reflection-label">${T.reflection_prompt || 'Kennst du das aus deinem Leben?'}</label>
          <textarea class="det-reflection-input" rows="2" placeholder="${T.reflection_placeholder || 'Schreib hier... (optional)'}"></textarea>
        </div>` : ''}
        <button class="det-next-btn btn btn-primary">
          ${index + 1 < total ? T.next : T.results}
        </button>`;

      const caseFile = container.querySelector('.det-case-file');
      if (caseFile) caseFile.appendChild(reveal);
      requestAnimationFrame(() => reveal.classList.add('visible'));

      reveal.querySelector('.det-next-btn').addEventListener('click', () => {
        // Save reflection if written
        if (isCorrect) {
          const textarea = reveal.querySelector('.det-reflection-input');
          if (textarea && textarea.value.trim()) {
            const reflections = JSON.parse(localStorage.getItem('empathly-detective-reflections') || '[]');
            reflections.push({
              date: new Date().toISOString().split('T')[0],
              scenarioId: sc.id,
              emotionId: sc.hidden,
              text: textarea.value.trim()
            });
            if (reflections.length > 50) reflections.shift(); // keep last 50
            localStorage.setItem('empathly-detective-reflections', JSON.stringify(reflections));
          }
        }
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
        if (onComplete) onComplete(score, total);
      });
    }

    render();
  }

  return { initDetectiveMode, SCENARIOS };
})();
