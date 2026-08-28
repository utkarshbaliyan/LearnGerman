import type { Story, Unit } from "@/app/curriculum/types";

export const B1_GLOSSARY: Record<string, string> = {
  allerdings: "however", anschließend: "afterwards", auswirkung: "effect / consequence",
  bedingung: "condition", beitragen: "to contribute", dennoch: "nevertheless",
  deutlich: "clear / clearly", einerseits: "on the one hand", entscheidung: "decision",
  erfahrung: "experience", ermöglichen: "to make possible", folglich: "consequently",
  herausforderung: "challenge", hingegen: "on the other hand", inzwischen: "meanwhile",
  kompromiss: "compromise", langfristig: "long-term", maßnahme: "measure / action",
  nachhaltig: "sustainable", nachdem: "after", obwohl: "although",
  rückmeldung: "feedback", schließlich: "finally", sowohl: "both",
  standpunkt: "point of view", trotzdem: "despite that", überzeugen: "to convince",
  ursprünglich: "originally", voraussetzung: "requirement", während: "while",
  zuverlässig: "reliable", zuständig: "responsible", zusammenhang: "connection / context",
};

type UnitPlan = Omit<Unit, "id" | "stories"> & {
  situation: string;
  decisions: readonly string[];
  titles: readonly string[];
};

