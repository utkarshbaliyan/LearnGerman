import { germanVerbLemma } from "@/app/vocabulary/verb-forms";
import { validFlashcardMemory, type FlashcardMemory } from "./flashcard-memory";

export const COURSE_PROGRESS_STORAGE_KEY = "leselaut:course-progress:v1";
export const GRAMMAR_PROGRESS_STORAGE_KEY = "leselaut:grammar-progress:v1";
export const VOCABULARY_PROGRESS_STORAGE_KEY = "leselaut:vocabulary-progress:v2";
export const VOCABULARY_LEGACY_STORAGE_KEYS = [
  "leselaut:vocabulary:a1-b1",
  "leselaut:vocabulary:a1-a2",
  "leselaut:vocabulary:a1",
] as const;

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type VocabularyIdentity = {
  id?: string;
  english: string;
  german: string;
  progressByHeadword?: boolean;
  progressAliases?: { id: string; german: string; english: string }[];
};

export type VocabularyProgress = {
  learnedKeys: string[];
  reviewKeys: string[];
  legacyMigrated: boolean;
  cards?: Record<string, VocabularyReviewCard>;
  guessStreak?: { current: number; best: number; updatedAt: number };
  words?: Record<string, CollectedVocabularyWord>;
  recalls?: Record<string, VocabularyRecallAttempt>;
};

export type VocabularyRecallAttempt = { id: string; key: string; at: number; correct: boolean; assisted: boolean; elapsedDays: number };
export function readVocabularyRecalls(value: unknown): Record<string, VocabularyRecallAttempt> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([id, raw]) => {
    if (!raw || typeof raw !== 'object') return [];
    const r = raw as VocabularyRecallAttempt;
    return /^[\p{L}\p{N}_: -]{1,200}$/u.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id) && r.id === id && typeof r.key === 'string' && /^[\p{L}\p{N}_: -]{1,200}$/u.test(r.key)
      && Number.isSafeInteger(r.at) && r.at >= 0 && typeof r.correct === 'boolean' && typeof r.assisted === 'boolean' && Number.isFinite(r.elapsedDays) && r.elapsedDays >= 0 && r.elapsedDays <= 100000
      ? [[id, { id, key: r.key, at: r.at, correct: r.correct, assisted: r.assisted, elapsedDays: r.elapsedDays }]] : [];
  }).sort((a, b) => (a[1] as VocabularyRecallAttempt).at - (b[1] as VocabularyRecallAttempt).at || String(a[0]).localeCompare(String(b[0]))).slice(-1000)) as Record<string, VocabularyRecallAttempt>;
}

export type WordSource = { kind: 'story' | 'book'; id: string; title: string; href: string; level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' };
export type CollectedVocabularyWord = { german: string; english: string; context: string; source: WordSource; createdAt: number; updatedAt: number; progressByHeadword: true };
export type CollectWordInput = Omit<CollectedVocabularyWord, 'createdAt' | 'updatedAt' | 'progressByHeadword'>;
export const MAX_COLLECTED_WORDS = 500;

export function readCollectedWords(value: unknown): Record<string, CollectedVocabularyWord> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, raw]) => {
    if (!raw || typeof raw !== 'object') return [];
    const w = raw as CollectedVocabularyWord, s = w.source;
    if (typeof w.german !== 'string' || !w.german.trim() || w.german.length > 100 || typeof w.english !== 'string' || !w.english.trim() || w.english.length > 600 || typeof w.context !== 'string' || w.context.length > 600
      || !s || !['story', 'book'].includes(s.kind) || typeof s.id !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(s.id) || typeof s.title !== 'string' || s.title.length > 200
      || typeof s.href !== 'string' || !/^\/(?:stories\/[a-zA-Z0-9_-]+|books\/(?:a1|a2|b1)\/[a-z0-9-]+\/[1-9]\d*)$/.test(s.href) || !['A1', 'A2', 'B1', 'B2', 'C1'].includes(s.level)
      || ![w.createdAt, w.updatedAt].every(n => Number.isSafeInteger(n) && n >= 0) || key !== vocabularyCardKey(w)) return [];
    return [[key, { german: w.german, english: w.english, context: w.context, source: { kind: s.kind, id: s.id, title: s.title, href: s.href, level: s.level }, createdAt: w.createdAt, updatedAt: w.updatedAt, progressByHeadword: true }]];
  }).sort((a, b) => (a[1] as CollectedVocabularyWord).updatedAt - (b[1] as CollectedVocabularyWord).updatedAt || String(a[0]).localeCompare(String(b[0])))) as Record<string, CollectedVocabularyWord>;
}

