import { GLOSSARY } from "@/app/curriculum/a1";
import { A2_VOCABULARY } from "@/app/vocabulary/a2-data";
import { buildB1Vocabulary } from "@/app/vocabulary/b1-data";
import { ESSENTIAL_A1, ESSENTIAL_A2, ESSENTIAL_B1, type EssentialVocabulary } from "@/app/vocabulary/essential-data";

export const VOCABULARY_CATEGORIES = [
  "Grundlagen & Kommunikation",
  "Familie & Menschen",
  "Zuhause & Wohnen",
  "Essen & Trinken",
  "Einkaufen & Kleidung",
  "Schule & Lernen",
  "Arbeit & Beruf",
  "Stadt & Verkehr",
  "Reisen & Unterkunft",
  "Gesundheit & Körper",
  "Freizeit, Kultur & Sport",
  "Natur, Wetter & Umwelt",
  "Zeit, Zahlen & Mengen",
  "Medien & Digitales",
  "Dienstleistungen & Behörden",
  "Verben",
  "Adjektive & Adverbien",
] as const;

export type VocabularyCategory = (typeof VOCABULARY_CATEGORIES)[number];

export type VocabularyWord = {
  id: string;
  english: string;
  german: string;
  category: VocabularyCategory;
  level: "A1" | "A2" | "B1";
};

const FUNCTION_WORDS = new Set([
  "aber", "alle", "als", "am", "an", "auch", "auf", "aus", "bei", "beide", "beim", "bis", "da", "dabei",
  "danach", "danke", "das", "dein", "deine", "dem", "den", "denn", "der", "deshalb", "dich", "die", "du",
  "durch", "ein", "eine", "einem", "einen", "einer", "er", "es", "etwas", "für", "gegen", "hallo", "heute",
  "hier", "hinter", "ich", "ihr", "ihre", "ihm", "ihnen", "im", "immer", "in", "ins", "ja", "jede", "jeden",
  "jetzt", "kein", "keine", "keinen", "man", "mein", "meine", "mit", "nach", "neben", "nein", "nicht", "nichts",
  "noch", "nur", "oben", "oder", "oft", "ohne", "per", "seit", "sich", "sie", "so", "über", "um", "und",
  "unser", "unsere", "unter", "viel", "viele", "von", "vor", "was", "welche", "wenn", "wer", "wie", "wieder",
  "während", "wir", "wo", "woher", "zu", "zum", "zur", "zurück", "zusammen",
]);

const PROPER_WORDS = new Set([
  "ana", "anna", "ava", "ben", "berlin", "bonn", "bruno", "can", "david", "ela", "ella", "elena", "elias",
  "emil", "emma", "eva", "felix", "hamburg", "ida", "jan", "jana", "japan", "jonas", "julia", "karim", "ken",
  "kim", "köln", "laura", "lea", "lena", "leo", "lina", "luca", "luis", "mara", "max", "mia", "mila", "mina",
  "nina", "niko", "nila", "nora", "omar", "paul", "paula", "polen", "rania", "ravi", "salim", "sara", "sofia",
  "spanien", "tarek", "tara", "tim", "tom", "wien",
]);

const ADJECTIVES = new Set([
  "allein", "alt", "ander", "andere", "anstrengend", "aufmerksam", "bald", "bekannt", "bereit", "besser", "billig",
  "blau", "blond", "braun", "breit", "bunt", "deutlich", "direkt", "dunkel", "echt", "einfach", "eng", "erreichbar",
  "falsch", "fertig", "frei", "fremd", "freundlich", "frisch", "froh", "früh", "gelb", "gemütlich", "genau",
  "geschlossen", "glücklich", "grau", "groß", "grün", "gut", "heiß", "hell", "interessant", "kalt", "kaputt",
  "klein", "krank", "kurz", "kühl", "lang", "langsam", "langweilig", "laut", "leicht", "lieb", "lustig", "müde",
  "nett", "neu", "offen", "pünktlich", "richtig", "rot", "ruhig", "rund", "schnell", "schön", "schwarz", "schwer",
  "sonnig", "spät", "stark", "süß", "teuer", "toll", "trocken", "überrascht", "verschieden", "warm", "weiß",
  "wichtig", "zufrieden", "draußen", "früher", "gerade", "geradeaus", "gern", "gestern", "gleich", "leider",
  "links", "nebenan", "rechts", "sofort", "später", "trotzdem", "unterwegs", "vorbei", "vorne",
]);