const UNIT_PLANS: readonly UnitPlan[] = [
  {
    title: "Biografien und Wendepunkte", shortTitle: "Lebenswege", color: "#8a5a44",
    description: "Zusammenhängend über Erfahrungen, Veränderungen und prägende Entscheidungen erzählen.",
    grammar: "Präteritum und Perfekt · nachdem / bevor · Plusquamperfekt",
    canDo: "Ich kann einen persönlichen Bericht zeitlich ordnen und wichtige Wendepunkte erklären.",
    situation: "eine persönliche Veränderung, deren Bedeutung erst im Rückblick sichtbar wird",
    decisions: ["Erinnerungen bewahren", "einen Neuanfang wagen", "eine frühere Entscheidung korrigieren"],
    titles: ["Der Koffer auf dem Dachboden", "Ein Jahr in Rostock", "Das Foto ohne Datum", "Als der Laden schließen musste", "Die unbekannte Tante", "Drei Haltestellen weiter", "Der erste Tag ohne Wörterbuch", "Ein Name auf der Teilnehmerliste", "Die Werkstatt meines Vaters", "Der Brief an mein jüngeres Ich"],
  },
  {
    title: "Beziehungen und Konflikte", shortTitle: "Miteinander", color: "#a34f67",
    description: "Gefühle differenziert ausdrücken, Missverständnisse klären und Kompromisse aushandeln.",
    grammar: "Relativsätze · obwohl / trotzdem · Konjunktiv II für Vorschläge",
    canDo: "Ich kann einen Konflikt erklären, andere Sichtweisen wiedergeben und einen Kompromiss vorschlagen.",
    situation: "ein Missverständnis zwischen Menschen, die eigentlich dasselbe Ziel haben",
    decisions: ["offen nachfragen", "Grenzen respektvoll setzen", "einen fairen Kompromiss finden"],
    titles: ["Die Nachricht, die anders klang", "Sonntag bei zwei Familien", "Der Schlüssel im Blumentopf", "Ein Tisch mit leerem Stuhl", "Die Reise ohne Kompromiss", "Zwischen zwei Sprachen", "Der geliehene Mantel", "Vier Wochen Funkstille", "Die Gruppe entscheidet", "Ein Fest ohne Überraschung"],
  },
  {
    title: "Wohnen und Nachbarschaft", shortTitle: "Wohnwelten", color: "#6d7f52",
    description: "Wohnprobleme schildern, Regeln diskutieren und gemeinschaftliche Lösungen entwickeln.",
    grammar: "Passiv Präsens · lassen · Verben mit Präpositionen",
    canDo: "Ich kann ein Wohnproblem sachlich beschreiben und an einer gemeinsamen Lösung mitarbeiten.",
    situation: "ein Problem im Haus, bei dem private Wünsche und gemeinsame Regeln aufeinandertreffen",
    decisions: ["die Verwaltung einbeziehen", "eine Hausversammlung organisieren", "Verantwortung gerecht verteilen"],
    titles: ["Das Licht im dritten Stock", "Ein Garten für sechs Parteien", "Die Wohnung mit dem Klavier", "Miete gegen Hilfe", "Der Schrank im Hausflur", "Die letzte freie Wohnung", "Ein Balkon voller Tomaten", "Die Versammlung im Keller", "Post für den Vormieter", "Das Haus, das bleiben soll"],
  },
  {
    title: "Arbeit und berufliche Entwicklung", shortTitle: "Arbeitsleben", color: "#466b86",
    description: "Erfahrungen darstellen, Verantwortung übernehmen und berufliche Entscheidungen begründen.",
    grammar: "Infinitiv mit zu · indirekte Fragen · höflicher Konjunktiv II",
    canDo: "Ich kann berufliche Situationen erklären, Lösungen vorschlagen und über Ziele sprechen.",
    situation: "eine berufliche Herausforderung, die Fachwissen und gute Kommunikation verlangt",
    decisions: ["einen Fehler transparent machen", "eine Idee im Team vertreten", "berufliche Sicherheit neu bewerten"],
    titles: ["Die Präsentation ohne Folien", "Eine Stelle, zwei Angebote", "Der Fehler in der Rechnung", "Pause um halb drei", "Das Gespräch nach der Probezeit", "Eine Idee aus dem Lager", "Der Kollege im Homeoffice", "Bewerbung mit Lücke", "Die Kundin, die nicht wartete", "Der letzte Tag im Team"],
  },
  {
    title: "Bildung und lebenslanges Lernen", shortTitle: "Lernwege", color: "#6c5b9a",
    description: "Lernstrategien vergleichen, Informationen zusammenfassen und Fortschritte reflektieren.",
    grammar: "um ... zu / ohne ... zu · dadurch, dass · Nominalisierung",
    canDo: "Ich kann meinen Lernweg beschreiben, Methoden bewerten und konkrete Ziele formulieren.",
    situation: "eine Lernsituation, in der Fortschritt nicht geradlinig verläuft",
    decisions: ["eine Methode verändern", "Hilfe annehmen", "mit einem realistischen Plan neu beginnen"],
    titles: ["Das Referat ohne Stimme", "Fünf Minuten jeden Morgen", "Die Prüfung im zweiten Versuch", "Ein Kurs für drei Generationen", "Der Text mit roten Rändern", "Lernen im Zug", "Die Frage, die keiner stellte", "Ein Tandem mit Pausen", "Das Zertifikat an der Wand", "Der Lehrer wird Schüler"],
  },
  {
    title: "Gesundheit und Wohlbefinden", shortTitle: "Gesund leben", color: "#3f8276",
    description: "Beschwerden genauer schildern, Rat abwägen und über Gewohnheiten sprechen.",
    grammar: "sollte / hätte sollen · falls · je ... desto",
    canDo: "Ich kann gesundheitliche Informationen verstehen, Gewohnheiten bewerten und begründeten Rat geben.",
    situation: "eine gesundheitliche Frage, bei der Gewohnheiten und verantwortlicher Rat unterschieden werden müssen",
    decisions: ["professionellen Rat suchen", "eine belastende Routine verändern", "Unterstützung anbieten, ohne zu bestimmen"],
    titles: ["Der Termin nach Mitternacht", "Zehntausend Schritte", "Die Tablette im Küchenschrank", "Ein Platz im Wartezimmer", "Die leise Erschöpfung", "Kochen ohne Etikett", "Der Lauf am Sonntag", "Ein Anruf für Herrn Weber", "Handyfreie Mittagspause", "Der erste ruhige Morgen"],
  },
  {
    title: "Konsum, Geld und Verantwortung", shortTitle: "Geldfragen", color: "#9b7040",
    description: "Angebote beurteilen, Reklamationen erklären und finanzielle Entscheidungen abwägen.",
    grammar: "Vergleichssätze · während / wohingegen · zweiteilige Konnektoren",
    canDo: "Ich kann Vor- und Nachteile eines Kaufs erklären und eine sachliche Beschwerde formulieren.",
    situation: "eine Geldentscheidung, bei der Preis, Qualität und Verantwortung unterschiedlich wichtig sind",
    decisions: ["ein Angebot sorgfältig prüfen", "eine faire Reklamation formulieren", "langfristigen Wert statt nur den Preis betrachten"],
    titles: ["Das günstige Fahrrad", "Drei Verträge später", "Die Tasse mit dem Sprung", "Bar oder Karte", "Der Preis an der Kasse", "Kleidung für einen Abend", "Ein Konto für das Projekt", "Die Reparatur, die sich lohnt", "Trinkgeld im Team", "Ein Monat ohne Spontankäufe"],
  },
  {
    title: "Reisen und Mobilität", shortTitle: "Unterwegs", color: "#347d8a",
    description: "Reiseerlebnisse ausführlich erzählen, Informationen vergleichen und auf Probleme reagieren.",
    grammar: "Plusquamperfekt · als / wenn · Partizipien als Adjektive",
    canDo: "Ich kann eine Reise organisieren, unerwartete Ereignisse schildern und Alternativen erklären.",
    situation: "eine Reise, deren ursprünglicher Plan durch ein unerwartetes Ereignis verändert wird",
    decisions: ["eine sichere Alternative wählen", "mit Fremden zusammenarbeiten", "Verantwortung für die Gruppe übernehmen"],
    titles: ["Der Zug endete in Fulda", "Zimmer 214 ist besetzt", "Mit dem Rad über die Grenze", "Die Stadt ohne Stadtplan", "Ein Pass für zwei Namen", "Der Bus, der nur freitags fährt", "Gastgeber für eine Nacht", "Die Reise im Nachtzug", "Souvenirs im Handgepäck", "Zurück mit anderer Meinung"],
  },
  {
    title: "Dienstleistungen und öffentliches Leben", shortTitle: "Öffentlich", color: "#7d6954",
    description: "Formelle Abläufe verstehen, Anliegen präzise vortragen und Rechte respektvoll nutzen.",
    grammar: "Passiv Präteritum · indirekte Rede mit dass · N-Deklination",
    canDo: "Ich kann Behörden- und Servicesituationen bewältigen und Informationen verständlich weitergeben.",
    situation: "ein formeller Vorgang, bei dem klare Informationen, Fristen und Zuständigkeiten entscheidend sind",
    decisions: ["gezielt nachfragen", "einen Ablauf dokumentieren", "ein öffentliches Anliegen gemeinsam vertreten"],
    titles: ["Nummer 87", "Der Brief ohne Erklärung", "Ein Zeuge am Fenster", "Die Bibliothek am Abend", "Der Antrag im falschen Fach", "Ein Dolmetscher fehlt", "Das Paket hinter der Tür", "Die neue Linie 14", "Hilfe am Wahltag", "Der Platz vor dem Rathaus"],
  },
  {
    title: "Medien und digitale Welt", shortTitle: "Medien", color: "#53669b",
    description: "Quellen einschätzen, Standpunkte erkennen und digitale Kommunikation reflektieren.",
    grammar: "indirekte Rede · laut / zufolge · einerseits ... andererseits",
    canDo: "Ich kann Medieninhalte zusammenfassen, Quellen vergleichen und meine Einschätzung begründen.",
    situation: "eine digitale Information, deren Quelle, Absicht und Wirkung geprüft werden müssen",
    decisions: ["eine Quelle überprüfen", "Privatsphäre schützen", "eine öffentliche Reaktion sachlich formulieren"],
    titles: ["Die Meldung im Familienchat", "Ein Bild mit anderem Ausschnitt", "Der Kommentar unter meinem Namen", "Vier Sterne sind nicht genug", "Der Podcast aus dem Keller", "Eine Woche nur Schlagzeilen", "Das Video aus der Zukunft", "Privat, aber nicht geheim", "Der Algorithmus kennt mich", "Redaktion für einen Tag"],
  },
  {
    title: "Kultur, Sprache und Identität", shortTitle: "Kultur", color: "#a05f46",
    description: "Erfahrungen vergleichen, Mehrdeutigkeit aushalten und kulturelle Perspektiven beschreiben.",
    grammar: "Relativsätze mit Präpositionen · je nachdem · als ob",
    canDo: "Ich kann kulturelle Erfahrungen differenziert beschreiben und Missverständnisse respektvoll erklären.",
    situation: "eine Begegnung, in der Sprache, Erinnerung und kulturelle Erwartungen verschieden wirken",
    decisions: ["Unterschiede sichtbar lassen", "eine Bedeutung erklären statt nur übersetzen", "Tradition und Veränderung verbinden"],
    titles: ["Das Lied in drei Sprachen", "Pünktlich um sieben?", "Der Name auf der Bühne", "Ein Rezept ohne Grammangaben", "Die Führung im eigenen Viertel", "Wörter, die nicht reisen", "Der stille Feiertag", "Kunst an der Hauswand", "Mein Akzent bleibt", "Das Museum der kleinen Dinge"],
  },
  {
    title: "Umwelt und nachhaltiger Alltag", shortTitle: "Umwelt", color: "#4f8050",
    description: "Ursachen und Folgen erklären, Maßnahmen bewerten und gemeinsame Projekte planen.",
    grammar: "wegen / trotz · sodass · Passiv mit Modalverben",
    canDo: "Ich kann ein Umweltproblem erklären und realistische Maßnahmen mit Vor- und Nachteilen diskutieren.",
    situation: "ein Umweltprojekt, bei dem gute Absichten praktisch und messbar werden sollen",
    decisions: ["kurzfristige und langfristige Folgen vergleichen", "Kosten gerecht verteilen", "Ergebnisse offen überprüfen"],
    titles: ["Der Baum vor Haus 18", "Kaffee im eigenen Becher", "Der warme Klassenraum", "Gemüse mit kleinen Fehlern", "Eine Straße ohne Autos", "Reparieren am Samstag", "Wasser für den Sportplatz", "Urlaub mit kleinerem Fußabdruck", "Die Solaranlage auf dem Dach", "Hundert Tage später"],
  },
  {
    title: "Technik und Veränderungen", shortTitle: "Technik", color: "#41768b",
    description: "Technische Entwicklungen erklären, Chancen und Risiken abwägen und Anleitungen verstehen.",
    grammar: "werden-Passiv · falls / sofern · Futur und Vermutungen",
    canDo: "Ich kann technische Veränderungen verständlich beschreiben und ihre Folgen begründet einschätzen.",
    situation: "eine neue Technik, die ein Problem löst und gleichzeitig neue Fragen schafft",
    decisions: ["menschliche Kontrolle sichern", "Datenschutz berücksichtigen", "eine technische Lösung praktisch testen"],
    titles: ["Der Roboter im Pflegeheim", "Ein Drucker für Ersatzteile", "Das Haus hört mit", "Unterricht mit virtueller Reise", "Die App gegen das Vergessen", "Ein Fehler im automatischen Plan", "Das Fahrrad aus dem Labor", "Stromausfall um acht", "Die Maschine übersetzt mit", "Arbeit im Jahr 2035"],
  },
  {
    title: "Gesellschaft und Generationen", shortTitle: "Gesellschaft", color: "#775f8e",
    description: "Soziale Veränderungen beschreiben, Perspektiven vergleichen und Teilhabe diskutieren.",
    grammar: "je ... desto · nicht nur ... sondern auch · Pronomen als Textbezug",
    canDo: "Ich kann gesellschaftliche Beobachtungen erklären und unterschiedliche Perspektiven fair darstellen.",
    situation: "eine gesellschaftliche Veränderung, von der Gruppen unterschiedlich betroffen sind",
    decisions: ["Teilhabe verbessern", "Erfahrung und neue Ideen verbinden", "gemeinsame Räume fair gestalten"],
    titles: ["Die Bank vor dem Haus", "Eine Wohnung gegen Einsamkeit", "Der Verein wird jünger", "Dienstag ist Besuchstag", "Das Dorf bekommt Internet", "Ein Spielplatz für alle", "Der neue Nachname", "Zeit statt Geld", "Die Sprache im Formular", "Ein Platz im Rat"],
  },
  {
    title: "Meinungen und gute Gespräche", shortTitle: "Argumentieren", color: "#a15252",
    description: "Standpunkte strukturieren, Einwände aufnehmen und Gespräche konstruktiv führen.",
    grammar: "zwar ... aber · dennoch · Konjunktiv II Vergangenheit",
    canDo: "Ich kann eine Meinung mit Beispielen begründen, auf Einwände reagieren und ein Gespräch zusammenfassen.",
    situation: "eine Diskussion, in der mehrere vernünftige Standpunkte miteinander konkurrieren",
    decisions: ["Gesprächsregeln vereinbaren", "Beispiele statt persönliche Angriffe nutzen", "einen ehrlichen Minimalkonsens formulieren"],
    titles: ["Die Diskussion nach dem Film", "Handys im Unterricht", "Soll der Laden sonntags öffnen?", "Das Mikrofon bleibt an", "Ein Hund im Büro", "Noten für Gruppenarbeit", "Mehr Platz für Fahrräder", "Die Einladung zum Streitgespräch", "Ein Buch wird aus dem Programm genommen", "Am Ende ein gemeinsamer Satz"],
  },
  {
    title: "Pläne, Entscheidungen und Zukunft", shortTitle: "Zukunft", color: "#4b7296",
    description: "Ziele entwickeln, Unsicherheit ausdrücken und begründete Entscheidungen treffen.",
    grammar: "Futur I · würde / hätte / wäre · falls und vorausgesetzt, dass",
    canDo: "Ich kann Zukunftspläne erläutern, Bedingungen nennen und mögliche Folgen abwägen.",
    situation: "ein Zukunftsplan, der Hoffnung macht, aber echte Bedingungen und Risiken hat",
    decisions: ["einen kleinen ersten Schritt wählen", "Sicherheit und Freiheit abwägen", "einen Plan unter klaren Bedingungen testen"],
    titles: ["Ein Café in der alten Post", "Noch einmal studieren", "Der Vertrag für fünf Jahre", "Plan B am Meer", "Ein Zimmer bleibt frei", "Die Liste vor dem dreißigsten Geburtstag", "Zurück aufs Land", "Ein Jahr für das Ehrenamt", "Die Firma ohne Chef", "Nachricht aus dem Jahr 2040"],
  },
  {
    title: "B1-Prüfungstraining im Alltag", shortTitle: "Prüfung", color: "#7c6a3f",
    description: "Lesen, Hören, Schreiben und Sprechen in realistischen B1-Aufgaben verbinden.",
    grammar: "B1-Wiederholung · Textaufbau · formeller und informeller Stil",
    canDo: "Ich kann typische B1-Aufgaben planen, Informationen auswählen und verständlich bearbeiten.",
    situation: "eine prüfungsnahe Aufgabe, bei der relevante Informationen ausgewählt und geordnet werden",
    decisions: ["eine klare Textstruktur nutzen", "Hauptaussagen von Details trennen", "Vorschläge begründen und auf andere reagieren"],
    titles: ["Vier Anzeigen, eine Entscheidung", "Die Ansage auf Gleis sieben", "Antwort bis Donnerstag", "Das Bild mit vielen Geschichten", "Gemeinsam einen Ausflug planen", "Der Leserbrief", "Das Interview im Radio", "Eine Reklamation mit Lösung", "Zwei Minuten über mich", "Die Woche vor der Prüfung"],
  },
  {
    title: "B1-Missionen: selbstständig handeln", shortTitle: "Missionen", color: "#b54f43",
    description: "Mehrere Themen und Textsorten verbinden, Entscheidungen treffen und Ergebnisse präsentieren.",
    grammar: "integrierte B1-Strukturen · Kohäsion · Registerwechsel",
    canDo: "Ich kann ein mehrstufiges Alltagsproblem selbstständig lösen und meine Entscheidung nachvollziehbar darstellen.",
    situation: "eine mehrstufige Mission, bei der Informationen, Menschen und praktische Aufgaben koordiniert werden",
    decisions: ["Prioritäten setzen", "Aufgaben transparent verteilen", "Ergebnisse auswerten und verständlich präsentieren"],
    titles: ["48 Stunden ohne Heizung", "Das verschwundene Vereinsgeld", "Ein Gast aus drei Perspektiven", "Die Stadtteilzeitung", "Neustart für den Wochenmarkt", "Der Weg zum barrierefreien Fest", "Sieben Tage bis zur Eröffnung", "Die Reisegruppe entscheidet neu", "Ein Monat für weniger Müll", "Die Rede am letzten Kursabend"],
  },
];

