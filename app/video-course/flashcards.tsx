'use client';
import { useCallback, useEffect, useState } from 'react';
import { BookmarkCheck, BookmarkPlus, RotateCcw, Shuffle } from 'lucide-react';
import type { CourseWord } from '@/app/video-course/course-vocab';
import { GermanWord, useCourseWords, type CourseSource } from '@/app/video-course/course-words';
import { playLine } from '@/app/video-course/audio';
import { saveCards } from '@/app/video-course/progress';
import { AudioButton } from '@/app/video-course/tasks';

type Dir = 'de-en' | 'en-de';
const BATCH = 10;

export function Flashcards({ episode, words, source, track = true }: { episode: number; words: CourseWord[]; source: CourseSource; track?: boolean }) {
  const sync = useCourseWords(source);
  const [dir, setDir] = useState<Dir>('de-en');
  const [batchMode, setBatchMode] = useState(() => words.length > BATCH + 2);
  const [batchStart, setBatchStart] = useState(0);
  const [order, setOrder] = useState(() => words.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = batchMode ? order.slice(batchStart, batchStart + BATCH) : order;
  const hasMoreBatches = batchMode && batchStart + BATCH < order.length;
  const finished = pos >= deck.length;
  const card = words[deck[pos]];
  const inReview = card ? sync.status(card) === 'review' : false;
  const reviewCount = words.filter(w => sync.status(w) === 'review').length;

  function restart(nextOrder: number[], startAt = 0) { setOrder(nextOrder); setBatchStart(startAt); setPos(0); setFlipped(false); }
  const flip = useCallback(() => {
    if (!card) return;
    setFlipped(true);
    if (dir === 'en-de') playLine({ who: 'T', text: card.de });
  }, [card, dir]);
  const next = useCallback(() => {
    const p = pos + 1;
    setPos(p); setFlipped(false);
    if (p >= deck.length) { if (track) saveCards(episode, Math.min(order.length, batchStart + deck.length), words.length); }
    else if (dir === 'de-en') playLine({ who: 'T', text: words[deck[p]].de });
  }, [batchStart, deck, dir, episode, order.length, pos, track, words]);
  // Saved to the site's Vocabulary → Review (synced with the account).
  const toggleReview = useCallback(() => { if (card) sync.mark(card, inReview ? 'new' : 'review'); }, [card, inReview, sync]);

  useEffect(() => {
    if (!track || finished || !card) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(t.tagName) || t.isContentEditable)) return;
      if (e.code === 'Space') { e.preventDefault(); if (flipped) next(); else flip(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (flipped) next(); else flip(); }
      else if (e.key.toLowerCase() === 'a') { e.preventDefault(); playLine({ who: 'T', text: card.de }); }
      else if (e.key.toLowerCase() === 's') { e.preventDefault(); toggleReview(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, finished, flip, flipped, next, toggleReview, track]);

  if (!words.length) return null;
  return <div className="vc-cards">
    <div className="vc-cards-bar">
      <div className="vc-seg" role="group" aria-label="Direction">
        <button type="button" aria-pressed={dir === 'de-en'} onClick={() => { setDir('de-en'); restart([...words.keys()]); }}>German → English</button>
        <button type="button" aria-pressed={dir === 'en-de'} onClick={() => { setDir('en-de'); restart([...words.keys()]); }}>English → German</button>
      </div>
      <div className="vc-cards-tools">
        {words.length > BATCH + 2 && <div className="vc-seg" role="group" aria-label="Round size">
          <button type="button" aria-pressed={batchMode} onClick={() => { setBatchMode(true); restart(order, 0); }}>Quick {BATCH}</button>
          <button type="button" aria-pressed={!batchMode} onClick={() => { setBatchMode(false); restart(order, 0); }}>All {words.length}</button>
        </div>}
        <button type="button" className="vc-btn-ghost" onClick={() => restart([...words.keys()].sort(() => Math.random() - 0.5), 0)}><Shuffle aria-hidden="true" /> Shuffle</button>
      </div>
    </div>
    <progress max={deck.length} value={Math.min(pos, deck.length)} aria-label="Cards done" />
    {!finished ? <>
      <button type="button" className={`vc-card ${flipped ? 'is-flipped' : ''}`} onClick={() => (flipped ? undefined : flip())} aria-live="polite">
        <span className="vc-card-count">{pos + 1} / {deck.length}{batchMode ? ` · round ${Math.floor(batchStart / BATCH) + 1} of ${Math.ceil(order.length / BATCH)}` : ''}</span>
        <span className="vc-card-front">{dir === 'de-en' ? <GermanWord text={card.de} /> : card.en}</span>
        {flipped ? <span className="vc-card-back">{dir === 'de-en' ? card.en : <GermanWord text={card.de} />}{card.plural && card.plural !== 'Sg.' && <small> · plural {card.plural}</small>}</span>
          : <span className="vc-card-tap">{dir === 'en-de' ? 'Say it in German, then tap' : 'Tap to see the meaning'}</span>}
      </button>
      <div className="vc-card-actions">
        <AudioButton line={{ who: 'T', text: card.de }} label="Frau Weber" />
        <button type="button" className={`vc-btn-ghost vc-add-review ${inReview ? 'is-on' : ''}`} aria-pressed={inReview} onClick={toggleReview}>
          {inReview ? <BookmarkCheck aria-hidden="true" /> : <BookmarkPlus aria-hidden="true" />} {inReview ? 'In review' : 'Add to review'}
        </button>
        <button type="button" className="vc-btn" onClick={flipped ? next : flip}>{flipped ? 'Next →' : 'Show'}</button>
      </div>
      {track && <p className="vc-card-keys" aria-hidden="true">Shortcuts: Space flip/next · A audio · S review</p>}
    </> : <div className="vc-cards-done" role="status">
      <p><strong>{batchMode ? `Round ${Math.floor(batchStart / BATCH) + 1} done (${deck.length} cards).` : `All ${deck.length} cards done.`}</strong> {reviewCount > 0 ? `${reviewCount} word${reviewCount > 1 ? 's' : ''} in your review deck.` : ''}</p>
      <div className="vc-card-actions">
        {hasMoreBatches && <button type="button" className="vc-btn" onClick={() => restart(order, batchStart + BATCH)}>Next {Math.min(BATCH, order.length - (batchStart + BATCH))} cards →</button>}
        <button type="button" className="vc-btn-ghost" onClick={() => restart([...words.keys()], 0)}><RotateCcw aria-hidden="true" /> Start again</button>
      </div>
    </div>}
  </div>;
}