const NUMBER_AND_TIME = new Set([
  "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
  "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig", "dreißig",
  "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig", "hundert", "tausend", "montag", "dienstag",
  "mittwoch", "donnerstag", "freitag", "samstag", "sonntag", "januar", "februar", "märz", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "dezember", "heute", "gestern", "morgen",
]);

const VERB_FIRST_WORDS = new Set([
  "am", "answers", "are", "asks", "bakes", "becomes", "begins", "borrows", "brings", "buys", "calls", "can",
  "carries", "changes", "chooses", "closes", "comes", "cooks", "costs", "cuts", "dances", "does", "drinks", "drives",
  "eats", "ends", "expects", "explains", "fits", "follows", "gets", "gives", "greets", "had", "hangs", "has", "hears",
  "helps", "holds", "hurts", "invites", "is", "laughs", "learns", "lies", "likes", "listens", "lives", "looks", "makes",
  "marks", "meets", "moves", "must", "needs", "notices", "opens", "orders", "pays", "plans", "plays", "prints", "reads",
  "receives", "recommends", "remembers", "rings", "runs", "says", "searches", "sees", "sends", "sets", "shines", "shows",
  "sings", "sits", "sleeps", "smiles", "speaks", "stands", "starts", "stays", "stops", "studies", "takes", "thanks",
  "throws", "travels", "tries", "understands", "uses", "waits", "walks", "wants", "was", "wears", "wins", "works", "writes",
]);

const ARTICLE_OVERRIDES: Record<string, "der" | "die" | "das"> = {
  abend: "der", abfahrt: "die", adresse: "die", anfang: "der", ankunft: "die", arbeit: "die", arbeitsplatz: "der", arzt: "der", ausweis: "der", bahnhof: "der", balkon: "der", bank: "die",
  bäckerei: "die", bäcker: "der", bad: "das", bett: "das", brief: "der", briefkasten: "der", briefmarke: "die",
  brille: "die", brot: "das", brötchen: "das", bruder: "der", buch: "das", büro: "das", bus: "der", café: "das",
  chef: "der", computer: "der", fenster: "das", film: "der", flasche: "die", fleisch: "das", foto: "das", freund: "der",
  fieber: "das", form: "die", freundin: "die", frühstück: "das", geld: "das", geldautomat: "der", gemüse: "das", geschäft: "das", geschenk: "das", gitarre: "die", glas: "das",
  haltestelle: "die", handy: "das", haus: "das", hemd: "das", herd: "der", hotel: "das", hund: "der", jacke: "die",
  jahr: "das", junge: "der", karte: "die", kasse: "die", kellner: "der", kellnerin: "die", kind: "das", kirche: "die",
  kopf: "der", kurs: "der", kuchen: "der", küche: "die", kühlschrank: "der", laden: "der", lampe: "die", lehrer: "der",
  lehrerin: "die", mantel: "der", markt: "der", meer: "das", milch: "die", minute: "die", möbel: "die", museum: "das",
  mutter: "die", mütze: "die", nachbarin: "die", nachmittag: "der", nachricht: "die", name: "der", nummer: "die",
  papier: "das", park: "der", pause: "die", person: "die", polizei: "die", post: "die", preis: "der", regen: "der",
  restaurant: "das", salat: "der", schinken: "der", schlüssel: "der", schwester: "die", seife: "die", sofa: "das",
  sommer: "der", sonne: "die", sport: "der", stadt: "die", straße: "die", straßenbahn: "die", stuhl: "der", suppe: "die",
  tag: "der", tante: "die", tee: "der", termin: "der", tisch: "der", tochter: "die", tür: "die", uhr: "die",
  universität: "die", vater: "der", wasser: "das", wind: "der", winter: "der", woche: "die", wochenende: "das",
  wohnung: "die", wohnzimmer: "das", wort: "das", zeit: "die", zettel: "der", zimmer: "das",
};

