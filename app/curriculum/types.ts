export type CefrLevel = "A1" | "A2" | "B1";

export type Story = {
  id: string;
  number: number;
  unitId: number;
  title: string;
  text: string;
  grammar: string;
  canDo: string;
  theme: string;
  color: string;
};

export type Unit = {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  grammar: string;
  canDo: string;
  color: string;
  stories: Story[];
};

export type CurriculumStats = {
  totalWords: number;
  uniqueWordForms: number;
  averageStoryWords: number;
};

export type Curriculum = {
  id: CefrLevel;
  title: string;
  shortTitle: string;
  audioBasePath: string;
  audioVersion: string;
  stories: Story[];
  units: Unit[];
  stats: CurriculumStats;
};

export type LevelOption = {
  id: CefrLevel;
  label: string;
  available: boolean;
};
