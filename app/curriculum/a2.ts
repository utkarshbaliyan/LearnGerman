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

const UNIT_ONE_STORIES: Story[] = seeds.map((story, index) => ({
  ...story, id: `a2-story-${String(index + 1).padStart(3, "0")}`,
  number: index + 1, unitId: 1, color: COLOR, audioReady: true,
}));

const FIRST_UNIT: Unit = {
  id: 1, title: "Neue Wege", shortTitle: "Neue Wege",
  description: "Über Veränderungen, Beziehungen und alltägliche Situationen sprechen – mit längeren Sätzen und klaren Verbindungen.",
  grammar: "Perfekt · Nebensätze · Dativ/Akkusativ · Vergleiche",
  canDo: "Ich kann von Erfahrungen berichten, einfache Probleme erklären und Pläne begründen.",
  color: COLOR, stories: UNIT_ONE_STORIES,
};

type PlannedUnit = Omit<Unit, "id" | "stories"> & { stories: Array<[string, string]> };

const PLANNED_UNITS: PlannedUnit[] = [
  { title: "Familie und Beziehungen", shortTitle: "Beziehungen", description: "Über Menschen, Gefühle und Veränderungen in Beziehungen sprechen.", grammar: "Reflexive Verben · Possessivpronomen · weil", canDo: "Ich kann Menschen beschreiben, Gefühle ausdrücken und mich entschuldigen.", color: "#8d6bd1", stories: [["Das Foto auf dem Tisch", "ein altes Familienfoto"], ["Eine lange Entschuldigung", "ein Missverständnis zwischen Freunden"], ["Besuch am Sonntag", "eine unerwartete Einladung"], ["Der Bruder, den niemand kannte", "eine neue Nachricht aus der Familie"], ["Zwei Meinungen, ein Abend", "ein Streit über gemeinsame Pläne"], ["Die Karte aus dem Ausland", "eine Freundin, die weit weg wohnt"], ["Ein Gespräch mit Oma", "eine Erinnerung aus der Kindheit"], ["Der Platz am Fenster", "ein Treffen nach langer Zeit"], ["Was Paul wirklich meinte", "eine unklare Nachricht"], ["Ein Geschenk ohne Namen", "eine kleine Überraschung"]] },
  { title: "Wohnen und Nachbarschaft", shortTitle: "Wohnen", description: "Wohnungen suchen, Regeln verstehen und mit Nachbarn sprechen.", grammar: "Wechselpräpositionen · Dativ · Relativsatz mit der/die/das", canDo: "Ich kann Wohnprobleme erklären und einfache Lösungen vorschlagen.", color: "#278071", stories: [["Der Schlüssel beim Hausmeister", "ein verschlossener Keller"], ["Musik nach zehn", "eine laute Wohnung überan"], ["Die Pflanze im Flur", "eine gemeinsame Regel im Haus"], ["Ein Zettel an der Tür", "eine Bitte an die Nachbarn"], ["Der Wasserhahn tropft", "eine dringende Reparatur"], ["Die neue Mitbewohnerin", "eine ungewohnte Ordnung in der Küche"], ["Ein Balkon für alle", "ein Plan für den Sommer"], ["Das Paket im Treppenhaus", "eine falsche Lieferung"], ["Der Aufzug funktioniert nicht", "ein schwerer Einkauf"], ["Ein Abend im Hof", "ein kleines Hausfest"]] },
  { title: "Zeit, Termine und Alltag", shortTitle: "Termine", description: "Planen, absagen und im Alltag Prioritäten setzen.", grammar: "Temporale Angaben · trennbare Verben · deshalb", canDo: "Ich kann Termine vereinbaren und Gründe nennen.", color: "#d28a25", stories: [["Der Kalender ohne Dienstag", "ein falsch notierter Termin"], ["Fünf Minuten zu spät", "ein verpasster Bus"], ["Ein freier Nachmittag", "ein neuer Plan für die Woche"], ["Die Nachricht um sechs", "eine kurzfristige Absage"], ["Der Termin beim Amt", "eine lange Wartezeit"], ["Der Wecker im Urlaub", "ein zu früher Morgen"], ["Der Kurs am Donnerstag", "zwei Termine zur gleichen Zeit"], ["Ein Plan für den Monat", "zu viele Aufgaben"], ["Das Treffen im Regen", "ein Wetterproblem"], ["Der Samstag ohne Handy", "eine bewusste Pause"]] },
  { title: "Essen und Gesundheit", shortTitle: "Gesundheit", description: "Über Ernährung, Beschwerden und hilfreiche Gewohnheiten sprechen.", grammar: "sollen · müssen · dürfen · Imperativ", canDo: "Ich kann Rat geben und auf einfache Beschwerden reagieren.", color: "#d55369", stories: [["Frühstück vor der Prüfung", "zu wenig Zeit am Morgen"], ["Die Suppe der Nachbarin", "eine Erkältung"], ["Ein Rezept aus drei Ländern", "ein gemeinsames Kochen"], ["Zucker im Kaffee", "eine neue Gewohnheit"], ["Der Termin in der Praxis", "eine Untersuchung"], ["Das Schild im Restaurant", "eine Allergie"], ["Ein Spaziergang nach dem Essen", "mehr Bewegung im Alltag"], ["Der Markt am Freitag", "frische Zutaten"], ["Die Pause im Büro", "ein hektischer Arbeitstag"], ["Ein Rat vom Apotheker", "Husten und Kopfschmerzen"]] },
  { title: "Einkaufen und Geld", shortTitle: "Einkaufen", description: "Vergleichen, reklamieren und über Preise sprechen.", grammar: "Adjektivendungen · als/wie · Konjunktiv II für Bitten", canDo: "Ich kann Waren vergleichen und höflich reklamieren.", color: "#b25845", stories: [["Der falsche Pullover", "eine Rückgabe im Geschäft"], ["Zwanzig Euro zu viel", "eine Rechnung mit einem Fehler"], ["Ein Fahrrad gebraucht kaufen", "eine wichtige Entscheidung"], ["Die Schuhe im Angebot", "zwei verschiedene Größen"], ["Der Marktstand am Ende", "ein Preisvergleich"], ["Ein Konto für den Umzug", "ein Besuch bei der Bank"], ["Das Paket ohne Inhalt", "eine Beschwerde beim Versand"], ["Ein Geschenk für drei Personen", "ein kleines Budget"], ["Die Kasse im Supermarkt", "eine verlorene Karte"], ["Ein Vertrag mit vielen Seiten", "eine unklare Rechnung"]] },
  { title: "Stadt und Verkehr", shortTitle: "Unterwegs", description: "Wege erklären, unterwegs helfen und bei Problemen reagieren.", grammar: "Lokale Präpositionen · Imperativ · Perfekt", canDo: "Ich kann nach dem Weg fragen und Reiseprobleme beschreiben.", color: "#3b7a88", stories: [["Die Haltestelle hinter dem Museum", "eine falsche Richtung"], ["Der Zug nach Hamburg", "eine Verspätung"], ["Das Fahrrad ohne Licht", "eine Fahrt am Abend"], ["Ein Ticket für zwei", "eine unklare Tarifzone"], ["Die Tasche im Bus", "ein Fundbüro"], ["Der Aufzug zur U-Bahn", "eine Reise mit Koffer"], ["Ein Stadtplan für Gäste", "eine Besichtigung"], ["Die Baustelle am Bahnhof", "ein anderer Weg"], ["Ein Sitzplatz für Frau Klein", "eine volle Straßenbahn"], ["Der letzte Bus", "ein langer Konzertabend"]] },
  { title: "Reisen und Unterkunft", shortTitle: "Reisen", description: "Reisen vorbereiten, buchen und kleine Schwierigkeiten lösen.", grammar: "Perfekt · Futur mit werden · Fragen mit ob", canDo: "Ich kann eine Reise planen und über Erfahrungen berichten.", color: "#578a4d", stories: [["Das Zimmer mit Blick aufs Meer", "eine Hotelbuchung"], ["Regen am ersten Urlaubstag", "ein neuer Tagesplan"], ["Die Adresse auf dem Handy", "eine verlorene Verbindung"], ["Frühstück bis zehn", "eine verpasste Uhrzeit"], ["Ein Koffer zu wenig", "ein Gepäckproblem"], ["Die Postkarte aus Wien", "ein Besuch in einer fremden Stadt"], ["Das Zelt am See", "eine Nacht im Freien"], ["Ein Gespräch an der Rezeption", "eine Bitte um Hilfe"], ["Die Karte für das Museum", "eine lange Schlange"], ["Zurück am Sonntag", "eine Änderung der Reise"]] },
  { title: "Schule und Lernen", shortTitle: "Lernen", description: "Lernwege finden, Fragen stellen und mit anderen üben.", grammar: "dass · weil · um ... zu", canDo: "Ich kann über Lernziele und Schwierigkeiten sprechen.", color: "#7165a6", stories: [["Das Wort, das immer fehlt", "eine Sprechübung"], ["Ein Platz in der Bibliothek", "eine wichtige Hausaufgabe"], ["Die Gruppenarbeit", "unterschiedliche Ideen"], ["Eine Frage nach dem Unterricht", "eine Grammatikregel"], ["Der Zettel im Buch", "eine hilfreiche Methode"], ["Ein Vortrag über Musik", "Nervosität vor der Klasse"], ["Die Prüfung am Montag", "ein Lernplan"], ["Ein Fehler im Diktat", "eine Korrektur"], ["Die Nachricht von Mei", "ein gemeinsames Treffen"], ["Ein neues Heft", "ein persönliches Lernziel"]] },
  { title: "Arbeit und Beruf", shortTitle: "Beruf", description: "Über Aufgaben, Bewerbungen und Zusammenarbeit sprechen.", grammar: "Höfliche Bitten · Präteritum von sein/haben · Modalverben", canDo: "Ich kann berufliche Erfahrungen beschreiben und um Hilfe bitten.", color: "#4f708e", stories: [["Die Anzeige am Schwarzen Brett", "eine passende Stelle"], ["Das Gespräch um neun", "ein erstes Vorstellungsgespräch"], ["Eine Schicht zu viel", "eine Bitte an Kollegen"], ["Der Computer im Lager", "eine neue Aufgabe"], ["Ein Fehler in der Bestellung", "eine gemeinsame Lösung"], ["Die Pause auf dem Dach", "ein Gespräch mit einer Kollegin"], ["Eine E-Mail an die Chefin", "eine höfliche Frage"], ["Der erste Lohn", "ein kleiner Erfolg"], ["Ein Kurs nach der Arbeit", "eine neue Qualifikation"], ["Die Idee für den Laden", "ein Vorschlag im Team"]] },
  { title: "Dienstleistungen und Behörden", shortTitle: "Erledigungen", description: "Formulare verstehen, nachfragen und Alltagsdienste nutzen.", grammar: "Könnte / würde · indirekte Fragen · Präpositionalverben", canDo: "Ich kann in einfachen formellen Situationen freundlich handeln.", color: "#9b785a", stories: [["Das Formular mit dem Stern", "eine Anmeldung"], ["Eine Nummer im Wartezimmer", "ein Besuch beim Amt"], ["Der Brief von der Versicherung", "eine wichtige Frage"], ["Die Karte bei der Post", "ein Einschreiben"], ["Ein Termin beim Friseur", "eine Umbuchung"], ["Die Reparatur für morgen", "eine kaputte Waschmaschine"], ["Das Foto für den Ausweis", "eine Vorbereitung"], ["Eine Frage am Schalter", "eine fehlende Unterschrift"], ["Der Anruf aus der Werkstatt", "eine teure Reparatur"], ["Das Paket für die Nachbarin", "eine Vollmacht"]] },
  { title: "Freizeit und Kultur", shortTitle: "Freizeit", description: "Vorlieben begründen, etwas vorschlagen und gemeinsam planen.", grammar: "gern/lieber/am liebsten · denn · deshalb", canDo: "Ich kann über Hobbys sprechen und gemeinsame Pläne machen.", color: "#cf7a45", stories: [["Der Film ohne Untertitel", "ein Kinoabend"], ["Ein Konzert im Park", "eine spontane Einladung"], ["Die ersten zehn Kilometer", "ein Lauftraining"], ["Ein Bild im Museum", "eine unterschiedliche Meinung"], ["Die Karte für das Theater", "eine Überraschung"], ["Ein Verein für Samstag", "ein neues Hobby"], ["Die Kamera von Jonas", "ein Fotospaziergang"], ["Ein Buch für den Zug", "eine Empfehlung"], ["Der Tanzkurs im Keller", "ein mutiger Anfang"], ["Ein Nachmittag ohne Plan", "eine gemeinsame Entscheidung"]] },
  { title: "Medien und digitales Leben", shortTitle: "Digital", description: "Nachrichten verstehen, technische Probleme lösen und Informationen vergleichen.", grammar: "indirekte Fragen · Pronomen · trotzdem", canDo: "Ich kann einfache digitale Situationen erklären und reagieren.", color: "#6478a3", stories: [["Die Nachricht im falschen Chat", "ein peinlicher Fehler"], ["Ein Passwort für alles", "ein Sicherheitsproblem"], ["Der Videoanruf mit Oma", "eine neue Technik"], ["Die Karte auf dem Bildschirm", "eine Online-Buchung"], ["Ein Foto ohne Namen", "eine Nachfrage"], ["Die Rechnung per E-Mail", "eine verdächtige Nachricht"], ["Das Handy im Flugmodus", "eine verpasste Information"], ["Ein Link von einem Freund", "eine wichtige Entscheidung"], ["Die Gruppe für den Kurs", "zu viele Nachrichten"], ["Ein Abend ohne Internet", "eine ungeplante Pause"]] },
  { title: "Natur, Wetter und Umwelt", shortTitle: "Natur", description: "Wetter beschreiben, über Umwelt sprechen und kleine Pläne machen.", grammar: "wenn · obwohl · deshalb", canDo: "Ich kann über Wetter, Natur und einfache Folgen sprechen.", color: "#5f8d5a", stories: [["Der Regen am Picknicktag", "eine neue Idee im Park"], ["Die Flasche am Fluss", "eine Aufräumaktion"], ["Ein Baum vor dem Fenster", "eine Veränderung in der Straße"], ["Der warme Februar", "ungewöhnliches Wetter"], ["Die Fahrradtour im Wind", "eine schwierige Strecke"], ["Ein Garten für das Haus", "eine gemeinsame Aufgabe"], ["Die Bienen auf dem Balkon", "neue Pflanzen"], ["Das Licht im Flur", "Energie sparen"], ["Ein Ausflug in den Wald", "eine verlorene Gruppe"], ["Die Jacke im Sommer", "ein schneller Wetterwechsel"]] },
  { title: "Feste und gemeinsame Pläne", shortTitle: "Feste", description: "Einladen, organisieren und kulturelle Unterschiede freundlich besprechen.", grammar: "Konjunktiv II · wenn · Verben mit zu", canDo: "Ich kann ein Fest planen und Vorschläge machen.", color: "#b45c73", stories: [["Ein Tisch für zwölf", "eine Geburtstagsfeier"], ["Die Einladung ohne Adresse", "eine wichtige Rückfrage"], ["Ein Fest im Hof", "eine gemeinsame Vorbereitung"], ["Das Essen meiner Kindheit", "ein Gespräch über Traditionen"], ["Die Musik nach Mitternacht", "eine freundliche Bitte"], ["Ein Geschenk, das zu früh kam", "eine Überraschung"], ["Die Hochzeit von Aylin", "eine neue Erfahrung"], ["Ein Feiertag im Kalender", "unterschiedliche Gewohnheiten"], ["Die Liste für das Picknick", "eine Aufgabenverteilung"], ["Der Abschied am Bahnhof", "ein letzter gemeinsamer Abend"]] },
  { title: "A2-Missionen", shortTitle: "Missionen", description: "Bekannte Themen verbinden, Probleme lösen und klar reagieren.", grammar: "A2-Wiederholung · Nebensätze · Perfekt · Bitten", canDo: "Ich kann in vertrauten Situationen selbstständig handeln und meine Meinung begründen.", color: "#d15e49", stories: [["Der Tag mit drei Problemen", "einen Termin, eine Reise und eine Nachricht"], ["Eine Woche für die Nachbarin", "Hilfe in einer ungewohnten Situation"], ["Das Projekt im Sprachkurs", "gemeinsames Planen und Präsentieren"], ["Ein Besuch aus dem Ausland", "Gastgeber sein"], ["Die Wohnung am Samstag", "mehrere kleine Reparaturen"], ["Der Plan B für das Fest", "eine kurzfristige Änderung"], ["Eine Bewerbung, zwei Gespräche", "wichtige Entscheidungen"], ["Das Fundbüro im Bahnhof", "einen verlorenen Gegenstand beschreiben"], ["Ein Menü für alle", "verschiedene Wünsche berücksichtigen"], ["Der Brief an mein zukünftiges Ich", "A2-Erfahrungen zusammenfassen"]] },
];