const ADDITIONAL_NOUN_ARTICLES: Record<string, "der" | "die" | "das"> = {
  ablauf: "der", abstand: "der", aktivitäten: "die", alltag: "der", alltagssituation: "die", alter: "das",
  anmeldung: "die", anrede: "die", anruf: "der", antwort: "die", anzeige: "die", apotheke: "die",
  arbeitsplatz: "der", arbeitstag: "der", aufgabe: "die", augen: "die", ausdrücke: "die", ausflüge: "die",
  auswahl: "die", bahn: "die", bedeutung: "die", bedeutungen: "die", beispielsätzen: "die", beruf: "der",
  beschwerden: "die", bewegung: "die", beziehung: "die", bibliothek: "die", bild: "das", birne: "die",
  birnen: "die", blatt: "das", blumen: "die", brüder: "die", bücher: "die", charakter: "der",
  cousinen: "die", datei: "die", details: "die", dinge: "die", dokument: "das", dokumente: "die",
  drucker: "der", durchsage: "die", eier: "die", einkauf: "der", einkäufe: "die", eltern: "die",
  entschuldigung: "die", erfolg: "der", ergebnis: "das", erklärung: "die", erlebnis: "das", erlebnisse: "die",
  ersatz: "der", erzählung: "die", etikett: "das", euro: "der", fahrer: "der", fahrkarte: "die",
  familie: "die", familienfoto: "das", farbe: "die", farben: "die", fehler: "der", feierabend: "der",
  ferienhaus: "das", fest: "das", filmabend: "der", flohmarkt: "der", flur: "der", form: "die",
  formulare: "die", foto: "das", frau: "die", freizeit: "die", freude: "die", freunde: "die",
  friseur: "der", frühstückszeit: "die", fuß: "der", fußball: "der", garten: "der", geburtstag: "der",
  gefühl: "das", gegenstand: "der", geschäfte: "die", geschichte: "die", geschichten: "die",
  gesellschaft: "die", gesicht: "das", gespräch: "das", gespräche: "die", gitarre: "die", gleis: "das",
  grad: "der", grüße: "die", gäste: "die", hausaufgabe: "die", hilfe: "die", himmel: "der",
  jahre: "die", karotten: "die", kinder: "die", kindergarten: "der", kollegen: "die", kollegin: "die",
  kopfschmerzen: "die", liebe: "die", mal: "das", marktplatz: "der", menschen: "die", mitarbeiter: "der",
  mitte: "die", minuten: "die", musik: "die", oma: "die", orangensaft: "der", polizist: "der",
  postkarte: "die", regal: "das", regenschirm: "der", reise: "die", socke: "die", steine: "die",
  student: "der", studentin: "die", telefonnummer: "die", termine: "die", tomaten: "die", tourist: "der",
  treppenhaus: "das", tor: "das", umschlag: "der", verkäufer: "der", verkäuferin: "die", wörter: "die",
};

const NOUN_ARTICLES = { ...ARTICLE_OVERRIDES, ...ADDITIONAL_NOUN_ARTICLES };
const NOUN_DISPLAY_OVERRIDES: Record<string, string> = {
  beispielsätzen: "Beispielsätze",
};

