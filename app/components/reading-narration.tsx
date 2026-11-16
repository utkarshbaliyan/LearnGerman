'use client';

import { type CSSProperties, createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, RotateCcw, Undo2 } from 'lucide-react';
import { createNarrationHighlighter, spokenWordAt, validNarrationTiming, type NarrationAsset, type NarrationTiming } from '@/app/lib/reading-narration';
import { Button } from '@/components/ui/button';

function clock(seconds: number) {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

const NarrationContext = createContext<{ registerText: (element: HTMLElement | null) => void; setActiveWord: (word: number) => void }>({ registerText: () => {}, setActiveWord: () => {} });

export function ReadingNarrationProvider({ children }: { children: ReactNode }) {
  const [highlighter] = useState(createNarrationHighlighter);
  return <NarrationContext.Provider value={highlighter}>{children}</NarrationContext.Provider>;
}

export function useReadingNarration() { return useContext(NarrationContext); }

export function ReadingAudio({ storyId, asset, onFinished }: { storyId: string; asset?: NarrationAsset; onFinished?: () => void }) {
  const { setActiveWord } = useReadingNarration();
  const audio = useRef<HTMLAudioElement>(null);
  const timing = useRef<NarrationTiming | null>(null);
  const frame = useRef(0);
  const initialSpeed = storyId.startsWith('reading-a1-') ? .85 : 1;
  const [speed, setSpeed] = useState(initialSpeed);
  const [error, setError] = useState('');
  const [buffering, setBuffering] = useState(false);
  const [timingError, setTimingError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [length, setLength] = useState(asset?.duration ?? 0);

  const syncWord = useCallback(() => {
    const player = audio.current;
    const data = timing.current;
    if (player) setPosition(player.currentTime);
    setActiveWord(player && data ? spokenWordAt(data.starts, player.currentTime, data.duration) : -1);
  }, [setActiveWord]);
  const follow = useCallback(function followFrame() {
    cancelAnimationFrame(frame.current);
    syncWord();
    if (audio.current && !audio.current.paused && !audio.current.ended) frame.current = requestAnimationFrame(followFrame);
  }, [syncWord]);

  useEffect(() => {
    if (!asset) return;
    const controller = new AbortController();
    timing.current = null;
    fetch(asset.timingSrc, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Timing unavailable');
      return response.json();
    }).then(data => {
      if (controller.signal.aborted) return;
      if (!validNarrationTiming(data, asset)) throw new Error('Timing does not match this story');
      timing.current = data;
      setTimingError(false);
      syncWord();
    }).catch(() => { if (!controller.signal.aborted) setTimingError(true); });
    return () => controller.abort();
  }, [asset, retry, syncWord]);

  useEffect(() => {
    const player = audio.current;
    if (player) {
      player.preservesPitch = true;
      player.defaultPlaybackRate = initialSpeed;
      player.playbackRate = initialSpeed;
      if (!player.paused) follow();
    }
    return () => { cancelAnimationFrame(frame.current); player?.pause(); setActiveWord(-1); };
  }, [storyId, initialSpeed, setActiveWord, follow]);

  if (!asset) return <p role="status">Narration is unavailable for this story.</p>;
  return <div className="reading-audio">
    <audio ref={audio} playsInline preload="metadata" aria-label="German story narration"
      onPlay={() => { setError(''); setPlaying(true); follow(); }} onPlaying={() => { setBuffering(false); follow(); }}
      onWaiting={() => setBuffering(true)} onStalled={() => { if (audio.current && !audio.current.paused) setBuffering(true); }}
      onPause={() => { setPlaying(false); setBuffering(false); cancelAnimationFrame(frame.current); syncWord(); }}
      onSeeking={syncWord} onSeeked={syncWord} onTimeUpdate={syncWord}
      onEnded={() => { setPlaying(false); setBuffering(false); cancelAnimationFrame(frame.current); setActiveWord(-1); onFinished?.(); }}
      onLoadedMetadata={() => { const d = audio.current?.duration; if (d && Number.isFinite(d)) setLength(d); }} onDurationChange={() => { const d = audio.current?.duration; if (d && Number.isFinite(d)) setLength(d); }}
      onRateChange={() => setSpeed(audio.current?.playbackRate ?? 1)}
      onError={() => { setPlaying(false); setBuffering(false); cancelAnimationFrame(frame.current); setActiveWord(-1); setError('The recording could not load. Check your connection and try again.'); }}>
      {asset.compatibleSrc && <source src={asset.compatibleSrc} type="audio/mp4" />}
      <source src={asset.src} type={asset.src.endsWith('.webm') ? 'audio/webm' : 'audio/mp4'} onError={() => { setBuffering(false); setError('The recording could not load. Check your connection and try again.'); }} />
    </audio>
    <div className="narration-player">
      <button type="button" className="narration-play" aria-label={playing ? 'Pause narration' : 'Play narration'} onClick={() => {
        const player = audio.current;
        if (!player) return;
        if (player.paused || player.ended) player.play().catch(() => setError('The recording could not play. Check your connection and try again.'));
        else player.pause();
      }}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
      <input type="range" className="narration-seek" aria-label="Narration position" aria-valuetext={`${clock(position)} of ${clock(length)}`} min={0} max={length || 0} step={0.1} value={Math.min(position, length || 0)} onChange={event => {
        const time = Number(event.target.value);
        setPosition(time);
        if (audio.current) { audio.current.currentTime = time; syncWord(); }
      }} style={{ '--narration-progress': `${length ? Math.min(100, position / length * 100) : 0}%` } as CSSProperties} />
      <span className="narration-time" aria-hidden="true">{clock(position)} / {clock(length)}</span>
    </div>
    <div className="narration-options">
    <label>Speed <select aria-label="Narration speed" value={speed} onChange={event => {
      const rate = Number(event.target.value);
      setSpeed(rate);
      if (audio.current) { audio.current.preservesPitch = true; audio.current.defaultPlaybackRate = rate; audio.current.playbackRate = rate; }
    }}>{[.75, .85, 1, 1.15, 1.25, 1.5].map(rate => <option key={rate} value={rate}>{rate}×{rate === 1 ? ' · Normal' : ''}</option>)}
      {![.75, .85, 1, 1.15, 1.25, 1.5].includes(speed) && <option value={speed}>{speed}×</option>}
    </select></label>
    <Button variant="outline" onClick={() => { if (audio.current) { audio.current.currentTime = Math.max(0, audio.current.currentTime - 5); syncWord(); } }}><Undo2 size={16} aria-hidden="true" />Back 5s</Button>
    <Button variant="outline" onClick={() => { if (audio.current) { audio.current.currentTime = 0; syncWord(); } }}><RotateCcw size={16} aria-hidden="true" />Restart</Button>
    </div>
    {buffering && !error && <p role="status">Buffering audio…</p>}
    {error && <p role="alert">{error} <button type="button" onClick={() => { setError(''); audio.current?.load(); }}>Reload audio</button></p>}
    {timingError && <p role="status">Word highlighting could not load. <button type="button" onClick={() => { setTimingError(false); setRetry(value => value + 1); }}>Retry highlighting</button></p>}
  </div>;
}
