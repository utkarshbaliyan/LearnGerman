"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "leselaut:story-progress:v1";

export function useStoryProgress() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
        if (Array.isArray(stored)) {
          setCompletedIds(new Set(stored.filter((value): value is string => typeof value === "string")));
        }
      } catch {
        // Ignore an invalid device-local value and start with a clean course state.
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedIds]));
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