const THEME_HINTS: Array<[VocabularyCategory, string[]]> = [
  ["Familie & Menschen", ["family", "friend", "mother", "father", "brother", "sister", "daughter", "son", "child", "parent", "person", "people", "neighbor", "aunt", "birthday", "name", "relationship"]],
  ["Zuhause & Wohnen", ["room", "house", "home", "apartment", "furniture", "kitchen", "bathroom", "bed", "chair", "table", "door", "window", "shelf", "stove", "fridge", "balcony", "rent"]],
  ["Essen & Trinken", ["food", "drink", "breakfast", "bread", "fruit", "vegetable", "milk", "coffee", "tea", "water", "restaurant", "café", "cake", "soup", "salad", "meat", "egg", "cheese", "juice", "waiter"]],
  ["Einkaufen & Kleidung", ["shop", "market", "money", "price", "cash", "receipt", "checkout", "clothes", "shirt", "jacket", "coat", "shoe", "dress", "sales", "gift", "label"]],
  ["Schule & Lernen", ["school", "course", "teacher", "student", "book", "paper", "form", "homework", "university", "language", "word", "text", "lesson", "class"]],
  ["Arbeit & Beruf", ["work", "office", "profession", "employee", "colleague", "job", "company", "boss"]],
  ["Reisen & Unterkunft", ["journey", "travel", "hotel", "airport", "holiday", "suitcase", "luggage"]],
  ["Stadt & Verkehr", ["station", "bus", "train", "tram", "street", "city", "ticket", "museum", "police", "post", "bank", "map", "platform", "departure", "arrival", "traffic"]],
  ["Gesundheit & Körper", ["doctor", "hospital", "health", "head", "arm", "hand", "foot", "eye", "ear", "nose", "mouth", "fever", "pain", "headache", "medicine", "symptom", "glasses"]],
  ["Freizeit, Kultur & Sport", ["sport", "music", "film", "concert", "photo", "game", "football", "party", "museum", "theater"]],
  ["Natur, Wetter & Umwelt", ["park", "flower", "plant", "tree", "animal", "dog", "rain", "sun", "wind", "weather", "sea", "forest"]],
  ["Zeit, Zahlen & Mengen", ["time", "day", "week", "month", "year", "morning", "afternoon", "evening", "night", "minute", "hour", "calendar", "number", "date", "summer", "winter", "spring", "monday", "tuesday", "friday", "saturday", "sunday"]],
  ["Medien & Digitales", ["computer", "internet", "phone", "message", "email", "website"]],
  ["Dienstleistungen & Behörden", ["authority", "insurance", "service", "official", "passport"]],
];

function categoryFor(word: string, english: string, isVerb: boolean, isAdjective: boolean): VocabularyCategory {
  if (isVerb) return "Verben";
  if (isAdjective) return "Adjektive & Adverbien";
  if (NUMBER_AND_TIME.has(word)) return "Zeit, Zahlen & Mengen";
  const normalized = english.toLocaleLowerCase("en");
  return THEME_HINTS.find(([, hints]) => hints.some((hint) => normalized.includes(hint)))?.[0] ?? "Grundlagen & Kommunikation";
}

function titleCase(word: string) {
  return word.charAt(0).toLocaleUpperCase("de") + word.slice(1);
}

