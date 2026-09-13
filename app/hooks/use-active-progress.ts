'use client';
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';
import type { ActiveProgress } from '@/app/lib/active-progress';
export function useActiveProgress() {
 const [progress, setProgress] = useState<ActiveProgress>({});
 const [loading, setLoading] = useState(true), [signedIn, setSignedIn] = useState(false), [error, setError] = useState('');
 useEffect(() => {
  let alive = true, owner: string | null = null, epoch = 0, sequence = 0;
  let unsubscribe: (() => void) | undefined;
  const refresh = async () => {
   if (!owner) return;
   const generation = epoch, request = ++sequence;
   try {
    const response = await authenticatedFetch('/api/active-learning/progress');
    const payload = await response.json() as { userId?: string; progress: ActiveProgress; error?: string };
    if (!alive || generation !== epoch || request !== sequence) return;
    if (!response.ok) throw new Error(payload.error ?? 'Progress is unavailable.');
    if (payload.userId !== owner) return;
    setProgress(payload.progress); setError('');
   } catch (cause) { if (alive && generation === epoch && request === sequence) setError(cause instanceof Error ? cause.message : 'Progress is unavailable.'); }
   finally { if (alive && generation === epoch && request === sequence) setLoading(false); }
  };
  void import('@/app/lib/supabase-client').then(({supabase}) => {
   if (!alive) return;
   const {data} = supabase.auth.onAuthStateChange((_event,session) => {
    const id = session?.user.id ?? null;
    if (id !== owner) { owner = id; epoch++; setProgress({}); setError(''); }
    setSignedIn(Boolean(id)); setLoading(Boolean(id));
    if (id) queueMicrotask(() => { if (alive) void refresh(); }); else setLoading(false);
   });
   unsubscribe = () => data.subscription.unsubscribe();
  });
  const update = () => { void refresh(); };
  window.addEventListener('leselaut-tutor-updated',update); window.addEventListener('focus',update);
  return () => { alive = false; epoch++; unsubscribe?.(); window.removeEventListener('leselaut-tutor-updated',update); window.removeEventListener('focus',update); };
 },[]);
 return {progress,loading,signedIn,error};
}
