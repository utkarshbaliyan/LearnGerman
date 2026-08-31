"use client";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Headphones,
  Languages,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiteHeader } from "@/app/components/site-header";
import { StoryReader } from "@/app/components/story-reader";
import { cleanWord, getCurriculum, meaningFor, type CefrLevel, type Story } from "@/app/curriculum";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "leselaut:today:v1";
const DAILY_STEPS = ["listen", "recall", "grammar", "produce"] as const;
type DailyStep = (typeof DAILY_STEPS)[number];
type DailyMinutes = 5 | 10 | 20;

type DailyState = {
  sessionDate: string;
  minutes: DailyMinutes;
  level: Exclude<CefrLevel, "B2">;
  completedSteps: DailyStep[];
  learningDays: string[];
  draft: string;
};

const EMPTY_STATE: DailyState = {
  sessionDate: "",
  minutes: 10,
  level: "A1",
  completedSteps: [],
  learningDays: [],
  draft: "",
};

const PRACTICE_STOP_WORDS = new Set([
  "aber", "alle", "als", "auch", "auf", "aus", "bei", "das", "dem", "den", "der", "die", "du",
  "ein", "eine", "einem", "einen", "einer", "er", "es", "für", "hat", "heute", "hier", "ich", "ihr",
  "im", "in", "ist", "kein", "keine", "mit", "nach", "nicht", "noch", "oder", "sein", "sie", "sind",
  "und", "von", "war", "wie", "wir", "zu", "zur",
]);

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeek(date: Date) {
  const monday = new Date(date);
  const weekday = monday.getDay() || 7;
  monday.setDate(monday.getDate() - weekday + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(monday);
    item.setDate(monday.getDate() + index);
    return {
      key: localDateKey(item),
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(item).slice(0, 2),
      date: item.getDate(),
    };
  });
}

