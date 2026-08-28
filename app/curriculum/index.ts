import {
  A1_STATS,
  A1_STORIES,
  A1_UNITS,
  cleanWord,
  meaningFor,
} from "@/app/curriculum/a1";
import type { CefrLevel, Curriculum, LevelOption } from "@/app/curriculum/types";

export const LEVELS: LevelOption[] = [
  { id: "A1", label: "Grundlagen", available: true },
  { id: "A2", label: "Alltag", available: false },
  { id: "B1", label: "Selbstständig", available: false },
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

const CURRICULA: Partial<Record<CefrLevel, Curriculum>> = {
  A1: A1_CURRICULUM,
};

export function getCurriculum(level: CefrLevel) {
  return CURRICULA[level];
}

export { cleanWord, meaningFor };
export type { CefrLevel, Curriculum, Story, Unit } from "@/app/curriculum/types";
