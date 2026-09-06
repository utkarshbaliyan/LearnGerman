"use client";

import {
  COURSE_PROGRESS_STORAGE_KEY,
  GRAMMAR_PROGRESS_STORAGE_KEY,
  VOCABULARY_PROGRESS_STORAGE_KEY,
} from "@/app/lib/progress-sync";
import {
  acknowledgeCloudProgress,
  clearPendingProgress,
  pauseCloudProgressSaves,
  putCloudProgress,
  queuedCloudProgressRevision,
  resumeCloudProgressSaves,
  type CloudProgressScope,
} from "@/app/lib/cloud-progress-save";
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import { mergeProgress } from "./progress-merge";

export { PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";

const STORAGE_KEYS: Record<CloudProgressScope, string> = {
  course: COURSE_PROGRESS_STORAGE_KEY,
  stories: STORY_PROGRESS_STORAGE_KEY,
  grammar: GRAMMAR_PROGRESS_STORAGE_KEY,
  vocabulary: VOCABULARY_PROGRESS_STORAGE_KEY,
};

export { mergeProgress } from "./progress-merge";

function readLocal(scope: CloudProgressScope) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS[scope]) ?? (scope === "stories" ? "[]" : "{}")); }
  catch { return scope === "stories" ? [] : {}; }
}

async function performCloudSynchronization() {
  pauseCloudProgressSaves();
  try {
    const response = await authenticatedFetch("/api/progress", { cache: "no-store" });
    if (!response.ok) {
      resumeCloudProgressSaves(response.status === 401 ? false : null);
      return { authenticated: false, synced: false };
    }
    const payload = await response.json() as { progress?: Record<string, unknown>; userId?: string };
    const remote = payload.progress ?? {};
    if (!payload.userId) throw new Error("Authenticated progress response did not include an account ID.");
    const localOwner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    const canMergeLocal = !localOwner || localOwner === payload.userId;
    if (!canMergeLocal) {
      clearPendingProgress();
      for (const key of Object.values(STORAGE_KEYS)) localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT));
    }
    localStorage.setItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY, payload.userId);

    for (const scope of Object.keys(STORAGE_KEYS) as CloudProgressScope[]) {
      const local = canMergeLocal ? readLocal(scope) : scope === "stories" ? [] : {};
      const queuedRevision = queuedCloudProgressRevision(scope);
      const merged = mergeProgress(scope, local, remote[scope]);
      const saved = JSON.stringify(merged) === JSON.stringify(remote[scope]) ? { data: merged }
        : await putCloudProgress(scope, merged, payload.userId);
      if (localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY) !== payload.userId) {
        resumeCloudProgressSaves(false);
        return { authenticated: false, synced: false };
      }
      // Include actions taken while the network request was in flight.
      const latest = canMergeLocal ? readLocal(scope) : {};
      localStorage.setItem(STORAGE_KEYS[scope], JSON.stringify(mergeProgress(scope, latest, saved.data ?? merged)));
      acknowledgeCloudProgress(scope, queuedRevision);
    }
    localStorage.setItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY, payload.userId);
    resumeCloudProgressSaves(true);
    window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT));
    return { authenticated: true, synced: true };
  } catch (error) {
    resumeCloudProgressSaves(null);
    throw error;
  }
}

let activeSynchronization: Promise<{ authenticated: boolean; synced: boolean }> | null = null;

export function synchronizeCloudProgress() {
  if (!activeSynchronization) {
    activeSynchronization = performCloudSynchronization().finally(() => { activeSynchronization = null; });
  }
  return activeSynchronization;
}