const PEOPLE = [
  ["Mara", "Elias"], ["Samir", "Nele"], ["Amina", "Jonas"], ["Clara", "Mehmet"],
  ["Lina", "Pavel"], ["Hana", "Tobias"], ["Esra", "Noah"], ["Daria", "Lukas"],
  ["Mina", "René"], ["Sara", "Ben"], ["Nora", "Karim"], ["Leonie", "David"],
] as const;

const OPENINGS = [
  "an einem regnerischen Dienstagmorgen", "kurz vor Feierabend", "während eines langen Wochenendes",
  "bei einem Treffen im Nachbarschaftshaus", "auf dem Weg zu einem wichtigen Termin",
  "nach einer unerwarteten Nachricht", "an einem ungewöhnlich ruhigen Sonntag",
  "mitten in einer ohnehin anstrengenden Woche", "bei einer Tasse Kaffee in der Küche",
  "wenige Minuten vor Beginn einer Besprechung",
] as const;

const COMPLICATIONS = [
  "Dann tauchte eine Information auf, die vorher niemand gekannt hatte. Sie änderte nicht alle Fakten, verschob aber den Blick auf das Problem. Was zunächst eindeutig gewirkt hatte, hatte plötzlich eine zweite Seite.",
  "Noch bevor sie handeln konnten, meldete sich eine weitere Person. Ihre Erfahrung ergänzte die erste Darstellung um einen wichtigen Punkt. Dadurch mussten alle ihre schnellen Urteile überprüfen.",
  "Der erste Plan scheiterte an einer kleinen, aber entscheidenden Voraussetzung. Anstatt aufzugeben, teilten sie das Problem in Schritte. So wurde sichtbar, was dringend war und was warten konnte.",
  "Im entscheidenden Moment entstand ein Missverständnis. Ein kurzer Satz war anders gemeint, als er verstanden worden war. Erst durch konkrete Beispiele wurden die verschiedenen Erwartungen klar.",
  "Eine Frist setzte die Gruppe unter Druck. Fast alle wollten möglichst schnell entscheiden. Gerade deshalb bestand eine Person darauf, die Folgen nicht zu übersehen.",
  "Unerwartet bot jemand Hilfe an, der bisher kaum beteiligt gewesen war. Das Angebot löste nicht alles, zeigte jedoch eine Möglichkeit, an die vorher niemand gedacht hatte.",
  "Als die Kosten genauer berechnet wurden, war die einfache Lösung nicht mehr realistisch. Nun mussten Vorteile, Risiken und langfristige Folgen gegeneinander abgewogen werden.",
  "Ein persönliches Erlebnis brachte die sachliche Diskussion durcheinander. Plötzlich ging es nicht nur um Regeln, sondern auch um Vertrauen und die Angst, nicht ernst genommen zu werden.",
  "Die schriftlichen Informationen passten nicht zu dem, was telefonisch gesagt worden war. Bevor sie fortfuhren, hielten sie beide Aussagen fest und suchten die zuständige Person.",
  "Am nächsten Tag zeigte sich, dass eine leise Person den wichtigsten Einwand gehabt hatte. Die Gruppe begann die Diskussion deshalb noch einmal mit klareren Regeln.",
] as const;

