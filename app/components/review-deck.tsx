'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/app/hooks/use-learning-progress';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';
import type { VocabularyIdentity } from '@/app/lib/progress-sync';
import { recordDeckAnswer, type DeckAnswer } from '@/app/lib/recall-decks';
import { REVIEW_SIZES, reviewLookupKeys, sharedReviewWords, startSharedReviewSession, remainingReviewWords, type ReviewSize, type SharedReviewWord } from '@/app/lib/review-deck';
import { FLASHCARD_RATINGS, flashcardOptions, flashcardInterval, type FlashcardRating } from '@/app/lib/flashcard-scheduler';
import { TopicArt } from './topic-art';

type ActiveRound = { sessionId: string; runId: string; owner: string | null };
type PendingSave = { word: SharedReviewWord; answer: DeckAnswer };

function ReviewFlashcard({ word, options, busy, onAction }: {
  word: SharedReviewWord; options: ReturnType<typeof flashcardOptions>; busy: boolean;
  onAction: (action: 'read' | 'flashcard', rating?: FlashcardRating) => void;
}) {
  const [revealed, setRevealed] = useState(false), [audioError, setAudioError] = useState('');
  function listen() {
    if (!('speechSynthesis' in window)) { setAudioError('Pronunciation is unavailable in this browser.'); return; }
    const voice = new SpeechSynthesisUtterance(word.german); voice.lang = 'de-DE';
    voice.onerror = () => setAudioError('Pronunciation is unavailable in this browser.');
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(voice);
  }
  return <section className="review-flashcard" aria-label="Review flashcard">
    <span className="reading-eyebrow">Recall the German before turning the card</span>
    <h3 lang="en">{word.english}</h3>
    <div className={`review-flashcard-face${revealed ? ' is-revealed' : ''}`}>
      {revealed ? <strong lang="de">{word.german}</strong> : <Button disabled={busy} onClick={() => setRevealed(true)}>Show answer</Button>}
    </div>
    {revealed && <>
      {word.context && <p className="review-source-sentence" lang="de">{word.context}</p>}
      <div className="learning-actions"><Button variant="outline" disabled={busy} onClick={listen}><Volume2 /> Listen</Button>{word.sourceHref && <Link href={word.sourceHref}>Read the source →</Link>}</div>
      <p className="review-rating-note">How well did you remember? Your rating updates the same review schedule used in Vocabulary.</p>
      <div className="review-flashcard-ratings" role="group" aria-label="Rate your recall">
        {FLASHCARD_RATINGS.map(({ rating, label, hint }) => <Button key={rating} variant="outline" title={hint} disabled={busy} onClick={() => onAction('flashcard', rating)}><span>{label}</span><small>{flashcardInterval(options[rating].card.due.getTime(), Date.now())}</small></Button>)}
      </div>
      <Button className="review-mark-read" variant="outline" disabled={busy} onClick={() => onAction('read')}>Mark as read</Button>
      <p className="review-rating-note">Mark as read = marked familiar. It leaves Review and updates your word progress.</p>
    </>}
    {audioError && <p role="alert">{audioError}</p>}
  </section>;
}

