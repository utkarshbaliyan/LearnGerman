'use client';

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Pause, Play, Plus, RotateCcw, Undo2, Volume2 } from 'lucide-react';
import { narrationTokens, spokenWordAt, validNarrationTiming, type NarrationAsset, type NarrationTiming } from '@/app/lib/reading-narration';
import { readSavedNarrationSpeed, writeSavedNarrationSpeed } from '@/app/components/reading-narration';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useReaderWordStack } from './reader-word-stack';
import type { WordSource } from '@/app/lib/progress-sync';

const wordKey = (word: string) => word.toLowerCase().replace(/[^a-zäöüßé]/g, '');
const ALLOWED_SPEEDS = [.75, .85, 1, 1.15, 1.25, 1.5];

function clock(seconds: number) {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

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
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [length, setLength] = useState(audio?.duration ?? 0);
  const [showTranslations, setShowTranslations] = useState(false);
  const [speed, setSpeed] = useState(.85);
  const words = useMemo(() => narrationTokens(paragraphs.join('\n\n')), [paragraphs]);
  const { collect, isSavedWord, saveSingleWord, stack } = useReaderWordStack(source);
  const [openedGloss, setOpenedGloss] = useState<string | null>(null);

  useEffect(() => {
    const saved = readSavedNarrationSpeed();
    if (saved !== null) {
      setSpeed(saved);
      if (player.current) {
        player.current.preservesPitch = true;
        player.current.defaultPlaybackRate = saved;
        player.current.playbackRate = saved;
      }
    }
  }, [audio?.src]);

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
    if (player.current) setPosition(player.current.currentTime);
    setActiveWord(player.current && timing ? spokenWordAt(timing.starts, player.current.currentTime, timing.duration) : -1);
  }, [timing]);
  const follow = useCallback(function followFrame() {
    cancelAnimationFrame(frame.current);
    syncWord();
    if (player.current && !player.current.paused && !player.current.ended) frame.current = requestAnimationFrame(followFrame);
  }, [syncWord]);
  function stopFollowing() {
    cancelAnimationFrame(frame.current);
    setPlaying(false);
    setActiveWord(-1);
  }
  useEffect(() => {
    if (player.current && !player.current.paused) frame.current = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame.current);
  }, [follow]);

  function seekToWord(wordIndex: number) {
    if (!player.current || !timing || wordIndex < 0 || wordIndex >= timing.starts.length) return;
    const target = Math.max(0, timing.starts[wordIndex]);
    player.current.currentTime = target;
    setPosition(target);
    syncWord();
    if (player.current.paused || player.current.ended) {
      player.current.play().catch(() => setAudioError(true));
    }
  }

  return <TooltipProvider delayDuration={100}><div className="book-page-sheet reading-with-stack"><div className="reading-copy">
    <p className="reading-help">Hover or tap a word for its meaning.</p>
    <div className="book-page-audio reading-audio">
      {audio ? <>
        <audio ref={player} playsInline preload="metadata" aria-label="Play this whole page in German"
          onLoadedMetadata={event => {
            const activeRate = readSavedNarrationSpeed() ?? speed;
            event.currentTarget.preservesPitch = true;
            event.currentTarget.defaultPlaybackRate = activeRate;
            event.currentTarget.playbackRate = activeRate;
            const d = event.currentTarget.duration;
            if (d && Number.isFinite(d)) setLength(d);
          }}
          onDurationChange={() => { const d = player.current?.duration; if (d && Number.isFinite(d)) setLength(d); }}
          onPlay={() => { setAudioError(false); setPlaying(true); follow(); }}
          onTimeUpdate={syncWord} onSeeking={syncWord} onSeeked={syncWord}
          onPause={() => { setPlaying(false); cancelAnimationFrame(frame.current); syncWord(); }}
          onEnded={stopFollowing}
          onRateChange={() => setSpeed(player.current?.playbackRate ?? .85)}
          onError={() => { stopFollowing(); setAudioError(true); }}>
          {audio.compatibleSrc && <source src={audio.compatibleSrc} type="audio/mp4" />}
          <source src={audio.src} type={audio.src.endsWith('.webm') ? 'audio/webm' : 'audio/mp4'} />
        </audio>
        <div className="narration-player">
          <button type="button" className="narration-play" aria-label={playing ? 'Pause page narration' : 'Play page narration'} onClick={() => {
            const el = player.current;
            if (!el) return;
            if (el.paused || el.ended) el.play().catch(() => setAudioError(true));
            else el.pause();
          }}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
          <input type="range" className="narration-seek" aria-label="Page narration position" aria-valuetext={`${clock(position)} of ${clock(length)}`} min={0} max={length || 0} step={0.1} value={Math.min(position, length || 0)} onChange={event => {
            const time = Number(event.target.value);
            setPosition(time);
            if (player.current) { player.current.currentTime = time; syncWord(); }
          }} style={{ '--narration-progress': `${length ? Math.min(100, position / length * 100) : 0}%` } as CSSProperties} />
          <span className="narration-time" aria-hidden="true">{clock(position)} / {clock(length)}</span>
        </div>
        <div className="narration-options">
          <label>Speed <select aria-label="Page narration speed" value={speed} onChange={event => {
            const value = Number(event.target.value);
            setSpeed(value);
            writeSavedNarrationSpeed(value);
            if (player.current) { player.current.preservesPitch = true; player.current.defaultPlaybackRate = value; player.current.playbackRate = value; }
          }}>{ALLOWED_SPEEDS.map(rate => <option key={rate} value={rate}>{rate}×{rate === 1 ? ' · Normal' : ''}</option>)}</select></label>
          <Button variant="outline" onClick={() => { if (player.current) { player.current.currentTime = Math.max(0, player.current.currentTime - 5); syncWord(); } }}><Undo2 size={16} aria-hidden="true" />Back 5s</Button>
          <Button variant="outline" onClick={() => { if (player.current) { player.current.currentTime = 0; syncWord(); } }}><RotateCcw size={16} aria-hidden="true" />Restart</Button>
        </div>
      </> : <span role="status">Recording unavailable</span>}
    </div>
    {audioError && <p className="book-audio-error" role="alert">The recording could not load. Please try again.</p>}
    {translations.length === paragraphs.length && <button type="button" className="reading-translation-toggle" aria-pressed={showTranslations} onClick={() => setShowTranslations(value => !value)}>{showTranslations ? 'Hide English translations' : 'Show English translations'}</button>}
    {paragraphs.map((paragraph, index) => {
      const firstWord = words[index].find(part => part.wordIndex !== null)?.wordIndex ?? null;
      return <section className="book-paragraph" aria-label={`Paragraph ${index + 1}`} key={index}>
        <p lang="de" className="reading-prose reading-prose-a1">{timing && firstWord !== null && <button type="button" className="sentence-seek-btn" aria-label={`Play from paragraph ${index + 1}`} title="Play from here" onClick={() => seekToWord(firstWord)}><Volume2 size={14} aria-hidden="true" /></button>}{words[index].map((part, partIndex) => <span key={partIndex} data-reading-word={part.wordIndex ?? undefined} className={part.wordIndex !== null && part.wordIndex === activeWord ? 'reading-spoken-word' : undefined}>
          {part.text.split(/([\p{L}]+(?:[-’'][\p{L}]+)*)/gu).map((token, tokenIndex) => {
            const meaning = glosses[wordKey(token)];
            const glossId = `${part.wordIndex}-${tokenIndex}`;
            if (!meaning) return <span key={tokenIndex}>{token}</span>;
            const saved = isSavedWord(token, meaning);
            return <Tooltip key={tokenIndex} open={openedGloss === glossId} onOpenChange={open => setOpenedGloss(current => open ? glossId : current === glossId ? null : current)}><TooltipTrigger asChild><button type="button" className="reading-word" aria-label={`${token}: ${meaning}`} onClick={() => { setOpenedGloss(glossId); collect(token, meaning, paragraph); }}>{token}</button></TooltipTrigger><TooltipContent className="story-word-gloss"><span className="gloss-tooltip-row"><strong lang="en">{meaning}</strong><button type="button" className="gloss-save-btn" aria-label={saved ? `${token} saved for review` : `Save ${token} for review`} onClick={event => { event.stopPropagation(); saveSingleWord(token, meaning, paragraph); }}>{saved ? <><Check size={12} aria-hidden="true" /> Saved</> : <><Plus size={12} aria-hidden="true" /> Save</>}</button></span></TooltipContent></Tooltip>;
          })}</span>)}</p>
        {showTranslations && <p lang="en" className="book-paragraph-translation">{translations[index]}</p>}
      </section>;
    })}
  </div>{stack}</div></TooltipProvider>;
}