function buildStoryText(title: string, unit: UnitPlan, number: number) {
  const pair = PEOPLE[number % PEOPLE.length];
  const main = pair[0];
  const partner = pair[1];
  const opening = OPENINGS[number % OPENINGS.length];
  const complication = COMPLICATIONS[(number - 1) % COMPLICATIONS.length];
  const decision = unit.decisions[number % unit.decisions.length];

  return [
    opening + " begann für " + main + " eine Geschichte, die später unter dem Titel „" + title + "“ im Gedächtnis blieb. Es ging um " + unit.situation + ". Zunächst glaubte " + main + ", die Lage schnell einschätzen zu können. Die wichtigsten Fakten schienen bekannt zu sein. Auch " + partner + ", mit dem " + main + " oft schwierige Fragen besprach, sah anfangs keinen Grund zur Sorge. Doch je länger beide darüber redeten, desto deutlicher wurde, dass hinter der praktischen Frage unterschiedliche Erwartungen und Erfahrungen standen.",
    main + " sammelte zuerst die Informationen, die sich sicher bestätigen ließen. Dabei trennte " + main + " Beobachtungen von Vermutungen und schrieb offene Fragen auf. " + partner + " wollte sofort eine Lösung vorschlagen, während " + main + " lieber noch eine weitere Meinung hören wollte. „Wenn wir jetzt entscheiden, sparen wir Zeit“, sagte " + partner + ". " + main + " antwortete: „Das stimmt zwar, aber eine schnelle Entscheidung hilft uns nicht, falls wir dabei jemanden übergehen.“ Beide merkten, dass sie dasselbe Ziel hatten, obwohl sie den Weg dorthin verschieden beurteilten.",
    complication + " " + main + " fasste den Zusammenhang deshalb in eigenen Worten zusammen und fragte anschließend, ob alle Beteiligten diese Darstellung teilten. Nicht jede Antwort war angenehm. Manche Kritik war berechtigt, andere beruhte auf unvollständigen Informationen. Trotzdem blieb das Gespräch sachlich, weil Beispiele genannt wurden und niemand so tat, als gäbe es nur eine vernünftige Sicht.",
    "Zur Vorbereitung auf das nächste Gespräch suchten " + main + " und " + partner + " nach vergleichbaren Fällen. Sie lasen Hinweise, notierten konkrete Zahlen und sprachen mit einer Person, die eine ähnliche Situation erlebt hatte. Dabei zeigte sich, dass allgemeine Ratschläge allein nicht genügten. Was anderswo funktioniert hatte, musste an die Menschen und Bedingungen vor Ort angepasst werden. " + main + " achtete besonders darauf, zwischen einer belegten Aussage und einer persönlichen Einschätzung zu unterscheiden. Diese Genauigkeit machte die Erklärung länger, aber auch glaubwürdiger.",
    "Am Nachmittag wurde die eigentliche Entscheidung konkret. Es ging darum, " + decision + ". " + main + " verglich drei Möglichkeiten. Die erste wäre einfach umzusetzen gewesen, hätte das Problem aber nur kurzfristig verdeckt. Die zweite versprach eine gründliche Lösung, verlangte jedoch mehr Zeit, Geld oder Unterstützung. Die dritte verband kleinere Schritte mit einem festen Termin, an dem das Ergebnis überprüft werden sollte. " + partner + " fand diesen Weg zunächst zu vorsichtig. Nachdem " + main + " jedoch die vermiedenen Risiken erklärt hatte, stimmte " + partner + " einem Versuch zu.",
    "Sie formulierten den Plan so, dass auch Außenstehende ihn verstehen konnten. Zuerst sollte geklärt werden, wer wofür zuständig war. Danach wollten sie die Betroffenen informieren und ausdrücklich um Rückmeldung bitten. Schließlich legten sie fest, woran man erkennen würde, ob die Lösung funktionierte. Diese Reihenfolge wirkte unspektakulär, war aber wichtig. Früher hatten beide erlebt, dass gute Ideen scheiterten, weil niemand Verantwortung übernommen oder den nächsten Schritt genannt hatte.",
    "Beim zweiten Treffen stellte " + partner + " den Plan vor, während " + main + " Fragen sammelte. Eine Person unterstützte die Idee sofort, eine andere warnte vor unbeabsichtigten Folgen. Statt den Einwand als Widerstand abzutun, baten sie um einen konkreten Verbesserungsvorschlag. So entstand eine zusätzliche Bedingung, die zunächst umständlich wirkte, später aber einen echten Fehler verhinderte. Am Ende fasste " + main + " nicht nur die Zustimmung, sondern auch die offenen Punkte zusammen. Dadurch wusste jeder, was bereits entschieden war und worüber noch gesprochen werden musste.",
    "Eine Woche später war nicht alles perfekt. Ein Teil des Plans hatte gut funktioniert, ein anderer musste verändert werden. " + main + " war dennoch zufrieden, denn die Beteiligten sprachen nun miteinander statt übereinander. Auch " + partner + " gab zu, dass die zusätzliche Nachfrage sinnvoll gewesen war. Gleichzeitig erinnerte " + partner + " daran, dass sorgfältiges Abwägen nicht zu endlosem Zögern werden dürfe. Dieser Einwand blieb wichtig.",
    "Auf dem Heimweg dachte " + main + " noch einmal über „" + title + "“ nach. Die wichtigste Erkenntnis bestand nicht darin, immer sofort die richtige Antwort zu kennen. Entscheidend war vielmehr, Unsicherheit auszuhalten, Informationen zu prüfen und die eigene Meinung verständlich zu begründen. " + main + " hätte früher vielleicht versucht, allein überzeugend zu wirken. Jetzt wusste " + main + ", dass eine tragfähige Entscheidung meistens dort entsteht, wo Menschen einander zuhören, Verantwortung teilen und bereit sind, ihren ersten Plan zu verbessern.",
  ].join("\n\n");
}

