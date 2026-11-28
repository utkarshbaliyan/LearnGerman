'use client';
import { useEffect, useState } from 'react';
import { readEpisode, onProgressChange, type EpisodeProgress } from '@/app/video-course/progress';

export function EpisodeProgressBadge({ episode }: { episode: number }) {
  const [p, setP] = useState<EpisodeProgress | null>(null);
  useEffect(() => { const update = () => setP(readEpisode(episode)); update(); return onProgressChange(update); }, [episode]);
  if (!p) return null;
  const test = p.blocks.test;
  if (test) { const pct = Math.round(test.score / test.total * 100); return <span className={`vc-badge ${pct >= 80 ? 'is-pass' : ''}`}>{pct >= 80 ? '✓ Passed' : `Test ${pct} %`}</span>; }
  const started = Object.keys(p.blocks).length;
  return started ? <span className="vc-badge">{started} part{started > 1 ? 's' : ''} done</span> : null;
}
