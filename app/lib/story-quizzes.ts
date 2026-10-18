import quizzes from './reading-quizzes.json';

export type ReadingQuestion = { prompt: string; options: string[]; answer: number; explanation: string };
type QuizStory = { id: string; questions: ReadingQuestion[] };
const questionsByStory = quizzes as Record<string, ReadingQuestion[]>;

// Keep story identity and saved completion intact when the assessment is revised.
export function withReadingQuiz<T extends QuizStory>(story: T): T {
  const questions = questionsByStory[story.id];
  return questions ? { ...story, questions } : story;
}
