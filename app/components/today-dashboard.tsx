'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/app/hooks/use-learning-progress';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import { useTranslationMemory } from '@/app/hooks/use-translation-memory';
import { localDay, recommendStory, type LearningPreferences, type LearningSession } from '@/app/lib/learning-state';
import type { ReadingSummary } from '@/app/lib/reading-path';
import type { getReadingContent } from '@/app/lib/reading-content';
import { TRANSLATION_LEVELS, type TranslationRecord } from '@/app/lib/translation-practice';
import { vocabularyCardKey, type VocabularyIdentity } from '@/app/lib/progress-sync';
import { ReadingText, ReadingCheck } from './reading-experience';
import { ReadingAudio, ReadingNarrationProvider } from './reading-narration';
import { TranslationWorkspace } from '@/app/active-learning/translation-workspace';
import { LearningWordReview, type ReviewWord } from './learning-word-review';
import { LearningEvidence } from './learning-evidence';
import { ConnectedWordProgress } from './connected-word-progress';
import { TopicArt, storyArt } from './topic-art';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';

type Material = { content: ReturnType<typeof getReadingContent>; words: VocabularyIdentity[] };
const steps = ['Recall', 'Read & listen', 'Understand', 'Use German', 'Finished'];
function Setup({ preferences, onSave }: { preferences?: LearningPreferences; onSave: (p: LearningPreferences) => void }) {
  const [level, setLevel] = useState(preferences?.level ?? 'A1'), [goal, setGoal] = useState(preferences?.goal ?? 'everyday'), [minutes, setMinutes] = useState(preferences?.minutes ?? 15);
  return <form className="learning-setup" onSubmit={e => { e.preventDefault(); onSave({ level, goal, minutes, updatedAt: Date.now() }); }}><h2>{preferences ? 'Your session preferences' : 'Make German part of your day'}</h2><p>Choose a starting level. You can change it as you find what feels useful.</p><div className="learning-setup-fields"><label>Your level<select value={level} onChange={e => setLevel(e.target.value as typeof level)}>{TRANSLATION_LEVELS.map(l => <option key={l}>{l}</option>)}</select></label><label>Your goal<select value={goal} onChange={e => setGoal(e.target.value as typeof goal)}><option value="everyday">Everyday life</option><option value="work">Work & professional life</option><option value="study">Study & learning</option></select></label><label>Available time<select value={minutes} onChange={e => setMinutes(Number(e.target.value) as typeof minutes)}>{[10, 15, 20].map(m => <option key={m} value={m}>{m} minutes</option>)}</select></label></div><Button type="submit">{preferences ? 'Save preferences' : 'Save and get started'}</Button></form>;
}
export function TodayDashboard({ stories }: { stories: ReadingSummary[] }) {
  const { progress, hydrated, update, storageError } = useLearningProgress(), { progress: vocabulary, hydrated: vocabReady } = useVocabularyProgress(), { completedIds, hydrated: storiesReady } = useStoryProgress();
  const { memory, loading: memoryLoading, error: memoryError, signedIn, refresh } = useTranslationMemory();
  const [activeId, setActiveId] = useState<string | null>(null), [material, setMaterial] = useState<Material | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(false), [settings, setSettings] = useState(false), [output, setOutput] = useState<TranslationRecord | null>(null);
  const latestCheck = useRef('');
  const sessions = Object.values(progress.sessions).sort((a, b) => b.startedAt - a.startedAt);
  const unfinished = sessions.find(s => !s.finishedAt);
  const session = activeId ? progress.sessions[activeId] : undefined;
  const prefs = progress.preferences;
  const recommended = prefs ? recommendStory(stories, prefs, completedIds, sessions) : undefined;
  const featuredStory = unfinished ? stories.find(s => s.id === unfinished.storyId) : recommended;
  const now = Date.now();
  const dueVocabulary = Object.entries(vocabulary.cards ?? {}).filter(([, c]) => c.status === 'review' && c.dueAt <= now).sort((a, b) => a[1].dueAt - b[1].dueAt);
  useEffect(() => { if (activeId && !progress.sessions[activeId]) { setActiveId(null); setOutput(null); setMaterial(null); } }, [activeId, progress.sessions]);
  const materialKey = session ? `${session.id}:${session.storyId}:${session.reviewKeys.join('|')}` : '';
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController(), owner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    const params = new URLSearchParams({ storyId: session.storyId, level: session.level }); session.reviewKeys.filter(k => k.startsWith('de:')).forEach(k => params.append('key', k));
    setLoading(true); setError(''); setMaterial(null);
    fetch(`/api/learning/material?${params}`, { signal: controller.signal }).then(async r => { const data = await r.json() as Material & { error?: string }; if (!r.ok) throw new Error(data.error ?? 'Your story could not load.'); if (!controller.signal.aborted && owner === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setMaterial(data); }).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [materialKey]);
  const learningContext = useMemo(() => session ? { sessionId: session.id, storyId: session.storyId } : undefined, [session?.id, session?.storyId]);
  function patchSession(values: Partial<LearningSession>) { if (session) update(p => p.sessions[session.id] ? { ...p, sessions: { ...p.sessions, [session.id]: { ...p.sessions[session.id], ...values, updatedAt: Math.max(Date.now(), p.sessions[session.id].updatedAt + 1) } } } : p); }
  function start(selected = prefs) {
    if (!selected) return;
    const nextStory = recommendStory(stories, selected, completedIds, sessions);
    if (!nextStory) return;
    if (unfinished) { setActiveId(unfinished.id); return; }
    const limit = selected.minutes === 10 ? 3 : selected.minutes === 15 ? 5 : 8;
    const s: LearningSession = { ...selected, id: crypto.randomUUID(), startedAt: now, updatedAt: now, day: localDay(), storyId: nextStory.id, step: 0, reviewKeys: dueVocabulary.map(([k]) => k).slice(0, limit), reviewIndex: 0 };
    if (update(p => ({ ...p, sessions: { ...p.sessions, [s.id]: s } }))) { setActiveId(s.id); setOutput(null); latestCheck.current = ''; }
  }
  function finish(outputSkipped: boolean) { patchSession({ step: 4, finishedAt: Date.now(), outputSkipped }); void refresh(); }
  const key = session?.reviewKeys[session.reviewIndex];
  const legacy = key ? progress.words[key] : undefined;
  const sharedKey = legacy ? vocabularyCardKey(legacy) : key;
  const personal = sharedKey ? vocabulary.words?.[sharedKey] : undefined, catalogWord = key ? material?.words.find(w => vocabularyCardKey(w) === key) : undefined;
  const word: ReviewWord | undefined = personal && sharedKey ? { key: sharedKey, german: personal.german, english: personal.english, context: personal.context, sourceHref: personal.source.href, vocabulary: personal } : legacy && key ? { key, german: legacy.german, english: legacy.english, context: legacy.context, storyId: legacy.storyId } : catalogWord && key ? { key, german: catalogWord.german, english: catalogWord.english, vocabulary: catalogWord } : undefined;
  const content = material?.content;
  const checked = output?.session.checks.at(-1);
  const outputReady = checked && (checked.feedback.every(f => f.verdict === 'correct') || output!.session.checks.length > 1);
  return <div className="learning-today-panel">
    {!hydrated || !vocabReady || !storiesReady ? <p role="status">Loading your learning plan…</p> : <>
    {storageError && <p role="alert">{storageError}</p>}
    {(!prefs || settings) && <Setup key={prefs?.updatedAt ?? 'new'} preferences={prefs} onSave={p => { if (update(state => ({ ...state, preferences: p }))) { setSettings(false); if (!prefs) start(p); } }} />}
    {!session && prefs && <section className="learning-start"><TopicArt kind={storyArt(featuredStory?.topics ?? [])} className="learning-feature-art" /><div><span className="reading-eyebrow">{prefs.level} · {prefs.minutes} minute plan</span><h2>{unfinished ? 'Pick up where you left off' : 'Your next useful session'}</h2><p className="learning-feature-title" lang="de">{featuredStory?.title}</p><p className="learning-due-summary">{dueVocabulary.length} word reviews due{memory ? ` · ${memory.due} mistake reviews due` : ''}</p></div><div className="learning-actions"><Button onClick={() => start()} disabled={Boolean(storageError)}>{unfinished ? 'Resume session' : 'Start session'}</Button><Button variant="outline" onClick={() => setSettings(!settings)}>Change preferences</Button><Link href="/review">Personal review →</Link></div><div className="learning-feature-note">{prefs.level === 'C1' && <p>C1 output practice uses B2 stories: our reading library currently ends at B2.</p>}<p>Time is a guide. Longer stories can take more than one visit.</p></div></section>}
    {session && <section className="learning-session"><div className="learning-session-top"><p>{session.level} · {session.minutes} minute plan</p><Button variant="outline" onClick={() => setActiveId(null)}>Save & leave</Button></div><ol className="learning-steps" aria-label="Session steps">{steps.map((s, i) => <li key={s} aria-current={session.step === i ? 'step' : undefined}><span>{i + 1}</span>{s}</li>)}</ol>
      {loading && <p role="status">Loading your session…</p>}{error && <p role="alert">{error} <button type="button" onClick={() => { setActiveId(null); }}>Return to Today</button></p>}
      {!loading && material && session.step === 0 && (word ? <LearningWordReview key={`${session.id}:${session.reviewIndex}:${word.key}`} word={word} onDone={() => patchSession({ reviewIndex: session.reviewIndex + 1, ...(session.reviewIndex + 1 >= session.reviewKeys.length ? { step: 1 } : {}) })} /> : <div className="learning-empty"><h2>{session.reviewKeys.length ? 'This review word is no longer available' : 'You have no word reviews due'}</h2><p>Read your story and save useful words for tomorrow.</p><Button onClick={() => patchSession({ step: 1 })}>Continue to your story</Button></div>)}
      {content && session.step === 1 && <><header className="learning-story-title"><span className="reading-eyebrow">{content.story.level} story</span><h2 lang="de">{content.story.title}</h2><p>{content.story.goal}</p></header><ReadingNarrationProvider key={content.story.id}><ReadingAudio storyId={content.story.id} asset={content.audio} /><ReadingText story={content.story} glosses={content.glosses} sentenceTranslations={content.sentenceTranslations} /></ReadingNarrationProvider><Button onClick={() => patchSession({ step: 2 })}>Check my understanding</Button></>}
      {content && session.step === 2 && <><ReadingCheck key={session.id} story={content.story} onScore={comprehensionScore => patchSession({ comprehensionScore })} /><div className="learning-actions"><Button variant="outline" onClick={() => patchSession({ step: 1 })}>Read again</Button><Button disabled={session.comprehensionScore === undefined} onClick={() => patchSession({ step: 3 })}>Continue to German output</Button></div><p>The quiz checks this familiar story. It is practice, not an independent reading assessment.</p></>}
      {session.step === 3 && <><h2>Use German in a fresh situation</h2><p>Translate {session.minutes === 10 ? 'one sentence' : 'two sentences'} related to your story’s theme. If feedback finds an error, revise it and check again.</p><TranslationWorkspace key={session.id} learning={learningContext} preferredLevel={session.level} preferredCount={session.minutes === 10 ? 1 : 2} savedExerciseId={session.translationId} onRecord={r => { setOutput(r); if (r.exerciseId !== session.translationId) patchSession({ translationId: r.exerciseId }); const c = r.session.checks.at(-1); if (c && c.id !== latestCheck.current) { latestCheck.current = c.id; void refresh(); } }} />{checked && !outputReady && <p>Try correcting one of the highlighted errors, then check your revision.</p>}<div className="learning-actions"><Button disabled={!outputReady} onClick={() => finish(false)}>Finish session</Button><Button variant="outline" onClick={() => finish(true)}>{signedIn ? 'Finish as reading practice' : 'Finish reading session'}</Button></div></>}
      {session.step === 4 && <div className="learning-finished"><span className="reading-eyebrow">Session saved</span><h2>You made time for German.</h2><p>{session.outputSkipped ? 'Reading practice recorded. German output was not completed.' : 'Recall, story comprehension and checked German output recorded.'}</p><p>Saved words are available in Vocabulary and Review immediately. Mistakes enter review after a day, with fresh contexts rather than the same sentences.</p><div className="learning-actions"><Button onClick={() => { setActiveId(null); setOutput(null); }}>Back to Today</Button><Link href="/review">See upcoming reviews →</Link></div></div>}
    </section>}
    {!session && <><ConnectedWordProgress vocabulary={vocabulary} /><LearningEvidence progress={progress} memory={memory} vocabulary={vocabulary} /><section className="learning-next"><h2>Keep exploring</h2><div><Link href="/stories"><TopicArt kind="home" />Stories →</Link><Link href="/books"><TopicArt kind="learn" />Continue a book →</Link><Link href="/active-learning"><TopicArt kind="friends" />Active Learning →</Link><Link href="/vocabulary"><TopicArt kind="technology" />Vocabulary →</Link><Link href="/grammar"><TopicArt kind="work" />Grammar →</Link></div></section></>}
    {memoryLoading && signedIn && <p role="status">Loading mistake review…</p>}{memoryError && <p role="alert">{memoryError} <button type="button" onClick={() => void refresh()}>Try again</button></p>}<p className="learning-save-note">Reading and word review work without an account. Sign in for AI feedback and sync across devices.</p>
    </>}
  </div>;
}
