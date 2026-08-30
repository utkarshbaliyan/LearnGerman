import {
  A1_STATS,
  A1_STORIES,
  A1_UNITS,
  cleanWord,
  GLOSSARY,
} from "@/app/curriculum/a1";
import { A2_GLOSSARY, A2_STATS, A2_STORIES, A2_UNITS } from "@/app/curriculum/a2";
import { B1_GLOSSARY, B1_STATS, B1_STORIES, B1_UNITS } from "@/app/curriculum/b1";
import type { CefrLevel, Curriculum, LevelOption } from "@/app/curriculum/types";

export const LEVELS: LevelOption[] = [
  { id: "A1", label: "Fundamentals", available: true },
  { id: "A2", label: "Everyday Life", available: true },
  { id: "B1", label: "Independent", available: true },
  { id: "B2", label: "Confident", available: false },
];

const A1_CURRICULUM: Curriculum = {
  id: "A1",
  title: "Deutsch A1",
  shortTitle: "Grundlagen",
  audioBasePath: "/audio/a1",
  audioVersion: "aligned-1",
  stories: A1_STORIES,
  units: A1_UNITS,
  stats: A1_STATS,
};

const A2_CURRICULUM: Curriculum = {
  id: "A2",
  title: "Deutsch A2",
  shortTitle: "Alltag",
  audioBasePath: "/audio/a2",
  audioVersion: "a2-1",
  stories: A2_STORIES,
  units: A2_UNITS,
  stats: A2_STATS,
};

const B1_CURRICULUM: Curriculum = {
  id: "B1",
  title: "Deutsch B1",
  shortTitle: "Selbstständig",
  audioBasePath: "/audio/b1",
  audioVersion: "b1-audio-1",
  stories: B1_STORIES,
  units: B1_UNITS,
  stats: B1_STATS,
};

const CURRICULA: Partial<Record<CefrLevel, Curriculum>> = {
  A1: A1_CURRICULUM,
  A2: A2_CURRICULUM,
  B1: B1_CURRICULUM,
};