export function collectVocabularyWord(current: VocabularyProgress, input: CollectWordInput, now = Date.now()): VocabularyProgress {
  const key = vocabularyCardKey(input), words = readCollectedWords(current.words);
  if (!words[key] && Object.keys(words).length >= MAX_COLLECTED_WORDS) throw new Error('Your collected deck has reached 500 words. Existing words remain available.');
  const word = readCollectedWords({ [key]: { ...input, context: input.context.slice(0, 600), createdAt: words[key]?.createdAt ?? now, updatedAt: now, progressByHeadword: true } })[key];
  if (!word) throw new Error('This word could not be saved.');
  const previous = current.cards?.[key];
  let next = current;
  if (!previous || !isVocabularyReview(current, word)) {
    next = setVocabularyStatus(current, word, 'review', now);
    if (previous?.memory) next.cards![key].memory = previous.memory;
  }
  // Repeated saves add source metadata without restarting an existing schedule.
  return { ...next, words: { ...words, [key]: words[key] ?? word } };
}

export function readGuessStreak(value: unknown): NonNullable<VocabularyProgress["guessStreak"]> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const s = value as NonNullable<VocabularyProgress["guessStreak"]>;
  if (![s.current, s.best, s.updatedAt].every((n) => Number.isSafeInteger(n) && n >= 0) || s.best < s.current) return undefined;
  return { current: s.current, best: s.best, updatedAt: s.updatedAt };
}

export type VocabularyReviewCard = {
  status: "learned" | "review" | "unlearned";
  updatedAt: number;
  dueAt: number;
  intervalMinutes: number;
  memory?: FlashcardMemory;
};

export function readReviewCards(value: unknown): Record<string, VocabularyReviewCard> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, VocabularyReviewCard] => {
    const card = entry[1] as VocabularyReviewCard | null;
    return entry[0].startsWith("de:") && !!card && ["learned", "review", "unlearned"].includes(card.status)
      && [card.updatedAt, card.dueAt, card.intervalMinutes].every((n) => Number.isFinite(n) && n >= 0)
      && card.intervalMinutes <= 52560000
      && (card.memory === undefined || validFlashcardMemory(card.memory));
  }));
}

export function vocabularyCardKey(word: VocabularyIdentity) {
  return vocabularyProgressKeys(word).find((key) => key.startsWith("de:"))!;
}

export function mergeVocabularyProgress(local: unknown, remote: unknown): VocabularyProgress {
  const a = (remote ?? {}) as Partial<VocabularyProgress>;
  const b = (local ?? {}) as Partial<VocabularyProgress>;
  const words = { ...readCollectedWords(a.words) };
  for (const [key, word] of Object.entries(readCollectedWords(b.words))) {
    if (!words[key] || word.updatedAt > words[key].updatedAt || (word.updatedAt === words[key].updatedAt && JSON.stringify(word) > JSON.stringify(words[key]))) words[key] = word;
  }
  const recalls = { ...readVocabularyRecalls(a.recalls) };
  for (const [key, recall] of Object.entries(readVocabularyRecalls(b.recalls))) {
    if (!recalls[key] || recall.at > recalls[key].at || (recall.at === recalls[key].at && JSON.stringify(recall) > JSON.stringify(recalls[key]))) recalls[key] = recall;
  }
  const streaks = [readGuessStreak(a.guessStreak), readGuessStreak(b.guessStreak)].filter((s) => s !== undefined);
  // Latest answer owns the current run; best scores never move backwards.
  streaks.sort((x, y) => y.updatedAt - x.updatedAt || x.current - y.current);
  const guessStreak = streaks.length ? { ...streaks[0], best: Math.max(...streaks.map((s) => s.best)) } : undefined;
  const cards = { ...readReviewCards(a.cards) };
  for (const [key, card] of Object.entries(readReviewCards(b.cards))) {
    if (!cards[key] || card.updatedAt > cards[key].updatedAt
      || (card.updatedAt === cards[key].updatedAt && JSON.stringify(card) > JSON.stringify(cards[key]))) cards[key] = card;
  }
  const learned = new Set([...stringArray(a.learnedKeys), ...stringArray(b.learnedKeys)]);
  const review = new Set([...stringArray(a.reviewKeys), ...stringArray(b.reviewKeys)]);
  for (const [key, card] of Object.entries(cards)) {
    learned.delete(key);
    review.delete(key);
    if (card.status === "learned") learned.add(key);
    if (card.status === "review") review.add(key);
  }
  for (const key of learned) review.delete(key);
  return { learnedKeys: [...learned], reviewKeys: [...review], legacyMigrated: a.legacyMigrated === true || b.legacyMigrated === true,
    ...(Object.keys(cards).length ? { cards } : {}), ...(guessStreak ? { guessStreak } : {}), ...(Object.keys(words).length ? { words: readCollectedWords(words) } : {}), ...(Object.keys(recalls).length ? { recalls: readVocabularyRecalls(recalls) } : {}) };
}

