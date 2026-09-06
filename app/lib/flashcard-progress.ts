import { flashcardOptions, serializeFlashcard } from "./flashcard-scheduler";
import type { FlashcardRating } from "./flashcard-memory";
import { vocabularyCardKey, setVocabularyStatus, type VocabularyProgress, type VocabularyIdentity } from "./progress-sync";
export function rateVocabularyFlashcard(current: VocabularyProgress, word: VocabularyIdentity, rating: FlashcardRating, now = Date.now()): VocabularyProgress {
  if (![1, 2, 3, 4].includes(rating)) throw new Error("Invalid flashcard rating.");
  const key = vocabularyCardKey(word);
  const card = flashcardOptions(current.cards?.[key], now)[rating].card;
  const next = setVocabularyStatus(current, word, "review", now);
  return { ...next, cards: { ...next.cards, [key]: { ...next.cards![key], dueAt: card.due.getTime(),
    intervalMinutes: (card.due.getTime() - now) / 60000, memory: serializeFlashcard(card) } } };
}
