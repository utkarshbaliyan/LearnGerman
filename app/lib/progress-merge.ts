import { mergeReceptionProgress } from './reception-progress';
import { mergeComprehensionChecks } from "./comprehension-progress";
import { mergeReadingEditionChecks } from './reading-progress';
import { mergeVocabularyProgress } from "./progress-sync";
import { mergeStoryProgress } from "./story-progress";
import { mergeBookBookmark } from './book-bookmark';
import { mergeLearningProgress } from './learning-state';
import type { CloudProgressScope } from "./cloud-progress-save";
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const safeKey = (key: string) => !UNSAFE_KEYS.has(key);

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function safeRecord(value: unknown): Record<string, unknown> {
  return Object.fromEntries(Object.entries(object(value)).filter(([key]) => safeKey(key)));
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numbers(value: unknown) {
  return Object.fromEntries(
    Object.entries(object(value)).filter(
      (entry): entry is [string, number] => safeKey(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
}

function maxNumbers(left: unknown, right: unknown) {
  const result: Record<string, number> = { ...numbers(left) };
  for (const [key, value] of Object.entries(numbers(right))) {
    if (!safeKey(key)) continue;
    result[key] = Math.max(Object.hasOwn(result, key) ? result[key] : 0, value);
  }
  return result;
}

function mergeCourse(local: unknown, remote: unknown) {
  const localChapters = object(object(local).chapters);
  const remoteChapters = object(object(remote).chapters);
  const chapters: Record<string, unknown> = {};
  for (const id of new Set([...Object.keys(remoteChapters), ...Object.keys(localChapters)])) {
    if (!safeKey(id)) continue;
    const a = safeRecord(Object.hasOwn(remoteChapters, id) ? remoteChapters[id] : undefined);
    const b = safeRecord(Object.hasOwn(localChapters, id) ? localChapters[id] : undefined);
    chapters[id] = {
      ...a,
      ...b,
      completed: a.completed === true || b.completed === true,
      checkpointScore: Math.max(Number(a.checkpointScore) || 0, Number(b.checkpointScore) || 0),
      skillScores: maxNumbers(a.skillScores, b.skillScores),
      comprehensionChecks: mergeComprehensionChecks(a.comprehensionChecks, b.comprehensionChecks),
      reception: mergeReceptionProgress(a.reception, b.reception),
      readingEditions: mergeReadingEditionChecks(a.readingEditions, b.readingEditions),
      grammarSets: maxNumbers(a.grammarSets, b.grammarSets),
      knownWords: [...new Set([...strings(a.knownWords), ...strings(b.knownWords)])],
      writingDraft: String(b.writingDraft || a.writingDraft || ""),
      recordedSpeaking: a.recordedSpeaking === true || b.recordedSpeaking === true,
    };
  }
  return { chapters };
}

function mergeGrammar(local: unknown, remote: unknown) {
  const a = object(remote);
  const b = object(local);
  const sets: Record<string, Record<string, number>> = {};
  const remoteSets = object(a.sets);
  const localSets = object(b.sets);
  for (const id of new Set([...Object.keys(remoteSets), ...Object.keys(localSets)])) {
    if (!safeKey(id)) continue;
    sets[id] = maxNumbers(
      Object.hasOwn(remoteSets, id) ? remoteSets[id] : undefined,
      Object.hasOwn(localSets, id) ? localSets[id] : undefined,
    );
  }
  return {
    completed: [...new Set([...strings(a.completed), ...strings(b.completed)])],
    scores: maxNumbers(a.scores, b.scores),
    sets,
  };
}

function mergeVocabulary(local: unknown, remote: unknown) {
  return mergeVocabularyProgress(local, remote);
}

export function mergeProgress(scope: CloudProgressScope, local: unknown, remote: unknown): unknown {
  if (scope === "course") return mergeCourse(local, remote);
  if (scope === "stories") return mergeStoryProgress(local, remote);
  if (scope === "grammar") return mergeGrammar(local, remote);
  if (scope === "books") return mergeBookBookmark(local, remote);
  if (scope === 'learning') return mergeLearningProgress(local, remote);
  return mergeVocabulary(local, remote);
}