export type GrammarProgress = {
  completed: string[];
  scores: Record<string, number>;
  sets: Record<string, Record<string, number>>;
};

type StoredChapterProgress = {
  reception?: import('@/app/lib/reception-progress').ReceptionProgress;
  readingEditions?: import('./reading-progress').ReadingEditionChecks;
  comprehensionChecks?: import("./comprehension-progress").ComprehensionChecks;
  completed?: boolean;
  checkpointScore?: number;
  skillScores?: Record<string, number>;
  grammarSets?: Record<string, number>;
  knownWords?: string[];
  writingDraft?: string;
  recordedSpeaking?: boolean;
};

export type StoredCourseProgress = {
  chapters: Record<string, StoredChapterProgress>;
};

function parseObject(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numericRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === "number"));
}

function maximumScores(a: Record<string, number> = {}, b: Record<string, number> = {}) {
  const result = { ...a };
  for (const [key, value] of Object.entries(b)) result[key] = Math.max(result[key] ?? 0, value);
  return result;
}

function unique(values: Iterable<string>) {
  return [...new Set(values)];
}

function normalizeStoredVocabularyKey(key: string) {
  if (!key.startsWith("de:")) return key;
  const lemma = normalizeMeaning(germanVerbLemma(key.slice(3)));
  return lemma ? `de:${lemma}` : key;
}

function normalizeMeaning(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9äöüß]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function vocabularyProgressKey(word: VocabularyIdentity) {
  if (word.progressByHeadword) return vocabularyCardKey(word);
  const english = normalizeMeaning(word.english);
  if (english) return `en:${english}`;
  return `de:${normalizeMeaning(word.german)}`;
}

export function vocabularyProgressKeys(word: VocabularyIdentity): string[] {
  const english = normalizeMeaning(word.english);
  const german = normalizeMeaning(germanVerbLemma(word.german.split(",")[0]).replace(/^(der|die|das|ein|eine)\s+/i, ""));
  return unique([
    !word.progressByHeadword && english ? `en:${english}` : "",
    german ? `de:${german}` : "",
    ...(word.progressAliases ?? []).flatMap(vocabularyProgressKeys),
  ].filter(Boolean));
}

export function emptyVocabularyProgress(): VocabularyProgress {
  return { learnedKeys: [], reviewKeys: [], legacyMigrated: false };
}

export function setVocabularyStatus(
  current: VocabularyProgress,
  word: VocabularyIdentity,
  status: "learned" | "review" | "unlearned",
  now = Date.now(),
): VocabularyProgress {
  const keys = vocabularyProgressKeys(word);
  const learned = new Set(current.learnedKeys);
  const review = new Set(current.reviewKeys);

  if (status === "learned") {
    keys.forEach((key) => { learned.add(key); review.delete(key); });
  } else if (status === "review") {
    keys.forEach((key) => { review.add(key); learned.delete(key); });
  } else {
    keys.forEach((key) => { learned.delete(key); review.delete(key); });
  }

  const key = vocabularyCardKey(word);
  const updatedAt = Math.max(now, (current.cards?.[key]?.updatedAt ?? 0) + 1);
  return { ...current, learnedKeys: [...learned], reviewKeys: [...review], legacyMigrated: current.legacyMigrated,
    cards: { ...current.cards, [key]: { status, updatedAt, dueAt: now, intervalMinutes: 0 } } };
}

export function scheduleVocabularyReview(current: VocabularyProgress, word: VocabularyIdentity, minutes: number, now = Date.now()): VocabularyProgress {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 525600) throw new Error("Choose a review interval between 0 and 365 days.");
  const next = setVocabularyStatus(current, word, "review", now);
  const key = vocabularyCardKey(word);
  return { ...next, cards: { ...next.cards, [key]: { ...next.cards![key], dueAt: now + minutes * 60000, intervalMinutes: minutes } } };
}

export function vocabularyReviewDueAt(progress: VocabularyProgress, word: VocabularyIdentity) {
  return isVocabularyReview(progress, word) ? progress.cards?.[vocabularyCardKey(word)]?.dueAt ?? 0 : Infinity;
}


