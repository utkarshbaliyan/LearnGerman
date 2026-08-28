import { A1_STORIES, GLOSSARY } from "@/app/curriculum/a1";

export const VOCABULARY_CATEGORIES = [
  "Grundlagen",
  "Familie & Menschen",
  "Zuhause & Zimmer",
  "Essen & Trinken",
  "Einkaufen & Kleidung",
  "Schule & Arbeit",
  "Stadt & Verkehr",
  "Gesundheit & Körper",
  "Freizeit & Natur",
  "Zeit & Zahlen",
  "Verben",
  "Adjektive & Adverbien",
] as const;

export type VocabularyCategory = (typeof VOCABULARY_CATEGORIES)[number];

export type VocabularyWord = {
  id: string;
  english: string;
  german: string;
  category: VocabularyCategory;
};

const FUNCTION_WORDS = new Set([
  "aber", "alle", "als", "am", "an", "auch", "auf", "aus", "bei", "beide", "beim", "bis", "da", "dabei",
  "danach", "danke", "das", "dein", "deine", "dem", "den", "denn", "der", "deshalb", "dich", "die", "du",
  "durch", "ein", "eine", "einem", "einen", "einer", "er", "es", "etwas", "für", "gegen", "hallo", "heute",
  "hier", "hinter", "ich", "ihr", "ihre", "ihm", "ihnen", "im", "immer", "in", "ins", "ja", "jede", "jeden",
  "jetzt", "kein", "keine", "keinen", "man", "mein", "meine", "mit", "nach", "neben", "nein", "nicht", "nichts",
  "noch", "nur", "oben", "oder", "oft", "ohne", "per", "seit", "sich", "sie", "so", "über", "um", "und",
  "unser", "unsere", "unter", "viel", "viele", "von", "vor", "was", "welche", "wenn", "wer", "wie", "wieder",
  "wir", "wo", "woher", "zu", "zum", "zur", "zurück", "zusammen",
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
  abend: "der", adresse: "die", arbeit: "die", arzt: "der", ausweis: "der", bahnhof: "der", balkon: "der", bank: "die",
  bäckerei: "die", bäcker: "der", bad: "das", bett: "das", brief: "der", briefkasten: "der", briefmarke: "die",
  brille: "die", brot: "das", brötchen: "das", bruder: "der", buch: "das", büro: "das", bus: "der", café: "das",
  chef: "der", computer: "der", fenster: "das", film: "der", flasche: "die", fleisch: "das", foto: "das", freund: "der",
  freundin: "die", frühstück: "das", geld: "das", gemüse: "das", geschäft: "das", geschenk: "das", glas: "das",
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

const THEME_HINTS: Array<[VocabularyCategory, string[]]> = [
  ["Familie & Menschen", ["family", "friend", "mother", "father", "brother", "sister", "daughter", "son", "child", "parent", "person", "people", "neighbor", "aunt", "birthday", "name", "relationship"]],
  ["Zuhause & Zimmer", ["room", "house", "home", "apartment", "furniture", "kitchen", "bathroom", "bed", "chair", "table", "door", "window", "shelf", "stove", "fridge", "balcony", "rent"]],
  ["Essen & Trinken", ["food", "drink", "breakfast", "bread", "fruit", "vegetable", "milk", "coffee", "tea", "water", "restaurant", "café", "cake", "soup", "salad", "meat", "egg", "cheese", "juice", "waiter"]],
  ["Einkaufen & Kleidung", ["shop", "market", "money", "price", "cash", "receipt", "checkout", "clothes", "shirt", "jacket", "coat", "shoe", "dress", "sales", "gift", "label"]],
  ["Schule & Arbeit", ["school", "work", "office", "course", "teacher", "student", "book", "paper", "form", "homework", "university", "language", "word", "text", "profession", "employee", "colleague", "computer", "document"]],
  ["Stadt & Verkehr", ["station", "bus", "train", "tram", "street", "city", "ticket", "journey", "travel", "hotel", "museum", "police", "post", "bank", "map", "airport", "platform", "departure", "arrival", "traffic"]],
  ["Gesundheit & Körper", ["doctor", "hospital", "health", "head", "arm", "hand", "foot", "eye", "ear", "nose", "mouth", "fever", "pain", "headache", "medicine", "symptom", "glasses"]],
  ["Freizeit & Natur", ["sport", "music", "film", "concert", "photo", "game", "football", "park", "flower", "plant", "tree", "animal", "dog", "rain", "sun", "wind", "weather", "sea", "holiday", "party"]],
  ["Zeit & Zahlen", ["time", "day", "week", "month", "year", "morning", "afternoon", "evening", "night", "minute", "hour", "calendar", "number", "date", "summer", "winter", "spring", "monday", "tuesday", "friday", "saturday", "sunday"]],
];

const tokenPattern = /[A-Za-zÄÖÜäöüß]+/gu;
const articleVotes = new Map<string, Record<string, number>>();
const capitalizedWords = new Set<string>();

for (const story of A1_STORIES) {
  const tokens = story.text.match(tokenPattern) ?? [];
  tokens.forEach((token, index) => {
    const word = token.toLocaleLowerCase("de");
    if (/^[A-ZÄÖÜ]/.test(token)) capitalizedWords.add(word);
    const previous = tokens[index - 1]?.toLocaleLowerCase("de");
    const article = previous === "der" || previous === "die" || previous === "das"
      ? previous
      : previous === "eine" || previous === "einer" ? "die"
        : previous === "einen" ? "der" : undefined;
    if (!article) return;
    const votes = articleVotes.get(word) ?? { der: 0, die: 0, das: 0 };
    votes[article] += 1;
    articleVotes.set(word, votes);
  });
}

function articleFor(word: string, english: string) {
  if (ARTICLE_OVERRIDES[word]) return ARTICLE_OVERRIDES[word];
  if (/s(?:\s|$)/.test(english) && /(e|en|er)$/.test(word)) return "die";
  if (/(ung|heit|keit|schaft|ion|tät|ei|ik|ur)$/.test(word)) return "die";
  if (/(chen|lein|ment|um)$/.test(word)) return "das";
  const votes = articleVotes.get(word);
  if (votes) return Object.entries(votes).sort(([, a], [, b]) => b - a)[0][0] as "der" | "die" | "das";
  if (/(er|ling|ismus)$/.test(word)) return "der";
  return "das";
}

function categoryFor(word: string, english: string, isVerb: boolean, isAdjective: boolean): VocabularyCategory {
  if (isVerb) return "Verben";
  if (isAdjective) return "Adjektive & Adverbien";
  if (NUMBER_AND_TIME.has(word)) return "Zeit & Zahlen";
  const normalized = english.toLocaleLowerCase("en");
  return THEME_HINTS.find(([, hints]) => hints.some((hint) => normalized.includes(hint)))?.[0] ?? "Grundlagen";
}

function titleCase(word: string) {
  return word.charAt(0).toLocaleUpperCase("de") + word.slice(1);
}

function buildVocabulary(): VocabularyWord[] {
  const seenEnglish = new Set<string>();
  const words: Omit<VocabularyWord, "id">[] = [];

  for (const [rawWord, english] of Object.entries(GLOSSARY)) {
    const word = rawWord.toLocaleLowerCase("de");
    const normalizedEnglish = english.toLocaleLowerCase("en").trim();
    if (!word || PROPER_WORDS.has(word) || seenEnglish.has(normalizedEnglish)) continue;

    const firstEnglish = normalizedEnglish.split(/\s+/)[0].replace(/[^a-z]/g, "");
    const isVerb = normalizedEnglish.startsWith("to ") || VERB_FIRST_WORDS.has(firstEnglish);
    const isAdjective = ADJECTIVES.has(word) || /^(old|new|good|bad|big|small|long|short|beautiful|friendly|happy|tired|cold|warm|red|blue|green|black|white|yellow|easy|difficult|fast|slow|late|early|correct|different)(?:\s|\/|$)/.test(normalizedEnglish);
    const isNoun = !isVerb && !isAdjective && !FUNCTION_WORDS.has(word) && !NUMBER_AND_TIME.has(word) && capitalizedWords.has(word);
    const german = isNoun ? `${articleFor(word, normalizedEnglish)} ${titleCase(word)}` : word;

    seenEnglish.add(normalizedEnglish);
    words.push({ german, english, category: categoryFor(word, normalizedEnglish, isVerb, isAdjective) });
    if (words.length === 800) break;
  }

  if (words.length !== 800) throw new Error(`A1-Wortschatz: ${words.length} statt 800 Einträge.`);
  return words.map((word, index) => ({ ...word, id: `a1-${String(index + 1).padStart(3, "0")}` }));
}

export const A1_VOCABULARY = buildVocabulary();
