import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = process.env.TARTARUS_B2_DATA_DIR;
const SOURCE_COMMIT = "308e64a848f803379ecdbe9a17bf85745be5f85e";
const QUOTAS = { noun: 2050, verb: 700, adjective: 450, adverb: 100 };
const SOURCE_HASHES = {
  noun: "f9fdff9780c625d0b6b48ee5dc4fbd476817664baf5d83a75dafe965724473be",
  verb: "a89ebbd4d899384239685456b04ff3b2b08e531223ba1deda4dab25a1c302340",
  adjective: "611889bda117738902685b17acc867aabb8e3daee87ba0aa809ee4c4c79f2aa0",
  adverb: "38ce1546b04528cf8387b0be2a26af3b0c2311c651337203eec84e26eff0fbeb",
};
if (!SOURCE_DIR) throw new Error("Set TARTARUS_B2_DATA_DIR to the pinned Tartarus B2 source directory; see docs/B2_VOCABULARY.md.");
if ((await readFile(path.join(SOURCE_DIR, "source-commit.txt"), "utf8")).trim() !== SOURCE_COMMIT) {
  throw new Error("B2 source revision differs from the reviewed input.");
}

// Reject truncated forms, non-German padding, proper-name adjectives and slang.
const EXCLUDED = new Set(`Arsch Arschloch Ex OP Air Life Love Kid Line Point State Research Tech Take Valley Act CC Source Engineering Drive Change Face Reality Army Break Director Hack Ban Dream Cod Matter Mean Origin Record Unit Creek Member Defense Century Charity Gear Steel Table Yorker Thüringer Tiroler Multi Kärntner Magdeburger jährig nieder off fake premium äußer oberst saudi next cross random limited fehl geil verdammt sexy krass irre dämlich besoffen hetero Koks Depp Bastard Schiss Puff verkacken ficken scheißen verarschen pissen rum dran ehestmöglich weiters`.toLocaleLowerCase("de").split(/\s+/));
const OVERRIDES = {
  "die Verfügung": "disposal / availability",
  "der Betrieb": "operation / business",
  "der Ruf": "reputation / call",
  "die Droge": "drug (narcotic)",
  "das Jura": { german: "Jura", english: "law (field of study)" },
  "lauten": "to read / to be worded",
  "belegen": "to document / to occupy",
  "anlegen": "to invest / to create",
  "aussetzen": "to suspend / to expose",
  "vergreifen": { german: "sich vergreifen", english: "to choose wrongly / to go too far" },
  "fündig": "successful in finding something",
  "ausfindig": "located (in ausfindig machen)",
  "zustande": "into being (in zustande kommen)",
};
const TOPICS = [
  ["Familie & Menschen", /\b(family|parent|child|marriage|divorce|relationship|relative|refugee|society|social|friend|human|person|people|emotion|feeling|trust|grief|solidarity|tolerance)\b/i],
  ["Zuhause & Wohnen", /\b(home|house|housing|apartment|room|building|furniture|rent|tenant|garden|construction|household|property|estate|roof|wall|door)\b/i],
  ["Essen & Trinken", /\b(food|drink|meal|bread|meat|fruit|vegetable|restaurant|taste|dish|ingredient|diet|nutrition|cooking|kitchen|wine|beer)\b/i],
  ["Einkaufen & Kleidung", /\b(shop|store|price|sale|customer|product|clothing|shirt|shoe|dress|payment|delivery|purchase|retail|fashion|consumer|refund)\b/i],
  ["Schule & Lernen", /\b(school|student|teacher|lesson|exam|education|study|knowledge|university|book|language|research|science|theory|learning|academic|definition|scholar|thesis|analysis|method)\b/i],
  ["Arbeit & Beruf", /\b(work|job|company|employee|employer|office|career|salary|business|profession|industry|economy|economic|investment|finance|revenue|profit|management|production|corporation|employment|wage)\b/i],
  ["Stadt & Verkehr", /\b(city|street|road|traffic|train|bus|station|vehicle|transport|bicycle|car|railway|district|municipal|infrastructure)\b/i],
  ["Reisen & Unterkunft", /\b(travel|trip|journey|hotel|tourist|holiday|flight|airport|luggage|accommodation|tourism|tour|passport|destination)\b/i],
  ["Gesundheit & Körper", /\b(health|body|doctor|hospital|disease|pain|medicine|patient|treatment|blood|medical|illness|infection|therapy|surgery|muscle|nerve|organ|heart|lung|diagnosis)\b/i],
  ["Freizeit, Kultur & Sport", /\b(sport|game|music|film|art|theater|theatre|museum|hobby|festival|concert|cultural|culture|poem|novel|literature|painting|match|team|championship|orchestra|artist|entertainment)\b/i],
  ["Natur, Wetter & Umwelt", /\b(nature|weather|environment|animal|plant|tree|forest|water|climate|earth|river|energy|pollution|emission|species|ecology|agriculture|landscape|mineral|carbon|wind|soil|rain|sustainability)\b/i],
  ["Zeit, Zahlen & Mengen", /\b(time|day|week|month|year|hour|date|amount|number|quantity|period|century|duration|percentage|proportion|frequency|volume|ratio)\b/i],
  ["Medien & Digitales", /\b(media|computer|internet|website|phone|software|data|message|television|radio|network|digital|broadcast|press|journalism|editor|publication|technology|file|screen|program|communication)\b/i],
  ["Dienstleistungen & Behörden", /\b(government|authority|court|law|police|insurance|service|tax|administration|parliament|politic|political|election|vote|justice|crime|legal|regulation|democracy|citizen|constitution|rights|minister|chancellor|public|federal|union|war|peace|military)\b/i],
];

