"use client";

import { authenticatedFetch } from "@/app/lib/authenticated-fetch";

export type CloudProgressScope = "course" | "stories" | "grammar" | "vocabulary";

type PendingProgress = { data: unknown; revision: number };

const saveTimers = new Map<CloudProgressScope, ReturnType<typeof setTimeout>>();
const pendingProgress = new Map<CloudProgressScope, PendingProgress>();
const savingScopes = new Set<CloudProgressScope>();
let cloudAuthenticated: boolean | null = null;
let savesPaused = 0;
let nextRevision = 0;

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

export async function putCloudProgress(scope: CloudProgressScope, data: unknown) {
  const response = await authenticatedFetch("/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scope, data }),
  });
  if (response.status === 401) cloudAuthenticated = false;
  else if (response.ok) cloudAuthenticated = true;
  if (!response.ok) throw new Error(`Progress save failed with ${response.status}`);
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
        await putCloudProgress(scope, pending.data);
      } catch {
        if (!pendingProgress.has(scope)) pendingProgress.set(scope, pending);
        if (!cloudSavesBlocked()) scheduleCloudProgress(scope, 1_500);
        break;
      }
    }
  } finally {
    savingScopes.delete(scope);
  }
}

export function queueCloudProgress(scope: CloudProgressScope, data: unknown) {
  pendingProgress.set(scope, { data, revision: ++nextRevision });
  if (savesPaused === 0 && cloudAuthenticated !== false) scheduleCloudProgress(scope);
}