function buildVocabulary(): VocabularyWord[] {
  const seenEnglish = new Set<string>();
  const words: Omit<VocabularyWord, "id" | "level">[] = [];

  for (const [rawWord, english] of Object.entries(GLOSSARY)) {
    const word = rawWord.toLocaleLowerCase("de");
    const normalizedEnglish = english.toLocaleLowerCase("en").trim();
    if (!word || PROPER_WORDS.has(word) || seenEnglish.has(normalizedEnglish)) continue;

    const firstEnglish = normalizedEnglish.split(/\s+/)[0].replace(/[^a-z]/g, "");
    const isVerb = normalizedEnglish.startsWith("to ") || VERB_FIRST_WORDS.has(firstEnglish);
    const isAdjective = ADJECTIVES.has(word) || /^(old|new|good|bad|big|small|long|short|beautiful|friendly|happy|tired|cold|warm|red|blue|green|black|white|yellow|easy|difficult|fast|slow|late|early|correct|different)(?:\s|\/|$)/.test(normalizedEnglish);
    const isNoun = !isVerb && !isAdjective && !FUNCTION_WORDS.has(word) && !NUMBER_AND_TIME.has(word) && word in NOUN_ARTICLES;
    const german = isNoun ? `${NOUN_ARTICLES[word]} ${NOUN_DISPLAY_OVERRIDES[word] ?? titleCase(word)}` : word;

    seenEnglish.add(normalizedEnglish);
    words.push({ german, english, category: categoryFor(word, normalizedEnglish, isVerb, isAdjective) });
    if (words.length === 800) break;
  }

  if (words.length !== 800) throw new Error(`A1-Wortschatz: ${words.length} statt 800 Einträge.`);
  return words.map((word, index) => ({ ...word, id: `a1-${String(index + 1).padStart(3, "0")}`, level: "A1" }));
}

function addEssentialVocabulary(
  existing: VocabularyWord[],
  additions: EssentialVocabulary[],
  level: VocabularyWord["level"],
  idPrefix: string,
  earlier: VocabularyWord[] = [],
): VocabularyWord[] {
  const german = new Set([...earlier, ...existing].map((word) => word.german.toLocaleLowerCase("de")));
  const english = new Set([...earlier, ...existing].map((word) => word.english.toLocaleLowerCase("en")));
  const unique = additions.filter((word) => {
    const germanKey = word.german.toLocaleLowerCase("de");
    const englishKey = word.english.toLocaleLowerCase("en");
    if (german.has(germanKey) || english.has(englishKey)) return false;
    german.add(germanKey);
    english.add(englishKey);
    return true;
  });
  return [...existing, ...unique.map((word, index) => ({
    ...word,
    id: `${idPrefix}-${String(existing.length + index + 1).padStart(4, "0")}`,
    level,
  }))];
}

export const A1_VOCABULARY = addEssentialVocabulary(buildVocabulary(), ESSENTIAL_A1, "A1", "a1");
export const EXTENDED_A2_VOCABULARY = addEssentialVocabulary(A2_VOCABULARY, ESSENTIAL_A2, "A2", "a2", A1_VOCABULARY);
export const B1_VOCABULARY = addEssentialVocabulary(
  buildB1Vocabulary([...A1_VOCABULARY, ...EXTENDED_A2_VOCABULARY]),
  ESSENTIAL_B1,
  "B1",
  "b1",
  [...A1_VOCABULARY, ...EXTENDED_A2_VOCABULARY],
);
export { EXTENDED_A2_VOCABULARY as A2_VOCABULARY };
export const ALL_VOCABULARY = [...A1_VOCABULARY, ...EXTENDED_A2_VOCABULARY, ...B1_VOCABULARY];
export const VOCABULARY_LEVEL_COUNTS = {
  A1: A1_VOCABULARY.length,
  A2: EXTENDED_A2_VOCABULARY.length,
  B1: B1_VOCABULARY.length,
  all: ALL_VOCABULARY.length,
} as const;

const vocabularyIds = new Set(ALL_VOCABULARY.map((word) => word.id));

// The same German form can genuinely serve more than one learning card (for
// example, a noun and a fixed expression). Card IDs—not surface spelling—must
// be unique. Keep this guard lightweight because this module also runs in the
// browser when the vocabulary route opens.
if (ALL_VOCABULARY.length < 2500 || vocabularyIds.size !== ALL_VOCABULARY.length) {
  throw new Error("The A1–B1 vocabulary library must contain at least 2,500 uniquely identified learning cards.");
}

for (const category of VOCABULARY_CATEGORIES) {
  if (!ALL_VOCABULARY.some((word) => word.category === category)) {
    throw new Error(`Die Wortschatzkategorie ${category} ist leer.`);
  }
}
