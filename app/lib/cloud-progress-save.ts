"use client";

import { authenticatedFetch } from "@/app/lib/authenticated-fetch";

export type CloudProgressScope = "course" | "stories" | "grammar" | "vocabulary";

const saveTimers = new Map<CloudProgressScope, ReturnType<typeof setTimeout>>();
let cloudAuthenticated: boolean | null = null;

export function setCloudAuthenticated(value: boolean) {
  cloudAuthenticated = value;
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

export function queueCloudProgress(scope: CloudProgressScope, data: unknown) {
  const current = saveTimers.get(scope);
  if (current) clearTimeout(current);
  saveTimers.set(scope, setTimeout(() => {
    saveTimers.delete(scope);
    if (cloudAuthenticated !== true) return;
    void putCloudProgress(scope, data).catch(() => {});
  }, 700));
}
