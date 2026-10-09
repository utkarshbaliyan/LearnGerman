'use client';
import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { narrationTokens } from '@/app/lib/reading-narration';
import type { ReadingSentenceTranslation } from '@/app/lib/reading-sentence-translations';
import { useReadingNarration } from '@/app/components/reading-narration';
import type { ReadingStory } from '@/app/lib/reading-path';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useReaderWordStack } from './reader-word-stack';

const wordKey = (word: string) => word.toLowerCase().replace(/[^a-zäöüßé]/g, '');

function sentenceNarrationTokens(paragraphs: ReadingSentenceTranslation[][]) {
  let nextWord = 0;
  return paragraphs.map(paragraph => paragraph.map(sentence => ({
    ...sentence,
    parts: narrationTokens(sentence.de)[0].map(part => ({
      text: part.text,
      wordIndex: part.wordIndex === null ? null : nextWord++,
    })),
  })));
}

export function ReadingText({ story, glosses, sentenceTranslations }: { story: ReadingStory; glosses: Record<string, string>; sentenceTranslations?: ReadingSentenceTranslation[][] | null }) {
  const { activeWord } = useReadingNarration();
  const [showTranslations, setShowTranslations] = useState(false);
  const [openedGloss, setOpenedGloss] = useState<string | null>(null);
  const { collect, stack } = useReaderWordStack({ kind: 'story', id: story.id, title: story.title, href: `/stories/${story.id}`, level: story.level });
  const sentenceRows = useMemo(() => sentenceTranslations ? sentenceNarrationTokens(sentenceTranslations) : null,
    [sentenceTranslations]);
  const renderWords = (parts: { text: string; wordIndex: number | null }[], context: string) => parts.map((part, k) =>
    <span key={k} data-reading-word={part.wordIndex ?? undefined} className={part.wordIndex !== null && part.wordIndex === activeWord ? 'reading-spoken-word' : undefined}>{part.text.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, j) => {
      const meaning = glosses[wordKey(token)];
      const glossId = `${part.wordIndex}-${j}`;
      return meaning ? <Tooltip key={j} open={openedGloss === glossId} onOpenChange={open => setOpenedGloss(current => open ? glossId : current === glossId ? null : current)}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`} onClick={event => { event.preventDefault(); setOpenedGloss(glossId); collect(token, meaning, context); }}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><strong lang="en">{meaning}</strong></TooltipContent></Tooltip> : <span key={j}>{token}</span>;
    })}</span>);
  return <div className="reading-content reading-with-stack"><div className="reading-copy">
    <p className="reading-help">Tap a word for its meaning and collect it in your word stack.</p>
    {sentenceRows && <button type="button" className="reading-translation-toggle" aria-pressed={showTranslations} onClick={() => setShowTranslations(value => !value)}>{showTranslations ? 'Hide English translations' : 'Show English translations'}</button>}
    <TooltipProvider delayDuration={100}><article lang="de" className={`reading-prose reading-prose-${story.level.toLowerCase()}`}>
      {sentenceRows ? sentenceRows.map((paragraph, index) => <div className="reading-sentence-paragraph" key={index}>
        {paragraph.map((sentence, sentenceIndex) => <div className="reading-sentence" key={sentenceIndex}>
          <p lang="de">{renderWords(sentence.parts, sentence.de)}</p>
          {showTranslations && <p className="reading-sentence-translation" lang="en">{sentence.en}</p>}
        </div>)}
      </div>) : narrationTokens(story.text).map((paragraph, index) => <p key={index}>{renderWords(paragraph, paragraph.map(p => p.text).join(''))}</p>)}
    </article></TooltipProvider>
    {!sentenceRows && <details className="reading-support"><summary>Need the gist in English?</summary><p lang="en">{story.english}</p></details>}
  </div>{stack}</div>;
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
    <span className="reading-eyebrow">Check your understanding</span><h2>Comprehension quiz</h2>
    {story.questions.map((question, i) => <fieldset key={question.prompt}><legend>{question.prompt}</legend>{question.options.map((option, j) => <label key={option}><input type="radio" name={`${story.id}-q${i}`} checked={answers[i] === j} disabled={checked} onChange={() => setAnswers(current => ({ ...current, [i]: j }))} />{option}</label>)}{checked && <p className={answers[i] === question.answer ? 'reading-correct' : 'reading-retry'}>{answers[i] === question.answer ? 'Yes. ' : 'Read that part once more. '}{question.explanation}</p>}</fieldset>)}
    <div aria-live="polite">{checked && correct === story.questions.length ? <div className="reading-finished"><CheckCircle2 /><div><strong>Story complete.</strong><p>You followed a German story and checked its meaning.</p></div></div> : checked ? <p>You found {correct} of {story.questions.length}. Take another look, then try again.</p> : hydrated && completedIds.has(story.id) ? <p>You completed this story before. You can practise it again.</p> : null}</div>
    {checked ? <Button variant="outline" onClick={() => { setChecked(false); setAnswers({}); }}>Try the questions again</Button> : <Button onClick={check} disabled={!hydrated || Object.keys(answers).length !== story.questions.length}>Check my answers</Button>}
  </section>;
}