const FORM_GLOSSES: Record<string, string> = {
  abzutun: "to dismiss", achtete: "paid attention", allein: "alone", allgemeine: "general",
  anderswo: "elsewhere", anderer: "another / other", angenehm: "pleasant", angepasst: "adapted",
  ausdrücklich: "explicitly", begann: "began", bekam: "received", belegten: "proved / documented",
  baten: "asked / requested", berechtigt: "justified / entitled", beruhte: "was based on", besonders: "especially",
  begründen: "to justify / give reasons", beurteilten: "evaluated", darin: "in it / in there",
  besprach: "discussed", bestand: "consisted / existed", bestätigen: "to confirm",
  blieb: "remained", brachte: "brought", daran: "on it / about it", darum: "therefore / about that", darauf: "on that / afterwards",
  dasselbe: "the same thing", dachte: "thought", diejenige: "the one", dorthin: "to there",
  dritte: "third", dürfe: "may / is permitted", eigene: "own", einander: "one another",
  einschätzen: "to assess", entscheiden: "to decide", entscheidenden: "decisive", entschieden: "decided",
  endlosem: "endless", erkennen: "to recognise", entstand: "arose / was created", ergab: "resulted in",
  erlebt: "experienced", erleichtert: "relieved",
  erzählte: "told", fasste: "summarised / grasped", fand: "found", gäbe: "there would be",
  formulierten: "formulated", gegangen: "gone", geklärt: "clarified", gelernt: "learned", genannt: "named / mentioned",
  genug: "enough", genügten: "were sufficient", gesprochen: "spoken", gestiegen: "risen",
  gewesen: "been", glaubte: "believed", glaubwürdiger: "more credible", ging: "went",
  gründlich: "thoroughly", gründliche: "thorough", habe: "have", hätte: "would have / had", half: "helped",
  informieren: "to inform", je: "each / ever", jedoch: "however", kaum: "hardly", kam: "came",
  kannte: "knew", kannten: "knew", kennen: "to know", konkret: "concrete / specific",
  konkrete: "specific", konkreten: "specific", kurzfristig: "at short notice",
  lasen: "read", ließen: "let / allowed", lösen: "to solve", miteinander: "with one another",
  musste: "had to", mussten: "had to", müsse: "must / had to", musst: "must", nachfragen: "to ask again",
  nannte: "named / called", nun: "now", ordnen: "to organise", prüfen: "to check",
  redeten: "talked", rief: "called", sachlich: "objective / factual", sah: "saw",
  sammelte: "collected", sparen: "to save", scheiterten: "failed", schienen: "seemed",
  schrieb: "wrote", sei: "is / may be", selten: "rarely", sollte: "should / was supposed to",
  sinnvoll: "sensible / useful", sorgfältiges: "careful", sprach: "spoke", statt: "instead / taking place", stimmt: "is correct",
  stimmte: "agreed / was correct", tat: "did", teilten: "shared / divided", trennte: "separated",
  übergehen: "to overlook / skip", übereinander: "about one another / on top of one another",
  übernommen: "taken over", überprüft: "checked", überprüfen: "to check", umständlich: "cumbersome",
  umzusetzen: "to implement", unbeabsichtigten: "unintended", unvollständigen: "incomplete", uns: "us",
  unspektakulär: "unremarkable", unterscheiden: "to distinguish", unterschiedliche: "different",
  unterschiedlich: "different", unterstützte: "supported", verdeckt: "hidden", verschieden: "different",
  verglich: "compared", vergleichbaren: "comparable", verglichen: "compared", verlangte: "demanded",
  vermeiden: "to avoid", vermiedenen: "avoided", verändert: "changed", verband: "connected",
  verbessern: "to improve", verhinderte: "prevented", vernünftig: "reasonable", vernünftige: "reasonable",
  verstand: "understood", verstanden: "understood", versprach: "promised", vielmehr: "rather / instead",
  vielleicht: "perhaps", weit: "far", werde: "will / become", worden: "been", wurde: "became / was",
  wurden: "became / were", wäre: "would be", warnte: "warned", wirkte: "seemed / had an effect",
  wofür: "what for / for which",
  wollte: "wanted", wollten: "wanted", woran: "what ... about / on which", worüber: "what ... about",
  würde: "would", würden: "would", würdest: "would", wusste: "knew", zwar: "indeed / although",
  überzeugen: "to convince", überzeugend: "convincing", ähnliche: "similar", auszuhalten: "to endure",
  desto: "the ... (in comparisons)", teilen: "to share / divide", tragfähige: "viable", zuhören: "to listen",
};

export function getCurriculum(level: CefrLevel) {
  return CURRICULA[level];
}

export { cleanWord };

export function meaningFor(token: string) {
  const word = cleanWord(token);
  if (!word) return "";
  if (FORM_GLOSSES[word]) return FORM_GLOSSES[word];
  if (B1_GLOSSARY[word]) return B1_GLOSSARY[word];
  if (A2_GLOSSARY[word]) return A2_GLOSSARY[word];
  if (GLOSSARY[word]) return GLOSSARY[word];
  const candidates = [
    word.endsWith("test") ? `${word.slice(0, -4)}en` : "",
    word.endsWith("tet") ? `${word.slice(0, -3)}en` : "",
    word.endsWith("ten") ? `${word.slice(0, -3)}en` : "",
    word.endsWith("te") ? `${word.slice(0, -2)}en` : "",
    word.startsWith("ge") && word.endsWith("t") ? `${word.slice(2, -1)}en` : "",
    word.endsWith("ern") ? word.slice(0, -3) : "",
    word.endsWith("en") ? word.slice(0, -2) : "",
    word.endsWith("er") ? word.slice(0, -2) : "",
    word.endsWith("es") || word.endsWith("em") ? word.slice(0, -2) : "",
    word.endsWith("e") || word.endsWith("n") || word.endsWith("s") ? word.slice(0, -1) : "",
    word.endsWith("et") ? `${word.slice(0, -2)}en` : "",
    word.endsWith("t") ? `${word.slice(0, -1)}en` : "",
  ];
  for (const candidate of candidates) {
    if (candidate && (B1_GLOSSARY[candidate] || A2_GLOSSARY[candidate] || GLOSSARY[candidate])) {
      return B1_GLOSSARY[candidate] || A2_GLOSSARY[candidate] || GLOSSARY[candidate];
    }
  }
  if (/^[A-ZÄÖÜ]/.test(token)) return "name / place";
  return "";
}
export type { CefrLevel, Curriculum, Story, Unit } from "@/app/curriculum/types";
