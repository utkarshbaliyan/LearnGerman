"use client";

import { useCallback, useEffect, useState } from "react";

import {
  VOCABULARY_PROGRESS_STORAGE_KEY,
  emptyVocabularyProgress,
  isVocabularyLearned,
  isVocabularyReview,
  readVocabularyProgress,
  setVocabularyStatus,
  vocabularyProgressKeys,
  writeVocabularyProgress,
  type VocabularyIdentity,
  type VocabularyProgress,
} from "@/app/lib/progress-sync";

const EMPTY_CATALOG: VocabularyIdentity[] = [];

export function useVocabularyProgress(catalog: VocabularyIdentity[] = EMPTY_CATALOG) {
  const [progress, setProgress] = useState<VocabularyProgress>(emptyVocabularyProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProgress(readVocabularyProgress(localStorage, catalog));
      setHydrated(true);
    });
    const refresh = (event: StorageEvent) => {
      if (event.key === VOCABULARY_PROGRESS_STORAGE_KEY) setProgress(readVocabularyProgress(localStorage, catalog));
    };
    window.addEventListener("storage", refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", refresh);
    };
  }, [catalog]);

  useEffect(() => {
    if (hydrated) writeVocabularyProgress(localStorage, progress);
  }, [hydrated, progress]);

  const setLearned = useCallback((word: VocabularyIdentity, learned: boolean) => {
    setProgress((current) => setVocabularyStatus(current, word, learned ? "learned" : "unlearned"));
  }, []);

  const setReview = useCallback((word: VocabularyIdentity, review: boolean) => {
    setProgress((current) => setVocabularyStatus(current, word, review ? "review" : "unlearned"));
  }, []);

  const importLearned = useCallback((words: VocabularyIdentity[]) => {
    setProgress((current) => {
      const learned = new Set(current.learnedKeys);
      const review = new Set(current.reviewKeys);
      for (const word of words) {
        vocabularyProgressKeys(word).forEach((key) => {
          learned.add(key);
          review.delete(key);
        });
      }
      if (learned.size === current.learnedKeys.length && review.size === current.reviewKeys.length) return current;
      return { learnedKeys: [...learned], reviewKeys: [...review], legacyMigrated: current.legacyMigrated };
    });
  }, []);

  return {
    progress,
    hydrated,
    isLearned: useCallback((word: VocabularyIdentity) => isVocabularyLearned(progress, word), [progress]),
    isReview: useCallback((word: VocabularyIdentity) => isVocabularyReview(progress, word), [progress]),
    setLearned,
    setReview,
    importLearned,
  };
}
