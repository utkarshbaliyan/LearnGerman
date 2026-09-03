import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = process.env.TARTARUS_DATA_DIR;
const TARGET_COUNT = 2000;
const QUOTAS = { noun: 1000, verb: 500, adjective: 400, adverb: 100 };

if (!SOURCE_DIR) throw new Error("Set TARTARUS_DATA_DIR to the directory containing the four Tartarus B1 JSON files.");

const SOURCE_FILES = {
  noun: "german_noun_b1.json",
  verb: "german_verb_b1.json",
  adjective: "german_adjective_b1.json",
  adverb: "german_adverb_b1.json",
};

const TOKEN = /^[\p{L}][\p{L}’'\-]*$/u;
const NOUN = /^(der|die|das)\s+([\p{L}][\p{L}’'\-]*)(?:,.*)?$/u;
const VERB = /^(?:[\p{L}][\p{L}’'\-]*)(?:en|eln|ern)$/u;

const CATEGORY_HINTS = [
  ["Familie & Menschen", ["person", "people", "family", "child", "parent", "mother", "father", "friend", "woman", "man", "relationship", "marriage", "society"]],
  ["Zuhause & Wohnen", ["home", "house", "apartment", "room", "building", "furniture", "rent", "tenant", "garden", "kitchen", "bathroom"]],
  ["Essen & Trinken", ["food", "drink", "meal", "bread", "meat", "fruit", "vegetable", "restaurant", "taste", "dish", "ingredient"]],
  ["Einkaufen & Kleidung", ["shop", "store", "price", "sale", "customer", "product", "clothing", "shirt", "shoe", "dress", "payment", "delivery"]],
  ["Schule & Lernen", ["school", "student", "teacher", "lesson", "exam", "education", "study", "knowledge", "university", "book", "language"]],
  ["Arbeit & Beruf", ["work", "job", "company", "employee", "employer", "office", "career", "salary", "business", "profession", "industry"]],
  ["Stadt & Verkehr", ["city", "street", "road", "traffic", "train", "bus", "station", "vehicle", "transport", "bicycle", "car"]],
  ["Reisen & Unterkunft", ["travel", "trip", "journey", "hotel", "tourist", "holiday", "flight", "airport", "luggage", "accommodation"]],
  ["Gesundheit & Körper", ["health", "body", "doctor", "hospital", "disease", "pain", "medicine", "patient", "treatment", "blood"]],
  ["Freizeit, Kultur & Sport", ["sport", "game", "music", "film", "art", "theater", "museum", "hobby", "festival", "concert"]],
  ["Natur, Wetter & Umwelt", ["nature", "weather", "environment", "animal", "plant", "tree", "forest", "water", "climate", "earth", "river"]],
  ["Zeit, Zahlen & Mengen", ["time", "day", "week", "month", "year", "hour", "date", "amount", "number", "quantity", "period"]],
  ["Medien & Digitales", ["media", "computer", "internet", "website", "phone", "software", "data", "message", "television", "radio"]],
  ["Dienstleistungen & Behörden", ["government", "authority", "court", "law", "police", "insurance", "service", "tax", "office", "administration", "passport"]],
];

function lemmaKey(german) {
  return german.toLocaleLowerCase("de").replace(/^(?:der|die|das)\s+/, "").split(",")[0].trim();
}

function firstDefinition(definition) {
  return definition
    .split("\n")[0]
    .split(";")[0]
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .replace(/\s+/g, " ");
}

function categoryFor(kind, english) {
  if (kind === "verb") return "Verben";
  if (kind === "adjective" || kind === "adverb") return "Adjektive & Adverbien";
  const normalized = english.toLocaleLowerCase("en");
  return CATEGORY_HINTS.find(([, hints]) => hints.some((hint) => normalized.includes(hint)))?.[0]
    ?? "Grundlagen & Kommunikation";
}

function normalizeItem(kind, item) {
  const english = firstDefinition(item.definition ?? "");
  if (!english || english.length > 64 || /[.!?]$/.test(english)) return null;

  if (kind === "noun") {
    const match = item.word.match(NOUN);
    if (!match) return null;
    return { german: `${match[1]} ${match[2]}`, english, category: categoryFor(kind, english) };
  }

  const german = item.word.trim();
  if (!TOKEN.test(german)) return null;
  if (kind === "verb" && (!VERB.test(german) || !english.toLocaleLowerCase("en").startsWith("to "))) return null;
  return { german, english, category: categoryFor(kind, english) };
}

const vite = await createServer({
  root: ROOT,
  configFile: false,
  resolve: { alias: { "@": ROOT } },
  server: { middlewareMode: true },
  appType: "custom",
});
const { CORE_VOCABULARY } = await vite.ssrLoadModule("/app/vocabulary/data.ts");
await vite.close();

const seen = new Set(CORE_VOCABULARY.map((word) => lemmaKey(word.german)));
const selected = [];

for (const [kind, filename] of Object.entries(SOURCE_FILES)) {
  const source = JSON.parse(await readFile(path.join(SOURCE_DIR, filename), "utf8"));
  let accepted = 0;
  for (const item of source.items) {
    const word = normalizeItem(kind, item);
    if (!word) continue;
    const key = lemmaKey(word.german);
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(word);
    accepted += 1;
    if (accepted === QUOTAS[kind]) break;
  }
  if (accepted !== QUOTAS[kind]) throw new Error(`${kind}: found ${accepted}, need ${QUOTAS[kind]}`);
}

if (selected.length !== TARGET_COUNT) throw new Error(`Generated ${selected.length}, expected ${TARGET_COUNT}`);

const rows = selected.map(({ german, english, category }) => [german, english, category]);

const output = `import type { VocabularyCategory, VocabularyWord } from "@/app/vocabulary/data";\n\ntype LexiconRow = [german: string, english: string, category: VocabularyCategory];\n\n// Generated from the MIT-licensed Tartarus German B1 vocabulary corpus.\n// Only standalone dictionary headwords and their primary English definitions are retained.\n// See THIRD_PARTY_NOTICES.md and scripts/build-extended-vocabulary.mjs.\nconst EXTENDED_B1_ROWS: LexiconRow[] = ${JSON.stringify(rows, null, 2)};\n\nexport const EXTENDED_B1_LEXICON: VocabularyWord[] = EXTENDED_B1_ROWS.map(\n  ([german, english, category], index) => ({\n    id: \`lexicon-b1-\${String(index + 1).padStart(4, "0")}\`,\n    german,\n    english,\n    category,\n    level: "B1",\n  }),\n);\n`;
await writeFile(path.join(ROOT, "app/vocabulary/extended-data.ts"), output);
console.log(`Wrote ${rows.length} standalone B1 headwords.`);
