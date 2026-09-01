"use client";

import { MousePointer2, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cleanWord, meaningFor, type Curriculum, type Story } from "@/app/curriculum";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const timingCache = new Map<string, number[]>();

function TranslatedWord({ token, active }: { token: string; active: boolean }) {
  const word = cleanWord(token);
  const isNumber = /\d/.test(token);
  if (!word && !isNumber) return <>{token}</>;

  const meaning = meaningFor(token);
  if (!meaning) {
    return <span className={`story-word no-gloss${active ? " is-active" : ""}`}>{token}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`story-word${active ? " is-active" : ""}`}
          aria-label={`${word}: ${meaning}`}
        >
          {token}
        </button>
      </TooltipTrigger>
      <TooltipContent
        className="story-word-gloss"
        side="top"
        sideOffset={10}
        collisionPadding={12}
      >
        <span lang="de">{word}</span>
        <strong lang="en">{meaning}</strong>
      </TooltipContent>
    </Tooltip>
  );
}

function tokenizeStory(text: string) {
  let wordIndex = 0;
  return text.split(/\n\n/).map((paragraph) => paragraph.split(/(\s+)/).map((token) => {
    const isWord = !/^\s+$/.test(token) && Boolean(cleanWord(token) || /\d/.test(token));
    if (!isWord) return { token, wordIndex: -1 };
    const currentWord = wordIndex;
    wordIndex += 1;
    return { token, wordIndex: currentWord };
  }));
}

function TranslatedStoryText({ text, activeWord }: { text: string; activeWord: number }) {
  const paragraphs = tokenizeStory(text);

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={80}>
      <div className="chapter-word-help">
        <MousePointer2 />
        <span>Hover, tap, or focus an underlined word to see its English meaning.</span>
      </div>
      <div className="chapter-story-copy">
        {paragraphs.map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex}>
            {paragraph.map(({ token, wordIndex: tokenWordIndex }, tokenIndex) => tokenWordIndex < 0
              ? <span key={tokenIndex}>{token}</span>
              : <TranslatedWord key={tokenIndex} token={token} active={activeWord === tokenWordIndex} />)}
          </p>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function NarratedTranslatedStory({
  curriculum,
  story,
  playbackRate,
  speedLabel,
}: {
  curriculum: Curriculum;
  story: Story;
  playbackRate: number;
  speedLabel: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [activeWord, setActiveWord] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordStartsRef = useRef<number[]>([]);
  const activeWordRef = useRef(-1);
  const animationFrameRef = useRef<number | null>(null);
  const storyNumber = String(story.number).padStart(3, "0");

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `${curriculum.id}:${story.id}`;
    const cachedTimings = timingCache.get(cacheKey);

    if (cachedTimings) {
      wordStartsRef.current = cachedTimings;
    } else {
      wordStartsRef.current = [];
      const timingUrl = `${curriculum.audioBasePath}/story-${storyNumber}.json?v=${curriculum.audioVersion}`;
      void fetch(timingUrl, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`Timing request failed: ${response.status}`);
          return response.json() as Promise<{ starts?: unknown }>;
        })
        .then((data) => {
          if (!Array.isArray(data.starts) || !data.starts.every((value) => typeof value === "number")) {
            throw new Error("Invalid timing data");
          }
          timingCache.set(cacheKey, data.starts);
          wordStartsRef.current = data.starts;
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            console.error("Story timing could not be loaded", error);
          }
        });
    }

    return () => controller.abort();
  }, [curriculum, story, storyNumber]);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  function stopHighlightLoop() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }

  function highlightWordAt(time: number) {
    const starts = wordStartsRef.current;
    let nextWord = -1;
    let low = 0;
    let high = starts.length - 1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (starts[middle] <= time) {
        nextWord = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    if (nextWord !== activeWordRef.current) {
      activeWordRef.current = nextWord;
      setActiveWord(nextWord);
    }
  }

  function startHighlightLoop(audio: HTMLAudioElement) {
    stopHighlightLoop();
    const update = () => {
      highlightWordAt(audio.currentTime);
      if (!audio.paused && !audio.ended) {
        animationFrameRef.current = requestAnimationFrame(update);
      } else {
        animationFrameRef.current = null;
      }
    };
    update();
  }

  function resetHighlight() {
    activeWordRef.current = -1;
    setActiveWord(-1);
  }

  function createAndPlayAudio() {
    setAudioError("");
    setIsLoading(true);
    const audioUrl = `${curriculum.audioBasePath}/story-${storyNumber}.webm?v=${curriculum.audioVersion}`;
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    audio.onplaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      startHighlightLoop(audio);
    };
    audio.onwaiting = () => setIsLoading(true);
    audio.oncanplay = () => setIsLoading(false);
    audio.onpause = () => {
      stopHighlightLoop();
      setIsPlaying(false);
    };
    audio.onended = () => {
      stopHighlightLoop();
      setIsPlaying(false);
      setIsLoading(false);
      resetHighlight();
    };
    audio.onerror = () => {
      stopHighlightLoop();
      setIsPlaying(false);
      setIsLoading(false);
      resetHighlight();
      setAudioError("The story audio could not be loaded. Please try again.");
      audioRef.current = null;
    };
    void audio.play().catch((error: unknown) => {
      stopHighlightLoop();
      setIsLoading(false);
      const blocked = error instanceof DOMException && error.name === "NotAllowedError";
      setAudioError(blocked ? "Your browser blocked playback. Press Play once more." : "Playback could not start. Please try again.");
    });
  }

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return createAndPlayAudio();
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (audio.ended) audio.currentTime = 0;
    void audio.play();
  }

  function restartAudio() {
    const audio = audioRef.current;
    if (!audio) return createAndPlayAudio();
    audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    resetHighlight();
    void audio.play();
  }

  return (
    <>
      <div className="chapter-audio-player">
        <Button size="icon-lg" onClick={toggleAudio} disabled={isLoading} aria-label={isPlaying ? "Pause chapter audio" : "Play chapter audio"}>
          {isPlaying ? <Pause /> : <Play />}
        </Button>
        <div>
          <strong>{isLoading ? "Loading narration…" : isPlaying ? "Listening in German" : story.title}</strong>
          <span>Narrated story · {speedLabel}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={restartAudio} aria-label="Restart chapter audio"><RotateCcw /></Button>
      </div>
      {audioError && <p className="chapter-error" role="alert">{audioError}</p>}
      <TranslatedStoryText text={story.text} activeWord={activeWord} />
    </>
  );
}
