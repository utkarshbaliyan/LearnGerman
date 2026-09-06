import { createEmptyCard, fsrs, type Card, type Grade } from "ts-fsrs";
import type { VocabularyReviewCard } from "./progress-sync";

export type FlashcardMemory = Omit<Card, "due" | "last_review"> & { last_review?: number };
export type FlashcardRating = Grade;
export const FLASHCARD_RATINGS = [
  { rating: 1, label: "Again", hint: "Forgot" },
  { rating: 2, label: "Hard", hint: "Recalled with difficulty" },
  { rating: 3, label: "Good", hint: "Recalled correctly" },
  { rating: 4, label: "Easy", hint: "Recalled effortlessly" },
] as const;

const scheduler = fsrs({ request_retention: 0.9, maximum_interval: 36500,
  enable_fuzz: false, learning_steps: ["1m", "10m"], relearning_steps: ["10m"] });

export function validFlashcardMemory(value: unknown): value is FlashcardMemory {
  if (!value || typeof value !== "object") return false;
  const m = value as FlashcardMemory;
  return [0, 1, 2, 3].includes(m.state)
    && [m.stability, m.difficulty, m.elapsed_days, m.scheduled_days, m.reps, m.lapses, m.learning_steps]
      .every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)
    && m.stability <= 36500 && m.difficulty <= 10
    && [m.reps, m.lapses, m.learning_steps].every(Number.isSafeInteger)
    && (m.last_review === undefined ? m.state === 0 : Number.isFinite(m.last_review) && m.last_review >= 0 && m.last_review <= 8640000000000000);
}

export function flashcardOptions(previous: VocabularyReviewCard | undefined, now: number) {
  const memory = previous?.memory;
  const card: Card = memory && validFlashcardMemory(memory)
    ? { ...memory, due: new Date(previous!.dueAt), last_review: memory.last_review === undefined ? undefined : new Date(memory.last_review) }
    : createEmptyCard(new Date(now));
  return scheduler.repeat(card, new Date(now));
}

export function serializeFlashcard(card: Card): FlashcardMemory {
  const { due: _due, last_review, ...memory } = card;
  void _due;
  return { ...memory, ...(last_review ? { last_review: last_review.getTime() } : {}) };
}

export function flashcardInterval(due: number, now: number) {
  const minutes = Math.max(1, Math.round((due - now) / 60000));
  return minutes < 60 ? `${minutes} min` : minutes < 1440 ? `${Math.round(minutes / 60)} hr` : `${Math.round(minutes / 1440)} days`;
}
