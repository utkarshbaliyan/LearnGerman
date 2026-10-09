'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/app/hooks/use-learning-progress';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';
import { vocabularyCardKey, type VocabularyRecallAttempt } from '@/app/lib/progress-sync';
import { TRANSLATION_LEVELS, type TranslationLevel } from '@/app/lib/translation-practice';
import { createRecallDeck, startRecallDeck, recordDeckAnswer, MIN_RECALL_WORDS, MAX_RECALL_WORDS, MAX_RECALL_DECKS, type RecallDeck, type RecallDeckWord } from '@/app/lib/recall-decks';
import { LearningWordReview } from './learning-word-review';
import { TopicArt } from './topic-art';

type ActiveRound = { deckId: string; runId: string; wordKey: string | null; owner: string | null };
export function RecallDeckBuilder() {
  const { progress, hydrated, update, storageError } = useLearningProgress();
  const { progress: vocabulary, hydrated: wordsReady } = useVocabularyProgress();
  const [name, setName] = useState(''), [query, setQuery] = useState(''), [level, setLevel] = useState<TranslationLevel>('A1');
  const [source, setSource] = useState('vocabulary'), [selected, setSelected] = useState<RecallDeckWord[]>([]), [catalog, setCatalog] = useState<RecallDeckWord[]>([]);
  const [loading, setLoading] = useState(false), [searchError, setSearchError] = useState(''), [actionError, setActionError] = useState(''), [active, setActive] = useState<ActiveRound | null>(null);
  const owner = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!hydrated || !wordsReady) return;
    const currentOwner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    if (owner.current !== currentOwner) setLevel(progress.preferences?.level ?? 'A1');
    if (owner.current !== undefined && owner.current !== currentOwner) { setSelected([]); setName(''); setQuery(''); setCatalog([]); setActive(null); setActionError(''); }
    owner.current = currentOwner;
    if (active && (!progress.decks[active.deckId] || progress.decks[active.deckId].run?.id !== active.runId || active.owner !== currentOwner)) setActive(null);
  }, [progress, vocabulary, active, hydrated, wordsReady]);
  useEffect(() => {
    if (!hydrated || source !== 'vocabulary') return;
    const controller = new AbortController();
    setCatalog([]); setLoading(true); setSearchError('');
    const timer = setTimeout(() => {
      fetch(`/api/learning/words?${new URLSearchParams({ level, q: query })}`, { signal: controller.signal }).then(async response => {
        const data = await response.json() as { words?: RecallDeckWord[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? 'Words could not load.');
        if (!controller.signal.aborted) setCatalog(data.words ?? []);
      }).catch(cause => { if (!controller.signal.aborted) setSearchError(cause instanceof Error ? cause.message : 'Words could not load.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [hydrated, source, level, query]);
  const savedWords: RecallDeckWord[] = Object.values(vocabulary.words ?? {}).map(w => ({ key: vocabularyCardKey(w), german: w.german, english: w.english, context: w.context, sourceHref: w.source.href, progressByHeadword: true }));
  const matches = source === 'reading' ? savedWords.filter(w => `${w.english} ${w.german}`.toLocaleLowerCase('de').includes(query.trim().toLocaleLowerCase('de'))).slice(0, 24) : catalog;
  const decks = Object.values(progress.decks).sort((a, b) => b.updatedAt - a.updatedAt);
  const deck = active ? progress.decks[active.deckId] : undefined;
  const currentWord = active?.wordKey ? deck?.words.find(w => w.key === active.wordKey) : undefined;
  const answers = Object.values(deck?.run?.answers ?? {});
  function openDeck(d: RecallDeck) {
    if (!d.run) return;
    setActionError('');
    setActive({ deckId: d.id, runId: d.run.id, wordKey: d.run.order.find(k => !d.run!.answers[k]) ?? null, owner: localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY) });
  }
  function start(d: RecallDeck) {
    if (owner.current !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return;
    try {
      let started: RecallDeck | undefined;
      if (update(p => { const latest = p.decks[d.id]; if (!latest) throw new Error('Deck unavailable.'); started = startRecallDeck(latest, crypto.randomUUID()); return { ...p, decks: { ...p.decks, [d.id]: started } }; }) && started) openDeck(started);
    } catch { setActionError('This deck could not start. Try again.'); }
  }
  function create() {
    if (!hydrated || !wordsReady || owner.current !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return;
    setActionError('');
    try {
      const next = startRecallDeck(createRecallDeck(crypto.randomUUID(), name, selected), crypto.randomUUID());
      if (update(p => { if (Object.keys(p.decks).length >= MAX_RECALL_DECKS) throw new Error('Deck limit reached.'); return { ...p, decks: { ...p.decks, [next.id]: next } }; })) { setSelected([]); setName(''); openDeck(next); }
    } catch { setActionError('Choose 5–15 different words and a name of up to 80 characters.'); }
  }
  function recorded(attempt: VocabularyRecallAttempt) {
    if (!active || active.owner !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return false;
    return update(p => { const d = p.decks[active.deckId]; if (!d) throw new Error('Deck unavailable.'); return { ...p, decks: { ...p.decks, [d.id]: recordDeckAnswer(d, active.runId, attempt) } }; });
  }
  function next() {
    if (!active || !deck?.run) return;
    setActive({ ...active, wordKey: deck.run.order.find(k => !deck.run!.answers[k]) ?? null });
  }
  return <section className="recall-decks" aria-label="Active recall decks">
    <header className="recall-decks-heading"><TopicArt kind="learn" /><div><span className="reading-eyebrow">Small deck. Real recall.</span><h2>Your active recall decks</h2><p>Choose 5–15 words. Type the German from memory before checking or revealing it.</p></div></header>
    {!hydrated || !wordsReady ? <p role="status">Loading your decks…</p> : <>
      {active && deck?.run ? <section className="recall-round">
        <div className="recall-round-top"><div><span className="reading-eyebrow">{deck.words.length} word deck</span><h3>{deck.name}</h3></div><Button variant="outline" onClick={() => setActive(null)}>Save & leave deck</Button></div>
        <progress max={deck.words.length} value={answers.length} aria-label="Deck recall progress" />
        {currentWord ? <><p className="recall-round-count">Word {deck.run.order.indexOf(currentWord.key) + 1} of {deck.words.length} · {answers.length} checked</p><LearningWordReview key={`${deck.run.id}:${currentWord.key}`} word={{ ...currentWord, vocabulary: currentWord }} onRecorded={recorded} onDone={next} /></> : <div className="recall-round-finished" aria-live="polite"><span className="reading-eyebrow">Round complete</span><h3>You recalled {answers.filter(a => a.correct && !a.assisted).length} of {deck.words.length} without help.</h3><p>{answers.filter(a => !a.correct).length} missed · {answers.filter(a => a.assisted).length} assisted. Each word’s review schedule has been updated in Vocabulary and Today.</p><p>This round is practice. Immediate repeats do not show long-term retention.</p><div className="learning-actions"><Button onClick={() => start(deck)}>Practise this deck again</Button><Button variant="outline" onClick={() => setActive(null)}>Back to my decks</Button></div></div>}
      </section> : <>
        <div className="recall-builder">
          <div className="recall-builder-controls"><label>Deck name<input maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="My everyday German" /></label><label>Word source<select value={source} onChange={e => setSource(e.target.value)}><option value="vocabulary">Vocabulary</option><option value="reading">Saved stories & books ({savedWords.length})</option></select></label>{source === 'vocabulary' && <label>Vocabulary level<select value={level} onChange={e => setLevel(e.target.value as TranslationLevel)}>{TRANSLATION_LEVELS.map(l => <option key={l}>{l}</option>)}</select></label>}<label>Find a word<input maxLength={80} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search English or German" /></label></div>
          <div className="recall-builder-columns"><section className="recall-word-picker" aria-label="Choose deck words"><h3>Choose your words</h3><p>German answers stay hidden. You can mix words from both sources.</p>{source === 'vocabulary' && loading ? <p role="status">Finding words…</p> : <ul>{matches.map(w => { const added = selected.some(s => s.key === w.key); return <li key={w.key}><div><strong>{w.english}</strong><small>{w.sourceHref ? 'From your reading' : `${level} vocabulary`}{vocabulary.cards?.[w.key]?.status === 'review' ? ' · In review' : ''}</small></div><Button size="sm" variant="outline" aria-label={`${added ? 'Remove' : 'Add'} ${w.english}`} disabled={!added && selected.length >= MAX_RECALL_WORDS} onClick={() => setSelected(previous => added ? previous.filter(s => s.key !== w.key) : previous.some(s => s.key === w.key) || previous.length >= MAX_RECALL_WORDS ? previous : [...previous, w])}>{added ? 'Remove' : 'Add'}</Button></li>; })}</ul>}{!loading && !matches.length && <p>{source === 'reading' && !savedWords.length ? 'Save useful words from a story or book, or choose Vocabulary to build your first deck.' : 'No matching words. Try a different search.'}</p>}{searchError && source === 'vocabulary' && <p role="alert">{searchError}</p>}</section>
          <section className="recall-deck-selection" aria-label="Selected deck words"><h3>Your deck</h3><p role="status">{selected.length} / {MAX_RECALL_WORDS} words · {selected.length < MIN_RECALL_WORDS ? `Choose ${MIN_RECALL_WORDS - selected.length} more to start` : 'Ready to practise'}</p>{selected.length ? <ul>{selected.map(w => <li key={w.key}><span>{w.english}</span><button type="button" aria-label={`Remove ${w.english} from deck`} onClick={() => setSelected(p => p.filter(s => s.key !== w.key))}>×</button></li>)}</ul> : <p>Add words from the list to create a small, focused deck.</p>}<Button disabled={selected.length < MIN_RECALL_WORDS || selected.length > MAX_RECALL_WORDS || Boolean(storageError) || decks.length >= MAX_RECALL_DECKS} onClick={create}>Create deck & practise</Button>{decks.length >= MAX_RECALL_DECKS && <p>You have {MAX_RECALL_DECKS} decks. Practise an existing deck.</p>}</section></div>
        </div>
        {decks.length > 0 && <section className="recall-saved-decks"><h3>My saved decks</h3><div>{decks.map(d => { const checked = Object.keys(d.run?.answers ?? {}).length, complete = checked === d.words.length; return <article key={d.id}><div><h4>{d.name}</h4><p>{d.words.length} words · {complete ? 'Last round complete' : `${checked} checked`}</p></div><Button variant="outline" onClick={() => complete || !d.run ? start(d) : openDeck(d)}>{complete || !d.run ? 'Practise again' : 'Resume deck'}</Button></article>; })}</div></section>}
      </>}
      <p className="learning-save-note">Decks save in this browser. Sign in to sync them across devices. Word results share the existing vocabulary progress.</p>
      {(actionError || storageError) && <p role="alert">{actionError || storageError}</p>}
    </>}
  </section>;
}
