import type { Story, Unit } from "@/app/curriculum/types";

export const A2_GLOSSARY: Record<string, string> = {
  abholen: "to pick up", absagen: "to cancel", ankommen: "to arrive", anrufen: "to call",
  aufgeregt: "excited", ausfüllen: "to fill in", ausziehen: "to move out", bewerben: "to apply",
  beschweren: "to complain", bescheid: "notice / information", bisher: "so far", dringend: "urgent",
  eigentlich: "actually", einziehen: "to move in", entschuldigen: "to apologize", erlauben: "to allow",
  erwarten: "to expect", freiberuflich: "self-employed", gewöhnt: "used to", gleichzeitig: "at the same time",
  immerhin: "after all", inzwischen: "meanwhile", kündigen: "to cancel / resign", miete: "rent",
  mitbewohnerin: "female flatmate", pünktlich: "on time", rücksicht: "consideration", schicht: "shift",
  schließlich: "finally", seitdem: "since then", sobald: "as soon as", überraschend: "surprising",
  umziehen: "to move", vermieter: "landlord", versprechen: "to promise", vorschlagen: "to suggest",
  während: "while", wahrscheinlich: "probably", wenigstens: "at least", wiedersehen: "to see again",
  zufrieden: "satisfied", zusammenleben: "to live together", zuständig: "responsible",
};

type Seed = Omit<Story, "id" | "number" | "unitId" | "color">;
const COLOR = "#3b7a88";

