"use client";

import { useCallback, useEffect, useState } from "react";

import {
  VOCABULARY_PROGRESS_STORAGE_KEY,
  emptyVocabularyProgress,
  isVocabularyLearned,
  isVocabularyReview,
  readVocabularyProgress,
  setVocabularyStatus,
  markVocabularyRead,
  recordVocabularyGuess,
  collectVocabularyWord,
  type CollectWordInput,
  type VocabularyRecallAttempt,
  type VocabularyIdentity,
  type VocabularyProgress,
} from "@/app/lib/progress-sync";
import { PROGRESS_SYNCED_EVENT } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";
import type { FlashcardRating } from "@/app/lib/flashcard-scheduler";
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from "@/app/lib/cloud-progress-keys";
import { LEARNING_STORAGE_KEY } from '@/app/lib/learning-state';
import { migrateReadingVocabulary } from '@/app/lib/saved-vocabulary';

const EMPTY_CATALOG: VocabularyIdentity[] = [];

export function useVocabularyProgress(catalog: VocabularyIdentity[] = EMPTY_CATALOG) {
  const [progress, setProgress] = useState<VocabularyProgress>(emptyVocabularyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState('');

  const readLatest = useCallback(() => {
    const value = readVocabularyProgress(localStorage, catalog);
    const legacy = JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) ?? '{}');
    return migrateReadingVocabulary(value, legacy);
  }, [catalog]);

  const update = useCallback((change: (current: VocabularyProgress) => VocabularyProgress) => {
    try {
      const next = change(readLatest());
      queueCloudProgress('vocabulary', next);
      setProgress(next); setStorageError(''); return true;
    } catch (error) { setStorageError(error instanceof Error ? error.message : 'Your vocabulary could not be saved. Enable browser storage and try again.'); return false; }
  }, [readLatest]);

  useEffect(() => {
    const refreshProgress = () => {
      try {
        const next = readLatest();
        if (JSON.stringify(next) !== localStorage.getItem(VOCABULARY_PROGRESS_STORAGE_KEY)) queueCloudProgress('vocabulary', next);
        setProgress(next); setStorageError('');
      } catch { setStorageError('Your vocabulary could not load. Enable browser storage and try again.'); }
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refreshProgress);
    const refresh = (event: StorageEvent) => {
      if (event.key === VOCABULARY_PROGRESS_STORAGE_KEY || event.key === LEARNING_STORAGE_KEY || event.key === CLOUD_PROGRESS_OWNER_STORAGE_KEY || event.key === null) refreshProgress();
    };
    window.addEventListener("storage", refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refreshProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PROGRESS_SYNCED_EVENT, refreshProgress);
    };
  }, [readLatest]);

  const setLearned = useCallback((word: VocabularyIdentity, learned: boolean) => {
    return update(current => setVocabularyStatus(current, word, learned ? "learned" : "unlearned"));
  }, [update]);

  const setReview = useCallback((word: VocabularyIdentity, review: boolean) => {
    return update(current => setVocabularyStatus(current, word, review ? "review" : "unlearned"));
  }, [update]);

  const importLearned = useCallback((words: VocabularyIdentity[]) => {
    return update((current) => {
      let next = current;
      for (const word of words) {
        if (!isVocabularyLearned(next, word) && !isVocabularyReview(next, word)) next = setVocabularyStatus(next, word, "learned");
      }
      return next;
    });
  }, [update]);

  const rateFlashcard = useCallback(async (word: VocabularyIdentity, rating: FlashcardRating, recall?: VocabularyRecallAttempt) => {
    const owner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    await import("@/app/lib/flashcard-progress").then(({ rateVocabularyFlashcard }) => {
      if (owner !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) throw new Error('Account changed. Reload your progress.');
      if (!update(current => rateVocabularyFlashcard(current, word, rating, Date.now(), recall))) throw new Error('Your review could not be saved.');
    });
  }, [update]);
  const recordGuess = useCallback((word: VocabularyIdentity, correct: boolean) => {
    return update(current => recordVocabularyGuess(current, word, correct));
  }, [update]);
  const saveWord = useCallback((word: CollectWordInput) => update(current => collectVocabularyWord(current, word)), [update]);
  const markAsRead = useCallback((word: VocabularyIdentity) => update(current => markVocabularyRead(current, word)), [update]);

  return {
    progress,
    hydrated,
    storageError,
    saveWord,
    markAsRead,
    isLearned: useCallback((word: VocabularyIdentity) => isVocabularyLearned(progress, word), [progress]),
    isReview: useCallback((word: VocabularyIdentity) => isVocabularyReview(progress, word), [progress]),
    setLearned,
    setReview,
    importLearned,
    rateFlashcard,
    recordGuess,
  };
}