const NAMES = ["Mira", "Jonas", "Elif", "Tariq", "Lea", "Oskar", "Noura", "Paula", "David", "Mei"];

function plannedText(title: string, situation: string, unit: PlannedUnit, index: number) {
  const name = NAMES[index % NAMES.length];
  const friend = NAMES[(index + 3) % NAMES.length];
  return `Für ${name} begann alles mit ${situation}. Später nannte ${friend} diese Erfahrung „${title}“. Als sich die Gelegenheit ergab, wollte ${name} nicht sofort entscheiden. Zuerst sprach ${name} mit ${friend}, denn beide kannten die Situation aus ihrem Alltag. ${friend} hörte aufmerksam zu und fragte, was genau schwierig sei. Schon dieses Gespräch machte das Problem kleiner.

Am nächsten Morgen bereitete ${name} alles gründlich vor. Es gab einen klaren Plan, aber auch eine Frage, die noch offen war. Deshalb fragte ${name} freundlich nach und erklärte die eigene Meinung. Die Antwort kam nicht sofort. Während ${name} wartete, merkte ${name}, dass es besser war, ruhig zu bleiben und die Informationen genau zu prüfen.

Schließlich ergab sich eine einfache Lösung. ${name} konnte einen kleinen Schritt machen, ohne alles auf einmal zu verändern. ${friend} half dabei, die wichtigsten Punkte zu ordnen. Beide verglichen verschiedene Möglichkeiten und entschieden sich für diejenige, die im Alltag wirklich passte. Niemand musste perfekt sein; wichtig war, dass sie einander verstanden.

Später erzählte ${name} anderen von dem Erlebnis. Dabei erklärte ${name}, was vorher passiert war, warum die Entscheidung nicht leicht gewesen war und was sich danach verändert hatte. Es war keine große Geschichte, aber eine, aus der man etwas lernen konnte. ${name} war zufrieden, weil aus ${situation} am Ende eine gute Erfahrung geworden war.

Zum Schluss fragte ${friend}: „Was würdest du beim nächsten Mal anders machen?“ ${name} dachte kurz nach und antwortete: „Ich würde früher nachfragen und nicht alles allein lösen wollen.“ Diese Antwort passte auch zu ${unit.shortTitle}: Im Alltag helfen klare Worte, Geduld und ein kleiner Plan.`;
}

