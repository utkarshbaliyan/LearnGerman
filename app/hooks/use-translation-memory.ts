'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';
import type { TranslationMemory } from '@/app/lib/translation-memory';
export function useTranslationMemory() {
  const [memory, setMemory] = useState<TranslationMemory | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [signedIn, setSignedIn] = useState(false);
  const generation = useRef(0), owner = useRef<string | null>(null), initialized = useRef(false);
  const refresh = useCallback(async () => {
    const epoch = ++generation.current, id = owner.current;
    if (!id) { setMemory(null); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await authenticatedFetch('/api/learning/memory', { headers: { 'x-translation-owner': id }, cache: 'no-store', signal: AbortSignal.timeout(20_000) });
      const data = await r.json() as TranslationMemory & { userId?: string; error?: string }; if (generation.current !== epoch) return;
      if (!r.ok) throw new Error(data.error ?? 'Review history could not load.');
      if (data.userId !== id) return;
      setMemory(data); setError('');
    } catch (e) { if (generation.current === epoch) setError(e instanceof Error ? e.message : 'Review history could not load.'); }
    finally { if (generation.current === epoch) setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true, unsubscribe: (() => void) | undefined;
    void import('@/app/lib/supabase-client').then(({ supabase }) => { if (!active) return; const { data } = supabase.auth.onAuthStateChange((_event, session) => { const id = session?.user.id ?? null; if (initialized.current && owner.current === id) return; initialized.current = true; owner.current = id; generation.current++; setMemory(null); setError(''); setSignedIn(Boolean(id)); queueMicrotask(() => { if (active) void refresh(); }); }); unsubscribe = () => data.subscription.unsubscribe(); }).catch(() => { setError('Sign-in is unavailable. Reload the page.'); setLoading(false); });
    return () => { active = false; generation.current++; unsubscribe?.(); };
  }, [refresh]);
  return { memory, loading, error, signedIn, refresh };
}
