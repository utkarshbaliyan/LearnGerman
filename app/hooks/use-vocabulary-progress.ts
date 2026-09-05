"use client";

import { useCallback, useEffect, useState } from "react";

import {
  VOCABULARY_PROGRESS_STORAGE_KEY,
  emptyVocabularyProgress,
  isVocabularyLearned,
  isVocabularyReview,
  readVocabularyProgress,
  setVocabularyStatus,
  scheduleVocabularyReview,
  recordVocabularyGuess,
  writeVocabularyProgress,
  type VocabularyIdentity,
  type VocabularyProgress,
} from "@/app/lib/progress-sync";
import { PROGRESS_SYNCED_EVENT } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";

const EMPTY_CATALOG: VocabularyIdentity[] = [];

export function useVocabularyProgress(catalog: VocabularyIdentity[] = EMPTY_CATALOG) {
  const [progress, setProgress] = useState<VocabularyProgress>(emptyVocabularyProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refreshProgress = () => {
      setProgress(readVocabularyProgress(localStorage, catalog));
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refreshProgress);
    const refresh = (event: StorageEvent) => {
      if (event.key === VOCABULARY_PROGRESS_STORAGE_KEY) setProgress(readVocabularyProgress(localStorage, catalog));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refreshProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PROGRESS_SYNCED_EVENT, refreshProgress);
    };
  }, [catalog]);

  useEffect(() => {
    if (hydrated) {
      writeVocabularyProgress(localStorage, progress);
      queueCloudProgress("vocabulary", progress);
    }
  }, [hydrated, progress]);

  const setLearned = useCallback((word: VocabularyIdentity, learned: boolean) => {
    setProgress((current) => setVocabularyStatus(current, word, learned ? "learned" : "unlearned"));
  }, []);

  const setReview = useCallback((word: VocabularyIdentity, review: boolean) => {
    setProgress((current) => setVocabularyStatus(current, word, review ? "review" : "unlearned"));
  }, []);

  const importLearned = useCallback((words: VocabularyIdentity[]) => {
    setProgress((current) => {
      let next = current;
      for (const word of words) {
        if (!isVocabularyLearned(next, word) && !isVocabularyReview(next, word)) next = setVocabularyStatus(next, word, "learned");
      }
      return next;
    });
  }, []);

  const scheduleReview = useCallback((word: VocabularyIdentity, minutes: number) => {
    setProgress((current) => scheduleVocabularyReview(current, word, minutes));
  }, []);
  const recordGuess = useCallback((word: VocabularyIdentity, correct: boolean) => {
    setProgress((current) => recordVocabularyGuess(current, word, correct));
  }, []);

  return {
    progress,
    hydrated,
    isLearned: useCallback((word: VocabularyIdentity) => isVocabularyLearned(progress, word), [progress]),
    isReview: useCallback((word: VocabularyIdentity) => isVocabularyReview(progress, word), [progress]),
    setLearned,
    setReview,
    importLearned,
    scheduleReview,
    recordGuess,
  };
}
