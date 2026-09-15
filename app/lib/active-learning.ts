import { speakingTarget } from "./response-development";
import rows from './active-learning-data.json';
import reviewPrompts from './active-learning-reviews.json';
import type { ChapterOutputTask } from './chapter-output-tasks';
export type ActiveLevel = 'A1' | 'A2' | 'B1';
export const ACTIVE_LEVELS: ActiveLevel[] = ['A1', 'A2', 'B1'];
export const activeLessons = rows.map(row => ({ ...row, id: `${row.lesson_id}-v1`, level: row.level as ActiveLevel, module: Number(row.module), lesson: Number(row.lesson), review: false }));
export const activeReviews = activeLessons.filter(row => row.lesson === 4).map((row, index) => ({ ...row,
 id: `active-${row.level.toLowerCase()}-m${String(row.module).padStart(2, '0')}-review-v1`, review: true,
 communication_goal: `Use it again: ${row.module_title}`, writing_prompt: reviewPrompts[index].writing,
 question: reviewPrompts[index].speaking,
}));
export const starterCheckpoint = { ...activeLessons[3], id: 'active-a1-m01-check-v1', review: true,
 communication_goal: 'Meet a new course partner',
 question: 'Hallo! Wie heißt du und wo wohnst du?',
 writing_prompt: 'You join a new online German group. Write a short greeting, your name and the city where you live. Two short sentences are enough. You may use fictional details.',
};
export const activeTasks = [...activeLessons, ...activeReviews, starterCheckpoint];
export type ActiveLesson = typeof activeLessons[number];
export function getActiveLesson(id: string) { return activeTasks.find(lesson => lesson.id === id); }
export function activeTask(id: string): ChapterOutputTask | null {
 const row = getActiveLesson(id); if (!row) return null;
 const early = row.level === 'A1' && row.module === 1;
 const writingSize = early ? row.lesson < 4 ? 'One short sentence' : 'Two short sentences' : row.level === 'A1' ? row.module < 5 ? '2–3 short sentences' : '3–4 short sentences' : row.level === 'A2' ? 'A short message · roughly 30–70 words' : 'A connected message · roughly 80–140 words';
 return { id, level: row.level, chapter: row.module, title: row.communication_goal, writing: row.writing_prompt,
 questions: [row.question], writingSize, suggestedWords: early ? 5 : row.level === 'A1' ? 20 : row.level === 'A2' ? 50 : 100,
 speakingSize: speakingTarget(row.level,row.module),
 rubric: `${row.level}, Active Learning module ${row.module}. Goal: ${row.communication_goal}. Context: ${row.writing_prompt}. Prerequisites: ${row.language_to_teach_or_refresh}. ${writingSize} is guidance, never a minimum length penalty. ${row.level === 'A1' ? 'Accept short phrases and formulaic answers; never demand reasons or advanced grammar. Give at most one useful correction.' : row.level === 'A2' ? 'Accept simple connected everyday language. Give at most two useful corrections.' : 'Expect clear connected everyday explanation, appropriate reasons and register. Do not require academic or native-like language. Give at most two useful corrections.'} Preserve the learner’s meaning. Do not penalise fictional details. Assess the task actually asked, not missing unrelated grammar.`,
 };
}