export function recordVocabularyGuess(current: VocabularyProgress, word: VocabularyIdentity, correct: boolean, now = Date.now()) {
  const next = setVocabularyStatus(current, word, correct ? "learned" : "review", now);
  const previous = readGuessStreak(current.guessStreak) ?? { current: 0, best: 0, updatedAt: 0 };
  const streak = correct ? previous.current + 1 : 0;
  next.guessStreak = { current: streak, best: Math.max(previous.best, streak), updatedAt: Math.max(now, previous.updatedAt + 1) };
  const key = vocabularyCardKey(word);
  if (!correct && current.cards?.[key]?.memory) next.cards![key].memory = current.cards[key].memory;
  return next;
}

export function isVocabularyLearned(progress: VocabularyProgress, word: VocabularyIdentity) {
  const card = progress.cards?.[vocabularyCardKey(word)];
  if (card) return card.status === "learned";
  return vocabularyProgressKeys(word).some((key) => progress.learnedKeys.includes(key));
}

export function isVocabularyReview(progress: VocabularyProgress, word: VocabularyIdentity) {
  const card = progress.cards?.[vocabularyCardKey(word)];
  if (card) return card.status === "review";
  const keys = vocabularyProgressKeys(word);
  return !keys.some((key) => progress.learnedKeys.includes(key)) && keys.some((key) => progress.reviewKeys.includes(key));
}

export function readVocabularyProgress(storage: StorageLike, catalog: VocabularyIdentity[] = []) {
  const stored = parseObject(storage.getItem(VOCABULARY_PROGRESS_STORAGE_KEY));
  const learned = new Set(stringArray(stored.learnedKeys).map(normalizeStoredVocabularyKey));
  const review = new Set(stringArray(stored.reviewKeys).map(normalizeStoredVocabularyKey));
  const byId = new Map(catalog.flatMap((word) => [word.id, ...(word.progressAliases ?? []).map((alias) => alias.id)]
    .filter((id): id is string => !!id).map((id) => [id, word] as const)));
  const shouldMigrateLegacy = catalog.length > 0 && stored.legacyMigrated !== true;

  if (shouldMigrateLegacy) {
    for (const legacyKey of VOCABULARY_LEGACY_STORAGE_KEYS) {
      const legacy = parseObject(storage.getItem(legacyKey));
      for (const id of stringArray(legacy.completed)) {
        const word = byId.get(id);
        if (word) vocabularyProgressKeys(word).forEach((key) => learned.add(key));
      }
      for (const id of stringArray(legacy.review)) {
        const word = byId.get(id);
        if (word) vocabularyProgressKeys(word).forEach((key) => { if (!learned.has(key)) review.add(key); });
      }
    }
  }

  const cards = readReviewCards(stored.cards);
  for (const word of catalog) {
    if (!word.progressAliases?.length) continue;
    const key = vocabularyCardKey(word);
    const keys = vocabularyProgressKeys(word);
    // Carry forward the latest FSRS state without deleting historical keys.
    const candidates = keys.filter((value) => value.startsWith("de:")).flatMap((value) => cards[value] ? [cards[value]] : []);
    candidates.sort((a, b) => {
      const left = JSON.stringify(a); const right = JSON.stringify(b);
      return b.updatedAt - a.updatedAt || (left === right ? 0 : right > left ? 1 : -1);
    });
    if (candidates.length) cards[key] = candidates[0];
    if (keys.some((value) => learned.has(value))) learned.add(key);
    if (keys.some((value) => review.has(value))) review.add(key);
  }
  for (const key of learned) review.delete(key);
  return {
    learnedKeys: [...learned],
    reviewKeys: [...review],
    legacyMigrated: stored.legacyMigrated === true || shouldMigrateLegacy,
    ...(readGuessStreak(stored.guessStreak) ? { guessStreak: readGuessStreak(stored.guessStreak) } : {}),
    ...(stored.cards ? { cards } : {}),
    ...(Object.keys(readCollectedWords(stored.words)).length ? { words: readCollectedWords(stored.words) } : {}),
    ...(Object.keys(readVocabularyRecalls(stored.recalls)).length ? { recalls: readVocabularyRecalls(stored.recalls) } : {}),
  };
}

export function writeVocabularyProgress(storage: StorageLike, progress: VocabularyProgress) {
  storage.setItem(VOCABULARY_PROGRESS_STORAGE_KEY, JSON.stringify({
    learnedKeys: unique(progress.learnedKeys),
    reviewKeys: unique(progress.reviewKeys.filter((key) => !progress.learnedKeys.includes(key))),
    legacyMigrated: progress.legacyMigrated,
    ...(readGuessStreak(progress.guessStreak) ? { guessStreak: readGuessStreak(progress.guessStreak) } : {}),
    ...(progress.cards ? { cards: progress.cards } : {}),
    ...(progress.words ? { words: readCollectedWords(progress.words) } : {}),
    ...(progress.recalls ? { recalls: readVocabularyRecalls(progress.recalls) } : {}),
  }));
}

