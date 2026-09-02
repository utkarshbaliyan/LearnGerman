import {
  vocabularyWordClass,
  type VocabularyWord,
} from "@/app/vocabulary/data";

export const VOCABULARY_QUIZ_STORAGE_KEY = "leselaut:vocabulary-quiz:v1";

export type VocabularyQuizCursor = {
  seed: number;
  round: number;
};

type QuizStorage = Pick<Storage, "getItem" | "setItem">;

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function isCursor(value: unknown): value is VocabularyQuizCursor {
  if (!value || typeof value !== "object") return false;
  const cursor = value as Partial<VocabularyQuizCursor>;
  return Number.isSafeInteger(cursor.seed) && Number.isSafeInteger(cursor.round) && cursor.round! >= 0;
}

function saveCursor(storage: QuizStorage, cursor: VocabularyQuizCursor) {
  storage.setItem(VOCABULARY_QUIZ_STORAGE_KEY, JSON.stringify(cursor));
  return cursor;
}

export function startVocabularyQuiz(storage: QuizStorage, createSeed: () => number): VocabularyQuizCursor {
  try {
    const stored = JSON.parse(storage.getItem(VOCABULARY_QUIZ_STORAGE_KEY) ?? "null") as unknown;
    if (isCursor(stored)) return saveCursor(storage, { ...stored, round: stored.round + 1 });
  } catch {
    // Replace malformed device-local quiz state with a fresh cursor.
  }

  return saveCursor(storage, { seed: Math.abs(Math.trunc(createSeed())), round: 0 });
}

export function advanceVocabularyQuiz(storage: QuizStorage, cursor: VocabularyQuizCursor) {
  return saveCursor(storage, { ...cursor, round: cursor.round + 1 });
}

export function buildVocabularyQuiz(words: VocabularyWord[], cursor: VocabularyQuizCursor) {
  if (!words.length) return null;

  const word = words[positiveModulo(cursor.seed + cursor.round * 47, words.length)];
  const choices = [word];
  const sameClass = words.filter((candidate) => candidate.id !== word.id && vocabularyWordClass(candidate) === vocabularyWordClass(word));
  const sameTopic = sameClass.filter((candidate) => candidate.category === word.category);
  const candidatePool = [...sameTopic, ...sameClass, ...words].filter((candidate, index, all) => (
    candidate.id !== word.id && all.findIndex((item) => item.german === candidate.german) === index
  ));

  for (let offset = 0; choices.length < 4 && offset < candidatePool.length; offset += 1) {
    const index = positiveModulo(cursor.seed * 31 + cursor.round * 17 + offset, candidatePool.length);
    const candidate = candidatePool[index];
    if (!choices.some((choice) => choice.german === candidate.german)) choices.push(candidate);
  }

  const rotation = positiveModulo(cursor.seed + cursor.round, choices.length);
  return { word, choices: [...choices.slice(rotation), ...choices.slice(0, rotation)] };
}