function calculateStreak(days: string[], today: Date) {
  const completed = new Set(days);
  let streak = 0;
  const cursor = new Date(today);
  if (!completed.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (completed.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function PracticePage() {
  const [daily, setDaily] = useState<DailyState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [rememberedWords, setRememberedWords] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { completedIds, setStoryCompleted, toggleStoryCompleted } = useStoryProgress();

  const curriculum = getCurriculum(daily.level) ?? getCurriculum("A1")!;
  const nextStory = curriculum.stories.find((story) => !completedIds.has(story.id)) ?? curriculum.stories[0];
  const todayKey = today ? localDateKey(today) : "";
  const completedToday = Boolean(todayKey && daily.learningDays.includes(todayKey));

  const practiceWords = useMemo(() => {
    const seen = new Set<string>();
    return nextStory.text
      .split(/\s+/)
      .map((token) => {
        const word = cleanWord(token);
        const display = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
        return { word, display, meaning: meaningFor(token) };
      })
      .filter(({ word, meaning }) => word.length > 3 && meaning && meaning !== "name / place" && !PRACTICE_STOP_WORDS.has(word))
      .filter(({ word }) => {
        if (seen.has(word)) return false;
        seen.add(word);
        return true;
      })
      .slice(0, 4);
  }, [nextStory]);

  const sessionProgress = Math.round((daily.completedSteps.length / DAILY_STEPS.length) * 100);
  const week = today ? getWeek(today) : [];
  const weekCount = week.filter((day) => daily.learningDays.includes(day.key)).length;
  const streak = today ? calculateStreak(daily.learningDays, today) : 0;
  const audioUrl = `${curriculum.audioBasePath}/story-${String(nextStory.number).padStart(3, "0")}.webm?v=${curriculum.audioVersion}`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const currentDate = new Date();
      const key = localDateKey(currentDate);
      setToday(currentDate);
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<DailyState>;
        const sameDay = stored.sessionDate === key;
        setDaily({
          sessionDate: key,
          minutes: stored.minutes === 5 || stored.minutes === 20 ? stored.minutes : 10,
          level: stored.level === "A2" || stored.level === "B1" ? stored.level : "A1",
          completedSteps: sameDay && Array.isArray(stored.completedSteps)
            ? stored.completedSteps.filter((step): step is DailyStep => DAILY_STEPS.includes(step as DailyStep))
            : [],
          learningDays: Array.isArray(stored.learningDays)
            ? stored.learningDays.filter((day): day is string => typeof day === "string")
            : [],
          draft: sameDay && typeof stored.draft === "string" ? stored.draft : "",
        });
      } catch {
        setDaily({ ...EMPTY_STATE, sessionDate: key });
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(daily));
  }, [daily, hydrated]);

  useEffect(() => () => {
    audioRef.current?.pause();
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  function completeStep(step: DailyStep) {
    setDaily((current) => current.completedSteps.includes(step)
      ? current
      : { ...current, completedSteps: [...current.completedSteps, step] });
  }

  function chooseLevel(level: DailyState["level"]) {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsListening(false);
    setAudioError("");
    setRevealedWords(new Set());
    setRememberedWords(new Set());
    setDaily((current) => ({ ...current, level, completedSteps: [], draft: "" }));
  }

  function togglePreviewAudio() {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        if (audioRef.current.ended) audioRef.current.currentTime = 0;
        void audioRef.current.play().catch(() => setAudioError("Playback could not start. Please try again."));
      } else {
        audioRef.current.pause();
        setIsListening(false);
      }
      return;
    }
    setAudioError("");
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.playbackRate = 0.92;
    audioRef.current = audio;
    audio.onplaying = () => setIsListening(true);
    audio.onpause = () => setIsListening(false);
    audio.onended = () => {
      setIsListening(false);
      completeStep("listen");
    };
    audio.onerror = () => {
      setIsListening(false);
      setAudioError("The story audio could not be loaded.");
    };
    void audio.play().catch(() => setAudioError("Playback could not start. Please try again."));
  }

  function restartPreviewAudio() {
    if (!audioRef.current) {
      togglePreviewAudio();
      return;
    }
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  }

  function rememberWord(word: string) {
    setRememberedWords((current) => {
      const next = new Set(current);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      if (next.size >= Math.min(3, practiceWords.length)) completeStep("recall");
      return next;
    });
  }

  async function startRecording() {
    setRecordingError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingStreamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setRecordingUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        setIsRecording(false);
        completeStep("produce");
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordingError("Microphone access was not available. You can use the writing option instead.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function finishToday() {
    if (!todayKey || daily.completedSteps.length < DAILY_STEPS.length) return;
    audioRef.current?.pause();
    audioRef.current = null;
    setIsListening(false);
    setStoryCompleted(nextStory.id, true);
    setDaily((current) => ({
      ...current,
      learningDays: current.learningDays.includes(todayKey)
        ? current.learningDays
        : [...current.learningDays, todayKey],
    }));
  }

  function updateStoryCompletion(completed: boolean) {
    if (!selectedStory) return;
    setStoryCompleted(selectedStory.id, completed);
    if (completed && selectedStory.id === nextStory.id) completeStep("listen");
  }

  return (
    <main className="site-shell today-page" id="top">
      <SiteHeader active="course" />

      <section className="today-hero">
        <div className="today-greeting">
          <Badge className="today-eyebrow"><Sparkles /> Your daily German</Badge>
          <h1>{completedToday ? "Gut gemacht." : "A little German. Every day."}</h1>
          <p>{completedToday
            ? "Today’s session is complete. Enjoy the win—or stay for a light listening round."
            : "One guided session connects listening, reading, memory, grammar, and your own voice."}</p>
        </div>

        <aside className="habit-card" aria-label="Weekly learning rhythm">
          <div className="habit-card-heading">
            <div><span>This week</span><strong>{weekCount} of 4 learning days</strong></div>
            <div className="streak-pill"><Flame /> {streak} day{streak === 1 ? "" : "s"}</div>
          </div>
          <div className="week-rhythm" aria-label={`${weekCount} learning days completed this week`}>
            {week.map((day) => {
              const learned = daily.learningDays.includes(day.key);
              const isToday = day.key === todayKey;
              return <div key={day.key} className={`${learned ? "is-learned" : ""}${isToday ? " is-today" : ""}`}><span>{day.label}</span><b>{learned ? <Check /> : day.date}</b></div>;
            })}
          </div>
          <p>Consistency beats intensity. Missing a day never erases your progress.</p>
        </aside>
      </section>

      <section className="daily-workspace" aria-labelledby="daily-session-title">
        <div className="daily-session-heading">
          <div>
            <span>Today’s guided session</span>
            <h2 id="daily-session-title">{daily.minutes} minutes to keep German moving.</h2>
          </div>
          <div className="commitment-controls">
            <div className="daily-level-control" aria-label="Daily course level">
              {(["A1", "A2", "B1"] as const).map((level) => <button key={level} type="button" className={daily.level === level ? "is-active" : ""} onClick={() => chooseLevel(level)}>{level}</button>)}
            </div>
            <div className="minutes-control" role="radiogroup" aria-label="Daily learning goal">
              {([5, 10, 20] as const).map((minutes) => <button key={minutes} type="button" role="radio" aria-checked={daily.minutes === minutes} onClick={() => setDaily((current) => ({ ...current, minutes }))}>{minutes} min</button>)}
            </div>
          </div>
        </div>

        <div className="session-progress-row">
          <div><span>{completedToday ? "Session complete" : `${daily.completedSteps.length} of ${DAILY_STEPS.length} steps`}</span><strong>{sessionProgress}%</strong></div>
          <Progress value={sessionProgress} aria-label={`Today's session: ${sessionProgress}% complete`} />
        </div>

        <div className="playground-grid">
          <article className={`daily-story-card${daily.completedSteps.includes("listen") ? " is-complete" : ""}`}>
            <div className="daily-card-step"><span>01</span><b>Passive input</b>{daily.completedSteps.includes("listen") && <CheckCircle2 />}</div>
            <div className="daily-story-meta"><Badge>{curriculum.id}</Badge><span>Story {String(nextStory.number).padStart(3, "0")}</span><span><Clock3 /> 3–4 min</span></div>
            <h3 lang="de">{nextStory.title}</h3>
            <p>Listen once for the situation. Then open the reader and follow the German with synchronized support.</p>
            <div className="listen-player">
              <Button size="icon-lg" onClick={togglePreviewAudio} aria-label={isListening ? "Pause story preview" : "Play story preview"}>{isListening ? <Pause /> : <Play />}</Button>
              <div><strong>{isListening ? "Listening in German" : "Listen without the transcript"}</strong><span>Learning speed · 0.92×</span></div>
              <Button variant="ghost" size="icon-sm" onClick={restartPreviewAudio} aria-label="Restart story preview"><RotateCcw /></Button>
            </div>
            {audioError && <p className="daily-inline-error" role="alert">{audioError}</p>}
            <Button variant="outline" className="open-reader-button" onClick={() => setSelectedStory(nextStory)}><BookOpen /> Open focused reader <ArrowRight /></Button>
          </article>

          <article className={`recall-card${daily.completedSteps.includes("recall") ? " is-complete" : ""}`}>
            <div className="daily-card-step"><span>02</span><b>Active recall</b>{daily.completedSteps.includes("recall") && <CheckCircle2 />}</div>
            <h3>Can you remember these?</h3>
            <p>Reveal the meaning, then mark at least three words you remembered.</p>
            <div className="recall-word-grid">
              {practiceWords.map(({ word, display, meaning }) => {
                const revealed = revealedWords.has(word);
                const remembered = rememberedWords.has(word);
                return (
                  <div key={word} className={remembered ? "is-remembered" : ""}>
                    <button type="button" className="recall-reveal" aria-expanded={revealed} onClick={() => setRevealedWords((current) => { const next = new Set(current); if (next.has(word)) next.delete(word); else next.add(word); return next; })}>
                      <strong lang="de">{display || word}</strong><span>{revealed ? meaning : "Reveal meaning"}</span>
                    </button>
                    <button type="button" className="remember-button" aria-pressed={remembered} onClick={() => rememberWord(word)}><Check /> {remembered ? "Remembered" : "I knew it"}</button>
                  </div>
                );
              })}
            </div>
          </article>

          <article className={`grammar-bridge-card${daily.completedSteps.includes("grammar") ? " is-complete" : ""}`}>
            <div className="daily-card-step"><span>03</span><b>Notice the pattern</b>{daily.completedSteps.includes("grammar") && <CheckCircle2 />}</div>
            <div className="grammar-bridge-icon"><Languages /></div>
            <span>Grammar inside today’s story</span>
            <h3>{nextStory.grammar}</h3>
            <p lang="de">{nextStory.text.split(/(?<=[.!?])\s+/)[0]}</p>
            <div className="grammar-bridge-actions">
              <Button onClick={() => completeStep("grammar")}><Brain /> I noticed the pattern</Button>
              <Button variant="outline" asChild><Link href="/grammar">Practise grammar</Link></Button>
            </div>
          </article>

          <article className={`produce-card${daily.completedSteps.includes("produce") ? " is-complete" : ""}`}>
            <div className="daily-card-step"><span>04</span><b>Use your German</b>{daily.completedSteps.includes("produce") && <CheckCircle2 />}</div>
            <h3>Make the story yours.</h3>
            <p>{nextStory.speakingPrompt ?? "Summarise the story in two or three simple German sentences. Then add one detail from your own life."}</p>
            <Textarea value={daily.draft} onChange={(event) => setDaily((current) => ({ ...current, draft: event.target.value }))} placeholder="Schreib zwei oder drei Sätze auf Deutsch …" aria-label="Your German response" />
            <div className="produce-actions">
              <Button variant="outline" disabled={daily.draft.trim().length < 12} onClick={() => completeStep("produce")}><Check /> Save response</Button>
              {!isRecording
                ? <Button variant="secondary" onClick={startRecording}><Mic /> Record instead</Button>
                : <Button className="recording-button" onClick={stopRecording}><Square /> Stop recording</Button>}
            </div>
            {recordingUrl && <div className="recording-review"><Volume2 /><div><strong>Your private practice</strong><span>Listen once and notice one thing to improve.</span></div><audio controls src={recordingUrl}>Your browser does not support audio playback.</audio></div>}
            {recordingError && <p className="daily-inline-error" role="alert">{recordingError}</p>}
          </article>
        </div>

        <div className={`finish-session${completedToday ? " is-finished" : ""}`}>
          <div className="finish-icon">{completedToday ? <CheckCircle2 /> : <CalendarDays />}</div>
          <div><span>{completedToday ? "Learning day recorded" : "Finish gently"}</span><h2>{completedToday ? "You showed up for your German." : "Four small steps. One meaningful win."}</h2><p>{completedToday ? "Your progress is safe. Come back tomorrow for a fresh session." : "Complete the four activities to record today as a learning day."}</p></div>
          {completedToday
            ? <Button variant="outline" asChild><Link href="/stories">Explore more stories</Link></Button>
            : <Button size="lg" disabled={daily.completedSteps.length < DAILY_STEPS.length} onClick={finishToday}>Finish today <ArrowRight /></Button>}
        </div>
      </section>

      <section className="quick-practice" aria-labelledby="quick-practice-title">
        <div><span>Low-energy day?</span><h2 id="quick-practice-title">Keep the habit with one small action.</h2><p>These options are intentionally short. Returning matters more than doing everything.</p></div>
        <div className="quick-practice-grid">
          <button type="button" onClick={togglePreviewAudio}><Headphones /><span><b>Listen only</b><small>One story · 3 min</small></span><ArrowRight /></button>
          <Link href="/vocabulary"><Brain /><span><b>Review words</b><small>Your saved vocabulary</small></span><ArrowRight /></Link>
          <Link href="/grammar"><Languages /><span><b>One grammar set</b><small>Ten focused questions</small></span><ArrowRight /></Link>
        </div>
      </section>

      <footer>
        <Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></Link>
        <p>A calm daily practice that turns stories into German you can understand and use.</p>
        <div><Link href="/stories">Stories</Link><Link href="/vocabulary">Vocabulary</Link><Link href="/grammar">Grammar</Link></div>
      </footer>

      <Dialog open={Boolean(selectedStory)} onOpenChange={(open) => { if (!open) setSelectedStory(null); }}>
        {selectedStory && <DialogContent className="reader-dialog" showCloseButton><StoryReader curriculum={curriculum} story={selectedStory} completed={completedIds.has(selectedStory.id)} onComplete={updateStoryCompletion} onStoryChange={setSelectedStory} onToggleComplete={() => { const willComplete = !completedIds.has(selectedStory.id); toggleStoryCompleted(selectedStory.id); if (willComplete && selectedStory.id === nextStory.id) completeStep("listen"); }} /></DialogContent>}
      </Dialog>
    </main>
  );
}
