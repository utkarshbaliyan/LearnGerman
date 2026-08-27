"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Gauge,
  Headphones,
  Languages,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";

import { A1_STATS, A1_STORIES, A1_UNITS, type A1Story, cleanWord, meaningFor } from "@/app/a1-curriculum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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

type RhythmMode = "study" | "natural" | "flowing";

const RHYTHMS: Record<RhythmMode, { label: string; pause: number; pitch: number }> = {
  study: { label: "Clear & patient", pause: 360, pitch: 1 },
  natural: { label: "Natural storyteller", pause: 190, pitch: 1.02 },
  flowing: { label: "Smooth & flowing", pause: 90, pitch: 1.01 },
};

function voiceScore(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLocaleLowerCase("en");
  let score = voice.lang.toLocaleLowerCase("en") === "de-de" ? 80 : 50;
  if (name.includes("natural") || name.includes("neural") || name.includes("premium")) score += 100;
  if (name.includes("google") || name.includes("microsoft")) score += 55;
  if (name.includes("katja") || name.includes("conrad") || name.includes("anna")) score += 35;
  if (voice.localService) score += 5;
  return score;
}

function narrationSegments(text: string) {
  const matches = [...text.matchAll(/[^.!?…]+[.!?…]+[”\"»]?|[^.!?…]+$/g)];
  return matches.map((match) => {
    const raw = match[0];
    const leadingSpace = raw.length - raw.trimStart().length;
    return { text: raw.trim(), start: (match.index ?? 0) + leadingSpace };
  }).filter((segment) => segment.text.length > 0);
}

function StoryWord({ token, active }: { token: string; active: boolean }) {
  const word = cleanWord(token);
  if (!word) return <>{token}</>;
  const meaning = meaningFor(token);

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

function Reader({ story, onStoryChange }: { story: A1Story; onStoryChange: (story: A1Story) => void }) {
  const [rate, setRate] = useState([0.9]);
  const [rhythm, setRhythm] = useState<RhythmMode>("natural");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeChar, setActiveChar] = useState(-1);
  const narrationSession = useRef(0);
  const pauseTimer = useRef<number | null>(null);
  const continueNarration = useRef<(() => void) | null>(null);
  const unit = A1_UNITS[story.unitId - 1];
  const wordCount = story.text.split(/\s+/).length;
  const segments = useMemo(() => narrationSegments(story.text), [story.text]);
  const germanVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLocaleLowerCase("en").startsWith("de")).sort((a, b) => voiceScore(b) - voiceScore(a)),
    [voices],
  );
  const keyWords = useMemo(() => {
    const seen = new Set<string>();
    return story.text
      .split(/\s+/)
      .map((token) => ({ token, word: cleanWord(token), meaning: meaningFor(token) }))
      .filter(({ word, meaning }) => word.length > 3 && meaning !== "A1 word" && !STOP_WORDS.has(word))
      .filter(({ word }) => {
        if (seen.has(word)) return false;
        seen.add(word);
        return true;
      })
      .slice(0, 8);
  }, [story]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      const savedVoice = window.localStorage.getItem("leselaut-voice");
      const german = available.filter((voice) => voice.lang.toLocaleLowerCase("en").startsWith("de")).sort((a, b) => voiceScore(b) - voiceScore(a));
      const selected = german.find((voice) => voice.voiceURI === savedVoice) ?? german[0];
      if (selected) setVoiceURI(selected.voiceURI);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    narrationSession.current += 1;
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
    setActiveChar(-1);
  }, [story]);

  useEffect(() => () => {
    narrationSession.current += 1;
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    window.speechSynthesis?.cancel();
  }, []);

  function startAudio() {
    if (!("speechSynthesis" in window)) return;
    narrationSession.current += 1;
    const session = narrationSession.current;
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    window.speechSynthesis.cancel();
    const selectedVoice = germanVoices.find((voice) => voice.voiceURI === voiceURI) ?? germanVoices[0];
    let segmentIndex = 0;

    const finish = () => {
      if (session !== narrationSession.current) return;
      continueNarration.current = null;
      setSpeaking(false);
      setPaused(false);
      setActiveChar(-1);
    };

    const speakNext = () => {
      if (session !== narrationSession.current) return;
      if (segmentIndex >= segments.length) {
        finish();
        return;
      }
      const segment = segments[segmentIndex];
      segmentIndex += 1;
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = selectedVoice?.lang || "de-DE";
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate[0];
      utterance.pitch = RHYTHMS[rhythm].pitch;
      utterance.volume = 1;
      utterance.onboundary = (event) => {
        if (event.name === "word" && session === narrationSession.current) {
          setActiveChar(segment.start + event.charIndex);
        }
      };
      utterance.onend = () => {
        if (session !== narrationSession.current) return;
        continueNarration.current = speakNext;
        pauseTimer.current = window.setTimeout(speakNext, RHYTHMS[rhythm].pause);
      };
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    };

    setSpeaking(true);
    setPaused(false);
    continueNarration.current = speakNext;
    speakNext();
  }

  function toggleAudio() {
    if (speaking && !paused) {
      if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
      if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
      setPaused(true);
      return;
    }
    if (speaking && paused) {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      else continueNarration.current?.();
      setPaused(false);
      return;
    }
    startAudio();
  }

  function restartAudio() {
    setActiveChar(-1);
    startAudio();
  }

  function changeVoice(nextVoiceURI: string) {
    narrationSession.current += 1;
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
    setActiveChar(-1);
    setVoiceURI(nextVoiceURI);
    window.localStorage.setItem("leselaut-voice", nextVoiceURI);
  }

  function changeRhythm(nextRhythm: RhythmMode) {
    narrationSession.current += 1;
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
    setActiveChar(-1);
    setRhythm(nextRhythm);
  }

  function renderText() {
    let cursor = 0;
    return story.text.split(/(\s+)/).map((token, index) => {
      const start = cursor;
      cursor += token.length;
      if (/^\s+$/.test(token)) return <span key={index}>{token}</span>;
      return <StoryWord key={index} token={token} active={activeChar >= start && activeChar < start + token.length} />;
    });
  }

  const previous = A1_STORIES[story.number - 2];
  const next = A1_STORIES[story.number];

  return (
    <div className="reader">
      <DialogHeader className="reader-heading">
        <div className="reader-kicker">
          <span className="reader-number" style={{ background: story.color }}>{String(story.number).padStart(3, "0")}</span>
          <span>Unit {story.unitId} · {story.theme}</span>
          <Badge>A1</Badge>
        </div>
        <DialogTitle>{story.title}</DialogTitle>
        <DialogDescription>
          <span><BookOpen /> {wordCount} words</span>
          <span><Clock3 /> about {Math.max(3, Math.ceil(wordCount / 70))} minutes at a learning pace</span>
          <span><Languages /> {story.grammar}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="audio-bar">
        <Button className="audio-play" size="icon-lg" onClick={toggleAudio} aria-label={speaking && !paused ? "Pause story" : "Play story"}>
          {speaking && !paused ? <Pause /> : <Play className="play-nudge" />}
        </Button>
        <div className="audio-label">
          <strong>{speaking ? (paused ? "Paused" : "Listening in German") : "Listen slowly"}</strong>
          <span>{speaking ? "Follow the highlighted word" : "Play the full story"}</span>
        </div>
        <div className="rate-control">
          <Gauge />
          <Slider min={0.6} max={1.05} step={0.05} value={rate} onValueChange={setRate} aria-label="Playback speed" />
          <b>{rate[0].toFixed(2)}×</b>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={restartAudio} aria-label="Restart audio"><RotateCcw /></Button>
      </div>

      <div className="narration-controls">
        <label>
          <span>German voice</span>
          <Select value={voiceURI || "automatic"} onValueChange={changeVoice}>
            <SelectTrigger aria-label="Choose German narration voice"><SelectValue placeholder="Best available voice" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic · best available</SelectItem>
              {germanVoices.map((voice, index) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                  {index === 0 ? "Best available · " : ""}{voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label>
          <span>Speaking rhythm</span>
          <Select value={rhythm} onValueChange={(value) => changeRhythm(value as RhythmMode)}>
            <SelectTrigger aria-label="Choose narration rhythm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(RHYTHMS) as RhythmMode[]).map((mode) => (
                <SelectItem key={mode} value={mode}>{RHYTHMS[mode].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <p>Sentence-aware pauses make the narration easier to follow. Available voices depend on your device.</p>
      </div>

      <div className="word-help"><MousePointer2 /> Hover or tap a word for its English meaning</div>
      <article className="reader-copy" lang="de">{renderText()}</article>

      <section className="reader-notes">
        <div>
          <span className="note-label">Can-do goal</span>
          <p>{story.canDo}</p>
        </div>
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
        <div><span>Speak & write</span><p>Read the story aloud once. Then write three short sentences about {unit.shortTitle.toLocaleLowerCase("en")}.</p></div>
      </section>

      <nav className="reader-nav" aria-label="Story navigation">
        <Button variant="outline" disabled={!previous} onClick={() => previous && onStoryChange(previous)}><ArrowLeft /> Previous</Button>
        <span>{story.number} / 100</span>
        <Button variant="outline" disabled={!next} onClick={() => next && onStoryChange(next)}>Next <ArrowRight /></Button>
      </nav>
    </div>
  );
}

export default function Home() {
  const [activeUnit, setActiveUnit] = useState("all");
  const [selectedStory, setSelectedStory] = useState<A1Story | null>(null);
  const visibleStories = activeUnit === "all" ? A1_STORIES : A1_UNITS[Number(activeUnit) - 1].stories;

  function openStory(story: A1Story) {
    window.speechSynthesis?.cancel();
    setSelectedStory(story);
  }

  return (
    <TooltipProvider delayDuration={70}>
      <main className="site-shell">
        <header className="topbar">
          <a href="#top" className="brand" aria-label="LeseLaut home">
            <span className="brand-mark" aria-hidden="true">ä</span>
            <span><strong>LeseLaut</strong><small>100 immersive German stories for A1</small></span>
          </a>
          <nav className="topnav" aria-label="Primary navigation">
            <a href="#curriculum">Curriculum</a>
            <a href="#stories">Stories</a>
            <Badge className="public-badge"><span /> Free · Public</Badge>
          </nav>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <Badge className="eyebrow"><Sparkles /> CEFR-aligned A1 course</Badge>
            <h1>German starts<br />with a <em>story.</em></h1>
            <p>One hundred longer, flowing stories help a complete beginner meet more than 800 useful words in context—not as an isolated vocabulary list.</p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => openStory(A1_STORIES[0])}><Play /> Start story 001</Button>
              <a href="#stories">Browse all stories <ArrowRight /></a>
            </div>
          </div>
          <div className="story-stack" aria-label="Course overview">
            <div className="stack-card stack-back"><span>{Math.floor(A1_STATS.totalWords / 1000)}k+</span><small>words to read & hear</small></div>
            <div className="stack-card stack-middle"><span>800+</span><small>words in context</small></div>
            <div className="stack-card stack-front">
              <div className="mini-cover"><span>001</span><Badge>A1</Badge></div>
              <h2>Guten Morgen, Mia!</h2>
              <p>A complete 3-minute chapter · listen · read · hover · speak</p>
              <Button onClick={() => openStory(A1_STORIES[0])}>Read the first story <ArrowRight /></Button>
            </div>
          </div>
        </section>

        <section className="curriculum" id="curriculum">
          <div className="section-intro">
            <span>10 units · 100 longer chapters</span>
            <h2>Learn the flow, not just the words.</h2>
            <p>Each chapter develops a situation through connected events and dialogue, while familiar vocabulary returns often enough to become natural.</p>
          </div>
          <div className="unit-track">
            {A1_UNITS.map((unit) => (
              <button key={unit.id} type="button" onClick={() => { setActiveUnit(String(unit.id)); document.getElementById("stories")?.scrollIntoView({ behavior: "smooth" }); }} style={{ "--unit-color": unit.color } as React.CSSProperties}>
                <span>{String(unit.id).padStart(2, "0")}</span>
                <strong>{unit.shortTitle}</strong>
                <small>10 stories</small>
              </button>
            ))}
          </div>
          <div className="coverage-strip">
            <div><b>Reading volume</b><span>{A1_STATS.totalWords.toLocaleString("en-US")} words across the course</span></div>
            <div><b>Interaction</b><span>questions & everyday needs</span></div>
            <div><b>Production</b><span>simple speaking & writing</span></div>
            <div><b>Vocabulary</b><span>800+ useful words in context</span></div>
          </div>
        </section>

        <section className="library" id="stories">
          <div className="library-heading">
            <div><span>The A1 library</span><h2>{activeUnit === "all" ? "All 100 stories" : `Unit ${activeUnit}: ${A1_UNITS[Number(activeUnit) - 1].title}`}</h2></div>
            <p>{activeUnit === "all" ? `Choose a unit or begin at story one. Stories average ${A1_STATS.averageStoryWords} words, with slow audio and instant word help.` : A1_UNITS[Number(activeUnit) - 1].description}</p>
          </div>

          <Tabs value={activeUnit} onValueChange={setActiveUnit} className="unit-tabs">
            <TabsList variant="line" className="unit-tabs-list">
              <TabsTrigger value="all">All</TabsTrigger>
              {A1_UNITS.map((unit) => <TabsTrigger key={unit.id} value={String(unit.id)}>{String(unit.id).padStart(2, "0")}</TabsTrigger>)}
            </TabsList>
          </Tabs>

          <div className="story-grid">
            {visibleStories.map((story) => (
              <button key={story.id} type="button" className="story-card" onClick={() => openStory(story)} style={{ "--story-color": story.color } as React.CSSProperties}>
                <div className="card-top"><span>{String(story.number).padStart(3, "0")}</span><Badge variant="outline">A1</Badge></div>
                <div className="card-rule" />
                <small>Unit {story.unitId} · {story.theme}</small>
                <h3>{story.title}</h3>
                <p>{story.text.split(" ").slice(0, 14).join(" ")}…</p>
                <div className="card-meta"><span><Headphones /> audio</span><span><BookOpen /> {story.text.split(/\s+/).length} words</span><ArrowRight /></div>
              </button>
            ))}
          </div>
        </section>

        <footer>
          <a href="#top" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></a>
          <p>Curriculum grounded in the Council of Europe CEFR A1 descriptors and the Goethe-Institut A1 vocabulary and grammar inventories.</p>
          <div><a href="https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions" target="_blank" rel="noreferrer">CEFR framework</a><a href="https://www.goethe.de/en/spr/prf/ueb/pa1.html" target="_blank" rel="noreferrer">Goethe A1</a></div>
        </footer>

        <Dialog open={Boolean(selectedStory)} onOpenChange={(open) => { if (!open) { window.speechSynthesis?.cancel(); setSelectedStory(null); } }}>
          {selectedStory && (
            <DialogContent className="reader-dialog" showCloseButton>
              <Reader story={selectedStory} onStoryChange={setSelectedStory} />
            </DialogContent>
          )}
        </Dialog>
      </main>
    </TooltipProvider>
  );
}
