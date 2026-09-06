"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";
import { markStory, readStoryProgress, type StoryProgress } from "@/app/lib/story-progress";

export function useStoryProgress() {
  const [progress, setProgress] = useState<StoryProgress>({ entries: {} });
  const [hydrated, setHydrated] = useState(false);
  const completedIds = useMemo(() => new Set(Object.entries(progress.entries).filter(([, item]) => item.completed).map(([id]) => id)), [progress]);
  useEffect(() => {
    const refresh = () => {
      try { setProgress(readStoryProgress(JSON.parse(localStorage.getItem(STORY_PROGRESS_STORAGE_KEY) ?? "[]"))); }
      catch { setProgress({ entries: {} }); }
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  useEffect(() => {
    if (hydrated) queueCloudProgress("stories", progress);
  }, [hydrated, progress]);
  const setStoryCompleted = useCallback((id: string, completed = true) => {
    setProgress((current) => markStory(current, id, completed));
  }, []);
  const toggleStoryCompleted = useCallback((id: string) => {
    setProgress((current) => markStory(current, id, !current.entries[id]?.completed));
  }, []);
  return { completedIds, hydrated, setStoryCompleted, toggleStoryCompleted };
}
