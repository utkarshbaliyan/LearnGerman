'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_SYNCED_EVENT } from '@/app/lib/cloud-progress-keys';
import type { VocabularyIdentity, VocabularyProgress } from '@/app/lib/progress-sync';
import { reviewLookupKeys, sharedReviewWords } from '@/app/lib/review-deck';

export function useLearningClock(enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => { clearTimeout(timer); setNow(Date.now()); timer = setTimeout(refresh, 60_010 - Date.now() % 60_000); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    refresh(); window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [enabled]);
  return Math.max(now, Date.now());
}

function currentOwner() { try { return localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY); } catch { return undefined; } }

/** Resolve legacy keys, aliases and saved words once for both Home and Review. */
export function useReviewWords(vocabulary: VocabularyProgress, ready: boolean, enabled = true) {
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ owner: string | null; lookup: string; revision: number; catalog: VocabularyIdentity[]; error: string }>();
  const lookup = JSON.stringify(reviewLookupKeys(vocabulary));
  const now = useLearningClock(enabled && ready);
  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setOwner(currentOwner());
    refresh(); window.addEventListener('storage', refresh); window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); };
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !ready || owner === undefined || owner !== currentOwner()) return;
    const controller = new AbortController(), requestOwner = owner;
    const keys = JSON.parse(lookup) as string[], batches: string[][] = [];
    for (let i = 0; i < keys.length; i += 500) batches.push(keys.slice(i, i + 500));
    async function load() {
      let catalog: VocabularyIdentity[] = [], error = '';
      try {
        const results = await Promise.all(batches.map(async batch => {
          const response = await fetch('/api/learning/words', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ keys: batch }), signal: controller.signal });
          const data = await response.json() as { words?: VocabularyIdentity[] };
          if (!response.ok || !Array.isArray(data.words)) throw new Error('Review unavailable');
          return data.words;
        }));
        catalog = results.flat();
      } catch { error = 'Your review words could not load. Retry before starting practice.'; }
      if (!controller.signal.aborted && requestOwner === currentOwner()) setResult({ owner: requestOwner, lookup, revision, catalog, error });
    }
    void load(); return () => controller.abort();
  }, [enabled, ready, owner, lookup, revision]);
  const current = ready && result?.owner === owner && result?.lookup === lookup && result?.revision === revision ? result : undefined;
  const catalog = current?.catalog;
  const pool = useMemo(() => ready && owner !== undefined ? sharedReviewWords(catalog ?? [], vocabulary) : [], [catalog, vocabulary, ready, owner]);
  const dueWords = useMemo(() => pool.filter(word => (vocabulary.cards?.[word.key]?.dueAt ?? 0) <= now), [pool, vocabulary, now]);
  const retry = useCallback(() => setRevision(n => n + 1), []);
  return { catalog: catalog ?? [], pool, dueWords, loading: !current && (!ready || owner !== undefined), error: ready && owner === undefined ? 'Enable browser storage to load your review words.' : current?.error ?? '', retry, now };
}
export type ReviewWordsState = ReturnType<typeof useReviewWords>;
