import type { VocabularyCategory } from "@/app/vocabulary/data";

export type EssentialVocabulary = {
  category: VocabularyCategory;
  english: string;
  german: string;
};

function rows(category: VocabularyCategory, source: string): EssentialVocabulary[] {
  return source.split(";").map((row) => {
    const [english, german] = row.split("|");
    if (!english || !german) throw new Error(`Invalid essential vocabulary entry: ${row}`);
    return { category, english, german };
  });
}

// Original, CEFR-oriented coverage additions. They are organised by practical
// communicative need, with Netzwerk neu used only as a level-coverage benchmark.
export const ESSENTIAL_A1 = [
  ...rows("Grundlagen & Kommunikation", "excuse me|Entschuldigung;please|bitte;you're welcome|gern geschehen;maybe|vielleicht;again|noch einmal;soon|bald;first|zuerst;last|zuletzt;important|wichtig;different|anders"),
  ...rows("Familie & Menschen", "man|der Mann;woman|die Frau;baby|das Baby;parents|die Eltern;son|der Sohn;daughter|die Tochter;grandmother|die Großmutter;grandfather|der Großvater;guest|der Gast;neighbour|der Nachbar"),
  ...rows("Zuhause & Wohnen", "address|die Adresse;key|der Schlüssel;floor|der Boden;wall|die Wand;roof|das Dach;garden|der Garten;stairs|die Treppe;letterbox|der Briefkasten;toilet|die Toilette;cleaning|das Putzen"),
  ...rows("Essen & Trinken", "cheese|der Käse;butter|die Butter;rice|der Reis;pasta|die Nudeln;potato|die Kartoffel;apple|der Apfel;banana|die Banane;chicken|das Hähnchen;sugar|der Zucker;salt|das Salz"),
  ...rows("Einkaufen & Kleidung", "trousers|die Hose;skirt|der Rock;dress|das Kleid;shoe|der Schuh;size|die Größe;cash|bar bezahlen;cheap|billig;expensive|teuer;to try on|anprobieren;to need|brauchen"),
  ...rows("Schule & Lernen", "exercise|die Übung;question|die Frage;answer|die Antwort;exam|die Prüfung;dictionary|das Wörterbuch;pen|der Stift;notebook|das Heft;to explain|erklären;to repeat|wiederholen;to understand|verstehen"),
  ...rows("Arbeit & Beruf", "nurse|die Krankenschwester;doctor|der Arzt;driver|der Fahrer;cook|der Koch;waitress|die Kellnerin;police officer|der Polizist;office|das Büro;shift|die Schicht;to earn|verdienen;to work|arbeiten"),
  ...rows("Stadt & Verkehr", "traffic light|die Ampel;crossing|die Kreuzung;pharmacy|die Apotheke;hospital|das Krankenhaus;bakery|die Bäckerei;supermarket|der Supermarkt;taxi|das Taxi;airport|der Flughafen;to change trains|umsteigen;to wait|warten"),
  ...rows("Reisen & Unterkunft", "country|das Land;countries|die Länder;passport|der Pass;suitcase|der Koffer;holiday|der Urlaub;beach|der Strand;mountain|der Berg;reservation|die Reservierung;arrival|die Ankunft;departure|die Abfahrt"),
  ...rows("Gesundheit & Körper", "fear|die Angst;illness|die Krankheit;medicine|das Medikament;pain|der Schmerz;stomach|der Bauch;back|der Rücken;eye|das Auge;to hurt|wehtun;healthy|gesund;to recover|gesund werden"),
  ...rows("Freizeit, Kultur & Sport", "game|das Spiel;walk|der Spaziergang;swimming pool|das Schwimmbad;library|die Bibliothek;newspaper|die Zeitung;television|der Fernseher;dance|der Tanz;to meet|sich treffen;to swim|schwimmen;to read|lesen"),
  ...rows("Natur, Wetter & Umwelt", "tree|der Baum;flower|die Blume;forest|der Wald;animal|das Tier;bird|der Vogel;cloud|die Wolke;snow|der Schnee;storm|der Sturm;hot|heiß;cold|kalt"),
];

