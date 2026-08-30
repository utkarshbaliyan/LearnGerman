"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Gauge,
  Languages,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";

import { cleanWord, meaningFor, type Curriculum, type Story } from "@/app/curriculum";
import { getUnitCopy } from "@/app/course-copy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const STOP_WORDS = new Set([
  "aber", "alle", "als", "am", "an", "auch", "auf", "aus", "bei", "das", "dem",
  "den", "der", "deshalb", "die", "du", "ein", "eine", "einem", "einen", "einer",
  "er", "es", "für", "hat", "heute", "hier", "ich", "ihr", "ihre", "im", "in",
  "ist", "jetzt", "kann", "kein", "keine", "mit", "möchte", "muss", "nach", "nicht",
  "noch", "nur", "oder", "sein", "sie", "sind", "und", "um", "von", "vor", "war",
  "wie", "wir", "zu", "zur",
]);

const timingCache = new Map<string, number[]>();

type SelectedGloss = { word: string; meaning: string };

function StoryWord({ token, active, selected, onSelect }: {
  token: string;
  active: boolean;
  selected: boolean;
  onSelect: (gloss: SelectedGloss) => void;
}) {
  const word = cleanWord(token);
  const isNumber = /\d/.test(token);
  if (!word && !isNumber) return <>{token}</>;

  const meaning = meaningFor(token);
  if (!meaning) {
    return <span className={`story-word no-gloss ${active ? "is-active" : ""}`}>{token}</span>;
  }

  return (
    <button
      type="button"
      className={`story-word${active ? " is-active" : ""}${selected ? " is-selected" : ""}`}
      aria-label={`${word}: ${meaning}`}
      aria-pressed={selected}
      onClick={() => onSelect({ word, meaning })}
    >
      {token}
    </button>
  );
}

type StoryReaderProps = {
  curriculum: Curriculum;
  story: Story;
  completed: boolean;
  onComplete: (completed: boolean) => void;
  onStoryChange: (story: Story) => void;
  onToggleComplete: () => void;
};

