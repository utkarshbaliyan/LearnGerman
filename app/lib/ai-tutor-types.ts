export type TutorMode = "writing" | "speaking";

export type TutorCorrection = {
  original: string;
  corrected: string;
  explanation: string;
  category: string;
};

export type TutorFeedback = {
  overallScore: number;
  mastery: boolean;
  summary: string;
  correctedAnswer: string;
  strengths: string[];
  corrections: TutorCorrection[];
  nextStep: string;
  retryPrompt: string;
  transcript?: string;
};

export type TutorContext = {
  level: "A1" | "A2" | "B1";
  chapter: number;
  prompt: string;
  grammarFocus: string;
  vocabulary: string[];
};
