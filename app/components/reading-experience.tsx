'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, Flame, Plus, Volume2 } from 'lucide-react';
import { narrationTokens } from '@/app/lib/reading-narration';
import type { ReadingSentenceTranslation } from '@/app/lib/reading-sentence-translations';
import { useReadingNarration } from '@/app/components/reading-narration';
import type { ReadingStory } from '@/app/lib/reading-path';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { useLearningProgress } from '@/app/hooks/use-learning-progress';
import { dailyLearningSummary } from '@/app/lib/daily-learning';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';
import { readingMinutes } from '@/app/lib/book-catalog';
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
  const { registerText, hasTiming, seekToWord } = useReadingNarration();
  const [showTranslations, setShowTranslations] = useState(false);
  const [openedGloss, setOpenedGloss] = useState<string | null>(null);
  const { collect, isSavedWord, saveSingleWord, stack } = useReaderWordStack({ kind: 'story', id: story.id, title: story.title, href: `/stories/${story.id}`, level: story.level });
  const sentenceRows = useMemo(() => sentenceTranslations ? sentenceNarrationTokens(sentenceTranslations) : null,
    [sentenceTranslations]);
  const renderWords = (parts: { text: string; wordIndex: number | null }[], context: string) => parts.map((part, k) =>
    <span key={k} data-reading-word={part.wordIndex ?? undefined}>{part.text.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, j) => {
      const meaning = glosses[wordKey(token)];
      const glossId = `${part.wordIndex}-${j}`;
      if (!meaning) return <span key={j}>{token}</span>;
      const saved = isSavedWord(token, meaning);
      return <Tooltip key={j} open={openedGloss === glossId} onOpenChange={open => setOpenedGloss(current => open ? glossId : current === glossId ? null : current)}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`} onClick={event => { event.preventDefault(); setOpenedGloss(glossId); collect(token, meaning, context); }}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><span className="gloss-tooltip-row"><strong lang="en">{meaning}</strong><button type="button" className="gloss-save-btn" aria-label={saved ? `${token} saved for review` : `Save ${token} for review`} onClick={event => { event.stopPropagation(); saveSingleWord(token, meaning, context); }}>{saved ? <><Check size={12} aria-hidden="true" /> Saved</> : <><Plus size={12} aria-hidden="true" /> Save</>}</button></span></TooltipContent></Tooltip>;
    })}</span>);
  return <div className="reading-content reading-with-stack"><div className="reading-copy">
    <p className="reading-help">Tap a word for its meaning.</p>
    {sentenceRows && <button type="button" className="reading-translation-toggle" aria-pressed={showTranslations} onClick={() => setShowTranslations(value => !value)}>{showTranslations ? 'Hide English translations' : 'Show English translations'}</button>}
    <TooltipProvider delayDuration={100}><article ref={registerText} lang="de" className={`reading-prose reading-prose-${story.level.toLowerCase()}`}>
      {sentenceRows ? sentenceRows.map((paragraph, index) => <div className="reading-sentence-paragraph" key={index}>
        {paragraph.map((sentence, sentenceIndex) => {
          const firstWord = sentence.parts.find(part => part.wordIndex !== null)?.wordIndex ?? null;
          return <div className="reading-sentence" key={sentenceIndex}>
            <p lang="de">{hasTiming && firstWord !== null && <button type="button" className="sentence-seek-btn" aria-label="Play from this sentence" title="Play from this sentence" onClick={() => seekToWord(firstWord)}><Volume2 size={14} aria-hidden="true" /></button>}{renderWords(sentence.parts, sentence.de)}</p>
            {showTranslations && <p className="reading-sentence-translation" lang="en">{sentence.en}</p>}
          </div>;
        })}
      </div>) : narrationTokens(story.text).map((paragraph, index) => <p key={index}>{renderWords(paragraph, paragraph.map(p => p.text).join(''))}</p>)}
    </article></TooltipProvider>
    {!sentenceRows && <details className="reading-support"><summary>Need the gist in English?</summary><p lang="en">{story.english}</p></details>}
  </div>{stack}</div>;
}

export type NextStoryHint = { id: string; title: string; level: string; wordCount: number };

export function ReadingCheck({ story, onScore, nextStory }: { story: ReadingStory; onScore?: (score: number) => void; nextStory?: NextStoryHint }) {
  const { progress: storyProgress, completedIds, hydrated, setStoryCompleted, storageError } = useStoryProgress();
  const { progress: vocabulary } = useVocabularyProgress();
  const { progress: learning } = useLearningProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const correct = story.questions.filter((question, i) => answers[i] === question.answer).length;
  const allCorrect = correct === story.questions.length;
  const daily = checked && allCorrect ? dailyLearningSummary(storyProgress, vocabulary, learning.daily) : null;
  const isGuest = typeof window !== 'undefined' && !localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
  function check() {
    if (allCorrect && !setStoryCompleted(story.id, true)) return;
    setChecked(true);
    onScore?.(Math.round(correct / story.questions.length * 100));
  }
  function retryMissed() {
    if (allCorrect) {
      setChecked(false);
      setAnswers({});
      return;
    }
    const kept: Record<number, number> = {};
    story.questions.forEach((question, i) => {
      if (answers[i] === question.answer) kept[i] = answers[i];
    });
    setAnswers(kept);
    setChecked(false);
  }
  return <section className="reading-check" aria-label="Reading practice">
    {storageError && <p role="alert">{storageError}</p>}
    <h2>Comprehension quiz</h2>
    {story.questions.map((question, i) => <fieldset key={question.prompt}><legend>{question.prompt}</legend>{question.options.map((option, j) => <label key={option}><input type="radio" name={`${story.id}-q${i}`} checked={answers[i] === j} disabled={checked} onChange={() => setAnswers(current => ({ ...current, [i]: j }))} />{option}</label>)}{checked && <p className={answers[i] === question.answer ? 'reading-correct' : 'reading-retry'}>{answers[i] === question.answer ? 'Yes. ' : 'Read that part once more. '}{question.explanation}</p>}</fieldset>)}
    <div aria-live="polite">{checked && allCorrect ? <div className="reading-finished"><CheckCircle2 /><div><strong>Story complete.</strong><p>You followed a German story and checked its meaning.</p>{daily && <p className="reading-streak-note"><Flame size={15} aria-hidden="true" /> {daily.todayComplete ? `Daily goal complete · ${daily.streak}-day streak.` : 'Progress saved.'}</p>}{isGuest && <p className="reading-guest-nudge"><Link href="/account">Create a free account</Link> to save your streak and flashcards across devices.</p>}{nextStory && <p className="reading-next-inline"><Link href={`/stories/${nextStory.id}`}>Up next ({nextStory.level}, ~{readingMinutes(nextStory.wordCount)} min): <span lang="de">{nextStory.title}</span> <ArrowRight size={15} aria-hidden="true" /></Link></p>}</div></div> : checked ? <p>You found {correct} of {story.questions.length}. Your right answers are kept—fix the missed ones and check again.</p> : hydrated && completedIds.has(story.id) ? <p>You completed this story before. You can practise it again.</p> : null}</div>
    {checked ? <Button variant="outline" onClick={retryMissed}>{allCorrect ? 'Try the questions again' : 'Try missed questions again'}</Button> : <Button onClick={check} disabled={!hydrated || Object.keys(answers).length !== story.questions.length}>Check my answers</Button>}
  </section>;
}
