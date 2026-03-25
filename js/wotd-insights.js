/**
 * Gefühle-Memory — Word of the Day Deep Insights
 * Rich psychological, cultural and somatic content for each emotion.
 */

const WOTD_INSIGHTS = {

  freude: {
    insight: {
      de: 'Freude ist mehr als Glück — sie ist ein Signal, dass du im Einklang mit deinen Werten lebst. Sie aktiviert das dopaminerge Belohnungssystem und stärkt das soziale Bindungshormon Oxytocin. Freude ist ansteckend: Neurowissenschaftler haben gezeigt, dass schon das Lächeln eines anderen Menschen Spiegelneuronen in deinem Gehirn aktiviert.',
      en: 'Joy is more than happiness — it is a signal that you are living in alignment with your values. It activates the dopaminergic reward system and strengthens the social bonding hormone oxytocin. Joy is contagious: neuroscientists have shown that simply seeing someone else smile activates mirror neurons in your own brain.',
      vi: 'Niềm vui không chỉ là hạnh phúc — đó là tín hiệu cho thấy bạn đang sống đúng với giá trị của mình.',
      el: 'Η χαρά είναι περισσότερο από ευτυχία — είναι ένδειξη ότι ζεις σύμφωνα με τις αξίες σου.',
    },
    body: {
      de: 'Leichtigkeit in der Brust · Energie in den Beinen · Entspannte Kiefermuskeln · Ein Kribbeln, das sich nach oben ausbreitet',
      en: 'Lightness in the chest · Energy in the legs · Jaw muscles relax · A tingling that spreads upward',
    },
    world: [
      { word: 'Natsukashii', lang: 'ja', meaning: { de: 'Nostalgische Freude über Erinnerungen, die gleichzeitig wehmütig macht', en: 'Nostalgic joy triggered by memories, tinged with gentle sadness' }},
      { word: 'Mudita', lang: 'sa', meaning: { de: 'Mitfreude — die Fähigkeit, sich über das Glück anderer aufrichtig zu freuen', en: 'Sympathetic joy — the ability to genuinely rejoice in others\' happiness' }},
      { word: 'Saudade', lang: 'pt', meaning: { de: 'Tiefe Sehnsucht nach etwas Geliebtem, das vergangen ist — eine Art süßer Trauer', en: 'A deep longing for something beloved that has passed — a kind of sweet grief' }},
    ],
    presence: {
      de: 'Spür, wo Freude in deinem Körper wohnt — vielleicht in der Brust, den Schultern, der Stimme. Lass ihr Raum, ohne etwas festhalten zu wollen.',
      en: 'Notice where joy lives in your body — chest, shoulders, voice. Let it be there, without needing to hold on.',
    },
    quote: { text: 'Freude ist das Einfachste, was man empfinden kann — und das Schwierigste, zuzulassen.', author: 'Brené Brown (frei übersetzt)' },
    related: ['dankbarkeit', 'begeisterung', 'staunen', 'geborgenheit'],
  },

  trauer: {
    insight: {
      de: 'Trauer ist keine Schwäche — sie ist der Beweis, dass etwas wirklich wichtig war. Sie schützt uns, indem sie uns zwingt, innezuhalten und zu verarbeiten. Unterdrückte Trauer kehrt oft als Reizbarkeit, Taubheit oder Erschöpfung wieder. Trauern ist der Körper, der Liebe verarbeitet, die keinen Ort mehr hat.',
      en: 'Grief is not weakness — it is proof that something truly mattered. It protects us by forcing us to pause and process. Suppressed grief often returns as irritability, numbness or exhaustion. Grieving is the body processing love that has nowhere left to go.',
      vi: 'Nỗi buồn không phải là yếu đuối — đó là bằng chứng cho thấy điều gì đó thực sự quan trọng.',
      el: 'Η θλίψη δεν είναι αδυναμία — είναι απόδειξη ότι κάτι ήταν πραγματικά σημαντικό.',
    },
    body: {
      de: 'Schwere in der Brust · Enge im Hals · Müde, schwere Augenlider · Ein Zusammenziehen im Magen · Das Bedürfnis, sich klein zu machen',
      en: 'Heaviness in the chest · Tightness in the throat · Heavy, tired eyelids · A contraction in the stomach · The urge to make yourself small',
    },
    world: [
      { word: 'Hiraeth', lang: 'cy', meaning: { de: 'Walisische Sehnsucht nach einer Heimat, zu der man nicht zurückkehren kann — vielleicht weil sie nie existiert hat', en: 'Welsh longing for a home you cannot return to — perhaps because it never existed' }},
      { word: 'Lachesism', lang: 'en', meaning: { de: 'Der Wunsch, von einem Unglück getroffen zu werden — damit man wenigstens weiß, wer man wirklich ist', en: 'The desire to be struck by tragedy — just to find out who you really are' }},
      { word: 'Ya\'aburnee', lang: 'ar', meaning: { de: 'Arabisch: „Mögest du mich begraben" — gesagt zu jemandem, den man so liebt, dass man sich das Leben ohne ihn nicht vorstellen kann', en: 'Arabic: "May you bury me" — said to someone so beloved you cannot imagine outliving them' }},
    ],
    presence: {
      de: 'Wenn Trauer da ist, musst du sie nicht lösen — nur bei ihr sitzen. Lege eine Hand auf deine Brust. Was brauchst du jetzt?',
      en: 'When grief is here, you don\'t need to fix it — just sit with it. Place a hand on your chest. What do you need right now?',
    },
    quote: { text: 'Nur wer trauert, hat wirklich geliebt.', author: 'C. S. Lewis' },
    related: ['einsamkeit', 'sehnsucht', 'verlust', 'erschoepfung'],
  },

  wut: {
    insight: {
      de: 'Wut ist oft eine sekundäre Emotion — sie sitzt über einer verletzteren, verwundbareren Schicht: Enttäuschung, Schmerz oder das Gefühl, übergangen zu werden. Sie ist auch ein Gerechtigkeitssensor: Wut entsteht, wenn eine wichtige Grenze verletzt wird. Das Problem ist nicht die Wut selbst, sondern wie wir auf sie reagieren.',
      en: 'Anger is often a secondary emotion — it sits on top of a more hurt, vulnerable layer: disappointment, pain or the feeling of being overlooked. It is also a justice sensor: anger arises when an important boundary is violated. The problem is not the anger itself, but how we respond to it.',
      vi: 'Sự tức giận thường là cảm xúc thứ cấp — nó nằm trên một lớp dễ bị tổn thương hơn.',
      el: 'Ο θυμός είναι συχνά δευτερεύον συναίσθημα — βρίσκεται πάνω από ένα πιο ευάλωτο στρώμα.',
    },
    body: {
      de: 'Hitze im Gesicht und Nacken · Anspannung in Kiefer und Fäusten · Schneller Herzschlag · Engegefühl im Brustkorb · Erhöhter Adrenalinpegel',
      en: 'Heat in the face and neck · Tension in jaw and fists · Rapid heartbeat · Tightness in the chest · Elevated adrenaline',
    },
    world: [
      { word: 'Amae', lang: 'ja', meaning: { de: 'Die angenehme Abhängigkeit von der Nachsicht anderer — wenn diese verletzt wird, entsteht Wut', en: 'The comfortable dependence on another\'s indulgence — when violated, it triggers anger' }},
      { word: 'Haragei', lang: 'ja', meaning: { de: 'Die Kunst, Dinge durch den Bauch zu kommunizieren, ohne sie auszusprechen — das Gegenteil von Wutausbrüchen', en: 'The art of communicating through the gut without speaking — the opposite of outbursts' }},
      { word: 'Ira', lang: 'la', meaning: { de: 'Lateinisch für Zorn — war in der Antike eine der sieben Todsünden, aber auch Antrieb für Heldentaten', en: 'Latin for wrath — in antiquity one of the seven deadly sins, but also the engine of heroic deeds' }},
    ],
    presence: {
      de: 'Spür die Wut, bevor du auf sie reagierst. Wo trägt du sie im Körper? Atme in die Spannung — was liegt darunter?',
      en: 'Feel the anger before you act on it. Where do you carry it in your body? Breathe into the tension — what lies beneath it?',
    },
    quote: { text: 'Wut ist Energie. Die Frage ist nur, wohin du sie lenkst.', author: 'Harriet Lerner' },
    related: ['frustration', 'enttaeuschung', 'wut', 'zerrissenheit'],
  },

  angst: {
    insight: {
      de: 'Angst ist das älteste Warnsystem der Menschheit. Das Amygdala-Alarm-System reagiert auf Bedrohungen, bevor der Verstand sie verarbeitet hat. Chronische Angst bedeutet oft, dass das System dauernd aktiviert bleibt — nicht weil die Welt gefährlicher geworden ist, sondern weil die Beruhigungssignale fehlen. Angst fragt: „Was brauchst du, um dich sicher zu fühlen?"',
      en: 'Fear is humanity\'s oldest warning system. The amygdala alarm system responds to threats before the rational mind has processed them. Chronic anxiety often means the system stays permanently activated — not because the world has become more dangerous, but because the calming signals are missing. Fear asks: "What do you need to feel safe?"',
      vi: 'Sợ hãi là hệ thống cảnh báo lâu đời nhất của loài người.',
      el: 'Ο φόβος είναι το αρχαιότερο σύστημα προειδοποίησης της ανθρωπότητας.',
    },
    body: {
      de: 'Flaches, schnelles Atmen · Magen zieht sich zusammen · Muskeln spannen sich an · Hände können kalt werden · Pupillen weiten sich',
      en: 'Shallow, fast breathing · Stomach contracts · Muscles tense · Hands may turn cold · Pupils dilate',
    },
    world: [
      { word: 'Forelsket', lang: 'no', meaning: { de: 'Norwegisch: Die intensive Aufregung und leichte Angst beim Verlieben in jemanden', en: 'Norwegian: The intense excitement and slight fear of falling in love with someone' }},
      { word: 'Weltangst', lang: 'de', meaning: { de: 'Die diffuse Angst vor dem Zustand der Welt — nicht vor einem konkreten Objekt, sondern vor der Lage an sich', en: 'The diffuse anxiety about the state of the world — not fear of a specific object but of the situation itself' }},
      { word: 'Litost', lang: 'cs', meaning: { de: 'Tschechisch: Eine Mischung aus Kummer, Mitleid mit sich selbst, Angst und Selbstekel', en: 'Czech: A mix of grief, self-pity, fear and self-loathing' }},
    ],
    presence: {
      de: 'Atme bewusst, langsam und tief. Wohin zieht sich dein Körper? Schenke dieser Stelle sanfte Aufmerksamkeit — ohne etwas verändern zu müssen.',
      en: 'Breathe consciously, slowly and deeply. Where does your body tighten? Offer that place gentle awareness — without needing to change anything.',
    },
    quote: { text: 'Angst ist Aufregung ohne Atem. Atme — und sie wird Mut.', author: 'Fritz Perls (adaptiert)' },
    related: ['unsicherheit', 'panik', 'erschoepfung', 'schuld'],
  },

  einsamkeit: {
    insight: {
      de: 'Einsamkeit ist nicht dasselbe wie Alleinsein. Man kann unter Menschen einsam sein — wenn man das Gefühl hat, wirklich nicht gesehen zu werden. Chronische Einsamkeit ist laut Forschung genauso gesundheitsschädlich wie Rauchen: Sie erhöht Cortisol, schwächt das Immunsystem und verstärkt das Schmerzempfinden. Einsamkeit ist ein Signal, dass dein Bedürfnis nach echter Verbindung unerfüllt ist.',
      en: 'Loneliness is not the same as being alone. You can be lonely in a crowd — if you feel truly unseen. Chronic loneliness is as damaging to health as smoking: it raises cortisol, weakens the immune system and amplifies pain. Loneliness is a signal that your need for genuine connection is unmet.',
      vi: 'Sự cô đơn không giống như việc ở một mình. Bạn có thể cô đơn giữa đám đông.',
      el: 'Η μοναξιά δεν είναι ίδια με το να είσαι μόνος. Μπορεί να νιώθεις μόνος μέσα σε πλήθος.',
    },
    body: {
      de: 'Hohles Gefühl in der Brust · Schultern fallen nach vorne · Leicht gesenkte Stimme · Das Gefühl, unsichtbar zu sein · Mattigkeit im Körper',
      en: 'Hollow feeling in the chest · Shoulders fall forward · Slightly lowered voice · Feeling invisible · Dullness in the body',
    },
    world: [
      { word: 'Mono no aware', lang: 'ja', meaning: { de: 'Die bittersüße Stille der Vergänglichkeit — ein bewusstes Alleinsein mit der Schönheit des Moments', en: 'The bittersweet stillness of impermanence — a conscious solitude with the beauty of the moment' }},
      { word: 'Al-Ghurba', lang: 'ar', meaning: { de: 'Arabisch: Der spezifische Schmerz, weit weg von der Heimat und den Lieben zu sein — Heimweh auf tiefer Ebene', en: 'Arabic: The specific ache of being far from home and the people you love — homesickness at a deep level' }},
      { word: 'Mamihlapinatapai', lang: 'ya', meaning: { de: 'Feuerland: Der stille, geteilte Blick zwischen zwei Menschen, die beide etwas wollen, aber keiner spricht zuerst', en: 'Fuegian: The silent shared look between two people who both want something but neither speaks first' }},
    ],
    presence: {
      de: 'Einsamkeit lädt zur Begegnung mit dir selbst ein. Sitz mit ihr — was würdest du dir sagen, das sonst ungehört bleibt?',
      en: 'Loneliness invites you to meet yourself. Sit with it — what would you say to yourself that otherwise goes unheard?',
    },
    quote: { text: 'Einsamkeit ist nicht das Fehlen von Menschen, sondern das Fehlen echter Verbindung.', author: 'Brené Brown' },
    related: ['trauer', 'sehnsucht', 'leere', 'verbundenheit'],
  },

  sehnsucht: {
    insight: {
      de: 'Sehnsucht ist eines der komplexesten menschlichen Gefühle — sie verbindet Schmerz und Freude gleichzeitig. Psychologen nennen es „bittersweet emotion". Sehnsucht zeigt dir, was dir wirklich wichtig ist: Man sehnt sich nie nach Dingen, die einem egal sind. Sie ist der Kompass der Seele.',
      en: 'Sehnsucht is one of the most complex human emotions — it combines pain and joy simultaneously. Psychologists call it a "bittersweet emotion". Longing reveals what truly matters to you: you never long for things that do not matter. It is the compass of the soul.',
      vi: 'Nỗi nhớ là một trong những cảm xúc phức tạp nhất của con người — nó kết hợp đau đớn và niềm vui cùng lúc.',
      el: 'Η νοσταλγία είναι ένα από τα πιο σύνθετα ανθρώπινα συναισθήματα — συνδυάζει πόνο και χαρά ταυτόχρονα.',
    },
    body: {
      de: 'Ein sanfter Druck hinter dem Brustbein · Weiche, melancholische Schwere in den Schultern · Die Augen werden leicht feucht · Der Blick verliert sich in der Ferne',
      en: 'A gentle pressure behind the sternum · Soft, melancholic heaviness in the shoulders · Eyes become slightly wet · Gaze drifts into the distance',
    },
    world: [
      { word: 'Hiraeth', lang: 'cy', meaning: { de: 'Walisisch: Tiefe Sehnsucht nach einem Ort oder einer Zeit, die es nicht mehr gibt — oder die vielleicht nie existiert hat', en: 'Welsh: Deep longing for a place or time that no longer exists — or perhaps never did' }},
      { word: 'Saudade', lang: 'pt', meaning: { de: 'Portugiesisch: Eine süß-bittere Sehnsucht nach einem fernen, geliebten Menschen oder Ort — national empfunden in Portugal und Brasilien', en: 'Portuguese: A sweet-bitter longing for a distant beloved person or place — felt nationally in Portugal and Brazil' }},
      { word: 'Toska', lang: 'ru', meaning: { de: 'Russisch: Eine tiefe spirituelle Qual, ein dumpfes Sehnen ohne klares Objekt — Nabokov nannte es untranslatable', en: 'Russian: A deep spiritual anguish, a dull longing with no clear object — Nabokov called it untranslatable' }},
    ],
    presence: {
      de: 'Lass die Sehnsucht sprechen, ohne ihr nachzulaufen. Wohin zeigt sie? Was wäre, wenn du ihr heute innerlich folgst?',
      en: 'Let longing speak without chasing it. Where does it point? What would it mean to follow it inward today?',
    },
    quote: { text: 'Sehnsucht ist das Gedächtnis des Herzens.', author: 'Alphonse de Lamartine (frei übersetzt)' },
    related: ['trauer', 'einsamkeit', 'frieden', 'hoffnung'],
  },

  scham: {
    insight: {
      de: 'Scham sagt: „Ich bin falsch" — nicht „Ich habe etwas falsch gemacht". Das ist der entscheidende Unterschied zur Schuld. Scham ist das schmerzhafteste soziale Gefühl, weil es das Selbst angreift. Sie entsteht, wenn wir glauben, wir würden aus der Gemeinschaft ausgestoßen, wenn andere die Wahrheit über uns wüssten. Das Gegengift ist nicht Selbstkritik — sondern Mitgefühl mit sich selbst.',
      en: 'Shame says: "I am wrong" — not "I did something wrong". That is the crucial difference from guilt. Shame is the most painful social emotion because it attacks the self. It arises when we believe we would be expelled from community if others knew the truth about us. The antidote is not self-criticism — it is self-compassion.',
      vi: 'Sự xấu hổ nói: "Tôi sai" — không phải "Tôi đã làm sai điều gì đó". Đó là sự khác biệt quan trọng so với tội lỗi.',
      el: 'Η ντροπή λέει: "Εγώ είμαι λάθος" — όχι "Έκανα κάτι λάθος". Αυτή είναι η κρίσιμη διαφορά από την ενοχή.',
    },
    body: {
      de: 'Heiße Wangen · Blick sinkt nach unten · Man möchte sich verstecken oder verschwinden · Oberkörper zieht sich zusammen · Stimme wird leiser',
      en: 'Hot cheeks · Gaze drops downward · Urge to hide or disappear · Upper body contracts · Voice becomes quieter',
    },
    world: [
      { word: 'Haji', lang: 'ja', meaning: { de: 'Japanisch: Scham als sozialer Kompass — das Bewusstsein, das soziale Harmonie schützt', en: 'Japanese: Shame as social compass — the awareness that protects social harmony' }},
      { word: 'Malu', lang: 'ms', meaning: { de: 'Malaiisch: Eine positive Form von Scham — das Innehalten vor Übertretung, die Hemmung, die Würde bewahrt', en: 'Malay: A positive form of shame — the pause before transgression, the inhibition that preserves dignity' }},
      { word: 'Aidos', lang: 'el', meaning: { de: 'Altgriechisch: Ehrfürchtige Scham — nicht Selbsterniedrigung, sondern respektvolle Zurückhaltung vor dem Heiligen', en: 'Ancient Greek: Reverential shame — not self-abasement, but respectful restraint before the sacred' }},
    ],
    presence: {
      de: 'Scham lebt oft im Körper, bevor sie Worte findet. Wo spürst du sie? Kannst du mit Neugier auf sie schauen — statt sofort wegzuschauen?',
      en: 'Shame often lives in the body before it finds words. Where do you feel it? Can you look at it with curiosity rather than immediately turning away?',
    },
    quote: { text: 'Scham ist nicht dasselbe wie Schuld. Schuld sagt: Ich habe etwas Schlechtes getan. Scham sagt: Ich bin schlecht.', author: 'Brené Brown' },
    related: ['schuld', 'peinlichkeit', 'angst', 'einsamkeit'],
  },

  erschoepfung: {
    insight: {
      de: 'Erschöpfung ist nicht Faulheit — sie ist der Körper, der „Stopp" sagt, nachdem man zu lange ohne Erholung gegeben hat. Burnout entsteht, wenn Erschöpfung ignoriert wird. Tiefe Erschöpfung ist oft emotional: nicht nur die Muskeln sind müde, sondern die Seele. Sie bittet um Ruhe, Grenzen und die Erlaubnis, nicht zu leisten.',
      en: 'Exhaustion is not laziness — it is the body saying "stop" after giving too long without restoration. Burnout happens when exhaustion is ignored. Deep exhaustion is often emotional: not just the muscles are tired, but the soul. It is asking for rest, boundaries and permission to not perform.',
      vi: 'Sự kiệt sức không phải là lười biếng — đó là cơ thể nói "dừng lại" sau khi đã cho đi quá lâu mà không được phục hồi.',
      el: 'Η εξάντληση δεν είναι τεμπελιά — είναι το σώμα που λέει "σταμάτα" αφού έχει δώσει πολύ καιρό χωρίς ανάρρωση.',
    },
    body: {
      de: 'Schwere Glieder · Brennende Augen · Gehirnnebel · Alles braucht doppelt so viel Kraft · Selbst schöne Dinge fühlen sich flach an',
      en: 'Heavy limbs · Burning eyes · Brain fog · Everything requires twice the effort · Even beautiful things feel flat',
    },
    world: [
      { word: 'Sisu', lang: 'fi', meaning: { de: 'Finnisch: Die stoische Kraft, trotz Erschöpfung weiterzumachen — innerliches Durchhaltevermögen jenseits aller Vernunft', en: 'Finnish: The stoic power to continue despite exhaustion — inner perseverance beyond all reason' }},
      { word: 'Han', lang: 'ko', meaning: { de: 'Koreanisch: Eine kollektive tiefe Müdigkeit und Trauer, die aus historischem Leid entsteht — kein individuelles, sondern geteiltes Gefühl', en: 'Korean: A collective deep weariness and grief arising from historical suffering — not individual but shared' }},
      { word: 'Aware', lang: 'ja', meaning: { de: 'Japanisch: Ein sanfter Erschöpfungsfrieden — die Ruhe nach dem Begreifen, dass alles vergänglich ist', en: 'Japanese: A gentle exhausted peace — the calm after understanding that everything is transient' }},
    ],
    presence: {
      de: 'Erschöpfung ist ein Brief deines Körpers. Lies ihn. Was hat er dir zu sagen — und was brauchst du wirklich, jetzt gerade?',
      en: 'Exhaustion is a letter from your body. Read it. What does it need to tell you — and what do you truly need, right now?',
    },
    quote: { text: 'Du kannst dich nicht ausruhen, wenn dein Körper kämpft. Zuerst Frieden schließen, dann Ruhe.', author: 'Peter Levine' },
    related: ['leere', 'angst', 'verlust', 'trauer'],
  },

  hoffnung: {
    insight: {
      de: 'Hoffnung ist keine naive Illusion — sie ist eine aktive kognitive Haltung. Psychologe Charles Snyder beschrieb sie als das Zusammenspiel von Zielorientierung, Kreativität beim Finden von Wegen und dem Glauben, sie gehen zu können. Hoffnung ist der Gegenpol zur erlernten Hilflosigkeit. Wer hofft, handelt.',
      en: 'Hope is not naive illusion — it is an active cognitive stance. Psychologist Charles Snyder described it as the interplay of goal-orientation, creativity in finding paths, and belief in one\'s ability to walk them. Hope is the counterforce to learned helplessness. Those who hope act.',
      vi: 'Hy vọng không phải là ảo tưởng ngây thơ — đó là một thái độ nhận thức chủ động.',
      el: 'Η ελπίδα δεν είναι αφελής ψευδαίσθηση — είναι μια ενεργή γνωστική στάση.',
    },
    body: {
      de: 'Leichte Öffnung in der Brust · Kopf hebt sich leicht · Tieferer Atemzug möglich · Die Zukunft fühlt sich wieder erreichbar an · Energie beginnt zu fließen',
      en: 'Slight opening in the chest · Head lifts slightly · Deeper breath becomes possible · The future feels reachable again · Energy starts to flow',
    },
    world: [
      { word: 'Dum spiro, spero', lang: 'la', meaning: { de: 'Lateinisch: Solange ich atme, hoffe ich — das Motto Südkarolinas', en: 'Latin: While I breathe, I hope — the motto of South Carolina' }},
      { word: 'Amal', lang: 'ar', meaning: { de: 'Arabisch: Hoffnung als aktives Streben nach einer besseren Zukunft — nicht passives Warten', en: 'Arabic: Hope as active striving toward a better future — not passive waiting' }},
      { word: 'Elpis', lang: 'el', meaning: { de: 'Altgriechisch: Die letzte Gabe der Pandorabüchse — auch im schlimmsten Moment blieb Hoffnung zurück', en: 'Ancient Greek: The last gift of Pandora\'s box — even at the worst moment, hope remained' }},
    ],
    presence: {
      de: 'Hoffnung ist zart — sie braucht keinen Beweis. Lass sie einfach da sein, ohne sie rechtfertigen zu müssen. Wohin zeigt sie dich gerade?',
      en: 'Hope is fragile — it needs no proof. Just let it be here, without needing to justify it. Where is it pointing you right now?',
    },
    quote: { text: 'Hoffnung ist nicht die Überzeugung, dass etwas gut ausgeht, sondern die Gewissheit, dass etwas Sinn hat, egal wie es ausgeht.', author: 'Václav Havel' },
    related: ['frieden', 'begeisterung', 'sehnsucht', 'dankbarkeit'],
  },

  neugier: {
    insight: {
      de: 'Neugier ist der Motor des menschlichen Gehirns. Sie aktiviert dasselbe Belohnungssystem wie Sex und Essen — das Gehirn liebt das Unbekannte. Kinder stellen täglich hunderte Fragen; Erwachsene oft keine. Neugier ist die Antithese zu Angst: Man kann einem Gedanken gegenüber entweder neugierig oder ängstlich sein — aber selten beides gleichzeitig.',
      en: 'Curiosity is the engine of the human brain. It activates the same reward system as sex and food — the brain loves the unknown. Children ask hundreds of questions a day; adults often none. Curiosity is the antithesis of fear: you can be curious or afraid of a thought — but rarely both at once.',
      vi: 'Sự tò mò là động cơ của não người. Nó kích hoạt hệ thống phần thưởng giống như tình dục và thức ăn.',
      el: 'Η περιέργεια είναι ο κινητήρας του ανθρώπινου εγκεφάλου.',
    },
    body: {
      de: 'Leichte Vorlehnung des Körpers · Pupillen weiten sich · Wache, offene Augen · Energie sammelt sich im Kopf · Das „Was wäre wenn"-Gefühl kribbelt',
      en: 'Slight forward lean of the body · Pupils dilate · Alert, open eyes · Energy gathers in the head · The "what if" feeling tingles',
    },
    world: [
      { word: 'Neugier', lang: 'de', meaning: { de: 'Neu + Gier — buchstäblich: der Hunger nach Neuem. Keine andere Sprache hat dieses Wort so präzise.', en: 'Neu + Gier — literally: the hunger for the new. No other language has this word this precisely.' }},
      { word: 'Curious', lang: 'la', meaning: { de: 'Vom Lateinischen cura: Sorge, Fürsorge. Neugier entsteht ursprünglich aus Fürsorge — wir wollen verstehen, was uns betrifft', en: 'From Latin cura: care, concern. Curiosity originally arises from care — we want to understand what concerns us' }},
      { word: 'Wa', lang: 'ja', meaning: { de: 'Japanisch: Die harmonische Übereinstimmung, nach der man sucht, wenn man wirklich versteht', en: 'Japanese: The harmonious alignment one finds when one truly understands' }},
    ],
    presence: {
      de: 'Neugier öffnet Türen. Welche Tür steht gerade vor dir — eine, die du noch nicht aufgemacht hast? Was hält dich davor zurück?',
      en: 'Curiosity opens doors. Which door stands before you right now — one you haven\'t opened yet? What is holding you back?',
    },
    quote: { text: 'Neugier ist kein Laster. Sie ist die einzige Gnade, die man braucht.', author: 'Mary Oliver' },
    related: ['begeisterung', 'staunen', 'freude', 'verwirrung'],
  },

  dankbarkeit: {
    insight: {
      de: 'Dankbarkeit ist eine der stärksten Interventionen in der positiven Psychologie — regelmäßige Dankbarkeitsübungen verändern nachweislich die neuronale Verschaltung des Gehirns. Sie richtet die Aufmerksamkeit auf das, was da ist, statt auf das, was fehlt. Echte Dankbarkeit ist keine Leistung — sie entsteht, wenn man wirklich sieht, was einem geschenkt wurde.',
      en: 'Gratitude is one of the most powerful interventions in positive psychology — regular gratitude practices demonstrably change the neural wiring of the brain. It redirects attention toward what is present rather than what is absent. Genuine gratitude is not a performance — it arises when you truly see what has been given to you.',
      vi: 'Lòng biết ơn là một trong những can thiệp mạnh mẽ nhất trong tâm lý học tích cực.',
      el: 'Η ευγνωμοσύνη είναι μία από τις πιο ισχυρές παρεμβάσεις στη θετική ψυχολογία.',
    },
    body: {
      de: 'Wärme in der Brust · Entspannte Schultern · Ein leichtes Lächeln, das sich von innen formt · Tiefere, ruhigere Atmung · Das Herz öffnet sich',
      en: 'Warmth in the chest · Relaxed shoulders · A gentle smile forming from within · Deeper, calmer breathing · The heart opens',
    },
    world: [
      { word: 'Mamihlapinatapai', lang: 'ya', meaning: { de: 'Feuerland: Der geteilte Moment, in dem zwei Menschen gleichzeitig erkennen, wie dankbar sie füreinander sind', en: 'Fuegian: The shared moment when two people simultaneously realize how grateful they are for each other' }},
      { word: 'Gratia', lang: 'la', meaning: { de: 'Lateinisch: Dankbarkeit, Anmut, Gunst — dieselbe Wurzel wie Gnade und Gratifikation. Dankbarkeit macht schön.', en: 'Latin: Gratitude, grace, favor — same root as grace and gratification. Gratitude makes beautiful.' }},
      { word: 'Shukran', lang: 'ar', meaning: { de: 'Arabisch: Dank — vom Verb shakara, „erkennen". Dankbarkeit ist Erkenntnis, Sehen.', en: 'Arabic: Thanks — from the verb shakara, "to recognize". Gratitude is recognition, seeing.' }},
    ],
    presence: {
      de: 'Halte inne bei einem einzigen Ding, für das du heute dankbar bist. Lass das Gefühl dafür wirklich ankommen — in deinem Körper, nicht nur im Kopf.',
      en: 'Pause on a single thing you are grateful for today. Let the feeling of it actually land — in your body, not just your mind.',
    },
    quote: { text: 'Dankbarkeit ist nicht nur das größte aller Gefühle, sondern die Mutter aller anderen.', author: 'Cicero (frei übersetzt)' },
    related: ['freude', 'mitgefuehl', 'frieden', 'verbundenheit'],
  },

  mitgefuehl: {
    insight: {
      de: 'Mitgefühl ist nicht dasselbe wie Empathie. Empathie fühlt mit — Mitgefühl will helfen. Empathie kann erschöpfen, Mitgefühl stärkt. Neurowissenschaftler haben gezeigt, dass Mitgefühl das Gehirn des Gebenden stärker aktiviert als das bloße Zuschauen. Mitgefühl beginnt mit sich selbst: Wer sich selbst gegenüber kein Mitgefühl empfindet, kann es auch anderen gegenüber kaum tief spüren.',
      en: 'Compassion is not the same as empathy. Empathy feels with — compassion wants to help. Empathy can exhaust, compassion strengthens. Neuroscientists have shown that compassion activates the giver\'s brain more strongly than merely watching. Compassion begins with the self: those who feel no compassion toward themselves can rarely feel it deeply toward others.',
      vi: 'Lòng trắc ẩn không giống như sự đồng cảm. Sự đồng cảm cảm nhận cùng — lòng trắc ẩn muốn giúp đỡ.',
      el: 'Η συμπόνια δεν είναι ίδια με την ενσυναίσθηση. Η ενσυναίσθηση αισθάνεται μαζί — η συμπόνια θέλει να βοηθήσει.',
    },
    body: {
      de: 'Weiches Öffnen in der Brust · Muskeln entspannen sich · Blick wird weicher, länger · Eine Art wohltuende Schwere, die nicht belastet · Tiefere Präsenz',
      en: 'Soft opening in the chest · Muscles relax · Gaze becomes softer, longer · A kind of comforting heaviness that does not burden · Deeper presence',
    },
    world: [
      { word: 'Mudita', lang: 'sa', meaning: { de: 'Sanskrit: Mitfreude — sich aufrichtig über das Glück anderer freuen, ohne Neid', en: 'Sanskrit: Sympathetic joy — genuinely rejoicing in others\' happiness without envy' }},
      { word: 'Karuna', lang: 'sa', meaning: { de: 'Sanskrit: Mitgefühl als aktive Kraft, den Schmerz anderer zu lindern — eine der vier buddhistischen Haltungen', en: 'Sanskrit: Compassion as active force to relieve others\' suffering — one of the four Buddhist stances' }},
      { word: 'Jeong', lang: 'ko', meaning: { de: 'Koreanisch: Eine tiefe, unsagbare Verbundenheit und Fürsorge, die langsam wächst — Mitgefühl das sich nicht erklären lässt', en: 'Korean: A deep, unspeakable bond and care that grows slowly — compassion that cannot be explained' }},
    ],
    presence: {
      de: 'Richte Mitgefühl zuerst auf dich selbst. Was würdest du einem geliebten Menschen sagen — der gerade das fühlt, was du gerade fühlst?',
      en: 'Turn compassion toward yourself first. What would you say to someone you love — who was feeling exactly what you feel right now?',
    },
    quote: { text: 'Wenn du leiden siehst und nichts empfindest, hast du noch nicht wirklich hingesehen.', author: 'Thich Nhat Hanh (adaptiert)' },
    related: ['liebe', 'dankbarkeit', 'trauer', 'verbundenheit'],
  },

  staunen: {
    insight: {
      de: 'Staunen ist das Gefühl, wenn etwas unser mentales Modell der Welt sprengt. Es ist der emotionale Katalysator für Lernen und Wachstum. Psychologin Dacher Keltner zeigt: Ehrfurcht (Awe) senkt das Selbstgefühl im gesunden Sinn — wir fühlen uns kleiner und gleichzeitig verbunden mit etwas Größerem. Staunen macht bescheiden und weit gleichzeitig.',
      en: 'Awe is the feeling when something breaks our mental model of the world. It is the emotional catalyst for learning and growth. Psychologist Dacher Keltner shows: awe lowers the sense of self in a healthy way — we feel smaller and simultaneously connected to something larger. Awe makes you humble and vast at the same time.',
      vi: 'Sự kinh ngạc là cảm giác khi điều gì đó phá vỡ mô hình tinh thần của chúng ta về thế giới.',
      el: 'Ο θαυμασμός είναι το συναίσθημα όταν κάτι σπάει το νοητικό μας μοντέλο του κόσμου.',
    },
    body: {
      de: 'Langsames Ausatmen · Stille · Gänsehaut · Mund öffnet sich leicht · Zeit scheint sich zu dehnen · Der Körper wird still, aber lebendig',
      en: 'Slow exhale · Stillness · Goosebumps · Mouth opens slightly · Time seems to stretch · The body grows quiet but alive',
    },
    world: [
      { word: 'Yūgen', lang: 'ja', meaning: { de: 'Japanisch: Ein tiefes, melancholisches Bewusstsein für die Schönheit und Tiefe des Universums, das mit Ehrfurcht erfüllt', en: 'Japanese: A profound awareness of the beauty and depth of the universe that fills with awe' }},
      { word: 'Sublime', lang: 'fr', meaning: { de: 'Französisch/Englisch: Das Erhabene — Kants Begriff für das Gefühl bei etwas Überwältigendem, das uns erschreckt und entzückt zugleich', en: 'French/English: The sublime — Kant\'s concept for the feeling before something overwhelming that both terrifies and delights' }},
      { word: 'Numinous', lang: 'la', meaning: { de: 'Lateinisch: Das Gefühl einer heiligen, überwältigenden Präsenz — Rudolf Otto beschrieb es als das mysterium tremendum', en: 'Latin: The feeling of a sacred, overwhelming presence — Rudolf Otto described it as the mysterium tremendum' }},
    ],
    presence: {
      de: 'Staunen braucht keine Erklärung — nur Stille. Was merkst du gerade, wenn du wirklich still wirst und schaust?',
      en: 'Wonder needs no explanation — only stillness. What do you notice when you truly grow still and look?',
    },
    quote: { text: 'Staunen ist der Anfang der Weisheit.', author: 'Sokrates' },
    related: ['neugier', 'freude', 'frieden', 'begeisterung'],
  },

  leere: {
    insight: {
      de: 'Das Gefühl innerer Leere ist einer der schwierigsten emotionalen Zustände — weil es keine klare Ursache zu haben scheint. Oft entsteht Leere nach einem Verlust, nach langer Erschöpfung oder wenn man lange nach Erwartungen anderer gelebt hat und den Kontakt zu sich selbst verloren hat. Leere ist nicht das Ende — sie ist manchmal der Raum, der sich neu füllen will. Was möchte in dich einziehen?',
      en: 'The feeling of inner emptiness is one of the most difficult emotional states — because it seems to have no clear cause. Emptiness often arises after loss, after long exhaustion, or when one has lived by others\' expectations so long that contact with the self is lost. Emptiness is not the end — it is sometimes the space that wants to fill again. What wants to move into you?',
      vi: 'Cảm giác trống rỗng bên trong là một trong những trạng thái cảm xúc khó khăn nhất.',
      el: 'Το αίσθημα εσωτερικού κενού είναι μια από τις πιο δύσκολες συναισθηματικές καταστάσεις.',
    },
    body: {
      de: 'Taubheit statt Gefühl · Eine Art dumpfes Echo im Inneren · Antriebslosigkeit · Dinge die früher Freude machten, berühren nicht mehr · Alles wirkt gedämpft',
      en: 'Numbness instead of feeling · A kind of dull echo inside · Loss of motivation · Things that once brought joy no longer touch · Everything seems muted',
    },
    world: [
      { word: 'Kenopsia', lang: 'en', meaning: { de: 'Englisch: Das eigenartig unheimliche Gefühl in verlassenen Räumen — Stille dort, wo einst Leben war', en: 'English: The eerie, unsettling feeling in abandoned spaces — silence where life once was' }},
      { word: 'Anhedonia', lang: 'el', meaning: { de: 'Griechisch: Die Unfähigkeit, Freude zu empfinden — clinisches Kennzeichen von Depression, aber auch ein temporärer Zustand nach Erschöpfung', en: 'Greek: The inability to feel pleasure — clinical marker of depression, but also a temporary state after exhaustion' }},
      { word: 'Sunyata', lang: 'sa', meaning: { de: 'Sanskrit: Leere als spirituelle Praxis — nicht als Abwesenheit, sondern als reine Möglichkeit, die allen Dingen innewohnt', en: 'Sanskrit: Emptiness as spiritual practice — not as absence, but as pure potential that inhabits all things' }},
    ],
    presence: {
      de: 'Leere muss nicht gefüllt werden. Vielleicht ist sie Raum. Sitz einen Moment mit ihr — wofür könnte dieser Raum in dir sein?',
      en: 'Emptiness does not need to be filled. Perhaps it is space. Sit with it for a moment — what might this space inside you be for?',
    },
    quote: { text: 'Leere ist nicht Nichts. Sie ist der Ort, von dem aus alles beginnt.', author: 'Laotse (Tao Te Ching, adaptiert)' },
    related: ['erschoepfung', 'trauer', 'einsamkeit', 'zerrissenheit'],
  },

  zerrissenheit: {
    insight: {
      de: 'Zerrissenheit entsteht, wenn zwei echte Teile von uns in verschiedene Richtungen wollen. Sie ist kein Zeichen von Schwäche oder Unentschlossenheit — sie zeigt, dass man ein komplexes, vielschichtiges Wesen ist. Die Lösung ist nicht, einen Teil zu töten, sondern zu lernen, mit beiden im Dialog zu sein.',
      en: 'Being torn arises when two genuine parts of us want to go in different directions. It is not a sign of weakness or indecision — it shows that you are a complex, multi-layered being. The solution is not to kill one part but to learn to be in dialogue with both.',
      vi: 'Sự mâu thuẫn nội tâm xảy ra khi hai phần thực sự của chúng ta muốn đi theo các hướng khác nhau.',
      el: 'Η εσωτερική σύγκρουση προκύπτει όταν δύο αληθινά μέρη μας θέλουν να πάνε σε διαφορετικές κατευθύνσεις.',
    },
    body: {
      de: 'Druck von zwei Seiten gleichzeitig · Unmöglichkeit, stillzusitzen · Unruhiges Hin-und-Her der Aufmerksamkeit · Manchmal Kopfschmerzen · Der Körper weiß nicht, wohin',
      en: 'Pressure from two sides simultaneously · Impossibility of sitting still · Restless back-and-forth of attention · Sometimes headaches · The body does not know where to go',
    },
    world: [
      { word: 'Dissonance', lang: 'fr', meaning: { de: 'Französisch/Englisch: Kognitive Dissonanz — das Unbehagen, wenn zwei Überzeugungen in Widerspruch stehen', en: 'French/English: Cognitive dissonance — the discomfort when two beliefs are in contradiction' }},
      { word: 'Between', lang: 'en', meaning: { de: 'Englisch: Martin Buber beschrieb das „Zwischen" als den Raum, in dem echte Begegnung stattfindet — Zerrissenheit als Wachstumsraum', en: 'English: Martin Buber described "between" as the space where genuine encounter happens — being torn as a space of growth' }},
    ],
    presence: {
      de: 'Zerrissenheit entsteht, wenn zwei echte Wahrheiten gleichzeitig in dir existieren. Kannst du beide halten, ohne eine zu verleugnen?',
      en: 'Being torn arises when two real truths coexist inside you. Can you hold both without denying either one?',
    },
    quote: { text: 'Aus dem Widerspruch entsteht die Tiefe.', author: 'Hermann Hesse' },
    related: ['angst', 'frustration', 'erschoepfung', 'wut'],
  },

  weltschmerz: {
    insight: {
      de: 'Weltschmerz ist das Wissen, dass die Welt nicht so ist, wie sie sein sollte — und dass man das tief fühlt, statt wegzuschauen. Es ist das Leid derer, die zu viel Empfindung haben für die Unzulänglichkeiten der Realität. Heinrich Heine prägte das Wort. Es ist verwandt mit Melancholie, aber größer: nicht nur über das eigene Leben, sondern über das Schicksal der Menschheit.',
      en: 'Weltschmerz is the knowledge that the world is not as it should be — and that one feels this deeply rather than looking away. It is the suffering of those who feel too much for the inadequacies of reality. Heinrich Heine coined the word. It is related to melancholy but larger: not only about one\'s own life but about the fate of humanity.',
      vi: 'Weltschmerz là sự nhận thức rằng thế giới không như lẽ ra phải có.',
      el: 'Weltschmerz είναι η γνώση ότι ο κόσμος δεν είναι όπως θα έπρεπε να είναι.',
    },
    body: {
      de: 'Schwere auf den Schultern · Blick der sich nach innen wendet · Tiefes, langes Ausatmen · Die Welt fühlt sich gleichzeitig zu groß und zu eng an',
      en: 'Weight on the shoulders · Gaze turning inward · Deep, long exhalation · The world feels simultaneously too large and too narrow',
    },
    world: [
      { word: 'Weltschmerz', lang: 'de', meaning: { de: 'Deutsch: Welt + Schmerz — eines der wenigen deutschen Wörter, das unverändert ins Englische übernommen wurde', en: 'German: World + pain — one of the few German words adopted unchanged into English' }},
      { word: 'Spleen', lang: 'fr', meaning: { de: 'Französisch (Baudelaire): Eine romantisch-melancholische Trostlosigkeit über den Zustand der Welt und des eigenen Lebens', en: 'French (Baudelaire): A romantic-melancholic desolation about the state of the world and one\'s own life' }},
      { word: 'Acedia', lang: 'la', meaning: { de: 'Mittelalterlich-lateinisch: Trägheit der Seele, Gleichgültigkeit gegenüber dem Göttlichen — die Erschöpfung des Mitfühlenden', en: 'Medieval Latin: Sloth of the soul, indifference to the divine — the exhaustion of the compassionate' }},
    ],
    presence: {
      de: 'Weltschmerz ist Empathie auf weltweiter Ebene. Lass das Gewicht kurz da sein — und finde dann: Was ist ein kleines Ding, das du heute tun kannst?',
      en: 'World-pain is empathy on a global scale. Let the weight be here for a moment — then find: what is one small thing you can do today?',
    },
    quote: { text: 'Es gibt eine Trauer, die nicht weint und nicht spricht — die nur schweigt und schaut.', author: 'Victor Hugo (frei übersetzt)' },
    related: ['leere', 'sehnsucht', 'einsamkeit', 'trauer'],
  },

  stolz: {
    insight: {
      de: 'Es gibt zwei Arten von Stolz: authentischen Stolz (Ich habe etwas Schwieriges geleistet) und hochmütigen Stolz (Ich bin besser als andere). Ersterer stärkt Selbstwert und Motivation. Letzerer schützt ein fragiles Ego. Echter Stolz braucht keine Zuschauer — er entsteht im stillen Inneren, wenn man die eigene Leistung anerkennt.',
      en: 'There are two kinds of pride: authentic pride (I accomplished something difficult) and hubristic pride (I am better than others). The first strengthens self-worth and motivation. The second protects a fragile ego. Genuine pride needs no audience — it arises in the quiet interior when you acknowledge your own achievement.',
      vi: 'Có hai loại tự hào: tự hào chân thực và tự hào kiêu ngạo.',
      el: 'Υπάρχουν δύο είδη υπερηφάνειας: αυθεντική υπερηφάνεια και αλαζονική υπερηφάνεια.',
    },
    body: {
      de: 'Aufrechte Körperhaltung · Schultern weiten sich · Kopf hebt sich · Eine warme Energie in der Mitte des Körpers · Tiefes, ruhiges Einatmen',
      en: 'Upright posture · Shoulders broaden · Head lifts · Warm energy in the center of the body · Deep, calm inhalation',
    },
    world: [
      { word: 'Philotimo', lang: 'el', meaning: { de: 'Griechisch: Die Liebe zur Ehre — ein komplexes Konzept von Würde, Pflicht und Stolz, das die griechische Identität prägt', en: 'Greek: Love of honor — a complex concept of dignity, duty and pride that shapes Greek identity' }},
      { word: 'Mianzi', lang: 'zh', meaning: { de: 'Chinesisch: Gesicht / sozialer Stolz — das Bild, das man nach außen trägt und das die Gemeinschaft über einen hält', en: 'Chinese: Face / social pride — the image one carries outwardly that the community holds of you' }},
      { word: 'Superbia', lang: 'la', meaning: { de: 'Lateinisch: Hochmut als Todsünde, aber auch noble Selbstachtung — die Grenze ist fein', en: 'Latin: Pride as a deadly sin, but also noble self-respect — the line is thin' }},
    ],
    presence: {
      de: 'Echter Stolz braucht keinen Vergleich. Was hast du getan oder gewählt, das wirklich du warst — unabhängig davon, was andere denken?',
      en: 'Real pride needs no comparison. What have you done or chosen that was truly yourself — regardless of what others think?',
    },
    quote: { text: 'Nicht Stolz macht uns groß, sondern das, worauf wir stolz sind.', author: 'Friedrich Schiller (adaptiert)' },
    related: ['freude', 'dankbarkeit', 'stolz', 'scham'],
  },

  verlust: {
    insight: {
      de: 'Verlust ist nicht nur der Tod eines Menschen — er umfasst das Ende einer Beziehung, den Verlust einer Identität, einer Möglichkeit, eines Teils von sich selbst. Elisabeth Kübler-Ross beschrieb fünf Trauerphasen, aber Trauer verläuft nicht linear — sie kommt in Wellen. Verlust verändert uns. Das ist nicht gut oder schlecht — es ist unvermeidlich.',
      en: 'Loss is not only the death of a person — it encompasses the end of a relationship, the loss of an identity, a possibility, a part of oneself. Elisabeth Kübler-Ross described five stages of grief, but grief does not move in a line — it comes in waves. Loss changes us. That is not good or bad — it is unavoidable.',
      vi: 'Mất mát không chỉ là cái chết của một người — nó bao gồm sự kết thúc của một mối quan hệ, mất đi bản sắc.',
      el: 'Η απώλεια δεν είναι μόνο ο θάνατος ενός ανθρώπου — περιλαμβάνει το τέλος μιας σχέσης.',
    },
    body: {
      de: 'Schwere im ganzen Körper · Tiefe Müdigkeit · Das Herz fühlt sich buchstäblich schwerer an · Appetit und Schlaf verändern sich · Manchmal eine physische Leere im Bauch',
      en: 'Heaviness throughout the body · Deep fatigue · The heart literally feels heavier · Appetite and sleep change · Sometimes a physical emptiness in the belly',
    },
    world: [
      { word: 'Kintsugi', lang: 'ja', meaning: { de: 'Japanisch: Die Kunst, Gebrochenes mit Gold zu reparieren — Verlust als Teil der Geschichte, nicht als Makel', en: 'Japanese: The art of repairing broken things with gold — loss as part of the story, not a flaw' }},
      { word: 'Après', lang: 'fr', meaning: { de: 'Französisch: Nach. Die Zeit nach dem Verlust hat in vielen Sprachen einen eigenen Charakter — das französische Après trägt das Gewicht des Danach', en: 'French: After. The time following loss has its own character in many languages — the French après carries the weight of the after' }},
    ],
    presence: {
      de: 'Verlust hinterlässt einen Abdruck. Kannst du diesen Abdruck würdigen, ohne sofort zur nächsten Sache weiterzumachen?',
      en: 'Loss leaves an imprint. Can you honor that imprint without rushing to move on to the next thing?',
    },
    quote: { text: 'Trauer ist der Preis, den wir für Liebe zahlen. Und er ist es wert.', author: 'Queen Elizabeth II' },
    related: ['trauer', 'einsamkeit', 'erschoepfung', 'sehnsucht'],
  },

  frieden: {
    insight: {
      de: 'Innerer Frieden ist kein Zustand ohne Probleme — es ist die Fähigkeit, trotz Problemen ruhig zu bleiben. Er entsteht nicht durch das Vermeiden unangenehmer Dinge, sondern durch Akzeptanz dessen, was ist. Neurowissenschaftler zeigen: regelmäßige Achtsamkeit und Meditation verändern den präfrontalen Kortex — dem Sitz von Ruhe und Regulierung.',
      en: 'Inner peace is not a state without problems — it is the capacity to remain calm despite them. It arises not by avoiding unpleasant things, but by accepting what is. Neuroscientists show that regular mindfulness and meditation change the prefrontal cortex — the seat of calm and regulation.',
      vi: 'Bình yên nội tâm không phải là trạng thái không có vấn đề — đó là khả năng giữ bình tĩnh dù có vấn đề.',
      el: 'Η εσωτερική ειρήνη δεν είναι κατάσταση χωρίς προβλήματα — είναι η ικανότητα να παραμένεις ήρεμος παρά τα προβλήματα.',
    },
    body: {
      de: 'Entspannte Schultern und Kiefer · Gleichmäßiger, tiefer Atem · Keine Anspannung im Bauch · Zeit verlangsamt sich · Stille im Kopf',
      en: 'Relaxed shoulders and jaw · Even, deep breath · No tension in the belly · Time slows down · Quiet in the mind',
    },
    world: [
      { word: 'Shanti', lang: 'sa', meaning: { de: 'Sanskrit: Frieden als höchster spiritueller Zustand, dreimal wiederholt als Mantra — shanti shanti shanti', en: 'Sanskrit: Peace as the highest spiritual state, repeated three times as mantra — shanti shanti shanti' }},
      { word: 'Wu wei', lang: 'zh', meaning: { de: 'Chinesisch: Handeln durch Nicht-Handeln — der Frieden der vollständigen Übereinstimmung mit dem natürlichen Fluss', en: 'Chinese: Acting through non-action — the peace of complete alignment with the natural flow' }},
      { word: 'Ataraxia', lang: 'el', meaning: { de: 'Altgriechisch: Unerschütterlichkeit, Seelenruhe — das Ziel der epikureischen Philosophie', en: 'Ancient Greek: Imperturbability, serenity — the goal of Epicurean philosophy' }},
    ],
    presence: {
      de: 'Frieden ist nicht das Fehlen von Problemen — er ist die Fähigkeit, mit ihnen präsent zu sein. Kannst du ihn hier, genau jetzt, auch nur für einen Atemzug finden?',
      en: 'Peace is not the absence of problems — it is the capacity to be present with them. Can you find it here, right now, even for one breath?',
    },
    quote: { text: 'Frieden kommt von innen. Suche ihn nicht außen.', author: 'Buddha' },
    related: ['dankbarkeit', 'geborgenheit', 'hoffnung', 'staunen'],
  },

  geborgenheit: {
    insight: {
      de: 'Geborgenheit ist mehr als Sicherheit — es ist das Gefühl, dass man genau so sein darf, wie man ist, ohne Gefahr zu laufen, verstoßen zu werden. John Bowlby, der Vater der Bindungstheorie, zeigte: sichere Bindung in der Kindheit ist die Grundlage für emotionale Gesundheit ein Leben lang. Das Wort „Geborgenheit" hat keine direkte Übersetzung — im Deutschen steckt darin das Wort „geborgen", gerettet, aufgehoben.',
      en: 'Geborgenheit is more than safety — it is the feeling that you are allowed to be exactly as you are without risk of being rejected. John Bowlby, the father of attachment theory, showed: secure attachment in childhood is the foundation of emotional health for life. The word "Geborgenheit" has no direct translation — in German it contains the word "geborgen", saved, held.',
      vi: 'Geborgenheit là cảm giác được phép là chính mình mà không có nguy cơ bị từ chối.',
      el: 'Geborgenheit είναι περισσότερο από ασφάλεια — είναι το αίσθημα ότι επιτρέπεται να είσαι ακριβώς αυτός που είσαι.',
    },
    body: {
      de: 'Muskeln lassen los · Atem wird tiefer ohne Anstrengung · Schultern sinken entspannt · Ein warmes Gefühl im ganzen Rumpf · Das Nervensystem schaltet von Alarm auf Ruhe',
      en: 'Muscles let go · Breath deepens without effort · Shoulders drop in relaxation · Warm feeling throughout the torso · Nervous system switches from alarm to rest',
    },
    world: [
      { word: 'Hygge', lang: 'da', meaning: { de: 'Dänisch: Gemütlichkeit und Zusammengehörigkeit — die Kunst, Geborgenheit bewusst herzustellen', en: 'Danish: Coziness and togetherness — the art of consciously creating safety and belonging' }},
      { word: 'Gemütlichkeit', lang: 'de', meaning: { de: 'Deutsch: Die behagliche Wärme des Zusammenseins — nah an Geborgenheit, aber mehr auf das Ambiente bezogen', en: 'German: The comfortable warmth of being together — close to Geborgenheit, but more about the atmosphere' }},
      { word: 'Amae', lang: 'ja', meaning: { de: 'Japanisch: Das Vertrauen darauf, dass man von jemandem aufgefangen wird — die süße Abhängigkeit von Geborgenheit', en: 'Japanese: The trust that someone will catch you — the sweet dependence of feeling held' }},
    ],
    presence: {
      de: 'Geborgenheit spürt man oft erst, wenn sie weg ist. Wo bist du gerade geborgen — auch wenn es etwas Kleines ist?',
      en: 'We often only notice safety when it\'s gone. Where do you feel held right now — even in something small?',
    },
    quote: { text: 'Der Mensch trägt sein Zuhause in sich. Geborgenheit ist kein Ort — sie ist ein Zustand.', author: 'Simone Weil (adaptiert)' },
    related: ['frieden', 'liebe', 'verbundenheit', 'dankbarkeit'],
  },

  schuld: {
    insight: {
      de: 'Schuld sagt: „Ich habe etwas falsch gemacht" — sie ist moralischer Kompass und eine Einladung zur Wiedergutmachung. Im Gegensatz zur Scham, die das Selbst angreift, richtet Schuld sich auf eine Handlung. Gesunde Schuld motiviert zur Veränderung. Toxische Schuld dreht sich endlos im Kreis, ohne je zu heilen. Wiedergutmachung und Vergebung — sich selbst gegenüber — schließen den Kreislauf.',
      en: 'Guilt says: "I did something wrong" — it is moral compass and an invitation to make amends. Unlike shame, which attacks the self, guilt is directed at an action. Healthy guilt motivates change. Toxic guilt spins endlessly without ever healing. Making amends and forgiveness — toward oneself — closes the loop.',
      vi: 'Tội lỗi nói: "Tôi đã làm sai điều gì đó" — đó là la bàn đạo đức và là lời mời để sửa chữa.',
      el: 'Η ενοχή λέει: "Έκανα κάτι λάθος" — είναι ηθική πυξίδα και πρόσκληση για αποκατάσταση.',
    },
    body: {
      de: 'Schwere in der Magengrube · Gedanken drehen sich im Kreis · Schwierigkeiten mit dem Einschlafen · Manchmal ein körperliches Unwohlsein · Der Wunsch, sich zu entschuldigen',
      en: 'Heaviness in the pit of the stomach · Thoughts spinning in circles · Difficulty sleeping · Sometimes physical discomfort · The urge to apologize',
    },
    world: [
      { word: 'Reue', lang: 'de', meaning: { de: 'Deutsch: Aus mittelhochdeutsch riuwe — eine tiefe innere Zerknirschung, die Heilung ermöglicht', en: 'German: From Middle High German riuwe — a deep inner contrition that enables healing' }},
      { word: 'Teshuvah', lang: 'he', meaning: { de: 'Hebräisch: Umkehr, Buße — eine aktive Rückkehr zum ethischen Weg; mehr als Reue, weil sie Handlung verlangt', en: 'Hebrew: Return, repentance — an active return to the ethical path; more than remorse because it demands action' }},
      { word: 'Mea culpa', lang: 'la', meaning: { de: 'Lateinisch: Durch meine Schuld — ein Bekenntnis, das Heilung durch Anerkennung einleitet', en: 'Latin: Through my fault — a confession that initiates healing through acknowledgment' }},
    ],
    presence: {
      de: 'Schuld fragt: „Was muss ich wiedergutmachen?" Scham flüstert: „Ich bin nicht gut genug." Welche spricht gerade — und was braucht sie von dir?',
      en: 'Guilt asks: "What do I need to repair?" Shame whispers: "I am not enough." Which one is speaking right now — and what does it need from you?',
    },
    quote: { text: 'Schuld ohne Handlung ist Selbstbestrafung. Schuld mit Handlung ist Wachstum.', author: 'Harriet Lerner' },
    related: ['scham', 'angst', 'trauer', 'peinlichkeit'],
  },

  begeisterung: {
    insight: {
      de: 'Begeisterung kommt vom griechischen Wort für „göttliche Eingebung" (en + theos = in Gott). Sie ist Energie mit Richtung — nicht die diffuse Erregung von Angst, sondern fokussierte Lebendigkeit. Begeisterung entsteht, wenn das, was man tut, mit dem übereinstimmt, wofür man lebt. Sie ist das Zeichen, dass du auf deinem Weg bist.',
      en: 'Enthusiasm comes from the Greek word for "divine inspiration" (en + theos = in God). It is energy with direction — not the diffuse arousal of anxiety, but focused aliveness. Enthusiasm arises when what you do aligns with what you live for. It is the sign that you are on your path.',
      vi: 'Sự nhiệt tình đến từ từ tiếng Hy Lạp có nghĩa là "cảm hứng thần thánh".',
      el: 'Ο ενθουσιασμός προέρχεται από την ελληνική λέξη για "θεϊκή έμπνευση" (εν + θεός).',
    },
    body: {
      de: 'Energie breitet sich im ganzen Körper aus · Stimme wird lauter und schneller · Hände gestikulieren von selbst · Müdigkeit verschwindet · Das Gehirn läuft auf Hochtouren',
      en: 'Energy spreads throughout the body · Voice becomes louder and faster · Hands gesture on their own · Fatigue disappears · The brain runs at full speed',
    },
    world: [
      { word: 'Heung', lang: 'ko', meaning: { de: 'Koreanisch: Eine spontane, ansteckende Lebensfreude, die aufsteigt wenn Musik beginnt oder Menschen zusammenkommen', en: 'Korean: A spontaneous, contagious joy that rises when music begins or people gather' }},
      { word: 'Joie de vivre', lang: 'fr', meaning: { de: 'Französisch: Freude am Leben — die entspannte, genussvolle Begeisterung der Franzosen', en: 'French: Joy of living — the relaxed, pleasurable enthusiasm of the French' }},
      { word: 'Meraki', lang: 'el', meaning: { de: 'Griechisch: Mit Seele und Liebe in etwas eintauchen — wenn Begeisterung zur Hingabe wird', en: 'Greek: Pouring your soul and love into something — when enthusiasm becomes devotion' }},
    ],
    presence: {
      de: 'Begeisterung ist Energie, die auf Verwirklichung wartet. Was wäre, wenn du ihr heute — auch nur für fünf Minuten — folgst?',
      en: 'Enthusiasm is energy waiting to become action. What would happen if you followed it today — even just for five minutes?',
    },
    quote: { text: 'Nichts Großes wurde je ohne Begeisterung vollbracht.', author: 'Ralph Waldo Emerson' },
    related: ['freude', 'neugier', 'hoffnung', 'staunen'],
  },

  verbundenheit: {
    insight: {
      de: 'Verbundenheit ist eines der tiefsten menschlichen Grundbedürfnisse. Forscher der Universität Harvard haben in einer 85 Jahre langen Studie herausgefunden: Der stärkste Prädiktor für Gesundheit, Glück und Langlebigkeit ist die Qualität der Beziehungen. Verbundenheit entsteht nicht durch Geselligkeit, sondern durch echtes Gesehen-werden.',
      en: 'Connectedness is one of the deepest human fundamental needs. Harvard University researchers in an 85-year study found: the strongest predictor of health, happiness and longevity is the quality of relationships. Connectedness arises not from sociability but from being genuinely seen.',
      vi: 'Sự kết nối là một trong những nhu cầu cơ bản sâu sắc nhất của con người.',
      el: 'Η σύνδεση είναι μία από τις βαθύτερες ανθρώπινες βασικές ανάγκες.',
    },
    body: {
      de: 'Wärme im Brustbereich · Entspannter Atem · Körper wendet sich dem anderen zu · Augen machen echten Kontakt · Entspannung der Schutzmuskulatur',
      en: 'Warmth in the chest area · Relaxed breath · Body turns toward the other · Eyes make real contact · Relaxation of protective muscles',
    },
    world: [
      { word: 'Ubuntu', lang: 'zu', meaning: { de: 'Zulu: Ich bin, weil wir sind — Verbundenheit als fundamentale Basis aller Existenz', en: 'Zulu: I am because we are — connectedness as the fundamental basis of all existence' }},
      { word: 'Philautia', lang: 'el', meaning: { de: 'Altgriechisch: Selbstliebe als Grundlage echter Verbundenheit mit anderen', en: 'Ancient Greek: Self-love as the foundation of genuine connectedness with others' }},
      { word: 'Tarab', lang: 'ar', meaning: { de: 'Arabisch: Musikalische Ekstase, die Menschen tief verbindet — Verbundenheit durch geteilte Schönheit', en: 'Arabic: Musical ecstasy that deeply connects people — connectedness through shared beauty' }},
    ],
    presence: {
      de: 'Verbundenheit lebt im Körper: Wärme, Weite, ein sanftes Öffnen in der Brust. Spürst du etwas davon gerade — auch nur eine Spur?',
      en: 'Connection lives in the body: warmth, openness, a gentle softening in the chest. Do you feel any trace of that right now?',
    },
    quote: { text: 'Verbundenheit ist der Grund, warum wir hier sind. Es ist das, was dem Leben Sinn und Zweck gibt.', author: 'Brené Brown' },
    related: ['liebe', 'geborgenheit', 'mitgefuehl', 'dankbarkeit'],
  },
};

/**
 * Get insights for a given emotion ID.
 * Returns null if no insights are available.
 */
function getWotdInsights(emotionId) {
  return WOTD_INSIGHTS[emotionId] || null;
}
