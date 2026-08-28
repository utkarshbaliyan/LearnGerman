"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Gauge,
  Languages,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";

import { cleanWord, meaningFor, type Curriculum, type Story } from "@/app/curriculum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STOP_WORDS = new Set([
  "aber", "alle", "als", "am", "an", "auch", "auf", "aus", "bei", "das", "dem",
  "den", "der", "deshalb", "die", "du", "ein", "eine", "einem", "einen", "einer",
  "er", "es", "für", "hat", "heute", "hier", "ich", "ihr", "ihre", "im", "in",
  "ist", "jetzt", "kann", "kein", "keine", "mit", "möchte", "muss", "nach", "nicht",
  "noch", "nur", "oder", "sein", "sie", "sind", "und", "um", "von", "vor", "war",
  "wie", "wir", "zu", "zur",
]);

const timingCache = new Map<string, number[]>();

function StoryWord({ token, active }: { token: string; active: boolean }) {
  const word = cleanWord(token);
  const isNumber = /\d/.test(token);
  if (!word && !isNumber) return <>{token}</>;

  const meaning = meaningFor(token);
  if (!meaning) {
    return <span className={`story-word no-gloss ${active ? "is-active" : ""}`}>{token}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`story-word ${active ? "is-active" : ""}`}
          aria-label={`${word}: ${meaning}`}
        >
          {token}
        </button>
      </TooltipTrigger>
      <TooltipContent className="word-tooltip" side="top" sideOffset={8}>
        <span>{word}</span>
        <strong>{meaning}</strong>
      </TooltipContent>
    </Tooltip>
  );
}

type StoryReaderProps = {
  curriculum: Curriculum;
  story: Story;
  onStoryChange: (story: Story) => void;
};

export function StoryReader({ curriculum, story, onStoryChange }: StoryReaderProps) {
  const [rate, setRate] = useState([0.92]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [activeWord, setActiveWord] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordStartsRef = useRef<number[]>([]);
  const activeWordRef = useRef(-1);
  const animationFrameRef = useRef<number | null>(null);

  const unit = curriculum.units.find((item) => item.id === story.unitId)!;
  const storyIndex = curriculum.stories.findIndex((item) => item.id === story.id);
  const previous = curriculum.stories[storyIndex - 1];
  const next = curriculum.stories[storyIndex + 1];
  const wordCount = story.text
    .split(/\s+/)
    .filter((token) => cleanWord(token) || /\d/.test(token)).length;

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
      activeWordRef.current = -1;
      setActiveWord(-1);
    });

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
  }, [curriculum, story]);

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
    };
    audio.onerror = () => {
      stopHighlightLoop();
      setLoadingAudio(false);
      setSpeaking(false);
      setPaused(false);
      activeWordRef.current = -1;
      setActiveWord(-1);
      setAudioError("Das Audio konnte nicht geladen werden. Bitte lade die Seite neu.");
    };
    void audio.play().catch((error: unknown) => {
      stopHighlightLoop();
      setLoadingAudio(false);
      const blocked = error instanceof DOMException && error.name === "NotAllowedError";
      setAudioError(
        blocked
          ? "Der Browser hat die Wiedergabe blockiert. Tippe noch einmal auf Play."
          : "Die Wiedergabe konnte nicht gestartet werden. Bitte versuche es erneut.",
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
      return <StoryWord key={index} token={token} active={activeWord === currentWord} />;
    });
  }

  return (
    <div className="reader">
      <DialogHeader className="reader-heading">
        <div className="reader-kicker">
          <span className="reader-number" style={{ background: story.color }}>
            {String(story.number).padStart(3, "0")}
          </span>
          <span>Einheit {story.unitId} · {story.theme}</span>
          <Badge>{curriculum.id}</Badge>
        </div>
        <DialogTitle>{story.title}</DialogTitle>
        <DialogDescription>
          <span><BookOpen /> {wordCount} Wörter</span>
          <span><Clock3 /> ca. {Math.max(3, Math.ceil(wordCount / 70))} Min. im Lerntempo</span>
          <span><Languages /> {story.grammar}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="audio-bar">
        <Button
          className="audio-play"
          size="icon-lg"
          onClick={toggleAudio}
          aria-label={speaking ? "Geschichte pausieren" : "Geschichte abspielen"}
          disabled={loadingAudio}
        >
          {speaking ? <Pause /> : <Play className="play-nudge" />}
        </Button>
        <div className="audio-label">
          <strong>{loadingAudio ? "Audio wird geladen …" : speaking ? "Du hörst auf Deutsch" : paused ? "Pausiert" : "Geschichte anhören"}</strong>
          <span>{speaking ? "Folge dem markierten Wort" : "Bereit zum Abspielen"}</span>
        </div>
        <div className="rate-control">
          <Gauge />
          <Slider min={0.6} max={1.05} step={0.05} value={rate} onValueChange={setRate} aria-label="Wiedergabegeschwindigkeit" />
          <b>{rate[0].toFixed(2)}×</b>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={restartAudio} aria-label="Audio von vorn abspielen"><RotateCcw /></Button>
      </div>
      {audioError && <p className="audio-error" role="alert">{audioError}</p>}

      <div className="word-help"><MousePointer2 /> Wort antippen oder mit der Maus berühren: englische Bedeutung</div>
      <article className="reader-copy" lang="de">{renderText()}</article>

      <section className="reader-notes">
        <div>
          <span className="note-label">Lernziel</span>
          <p>{story.canDo}</p>
        </div>
        <div>
          <span className="note-label">Schlüsselwörter</span>
          <div className="key-words">
            {keyWords.map(({ word, meaning }) => (
              <span key={word}><b>{word}</b>{meaning}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="speak-prompt">
        <Volume2 />
        <div><span>Sprechen & schreiben</span><p>Lies die Geschichte einmal laut. Schreibe danach drei kurze Sätze zum Thema {unit.shortTitle}.</p></div>
      </section>

      <nav className="reader-nav" aria-label="Geschichtennavigation">
        <Button variant="outline" disabled={!previous} onClick={() => previous && onStoryChange(previous)}><ArrowLeft /> Zurück</Button>
        <span>{storyIndex + 1} / {curriculum.stories.length}</span>
        <Button variant="outline" disabled={!next} onClick={() => next && onStoryChange(next)}>Weiter <ArrowRight /></Button>
      </nav>
    </div>
  );
}
