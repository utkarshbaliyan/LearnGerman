"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PROGRESS_SYNCED_EVENT, STORY_PROGRESS_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";
import { markStory, readStoryProgress, type StoryProgress } from "@/app/lib/story-progress";

export function useStoryProgress() {
  const [progress, setProgress] = useState<StoryProgress>({ entries: {} });
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState('');
  const completedIds = useMemo(() => new Set(Object.entries(progress.entries).filter(([, item]) => item.completed).map(([id]) => id)), [progress]);
  useEffect(() => {
    const refresh = () => {
      try { setProgress(readStoryProgress(JSON.parse(localStorage.getItem(STORY_PROGRESS_STORAGE_KEY) ?? "[]"))); setStorageError(''); }
      catch { setProgress({ entries: {} }); setStorageError('Your story progress could not load. Enable browser storage and try again.'); }
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const changeStory = useCallback((id: string, completed?: boolean) => {
    try {
      // Other tabs/components may have saved since this hook last rendered.
      const latest = readStoryProgress(JSON.parse(localStorage.getItem(STORY_PROGRESS_STORAGE_KEY) ?? '[]'));
      const next = markStory(latest, id, completed ?? !latest.entries[id]?.completed);
      queueCloudProgress('stories', next); setProgress(next); setStorageError(''); return true;
    } catch { setStorageError('Your story progress could not be saved. Enable browser storage and try again.'); return false; }
  }, []);
  const setStoryCompleted = useCallback((id: string, completed = true) => changeStory(id, completed), [changeStory]);
  const toggleStoryCompleted = useCallback((id: string) => changeStory(id), [changeStory]);
  return { progress, completedIds, hydrated, storageError, setStoryCompleted, toggleStoryCompleted };
}