export const ESSENTIAL_A2 = [
  ...rows("Grundlagen & Kommunikation", "to recommend|empfehlen;to refuse|ablehnen;to invite|einladen;to promise|versprechen;to agree|zustimmen;to interrupt|unterbrechen;misunderstanding|das Missverständnis;opinion|die Meinung;reason|der Grund;example|das Beispiel"),
  ...rows("Familie & Menschen", "relationship|die Beziehung;argument|der Streit;friendship|die Freundschaft;lonely|einsam;proud|stolz;disappointed|enttäuscht;worried|besorgt;angry|wütend;to trust|vertrauen;to forgive|verzeihen"),
  ...rows("Zuhause & Wohnen", "landlord|der Vermieter;tenant|der Mieter;rent|die Miete;deposit|die Kaution;heating|die Heizung;electricity|der Strom;repair|die Reparatur;neighbourhood|die Nachbarschaft;to move house|umziehen;to rent|mieten"),
  ...rows("Essen & Trinken", "recipe|das Rezept;ingredient|die Zutat;vegetarian|vegetarisch;allergy|die Allergie;reservation|reservieren;bill|die Rechnung;tip|das Trinkgeld;delicious|lecker;spicy|scharf;to order|bestellen"),
  ...rows("Einkaufen & Kleidung", "receipt|der Kassenbon;exchange|der Umtausch;discount|der Rabatt;warranty|die Garantie;fitting room|die Umkleidekabine;online shop|der Onlineshop;delivery|die Lieferung;to return|zurückgeben;to complain|reklamieren;to compare|vergleichen"),
  ...rows("Schule & Lernen", "presentation|die Präsentation;grade|die Note;certificate|das Zeugnis;application|die Anmeldung;deadline|der Termin;group work|die Gruppenarbeit;to practise|üben;to prepare|vorbereiten;to improve|verbessern;to pass an exam|eine Prüfung bestehen"),
  ...rows("Arbeit & Beruf", "application|die Bewerbung;interview|das Vorstellungsgespräch;colleague|der Kollege;employer|der Arbeitgeber;employee|der Arbeitnehmer;salary|das Gehalt;part-time|Teilzeit;full-time|Vollzeit;internship|das Praktikum;to apply|sich bewerben"),
  ...rows("Stadt & Verkehr", "town hall|das Rathaus;citizens' office|das Bürgeramt;post office|die Post;insurance|die Versicherung;bank account|das Bankkonto;appointment|der Termin;delay|die Verspätung;traffic jam|der Stau;route|die Strecke;to register|sich anmelden"),
  ...rows("Reisen & Unterkunft", "travel insurance|die Reiseversicherung;single room|das Einzelzimmer;double room|das Doppelzimmer;reception|die Rezeption;city tour|die Stadtführung;map|der Stadtplan;foreign country|das Ausland;experience|die Erfahrung;to cancel|stornieren;to book|buchen"),
  ...rows("Gesundheit & Körper", "appointment with a doctor|der Arzttermin;health insurance|die Krankenversicherung;prescription|das Rezept;medical practice|die Arztpraxis;injury|die Verletzung;emergency|der Notfall;stress|der Stress;relaxed|entspannt;to examine|untersuchen;to rest|sich ausruhen"),
  ...rows("Freizeit, Kultur & Sport", "exhibition|die Ausstellung;concert|das Konzert;theatre|das Theater;membership|die Mitgliedschaft;training|das Training;hobby|das Hobby;photography|die Fotografie;to participate|teilnehmen;to win|gewinnen;to enjoy|genießen"),
  ...rows("Natur, Wetter & Umwelt", "environment|die Umwelt;recycling|das Recycling;rubbish|der Müll;climate|das Klima;temperature|die Temperatur;weather forecast|die Wettervorhersage;flood|die Überschwemmung;drought|die Trockenheit;to save energy|Energie sparen;to protect|schützen"),
];

export const ESSENTIAL_B1 = [
  ...rows("Grundlagen & Kommunikation", "claim|die Behauptung;counterargument|das Gegenargument;conclusion|die Schlussfolgerung;source|die Quelle;reliability|die Zuverlässigkeit;to justify|begründen;to assess|einschätzen;to convince|überzeugen;to summarize|zusammenfassen;to point out|hinweisen"),
  ...rows("Familie & Menschen", "equality|die Gleichberechtigung;discrimination|die Diskriminierung;responsibility|die Verantwortung;support|die Unterstützung;conflict|der Konflikt;compromise|der Kompromiss;integration|die Integration;belonging|die Zugehörigkeit;to respect|respektieren;to support|unterstützen"),
  ...rows("Zuhause & Wohnen", "housing shortage|der Wohnungsmangel;construction site|die Baustelle;renovation|die Renovierung;noise|der Lärm;notice period|die Kündigungsfrist;property|das Eigentum;housing policy|die Wohnungspolitik;to renovate|renovieren;to complain|sich beschweren;to share|teilen"),
  ...rows("Arbeit & Beruf", "unemployment|die Arbeitslosigkeit;qualification|die Qualifikation;career|die Karriere;working conditions|die Arbeitsbedingungen;trade union|die Gewerkschaft;employment contract|der Arbeitsvertrag;workload|die Arbeitsbelastung;to negotiate|verhandeln;to resign|kündigen;to employ|einstellen"),
  ...rows("Stadt & Verkehr", "public transport|der öffentliche Nahverkehr;infrastructure|die Infrastruktur;mobility|die Mobilität;pedestrian zone|die Fußgängerzone;accessibility|die Barrierefreiheit;emission|die Emission;traffic policy|die Verkehrspolitik;to reduce|reduzieren;to avoid|vermeiden;to expand|ausbauen"),
  ...rows("Gesundheit & Körper", "mental health|die psychische Gesundheit;therapy|die Therapie;prevention|die Vorsorge;care|die Pflege;addiction|die Sucht;well-being|das Wohlbefinden;health system|das Gesundheitssystem;to treat|behandeln;to recover|sich erholen;to prevent|vorbeugen"),
  ...rows("Natur, Wetter & Umwelt", "climate change|der Klimawandel;sustainability|die Nachhaltigkeit;resource|der Rohstoff;renewable energy|die erneuerbare Energie;carbon footprint|der CO₂-Fußabdruck;environmental protection|der Umweltschutz;waste separation|die Mülltrennung;to recycle|recyceln;to consume|verbrauchen;to pollute|verschmutzen"),
  ...rows("Medien & Digitales", "data protection|der Datenschutz;privacy|die Privatsphäre;fake news|die Falschmeldung;algorithm|der Algorithmus;media literacy|die Medienkompetenz;source check|die Quellenprüfung;online platform|die Onlineplattform;to publish|veröffentlichen;to research|recherchieren;to share online|online teilen"),
  ...rows("Dienstleistungen & Behörden", "state|der Staat;democracy|die Demokratie;law|das Gesetz;right|das Recht;duty|die Pflicht;authority|die Behörde;residence permit|die Aufenthaltserlaubnis;citizenship|die Staatsbürgerschaft;to apply for|beantragen;to appeal|Widerspruch einlegen"),
  ...rows("Adjektive & Adverbien", "fair|gerecht;unfair|ungerecht;independent|unabhängig;relevant|relevant;reliable|zuverlässig;sustainable|nachhaltig;critical|kritisch;objective|sachlich;currently|derzeit;therefore|deshalb"),
];

