'use client';
import { useState } from 'react';
import { BookmarkCheck, BookmarkPlus, RotateCcw, Shuffle } from 'lucide-react';
import type { CourseWord } from '@/app/video-course/course-vocab';
import { GermanWord, useCourseWords, type CourseSource } from '@/app/video-course/course-words';
import { playLine } from '@/app/video-course/audio';
import { saveCards } from '@/app/video-course/progress';
import { AudioButton } from '@/app/video-course/tasks';

type Dir = 'de-en' | 'en-de';

export function Flashcards({ episode, words, source, track = true }: { episode: number; words: CourseWord[]; source: CourseSource; track?: boolean }) {
  const sync = useCourseWords(source);
  const [dir, setDir] = useState<Dir>('de-en');
  const [deck, setDeck] = useState(() => words.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const finished = pos >= deck.length;
  const card = words[deck[pos]];
  const inReview = card ? sync.status(card) === 'review' : false;
  const reviewCount = words.filter(w => sync.status(w) === 'review').length;

  function restart(order: number[]) { setDeck(order); setPos(0); setFlipped(false); }
  function flip() { setFlipped(true); if (dir === 'en-de') playLine({ who: 'T', text: card.de }); }
  function next() {
    const p = pos + 1;
    setPos(p); setFlipped(false);
    if (p >= deck.length) { if (track) saveCards(episode, deck.length, words.length); }
    else if (dir === 'de-en') playLine({ who: 'T', text: words[deck[p]].de });
  }
  // Saved to the site's Vocabulary → Review (synced with the account).
  const toggleReview = () => sync.mark(card, inReview ? 'new' : 'review');

  if (!words.length) return null;
  return <div className="vc-cards">
    <div className="vc-cards-bar">
      <div className="vc-seg" role="group" aria-label="Direction">
        <button type="button" aria-pressed={dir === 'de-en'} onClick={() => { setDir('de-en'); restart([...words.keys()]); }}>German → English</button>
        <button type="button" aria-pressed={dir === 'en-de'} onClick={() => { setDir('en-de'); restart([...words.keys()]); }}>English → German</button>
      </div>
      <button type="button" className="vc-btn-ghost" onClick={() => restart([...words.keys()].sort(() => Math.random() - 0.5))}><Shuffle aria-hidden="true" /> Shuffle</button>
    </div>
    <progress max={deck.length} value={Math.min(pos, deck.length)} aria-label="Cards done" />
    {!finished ? <>
      <button type="button" className={`vc-card ${flipped ? 'is-flipped' : ''}`} onClick={() => (flipped ? undefined : flip())} aria-live="polite">
        <span className="vc-card-count">{pos + 1} / {deck.length}</span>
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
    </> : <div className="vc-cards-done" role="status">
      <p><strong>All {deck.length} cards done.</strong> {reviewCount > 0 ? `${reviewCount} word${reviewCount > 1 ? 's' : ''} in your review deck.` : ''}</p>
      <div className="vc-card-actions">
        <button type="button" className="vc-btn-ghost" onClick={() => restart([...words.keys()])}><RotateCcw aria-hidden="true" /> Start again</button>
      </div>
    </div>}
  </div>;
}
