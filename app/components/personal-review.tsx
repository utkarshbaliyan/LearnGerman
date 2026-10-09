'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/app/hooks/use-learning-progress';
import { useTranslationMemory } from '@/app/hooks/use-translation-memory';
import type { TranslationReview } from '@/app/lib/translation-memory';
import { TranslationWorkspace } from '@/app/active-learning/translation-workspace';
import { ReviewDeck } from './review-deck';
import { TopicArt } from './topic-art';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';

export function PersonalReview() {
  const { progress } = useLearningProgress();
  const { memory, error, loading, signedIn, refresh } = useTranslationMemory();
  const [review, setReview] = useState<TranslationReview | null>(null);
  const lastCheck = useRef(''), owner = useRef<string | null>(null);
  const now = Date.now();
  useEffect(() => {
    const id = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    if (owner.current !== id) { owner.current = id; setReview(null); }
  }, [progress, signedIn]);
  const context = useMemo(() => review ? { reviewSource: review.source } : undefined, [review?.key]);
  const date = (at: number) => at <= now ? 'Due now' : new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return <div className="learning-review-panel"><ReviewDeck />
    {review ? <section className="learning-session"><span className="reading-eyebrow">{review.level} · Fresh mistake review</span><h2>{review.label}</h2><p>Try a different sentence using this language pattern. The first attempt is recorded before feedback; later revisions are assisted practice.</p><TranslationWorkspace key={review.key} learning={context} preferredLevel={review.level} preferredCount={1} onRecord={r => { const c = r.session.checks.at(-1); if (c && c.id !== lastCheck.current) { lastCheck.current = c.id; void refresh(); } }} /><Button variant="outline" onClick={() => { setReview(null); void refresh(); }}>Back to review</Button></section> :
    <details className="learning-other-reviews"><summary>Translation mistakes</summary>
      <section className="learning-review-section" data-tone="peach"><div className="learning-review-heading"><TopicArt kind="work" /><div><span className="reading-eyebrow">A fresh chance to practise</span><h2>Mistakes to revisit</h2></div></div><p>Actual errors enter review after one day. Optional style suggestions are excluded. A successful first attempt schedules the next check a week later.</p>{!signedIn ? <p><Link href="/account">Sign in</Link> to use your saved translation feedback.</p> : loading ? <p role="status">Loading mistake review…</p> : memory?.reviews.length ? <div className="learning-review-list">{memory.reviews.map(r => <article key={r.key}><div><strong>{r.label}</strong><p>{r.level} · {r.attempts} fresh review attempts</p><small>{date(r.dueAt)}{r.latestCorrect !== undefined ? r.latestCorrect ? ' · Latest first attempt accepted' : ' · Latest first attempt needs work' : ''}</small></div><Button variant="outline" disabled={r.dueAt > now} onClick={() => { setReview(r); lastCheck.current = ''; }}>Start fresh review</Button></article>)}</div> : <div className="learning-empty"><p>No mistakes are queued yet. Checked translations will build your review history.</p><Link href="/active-learning">Practise German output →</Link></div>}</section>
    </details>}
    {error && <p role="alert">{error} <button type="button" onClick={() => void refresh()}>Try again</button></p>}
  </div>;
}
