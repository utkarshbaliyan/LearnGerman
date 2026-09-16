'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Play, Square } from 'lucide-react';
import type { ReadingStory } from '@/app/lib/reading-path';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const wordKey = (word: string) => word.toLowerCase().replace(/[^a-zäöüßé]/g, '');

export function ReadingAudio({ text, level, onFinished }: { text: string; level: string; onFinished?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(level === 'A1' ? .85 : 1);
  const active = useRef(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const run = useRef(0);
  function stop() { run.current++; active.current = false; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); utterance.current = null; setPlaying(false); }
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => { run.current++; active.current = false; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); document.removeEventListener('visibilitychange', hide); };
  }, [text]);
  function play() {
    if (playing) { stop(); return; }
    setError('');
    if (!('speechSynthesis' in window)) { setError('Audio is unavailable in this browser. You can still read the story.'); return; }
    window.speechSynthesis.cancel();
    const current = ++run.current;
    // Short utterances avoid browser timeouts on longer B1 texts. Narration always
    // uses the exact current text, never the previous edition's audio files.
    const parts = text.match(/[^.!?\n]+[.!?„“”»«]*/g)?.map(part => part.trim()).filter(Boolean) ?? [text];
    active.current = true; setPlaying(true);
    function speak(index: number) {
      if (!active.current || current !== run.current) return;
      if (index >= parts.length) { active.current = false; setPlaying(false); onFinished?.(); return; }
      const next = new SpeechSynthesisUtterance(parts[index]);
      const voice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith('de'));
      next.lang = 'de-DE'; if (voice) next.voice = voice;
      next.rate = speed;
      next.onend = () => speak(index + 1);
      next.onerror = event => { if (current !== run.current) return; active.current = false; setPlaying(false); if (event.error !== 'canceled' && event.error !== 'interrupted') setError('German audio could not play on this device. Try again or read the story.'); };
      utterance.current = next;
      window.speechSynthesis.speak(next);
    }
    speak(0);
  }
  return <div className="reading-audio"><Button onClick={play} variant="outline">{playing ? <Square size={17} /> : <Play size={17} />}{playing ? 'Stop listening' : 'Listen'}</Button><label>Speed <select aria-label="Narration speed" value={speed} disabled={playing} onChange={event => setSpeed(Number(event.target.value))}><option value={.85}>Slower</option><option value={1}>Normal</option></select></label><span>Device voice</span>{error && <p role="alert">{error}</p>}</div>;
}

export function ReadingText({ story, glosses }: { story: ReadingStory; glosses: Record<string, string> }) {
  return <div className="reading-content">
    <p className="reading-help">Tap a word for its meaning.</p>
    <TooltipProvider delayDuration={100}><article lang="de" className={`reading-prose reading-prose-${story.level.toLowerCase()}`}>
      {story.text.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, j) => {
        const meaning = glosses[wordKey(token)];
        return meaning ? <Tooltip key={j}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><strong lang="en">{meaning}</strong></TooltipContent></Tooltip> : <span key={j}>{token}</span>;
      })}</p>)}
    </article></TooltipProvider>
    <details className="reading-support"><summary>Need the gist in English?</summary><p lang="en">{story.english}</p></details>
    <details className="reading-support"><summary>{story.words.length} useful words & phrases</summary><dl>{story.words.map(word => <div key={word.german}><dt lang="de">{word.german}</dt><dd>{word.english}</dd><blockquote lang="de">{word.example}</blockquote></div>)}</dl>{story.revisit.length > 0 && <div className="reading-revisit"><strong>Words you have met before</strong>{story.revisit.map(word => <p key={word.german}><span lang="de">{word.german}</span> · {word.english} <Link href={`/stories/${word.storyId}`}>Earlier story: {word.title}</Link></p>)}</div>}</details>
    <details className="reading-support"><summary>Notice the grammar</summary><p>{story.grammar}</p><Link href={`/course/${story.level.toLowerCase()}/chapter-${story.courseChapter}#grammar`}>Practise in the course <ArrowRight size={15} /></Link></details>
  </div>;
}

export function ReadingCheck({ story, onScore }: { story: ReadingStory; onScore?: (score: number) => void }) {
  const { completedIds, hydrated, setStoryCompleted } = useStoryProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const correct = story.questions.filter((question, i) => answers[i] === question.answer).length;
  function check() {
    setChecked(true);
    onScore?.(Math.round(correct / story.questions.length * 100));
    if (correct === story.questions.length) setStoryCompleted(story.id, true);
  }
  return <section className="reading-check" aria-label="Reading practice">
    <span className="reading-eyebrow">Two small questions</span><h2>What happened?</h2>
    {story.questions.map((question, i) => <fieldset key={question.prompt}><legend>{question.prompt}</legend>{question.options.map((option, j) => <label key={option}><input type="radio" name={`${story.id}-q${i}`} checked={answers[i] === j} disabled={checked} onChange={() => setAnswers(current => ({ ...current, [i]: j }))} />{option}</label>)}{checked && <p className={answers[i] === question.answer ? 'reading-correct' : 'reading-retry'}>{answers[i] === question.answer ? 'Yes. ' : 'Read that part once more. '}{question.explanation}</p>}</fieldset>)}
    <div aria-live="polite">{checked && correct === story.questions.length ? <div className="reading-finished"><CheckCircle2 /><div><strong>Story complete.</strong><p>You followed a German story and checked its meaning.</p></div></div> : checked ? <p>You found {correct} of {story.questions.length}. Take another look, then try again.</p> : hydrated && completedIds.has(story.id) ? <p>You completed this story before. You can practise it again.</p> : null}</div>
    {checked ? <Button variant="outline" onClick={() => { setChecked(false); setAnswers({}); }}>Try the questions again</Button> : <Button onClick={check} disabled={!hydrated || Object.keys(answers).length !== story.questions.length}>Check my answers</Button>}
  </section>;
}
