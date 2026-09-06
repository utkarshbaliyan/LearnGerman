import type { Card, Grade } from "ts-fsrs";
export type FlashcardMemory = Omit<Card, "due" | "last_review"> & { last_review?: number };
export type FlashcardRating = Grade;
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
