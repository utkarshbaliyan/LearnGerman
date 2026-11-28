'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Check, Volume2 } from 'lucide-react';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import type { CourseWord } from '@/app/video-course/course-vocab';
import { playLine } from '@/app/video-course/audio';

export type WordStatus = 'new' | 'review' | 'learned';
export type CourseSource = { episode: number; title: string; href: string };

/** Course words share progress with the site's word library: Review and Learned show up there too. */
export function useCourseWords(source: CourseSource) {
  const v = useVocabularyProgress();
  const status = (w: CourseWord): WordStatus => !v.hydrated ? 'new' : v.isLearned(w.identity) ? 'learned' : v.isReview(w.identity) ? 'review' : 'new';
  function mark(w: CourseWord, next: WordStatus) {
    if (w.personal && next !== 'new') v.saveWord({ german: w.identity.german, english: w.identity.english,
      context: `A1 video course · Episode ${source.episode}: ${source.title}`,
      source: { kind: 'course', id: `a1-e${source.episode}`, title: `A1 Episode ${source.episode}: ${source.title}`, href: source.href, level: 'A1' } });
    if (next === 'learned') v.setLearned(w.identity, true);
    else if (next === 'review') v.setReview(w.identity, true);
    else v.setLearned(w.identity, false);
  }
  return { status, mark, hydrated: v.hydrated, error: v.storageError };
}

/** German word with the article coloured by gender (der blue, die red, das green). */
export function GermanWord({ text }: { text: string }) {
  const m = /^(der|die|das)\s+(.*)$/.exec(text);
  return m ? <span lang="de"><span className={`vc-art vc-art-${m[1]}`}>{m[1]}</span> {m[2]}</span> : <span lang="de">{text}</span>;
}

const GROUPS = [['core', 'Core words'], ['topic', 'Topic words'], ['sentence', 'Useful sentences'], ['website', 'Bonus words']] as const;
const FILTERS = [['all', 'All'], ['new', 'New'], ['review', 'Review'], ['learned', 'Learned']] as const;

export function WordBank({ words, source }: { words: CourseWord[]; source: CourseSource }) {
  const { status, mark, error } = useCourseWords(source);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>('all');
  const count = (f: string) => f === 'all' ? words.length : words.filter(w => status(w) === f).length;
  const learned = count('learned');

  return <div className="vc-bank">
    <div className="vc-bank-head">
      <div><h3>Word bank</h3><p>{learned} of {words.length} learned · marks sync with your <Link href="/vocabulary">word library</Link> and <Link href="/review">review deck</Link></p></div>
      <div className="vc-bank-meter" aria-hidden="true"><span style={{ width: `${Math.round(learned / Math.max(1, words.length) * 100)}%` }} /></div>
    </div>
    <div className="vc-bank-filters" role="tablist" aria-label="Filter words">
      {FILTERS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={filter === id} className={`vc-chip vc-chip-${id}`} onClick={() => setFilter(id)}>{label} <small>{count(id)}</small></button>)}
    </div>
    {error && <p className="vc-hint">{error}</p>}
    {GROUPS.map(([section, label]) => {
      const list = words.filter(w => w.section === section && (filter === 'all' || status(w) === filter));
      if (!list.length) return null;
      return <section key={section} className="vc-bank-group"><h4>{label} <small>{list.length}</small></h4>
        <ul className="vc-bank-grid">{list.map(w => { const s = status(w); return <li key={w.de} className={`vc-word is-${s}`}>
          <div className="vc-word-top">
            <strong><GermanWord text={w.de} /></strong>
            <button type="button" className="vc-word-play" aria-label={`Listen: ${w.de}`} onClick={() => playLine({ who: 'T', text: w.de })}><Volume2 aria-hidden="true" /></button>
          </div>
          {w.plural && w.plural !== 'Sg.' && <span className="vc-word-plural" lang="de">plural {w.plural}</span>}
          <span className="vc-word-en">{w.en}</span>
          <div className="vc-word-actions">
            <button type="button" aria-pressed={s === 'review'} className="vc-mark-review" onClick={() => mark(w, s === 'review' ? 'new' : 'review')}><Bookmark aria-hidden="true" /> Review</button>
            <button type="button" aria-pressed={s === 'learned'} className="vc-mark-learned" onClick={() => mark(w, s === 'learned' ? 'new' : 'learned')}><Check aria-hidden="true" /> Learned</button>
          </div>
        </li>; })}</ul>
      </section>;
    })}
    {!words.some(w => filter === 'all' || status(w) === filter) && <p className="vc-note">No words here yet.</p>}
  </div>;
}
