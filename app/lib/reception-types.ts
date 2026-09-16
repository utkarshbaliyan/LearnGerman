export type ReceptionSkill = 'reading' | 'listening';
export type ReceptionQuestion = {
  prompt: string; kind: 'choice' | 'sequence' | 'match'; options: string[];
  answers: number[]; labels?: string[]; evidence: number[]; explanation: string;
};
export type ReceptionActivity = {
  id: string; skill: ReceptionSkill; title: string; instruction: string;
  segments: { speaker?: string; text: string }[]; help: string;
  questions: ReceptionQuestion[]; summary?: { prompt: string; points: string[] };
};
export type ReceptionLesson = {
  id: string; level: 'A1' | 'A2' | 'B1'; chapter: number; title: string;
  guided: ReceptionActivity[]; transfer: ReceptionActivity[];
};
