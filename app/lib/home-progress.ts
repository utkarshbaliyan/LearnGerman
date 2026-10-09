import { connectedVocabulary } from './saved-vocabulary';
import { isVocabularyLearned, isVocabularyReview, mergeGrammarProgressWithCourse, type GrammarProgress, type StoredCourseProgress, type VocabularyProgress } from './progress-sync';
import type { VocabularyWord } from '@/app/vocabulary/data';

export type VocabularyOverview = { total: number; learned: number; review: number; unlearned: number };
export type HomeGrammarLesson = { id: string; title: string; requiredSets: string[] };

/** The same connected catalog and status rules used by the Vocabulary page. */
export function vocabularyOverview(catalog: VocabularyWord[], progress: VocabularyProgress): VocabularyOverview {
  const words = connectedVocabulary(catalog, progress);
  let learned = 0, review = 0;
  for (const word of words) {
    if (isVocabularyLearned(progress, word)) learned++;
    else if (isVocabularyReview(progress, word)) review++;
  }
  return { total: words.length, learned, review, unlearned: words.length - learned - review };
}

export function grammarOverview(grammar: GrammarProgress, course: StoredCourseProgress, lessons: HomeGrammarLesson[]) {
  const progress = mergeGrammarProgressWithCourse(grammar, course, Object.fromEntries(lessons.map(l => [l.id, l.requiredSets])));
  const completed = lessons.filter(l => progress.completed.includes(l.id)).length;
  const started = lessons.filter(l => progress.completed.includes(l.id) || Object.keys(progress.sets[l.id] ?? {}).length > 0).length;
  return { total: lessons.length, completed, started, next: lessons.find(l => !progress.completed.includes(l.id)) };
}
