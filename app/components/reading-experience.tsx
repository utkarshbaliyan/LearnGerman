'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { narrationTokens } from '@/app/lib/reading-narration';
import { useReadingNarration } from '@/app/components/reading-narration';
import type { ReadingStory } from '@/app/lib/reading-path';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const wordKey = (word: string) => word.toLowerCase().replace(/[^a-zäöüßé]/g, '');

export function ReadingText({ story, glosses }: { story: ReadingStory; glosses: Record<string, string> }) {
  const { activeWord } = useReadingNarration();
  return <div className="reading-content">
    <p className="reading-help">Tap a word for its meaning.</p>
    <TooltipProvider delayDuration={100}><article lang="de" className={`reading-prose reading-prose-${story.level.toLowerCase()}`}>
      {narrationTokens(story.text).map((paragraph, index) => <p key={index}>{paragraph.map((part, k) => <span key={k} data-reading-word={part.wordIndex ?? undefined} className={part.wordIndex !== null && part.wordIndex === activeWord ? 'reading-spoken-word' : undefined}>{part.text.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, j) => {
        const meaning = glosses[wordKey(token)];
        return meaning ? <Tooltip key={j}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><strong lang="en">{meaning}</strong></TooltipContent></Tooltip> : <span key={j}>{token}</span>;
      })}</span>)}</p>)}
    </article></TooltipProvider>
    <details className="reading-support"><summary>Need the gist in English?</summary><p lang="en">{story.english}</p></details>
    <details className="reading-support"><summary>{story.words.length} useful words & phrases</summary><dl>{story.words.map(word => <div key={word.german}><dt lang="de">{word.german}</dt><dd>{word.english}</dd><blockquote lang="de">{word.example}</blockquote></div>)}</dl>{story.revisit.length > 0 && <div className="reading-revisit"><strong>Words you have met before</strong>{story.revisit.map(word => <p key={word.german}><span lang="de">{word.german}</span> · {word.english} <Link href={`/stories/${word.storyId}`}>Earlier story: {word.title}</Link></p>)}</div>}</details>
    <details className="reading-support"><summary>Notice the grammar</summary><p>{story.grammar}</p><Link href={story.courseChapter ? `/grammar?lesson=${story.level.toLowerCase()}-${Math.ceil(story.courseChapter / 6)}-${((story.courseChapter - 1) % 6) + 1}#lesson` : '/grammar/cheat-sheets'}>{story.courseChapter ? 'Practice this grammar' : 'Open grammar recall tables'} <ArrowRight size={15} /></Link></details>
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
