import { isVocabularyLearned, isVocabularyReview, vocabularyReviewDueAt, type VocabularyProgress } from "@/app/lib/progress-sync";
import type { VocabularyWord } from "@/app/vocabulary/data";

export function vocabularyPracticeQueue(words: VocabularyWord[], progress: VocabularyProgress, now: number, reviewOnly: boolean, lastId?: string) {
  const due = words.filter((word) => vocabularyReviewDueAt(progress, word) <= now)
    .sort((a, b) => vocabularyReviewDueAt(progress, a) - vocabularyReviewDueAt(progress, b));
  const candidates = due.length || reviewOnly ? due
    : words.filter((word) => !isVocabularyLearned(progress, word) && !isVocabularyReview(progress, word));
  const others = candidates.filter((word) => word.id !== lastId);
  return others.length ? others : candidates;
}
