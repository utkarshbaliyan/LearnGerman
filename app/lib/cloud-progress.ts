"use client";

import {
  COURSE_PROGRESS_STORAGE_KEY,
  GRAMMAR_PROGRESS_STORAGE_KEY,
  VOCABULARY_PROGRESS_STORAGE_KEY,
} from "@/app/lib/progress-sync";
import { putCloudProgress, setCloudAuthenticated, type CloudProgressScope } from "@/app/lib/cloud-progress-save";
import { PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";

export { PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";

const STORAGE_KEYS: Record<CloudProgressScope, string> = {
  course: COURSE_PROGRESS_STORAGE_KEY,
  stories: STORY_PROGRESS_STORAGE_KEY,
  grammar: GRAMMAR_PROGRESS_STORAGE_KEY,
  vocabulary: VOCABULARY_PROGRESS_STORAGE_KEY,
};

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numbers(value: unknown) {
  return Object.fromEntries(Object.entries(object(value)).filter((entry): entry is [string, number] => typeof entry[1] === "number"));
}

function maxNumbers(left: unknown, right: unknown) {
  const result = { ...numbers(left) };
  for (const [key, value] of Object.entries(numbers(right))) result[key] = Math.max(result[key] ?? 0, value);
  return result;
}

function mergeCourse(local: unknown, remote: unknown) {
  const localChapters = object(object(local).chapters);
  const remoteChapters = object(object(remote).chapters);
  const chapters: Record<string, unknown> = {};
  for (const id of new Set([...Object.keys(remoteChapters), ...Object.keys(localChapters)])) {
    const a = object(remoteChapters[id]);
    const b = object(localChapters[id]);
    chapters[id] = {
      ...a,
      ...b,
      completed: a.completed === true || b.completed === true,
      checkpointScore: Math.max(Number(a.checkpointScore) || 0, Number(b.checkpointScore) || 0),
      skillScores: maxNumbers(a.skillScores, b.skillScores),
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
  for (const id of new Set([...Object.keys(remoteSets), ...Object.keys(localSets)])) sets[id] = maxNumbers(remoteSets[id], localSets[id]);
  return {
    completed: [...new Set([...strings(a.completed), ...strings(b.completed)])],
    scores: maxNumbers(a.scores, b.scores),
    sets,
  };
}

function mergeVocabulary(local: unknown, remote: unknown) {
  const a = object(remote);
  const b = object(local);
  const learnedKeys = [...new Set([...strings(a.learnedKeys), ...strings(b.learnedKeys)])];
  const learned = new Set(learnedKeys);
  return {
    learnedKeys,
    reviewKeys: [...new Set([...strings(a.reviewKeys), ...strings(b.reviewKeys)])].filter((key) => !learned.has(key)),
    legacyMigrated: a.legacyMigrated === true || b.legacyMigrated === true,
  };
}

export function mergeProgress(scope: CloudProgressScope, local: unknown, remote: unknown): unknown {
  if (scope === "course") return mergeCourse(local, remote);
  if (scope === "stories") return [...new Set([...strings(remote), ...strings(local)])];
  if (scope === "grammar") return mergeGrammar(local, remote);
  return mergeVocabulary(local, remote);
}

function readLocal(scope: CloudProgressScope) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS[scope]) ?? (scope === "stories" ? "[]" : "{}")); }
  catch { return scope === "stories" ? [] : {}; }
}

export async function synchronizeCloudProgress() {
  const response = await authenticatedFetch("/api/progress", { cache: "no-store" });
  if (!response.ok) {
    if (response.status === 401) setCloudAuthenticated(false);
    return { authenticated: false, synced: false };
  }
  setCloudAuthenticated(true);
  const payload = await response.json() as { progress?: Record<string, unknown> };
  const remote = payload.progress ?? {};

  for (const scope of Object.keys(STORAGE_KEYS) as CloudProgressScope[]) {
    const merged = mergeProgress(scope, readLocal(scope), remote[scope]);
    localStorage.setItem(STORAGE_KEYS[scope], JSON.stringify(merged));
    await putCloudProgress(scope, merged);
  }
  window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT));
  return { authenticated: true, synced: true };
}
