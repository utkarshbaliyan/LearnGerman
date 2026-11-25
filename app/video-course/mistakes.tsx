'use client';
import { useEffect, useState } from 'react';
import type { ExerciseItem } from '@/app/video-course/types';
import { readEpisode, onProgressChange } from '@/app/video-course/progress';
import { ExerciseSet } from '@/app/video-course/exercise-set';

export function MistakesReview({ episode }: { episode: number }) {
  const [count, setCount] = useState(0);
  const [session, setSession] = useState<{ ids: string[]; items: ExerciseItem[]; run: number } | null>(null);
  useEffect(() => { const update = () => setCount(Object.keys(readEpisode(episode).mistakes ?? {}).length); update(); return onProgressChange(update); }, [episode]);

  function start() {
    const m = readEpisode(episode).mistakes ?? {};
    setSession(s => ({ ids: Object.keys(m), items: Object.values(m) as ExerciseItem[], run: (s?.run ?? 0) + 1 }));
  }
  if (!count && !session) return <p className="vc-note">No saved mistakes. Every wrong answer lands here so you can retry just those.</p>;
  return <div>
    {count > 0 && <button type="button" className="vc-btn" onClick={start}>{session ? 'Load my mistakes again' : 'Practise my mistakes'} ({count})</button>}
    {!count && session && <p className="vc-result is-pass" role="status">All mistakes fixed. Sehr gut!</p>}
    {session && <ExerciseSet key={session.run} episode={episode} block="review" ids={[session.ids]}
      sections={[{ id: 'mistakes', title: 'Your mistakes', instructions: 'Right answers leave this list.', items: session.items }]} />}
  </div>;
}