export function ReviewDeck() {
  const { progress, hydrated, update, storageError } = useLearningProgress();
  const { progress: vocabulary, hydrated: wordsReady, rateFlashcard, markAsRead, storageError: wordStorageError } = useVocabularyProgress();
  const [catalog, setCatalog] = useState<VocabularyIdentity[]>([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState(''), [reload, setReload] = useState(0);
  const [stage, setStage] = useState<'box' | 'size' | 'round'>('box'), [size, setSize] = useState<ReviewSize>(8), [query, setQuery] = useState('');
  const [active, setActive] = useState<ActiveRound | null>(null), [pending, setPending] = useState<PendingSave | null>(null), [busy, setBusy] = useState(false), [actionError, setActionError] = useState('');
  const [accountOwner, setAccountOwner] = useState<string | null | undefined>(undefined);
  const owner = useRef<string | null | undefined>(undefined), saving = useRef(false);
  const ready = hydrated && wordsReady;
  const lookup = JSON.stringify(reviewLookupKeys(vocabulary));
  useEffect(() => {
    if (!ready) return;
    const currentOwner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    if (owner.current !== undefined && owner.current !== currentOwner) {
      setCatalog([]); setActive(null); setPending(null); setStage('box'); setQuery(''); setActionError('');
    }
    owner.current = currentOwner;
    if (accountOwner !== currentOwner) setAccountOwner(currentOwner);
    if (active && (active.owner !== currentOwner || progress.reviewSession?.id !== active.sessionId || progress.reviewSession.run?.id !== active.runId)) { setActive(null); setPending(null); setStage('box'); }
  }, [ready, progress, vocabulary, active, accountOwner]);
  useEffect(() => {
    if (!ready || accountOwner === undefined) return;
    const controller = new AbortController(), currentOwner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    const keys = JSON.parse(lookup) as string[];
    setLoading(true); setLoadError('');
    async function load() {
      try {
        const batches: string[][] = [];
        for (let i = 0; i < keys.length; i += 500) batches.push(keys.slice(i, i + 500));
        const results = await Promise.all(batches.map(async batch => {
          const response = await fetch('/api/learning/words', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ keys: batch }), signal: controller.signal });
          const data = await response.json() as { words?: VocabularyIdentity[] };
          if (!response.ok || !Array.isArray(data.words)) throw new Error('Your review words could not load.');
          return data.words;
        }));
        if (!controller.signal.aborted && currentOwner === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setCatalog(results.flat());
      } catch { if (!controller.signal.aborted && currentOwner === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setLoadError('Your review words could not load. Retry before starting practice.'); }
      finally { if (!controller.signal.aborted && currentOwner === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [ready, lookup, reload, accountOwner]);
  const pool = useMemo(() => sharedReviewWords(catalog, vocabulary), [catalog, vocabulary]);
  const matches = pool.filter(word => `${word.german} ${word.english}`.toLocaleLowerCase('de').includes(query.trim().toLocaleLowerCase('de')));
  const session = active && progress.reviewSession?.id === active.sessionId && progress.reviewSession.run?.id === active.runId ? progress.reviewSession : undefined;
  const remaining = session ? remainingReviewWords(session, pool) : [];
  const currentWord = pending?.word ?? remaining[0];
  const answers = Object.values(session?.run?.answers ?? {});
  const resumable = progress.reviewSession?.run && remainingReviewWords(progress.reviewSession, pool).length > 0;
  const canAct = ready && !loading && !loadError && !storageError && !wordStorageError && !busy;

  function owned() { return ready && owner.current === localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY); }
  function openRound() {
    const round = progress.reviewSession;
    if (!owned() || !canAct || !round?.run) return;
    setActive({ sessionId: round.id, runId: round.run.id, owner: owner.current ?? null }); setPending(null); setActionError(''); setStage('round');
  }
  function start() {
    if (!owned() || !canAct) return;
    try {
      const round = startSharedReviewSession(crypto.randomUUID(), crypto.randomUUID(), catalog, vocabulary, size);
      if (update(p => ({ ...p, reviewSession: round }))) {
        setActive({ sessionId: round.id, runId: round.run!.id, owner: owner.current ?? null }); setPending(null); setActionError(''); setStage('round');
      }
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'The flashcards could not start.'); }
  }
  function savePlace(answer: DeckAnswer) {
    if (!owned() || !active || active.owner !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return false;
    return update(p => {
      const round = p.reviewSession;
      if (!round || round.id !== active.sessionId || round.run?.id !== active.runId) throw new Error('This round has changed.');
      return { ...p, reviewSession: recordDeckAnswer(round, active.runId, answer) };
    });
  }
  async function complete(action: 'read' | 'flashcard', rating?: FlashcardRating) {
    if (!canAct || !owned() || !active || !session || !currentWord || saving.current || pending) return;
    const currentOwner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY), word = currentWord;
    const answer: DeckAnswer = { id: crypto.randomUUID(), key: word.key, at: Date.now(), correct: action === 'read' || rating !== 1, assisted: true, elapsedDays: 0, action, ...(rating ? { rating } : {}) };
    saving.current = true; setBusy(true); setActionError('');
    try {
      if (action === 'read') { if (!markAsRead(word)) throw new Error('Your word could not be marked as read.'); }
      else { if (!rating) throw new Error('Choose a recall rating.'); await rateFlashcard(word, rating); }
      if (currentOwner !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return;
      if (!savePlace(answer)) setPending({ word, answer });
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Your review could not be saved. Try again.'); }
    finally { saving.current = false; setBusy(false); }
  }
  function markRead(word: SharedReviewWord) {
    if (canAct && owned() && !markAsRead(word)) setActionError('Your word could not be marked as read.');
  }

  return <section className="recall-decks" aria-label="Your review deck">
    <header className="recall-decks-heading"><TopicArt kind="learn" /><div><span className="reading-eyebrow">Your words, together</span><h2>Your review deck</h2><p>Words you add to Review in the word library, stories and books appear here.</p></div></header>
    {!ready ? <p role="status">Loading your review deck…</p> : <>
      {(loadError || storageError || wordStorageError || actionError) && <p role="alert">{loadError || storageError || wordStorageError || actionError}{loadError && <Button variant="outline" onClick={() => setReload(n => n + 1)}>Retry loading words</Button>}</p>}
      {stage === 'round' && session?.run ? <section className="recall-round" aria-label="Flashcard round">
        <div className="recall-round-top"><div><span className="reading-eyebrow">{session.words.length} word round</span><h3>Review flashcards</h3></div><Button variant="outline" disabled={busy} onClick={() => { setStage('box'); setActive(null); setPending(null); }}>Save & leave practice</Button></div>
        <progress max={session.words.length} value={session.words.length - remaining.length} aria-label="Flashcard round progress" />
        {loading && <p role="status">Updating your review words…</p>}
        {pending ? <div role="alert"><p>Your word progress is saved, but your place in the round could not save.</p><Button onClick={() => { if (pending && savePlace(pending.answer)) setPending(null); }}>Retry saving round</Button></div> : currentWord ? <>
          <p className="recall-round-count">{remaining.length} words remaining · {answers.length} practised</p>
          <ReviewFlashcard key={`${session.run.id}:${currentWord.key}`} word={currentWord} options={flashcardOptions(vocabulary.cards?.[currentWord.key], Date.now())} busy={!canAct} onAction={(action, rating) => void complete(action, rating)} />
        </> : !loading && !loadError && <div className="recall-round-finished" aria-live="polite"><span className="reading-eyebrow">Round complete</span><h3>{answers.length} {answers.length === 1 ? 'word' : 'words'} practised.</h3><p>{answers.filter(a => a.action === 'read').length} marked as read. Your ratings and familiar words are synced with Vocabulary and Today.</p><p>Words removed from Review elsewhere are skipped. Flashcard ratings are self-assessments.</p><Button onClick={() => { setStage('box'); setActive(null); }}>Back to review deck</Button></div>}
      </section> : stage === 'size' ? <section className="review-practice-setup" aria-label="Choose practice size">
        <span className="reading-eyebrow">A small round of your own words</span><h3>How many words do you want to practise?</h3>
        <fieldset className="review-size-options"><legend>Words to practise</legend>{REVIEW_SIZES.map(count => <label key={count} className={size === count ? 'is-selected' : ''}><input type="radio" name="review-size" value={count} checked={size === count} onChange={() => setSize(count)} /><strong>{count}</strong><span>words</span></label>)}</fieldset>
        <p>{loading ? 'Loading your review words…' : `${pool.length} words in your deck. This round will use ${Math.min(size, pool.length)}.`}</p>
        {pool.length < size && !loading && <p className="review-rating-note">You have fewer than {size} words, so we’ll practise all available words.</p>}
        <p className="review-rating-note">Due words come first. Recall the German, show the answer, then rate the card or mark it as read.</p>
        <div className="learning-actions"><Button disabled={!canAct || !pool.length} onClick={start}>Start flashcards</Button><Button variant="outline" onClick={() => setStage('box')}>Back to deck</Button></div>
      </section> : <section className="review-deck-box" aria-label="Words in your review deck">
        <div className="review-deck-box-heading"><div><h3>Words in Review <span>{loading ? '…' : pool.length}</span></h3><p>One deck across the word library, books and stories.</p></div><div className="learning-actions">{resumable && <Button variant="outline" disabled={!canAct} onClick={openRound}>Resume flashcards</Button>}<Button disabled={!canAct || !pool.length} onClick={() => { setActionError(''); setStage('size'); }}>Practice</Button></div></div>
        {loading && <p role="status">Loading your review words…</p>}
        {pool.length ? <><label className="review-deck-search">Find a review word<input type="search" maxLength={100} placeholder="Search your review deck" value={query} onChange={e => setQuery(e.target.value)} /></label><ul className="review-deck-words">{matches.map(word => <li key={word.key}><div><strong lang="de">{word.german}</strong><span>{word.english}</span><small>{word.sourceKind === 'vocabulary' ? 'Word library' : word.sourceKind === 'book' ? 'Book' : 'Story'}{word.sourceTitle ? ` · ${word.sourceTitle}` : ''}</small></div><Button variant="outline" size="sm" disabled={!canAct} aria-label={`Mark ${word.german} as read`} onClick={() => markRead(word)}>Mark as read</Button></li>)}</ul>{!matches.length && <p>No matching review words. Change your search.</p>}</> : !loading && !loadError && <div className="learning-empty"><p>Your review deck is empty. Choose Review on a word-library card, or Add to review in a story or book’s word stack.</p><div className="learning-actions"><Link href="/vocabulary">Open word library →</Link><Link href="/stories">Read stories →</Link><Link href="/books">Read books →</Link></div></div>}
        <p className="review-rating-note">Mark as read marks a word familiar and removes it from Review. Add it again from its source whenever you want to revisit it.</p>
      </section>}
      <p className="learning-save-note">Your words, schedules and unfinished round save here. Sign in to sync across devices.</p>
    </>}
  </section>;
}
