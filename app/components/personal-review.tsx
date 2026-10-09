'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/app/hooks/use-learning-progress';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { useTranslationMemory } from '@/app/hooks/use-translation-memory';
import { vocabularyCardKey, isVocabularyReview, type VocabularyIdentity } from '@/app/lib/progress-sync';
import type { TranslationReview } from '@/app/lib/translation-memory';
import { TranslationWorkspace } from '@/app/active-learning/translation-workspace';
import { LearningWordReview, type ReviewWord } from './learning-word-review';
import { LearningEvidence } from './learning-evidence';
import { LearningHero } from './learning-hero';
import { ConnectedWordProgress } from './connected-word-progress';
import { TopicArt, type ArtKind } from './topic-art';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';

function ReviewHeading({ title, eyebrow, art }: { title: string; eyebrow: string; art: ArtKind }) {
  return <div className="learning-review-heading"><TopicArt kind={art} /><div><span className="reading-eyebrow">{eyebrow}</span><h2>{title}</h2></div></div>;
}

export function PersonalReview() {
  const { progress, hydrated, storageError } = useLearningProgress(), { progress: vocabulary, hydrated: vocabularyReady, storageError: vocabularyError } = useVocabularyProgress();
  const { memory, error, loading, signedIn, refresh } = useTranslationMemory();
  const [word, setWord] = useState<ReviewWord | null>(null), [review, setReview] = useState<TranslationReview | null>(null), [words, setWords] = useState<VocabularyIdentity[]>([]), [wordError, setWordError] = useState('');
  const lastCheck = useRef(''), owner = useRef<string | null>(null);
  const now = Date.now();
  const due = Object.entries(vocabulary.cards ?? {}).filter(([k, c]) => c.status === 'review' && c.dueAt <= now && !vocabulary.words?.[k]).sort((a, b) => a[1].dueAt - b[1].dueAt).slice(0, 8).map(([k]) => k);
  const catalogKey = due.join('|');
  useEffect(() => {
    const id = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    if (owner.current !== id) { owner.current = id; setReview(null); setWord(null); }
  }, [progress, signedIn]);
  useEffect(() => {
    const controller = new AbortController(), id = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    if (!due.length) { setWords([]); return; }
    const p = new URLSearchParams({ level: progress.preferences?.level ?? 'A1' }); due.forEach(k => p.append('key', k)); setWordError('');
    fetch(`/api/learning/material?${p}`, { signal: controller.signal }).then(async r => { const data = await r.json() as { words: VocabularyIdentity[] }; if (!r.ok) throw new Error('Vocabulary review could not load.'); if (!controller.signal.aborted && id === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setWords(data.words); }).catch(() => { if (!controller.signal.aborted) setWordError('Vocabulary review could not load. Try the Vocabulary page or reload.'); });
    return () => controller.abort();
  }, [catalogKey]);
  const context = useMemo(() => review ? { reviewSource: review.source } : undefined, [review?.key]);
  const personal = Object.entries(vocabulary.words ?? {}).filter(([, w]) => isVocabularyReview(vocabulary, w)).sort((a, b) => (vocabulary.cards?.[a[0]]?.dueAt ?? 0) - (vocabulary.cards?.[b[0]]?.dueAt ?? 0));
  const date = (at: number) => at <= now ? 'Due now' : new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return <main className="learning-page learning-page--review"><LearningHero kind="review" />
    {!hydrated || !vocabularyReady ? <p role="status">Loading your review…</p> : <>
    {(storageError || vocabularyError) && <p role="alert">{storageError || vocabularyError}</p>}
    {word && <section className="learning-session"><LearningWordReview key={word.key} word={word} onDone={() => setWord(null)} /><Button variant="outline" onClick={() => setWord(null)}>Back to review</Button></section>}
    {review && <section className="learning-session"><span className="reading-eyebrow">{review.level} · Fresh mistake review</span><h2>{review.label}</h2><p>Try a different sentence using this language pattern. The first attempt is recorded before feedback; later revisions are assisted practice.</p><TranslationWorkspace key={review.key} learning={context} preferredLevel={review.level} preferredCount={1} onRecord={r => { const c = r.session.checks.at(-1); if (c && c.id !== lastCheck.current) { lastCheck.current = c.id; void refresh(); } }} /><Button variant="outline" onClick={() => { setReview(null); void refresh(); }}>Back to review</Button></section>}
    {!word && !review && <>
    <section className="learning-review-section" data-tone="sage"><ReviewHeading title="Words from stories & books" eyebrow="From your reading" art="learn" /><p>Your collected words use the same schedule in Vocabulary, Practice, Review and Today. German forms stay hidden until your attempt.</p>{!personal.length ? <div className="learning-empty"><p>Click words in a story or book, then choose Add to review in the word stack. Its meaning and source stay together.</p><Link href="/stories">Find a story →</Link></div> : <div className="learning-review-list">{personal.map(([key, w]) => <article key={key}><div><strong>{w.english}</strong><small>{date(vocabulary.cards?.[key]?.dueAt ?? 0)} · {w.source.kind === 'book' ? 'Book' : 'Story'}</small></div><Button variant="outline" onClick={() => setWord({ key, german: w.german, english: w.english, context: w.context, sourceHref: w.source.href, vocabulary: w })}>{(vocabulary.cards?.[key]?.dueAt ?? 0) <= now ? 'Recall now' : 'Practise early'}</Button></article>)}</div>}</section>
    <section className="learning-review-section" data-tone="lilac"><ReviewHeading title="Scheduled vocabulary" eyebrow="Keep words close" art="technology" /><p>Your existing vocabulary deck uses the same review schedule here and on the Vocabulary page.</p>{wordError && <p role="alert">{wordError}</p>}{words.length ? <div className="learning-review-list">{words.map(w => <article key={vocabularyCardKey(w)}><div><strong>{w.english}</strong><small>Due now</small></div><Button variant="outline" onClick={() => setWord({ key: vocabularyCardKey(w), german: w.german, english: w.english, vocabulary: w })}>Recall now</Button></article>)}</div> : <p>No scheduled vocabulary is due in this selection. <Link href="/vocabulary">Explore vocabulary →</Link></p>}</section>
    <section className="learning-review-section" data-tone="peach"><ReviewHeading title="Mistakes to revisit" eyebrow="A fresh chance to practise" art="work" /><p>Actual errors enter review after one day. Optional style suggestions are excluded. A successful first attempt schedules the next check a week later.</p>{!signedIn ? <p><Link href="/account">Sign in</Link> to use your saved translation feedback.</p> : loading ? <p role="status">Loading mistake review…</p> : memory?.reviews.length ? <div className="learning-review-list">{memory.reviews.map(r => <article key={r.key}><div><strong>{r.label}</strong><p>{r.level} · {r.attempts} fresh review attempts</p><small>{date(r.dueAt)}{r.latestCorrect !== undefined ? r.latestCorrect ? ' · Latest first attempt accepted' : ' · Latest first attempt needs work' : ''}</small></div><Button variant="outline" disabled={r.dueAt > now} onClick={() => { setReview(r); lastCheck.current = ''; }}>Start fresh review</Button></article>)}</div> : <div className="learning-empty"><p>No mistakes are queued yet. Checked translations will build your review history.</p><Link href="/active-learning">Practise German output →</Link></div>}</section>
    <ConnectedWordProgress vocabulary={vocabulary} /><LearningEvidence progress={progress} memory={memory} vocabulary={vocabulary} />
    </>}{error && <p role="alert">{error} <button type="button" onClick={() => void refresh()}>Try again</button></p>}
    <Link className="learning-back" href="/">Back to Today →</Link>
    </>}
  </main>;
}
