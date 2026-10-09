'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LEARNING_STORAGE_KEY, emptyLearningProgress, readLearningProgress, type LearningProgress } from '@/app/lib/learning-state';
import { PROGRESS_SYNCED_EVENT } from '@/app/lib/cloud-progress-keys';
import { queueCloudProgress } from '@/app/lib/cloud-progress-save';

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(emptyLearningProgress), [hydrated, setHydrated] = useState(false), [storageError, setStorageError] = useState('');
  const current = useRef(progress); current.current = progress;
  useEffect(() => {
    const refresh = () => { try { const p = readLearningProgress(JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) ?? '{}')); current.current = p; setProgress(p); setStorageError(''); } catch { setStorageError('This browser could not load your learning history. Enable browser storage before starting.'); } setHydrated(true); };
    refresh(); window.addEventListener('storage', refresh); window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); };
  }, []);
  const update = useCallback((change: (p: LearningProgress) => LearningProgress) => {
    try { const latest = readLearningProgress(JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) ?? '{}')); const next = readLearningProgress(change(latest)); queueCloudProgress('learning', next); current.current = next; setProgress(next); setStorageError(''); return true; }
    catch { setStorageError('Your change could not be saved. Enable browser storage and try again.'); return false; }
  }, []);
  return { progress, hydrated, update, storageError };
}
