"use client";

import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_STORAGE_KEYS, PROGRESS_SYNCED_EVENT } from "./cloud-progress-keys";
import { mergeProgress } from "./progress-merge";

export type CloudProgressScope = "course" | "stories" | "grammar" | "vocabulary";

type PendingProgress = { data: unknown; revision: number; owner: string | null };

const saveTimers = new Map<CloudProgressScope, ReturnType<typeof setTimeout>>();
const pendingProgress = new Map<CloudProgressScope, PendingProgress>();
const savingScopes = new Set<CloudProgressScope>();
let cloudAuthenticated: boolean | null = null;
let savesPaused = 0;
let nextRevision = 0;
const lastQueued = new Map<CloudProgressScope, string>();

export function clearPendingProgress() {
  pendingProgress.clear();
  lastQueued.clear();
  for (const timer of saveTimers.values()) clearTimeout(timer);
  saveTimers.clear();
}

export function cacheCloudProgress(scope: CloudProgressScope, data: unknown) {
  const serialized = JSON.stringify(data);
  if (localStorage.getItem(PROGRESS_STORAGE_KEYS[scope]) === serialized) return;
  localStorage.setItem(PROGRESS_STORAGE_KEYS[scope], serialized);
  queueMicrotask(() => window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT)));
}

function cloudSavesBlocked() {
  return savesPaused > 0 || cloudAuthenticated === false;
}

function scheduleCloudProgress(scope: CloudProgressScope, delay = 120) {
  const current = saveTimers.get(scope);
  if (current) clearTimeout(current);
  saveTimers.set(scope, setTimeout(() => {
    saveTimers.delete(scope);
    void flushCloudProgress(scope);
  }, delay));
}

export function setCloudAuthenticated(value: boolean) {
  cloudAuthenticated = value;
  if (value && savesPaused === 0) {
    for (const scope of pendingProgress.keys()) scheduleCloudProgress(scope, 0);
  }
}

export function pauseCloudProgressSaves() {
  savesPaused += 1;
  for (const timer of saveTimers.values()) clearTimeout(timer);
  saveTimers.clear();
}

export function resumeCloudProgressSaves(authenticated: boolean | null) {
  savesPaused = Math.max(0, savesPaused - 1);
  cloudAuthenticated = authenticated;
  if (savesPaused === 0 && authenticated !== false) {
    for (const scope of pendingProgress.keys()) scheduleCloudProgress(scope, 0);
  }
}

export function queuedCloudProgressRevision(scope: CloudProgressScope) {
  return pendingProgress.get(scope)?.revision ?? 0;
}

export function acknowledgeCloudProgress(scope: CloudProgressScope, throughRevision: number) {
  const pending = pendingProgress.get(scope);
  if (pending && pending.revision <= throughRevision) pendingProgress.delete(scope);
}

export async function putCloudProgress(scope: CloudProgressScope, data: unknown, owner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) {
  const response = await authenticatedFetch("/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json", ...(owner ? { "x-progress-owner": owner } : {}) },
    body: JSON.stringify({ scope, data }),
  });
  if (response.status === 401) cloudAuthenticated = false;
  else if (response.ok) cloudAuthenticated = true;
  if (!response.ok) throw new Error(`Progress save failed with ${response.status}`);
  const payload = await response.json() as { data?: unknown; userId?: string };
  return payload;
}

export async function flushCloudProgress(scope: CloudProgressScope) {
  if (savingScopes.has(scope) || cloudSavesBlocked()) return;
  savingScopes.add(scope);
  try {
    while (pendingProgress.has(scope) && !cloudSavesBlocked()) {
      const pending = pendingProgress.get(scope);
      if (!pending) break;
      pendingProgress.delete(scope);
      try {
        const saved = await putCloudProgress(scope, pending.data, pending.owner);
        if (saved.data !== undefined && saved.userId === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) {
          let local: unknown = {};
          try { local = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEYS[scope]) ?? "{}"); } catch { /* Use the saved record. */ }
          cacheCloudProgress(scope, mergeProgress(scope, local, saved.data));
        }
      } catch {
        if (!pendingProgress.has(scope) && pending.owner === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) pendingProgress.set(scope, pending);
        if (!cloudSavesBlocked()) scheduleCloudProgress(scope, 1_500);
        break;
      }
    }
  } finally {
    savingScopes.delete(scope);
  }
}

export function queueCloudProgress(scope: CloudProgressScope, data: unknown) {
  const serialized = JSON.stringify(data);
  if (lastQueued.get(scope) === serialized) return;
  lastQueued.set(scope, serialized);
  cacheCloudProgress(scope, data);
  queueMicrotask(() => window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT)));
  pendingProgress.set(scope, { data, revision: ++nextRevision, owner: localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY) });
  if (savesPaused === 0 && cloudAuthenticated !== false) scheduleCloudProgress(scope);
}