// German topic stems keep specialised nouns searchable even with short glosses.
const GERMAN_TOPICS = [
  ["Dienstleistungen & Behörden", /bundes|parlament|gericht|gesetz|behörd|wahl|polit|demokrat|minister|kanzler|verfassung|justiz|staats|strafe|straf|kriminal|polizei|militär|armee|herrsch|krieg|mord|täter|richter|anwalt|kommiss|präsiden|beamte|regierung|gefang|partei|diktat|republik|federation|föderation|bürgerrecht|mensch(en)?recht/i],
  ["Arbeit & Beruf", /arbeit|beruf|wirtschaft|finanz|unternehm|industrie|geschäft|kapital|invest|konkurs|insolvenz|handel|lohn|gehalt|umsatz|bilanz|aktionär|aktie|konzern|vertrieb|produkti|management|gewerbe|buchhalt|betrieb|wettbewerb/i],
  ["Gesundheit & Körper", /arzt|ärzt|medizin|krank|gesund|patient|therap|chirurg|knochen|muskel|lunge|herz|blut|nerv|schädel|droge|depress|infekt|hormon|symptom|diagnos|psychiatr|antibio|körper|autismus|demenz/i],
  ["Medien & Digitales", /internet|daten|digital|computer|software|hardware|grafik|elektron|bildschirm|netzwerk|funk|fernseh|radio|presse|journalis|redaktion|medien|medium|telekom|programmi|browser|portal|domain|server|speicher|stream|publishing|monitoring/i],
  ["Schule & Lernen", /schule|lehrer|bildung|forsch|wissenschaft|univers|studium|student|doktor|diplom|akadem|fakultät|seminar|prüfung|pädagog|lehr|sprach|grammat|vokabul|mathemat|physik|chemie|philosoph|formel/i],
  ["Natur, Wetter & Umwelt", /umwelt|natur|ökolog|klima|energie|landwirtschaft|wald|wald|wasser|boden|landschaft|gestein|mineral|kohlen|atom|galax|astronom|geolog|tier|vogel|pflanze|blüte|wetter|regen|windkraft|sonnen|schwefel|magnesium|lithium|gewässer/i],
  ["Freizeit, Kultur & Sport", /kultur|literatur|theater|schausp|musik|kunst|künstler|orchester|philharm|sport|spiel|lig(a|ist)|meisterschaft|olymp|fußball|turnier|film|roman|drehbuch|verlag|satire|gedicht|dichter|kompon|konzert|denkmal|tradition/i],
  ["Familie & Menschen", /famil|kind|eltern|mutter|vater|ehe|scheidung|verwandt|freund|mensch|migrant|migration|flüchtling|mitbürger|lieb|gefühl|mitgefühl|hass|trauer|psycholog|toleranz|solidar|gesellig|gemeinschaft/i],
  ["Zuhause & Wohnen", /wohn|haus|gebäude|möbel|bauvorhaben|baustelle|bauherr|miete|immobilie|dach|fassade|heizung|fenster|eigentum|siedlung/i],
  ["Stadt & Verkehr", /stadt|verkehr|fahrzeug|fahrbahn|autobahn|straße|bahnhof|eisenbahn|bahnlinie|straßen|stadtteil|landkreis|ortsteil|parkplatz|automobil|infrastruktur/i],
  ["Reisen & Unterkunft", /reise|touris|hotel|unterkunft|herberge|flug|luftfahrt|gepäck|urlaubs|camping/i],
  ["Einkaufen & Kleidung", /einkauf|verkauf|kleid|mode|textil|bekleidung|kleidung|umtausch|gutschein|rabatt|verbraucher|kunden/i],
  ["Essen & Trinken", /lebensmittel|nahrung|ernährung|koch|küche|gastronom|getränk|restaurant|speise|wein|brauerei|backerei/i],
  ["Zeit, Zahlen & Mengen", /zeit|jahr|monat|stunde|quantität|menge|anzahl|prozent|durchschnitt/i],
];

