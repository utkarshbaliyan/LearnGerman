'use client';

import { useEffect, useRef, useState } from 'react';
import { narrationTokens, spokenWordAt, validNarrationTiming, type NarrationAsset, type NarrationTiming } from '@/app/lib/reading-narration';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const wordKey = (word: string) => word.toLowerCase().replace(/[^a-zäöüßé]/g, '');

function BookParagraph({ number, text, summary, glosses, asset, onPlay }: {
  number: number;
  text: string;
  summary: string;
  glosses: Record<string, string>;
  asset?: NarrationAsset;
  onPlay: (player: HTMLAudioElement) => void;
}) {
  const player = useRef<HTMLAudioElement>(null);
  const [timing, setTiming] = useState<NarrationTiming | null>(null);
  const [activeWord, setActiveWord] = useState(-1);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (!asset) return;
    const controller = new AbortController();
    fetch(asset.timingSrc, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Timing unavailable'); return response.json(); })
      .then(value => { if (validNarrationTiming(value, asset)) setTiming(value); })
      .catch(() => {});
    return () => controller.abort();
  }, [asset]);

  function syncWord() {
    setActiveWord(player.current && timing ? spokenWordAt(timing.starts, player.current.currentTime, timing.duration) : -1);
  }

  return <section className="book-paragraph" aria-label={`Paragraph ${number}`}>
    <div className="book-paragraph-top"><span>Paragraph {number}</span>
      {asset ? <audio ref={player} src={asset.src} controls preload="none" aria-label={`Play paragraph ${number} in German`}
        onLoadedMetadata={event => { event.currentTarget.defaultPlaybackRate = .85; event.currentTarget.playbackRate = .85; }}
        onPlay={event => { onPlay(event.currentTarget); setAudioError(false); }}
        onTimeUpdate={syncWord} onSeeking={syncWord} onSeeked={syncWord}
        onPause={() => setActiveWord(-1)} onEnded={() => setActiveWord(-1)}
        onError={() => setAudioError(true)} /> : <span role="status">Recording unavailable</span>}
    </div>
    {audioError && <p className="book-audio-error" role="alert">The recording could not load. Please try again.</p>}
    <p lang="de" className="reading-prose reading-prose-a1">{narrationTokens(text)[0].map((part, index) => <span key={index} className={part.wordIndex === activeWord ? 'reading-spoken-word' : undefined}>
      {part.text.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, tokenIndex) => {
        const meaning = glosses[wordKey(token)];
        return meaning ? <Tooltip key={tokenIndex}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><strong lang="en">{meaning}</strong></TooltipContent></Tooltip> : <span key={tokenIndex}>{token}</span>;
      })}</span>)}</p>
    <p lang="en" className="book-paragraph-summary"><span>In English · </span>{summary}</p>
  </section>;
}

export function BookPageReader({ paragraphs, summaries, glosses, audio }: {
  paragraphs: string[];
  summaries: string[];
  glosses: Record<string, string>;
  audio: NarrationAsset[];
}) {
  const playing = useRef<HTMLAudioElement | null>(null);
  return <TooltipProvider delayDuration={100}><div className="book-page-sheet">
    <p className="reading-help">Hover over or tap a word for its English meaning. Each paragraph has its own recording.</p>
    {paragraphs.map((paragraph, index) => <BookParagraph key={index} number={index + 1} text={paragraph} summary={summaries[index]} glosses={glosses} asset={audio[index]}
      onPlay={player => { if (playing.current && playing.current !== player) playing.current.pause(); playing.current = player; }} />)}
  </div></TooltipProvider>;
}
