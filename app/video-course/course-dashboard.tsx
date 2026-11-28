'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, RotateCcw, Sparkles } from 'lucide-react';
import { localDay, onProgressChange, readAllEpisodes, readCourseMeta, type CourseMeta, type EpisodeProgress } from '@/app/video-course/progress';

type EpisodeLite = { n: number; slug: string; title: string; english: string; hasFull: boolean };
const BLOCK_LABELS: Record<string, string> = { words: 'Words', grammar: 'Grammar', skills: 'Exam skills', test: 'Test' };
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function CourseDashboard({ episodes }: { episodes: EpisodeLite[] }) {
  const [store, setStore] = useState<Record<string, EpisodeProgress> | null>(null);
  const [meta, setMeta] = useState<CourseMeta>({ activeDays: [] });

  useEffect(() => {
    const sync = () => { setStore(readAllEpisodes()); setMeta(readCourseMeta()); };
    sync();
    return onProgressChange(sync);
  }, []);

  if (!store) return null;

  const passedEps = episodes.filter(e => {
    const t = store[e.n]?.blocks?.test;
    return t && t.total > 0 && t.score / t.total >= 0.8;
  });
  const totalMistakes = episodes.reduce((acc, e) => acc + Object.keys(store[e.n]?.mistakes ?? {}).length, 0);
  const mistakeEp = episodes.find(e => Object.keys(store[e.n]?.mistakes ?? {}).length > 0);
  const hasStarted = passedEps.length > 0 || meta.activeDays.length > 0 || Object.keys(store).length > 0;

  // Pick best "Resume" target: last visited unfinished episode, else first unpassed full-practice episode.
  const lastEp = meta.last ? episodes.find(e => e.n === meta.last!.episode) : undefined;
  const lastPassed = lastEp ? passedEps.some(p => p.n === lastEp.n) : false;
  const nextEp = (!lastPassed && lastEp) ? lastEp : (episodes.find(e => e.hasFull && !passedEps.some(p => p.n === e.n)) ?? episodes[0]);
  const nextBlock = !lastPassed && lastEp && meta.last?.block ? meta.last.block : 'words';

  // Spaced review nudge: a passed episode whose test was passed >= 2 days ago.
  const now = Date.now();
  const reviewDue = passedEps.find(e => {
    const ts = store[e.n]?.passedAt ?? store[e.n]?.updatedAt ?? 0;
    return ts > 0 && now - ts >= TWO_DAYS_MS;
  });

  // 14-day consistency dots (quiet, never punishes missed days).
  const days = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const key = localDay(d);
    return { key, label: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }), active: meta.activeDays.includes(key) };
  });
  const activeIn14 = days.filter(d => d.active).length;

  return <section className="vc-dash" aria-label="Your A1 progress">
    <div className="vc-dash-main">
      <div className="vc-dash-resume">
        <span className="vc-dash-eyebrow">{hasStarted ? 'Pick up where you left off' : 'Start your A1 path'}</span>
        <strong>Episode {nextEp.n}: {nextEp.title}</strong>
        <p>{nextEp.english}{hasStarted && !lastPassed && lastEp ? ` · Next step: ${BLOCK_LABELS[nextBlock] ?? 'Words'}` : ''}</p>
        <Link href={`/video-course/a1/${nextEp.slug}#${nextBlock}`} className="vc-btn vc-dash-cta">
          {hasStarted ? 'Continue lesson' : 'Start Episode 1'} <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className="vc-dash-stats">
        <div className="vc-stat">
          <span className="vc-stat-val">{passedEps.length} / {episodes.length}</span>
          <span className="vc-stat-label">Episodes passed</span>
          <div className="vc-stat-bar"><span style={{ width: `${Math.round((passedEps.length / episodes.length) * 100)}%` }} /></div>
        </div>
        <div className="vc-stat">
          <span className="vc-stat-val">{totalMistakes}</span>
          <span className="vc-stat-label">Saved mistakes</span>
          {mistakeEp ? <Link href={`/video-course/a1/${mistakeEp.slug}#review`} className="vc-stat-link"><RotateCcw aria-hidden="true" /> Clear E{mistakeEp.n}</Link>
            : <span className="vc-stat-sub">All clear</span>}
        </div>
        <div className="vc-stat vc-stat-days">
          <span className="vc-stat-label"><CalendarDays aria-hidden="true" /> Last 14 days · {activeIn14} active</span>
          <div className="vc-dots" role="img" aria-label={`Studied on ${activeIn14} of the last 14 days`}>
            {days.map(d => <span key={d.key} title={d.label} className={`vc-dot ${d.active ? 'is-on' : ''}`} />)}
          </div>
        </div>
      </div>
    </div>
    {reviewDue && <div className="vc-dash-nudge" role="status">
      <Sparkles aria-hidden="true" />
      <span><strong>2-minute refresh:</strong> You passed Episode {reviewDue.n} ({reviewDue.title}) a couple of days ago — redo its flashcards to lock the words in long-term memory.</span>
      <Link href={`/video-course/a1/${reviewDue.slug}#words`}>Refresh E{reviewDue.n} →</Link>
    </div>}
  </section>;
}
