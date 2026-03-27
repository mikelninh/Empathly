/**
 * Empathly Masterclass — SEL Curriculum Data
 * 5 modules · 4 lessons each · 2 languages (de/en)
 *
 * Tier model (ethical monetization):
 *   free   → modules 1 & 2 — always free, for every person, forever
 *   pro    → modules 3–5 (personal, €4.99/month)
 *   school → teacher dashboard + class management (€2/student/year, B2B)
 *
 * No selling emotional data. No ads. No dark patterns.
 * The core mission: emotional literacy as a human right.
 */

const MC_FREE_MODULES = new Set(['module_1', 'module_2']);

const MASTERCLASS_MODULES = [

  // ══════════════════════════════════════════════════════════════════════
  // MODULE 1: Die Sprache der Gefühle / The Language of Feelings
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'module_1',
    free: true,
    badge: { emoji: '🔤', id: 'word_finder' },
    title: { de: 'Die Sprache der Gefühle', en: 'The Language of Feelings' },
    subtitle: { de: 'Warum Worte verändern, was du fühlst', en: 'Why words change what you feel' },
    description: {
      de: 'Gefühle, die du benennen kannst, verlieren ihre Macht über dich. Dieses Modul zeigt dir, warum Sprache buchstäblich deine innere Welt verändert.',
      en: 'Feelings you can name lose their power over you. This module shows you why language literally changes your inner world.'
    },
    lessons: [
      {
        id: 'lesson_1_1',
        type: 'read',
        title: { de: 'Warum Worte verändern, was du fühlst', en: 'Why words change what you feel' },
        emoji: '🧠',
        duration_min: 8,
        content: {
          de: [
            {
              type: 'hook',
              text: 'Stell dir vor, du sitzt in einem Vorstellungsgespräch. Dein Herz rast, deine Hände schwitzen. Jetzt nenn dieses Gefühl: „Angst" — oder „Aufregung". Welches Wort wählst du?'
            },
            {
              type: 'science',
              heading: 'Die Neurowissenschaft des Benennens',
              text: 'Wenn du einem Gefühl einen Namen gibst, aktiviert dein Gehirn den präfrontalen Kortex — das rationale, planende Denken. Gleichzeitig dämpft sich die Amygdala, das Alarmzentrum. Dieser Mechanismus heißt **Affect Labeling**. Eine UCLA-Studie von Matthew Lieberman (2007) zeigte: Menschen, die ihre Emotionen beschriften, bewerten bedrohliche Reize messbar ruhiger. Worte beruhigen das Nervensystem buchstäblich.'
            },
            {
              type: 'science',
              heading: 'Emotionale Granularität',
              text: 'Lisa Feldman Barrett, Neuropsychologin an der Harvard University, nennt es **emotionale Granularität**: Je feiner du zwischen Gefühlen unterscheiden kannst, desto besser kannst du regulieren. Menschen mit hoher Granularität trinken weniger in Stressphasen, erkranken seltener, erholen sich schneller von schwierigen Ereignissen. Das Vokabular ist nicht dekorativ — es ist funktional.'
            },
            {
              type: 'fact',
              text: 'Die meisten Menschen nutzen aktiv nur 10–15 Wörter für ihre Gefühle. Die deutsche Sprache kennt über 150 präzise Emotionsbegriffe. Portugiesisch hat Saudade. Koreanisch hat Han. Japanisch hat Mono no aware. Du lernst sie alle kennen.'
            },
            {
              type: 'reflection',
              prompt: 'Welche Worte benutzt du normalerweise für Gefühle? Zähl sie auf — ehrlich. Schreib sie auf.'
            }
          ],
          en: [
            {
              type: 'hook',
              text: 'Imagine you\'re in a job interview. Your heart is racing, your hands are sweating. Now name this feeling: "fear" — or "excitement". Which word do you choose?'
            },
            {
              type: 'science',
              heading: 'The neuroscience of naming',
              text: 'When you give a feeling a name, your brain activates the prefrontal cortex — the rational, planning mind. Simultaneously, the amygdala — the alarm center — quiets down. This mechanism is called **affect labeling**. A 2007 UCLA study by Matthew Lieberman showed: people who label their emotions rate threatening stimuli measurably calmer. Words literally calm the nervous system.'
            },
            {
              type: 'science',
              heading: 'Emotional granularity',
              text: 'Lisa Feldman Barrett, neuroscientist at Harvard University, calls it **emotional granularity**: the finer the distinctions you can make between feelings, the better you can regulate them. People with high granularity drink less during stressful periods, get sick less often, recover faster from difficult events. The vocabulary isn\'t decorative — it\'s functional.'
            },
            {
              type: 'fact',
              text: 'Most people actively use only 10–15 words for their feelings. The German language alone has over 150 precise emotion terms. Portuguese has Saudade. Korean has Han. Japanese has Mono no aware. You\'ll get to know them all.'
            },
            {
              type: 'reflection',
              prompt: 'What words do you normally use for feelings? Count them — honestly. Write them down.'
            }
          ]
        }
      },
      {
        id: 'lesson_1_2',
        type: 'explore',
        title: { de: 'Die Landkarte deiner Gefühle', en: 'The Map of Your Feelings' },
        emoji: '🗺️',
        duration_min: 10,
        content: {
          de: [
            {
              type: 'intro',
              text: 'Gefühle sind keine zufälligen Stürme. Sie folgen Mustern — Kategorien, die beschreiben, was dein inneres System gerade braucht.'
            },
            {
              type: 'categories',
              items: [
                { cat: 'licht', label: 'Licht & Weite', description: 'Expansive, öffnende Gefühle. Dein System signalisiert: Ressourcen vorhanden, Verbindung sicher, es ist gut.' },
                { cat: 'mitte', label: 'Sanfte Mitte', description: 'Ruhige, kontemplative Zustände. Zwischen Aktiv und Passiv — Nachdenken, Verarbeiten, Innehalten.' },
                { cat: 'schwere', label: 'Schwere & Tiefe', description: 'Gefühle, die Gewicht haben. Trauer, Erschöpfung, Scham — sie sind keine Fehler, sie sind Botschaften.' },
                { cat: 'sturm', label: 'Sturm & Reibung', description: 'Aktivierende, nach außen gerichtete Energie. Ärger zeigt dir, dass eine Grenze überschritten wurde.' },
                { cat: 'angst', label: 'Angst & Schutz', description: 'Das Schutzsystem. Angst ist nicht der Feind — sie ist das Alarmsystem, das dich am Leben gehalten hat.' },
                { cat: 'schatten', label: 'Verdeckte Schatten', description: 'Die stillen, schwer greifbaren Zustände. Zynismus, Taubheit, Resignation — oft Schutzschichten über tieferem Schmerz.' }
              ]
            },
            {
              type: 'exercise',
              heading: 'Erkunde das Rad',
              text: 'Öffne das Emotionsrad (unten) und klicke durch alle 6 Kategorien. Welche Kategorie fühlst du heute? Welche Emotion trifft es am genauesten?',
              action: 'open_emotion_wheel'
            },
            {
              type: 'reflection',
              prompt: 'Welche Kategorie ist dir am vertrautesten — die du oft fühlst? Und welche Kategorie kennst du kaum aus eigener Erfahrung?'
            }
          ],
          en: [
            {
              type: 'intro',
              text: 'Feelings aren\'t random storms. They follow patterns — categories that describe what your inner system currently needs.'
            },
            {
              type: 'categories',
              items: [
                { cat: 'licht', label: 'Light & Expanse', description: 'Expansive, opening feelings. Your system signals: resources available, connection safe, all is well.' },
                { cat: 'mitte', label: 'Gentle Middle', description: 'Quiet, contemplative states. Between active and passive — reflecting, processing, pausing.' },
                { cat: 'schwere', label: 'Heavy & Deep', description: 'Feelings that have weight. Grief, exhaustion, shame — they\'re not errors, they\'re messages.' },
                { cat: 'sturm', label: 'Storm & Friction', description: 'Activating, outward-directed energy. Anger shows you that a boundary has been crossed.' },
                { cat: 'angst', label: 'Fear & Protection', description: 'The protection system. Fear is not the enemy — it\'s the alarm system that\'s kept you alive.' },
                { cat: 'schatten', label: 'Hidden Shadows', description: 'The quiet, hard-to-grasp states. Cynicism, numbness, resignation — often protective layers over deeper pain.' }
              ]
            },
            {
              type: 'exercise',
              heading: 'Explore the wheel',
              text: 'Open the Emotion Wheel (below) and click through all 6 categories. Which category do you feel today? Which emotion fits most precisely?',
              action: 'open_emotion_wheel'
            },
            {
              type: 'reflection',
              prompt: 'Which category is most familiar to you — the one you feel most often? And which category do you barely know from your own experience?'
            }
          ]
        }
      },
      {
        id: 'lesson_1_3',
        type: 'practice',
        title: { de: 'Dein Wortschatz-Baseline', en: 'Your Vocabulary Baseline' },
        emoji: '📏',
        duration_min: 12,
        content: {
          de: [
            {
              type: 'intro',
              text: 'Bevor du deinen Wortschatz erweiterst, schauen wir: Wo stehst du gerade? Das ist keine Prüfung — es ist ein Ausgangspunkt.'
            },
            {
              type: 'info',
              text: 'Forscher haben herausgefunden, dass wir bei Gefühlen oft zum einfachsten verfügbaren Begriff greifen. "Schlecht" statt "Enttäuschung". "Gut" statt "Dankbarkeit". Das Flashcard-Training unten hilft dir, feinere Unterschiede zu erkennen.'
            }
          ],
          en: [
            {
              type: 'intro',
              text: 'Before expanding your vocabulary, let\'s see where you are right now. This isn\'t a test — it\'s a starting point.'
            },
            {
              type: 'info',
              text: 'Researchers have found that we often reach for the simplest available term for feelings. "Bad" instead of "disappointment". "Good" instead of "gratitude". The flashcard practice below helps you recognize finer distinctions.'
            }
          ]
        },
        exercise: { type: 'flashcards', category: 'all', count: 10 }
      },
      {
        id: 'lesson_1_4',
        type: 'quiz',
        title: { de: 'Modul-Quiz: Sprache & Gefühl', en: 'Module Quiz: Language & Feeling' },
        emoji: '✅',
        duration_min: 6,
        questions: [
          {
            id: 'q1_1',
            text: { de: 'Was passiert im Gehirn, wenn du einem Gefühl einen Namen gibst?', en: 'What happens in the brain when you name a feeling?' },
            options: {
              de: ['Die Amygdala wird aktiviert', 'Der präfrontale Kortex wird aktiviert, die Amygdala beruhigt sich', 'Das Gehirn schaltet ab', 'Nichts Messbares passiert'],
              en: ['The amygdala is activated', 'The prefrontal cortex activates, the amygdala quiets', 'The brain shuts down', 'Nothing measurable happens']
            },
            correct: 1,
            explanation: {
              de: 'Affect Labeling: das Benennen von Gefühlen aktiviert den rationalen Kortex und dämpft das Alarmsystem.',
              en: 'Affect labeling: naming feelings activates the rational cortex and dampens the alarm system.'
            }
          },
          {
            id: 'q1_2',
            text: { de: 'Was bedeutet "emotionale Granularität"?', en: 'What does "emotional granularity" mean?' },
            options: {
              de: ['Das Gefühl von Sandkörnern auf der Haut', 'Die Fähigkeit, zwischen vielen Gefühlsnuancen zu unterscheiden', 'Eine Methode zur Gefühlsunterdrückung', 'Die Intensität eines Gefühls messen'],
              en: ['The feeling of sand grains on skin', 'The ability to distinguish between many emotional nuances', 'A method of emotion suppression', 'Measuring the intensity of a feeling']
            },
            correct: 1,
            explanation: {
              de: 'Hohe emotionale Granularität korreliert mit besserer psychischer Gesundheit, weniger Substanzmissbrauch und schnellerer Erholung.',
              en: 'High emotional granularity correlates with better mental health, less substance use, and faster recovery.'
            }
          },
          {
            id: 'q1_3',
            text: { de: 'In welche Kategorie fällt "Ärger", wenn eine Grenze überschritten wurde?', en: 'Which category does "anger" belong to when a boundary is crossed?' },
            options: {
              de: ['Schwere & Tiefe', 'Angst & Schutz', 'Sturm & Reibung', 'Verdeckte Schatten'],
              en: ['Heavy & Deep', 'Fear & Protection', 'Storm & Friction', 'Hidden Shadows']
            },
            correct: 2,
            explanation: {
              de: 'Sturm-Emotionen sind aktivierend und nach außen gerichtet — sie zeigen, dass etwas in deiner Umwelt Reaktion braucht.',
              en: 'Storm emotions are activating and outward-directed — they show that something in your environment needs a response.'
            }
          },
          {
            id: 'q1_4',
            text: { de: 'Was ist "Vorfreude"?', en: 'What is "Vorfreude"?' },
            options: {
              de: ['Freude nach einem Erfolg', 'Die Freude, die man im Voraus fühlt, bevor etwas Schönes passiert', 'Eine Form von Nostalgie', 'Freude über das Unglück anderer'],
              en: ['Joy after a success', 'The joy felt in advance before something wonderful happens', 'A form of nostalgia', 'Joy over others\' misfortune']
            },
            correct: 1,
            explanation: {
              de: 'Vorfreude ist eine der schönsten deutschen Spezialitäten: die Freude, die bereits in der Erwartung liegt.',
              en: 'Vorfreude is one of the most beautiful German specialties: joy that already lives in the anticipation.'
            }
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════
  // MODULE 2: Was hinter Gefühlen steckt / What Lies Beneath
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'module_2',
    free: true,
    badge: { emoji: '🔍', id: 'pattern_reader' },
    title: { de: 'Was hinter Gefühlen steckt', en: 'What Lies Beneath' },
    subtitle: { de: 'Gefühl → Bedürfnis → Handlung', en: 'Feeling → Need → Action' },
    description: {
      de: 'Jedes Gefühl ist ein Bote. Es will dir etwas über ein unerfülltes Bedürfnis sagen. Dieses Modul gibt dir den Schlüssel.',
      en: 'Every feeling is a messenger. It wants to tell you something about an unmet need. This module gives you the key.'
    },
    lessons: [
      {
        id: 'lesson_2_1',
        type: 'read',
        title: { de: 'Gefühle sind Botschafter, keine Feinde', en: 'Feelings are messengers, not enemies' },
        emoji: '📨',
        duration_min: 8,
        content: {
          de: [
            {
              type: 'hook',
              text: 'Warum explodieren Menschen manchmal wegen einer Kleinigkeit — ein schmutziges Glas, ein vergessenes „Danke"? Die Antwort liegt nicht im Glas.'
            },
            {
              type: 'science',
              heading: 'Die evolutionäre Funktion',
              text: 'Gefühle sind keine Laune der Natur. Sie sind Informationssysteme, die sich über Millionen von Jahren entwickelt haben. **Angst** sagt: Hier lauert Gefahr. **Traurigkeit** sagt: Du hast etwas verloren, das wichtig war. **Wut** sagt: Eine Grenze wurde verletzt. **Freude** sagt: Das war richtig — mach mehr davon. Das Problem entsteht, wenn wir die Botschaft nicht hören — und das Gefühl deshalb lauter wird.'
            },
            {
              type: 'framework',
              heading: 'Das Grundprinzip: Gefühl → Bedürfnis → Handlung',
              text: 'Hinter jedem Gefühl steckt ein **Bedürfnis** — etwas, das dein Organismus braucht um sich sicher, verbunden, lebendig zu fühlen. Marshall Rosenberg (Gewaltfreie Kommunikation) hat gezeigt: Wenn das Bedürfnis klar ist, entstehen konstruktive Handlungsmöglichkeiten. Wenn es unklar bleibt, reagieren wir nur.'
            },
            {
              type: 'example',
              heading: 'Beispiel',
              text: '„Ich bin so wütend auf meinen Partner" → Was ist das Bedürfnis dahinter? → Gesehen werden. Wertschätzung. Ehrliche Kommunikation. → Mögliche Handlung: „Ich fühle mich nicht gehört. Können wir heute Abend reden?" Das ist ein völlig anderes Gespräch als aus der Wut heraus zu reagieren.'
            },
            {
              type: 'reflection',
              prompt: 'Denke an ein Gefühl, das du diese Woche hattest. Was könnte das Bedürfnis dahinter sein?'
            }
          ],
          en: [
            {
              type: 'hook',
              text: 'Why do people sometimes explode over something small — a dirty glass, a forgotten "thank you"? The answer isn\'t in the glass.'
            },
            {
              type: 'science',
              heading: 'The evolutionary function',
              text: 'Feelings aren\'t a whim of nature. They are information systems that evolved over millions of years. **Fear** says: danger lurks here. **Sadness** says: you\'ve lost something important. **Anger** says: a boundary has been violated. **Joy** says: that was right — do more of it. The problem arises when we don\'t hear the message — and the feeling gets louder.'
            },
            {
              type: 'framework',
              heading: 'The core principle: Feeling → Need → Action',
              text: 'Behind every feeling is a **need** — something your organism requires to feel safe, connected, alive. Marshall Rosenberg (Nonviolent Communication) showed: when the need is clear, constructive options emerge. When it remains unclear, we only react.'
            },
            {
              type: 'example',
              heading: 'Example',
              text: '"I\'m so angry at my partner" → What\'s the need behind that? → Being seen. Appreciation. Honest communication. → Possible action: "I don\'t feel heard. Can we talk tonight?" That\'s an entirely different conversation than reacting from anger.'
            },
            {
              type: 'reflection',
              prompt: 'Think of a feeling you had this week. What might be the need behind it?'
            }
          ]
        }
      },
      {
        id: 'lesson_2_2',
        type: 'practice',
        title: { de: 'Die Bedürfnis-Karte', en: 'The Needs Map' },
        emoji: '🗺️',
        duration_min: 10,
        content: {
          de: [{ type: 'intro', text: 'Wähle ein Gefühl, das du gerade kennst — und finde heraus, welche Bedürfnisse dahinterstecken. Dann erhältst du 3 konkrete Micro-Aktionen.' }],
          en: [{ type: 'intro', text: 'Choose a feeling you\'re familiar with right now — and discover which needs lie behind it. You\'ll receive 3 concrete micro-actions.' }]
        },
        exercise: { type: 'needs_map' }
      },
      {
        id: 'lesson_2_3',
        type: 'practice',
        title: { de: 'Emotions-Detective: Verhalten lesen', en: 'Emotion Detective: Reading Behavior' },
        emoji: '🕵️',
        duration_min: 12,
        content: {
          de: [
            { type: 'intro', text: 'Was jemand tut, ist oft nicht das, was er fühlt. Der Kollege, der immer perfekt ist — möglicherweise fühlt er sich nicht sicher genug, um Schwäche zu zeigen. Das Kind, das aggressiv ist — möglicherweise fühlt es sich unverstanden.' },
            { type: 'info', text: 'Der Emotion Detective trainiert dich, unter die Oberfläche zu sehen. Was ist wirklich hinter dem Verhalten?' }
          ],
          en: [
            { type: 'intro', text: 'What someone does is often not what they feel. The colleague who is always perfect — perhaps they don\'t feel safe enough to show weakness. The child who is aggressive — perhaps they feel misunderstood.' },
            { type: 'info', text: 'The Emotion Detective trains you to see beneath the surface. What is really behind the behavior?' }
          ]
        },
        exercise: { type: 'detective', count: 3 }
      },
      {
        id: 'lesson_2_4',
        type: 'quiz',
        title: { de: 'Modul-Quiz: Bedürfnisse & Botschaften', en: 'Module Quiz: Needs & Messages' },
        emoji: '✅',
        duration_min: 6,
        questions: [
          {
            id: 'q2_1',
            text: { de: 'Wofür steht das Bedürfnis hinter Wut, laut Gewaltfreier Kommunikation?', en: 'What does the need behind anger represent, according to Nonviolent Communication?' },
            options: {
              de: ['Einem Bedürfnis nach Zerstörung', 'Einem unerfüllten Bedürfnis, oft nach Respekt oder Grenzen', 'Einem Bedürfnis nach Bestrafung', 'Keinem echten Bedürfnis'],
              en: ['A need for destruction', 'An unmet need, often for respect or boundaries', 'A need for punishment', 'No real need']
            },
            correct: 1,
            explanation: {
              de: 'Marshall Rosenberg zeigte, dass Ärger immer ein Hinweis auf ein unerfülltes Bedürfnis ist — oft Respekt, Gerechtigkeit oder Gehör.',
              en: 'Marshall Rosenberg showed that anger is always a signal of an unmet need — often respect, justice, or being heard.'
            }
          },
          {
            id: 'q2_2',
            text: { de: 'Warum zeigt der Emotion Detective verstecktes Verhalten statt offensichtlicher Gefühle?', en: 'Why does the Emotion Detective show hidden behavior instead of obvious feelings?' },
            options: {
              de: ['Weil Gefühle unwichtig sind', 'Weil Menschen ihre wahren Gefühle oft hinter Verhalten verbergen', 'Weil Verhalten einfacher zu erkennen ist', 'Nur aus Spielgründen'],
              en: ['Because feelings are unimportant', 'Because people often hide their real feelings behind behavior', 'Because behavior is easier to recognize', 'Only for game purposes']
            },
            correct: 1,
            explanation: {
              de: 'Emotionale Intelligenz bedeutet, das Gefühl hinter dem Verhalten zu erkennen — nicht nur das Verhalten selbst.',
              en: 'Emotional intelligence means recognizing the feeling behind behavior — not just the behavior itself.'
            }
          },
          {
            id: 'q2_3',
            text: { de: 'Welches Bedürfnis steckt am häufigsten hinter Einsamkeit?', en: 'Which need most often underlies loneliness?' },
            options: {
              de: ['Körperliche Bewegung', 'Nähe, Gesehen werden, Verbundenheit', 'Struktur und Ordnung', 'Kreativität'],
              en: ['Physical movement', 'Closeness, being seen, connection', 'Structure and order', 'Creativity']
            },
            correct: 1,
            explanation: {
              de: 'Einsamkeit signalisiert fast immer das Bedürfnis nach echter Verbindung — gesehen, gehört und anerkannt zu werden.',
              en: 'Loneliness almost always signals the need for genuine connection — to be seen, heard, and acknowledged.'
            }
          },
          {
            id: 'q2_4',
            text: { de: 'Was ist der Unterschied zwischen einer Reaktion und einer Antwort auf ein Gefühl?', en: 'What is the difference between a reaction and a response to a feeling?' },
            options: {
              de: ['Es gibt keinen Unterschied', 'Eine Reaktion ist automatisch; eine Antwort entsteht durch Innehalten und Bewusstsein', 'Eine Reaktion ist immer falsch', 'Antworten sind nur für Erwachsene'],
              en: ['There is no difference', 'A reaction is automatic; a response arises through pausing and awareness', 'A reaction is always wrong', 'Responses are only for adults']
            },
            correct: 1,
            explanation: {
              de: 'Viktor Frankl: „Zwischen Reiz und Reaktion liegt ein Raum. In diesem Raum liegt unsere Freiheit." Das Benennen des Gefühls schafft diesen Raum.',
              en: 'Viktor Frankl: "Between stimulus and response there is a space. In that space lies our freedom." Naming the feeling creates that space.'
            }
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════
  // MODULE 3: Der Körper weiß es / The Body Knows
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'module_3',
    free: false,
    badge: { emoji: '🫁', id: 'body_listener' },
    title: { de: 'Der Körper weiß es', en: 'The Body Knows' },
    subtitle: { de: 'Gefühle als körperliche Erfahrung', en: 'Feelings as physical experience' },
    description: {
      de: 'Gefühle entstehen nicht im Kopf — sie entstehen im Körper. Lernen, den Körper zu lesen, ist das älteste Instrument der emotionalen Intelligenz.',
      en: 'Feelings don\'t arise in the head — they arise in the body. Learning to read the body is the oldest instrument of emotional intelligence.'
    },
    lessons: [
      {
        id: 'lesson_3_1',
        type: 'read',
        title: { de: 'Wo Gefühle wohnen', en: 'Where feelings live' },
        emoji: '🫀',
        duration_min: 8,
        content: {
          de: [
            { type: 'hook', text: 'Finnen beschreiben Angst als Druck im Bauch. Japaner lokalisieren Traurigkeit in der Kehle. Nordamerikaner im Herz. Alle liegen richtig — weil Gefühle körperliche Ereignisse sind.' },
            { type: 'science', heading: 'Die Körperkarte der Emotionen', text: 'Eine finnische Studie (Nummenmaa et al., 2014) ließ 700 Menschen aus verschiedenen Kulturen zeichnen, wo sie Gefühle im Körper spüren. Das Ergebnis: **verblüffend konsistent über alle Kulturen hinweg.** Wut: Brust und Arme. Angst: Kehle und Brust. Liebe: Ganzer Oberkörper plus Genitalien. Depression: Gedämpft in fast allen Bereichen.' },
            { type: 'science', heading: 'Interoception', text: '**Interoception** — das Wahrnehmen innerer Körperzustände — ist eine trainierbare Fähigkeit. Menschen mit hoher Interozeption erkennen Gefühle früher, bevor sie eskalieren. Das gibt mehr Zeit zum Reagieren statt Reagiert-werden.' },
            { type: 'exercise', heading: 'Body Scan', text: 'Schließ die Augen. Atme tief. Wo in deinem Körper spürst du gerade etwas? Anspannung, Wärme, Enge, Leichtigkeit? Beobachte 60 Sekunden, ohne zu bewerten.', action: 'timer_60' },
            { type: 'reflection', prompt: 'Was hast du gespürt? Kannst du dieses körperliche Empfinden einem Gefühl zuordnen?' }
          ],
          en: [
            { type: 'hook', text: 'Finns describe fear as pressure in the stomach. Japanese localize sadness in the throat. North Americans in the heart. All are right — because feelings are bodily events.' },
            { type: 'science', heading: 'The body map of emotions', text: 'A Finnish study (Nummenmaa et al., 2014) had 700 people from different cultures draw where they feel emotions in their body. The result: **strikingly consistent across all cultures.** Anger: chest and arms. Fear: throat and chest. Love: entire upper body plus genitals. Depression: dampened across nearly all areas.' },
            { type: 'science', heading: 'Interoception', text: '**Interoception** — perceiving inner body states — is a trainable ability. People with high interoception recognize feelings earlier, before they escalate. This gives more time to respond rather than react.' },
            { type: 'exercise', heading: 'Body scan', text: 'Close your eyes. Breathe deeply. Where in your body do you feel something right now? Tension, warmth, tightness, lightness? Observe for 60 seconds without judgment.', action: 'timer_60' },
            { type: 'reflection', prompt: 'What did you feel? Can you assign that physical sensation to a feeling?' }
          ]
        }
      },
      {
        id: 'lesson_3_2',
        type: 'read',
        title: { de: 'Regulation — bevor du es bereust', en: 'Regulation — before you regret it' },
        emoji: '🌊',
        duration_min: 7,
        content: {
          de: [
            { type: 'hook', text: 'Die E-Mail, die du abends in Wut geschrieben hast. Das Wort, das rausgerutscht ist. Die meisten Momente, die wir bereuen, entstehen, wenn das Nervensystem in Alarm ist.' },
            { type: 'science', heading: 'Das Window of Tolerance', text: 'Dan Siegel entwickelte das Konzept des **Toleranzfensters**: Ein Bereich optimaler Erregung, in dem wir denken, fühlen und handeln können. Darunter: Erstarrung, Dissoziation. Darüber: Überwältigung, Kontrollverlust. Regulation bedeutet, ins Fenster zurückzukehren.' },
            { type: 'tools', heading: '4 Werkzeuge, die wirklich funktionieren', items: [
              { name: 'Physiologischer Seufzer', text: 'Doppelt einatmen (durch die Nase), dann lang ausatmen. Aktiviert sofort das parasympathische Nervensystem.' },
              { name: '5-4-3-2-1 Grounding', text: '5 Dinge sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken. Bringt dich aus dem Kopf in den Raum.' },
              { name: 'STOP', text: 'Stop — Take a breath — Observe — Proceed. 10 Sekunden zwischen Impuls und Handlung.' },
              { name: 'Name it to tame it', text: 'Das Affect Labeling, das du in Modul 1 kennengelernt hast. Im Moment der Eskalation: "Ich fühle Wut" — das reicht.' }
            ]},
            { type: 'reflection', prompt: 'Welche Situationen bringen dich regelmäßig über dein Toleranzfenster? Was hilft dir, zurückzukehren?' }
          ],
          en: [
            { type: 'hook', text: 'The email you wrote in anger in the evening. The word that slipped out. Most moments we regret arise when the nervous system is in alarm.' },
            { type: 'science', heading: 'The Window of Tolerance', text: 'Dan Siegel developed the concept of the **window of tolerance**: a zone of optimal arousal in which we can think, feel and act. Below it: freezing, dissociation. Above it: overwhelm, loss of control. Regulation means returning to the window.' },
            { type: 'tools', heading: '4 tools that actually work', items: [
              { name: 'Physiological sigh', text: 'Double inhale (through nose), then long exhale. Instantly activates the parasympathetic nervous system.' },
              { name: '5-4-3-2-1 Grounding', text: '5 things to see, 4 to hear, 3 to feel, 2 to smell, 1 to taste. Gets you out of your head into the room.' },
              { name: 'STOP', text: 'Stop — Take a breath — Observe — Proceed. 10 seconds between impulse and action.' },
              { name: 'Name it to tame it', text: 'The affect labeling from Module 1. In the moment of escalation: "I feel anger" — that\'s enough.' }
            ]},
            { type: 'reflection', prompt: 'What situations regularly push you past your window of tolerance? What helps you return?' }
          ]
        }
      },
      {
        id: 'lesson_3_3',
        type: 'practice',
        title: { de: 'Check-In als tägliche Praxis', en: 'Check-In as a daily practice' },
        emoji: '📅',
        duration_min: 6,
        content: {
          de: [{ type: 'intro', text: 'Emotionale Intelligenz wächst durch tägliche Praxis — nicht durch einmalige Einsicht. Der Check-In dauert 90 Sekunden und verändert über Zeit, wie du dich selbst wahrnimmst.' }],
          en: [{ type: 'intro', text: 'Emotional intelligence grows through daily practice — not through one-time insight. The Check-In takes 90 seconds and over time changes how you perceive yourself.' }]
        },
        exercise: { type: 'checkin' }
      },
      {
        id: 'lesson_3_4',
        type: 'quiz',
        title: { de: 'Modul-Quiz: Körper & Regulation', en: 'Module Quiz: Body & Regulation' },
        emoji: '✅',
        duration_min: 5,
        questions: [
          {
            id: 'q3_1',
            text: { de: 'Was ist Interoception?', en: 'What is interoception?' },
            options: {
              de: ['Schmerz durch Kälte', 'Das Wahrnehmen innerer Körperzustände', 'Ein Meditationstyp', 'Die Fähigkeit, andere zu lesen'],
              en: ['Pain from cold', 'Perceiving inner body states', 'A type of meditation', 'The ability to read others']
            },
            correct: 1,
            explanation: {
              de: 'Interoception ist trainierbar und korreliert mit emotionaler Regulationsfähigkeit.',
              en: 'Interoception is trainable and correlates with emotional regulation ability.'
            }
          },
          {
            id: 'q3_2',
            text: { de: 'Was passiert "oberhalb" des Toleranzfensters?', en: 'What happens "above" the window of tolerance?' },
            options: {
              de: ['Tiefe Entspannung', 'Erstarrung und Dissoziation', 'Überwältigung und Kontrollverlust', 'Kreativität und Flow'],
              en: ['Deep relaxation', 'Freezing and dissociation', 'Overwhelm and loss of control', 'Creativity and flow']
            },
            correct: 2,
            explanation: {
              de: 'Über dem Toleranzfenster: Hyper-Arousal (Überwältigung). Darunter: Hypo-Arousal (Erstarrung). Das Ziel ist das Fenster.',
              en: 'Above the window: Hyper-arousal (overwhelm). Below: Hypo-arousal (freezing). The goal is the window.'
            }
          },
          {
            id: 'q3_3',
            text: { de: 'Warum wirkt der physiologische Seufzer so schnell?', en: 'Why does the physiological sigh work so quickly?' },
            options: {
              de: ['Weil er Sauerstoff produziert', 'Weil das lange Ausatmen das parasympathische System aktiviert', 'Weil man dabei die Augen schließt', 'Es ist nur Placebo'],
              en: ['Because it produces oxygen', 'Because the long exhale activates the parasympathetic system', 'Because you close your eyes', 'It\'s only placebo']
            },
            correct: 1,
            explanation: {
              de: 'Der lange Ausatem aktiviert direkt den Vagusnerv und das parasympathische Nervensystem — innerhalb von Sekunden messbar.',
              en: 'The long exhale directly activates the vagus nerve and parasympathetic system — measurably within seconds.'
            }
          },
          {
            id: 'q3_4',
            text: { de: 'Was zeigte die finnische Körperkarten-Studie?', en: 'What did the Finnish body map study show?' },
            options: {
              de: ['Gefühle werden überall anders lokalisiert', 'Körperkarten von Gefühlen sind kulturübergreifend konsistent', 'Nur Finnen können Gefühle lokalisieren', 'Körpergefühle sind rein subjektiv'],
              en: ['Feelings are localized differently everywhere', 'Body maps of feelings are consistent across cultures', 'Only Finns can localize feelings', 'Body feelings are purely subjective']
            },
            correct: 1,
            explanation: {
              de: 'Über 700 Teilnehmer aus verschiedenen Kulturen zeigten verblüffend ähnliche Körperkarten — ein Hinweis auf die evolutionäre Basis von Emotionen.',
              en: 'Over 700 participants from different cultures showed strikingly similar body maps — evidence for the evolutionary basis of emotions.'
            }
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════
  // MODULE 4: Gefühle über Kulturen / Feelings Across Cultures
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'module_4',
    free: false,
    badge: { emoji: '🌍', id: 'cultural_bridge' },
    title: { de: 'Gefühle über Kulturen', en: 'Feelings Across Cultures' },
    subtitle: { de: 'Warum nicht alle Kulturen Schadenfreude kennen', en: 'Why not all cultures know Schadenfreude' },
    description: {
      de: 'Emotionen sind universell. Aber die Worte dafür sind es nicht. Entdecke, was du durch andere Sprachen über dich selbst lernst.',
      en: 'Emotions are universal. But the words for them are not. Discover what you learn about yourself through other languages.'
    },
    lessons: [
      {
        id: 'lesson_4_1',
        type: 'read',
        title: { de: 'Unübersetzbare Emotionen — eine Weltreise', en: 'Untranslatable Emotions — A World Tour' },
        emoji: '🌐',
        duration_min: 10,
        content: {
          de: [
            { type: 'hook', text: 'Wenn du kein Wort für etwas hast, kannst du es trotzdem fühlen — aber du kannst es schwerer darüber reden, darüber nachdenken, darüber hinauswachsen.' },
            { type: 'untranslatables', items: [
              { word: 'Schadenfreude', lang: 'Deutsch', meaning: 'Freude über das Unglück anderer — und das schlechte Gewissen darüber, dass man es fühlt.' },
              { word: 'Saudade', lang: 'Portugiesisch', meaning: 'Tiefe Sehnsucht nach etwas oder jemandem, das/die vielleicht nie zurückkommt. Eine Art liebevolles Heimweh.' },
              { word: 'Han', lang: 'Koreanisch', meaning: 'Kollektiver Schmerz, Trauer und Ressentiment, tief im Volk verwurzelt durch Jahrhunderte von Unterdrückung. Nicht ganz Trauer — etwas zwischen Groll und Würde.' },
              { word: 'Mono no aware', lang: 'Japanisch', meaning: 'Die bittersüße Wahrnehmung, dass alle Dinge vergänglich sind. Die Schönheit der Kirschblüte entsteht genau dadurch, dass sie fällt.' },
              { word: 'Hygge', lang: 'Dänisch', meaning: 'Die Behaglichkeit des gemeinsamen Moments — Kerzen, Wärme, Menschen, die du liebst. Nicht nur Gemütlichkeit, sondern aktive Pflege von Verbundenheit.' },
              { word: 'Waldeinsamkeit', lang: 'Deutsch', meaning: 'Das Gefühl der Einsamkeit und Verbundenheit zugleich, das ein Wald auslöst. Solitude, die nährt statt schmerzt.' },
              { word: 'Ya\'aburnee', lang: 'Arabisch', meaning: 'Wörtlich: „Du sollst mich begraben" — gesagt zu jemandem, den du so sehr liebst, dass du dir wünschst, vor ihm zu sterben, damit du seinen Tod nicht erleben musst.' },
              { word: 'Torschlusspanik', lang: 'Deutsch', meaning: 'Die Panik, dass sich die Tore schließen — die Zeit läuft ab, Möglichkeiten verschwinden. Das Gefühl des biologischen, beruflichen oder persönlichen Countdowns.' }
            ]},
            { type: 'reflection', prompt: 'Welches dieser Worte trifft ein Gefühl, das du kennst, aber bisher nicht benennen konntest?' }
          ],
          en: [
            { type: 'hook', text: 'If you don\'t have a word for something, you can still feel it — but it\'s harder to talk about it, think about it, grow beyond it.' },
            { type: 'untranslatables', items: [
              { word: 'Schadenfreude', lang: 'German', meaning: 'Joy at others\' misfortune — and the guilty feeling that you feel it.' },
              { word: 'Saudade', lang: 'Portuguese', meaning: 'Deep longing for something or someone that may never return. A kind of loving homesickness.' },
              { word: 'Han', lang: 'Korean', meaning: 'Collective pain, grief and resentment, deeply rooted in a people through centuries of oppression. Not quite grief — something between resentment and dignity.' },
              { word: 'Mono no aware', lang: 'Japanese', meaning: 'The bittersweet awareness that all things are impermanent. The beauty of cherry blossoms arises precisely because they fall.' },
              { word: 'Hygge', lang: 'Danish', meaning: 'The coziness of a shared moment — candles, warmth, people you love. Not just coziness, but the active cultivation of connection.' },
              { word: 'Waldeinsamkeit', lang: 'German', meaning: 'The feeling of solitude and connection simultaneously that a forest evokes. Solitude that nourishes rather than hurts.' },
              { word: 'Ya\'aburnee', lang: 'Arabic', meaning: 'Literally: "may you bury me" — said to someone you love so much that you wish to die before them, so you don\'t have to experience their death.' },
              { word: 'Torschlusspanik', lang: 'German', meaning: 'The panic that the gates are closing — time is running out, opportunities are disappearing. The feeling of biological, professional or personal countdown.' }
            ]},
            { type: 'reflection', prompt: 'Which of these words captures a feeling you know but couldn\'t name until now?' }
          ]
        }
      },
      {
        id: 'lesson_4_2',
        type: 'practice',
        title: { de: 'Kulturelle Brücke — KI-Gespräch', en: 'Cultural Bridge — AI Conversation' },
        emoji: '🤖',
        duration_min: 10,
        content: {
          de: [{ type: 'intro', text: 'Wähle eine Emotion. Frage einen der KI-Guides, wie diese Emotion in ihrer Kultur erlebt wird — und was sich dahinter verbirgt.' }],
          en: [{ type: 'intro', text: 'Choose an emotion. Ask one of the AI guides how this emotion is experienced in their culture — and what lies behind it.' }]
        },
        exercise: { type: 'cultural_bridge' }
      },
      {
        id: 'lesson_4_3',
        type: 'read',
        title: { de: 'EQ in Beziehungen', en: 'EQ in Relationships' },
        emoji: '💬',
        duration_min: 7,
        content: {
          de: [
            { type: 'hook', text: 'Emotionale Intelligenz ist keine Persönlichkeitseigenschaft. Sie ist eine Fähigkeit — die man lernen, üben und weitergeben kann.' },
            { type: 'framework', heading: 'Die 4 Fähigkeiten des EQ (Salovey & Mayer)', text: '1. **Wahrnehmen**: Gefühle in dir und anderen erkennen. 2. **Nutzen**: Gefühle für Denken und Entscheidungen einsetzen. 3. **Verstehen**: Wissen, was Gefühle bedeuten und wie sie sich entwickeln. 4. **Regulieren**: Gefühle so handhaben, dass sie dienlich sind.' },
            { type: 'practice', heading: 'Aktives Zuhören', text: 'Der Unterschied zwischen „Ich höre dich" und wirklich Gehört-werden ist riesig. Aktives Zuhören bedeutet: Nicht gleichzeitig antworten planen. Den anderen paraphrasieren. Fragen stellen, keine Lösungen geben. Die Emotion benennen, die du wahrnimmst.' },
            { type: 'reflection', prompt: 'Wann hast du dich zuletzt wirklich gehört gefühlt? Was hat die andere Person getan?' }
          ],
          en: [
            { type: 'hook', text: 'Emotional intelligence is not a personality trait. It is a skill — one that can be learned, practiced, and passed on.' },
            { type: 'framework', heading: 'The 4 abilities of EQ (Salovey & Mayer)', text: '1. **Perceiving**: Recognizing feelings in yourself and others. 2. **Using**: Employing feelings for thinking and decisions. 3. **Understanding**: Knowing what feelings mean and how they develop. 4. **Regulating**: Managing feelings so they are useful.' },
            { type: 'practice', heading: 'Active listening', text: 'The difference between "I hear you" and actually being heard is enormous. Active listening means: Not planning your response while they talk. Paraphrasing what they said. Asking questions, not giving solutions. Naming the emotion you perceive.' },
            { type: 'reflection', prompt: 'When did you last feel truly heard? What did the other person do?' }
          ]
        }
      },
      {
        id: 'lesson_4_4',
        type: 'quiz',
        title: { de: 'Modul-Quiz: Kultur & EQ', en: 'Module Quiz: Culture & EQ' },
        emoji: '✅',
        duration_min: 5,
        questions: [
          {
            id: 'q4_1',
            text: { de: 'Was bedeutet "Mono no aware"?', en: 'What does "Mono no aware" mean?' },
            options: {
              de: ['Traurigkeit über verlorene Dinge', 'Die bittersüße Vergänglichkeit aller Dinge', 'Die Freude an kleinen Dingen', 'Schmerz bei Berührung'],
              en: ['Sadness over lost things', 'The bittersweet impermanence of all things', 'Joy in small things', 'Pain at touch']
            },
            correct: 1,
            explanation: {
              de: 'Mono no aware ist das Herzstück japanischer Ästhetik: Schönheit existiert wegen, nicht trotz der Vergänglichkeit.',
              en: 'Mono no aware is at the heart of Japanese aesthetics: beauty exists because of, not despite, impermanence.'
            }
          },
          {
            id: 'q4_2',
            text: { de: 'Welche der 4 EQ-Fähigkeiten kommt zuerst?', en: 'Which of the 4 EQ abilities comes first?' },
            options: {
              de: ['Regulieren', 'Verstehen', 'Wahrnehmen', 'Nutzen'],
              en: ['Regulating', 'Understanding', 'Perceiving', 'Using']
            },
            correct: 2,
            explanation: {
              de: 'Wahrnehmen ist die Basis: Ohne zu erkennen, was du und andere fühlen, kann man nicht verstehen, nutzen oder regulieren.',
              en: 'Perceiving is the foundation: without recognizing what you and others feel, you can\'t understand, use, or regulate.'
            }
          },
          {
            id: 'q4_3',
            text: { de: 'Was ist "Torschlusspanik"?', en: 'What is "Torschlusspanik"?' },
            options: {
              de: ['Angst vor geschlossenen Türen', 'Die Angst, dass Möglichkeiten und Zeit ablaufen', 'Panik beim Verlassen des Hauses', 'Freude über einen Abschluss'],
              en: ['Fear of closed doors', 'The fear that opportunities and time are running out', 'Panic when leaving the house', 'Joy over a completion']
            },
            correct: 1,
            explanation: {
              de: 'Torschlusspanik ist die Angst vor dem Schließen der Tore — biologisch, beruflich, persönlich. Besonders im mittleren Lebensalter.',
              en: 'Torschlusspanik is the fear of the closing gate — biological, professional, personal. Especially in middle age.'
            }
          },
          {
            id: 'q4_4',
            text: { de: 'Was bedeutet "Ya\'aburnee" aus dem Arabischen?', en: 'What does "Ya\'aburnee" from Arabic mean?' },
            options: {
              de: ['Eine aggressive Aussage', 'Der Wunsch zu sterben, bevor jemanden den man liebt', 'Eine religiöse Begrüßung', 'Ausdruck von Wut'],
              en: ['An aggressive statement', 'The wish to die before someone you love', 'A religious greeting', 'Expression of anger']
            },
            correct: 1,
            explanation: {
              de: 'Ya\'aburnee — „Du sollst mich begraben" — ist einer der intensivsten Liebesausdrücke der Welt. Tiefe Zuneigung ausgedrückt durch den Gedanken an Verlust.',
              en: 'Ya\'aburnee — "may you bury me" — is one of the most intense love expressions in the world. Deep affection expressed through the thought of loss.'
            }
          }
        ]
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════
  // MODULE 5: Die Praxis / The Practice (Certificate Module)
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'module_5',
    free: false,
    badge: { emoji: '🏆', id: 'certified' },
    certificate: true,
    title: { de: 'Die Praxis', en: 'The Practice' },
    subtitle: { de: 'Emotionale Alphabetisierung leben und weitergeben', en: 'Living and passing on emotional literacy' },
    description: {
      de: 'Das Wissen ist da. Jetzt wird es zur Praxis — täglich, in Beziehungen, als etwas, das du anderen geben kannst.',
      en: 'The knowledge is there. Now it becomes practice — daily, in relationships, as something you can give to others.'
    },
    lessons: [
      {
        id: 'lesson_5_1',
        type: 'read',
        title: { de: 'Eine tägliche Gewohnheit aufbauen', en: 'Building a daily habit' },
        emoji: '🌱',
        duration_min: 7,
        content: {
          de: [
            { type: 'hook', text: 'Die meisten Menschen wissen, dass sie regelmäßig schlafen, trinken und essen sollten. Wenigsten genauso wichtig: regelmäßig einchecken, was in einem vorgeht.' },
            { type: 'science', heading: 'Habit stacking', text: 'BJ Fogg (Stanford) und James Clear (Atomic Habits) zeigen: Neue Gewohnheiten funktionieren am besten, wenn sie an bestehende angehängt werden. Nicht „Ich muss täglich meditieren" — sondern: „Nach meinem Morgenkaffee mache ich 90 Sekunden Check-In."' },
            { type: 'tools', heading: 'Der 90-Sekunden Check-In', items: [
              { name: 'Schritt 1', text: 'Welches Gefühl ist gerade am stärksten? (Emotionsrad öffnen, 20 Sekunden)' },
              { name: 'Schritt 2', text: 'Was brauche ich gerade? (Eine Antwort reicht, 30 Sekunden)' },
              { name: 'Schritt 3', text: 'Eine Mini-Aktion: Was tue ich heute für dieses Bedürfnis? (40 Sekunden)' }
            ]},
            { type: 'reflection', prompt: 'Wann im Tag passt dein Check-In? Nach welcher bestehenden Gewohnheit könntest du ihn anhängen?' }
          ],
          en: [
            { type: 'hook', text: 'Most people know they should regularly sleep, drink, and eat. At least as important: regularly checking in with what\'s happening inside.' },
            { type: 'science', heading: 'Habit stacking', text: 'BJ Fogg (Stanford) and James Clear (Atomic Habits) show: new habits work best when attached to existing ones. Not "I must meditate daily" — but: "After my morning coffee I do a 90-second check-in."' },
            { type: 'tools', heading: 'The 90-second check-in', items: [
              { name: 'Step 1', text: 'Which feeling is strongest right now? (Open emotion wheel, 20 seconds)' },
              { name: 'Step 2', text: 'What do I need right now? (One answer is enough, 30 seconds)' },
              { name: 'Step 3', text: 'One mini-action: What do I do today for this need? (40 seconds)' }
            ]},
            { type: 'reflection', prompt: 'When in the day does your check-in fit? After which existing habit could you attach it?' }
          ]
        }
      },
      {
        id: 'lesson_5_2',
        type: 'read',
        title: { de: 'Schwierige Gespräche führen', en: 'Having difficult conversations' },
        emoji: '💬',
        duration_min: 8,
        content: {
          de: [
            { type: 'hook', text: 'Das schwierigste Gespräch ist meistens das, das wir am längsten vermeiden. Und genau dieses verändert alles.' },
            { type: 'framework', heading: 'Die GFK-Struktur (Gewaltfreie Kommunikation)', text: '**Beobachtung**: Was genau ist passiert? (Keine Bewertung) → **Gefühl**: Was fühlst du dabei? → **Bedürfnis**: Was brauchst du? → **Bitte**: Was konkret wünschst du dir?\n\nBeispiel: „Wenn du das Meeting ohne mich anberaumst [Beobachtung], fühle ich mich übergangen [Gefühl], weil mir Einbindung wichtig ist [Bedürfnis]. Könntest du mich beim nächsten Mal vorher fragen? [Bitte]"' },
            { type: 'tools', heading: '3 Sätze für fast jedes schwierige Gespräch', items: [
              { name: 'Öffner', text: '„Ich möchte ehrlich mit dir sein, weil mir diese Beziehung wichtig ist."' },
              { name: 'Gefühl benennen', text: '„Ich merke, dass ich... fühle, wenn... passiert."' },
              { name: 'Bitte', text: '„Was ich mir wünsche, ist... Ist das für dich möglich?"' }
            ]},
            { type: 'reflection', prompt: 'Gibt es ein Gespräch, das du schon lange vor dir herschiebst? Was ist das Gefühl dahinter? Was das Bedürfnis?' }
          ],
          en: [
            { type: 'hook', text: 'The most difficult conversation is usually the one we avoid the longest. And that\'s exactly the one that changes everything.' },
            { type: 'framework', heading: 'The NVC structure (Nonviolent Communication)', text: '**Observation**: What exactly happened? (No judgment) → **Feeling**: What do you feel about it? → **Need**: What do you need? → **Request**: What specifically do you want?\n\nExample: "When you schedule the meeting without me [observation], I feel bypassed [feeling], because inclusion matters to me [need]. Could you ask me next time beforehand? [request]"' },
            { type: 'tools', heading: '3 sentences for almost any difficult conversation', items: [
              { name: 'Opener', text: '"I want to be honest with you, because this relationship matters to me."' },
              { name: 'Name the feeling', text: '"I notice that I feel... when... happens."' },
              { name: 'Request', text: '"What I wish for is... Is that possible for you?"' }
            ]},
            { type: 'reflection', prompt: 'Is there a conversation you\'ve been putting off? What\'s the feeling behind it? What\'s the need?' }
          ]
        }
      },
      {
        id: 'lesson_5_3',
        type: 'read',
        title: { de: 'Emotionale Alphabetisierung weitergeben', en: 'Passing on emotional literacy' },
        emoji: '🌍',
        duration_min: 7,
        content: {
          de: [
            { type: 'hook', text: 'Emotionale Intelligenz ist eine Fähigkeit, die in Familien, Klassenzimmern und Organisationen wächst — wenn jemand beginnt, sie zu praktizieren und zu zeigen.' },
            { type: 'science', heading: 'Emotionstraining funktioniert', text: 'Meta-Analysen über SEL-Programme (Durlak et al., 2011) zeigen: Schülerinnen und Schüler mit emotionaler Bildung haben 11% bessere Schulleistungen, weniger Verhaltensauffälligkeiten, mehr prosoziales Verhalten. Das sind keine weichen Ziele — das sind messbare Ergebnisse.' },
            { type: 'practice', heading: 'Wie du heute beginnst', text: 'Du brauchst keine Ausbildung. Du brauchst drei Dinge: 1. Selbst benennen, was du fühlst — laut, in Gegenwart anderer. 2. Kinder oder Mitmenschen fragen: „Wie geht es dir wirklich?" und die Antwort aushalten. 3. Fehler emotional kommentieren: „Ich war wütend — das war falsch von mir. Was ich wirklich brauchte, war..."' },
            { type: 'closing', text: 'Emotionaler Wortschatz ist keine Luxuskompetenz. Es ist ein Menschenrecht. Wer mehr Worte für sein Innenleben hat, lebt länger, gesünder, verbundener. Du trägst das jetzt weiter.' },
            { type: 'reflection', prompt: 'An wen denkst du, wenn du dieses Wissen weitergeben möchtest? Was wäre der erste Schritt?' }
          ],
          en: [
            { type: 'hook', text: 'Emotional intelligence is a skill that grows in families, classrooms and organizations — when someone begins to practice and model it.' },
            { type: 'science', heading: 'Emotion training works', text: 'Meta-analyses of SEL programs (Durlak et al., 2011) show: students with emotional education have 11% better academic performance, fewer behavioral issues, more prosocial behavior. These aren\'t soft goals — they\'re measurable results.' },
            { type: 'practice', heading: 'How you start today', text: 'You don\'t need a degree. You need three things: 1. Name what you feel — aloud, in the presence of others. 2. Ask children or peers: "How are you really?" and sit with the answer. 3. Comment on mistakes emotionally: "I was angry — that was wrong of me. What I really needed was..."' },
            { type: 'closing', text: 'Emotional vocabulary is not a luxury skill. It is a human right. Those who have more words for their inner life live longer, healthier, more connected lives. You carry this forward now.' },
            { type: 'reflection', prompt: 'Who comes to mind when you want to pass on this knowledge? What would the first step be?' }
          ]
        }
      },
      {
        id: 'lesson_5_4',
        type: 'quiz',
        title: { de: 'Abschluss-Assessment', en: 'Final Assessment' },
        emoji: '🏆',
        duration_min: 8,
        final: true,
        questions: [
          {
            id: 'q5_1',
            text: { de: 'Welchen messbaren Effekt hat SEL-Bildung laut Forschung auf Schulleistungen?', en: 'What measurable effect does SEL education have on academic performance according to research?' },
            options: {
              de: ['Keinen Effekt', '5% Verbesserung', '11% Verbesserung', '25% Verbesserung'],
              en: ['No effect', '5% improvement', '11% improvement', '25% improvement']
            },
            correct: 2,
            explanation: {
              de: 'Durlak et al. (2011) Meta-Analyse: 11% bessere Schulleistung bei SEL-Teilnehmern.',
              en: 'Durlak et al. (2011) meta-analysis: 11% better academic performance for SEL participants.'
            }
          },
          {
            id: 'q5_2',
            text: { de: 'Was ist "Habit Stacking"?', en: 'What is "habit stacking"?' },
            options: {
              de: ['Mehrere Apps gleichzeitig nutzen', 'Eine neue Gewohnheit an eine bestehende anhängen', 'Gewohnheiten brechen', 'Einen Tagesplan erstellen'],
              en: ['Using multiple apps simultaneously', 'Attaching a new habit to an existing one', 'Breaking habits', 'Creating a daily plan']
            },
            correct: 1,
            explanation: {
              de: 'Habit Stacking (BJ Fogg/James Clear): neue Gewohnheiten sind stabiler, wenn sie mit bestehenden verknüpft werden.',
              en: 'Habit stacking (BJ Fogg/James Clear): new habits are more stable when linked to existing ones.'
            }
          },
          {
            id: 'q5_3',
            text: { de: 'Was sind die 4 Schritte der Gewaltfreien Kommunikation?', en: 'What are the 4 steps of Nonviolent Communication?' },
            options: {
              de: ['Fragen, Antworten, Diskutieren, Schließen', 'Beobachtung, Gefühl, Bedürfnis, Bitte', 'Erklären, Verteidigen, Entschuldigen, Vergeben', 'Hören, Verstehen, Antworten, Helfen'],
              en: ['Ask, answer, discuss, close', 'Observation, feeling, need, request', 'Explain, defend, apologize, forgive', 'Hear, understand, respond, help']
            },
            correct: 1,
            explanation: {
              de: 'Marshall Rosenberg\'s GFK: Beobachtung (ohne Bewertung) → Gefühl → Bedürfnis → Bitte (konkret, erfüllbar).',
              en: 'Marshall Rosenberg\'s NVC: Observation (without judgment) → Feeling → Need → Request (concrete, doable).'
            }
          },
          {
            id: 'q5_4',
            text: { de: 'Was ist das Kernargument dieses Masterclass?', en: 'What is the core argument of this masterclass?' },
            options: {
              de: ['Gefühle sollte man kontrollieren', 'Emotionaler Wortschatz ist ein Menschenrecht', 'Nur Therapeuten können helfen', 'Positive Einstellung löst alle Probleme'],
              en: ['Feelings should be controlled', 'Emotional vocabulary is a human right', 'Only therapists can help', 'Positive thinking solves all problems']
            },
            correct: 1,
            explanation: {
              de: 'Wer mehr Worte hat für das, was er fühlt, lebt nachweislich besser — körperlich, psychisch, sozial. Emotional literacy ist keine Luxus, sondern eine Grundlage.',
              en: 'Those who have more words for what they feel demonstrably live better — physically, mentally, socially. Emotional literacy is not a luxury, it\'s a foundation.'
            }
          }
        ]
      }
    ]
  }

];

// Badge definitions
const MC_BADGES = {
  word_finder:     { emoji: '🔤', de: 'Wortfinder',       en: 'Word Finder',       module: 'module_1' },
  pattern_reader:  { emoji: '🔍', de: 'Muster-Leser',     en: 'Pattern Reader',    module: 'module_2' },
  body_listener:   { emoji: '🫁', de: 'Körper-Hörer',     en: 'Body Listener',     module: 'module_3' },
  cultural_bridge: { emoji: '🌍', de: 'Kulturbrücke',     en: 'Cultural Bridge',   module: 'module_4' },
  certified:       { emoji: '🏆', de: 'Empathly-Zertifiziert', en: 'Empathly Certified', module: 'module_5' },
};
