import {
  A1_STATS,
  A1_STORIES,
  A1_UNITS,
  cleanWord,
  GLOSSARY,
} from "@/app/curriculum/a1";
import { A2_GLOSSARY, A2_STATS, A2_STORIES, A2_UNITS } from "@/app/curriculum/a2";
import type { CefrLevel, Curriculum, LevelOption } from "@/app/curriculum/types";

export const LEVELS: LevelOption[] = [
  { id: "A1", label: "Grundlagen", available: true },
  { id: "A2", label: "Alltag", available: true },
  { id: "B1", label: "Selbstständig", available: false },
  { id: "B2", label: "Sicher", available: false },
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

const CURRICULA: Partial<Record<CefrLevel, Curriculum>> = {
  A1: A1_CURRICULUM,
  A2: A2_CURRICULUM,
};

export function getCurriculum(level: CefrLevel) {
  return CURRICULA[level];
}

export { cleanWord };

export function meaningFor(token: string) {
  const word = cleanWord(token);
  if (!word) return "";
  if (A2_GLOSSARY[word]) return A2_GLOSSARY[word];
  if (GLOSSARY[word]) return GLOSSARY[word];
  const candidates = [
    word.endsWith("ern") ? word.slice(0, -3) : "",
    word.endsWith("en") ? word.slice(0, -2) : "",
    word.endsWith("er") ? word.slice(0, -2) : "",
    word.endsWith("es") || word.endsWith("em") ? word.slice(0, -2) : "",
    word.endsWith("e") || word.endsWith("n") || word.endsWith("s") ? word.slice(0, -1) : "",
    word.endsWith("et") ? `${word.slice(0, -2)}en` : "",
    word.endsWith("t") ? `${word.slice(0, -1)}en` : "",
  ];
  for (const candidate of candidates) {
    if (candidate && (A2_GLOSSARY[candidate] || GLOSSARY[candidate])) {
      return A2_GLOSSARY[candidate] || GLOSSARY[candidate];
    }
  }
  if (/^[A-ZÄÖÜ]/.test(token)) return "name / place";
  return "";
}
export type { CefrLevel, Curriculum, Story, Unit } from "@/app/curriculum/types";