export const B1_UNITS: Unit[] = UNIT_PLANS.map((unit, unitIndex) => {
  const id = unitIndex + 1;
  const stories = unit.titles.map((title, storyIndex): Story => {
    const number = unitIndex * 10 + storyIndex + 1;
    return {
      id: "b1-story-" + String(number).padStart(3, "0"),
      number,
      unitId: id,
      title,
      text: buildStoryText(title, unit, number),
      grammar: unit.grammar,
      canDo: unit.canDo,
      theme: unit.shortTitle,
      color: unit.color,
      pronunciation: "Achte auf Satzakzent, Sprechpausen und deutlich verbundene Gedanken bei: " + unit.grammar + ".",
      referenceFocus: "Verfolge Pronomen, Relativpronomen und Verweiswörter über mehrere Sätze. Prüfe, auf welche Person, Aussage oder Möglichkeit sie sich beziehen.",
      speakingPrompt: "Fasse „" + title + "“ zusammen, nenne zwei Perspektiven und begründe, wie du entschieden hättest.",
      writingPrompt: "Schreibe 120–150 Wörter zu „" + title + "“. Ordne die Ereignisse, erkläre einen Standpunkt und schließe mit einer begründeten Lösung.",
      audioReady: false,
    };
  });
  return { ...unit, id, stories };
});

export const B1_STORIES: Story[] = B1_UNITS.flatMap((unit) => unit.stories);

const words = B1_STORIES.flatMap((story) => story.text.split(/\s+/).filter(Boolean));
export const B1_STATS = {
  totalWords: words.length,
  uniqueWordForms: new Set(words.map((word) => word.toLocaleLowerCase("de-DE").replace(/[^a-zäöüßé]/gi, ""))).size,
  averageStoryWords: Math.round(words.length / B1_STORIES.length),
};