const seeds: Seed[] = [
  {
    title: "Der Brief aus Leipzig", theme: "Neuanfang", grammar: "Perfekt mit haben · Zeitangaben",
    canDo: "Ich kann von wichtigen Erlebnissen in meinem Leben erzählen.",
    pronunciation: "Satzakzent bei Zeitangaben: letztes Jahr, danach, seitdem.",
    referenceFocus: "sie / ihr beziehen sich auf Noura und ihre neue Wohnung.",
    speakingPrompt: "Erzähle von einer Veränderung in deinem Leben. Was ist vorher passiert, und was ist danach anders geworden?",
    writingPrompt: "Schreibe eine Nachricht an einen Freund über einen Neuanfang.", audioReady: false,
    text: `Noura hat lange in Köln gewohnt. Dort hat sie eine Ausbildung gemacht und in einem kleinen Café gearbeitet. Sie mochte die Stadt, aber sie hatte das Gefühl, dass jeder Tag gleich war. Im Februar hat sie einen Brief aus Leipzig bekommen. Eine Freundin schrieb ihr, dass in ihrer Wohngemeinschaft ein Zimmer frei geworden war. Zuerst hat Noura gezögert. Sie kannte Leipzig nur von einem Wochenende, und sie wollte ihre Familie nicht so weit weg verlassen.

Dann hat sie mit ihrer Mutter telefoniert. „Du musst nicht für immer umziehen“, sagte ihre Mutter. „Du kannst es versuchen.“ Dieser Satz hat Noura beruhigt. Sie hat eine Woche später den Zug genommen, das Zimmer angesehen und sofort gemerkt, dass es hell und ruhig war. Ihre mögliche Mitbewohnerin, Jule, hat ihr die Küche und den Hof gezeigt. Danach sind beide noch spazieren gegangen. Sie haben so leicht miteinander gesprochen, als würden sie sich schon lange kennen.

Im April ist Noura umgezogen. Die ersten Tage waren anstrengend: Sie hat Kartons ausgepackt, eine neue Adresse gemeldet und jeden Morgen den richtigen Weg zur Arbeit gesucht. Einmal ist sie sogar in die falsche Straßenbahn gestiegen. Trotzdem hat sie nicht aufgegeben. Inzwischen arbeitet sie in einer Bäckerei in der Nähe ihrer Wohnung. Ihre Kollegen sprechen schnell, aber sie erklären ihr geduldig, was zu tun ist.

Heute liegt der Brief noch immer in einer Schublade. Wenn Noura unsicher wird, liest sie ihn wieder. Dann erinnert sie sich daran, dass ein kleiner Brief ihr Leben verändert hat.`
  },
  {
    title: "Ein Geburtstag zu zweit", theme: "Freundschaft", grammar: "Perfekt mit sein · weil",
    canDo: "Ich kann über Freundschaften, Gefühle und gemeinsame Pläne sprechen.",
    pronunciation: "Verbgruppen ruhig verbinden: ist gekommen, hat vergessen, weil er arbeiten musste.",
    referenceFocus: "er / ihm für Karim; sie / ihr für Anna.",
    speakingPrompt: "Wie organisierst du einen Geburtstag oder eine kleine Überraschung?",
    writingPrompt: "Schreibe eine kurze Einladung und erkläre, was Gäste mitbringen sollen.", audioReady: false,
    text: `Anna hatte am Samstag Geburtstag. Eigentlich wollte sie mit sechs Freunden in einem Restaurant feiern. Sie hatte einen Tisch reserviert und sogar einen Kuchen bestellt. Am Freitagabend schrieb jedoch ein Freund nach dem anderen ab. Einer war krank, eine Freundin musste arbeiten, und zwei andere waren verreist. Anna antwortete freundlich, aber danach war sie enttäuscht. Sie hatte sich auf den Abend gefreut, weil sie ihre Freunde in den letzten Monaten nur selten gesehen hatte.

Karim, ihr Nachbar, bemerkte am nächsten Morgen, dass Anna still war. Er fragte nicht sofort nach dem Grund, sondern brachte ihr erst einen Kaffee. Als sie ihm von den Absagen erzählte, sagte er: „Dann machen wir eben einen guten Abend zu zweit.“ Anna musste lachen. Sie kannte Karim noch nicht lange, aber mit ihm konnte sie ehrlich sprechen.

Sie gingen nicht in das teure Restaurant. Stattdessen kauften sie auf dem Markt Gemüse, Brot und Blumen. Karim kochte eine Suppe, während Anna den Tisch deckte. Später riefen zwei Freunde an und entschuldigten sich. Anna war immer noch traurig, doch sie verstand, dass niemand absichtlich gefehlt hatte.

Am Abend saßen Anna und Karim auf dem Balkon. Sie erzählten von früheren Geburtstagen und von Menschen, die sie gern wiedersehen würden. Der Abend war anders als geplant, aber er war nicht schlecht. Anna sagte schließlich: „Ich habe heute gelernt, dass ein Geburtstag nicht groß sein muss. Wichtig ist, wer wirklich bei einem bleibt.“`
  },
  {
    title: "Die Wohnung über dem Park", theme: "Wohnen", grammar: "Wechselpräpositionen · Dativ und Akkusativ",
    canDo: "Ich kann eine Wohnung beschreiben und über Regeln im Haus sprechen.",
    pronunciation: "Betone die Ortsangabe: in den Park, im Park, auf den Balkon.",
    referenceFocus: "dort und dorthin unterscheiden Ort und Richtung.",
    speakingPrompt: "Beschreibe deine ideale Wohnung und die Nachbarschaft.",
    writingPrompt: "Schreibe eine Nachricht an einen Vermieter und frage nach einem Besichtigungstermin.", audioReady: false,
    text: `Milan suchte seit Wochen eine neue Wohnung. Seine alte Wohnung lag an einer lauten Straße, und nachts konnte er kaum schlafen. Als er eine Anzeige für eine kleine Wohnung über einem Park sah, rief er sofort an. Die Vermieterin, Frau Stein, lud ihn für Dienstag zur Besichtigung ein.

Die Wohnung war kleiner, als Milan erwartet hatte, aber sie hatte große Fenster. Vom Wohnzimmer aus konnte er direkt in den Park sehen. Im Schlafzimmer stand noch ein alter Schrank. Frau Stein erklärte, dass der vorige Bewohner ihn dort gelassen hatte. „Wenn Sie möchten, kann er bleiben. Wenn nicht, stelle ich ihn in den Keller“, sagte sie.

Milan gefiel auch das Haus. Im Erdgeschoss wohnte ein älteres Paar, das die Blumen vor der Tür pflegte. Gegenüber lebte eine Familie mit einem kleinen Kind. Frau Stein sagte offen, dass es abends ab zehn Uhr ruhig sein sollte. Das war für Milan kein Problem. Er arbeitete oft früh und wollte selbst nicht bis spät Musik hören.

Am Ende stellte er seinen Rucksack auf den Boden und ging noch einmal durch die Zimmer. Er stellte sich vor, wie sein Tisch am Fenster stehen würde und wie er im Sommer auf dem Balkon frühstücken könnte. Zwei Tage später bekam er die Zusage. Als er seiner Schwester die Nachricht schickte, schrieb sie zurück: „Endlich bist du dort, wo du Ruhe findest.“`
  },
  {
    title: "Der Termin, den niemand wollte", theme: "Alltag und Termine", grammar: "Nebensätze mit dass und weil",
    canDo: "Ich kann Termine vereinbaren, verschieben und begründen.",
    pronunciation: "In Nebensätzen das Verb am Ende hörbar machen.",
    referenceFocus: "das verweist auf die Untersuchung; deshalb zeigt eine Folge.",
    speakingPrompt: "Erkläre, wie du einen Termin absagst oder verschiebst.",
    writingPrompt: "Schreibe eine höfliche E-Mail, um einen Termin zu verschieben.", audioReady: false,
    text: `Luis hatte seit Tagen Zahnschmerzen. Trotzdem wollte er keinen Termin beim Zahnarzt machen. Er sagte sich jeden Morgen, dass es bestimmt besser werden würde. Am Mittwoch konnte er jedoch beim Frühstück kaum noch etwas essen. Seine Kollegin Jana bemerkte, dass er blass war, und gab ihm die Nummer einer Praxis in der Nähe.

Die Sprechstundenhilfe bot ihm einen Termin für Donnerstag um acht Uhr an. Luis war erleichtert, bis er in seinen Kalender sah: Zur gleichen Zeit sollte er eine wichtige Präsentation halten. Er rief seinen Chef an und erklärte, dass er den Termin nicht verschieben konnte, weil die Schmerzen stärker geworden waren. Sein Chef antwortete überraschend freundlich. „Gesundheit geht vor. Wir finden eine Lösung.“

Am Abend bereitete Luis die Präsentation trotzdem vor. Er schickte Jana die wichtigsten Dateien und erklärte ihr, was sie sagen sollte. Als er am nächsten Morgen in der Praxis wartete, war er nervös. Die Zahnärztin untersuchte ihn gründlich und sagte, dass ein Zahn entzündet sei. Sie behandelte ihn sofort und gab ihm Medikamente.

Später schrieb Jana, dass die Präsentation gut gelaufen war. Luis bedankte sich bei ihr und bei seinem Chef. Er hatte gelernt, dass man nicht alles allein lösen muss. Wenn man rechtzeitig Bescheid sagt, können andere oft helfen.`
  },
  {
    title: "Suppe für sieben Personen", theme: "Essen und Planen", grammar: "Mengenangaben · Imperativ",
    canDo: "Ich kann ein einfaches Essen planen und Anweisungen geben.",
    pronunciation: "Deutliche Endungen im Imperativ: schneide, rühre, probiert.",
    referenceFocus: "davon und dazu verweisen auf Zutaten und Essen.",
    speakingPrompt: "Erkläre ein einfaches Rezept Schritt für Schritt.",
    writingPrompt: "Schreibe eine Einkaufsliste und ein Rezept für ein gemeinsames Essen.", audioReady: false,
    text: `Für den Deutschkurs sollte jede Gruppe ein kleines internationales Essen vorbereiten. In Leas Gruppe kamen sieben Personen aus fünf Ländern zusammen. Zuerst wollten alle etwas anderes kochen. Einer schlug Pizza vor, eine andere wollte Reis machen, und zwei Personen wollten einen Salat. Schließlich entschied die Lehrerin: „Macht etwas, das jeder helfen kann.“

Lea erinnerte sich an eine Gemüsesuppe, die ihre Großmutter oft gekocht hatte. Sie schrieb eine Liste: Kartoffeln, Karotten, Lauch, Bohnen, Zwiebeln, Brühe und frische Kräuter. Am Samstag trafen sie sich in der Schulküche. Raul wusch das Gemüse, während Kim die Kartoffeln schälte. „Schneidet alles nicht zu klein“, erklärte Lea. „Sonst zerfällt es später.“

Es gab ein kleines Problem: Niemand hatte genug große Töpfe mitgebracht. Der Hausmeister fand schließlich einen Topf in einem Schrank. Während die Suppe kochte, deckten sie den Tisch und schrieben die Zutaten auf Deutsch und in ihren Sprachen daneben. Viele Besucher blieben stehen und fragten, was darin sei.

Am Ende reichte die Suppe sogar für mehr als sieben Personen. Eine ältere Besucherin probierte sie und sagte: „Die schmeckt wie bei mir zu Hause.“ Lea freute sich. Die Gruppe hatte nicht nur gekocht, sondern auch gelernt, einander zuzuhören und gemeinsam Entscheidungen zu treffen.`
  },
  {
    title: "Die Jacke, die zu groß war", theme: "Einkaufen", grammar: "Adjektive · vergleichen mit als und wie",
    canDo: "Ich kann Kleidung vergleichen, nach Größen fragen und etwas zurückgeben.",
    pronunciation: "Vergleiche klar sprechen: größer als, genauso warm wie.",
    referenceFocus: "diejenige verweist auf eine bestimmte Jacke.",
    speakingPrompt: "Beschreibe ein Kleidungsstück, das du gern trägst, und vergleiche es mit einem anderen.",
    writingPrompt: "Schreibe eine kurze Rückgabe-Nachricht an einen Online-Shop.", audioReady: false,
    text: `Mara brauchte eine warme Jacke für den Winter. Im Internet fand sie eine dunkelblaue Jacke, die auf dem Foto sehr bequem aussah. Sie bestellte Größe M, weil sie diese Größe normalerweise trug. Drei Tage später kam das Paket an. Die Jacke war schön, aber die Ärmel waren viel zu lang und die Schultern zu breit.

Ihre Freundin Elif schlug vor, gemeinsam in ein Geschäft zu gehen. Dort probierte Mara drei Jacken an. Die erste war leichter als ihre Online-Jacke, aber nicht warm genug. Die zweite war genauso weich, aber zu kurz. Die dritte war etwas teurer, doch sie passte perfekt. Der Verkäufer erklärte, dass die Marke eher groß ausfalle.

Mara kaufte die passende Jacke und nahm die andere wieder mit nach Hause. Auf der Internetseite stand, dass man sie innerhalb von vierzehn Tagen zurückschicken konnte. Sie füllte das Formular aus, legte den Rücksendeschein in das Paket und brachte es zur Post. Zwei Tage später erhielt sie eine Nachricht: Die Rückgabe sei angekommen, das Geld werde überwiesen.

Mara war zufrieden, weil sie ruhig geblieben war. Früher hätte sie die zu große Jacke vielleicht behalten. Jetzt wusste sie, dass sie freundlich nachfragen und eine Lösung finden konnte.`
  },
  {
    title: "Eine Nachricht aus der Apotheke", theme: "Gesundheit", grammar: "sollen · dürfen · müssen",
    canDo: "Ich kann Beschwerden beschreiben und einfachen Rat verstehen.",
    pronunciation: "Modalverben ohne Hast: musst, sollst, darfst nicht.",
    referenceFocus: "daran verweist auf die Einnahme der Medikamente.",
    speakingPrompt: "Gib einer Freundin oder einem Freund Rat bei einer Erkältung.",
    writingPrompt: "Schreibe eine Nachricht an deinen Kurs und erkläre, warum du fehlst.", audioReady: false,
    text: `Seit Montag fühlte sich Oskar nicht gut. Zuerst dachte er, dass er nur müde sei. Dann bekam er Kopfschmerzen und Husten. Seine Mitbewohnerin Paola sagte, dass er nicht zur Arbeit gehen solle. Oskar wollte trotzdem, weil im Büro viel zu tun war. Paola blieb ruhig: „Wenn du krank bist, kannst du niemandem helfen. Du musst dich ausruhen.“

Oskar rief in der Apotheke an und beschrieb seine Beschwerden. Die Apothekerin fragte, ob er Fieber habe und ob er Medikamente gegen Allergien nehme. Danach erklärte sie ihm, welches Mittel er nehmen könne. „Lesen Sie die Packungsbeilage“, sagte sie. „Und wenn es schlimmer wird, müssen Sie zum Arzt.“

Am Nachmittag holte Paola die Medikamente ab. Sie brachte auch Tee, Zitronen und eine Suppe mit. Oskar bedankte sich, aber er sagte, dass sie sich nicht so viel Mühe machen müsse. Paola lachte: „Du würdest das für mich auch tun.“

Nach drei Tagen ging es ihm besser. Bevor er wieder arbeitete, schrieb er seinem Chef eine Nachricht. Er erklärte, dass er am nächsten Tag zurückkommen werde, aber noch nicht so lange bleiben könne. Sein Chef antwortete: „Kein Problem. Werde erst ganz gesund.“ Oskar merkte, dass er sich nicht schuldig fühlen musste, wenn er auf sich achtete.`
  },
  {
    title: "Der Koffer im falschen Zug", theme: "Unterwegs", grammar: "Präpositionen · Perfekt",
    canDo: "Ich kann über eine Reise und ein kleines Problem unterwegs berichten.",
    pronunciation: "Ortsnamen und Bahnsteige in sinnvollen Gruppen sprechen.",
    referenceFocus: "dort, dahin und von dort unterscheiden.",
    speakingPrompt: "Erzähle von einer Reise, bei der nicht alles nach Plan gelaufen ist.",
    writingPrompt: "Schreibe eine kurze Fundmeldung für einen verlorenen Gegenstand.", audioReady: false,
    text: `Tariq wollte seine Schwester in Dresden besuchen. Er hatte nur einen kleinen Koffer dabei, weil er am Sonntag wieder zurückfahren wollte. Am Bahnhof war es sehr voll. Auf der Anzeige stand, dass sein Zug zwanzig Minuten Verspätung hatte. Als der Zug schließlich kam, stiegen viele Menschen gleichzeitig ein.

Tariq stellte seinen Koffer in das Gepäckregal und setzte sich ans Fenster. Kurz nach der Abfahrt rief ihn seine Schwester an. Sie fragte, ob er wirklich im richtigen Zug sitze. Tariq schaute noch einmal auf sein Ticket und erschrak: Er war in einen Zug nach Erfurt gestiegen. In der Eile hatte er auf die falsche Anzeige gesehen.

Er stieg an der nächsten Station aus und suchte den Schalter. Die Mitarbeiterin erklärte ihm geduldig, welchen Zug er nehmen musste. Sie sagte auch, dass sein Koffer wahrscheinlich noch im anderen Zug sei. Tariq beschrieb ihn: grau, klein, mit einem roten Band am Griff. Die Mitarbeiterin meldete den Verlust sofort weiter.

Am Abend kam Tariq verspätet in Dresden an. Seine Schwester wartete schon mit einer Tüte Essen. Zwei Tage später rief die Bahn an: Der Koffer war gefunden worden. Tariq war erleichtert. Seitdem schaut er vor jeder Reise dreimal auf Bahnsteig, Zugnummer und Zielort.`
  },
  {
    title: "Das Gespräch nach dem Kurs", theme: "Deutschlernen", grammar: "indirekte Fragen · dass-Sätze",
    canDo: "Ich kann über Lernziele und Schwierigkeiten sprechen.",
    pronunciation: "Fragen mit ob und W-Fragen deutlich abgrenzen.",
    referenceFocus: "darüber bezieht sich auf das Lernen und die Schwierigkeiten.",
    speakingPrompt: "Welche Lernmethode hilft dir am meisten und warum?",
    writingPrompt: "Schreibe deinem Lehrer eine Nachricht mit einer Frage zum Kurs.", audioReady: false,
    text: `Nach dem Deutschkurs blieb Elena noch kurz im Klassenraum. Sie wollte ihre Lehrerin fragen, ob sie wirklich bereit für die nächste Stufe sei. Im Unterricht verstand sie fast alles, aber beim Sprechen fand sie die Wörter oft zu langsam. Frau Berger setzte sich zu ihr und fragte, was ihr am schwersten falle.

Elena erklärte, dass sie zu Hause viele Übungen mache, aber selten mit anderen spreche. Sie habe Angst, Fehler zu machen. Frau Berger sagte, dass diese Angst sehr normal sei. „Du musst nicht jeden Satz perfekt sagen. Wichtig ist, dass andere dich verstehen.“ Dann schlug sie vor, dass Elena zweimal pro Woche mit einer Partnerin kurze Gespräche üben solle.

Elena fragte auch, ob sie mehr Filme auf Deutsch schauen müsse. Die Lehrerin antwortete, dass kurze Videos mit Untertiteln oft besser seien als lange Filme. Man könne eine Szene zuerst hören, dann wichtige Wörter notieren und sie danach noch einmal ohne Untertitel ansehen.

Am nächsten Tag schrieb Elena ihrer Kursfreundin Mei eine Nachricht. Sie fragte, ob sie am Mittwoch eine halbe Stunde zusammen üben wolle. Mei antwortete sofort: „Ja, gern. Ich brauche das auch.“ Elena war überrascht, wie leicht der erste Schritt gewesen war. Sie wusste nun, dass Lernen nicht nur aus Büchern besteht, sondern auch aus kleinen Gesprächen mit echten Menschen.`
  },
  {
    title: "Der erste Arbeitstag", theme: "Arbeit", grammar: "Höfliche Bitten · Präteritum von sein und haben",
    canDo: "Ich kann über Arbeit, Aufgaben und Erfahrungen sprechen.",
    pronunciation: "Höfliche Fragen mit Könnten Sie …? verbinden.",
    referenceFocus: "ihnen, dort und dabei beziehen sich auf Kolleginnen, Büro und Aufgaben.",
    speakingPrompt: "Beschreibe einen ersten Tag in einer neuen Schule, Arbeit oder Gruppe.",
    writingPrompt: "Schreibe eine kurze E-Mail an einen Kollegen und bitte um Hilfe.", audioReady: false,
    text: `Am Montag begann Sofia ihren neuen Job in einer kleinen Buchhandlung. Sie war früh da, weil sie keinen schlechten ersten Eindruck machen wollte. Die Chefin zeigte ihr den Laden, das Lager und den kleinen Raum hinter der Kasse. Dort standen ein Computer, ein Telefon und viele Listen mit Bestellungen.

Am Vormittag war Sofia vor allem mit dem Einräumen beschäftigt. Sie sortierte neue Bücher nach Themen und brachte Kinderbücher in das richtige Regal. Als ein Kunde nach einem Buch fragte, das nicht da war, wusste sie zuerst nicht, was sie sagen sollte. Dann erinnerte sie sich an die Worte ihrer Chefin: „Fragen Sie einfach nach. Niemand erwartet, dass Sie am ersten Tag alles wissen.“

Sofia ging zu einem Kollegen und sagte: „Könnten Sie mir bitte zeigen, wie ich nach einer Bestellung suche?“ Er erklärte es ihr langsam. Später half sie einer Kundin, ein Geschenk für ihren Enkel zu finden. Die Kundin bedankte sich und sagte, Sofia habe gut zugehört.

Am Ende des Tages war Sofia müde, aber zufrieden. Sie hatte nicht alles perfekt gemacht, doch sie hatte Fragen gestellt und Hilfe angenommen. Auf dem Heimweg schrieb sie ihrer Schwester: „Der erste Tag war aufregend. Aber ich glaube, ich kann das schaffen.“`
  },
];

export const A2_STORIES: Story[] = seeds.map((story, index) => ({
  ...story, id: `a2-story-${String(index + 1).padStart(3, "0")}`,
  number: index + 1, unitId: 1, color: COLOR,
}));

export const A2_UNITS: Unit[] = [{
  id: 1, title: "Neue Wege", shortTitle: "Neue Wege",
  description: "Über Veränderungen, Beziehungen und alltägliche Situationen sprechen – mit längeren Sätzen und klaren Verbindungen.",
  grammar: "Perfekt · Nebensätze · Dativ/Akkusativ · Vergleiche",
  canDo: "Ich kann von Erfahrungen berichten, einfache Probleme erklären und Pläne begründen.",
  color: COLOR, stories: A2_STORIES,
}];

const words = A2_STORIES.flatMap((story) => story.text.split(/\s+/).filter(Boolean));
export const A2_STATS = {
  totalWords: words.length,
  uniqueWordForms: new Set(words.map((word) => word.toLocaleLowerCase("de-DE").replace(/[^a-zäöüßé]/gi, ""))).size,
  averageStoryWords: Math.round(words.length / A2_STORIES.length),
};
