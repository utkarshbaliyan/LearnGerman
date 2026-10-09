'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, GraduationCap, Languages, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_SYNCED_EVENT } from '@/app/lib/cloud-progress-keys';
import { readCourseProgress, readGrammarProgress, VOCABULARY_LEGACY_STORAGE_KEYS, type VocabularyProgress } from '@/app/lib/progress-sync';
import { grammarOverview, type HomeGrammarLesson, type VocabularyOverview } from '@/app/lib/home-progress';
import type { ReadingSummary } from '@/app/lib/reading-path';
import type { TranslationMemory } from '@/app/lib/translation-memory';

const number = (n: number) => n.toLocaleString('en');
function Meter({ value, total, label }: { value: number; total: number; label: string }) {
  return <progress className="home-section-meter" value={value} max={Math.max(1, total)} aria-label={label} />;
}

export function HomeSections({ stories, completedIds, storiesReady, vocabulary, vocabularyReady, grammarLessons, memory, memoryLoading, memoryError, signedIn }: {
  stories: ReadingSummary[]; completedIds: Set<string>; storiesReady: boolean;
  vocabulary: VocabularyProgress; vocabularyReady: boolean; grammarLessons: HomeGrammarLesson[];
  memory: TranslationMemory | null; memoryLoading: boolean; memoryError: string; signedIn: boolean;
}) {
  const [grammar, setGrammar] = useState<ReturnType<typeof grammarOverview> | null>(null), [grammarError, setGrammarError] = useState(false);
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [words, setWords] = useState<VocabularyOverview | null>(null), [wordError, setWordError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {
    function refresh() {
      try {
        setOwner(localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY));
        setGrammar(grammarOverview(readGrammarProgress(localStorage), readCourseProgress(localStorage), grammarLessons));
        setGrammarError(false);
      } catch { setGrammar(null); setGrammarError(true); }
    }
    const frame = requestAnimationFrame(refresh);
    window.addEventListener('storage', refresh); window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('storage', refresh); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); };
  }, [grammarLessons]);
  // Keep the full vocabulary catalog on the server, and send only status fields.
  const vocabularyKey = useMemo(() => JSON.stringify({
    learnedKeys: vocabulary.learnedKeys, reviewKeys: vocabulary.reviewKeys, legacyMigrated: vocabulary.legacyMigrated,
    words: vocabulary.words,
    cards: Object.fromEntries(Object.entries(vocabulary.cards ?? {}).map(([key, card]) => [key, { status: card.status, updatedAt: card.updatedAt, dueAt: 0, intervalMinutes: 0 }])),
  }), [vocabulary]);
  useEffect(() => {
    if (!vocabularyReady || owner === undefined) return;
    const controller = new AbortController(), account = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    setWords(null); setWordError('');
    async function load() {
      try {
        const input = JSON.parse(vocabularyKey) as VocabularyProgress;
        const legacy = input.legacyMigrated ? undefined : Object.fromEntries(VOCABULARY_LEGACY_STORAGE_KEYS.map(key => [key, localStorage.getItem(key)]));
        const response = await fetch('/api/learning/overview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vocabulary: input, legacy }), signal: controller.signal });
        const data = await response.json() as VocabularyOverview;
        if (!response.ok || ![data.total, data.learned, data.review, data.unlearned].every(n => Number.isSafeInteger(n) && n >= 0) || data.learned + data.review + data.unlearned !== data.total) throw new Error('Progress could not load.');
        if (!controller.signal.aborted && account === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setWords(data);
      } catch { if (!controller.signal.aborted && account === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setWordError('Word progress is unavailable.'); }
    }
    void load(); return () => controller.abort();
  }, [vocabularyReady, vocabularyKey, owner, retry]);
  const storyCount = stories.filter(story => completedIds.has(story.id)).length;
  const activity = memory?.activity;
  return <section className="home-sections" aria-labelledby="home-sections-title">
    <header className="home-sections-heading"><div><span className="reading-eyebrow">A little progress in every direction</span><h2 id="home-sections-title">Your German, at a glance</h2><p>Pick the kind of practice you need today.</p></div><Link href="/books">Continue a book <ArrowUpRight aria-hidden="true" /></Link></header>
    <div className="home-section-grid">
      <article className="home-section-card" data-area="stories" aria-labelledby="home-stories-title">
        <div className="home-section-art"><img src="/illustrations/reading-room.png" alt="" width="1536" height="1024" loading="lazy" decoding="async" /></div>
        <div className="home-section-copy"><span className="home-section-label"><BookOpen aria-hidden="true" /> Read & listen · A1–B2</span><h3 id="home-stories-title">Stories</h3><p>Follow everyday life in German with narration, English translations and comprehension questions.</p></div>
        <div className="home-section-progress"><div className="home-section-stat"><strong>{storiesReady ? number(storyCount) : '…'}</strong><span>of {number(stories.length)} stories completed</span></div><Meter value={storiesReady ? storyCount : 0} total={stories.length} label={`Stories: ${storyCount} of ${stories.length} completed`} /><div className="home-section-footer"><span>Save useful words as you read.</span><Link href="/stories">Explore stories <ArrowUpRight aria-hidden="true" /></Link></div></div>
      </article>
      <article className="home-section-card" data-area="grammar" aria-labelledby="home-grammar-title">
        <div className="home-section-art"><img src="/illustrations/home-grammar.webp" alt="" width="1024" height="1024" loading="lazy" decoding="async" /></div>
        <div className="home-section-copy"><span className="home-section-label"><GraduationCap aria-hidden="true" /> Patterns & practice · A1–C1</span><h3 id="home-grammar-title">Grammar</h3><p>Understand cases, verb forms and word order, then use them in focused exercises.</p></div>
        <div className="home-section-progress"><div className="home-section-stat"><strong>{grammar ? number(grammar.completed) : '…'}</strong><span>{grammarError ? 'Progress unavailable' : `of ${number(grammarLessons.length)} lessons completed`}</span></div><Meter value={grammar?.completed ?? 0} total={grammarLessons.length} label={`Grammar: ${grammar?.completed ?? 0} of ${grammarLessons.length} completed`} /><div className="home-section-footer"><span>{grammar ? `${number(grammar.started)} lessons started` : 'Loading your lesson progress…'}</span><Link href={grammar?.next ? `/grammar?lesson=${grammar.next.id}` : '/grammar'}>{grammar?.started ? 'Continue grammar' : 'Start grammar'} <ArrowUpRight aria-hidden="true" /></Link></div></div>
      </article>
      <article className="home-section-card" data-area="vocabulary" aria-labelledby="home-vocabulary-title">
        <div className="home-section-art"><img src="/illustrations/home-vocabulary.webp" alt="" width="1024" height="1024" loading="lazy" decoding="async" /></div>
        <div className="home-section-copy"><span className="home-section-label"><Languages aria-hidden="true" /> Words that stay with you · A1–C1</span><h3 id="home-vocabulary-title">Vocabulary</h3><p>Build your word library and practise the words you save from stories and books.</p></div>
        <div className="home-section-progress">{wordError ? <p className="home-section-error" role="alert">{wordError} <Button variant="outline" size="sm" onClick={() => setRetry(n => n + 1)}>Retry</Button></p> : <>
          <div className="home-section-stat"><strong>{words ? number(words.learned) : '…'}</strong><span>words learned <small>marked familiar</small></span></div>
          {words ? <><div className="home-word-meter" role="img" aria-label={`${words.learned} learned, ${words.review} in review, ${words.unlearned} unlearned`}><span className="is-learned" style={{ width: `${words.total ? words.learned / words.total * 100 : 0}%` }} /><span className="is-review" style={{ width: `${words.total ? words.review / words.total * 100 : 0}%` }} /><span className="is-unlearned" style={{ width: `${words.total ? words.unlearned / words.total * 100 : 0}%` }} /></div><dl className="home-word-counts"><div><dt>Learned</dt><dd>{number(words.learned)}</dd></div><div><dt>Review</dt><dd>{number(words.review)}</dd></div><div><dt>Unlearned</dt><dd>{number(words.unlearned)}</dd></div></dl></> : <p role="status">Loading your word progress…</p>}
        </>}<div className="home-section-footer"><a href="/?view=review">Practise your review deck</a><Link href="/vocabulary">Open word library <ArrowUpRight aria-hidden="true" /></Link></div></div>
      </article>
      <article className="home-section-card" data-area="active" aria-labelledby="home-active-title">
        <div className="home-section-art"><img src="/illustrations/home-active-learning.webp" alt="" width="1024" height="1024" loading="lazy" decoding="async" /></div>
        <div className="home-section-copy"><span className="home-section-label"><PenLine aria-hidden="true" /> Put German to use · A1–C1</span><h3 id="home-active-title">Active Learning</h3><p>Translate fresh sentences by typing, speaking or handwriting. Check your work and revise with AI feedback.</p></div>
        <div className="home-section-progress">{memoryLoading ? <p role="status">Loading your saved practice…</p> : !signedIn ? <p className="home-active-empty"><Link href="/account">Sign in</Link> to see saved translation practice and feedback.</p> : memoryError || !activity ? <p className="home-section-error">Practice progress is unavailable. Open Active Learning to reload your history.</p> : <>
          <div className="home-section-stat"><strong>{number(activity.checkedSets)}</strong><span>of {number(activity.savedSets)} saved sets checked</span></div><Meter value={activity.checkedSets} total={activity.savedSets} label={`Active Learning: ${activity.checkedSets} of ${activity.savedSets} saved sets checked`} /><div className="home-active-counts"><span><b>{number(activity.checkedSentences)}</b> sentences checked</span><span><b>{number(memory?.due ?? 0)}</b> mistake reviews due</span></div><p className="home-activity-note">Recent saved practice, up to 200 sets. Activity counts include helped attempts.</p>
        </>}<div className="home-section-footer"><span>Turn feedback into another attempt.</span><Link href="/active-learning">Practise German <ArrowUpRight aria-hidden="true" /></Link></div></div>
      </article>
    </div>
  </section>;
}
