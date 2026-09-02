"use client";

import { useCallback, useEffect, useState } from "react";
import { PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";

export function useStoryProgress() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORY_PROGRESS_STORAGE_KEY) ?? "[]") as unknown;
        if (Array.isArray(stored)) {
          setCompletedIds(new Set(stored.filter((value): value is string => typeof value === "string")));
        }
      } catch {
        // Ignore an invalid device-local value and start with a clean course state.
      }
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); };
  }, []);

  useEffect(() => {
    if (hydrated) {
      const completed = [...completedIds];
      localStorage.setItem(STORY_PROGRESS_STORAGE_KEY, JSON.stringify(completed));
      queueCloudProgress("stories", completed);
    }
  }, [completedIds, hydrated]);

  const setStoryCompleted = useCallback((storyId: string, completed = true) => {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (completed) next.add(storyId);
      else next.delete(storyId);
      return next;
    });
  }, []);

  const toggleStoryCompleted = useCallback((storyId: string) => {
    setCompletedIds((current) => {
      const next = new Set(current);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }, []);

  return { completedIds, hydrated, setStoryCompleted, toggleStoryCompleted };
}