// Compact coverage for contextual forms surfaced by the 72 integrated course
// chapters. Keep this separate from course-data.ts so the Vocabulary route does
// not pull stories, grammar lessons, or exercises into its client bundle.
// Proper names are intentionally excluded: recognizing a person or place is not
// a transferable vocabulary skill.
export const COURSE_COVERAGE_A1 = [
  ...rows("Grundlagen & Kommunikation", "good morning|Guten Morgen;you (informal singular)|du;each / every|jede;each / everyone|jedem;but rather|sondern;oneself / even|selbst;several|mehrere;lastly|zuletzt"),
  ...rows("Familie & Menschen", "names|Namen;female partner|Partnerin;customers|Kunden"),
  ...rows("Zuhause & Wohnen", "room|Raum;chest of drawers|Kommode"),
  ...rows("Essen & Trinken", "next table|Nachbartisch;plates|Teller;cups|Tassen;stalls|Ständen;groceries / food|Lebensmittel"),
  ...rows("Einkaufen & Kleidung", "clothing|Kleidung"),
  ...rows("Schule & Lernen", "language|die Sprache, die Sprachen;languages|Sprachen;world map|Weltkarte;board|Tafel;list|Liste;language course|Sprachkurs;main character|Hauptperson;text|Text;texts|Texte;unknown|unbekannte"),
  ...rows("Stadt & Verkehr", "seat / place|der Platz, die Plätze;ways / routes|Wege;plan / map|Plan;travel day|Reisetag;delayed|verspätete"),
  ...rows("Gesundheit & Körper", "hair|Haare;hand|Hand;throat / neck|Hals;body|Körper"),
  ...rows("Zeit, Zahlen & Mengen", "first / first of all|Zuerst;time of day|Uhrzeiten"),
  ...rows("Freizeit, Kultur & Sport", "rhythm|Rhythmus"),
  ...rows("Grundlagen & Kommunikation", "problem|Problem"),
  ...rows("Verben", "to ask|fragen;to introduce oneself|sich vorstellen;draws|zeichnet;to name|nennen;to lie / be located|liegen;to be missing|fehlen;ends|endet;cut|geschnitten;to mark|markieren;to do|tun;checked|geprüft"),
  ...rows("Adjektive & Adverbien", "different / differently|anders;full|vollen;beforehand|vorher"),
];

export const COURSE_COVERAGE_A2 = [
  ...rows("Grundlagen & Kommunikation", "everyone / each|jeder;this / these|diese;situation|Situation;group|Gruppe"),
  ...rows("Verben", "wrote|schrieb;become|geworden;knew|kannte;wanted|wollte;must|musst;stall / stood|stand;came|kam;began|begann;named / called|nannte;resulted in|ergab;spoke|sprach;to ask / questions|fragte;is / may be|sei"),
  ...rows("Adjektive & Adverbien", "far|weit;way / gone|weg;full|voll;difficult|schwierig;suitable|passende"),
];

export const COURSE_COVERAGE_B1 = [
  ...rows("Grundlagen & Kommunikation", "between|zwischen;the same thing|dasselbe;enough|genug;with one another|miteinander"),
  ...rows("Arbeit & Beruf", "challenge|Herausforderung;point of view|Standpunkte"),
  ...rows("Verben", "remained|blieb;went|ging;believed|glaubte;seemed|schienen;to ask / questions|Fragen;discussed|besprach;saw|sah;talked|redeten;difference|unterschieden;to become / will|werden;ends|endete;changed|verändert;to seem|wirken;should|sollen"),
  ...rows("Adjektive & Adverbien", "most important|wichtigsten;difficult|schwierige;quietly|leise;originally|ursprünglicher"),
  ...rows("Familie & Menschen", "group|Gruppen"),
];