export function readGrammarProgress(storage: StorageLike): GrammarProgress {
  const stored = parseObject(storage.getItem(GRAMMAR_PROGRESS_STORAGE_KEY));
  const rawSets = stored.sets && typeof stored.sets === "object" && !Array.isArray(stored.sets)
    ? stored.sets as Record<string, unknown>
    : {};
  return {
    completed: stringArray(stored.completed),
    scores: numericRecord(stored.scores),
    sets: Object.fromEntries(Object.entries(rawSets).map(([lessonId, sets]) => [lessonId, numericRecord(sets)])),
  };
}

export function writeGrammarProgress(storage: StorageLike, progress: GrammarProgress) {
  storage.setItem(GRAMMAR_PROGRESS_STORAGE_KEY, JSON.stringify({
    completed: unique(progress.completed),
    scores: progress.scores,
    sets: progress.sets,
  }));
}

export function readCourseProgress(storage: StorageLike): StoredCourseProgress {
  const stored = parseObject(storage.getItem(COURSE_PROGRESS_STORAGE_KEY));
  const chapters = stored.chapters && typeof stored.chapters === "object" && !Array.isArray(stored.chapters)
    ? stored.chapters as Record<string, StoredChapterProgress>
    : {};
  return { chapters };
}

export function mergeCourseProgressWithGrammar(course: StoredCourseProgress, grammar: GrammarProgress): StoredCourseProgress {
  const chapters = { ...course.chapters };
  const lessonIds = new Set([...Object.keys(grammar.sets), ...Object.keys(grammar.scores)]);

  for (const lessonId of lessonIds) {
    const current = chapters[lessonId] ?? {};
    const grammarScore = grammar.scores[lessonId] ?? 0;
    chapters[lessonId] = {
      ...current,
      grammarSets: maximumScores(current.grammarSets, grammar.sets[lessonId]),
      skillScores: {
        ...(current.skillScores ?? {}),
        grammar: Math.max(current.skillScores?.grammar ?? 0, grammarScore),
      },
    };
  }

  return { chapters };
}

export function mergeGrammarProgressWithCourse(
  grammar: GrammarProgress,
  course: StoredCourseProgress,
  requiredSets: Record<string, string[]>,
): GrammarProgress {
  const completed = new Set(grammar.completed);
  const scores = { ...grammar.scores };
  const sets = { ...grammar.sets };

  for (const [lessonId, chapter] of Object.entries(course.chapters)) {
    const chapterSets = chapter.grammarSets ?? {};
    if (!Object.keys(chapterSets).length && chapter.skillScores?.grammar === undefined) continue;
    sets[lessonId] = maximumScores(sets[lessonId], chapterSets);
    scores[lessonId] = Math.max(scores[lessonId] ?? 0, chapter.skillScores?.grammar ?? 0);
    const requirements = requiredSets[lessonId] ?? [];
    if (requirements.length && requirements.every((name) => sets[lessonId]?.[name] !== undefined)) completed.add(lessonId);
  }

  return { completed: [...completed], scores, sets };
}

export function syncGrammarLessonToLibrary(
  storage: StorageLike,
  lessonId: string,
  lessonSets: Record<string, number>,
  score: number,
  completed: boolean,
) {
  const current = readGrammarProgress(storage);
  const completedLessons = new Set(current.completed);
  if (completed) completedLessons.add(lessonId);
  const next = {
    completed: [...completedLessons],
    scores: { ...current.scores, [lessonId]: Math.max(current.scores[lessonId] ?? 0, score) },
    sets: { ...current.sets, [lessonId]: { ...(current.sets[lessonId] ?? {}), ...lessonSets } },
  };
  writeGrammarProgress(storage, next);
  return next;
}

export function syncGrammarLessonToCourse(
  storage: StorageLike,
  lessonId: string,
  lessonSets: Record<string, number>,
  score: number,
) {
  const course = readCourseProgress(storage);
  const current = course.chapters[lessonId] ?? {};
  const next: StoredCourseProgress = {
    chapters: {
      ...course.chapters,
      [lessonId]: {
        ...current,
        grammarSets: { ...(current.grammarSets ?? {}), ...lessonSets },
        skillScores: { ...(current.skillScores ?? {}), grammar: Math.max(current.skillScores?.grammar ?? 0, score) },
      },
    },
  };
  storage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(next));
  return next;
}