const GENERATED_UNITS: Unit[] = PLANNED_UNITS.map((unit, unitIndex) => {
  const id = unitIndex + 2;
  const stories = unit.stories.map(([title, situation], storyIndex): Story => {
    const number = UNIT_ONE_STORIES.length + unitIndex * 10 + storyIndex + 1;
    return {
      id: `a2-story-${String(number).padStart(3, "0")}`,
      number,
      unitId: id,
      title,
      text: plannedText(title, situation, unit, storyIndex),
      grammar: unit.grammar,
      canDo: unit.canDo,
      theme: unit.shortTitle,
      color: unit.color,
      pronunciation: `Sinnvolle Pausen und Satzakzent in: ${unit.grammar}.`,
      referenceFocus: "Achte auf Pronomen und Verweiswörter, die sich auf Personen, Dinge und vorherige Sätze beziehen.",
      speakingPrompt: `Sprich über ${situation} und begründe, welche Lösung du wählen würdest.`,
      writingPrompt: `Schreibe 70–100 Wörter zu ${situation}. Nenne ein Problem, eine Lösung und deine Meinung.`,
      audioReady: true,
    };
  });
  return { ...unit, id, stories };
});

export const A2_UNITS: Unit[] = [FIRST_UNIT, ...GENERATED_UNITS];
export const A2_STORIES: Story[] = A2_UNITS.flatMap((unit) => unit.stories);

const words = A2_STORIES.flatMap((story) => story.text.split(/\s+/).filter(Boolean));
export const A2_STATS = {
  totalWords: words.length,
  uniqueWordForms: new Set(words.map((word) => word.toLocaleLowerCase("de-DE").replace(/[^a-zäöüßé]/gi, ""))).size,
  averageStoryWords: Math.round(words.length / A2_STORIES.length),
};
