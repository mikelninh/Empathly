/**
 * Gefühle-Memory — Pre-authored Cultural Insight Snippets
 * One is shown randomly on every Classic mode card match.
 * Keyed by emotion ID. Each entry is an array; one is picked at random.
 * Written in a mix of DE/EN depending on the insight — kept short (1-2 sentences).
 */

const CULTURE_INSIGHTS = {
  freude: [
    { flag: '🇯🇵', text: 'Im Japanischen gibt es <em>ureshi</em> (うれしい) für eine freudige Überraschung und <em>tanoshii</em> (たのしい) für anhaltenden Genuss — Freude hat dort viele Gesichter.' },
    { flag: '🇧🇷', text: 'Brasilianisches Portugiesisch kennt <em>alegria</em> für Freude, die sich körperlich äußert — Tanzen, Umarmen, Lachen. Freude, die man sehen kann.' },
    { flag: '🇸🇦', text: 'Im Arabischen ist <em>farah</em> (فرح) Freude, die man teilt — ein Fest, eine Feier. Stille Freude für sich allein kennt das Arabische kaum.' },
  ],
  dankbarkeit: [
    { flag: '🇯🇵', text: '<em>Osoreirimasu</em> (恐れ入ります) — Japanische Dankbarkeit enthält Demut bis hin zur Ehrfurcht: „Ich bin überwältigt von deiner Güte."' },
    { flag: '🇰🇷', text: 'Koreanisch: <em>gamsahamnida</em> (감사합니다) — Dankbarkeit, die nicht nur Höflichkeit ist, sondern eine tief verwurzelte kulturelle Haltung des In-Schuld-Stehens.' },
    { flag: '🇮🇳', text: 'Im Sanskrit heißt Dankbarkeit <em>kṛtajñatā</em> — wörtlich „das Wissen um das Getane". Wer dankbar ist, erkennt an, was für ihn getan wurde.' },
  ],
  frieden: [
    { flag: '🇯🇵', text: '<em>Heion</em> (平穏) — Japanischer Frieden bedeutet auch Stille nach dem Sturm, nicht nur Abwesenheit von Konflikt. Wabi-sabi schwingt mit.' },
    { flag: '🇸🇦', text: '<em>Salaam</em> (سلام) ist mehr als Frieden — es ist auch Gruß, Wunsch und Gebet. Arabisch verbindet Frieden mit dem Wunsch für den anderen.' },
    { flag: '🇻🇳', text: 'Vietnamesisch: <em>bình an</em> — Frieden, der auch Sicherheit und Geborgenheit einschließt. Man wünscht sich bình an wie man sich Geborgenheit wünscht.' },
  ],
  sehnsucht: [
    { flag: '🇧🇷', text: '<em>Saudade</em> — das portugiesische Wort für Sehnsucht richtet sich nach hinten, zur Vergangenheit. Deutsche Sehnsucht blickt eher vorwärts, zu etwas Erhofftem.' },
    { flag: '🇷🇺', text: '<em>Toska</em> (тоска) — Russische Sehnsucht ist tiefer und dunkler als die deutsche. Nabokov schrieb: „kein englisches Wort kommt auch nur annähernd ran."' },
    { flag: '🇰🇷', text: '<em>Geuriumi</em> (그리움) — Koreanische Sehnsucht ist immer nach einer konkreten Person. Man sehnt sich nicht nach einem Gefühl, sondern nach jemandem Bestimmten.' },
    { flag: '🇵🇱', text: '<em>Tęsknota</em> — Polnische Sehnsucht ist körperlich. Man fühlt sie im Brustkorb. Das Wort klingt wie ein Seufzen.' },
  ],
  geborgenheit: [
    { flag: '🇬🇧', text: '"Geborgenheit" hat keine direkte englische Übersetzung. "Safety" ist zu klinisch, "cosiness" zu oberflächlich. Es ist das Gefühl, wirklich aufgehoben zu sein.' },
    { flag: '🇩🇰', text: 'Dänisches <em>hygge</em> trifft Geborgenheit am nächsten — das warme Zusammensein bei Kerzenlicht. Aber hygge ist aktiv herbeigeführt; Geborgenheit kann einfach da sein.' },
    { flag: '🇯🇵', text: 'Japanisch: <em>amae</em> (甘え) — das Gefühl, sich in der Fürsorge eines anderen fallen lassen zu können, ohne Angst haben zu müssen. Eng verwandt mit Geborgenheit.' },
  ],
  einsamkeit: [
    { flag: '🇯🇵', text: '<em>Kodawari</em> ist nicht dabei — aber <em>sabishi</em> (寂しい) ist die japanische Einsamkeit. Sie ist leiser, mehr wie ein leerer Raum als ein Schmerz.' },
    { flag: '🇷🇺', text: 'Im Russischen unterscheidet man <em>odinochestvo</em> (одиночество — die Einsamkeit der Isolation) von <em>uединение</em> (die gewählte Stille). Einsamkeit hat zwei Gesichter.' },
    { flag: '🇸🇦', text: 'Arabisch kennt <em>waḥda</em> (وحدة) für Einsamkeit — das Wort teilt seine Wurzel mit „einer" und „einzigartig". Allein zu sein ist ambivalent.' },
  ],
  trauer: [
    { flag: '🇯🇵', text: '<em>Kanashii</em> (悲しい) — Japanische Trauer enthält oft ein Element der Akzeptanz. Das Konzept von <em>mono no aware</em> (物の哀れ) lehrt: Schönheit und Vergänglichkeit sind eins.' },
    { flag: '🇬🇷', text: 'Griechisch: <em>penthos</em> (πένθος) — Trauer, die man trägt wie ein Gewand. Trauernde tragen in der griechischen Tradition Schwarz als sichtbares Zeichen.' },
    { flag: '🇰🇷', text: '<em>Han</em> (한) — Koreanische kollektive Trauer, die über Generationen weitergegeben wird und Resilienz einschließt. Trauer, die zu Kraft wird.' },
  ],
  wut: [
    { flag: '🇯🇵', text: 'Im Japanischen zeigt man Wut kaum direkt. <em>Hara ga tatsu</em> (腹が立つ) — „der Bauch steht aufrecht" — beschreibt sie als körperliche Empfindung, nicht als Ausdruck.' },
    { flag: '🇸🇦', text: 'Arabisch hat verschiedene Wörter für Wut nach Stärke: <em>ghaḍab</em> (غضب) für kurze Wut, <em>ḥanaq</em> für anhaltenden Groll. Emotionen differenziert benennen.' },
    { flag: '🇩🇪', text: 'Deutsch hat über 30 Synonyme für Wut — Ärger, Empörung, Zorn, Furor, Groll, Ungeduld, Gereiztheit. Jede Schattierung eine eigene Wahrheit.' },
  ],
  angst: [
    { flag: '🇩🇰', text: '<em>Angst</em> kam aus dem Deutschen ins Englische — das einzige deutsche Wort, das Philosophen weltweit übernahmen. Kierkegaard beschrieb die Angst als „Schwindel der Freiheit".' },
    { flag: '🇯🇵', text: '<em>Osore</em> (恐れ) ist Angst vor etwas Äußerem; <em>fuan</em> (不安) ist innere Unruhe, das diffuse Unbehagen ohne klares Objekt — was dem deutschen „Angst" am nächsten kommt.' },
    { flag: '🇻🇳', text: 'Vietnamesisch unterscheidet <em>sợ hãi</em> (Angst vor etwas) und <em>lo lắng</em> (Sorge, die in der Zukunft lebt). Angst im Jetzt vs. Angst vor Morgen.' },
  ],
  scham: [
    { flag: '🇯🇵', text: '<em>Haji</em> (恥) — Japanische Scham ist eine Gemeinschaftsangelegenheit. Man schämt sich nicht nur für sich, sondern vor der Gruppe. „Gesichtsverlust" ist nicht metaphorisch.' },
    { flag: '🇮🇩', text: 'Indonesisch: <em>malu</em> — Scham, die auch Bescheidenheit und Respekt einschließt. Malu zu zeigen ist manchmal eine Tugend, nicht nur ein Schmerz.' },
    { flag: '🇰🇷', text: '<em>Nunchi</em> (눈치) — die koreanische Fähigkeit, die Stimmung zu lesen — ist oft Scham voraus. Wer Nunchi hat, vermeidet Scham, bevor sie entsteht.' },
  ],
  liebe: [
    { flag: '🇬🇷', text: 'Altgriechisch hatte 8 Wörter für Liebe: <em>eros</em> (Begehren), <em>philia</em> (Freundschaft), <em>storge</em> (Elternliebe), <em>agape</em> (bedingungslose Liebe). Welche meinst du gerade?' },
    { flag: '🇸🇦', text: 'Arabisch: <em>ya\'aburnee</em> (يعبرني) — wörtlich „mögest du mich begraben", gesagt zu jemandem, den man so liebt, dass man sich nicht vorstellen kann, ihn zu überleben.' },
    { flag: '🇯🇵', text: '<em>Koi</em> (恋) ist die sehnsuchtsvolle Liebe, die noch nicht erfüllt ist. <em>Ai</em> (愛) ist die reife, bewusste Liebe. Japanisch trennt, was Deutsch zusammenfasst.' },
  ],
  hoffnung: [
    { flag: '🇬🇷', text: '<em>Elpis</em> (ελπίς) — die griechische Hoffnung war das letzte, was in der Büchse der Pandora blieb. Hoffnung als Überlebensmittel.' },
    { flag: '🇮🇳', text: 'Sanskrit: <em>āśā</em> (आशा) — Hoffnung, die auch Wunsch und Erwartung einschließt. Sie richtet sich auf etwas Konkretes, nicht ins Vage.' },
    { flag: '🇰🇷', text: '<em>Heemangi</em> (희망) — Koreanische Hoffnung ist oft kollektiv. Man hofft nicht nur für sich, sondern für die Familie, die Gemeinschaft, die Generation nach einem.' },
  ],
  mitgefuehl: [
    { flag: '🇮🇳', text: 'Sanskrit: <em>karuṇā</em> (करुणा) — Mitgefühl ist eine der vier buddhistischen Grundhaltungen. Es ist aktiv: man wird bewegt und handelt.' },
    { flag: '🇨🇳', text: 'Chinesisch: <em>cè yǐn zhī xīn</em> (恻隐之心) — das Herz, das sich beim Anblick von Leid zusammenzieht. Mencius sah es als Grundlage aller Moral.' },
    { flag: '🇩🇪', text: '"Mitgefühl" heißt wörtlich "mit-fühlen" — du fühlst, was der andere fühlt. Manche Sprachen unterscheiden Mitgefühl (leiden-mit) und Empathie (verstehen-ohne-zu-leiden).' },
  ],
  dankbarkeit_2: [], // merged into dankbarkeit above
  neugier: [
    { flag: '🇮🇳', text: 'Sanskrit: <em>jijñāsā</em> (जिज्ञासा) — Neugier als spiritueller Impuls. Die Vedas beginnen mit Fragen. Neugier ist der erste Schritt zur Erleuchtung.' },
    { flag: '🇩🇪', text: 'Deutsch hat „Neugier" (neue Dinge wollen) und „Wissensdurst" (Durst nach Wissen). Beide zeigen: Lernen ist kein Luxus — es ist ein Bedürfnis.' },
  ],
  verbundenheit: [
    { flag: '🇰🇷', text: '<em>Jeong</em> (정) — Koreanische Verbundenheit wächst langsam, entsteht durch gemeinsam geteilte Zeit. Man kann jeong sogar für jemanden fühlen, den man nicht mag.' },
    { flag: '🇨🇳', text: '<em>Yuánfèn</em> (缘分) — chinesisches Schicksal zweier Menschen füreinander. Verbundenheit, die nicht zufällig ist, sondern kosmisch vorgeschrieben.' },
    { flag: '🇯🇵', text: '<em>Kizuna</em> (絆) — Japanische Verbundenheit, die auch Verpflichtung einschließt. Nach dem Erdbeben 2011 wurde dieses Wort zum Symbol nationaler Zusammengehörigkeit.' },
  ],
  erschoepfung: [
    { flag: '🇯🇵', text: '<em>Karōshi</em> (過労死) — Japanisch hat ein Wort für „Tod durch Überarbeitung". Erschöpfung ist dort eine gesellschaftliche Realität, nicht nur ein Gefühl.' },
    { flag: '🇩🇰', text: 'Dänisch: <em>udbrændt</em> — „ausgebrannt", das Bild des erloschenen Feuers für Erschöpfung. Eine Flamme, die zu lange gebrannt hat.' },
  ],
  staunen: [
    { flag: '🇯🇵', text: '<em>Mono no aware</em> (物の哀れ) — Japanisches Staunen über die Welt enthält immer einen Hauch von Wehmut. Kirschblüten sind schön, weil sie fallen.' },
    { flag: '🇩🇪', text: 'Deutsch „Ehrfurcht" (Ehrerbietung + Furcht) zeigt: das tiefste Staunen hat immer ein Zittern. Man bewundert und fürchtet zugleich.' },
    { flag: '🇬🇷', text: 'Griechisch: <em>thauma</em> (θαύμα) — Platon sah Staunen als Anfang aller Philosophie. Wer nicht staunt, denkt nicht wirklich.' },
  ],
  scham2: [],
  verlassenheit: [
    { flag: '🇷🇺', text: '<em>Brosit</em> — das Russische kennt ein Wort dafür, wenn jemand einen wirklich verlässt, nicht nur physisch, sondern innerlich aufgibt.' },
    { flag: '🇫🇷', text: 'Französisch: <em>abandon</em> — Verlassenheit, die auch Hingabe bedeuten kann. Sich selbst aufgeben kann Befreiung sein. Die Wurzel ist dieselbe.' },
  ],
  schutzbeduerfnis: [
    { flag: '🇩🇪', text: 'Deutsch „Geborgenheit" — der Wunsch nach Schutz, der bereits erfüllt ist. Das Bedürfnis und seine Stillung in einem Wort.' },
  ],
  gelassenheit: [
    { flag: '🇩🇪', text: '"Gelassenheit" — ein Kernbegriff der deutschen Mystik (Meister Eckhart). Die Kunst, loszulassen ohne aufzugeben. Kein anderes Wort trifft es so genau.' },
    { flag: '🇯🇵', text: '<em>Mushin</em> (無心) — japanischer Geisteszustand ohne Anspannung, im Fluss. Kampfkünstler und Zen-Mönche suchen ihn. Gelassenheit als Meisterschaft.' },
  ],
  dankbarkeit3: [],
  leere: [
    { flag: '🇯🇵', text: '<em>Ma</em> (間) — Japanische Leere ist kein Mangel, sondern Raum. In der Architektur, in der Musik, im Gespräch: Stille ist bedeutsam, nicht leer.' },
    { flag: '🇩🇪', text: 'Deutsch unterscheidet „innere Leere" (emotionale Taubheit) von „Stille" (Frieden). Leere kann heilsam oder schmerzhaft sein — welche ist es gerade?' },
  ],
  zerrissenheit: [
    { flag: '🇩🇪', text: '"Zerrissenheit" — wörtlich "Torn-ness". Kein direktes Äquivalent im Englischen. Das Wort klingt wie was es beschreibt: ein Reißen.' },
    { flag: '🇫🇷', text: 'Französisch: <em>déchiré(e)</em> — zerrissen, gespalten. Voltaire schrieb: Der Mensch ist ein Rätsel, das sich selbst zerreißt.' },
  ],
  weltschmerz: [
    { flag: '🇩🇪', text: '"Weltschmerz" — Jean Paul prägte dieses Wort 1827. Es wanderte in viele Sprachen, weil keine andere Sprache es besser sagen konnte.' },
    { flag: '🇷🇺', text: '<em>Toska</em> (тоска) ist Weltschmerz auf Russisch — aber persönlicher, körperlicher, tiefer. Nabokov: „seelisches Aufstöhnen, ein Verlangen nach etwas Unbekanntem".' },
  ],
};

/**
 * Returns a random cultural insight for a given emotion ID, formatted for display.
 * Falls back to null if no insight exists.
 */
function getRandomCultureInsight(emotionId) {
  const insights = CULTURE_INSIGHTS[emotionId];
  if (!insights || insights.length === 0) return null;
  return insights[Math.floor(Math.random() * insights.length)];
}
