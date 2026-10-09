import { flashcardOptions, serializeFlashcard } from "./flashcard-scheduler";
import type { FlashcardRating } from "./flashcard-memory";
import { vocabularyCardKey, setVocabularyStatus, readVocabularyRecalls, type VocabularyProgress, type VocabularyIdentity, type VocabularyRecallAttempt } from "./progress-sync";
export function rateVocabularyFlashcard(current: VocabularyProgress, word: VocabularyIdentity, rating: FlashcardRating, now = Date.now(), recall?: VocabularyRecallAttempt): VocabularyProgress {
  if (![1, 2, 3, 4].includes(rating)) throw new Error("Invalid flashcard rating.");
  const key = vocabularyCardKey(word);
  const card = flashcardOptions(current.cards?.[key], now)[rating].card;
  const next = setVocabularyStatus(current, word, "review", now);
  if (recall && (!readVocabularyRecalls({ [recall.id]: recall })[recall.id] || recall.key !== key)) throw new Error('Invalid recall record.');
  return { ...next, ...(recall ? { recalls: readVocabularyRecalls({ ...next.recalls, [recall.id]: recall }) } : {}), cards: { ...next.cards, [key]: { ...next.cards![key], dueAt: card.due.getTime(),
    intervalMinutes: (card.due.getTime() - now) / 60000, memory: serializeFlashcard(card) } } };
}
