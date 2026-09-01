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
};

export type VocabularyProgress = {
  learnedKeys: string[];
  reviewKeys: string[];
  legacyMigrated: boolean;
};

export type GrammarProgress = {
  completed: string[];
  scores: Record<string, number>;
  sets: Record<string, Record<string, number>>;
};

type StoredChapterProgress = {
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

function unique(values: Iterable<string>) {
  return [...new Set(values)];
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
  const english = normalizeMeaning(word.english);
  if (english) return `en:${english}`;
  return `de:${normalizeMeaning(word.german)}`;
}

export function vocabularyProgressKeys(word: VocabularyIdentity) {
  const english = normalizeMeaning(word.english);
  const german = normalizeMeaning(word.german.split(",")[0].replace(/^(der|die|das|ein|eine)\s+/i, ""));
  return unique([
    english ? `en:${english}` : "",
    german ? `de:${german}` : "",
  ].filter(Boolean));
}

export function emptyVocabularyProgress(): VocabularyProgress {
  return { learnedKeys: [], reviewKeys: [], legacyMigrated: false };
}

export function setVocabularyStatus(
  current: VocabularyProgress,
  word: VocabularyIdentity,
  status: "learned" | "review" | "unlearned",
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

  return { learnedKeys: [...learned], reviewKeys: [...review], legacyMigrated: current.legacyMigrated };
}

export function isVocabularyLearned(progress: VocabularyProgress, word: VocabularyIdentity) {
  return vocabularyProgressKeys(word).some((key) => progress.learnedKeys.includes(key));
}

export function isVocabularyReview(progress: VocabularyProgress, word: VocabularyIdentity) {
  const keys = vocabularyProgressKeys(word);
  return !keys.some((key) => progress.learnedKeys.includes(key)) && keys.some((key) => progress.reviewKeys.includes(key));
}

export function readVocabularyProgress(storage: StorageLike, catalog: VocabularyIdentity[] = []) {
  const stored = parseObject(storage.getItem(VOCABULARY_PROGRESS_STORAGE_KEY));
  const learned = new Set(stringArray(stored.learnedKeys));
  const review = new Set(stringArray(stored.reviewKeys));
  const byId = new Map(catalog.filter((word) => word.id).map((word) => [word.id!, word]));
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

  for (const key of learned) review.delete(key);
  return {
    learnedKeys: [...learned],
    reviewKeys: [...review],
    legacyMigrated: stored.legacyMigrated === true || shouldMigrateLegacy,
  };
}

export function writeVocabularyProgress(storage: StorageLike, progress: VocabularyProgress) {
  storage.setItem(VOCABULARY_PROGRESS_STORAGE_KEY, JSON.stringify({
    learnedKeys: unique(progress.learnedKeys),
    reviewKeys: unique(progress.reviewKeys.filter((key) => !progress.learnedKeys.includes(key))),
    legacyMigrated: progress.legacyMigrated,
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
      grammarSets: { ...(current.grammarSets ?? {}), ...(grammar.sets[lessonId] ?? {}) },
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
    sets[lessonId] = { ...(sets[lessonId] ?? {}), ...chapterSets };
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