function senses(definition, limit) {
  const firstLine = definition.split("\n")[0].replace(/\s*\(separable prefix:[^)]*\)/g, "").trim();
  const parts = []; let start = 0; let depth = 0;
  for (let i = 0; i < firstLine.length; i++) {
    if (firstLine[i] === "(") depth++;
    if (firstLine[i] === ")") depth--;
    if (firstLine[i] === ";" && depth === 0) { parts.push(firstLine.slice(start, i)); start = i + 1; }
  }
  parts.push(firstLine.slice(start));
  return parts.slice(0, limit).map((part) => part.trim()).filter(Boolean).join(" / ").replace(/\s+/g, " ");
}

const vite = await createServer({ root: ROOT, configFile: false, resolve: { alias: { "@": ROOT } },
  optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null }, appType: "custom" });
const data = await vite.ssrLoadModule("/app/vocabulary/data.ts");
const { vocabularyHeadwordKey } = await vite.ssrLoadModule("/app/vocabulary/headword.ts");
await vite.close();
const seen = new Set((data.LEGACY_VOCABULARY ?? data.ALL_VOCABULARY).map((word) => vocabularyHeadwordKey(word.german)));
const rows = []; const sources = []; const rejected = {};
for (const [kind, quota] of Object.entries(QUOTAS)) {
  const name = `german_${kind}_b2.json`; const bytes = await readFile(path.join(SOURCE_DIR, name));
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== SOURCE_HASHES[kind]) throw new Error(`Source checksum mismatch: ${name}`);
  sources.push({ file: name, sha256 });
  const source = JSON.parse(bytes);
  if (source.metadata?.level !== "b2" || source.metadata?.language !== "german") throw new Error(`Wrong source: ${name}`);
  let accepted = 0; let skipped = 0;
  for (const item of source.items) {
    let german = item.word.split(",")[0].trim().normalize("NFC");
    // Different noun genders can have different senses; retain the primary one.
    let english = senses(item.definition ?? "", kind === "noun" ? 1 : 2);
    const override = OVERRIDES[german];
    if (typeof override === "string") english = override;
    else if (override) ({ german, english } = override);
    const bare = german.replace(/^(?:der|die|das|sich)\s+/, "");
    if (EXCLUDED.has(bare.toLocaleLowerCase("de")) || !/^[\p{L}][\p{L}’'\-]*$/u.test(bare)
      || (kind === "noun" && !/^(der|die|das)\s+[\p{Lu}]/u.test(german))
      || (kind !== "noun" && !/^[\p{Ll}]/u.test(bare))
      || (kind === "verb" && (!/(en|eln|ern)$/.test(bare) || !english.startsWith("to ")))
      || !english || english.length > 96 || /[.!?]$/.test(english)) { skipped++; continue; }
    const key = vocabularyHeadwordKey(german);
    if (seen.has(key)) { skipped++; continue; }
    seen.add(key);
    const category = kind === "verb" ? "Verben" : kind !== "noun" ? "Adjektive & Adverbien"
      : GERMAN_TOPICS.find(([, pattern]) => pattern.test(bare))?.[0]
        ?? TOPICS.find(([, pattern]) => pattern.test(english))?.[0] ?? "Grundlagen & Kommunikation";
    rows.push([german, english, category, kind]); accepted++;
    if (accepted === quota) break;
  }
  if (accepted !== quota) throw new Error(`${kind}: only ${accepted} usable new headwords; expected ${quota}`);
  rejected[kind] = skipped;
}
const header = `import type { VocabularyCategory, VocabularyWord, VocabularyWordClass } from "./data";\n\nimport { vocabularyHeadwordKey } from "./headword";\n\n// Adapted from Tartarus B2 at ${SOURCE_COMMIT} (MIT).\n// Editorial B2 placement, not independent CEFR certification.\n// Rebuild with scripts/build-b2-vocabulary.mjs; see THIRD_PARTY_NOTICES.md.\ntype Row = [german: string, english: string, category: VocabularyCategory, wordClass: VocabularyWordClass];\nconst ROWS: Row[] = [\n`;
const footer = `];\n\nexport const B2_LEXICON: VocabularyWord[] = ROWS.map(([german, english, category, wordClass]) => ({\n  id: \`lexicon-b2-\${vocabularyHeadwordKey(german)}\`, german, english, category, wordClass, level: "B2",\n}));\n`;
await writeFile(path.join(ROOT, "app/vocabulary/b2-data.ts"), header + rows.map((row) => "  " + JSON.stringify(row) + ",").join("\n") + "\n" + footer);
await writeFile(path.join(ROOT, "app/vocabulary/b2-provenance.json"), JSON.stringify({ repository: "https://github.com/bahman-farhadian/tartarus", commit: SOURCE_COMMIT,
  license: "MIT", target: 3300, wordClasses: QUOTAS, sources, rejectedBeforeQuota: rejected,
  rowsSha256: createHash("sha256").update(JSON.stringify(rows)).digest("hex"), review: "Structural checks and editorial exceptions; not independently CEFR-certified or fully teacher-reviewed." }, null, 2) + "\n");
console.log(`Wrote ${rows.length} new B2 headwords: ${JSON.stringify(QUOTAS)}.`);