export function StoryReader({ curriculum, story, completed, onComplete, onStoryChange, onToggleComplete }: StoryReaderProps) {
  const [rate, setRate] = useState([0.92]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [activeWord, setActiveWord] = useState(-1);
  const [selectedGloss, setSelectedGloss] = useState<SelectedGloss | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordStartsRef = useRef<number[]>([]);
  const activeWordRef = useRef(-1);
  const animationFrameRef = useRef<number | null>(null);

  const unit = curriculum.units.find((item) => item.id === story.unitId)!;
  const unitCopy = getUnitCopy(curriculum.id, unit);
  const storyIndex = curriculum.stories.findIndex((item) => item.id === story.id);
  const previous = curriculum.stories[storyIndex - 1];
  const next = curriculum.stories[storyIndex + 1];
  const wordCount = story.text
    .split(/\s+/)
    .filter((token) => cleanWord(token) || /\d/.test(token)).length;
  const hasAudio = story.audioReady !== false;

  const keyWords = useMemo(() => {
    const seen = new Set<string>();
    return story.text
      .split(/\s+/)
      .map((token) => ({ word: cleanWord(token), meaning: meaningFor(token) }))
      .filter(({ word, meaning }) => word.length > 3 && meaning && !STOP_WORDS.has(word))
      .filter(({ word }) => {
        if (seen.has(word)) return false;
        seen.add(word);
        return true;
      })
      .slice(0, 8);
  }, [story]);

  useEffect(() => {
    const controller = new AbortController();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    }

    const resetFrame = requestAnimationFrame(() => {
      setSpeaking(false);
      setPaused(false);
      setLoadingAudio(false);
      setAudioError("");
      setSelectedGloss(null);
      activeWordRef.current = -1;
      setActiveWord(-1);
    });

    if (!hasAudio) {
      return () => {
        cancelAnimationFrame(resetFrame);
        controller.abort();
      };
    }

    const cacheKey = `${curriculum.id}:${story.id}`;
    const cachedTimings = timingCache.get(cacheKey);
    if (cachedTimings) {
      wordStartsRef.current = cachedTimings;
    } else {
      wordStartsRef.current = [];
      const id = String(story.number).padStart(3, "0");
      const timingUrl = `${curriculum.audioBasePath}/story-${id}.json?v=${curriculum.audioVersion}`;
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

    return () => {
      cancelAnimationFrame(resetFrame);
      controller.abort();
    };
  }, [curriculum, story, hasAudio]);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate[0];
  }, [rate]);

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

  function startAudio() {
    audioRef.current?.pause();
    setAudioError("");
    setLoadingAudio(true);
    setPaused(false);

    const id = String(story.number).padStart(3, "0");
    const audioUrl = `${curriculum.audioBasePath}/story-${id}.webm?v=${curriculum.audioVersion}`;
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.playbackRate = rate[0];
    audioRef.current = audio;

    audio.onplaying = () => {
      setLoadingAudio(false);
      setSpeaking(true);
      setPaused(false);
      startHighlightLoop(audio);
    };
    audio.onwaiting = () => setLoadingAudio(true);
    audio.oncanplay = () => setLoadingAudio(false);
    audio.onended = () => {
      stopHighlightLoop();
      setSpeaking(false);
      setPaused(false);
      setLoadingAudio(false);
      activeWordRef.current = -1;
      setActiveWord(-1);
      onComplete(true);
    };
    audio.onerror = () => {
      stopHighlightLoop();
      setLoadingAudio(false);
      setSpeaking(false);
      setPaused(false);
      activeWordRef.current = -1;
      setActiveWord(-1);
      setAudioError("The audio could not be loaded. Please refresh the page.");
    };
    void audio.play().catch((error: unknown) => {
      stopHighlightLoop();
      setLoadingAudio(false);
      const blocked = error instanceof DOMException && error.name === "NotAllowedError";
      setAudioError(
        blocked
          ? "Your browser blocked playback. Press Play once more."
          : "Playback could not start. Please try again.",
      );
    });
  }

  function toggleAudio() {
    if (speaking && !paused) {
      audioRef.current?.pause();
      stopHighlightLoop();
      setPaused(true);
      setSpeaking(false);
      return;
    }
    if (paused && audioRef.current) {
      void audioRef.current.play();
      return;
    }
    if (!loadingAudio) startAudio();
  }

  function restartAudio() {
    if (!audioRef.current) {
      startAudio();
      return;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.playbackRate = rate[0];
    activeWordRef.current = -1;
    setActiveWord(-1);
    void audioRef.current.play();
  }

  function renderText() {
    let wordIndex = 0;
    return story.text.split(/(\s+)/).map((token, index) => {
      if (/^\s+$/.test(token)) return <span key={index}>{token}</span>;
      if (!cleanWord(token) && !/\d/.test(token)) return <span key={index}>{token}</span>;
      const currentWord = wordIndex;
      wordIndex += 1;
      const word = cleanWord(token);
      return <StoryWord key={index} token={token} active={activeWord === currentWord} selected={selectedGloss?.word === word} onSelect={setSelectedGloss} />;
    });
  }

  return (
    <div className="reader">
      <DialogHeader className="reader-heading">
        <div className="reader-kicker">
          <span className="reader-number" style={{ background: story.color }}>
            {String(story.number).padStart(3, "0")}
          </span>
          <span>Unit {story.unitId} · {unitCopy.shortTitle}</span>
          <Badge>{curriculum.id}</Badge>
        </div>
        <DialogTitle lang="de">{story.title}</DialogTitle>
        <DialogDescription>
          <span><BookOpen /> {wordCount} words</span>
          <span><Clock3 /> about {Math.max(3, Math.ceil(wordCount / 70))} min at learning speed</span>
          <span><Languages /> {story.grammar}</span>
        </DialogDescription>
      </DialogHeader>

      {hasAudio ? <div className="audio-bar">
        <Button
          className="audio-play"
          size="icon-lg"
          onClick={toggleAudio}
          aria-label={speaking ? "Pause story" : "Play story"}
          disabled={loadingAudio}
        >
          {speaking ? <Pause /> : <Play className="play-nudge" />}
        </Button>
        <div className="audio-label">
          <strong>{loadingAudio ? "Loading audio…" : speaking ? "Listening in German" : paused ? "Paused" : "Listen to the story"}</strong>
          <span>{speaking ? "Follow the highlighted word" : "Ready to play"}</span>
        </div>
        <div className="rate-control">
          <Gauge />
          <Slider min={0.6} max={1.05} step={0.05} value={rate} onValueChange={setRate} aria-label="Playback speed" />
          <b>{rate[0].toFixed(2)}×</b>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={restartAudio} aria-label="Restart audio"><RotateCcw /></Button>
      </div> : <div className="audio-pending" role="status">
        <strong>This {curriculum.id} story is ready to read and practise.</strong>
        <span>Audio is not included in this text edition.</span>
      </div>}
      {audioError && <p className="audio-error" role="alert">{audioError}</p>}

      <div className="word-help"><MousePointer2 /> Tap an underlined word to see its English meaning</div>
      <div className={`word-translation${selectedGloss ? " is-visible" : ""}`} role="status" aria-live="polite">
        <Languages aria-hidden="true" />
        {selectedGloss ? <div><span lang="de">{selectedGloss.word}</span><strong lang="en">{selectedGloss.meaning}</strong></div> : <p>Select a word in the story</p>}
        {selectedGloss && <button type="button" onClick={() => setSelectedGloss(null)} aria-label="Close translation"><X /></button>}
      </div>
      <article className="reader-copy" lang="de">{renderText()}</article>

      <section className="reader-notes">
        <div>
          <span className="note-label">Learning goal</span>
          <p>{unitCopy.description}</p>
        </div>
        {story.pronunciation && <div>
          <span className="note-label">Pronunciation</span>
          <p>Listen for sentence stress, clear word endings, and natural pauses. Repeat one paragraph slowly, then at normal speed.</p>
          {story.referenceFocus && <small className="reference-note">Track who or what each pronoun refers to across the paragraph.</small>}
        </div>}
        <div>
          <span className="note-label">Key words</span>
          <div className="key-words">
            {keyWords.map(({ word, meaning }) => (
              <span key={word}><b>{word}</b>{meaning}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="speak-prompt">
        <Volume2 />
        <div><span>Speaking and writing</span><p>Read the story aloud once. Then summarise it in your own words and give your opinion.</p>{story.writingPrompt && <p className="writing-prompt"><b>Writing:</b> Write a short response using the grammar focus above.</p>}</div>
      </section>

      <Button className={`complete-story-button${completed ? " is-completed" : ""}`} variant={completed ? "secondary" : "default"} onClick={onToggleComplete}>
        <CheckCircle2 /> {completed ? "Story completed" : "Mark story as complete"}
      </Button>

      <nav className="reader-nav" aria-label="Story navigation">
        <Button variant="outline" disabled={!previous} onClick={() => previous && onStoryChange(previous)}><ArrowLeft /> Previous</Button>
        <span>{storyIndex + 1} / {curriculum.stories.length}</span>
        <Button variant="outline" disabled={!next} onClick={() => next && onStoryChange(next)}>Next <ArrowRight /></Button>
      </nav>
    </div>
  );
}
