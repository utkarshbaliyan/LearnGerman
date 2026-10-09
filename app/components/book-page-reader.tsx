'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { narrationTokens, spokenWordAt, validNarrationTiming, type NarrationAsset, type NarrationTiming } from '@/app/lib/reading-narration';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useReaderWordStack } from './reader-word-stack';
import type { WordSource } from '@/app/lib/progress-sync';

const wordKey = (word: string) => word.toLowerCase().replace(/[^a-zäöüßé]/g, '');

export function BookPageReader({ paragraphs, translations, glosses, audio, source }: {
  paragraphs: string[];
  translations: string[];
  glosses: Record<string, string>;
  audio?: NarrationAsset;
  source: WordSource;
}) {
  const player = useRef<HTMLAudioElement>(null);
  const frame = useRef(0);
  const [timing, setTiming] = useState<NarrationTiming | null>(null);
  const [activeWord, setActiveWord] = useState(-1);
  const [audioError, setAudioError] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [speed, setSpeed] = useState(.85);
  const words = useMemo(() => narrationTokens(paragraphs.join('\n\n')), [paragraphs]);
  const { collect, stack } = useReaderWordStack(source);
  const [openedGloss, setOpenedGloss] = useState<string | null>(null);

  useEffect(() => {
    if (!audio) return;
    const controller = new AbortController();
    fetch(audio.timingSrc, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Timing unavailable'); return response.json(); })
      .then(value => { if (validNarrationTiming(value, audio)) setTiming(value); })
      .catch(() => {});
    return () => controller.abort();
  }, [audio]);

  const syncWord = useCallback(() => {
    setActiveWord(player.current && timing ? spokenWordAt(timing.starts, player.current.currentTime, timing.duration) : -1);
  }, [timing]);
  const follow = useCallback(function followFrame() {
    syncWord();
    frame.current = requestAnimationFrame(followFrame);
  }, [syncWord]);
  function stopFollowing() {
    cancelAnimationFrame(frame.current);
    setActiveWord(-1);
  }
  useEffect(() => {
    if (player.current && !player.current.paused) frame.current = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame.current);
  }, [follow]);

  return <TooltipProvider delayDuration={100}><div className="book-page-sheet reading-with-stack"><div className="reading-copy">
    <p className="reading-help">Hover for a meaning. Click a word to collect it in your stack.</p>
    <div className="book-page-audio">
      {audio ? <audio ref={player} src={audio.src} controls preload="metadata" aria-label="Play this whole page in German"
        onLoadedMetadata={event => { event.currentTarget.defaultPlaybackRate = speed; event.currentTarget.playbackRate = speed; }}
        onPlay={() => { cancelAnimationFrame(frame.current); frame.current = requestAnimationFrame(follow); setAudioError(false); }}
        onTimeUpdate={syncWord} onSeeking={syncWord} onSeeked={syncWord}
        onPause={stopFollowing} onEnded={stopFollowing}
        onError={() => { stopFollowing(); setAudioError(true); }} /> : <span role="status">Recording unavailable</span>}
      {audio && <label>Speed <select aria-label="Page narration speed" value={speed} onChange={event => {
        const value = Number(event.target.value);
        setSpeed(value);
        if (player.current) player.current.playbackRate = value;
      }}>{[.75, .85, 1, 1.15, 1.25, 1.5].map(rate => <option key={rate} value={rate}>{rate}×</option>)}</select></label>}
    </div>
    {audioError && <p className="book-audio-error" role="alert">The recording could not load. Please try again.</p>}
    {translations.length === paragraphs.length && <button type="button" className="reading-translation-toggle" aria-pressed={showTranslations} onClick={() => setShowTranslations(value => !value)}>{showTranslations ? 'Hide English translations' : 'Show English translations'}</button>}
    {paragraphs.map((paragraph, index) => <section className="book-paragraph" aria-label={`Paragraph ${index + 1}`} key={index}>
      <p lang="de" className="reading-prose reading-prose-a1">{words[index].map((part, partIndex) => <span key={partIndex} data-reading-word={part.wordIndex ?? undefined} className={part.wordIndex !== null && part.wordIndex === activeWord ? 'reading-spoken-word' : undefined}>
        {part.text.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, tokenIndex) => {
          const meaning = glosses[wordKey(token)];
          const glossId = `${part.wordIndex}-${tokenIndex}`;
          return meaning ? <Tooltip key={tokenIndex} open={openedGloss === glossId} onOpenChange={open => setOpenedGloss(current => open ? glossId : current === glossId ? null : current)}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`} onClick={() => { setOpenedGloss(glossId); collect(token, meaning, paragraph); }}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><strong lang="en">{meaning}</strong></TooltipContent></Tooltip> : <span key={tokenIndex}>{token}</span>;
        })}</span>)}</p>
      {showTranslations && <p lang="en" className="book-paragraph-translation">{translations[index]}</p>}
    </section>)}
  </div>{stack}</div></TooltipProvider>;
}
