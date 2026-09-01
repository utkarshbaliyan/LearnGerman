"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  Languages,
  Lightbulb,
  Mic,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Target,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { GrammarPracticePanel } from "@/app/components/grammar-practice-panel";
import { AiTutorFeedback } from "@/app/components/ai-tutor-feedback";
import { SiteHeader } from "@/app/components/site-header";
import {
  CHAPTER_ONE_CHECKPOINT,
  CHAPTER_ONE_LISTENING,
  CHAPTER_ONE_OUTCOMES,
  CHAPTER_ONE_READING,
  CHAPTER_ONE_VOCABULARY,
  type ChapterQuestion,
} from "@/app/course/a1/chapter-one";
import { getCurriculum } from "@/app/curriculum";
import { LIVE_GRAMMAR_LESSONS } from "@/app/grammar/course";
import {
  COURSE_SKILLS,
  EMPTY_CHAPTER_PROGRESS,
  type CourseSkill,
  useCourseProgress,
} from "@/app/hooks/use-course-progress";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { requestSpeakingFeedback, requestWritingFeedback } from "@/app/lib/ai-tutor-client";
import type { TutorContext, TutorFeedback } from "@/app/lib/ai-tutor-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const CHAPTER_ID = "a1-1-1";
const curriculum = getCurriculum("A1")!;
const story = curriculum.stories[0];
const grammar = LIVE_GRAMMAR_LESSONS[CHAPTER_ID];
const grammarGroups = [...new Set(grammar.exercises.map((exercise) => exercise.group ?? "Core practice"))];

const SKILLS: Array<{ id: CourseSkill; label: string; icon: typeof BookOpen }> = [
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "vocabulary", label: "Vocabulary", icon: Languages },
  { id: "grammar", label: "Grammar", icon: GraduationCap },
  { id: "speaking", label: "Speaking", icon: Mic },
  { id: "writing", label: "Writing", icon: PenLine },
];

function QuizBlock({ questions, eyebrow, title, savedScore, onScore }: {
  questions: ChapterQuestion[];
  eyebrow: string;
  title: string;
  savedScore: number;
  onScore: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = Math.round((questions.filter((question) => answers[question.id] === question.answer).length / questions.length) * 100);

  function submit() {
    setSubmitted(true);
    onScore(score);
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="chapter-quiz">
      <div className="chapter-quiz-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div>{savedScore > 0 && <Badge variant="outline">Best {savedScore}%</Badge>}</div>
      <div className="chapter-question-list">
        {questions.map((question, index) => <article key={question.id} className={submitted ? (answers[question.id] === question.answer ? "is-correct" : "is-wrong") : ""}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h4>{question.prompt}</h4>
          <div>{question.options.map((option) => <button key={option} type="button" disabled={submitted} aria-pressed={answers[question.id] === option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}>{option}</button>)}</div>
          {submitted && <p><b>{answers[question.id] === question.answer ? "Correct." : `Answer: ${question.answer}.`}</b> {question.explanation}</p>}
        </article>)}
      </div>
      {submitted ? <div className="chapter-quiz-result"><strong>{score}%</strong><span>{score >= 80 ? "Strong result. This skill is ready." : "Review the feedback, then try again."}</span><Button variant="outline" onClick={retry}><RotateCcw /> Try again</Button></div> : <Button onClick={submit} disabled={Object.keys(answers).length < questions.length}>Check all answers <ArrowRight /></Button>}
    </div>
  );
}

export default function ChapterOnePage() {
  const { progress, hydrated, updateChapter, setSkillScore } = useCourseProgress();
  const { setStoryCompleted } = useStoryProgress();
  const chapter = progress.chapters[CHAPTER_ID] ?? EMPTY_CHAPTER_PROGRESS;
  const [showAllWords, setShowAllWords] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingError, setRecordingError] = useState("");
  const [speakingFeedback, setSpeakingFeedback] = useState<TutorFeedback | null>(null);
  const [isCheckingSpeaking, setIsCheckingSpeaking] = useState(false);
  const [writingChecks, setWritingChecks] = useState<Set<string>>(new Set());
  const [writingFeedback, setWritingFeedback] = useState<TutorFeedback | null>(null);
  const [writingError, setWritingError] = useState("");
  const [isCheckingWriting, setIsCheckingWriting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrl = `${curriculum.audioBasePath}/story-${String(story.number).padStart(3, "0")}.webm?v=${curriculum.audioVersion}`;
  const tutorContext: TutorContext = {
    level: "A1",
    chapter: 1,
    prompt: "Write 30–50 words. Include your name, origin, current city, languages, and one reason for learning German.",
    grammarFocus: `Personal pronouns and sein: ${grammar.pattern}`,
    vocabulary: CHAPTER_ONE_VOCABULARY.slice(0, 20).map((word) => `${word.german} — ${word.english}`),
  };

  const chapterPercent = useMemo(() => {
    const skillTotal = COURSE_SKILLS.reduce((sum, skill) => sum + (chapter.skillScores[skill] ?? 0), 0);
    return Math.round((skillTotal + (chapter.checkpointScore ?? 0)) / (COURSE_SKILLS.length + 1));
  }, [chapter]);
  const readyForMastery = COURSE_SKILLS.every((skill) => (chapter.skillScores[skill] ?? 0) >= 70)
    && (chapter.checkpointScore ?? 0) >= 80
    && Object.keys(chapter.grammarSets).length === grammarGroups.length;
  const writingWords = chapter.writingDraft.trim() ? chapter.writingDraft.trim().split(/\s+/).length : 0;

  useEffect(() => () => {
    audioRef.current?.pause();
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  function toggleAudio() {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        if (audioRef.current.ended) audioRef.current.currentTime = 0;
        void audioRef.current.play();
      } else {
        audioRef.current.pause();
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
    audio.onended = () => setIsListening(false);
    audio.onerror = () => { setIsListening(false); setAudioError("The chapter audio could not be loaded."); };
    void audio.play().catch(() => setAudioError("Playback could not start. Please try again."));
  }

  function restartAudio() {
    if (!audioRef.current) return toggleAudio();
    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  }

  function toggleKnownWord(wordId: string) {
    updateChapter(CHAPTER_ID, (current) => {
      const known = new Set(current.knownWords);
      if (known.has(wordId)) known.delete(wordId); else known.add(wordId);
      const score = Math.round((known.size / CHAPTER_ONE_VOCABULARY.length) * 100);
      return { ...current, knownWords: [...known], skillScores: { ...current.skillScores, vocabulary: Math.max(current.skillScores.vocabulary ?? 0, score) } };
    });
  }

  function finishGrammarSet(setName: string, score: number) {
    updateChapter(CHAPTER_ID, (current) => {
      const sets = { ...current.grammarSets, [setName]: Math.max(current.grammarSets[setName] ?? 0, score) };
      const average = Math.round(Object.values(sets).reduce((sum, value) => sum + value, 0) / grammarGroups.length);
      return { ...current, grammarSets: sets, skillScores: { ...current.skillScores, grammar: Math.max(current.skillScores.grammar ?? 0, average) } };
    });
  }

  async function startRecording() {
    setRecordingError("");
    setSpeakingFeedback(null);
    setRecordingBlob(null);
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
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setRecordingBlob(blob);
        setRecordingUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob); });
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        setIsRecording(false);
        updateChapter(CHAPTER_ID, (current) => ({ ...current, recordedSpeaking: true }));
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordingError("Microphone access was not available. Check browser permission and try again.");
    }
  }

  function saveTutorScore(skill: "speaking" | "writing", feedback: TutorFeedback) {
    updateChapter(CHAPTER_ID, (current) => ({
      ...current,
      skillScores: {
        ...current.skillScores,
        [skill]: Math.max(current.skillScores[skill] ?? 0, feedback.mastery ? feedback.overallScore : Math.min(feedback.overallScore, 69)),
      },
    }));
  }

  async function checkSpeaking() {
    if (!recordingBlob || isCheckingSpeaking) return;
    setIsCheckingSpeaking(true);
    setRecordingError("");
    try {
      const feedback = await requestSpeakingFeedback({
        ...tutorContext,
        prompt: "Say your name, where you come from, where you live, which languages you speak, and one personal detail. Use at least three correct forms of sein.",
      }, recordingBlob);
      setSpeakingFeedback(feedback);
      saveTutorScore("speaking", feedback);
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : "Speaking feedback could not be loaded.");
    } finally {
      setIsCheckingSpeaking(false);
    }
  }

  async function checkWriting() {
    if (writingWords < 30 || writingChecks.size < 3 || isCheckingWriting) return;
    setIsCheckingWriting(true);
    setWritingError("");
    try {
      const feedback = await requestWritingFeedback(tutorContext, chapter.writingDraft);
      setWritingFeedback(feedback);
      saveTutorScore("writing", feedback);
    } catch (error) {
      setWritingError(error instanceof Error ? error.message : "Writing feedback could not be loaded.");
    } finally {
      setIsCheckingWriting(false);
    }
  }

  function completeChapter() {
    if (!readyForMastery) return;
    updateChapter(CHAPTER_ID, (current) => ({ ...current, completed: true }));
    setStoryCompleted(story.id, true);
  }

  return (
    <main className="site-shell chapter-page" id="top">
      <SiteHeader active="course" />

      <header className="chapter-topbar">
        <Link href="/"><ArrowLeft /> A1 course</Link>
        <div><span>Chapter 01 of 24</span><Progress value={chapterPercent} aria-label={`Chapter 1 ${chapterPercent}% complete`} /><strong>{chapterPercent}%</strong></div>
      </header>

      <section className="chapter-hero">
        <div>
          <div className="chapter-kicker"><Badge>A1</Badge><span>Module 1 · Sentence foundations</span></div>
          <h1 lang="de">Ich bin neu hier.</h1>
          <p>Learn to introduce yourself, understand a first meeting, and control personal pronouns with <em>sein</em>.</p>
          <div className="chapter-facts"><span><BookOpen /> 1 narrated story</span><span><Languages /> 30 core words</span><span><GraduationCap /> 50 grammar exercises</span><span><Mic /> Speaking mission</span></div>
        </div>
        <aside className="chapter-skill-card">
          <span>Chapter mastery</span>
          <div>{SKILLS.map(({ id, label, icon: Icon }) => { const score = chapter.skillScores[id] ?? 0; return <a key={id} href={`#${id}`}><Icon /><span>{label}</span><Progress value={score} /><b>{score}%</b></a>; })}</div>
          <p>Every skill must reach at least 70%. The final checkpoint requires 80%.</p>
        </aside>
      </section>

      <nav className="chapter-section-nav" aria-label="Chapter sections">
        {SKILLS.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`}><Icon /><span>{label}</span>{(chapter.skillScores[id] ?? 0) >= 70 ? <CheckCircle2 /> : <Circle />}</a>)}
        <a href="#checkpoint"><ClipboardCheck /><span>Checkpoint</span>{(chapter.checkpointScore ?? 0) >= 80 ? <CheckCircle2 /> : <Circle />}</a>
      </nav>

      <section className="chapter-outcomes">
        <div><span>Before you begin</span><h2>What you will be able to do.</h2></div>
        <div>{CHAPTER_ONE_OUTCOMES.map((outcome) => <p key={outcome}><Check />{outcome}</p>)}</div>
      </section>

      <section className="chapter-learning-section chapter-listening" id="listening">
        <div className="chapter-section-copy"><span>01 · Listening</span><h2>Meet Mia in Berlin.</h2><p>Listen once without reading. Focus on who is speaking, where they are, and which personal details you hear. Then listen again before answering.</p><div className="chapter-audio-player"><Button size="icon-lg" onClick={toggleAudio} aria-label={isListening ? "Pause chapter audio" : "Play chapter audio"}>{isListening ? <Pause /> : <Play />}</Button><div><strong>{isListening ? "Listening in German" : "Guten Morgen, Mia!"}</strong><span>Natural story · learning speed 0.92×</span></div><Button variant="ghost" size="icon-sm" onClick={restartAudio} aria-label="Restart chapter audio"><RotateCcw /></Button></div>{audioError && <p className="chapter-error" role="alert">{audioError}</p>}</div>
        <QuizBlock questions={CHAPTER_ONE_LISTENING} eyebrow="Listening check" title="What did you understand?" savedScore={chapter.skillScores.listening ?? 0} onScore={(score) => setSkillScore(CHAPTER_ID, "listening", score)} />
      </section>

      <section className="chapter-learning-section chapter-reading" id="reading">
        <div className="chapter-section-copy"><span>02 · Reading</span><h2>Read for meaning and detail.</h2><p>Read the complete story. Do not translate every word; use the situation and familiar expressions first.</p></div>
        <article className="chapter-story" lang="de"><div><Badge>Story 001</Badge><span>{story.text.split(/\s+/).length} words</span></div><h3>{story.title}</h3>{story.text.split(/\n\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>
        <QuizBlock questions={CHAPTER_ONE_READING} eyebrow="Reading check" title="Read beyond individual words." savedScore={chapter.skillScores.reading ?? 0} onScore={(score) => setSkillScore(CHAPTER_ID, "reading", score)} />
      </section>

      <section className="chapter-learning-section chapter-vocabulary" id="vocabulary">
        <div className="chapter-section-copy"><span>03 · Vocabulary</span><h2>Build the language for a first meeting.</h2><p>Learn every noun with its article and plural, every verb through a sentence, and every expression as something you can say.</p><div className="vocabulary-mastery-line"><strong>{chapter.knownWords.length}/{CHAPTER_ONE_VOCABULARY.length} recalled</strong><Progress value={(chapter.knownWords.length / CHAPTER_ONE_VOCABULARY.length) * 100} /></div></div>
        <div className="chapter-vocab-grid">{CHAPTER_ONE_VOCABULARY.slice(0, showAllWords ? undefined : 12).map((word) => { const known = chapter.knownWords.includes(word.id); return <article key={word.id} className={known ? "is-known" : ""}><span>{word.english}</span><h3 lang="de">{word.german}</h3>{word.note && <small>{word.note}</small>}<p lang="de">{word.example}</p><button type="button" aria-pressed={known} onClick={() => toggleKnownWord(word.id)}><Check /> {known ? "I can recall this" : "Mark after recalling"}</button></article>; })}</div>
        {!showAllWords && <Button variant="outline" className="show-chapter-words" onClick={() => setShowAllWords(true)}>Show all 30 chapter words</Button>}
      </section>

      <section className="chapter-learning-section chapter-grammar" id="grammar">
        <div className="chapter-section-copy"><span>04 · Grammar</span><h2>Personal pronouns and <em>sein</em>.</h2><p>{grammar.lead}</p></div>
        <div className="chapter-grammar-pattern"><span>Core pattern</span><strong lang="de">{grammar.pattern}</strong></div>
        <div className="chapter-explanation">{grammar.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="chapter-tables">{grammar.tables?.map((table) => <article key={table.title}><h3>{table.title}</h3>{table.caption && <p>{table.caption}</p>}<div><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`} lang={index > 0 ? "de" : undefined}>{cell}</td>)}</tr>)}</tbody></table></div></article>)}</div>
        <div className="chapter-examples"><div><span>See it in use</span><h3>Useful examples</h3></div><div>{grammar.examples.map((example) => <article key={example.german}><strong lang="de">{example.german}</strong><span>{example.english}</span>{example.note && <small>{example.note}</small>}</article>)}</div></div>
        <div className="chapter-memory-tip"><Lightbulb /><div><span>Memory strategy</span><p>{grammar.memoryTip}</p></div></div>
        <GrammarPracticePanel lessonId={CHAPTER_ID} completedSets={chapter.grammarSets} onFinish={finishGrammarSet} />
      </section>

      <section className="chapter-learning-section chapter-speaking" id="speaking">
        <div className="chapter-section-copy"><span>05 · Speaking</span><h2>Introduce yourself without reading.</h2><p>Say your name, where you come from, where you live, which languages you speak, and one personal detail. Aim for 30–45 seconds.</p></div>
        <div className="speaking-mission"><div><Target /><span><b>Your mission</b><small>Use at least five chapter expressions and three correct forms of <em>sein</em>.</small></span></div><ol><li>Listen to the story introduction again.</li><li>Practise once with notes.</li><li>Record without reading a complete script.</li><li>Submit it for a transcript, corrections, and a clear next step.</li></ol><div className="ai-tutor-actions">{!isRecording ? <Button variant={recordingBlob ? "outline" : "default"} onClick={startRecording}><Mic /> {recordingBlob ? "Record another response" : "Start recording"}</Button> : <Button className="recording-button" onClick={() => recorderRef.current?.stop()}><Square /> Stop recording</Button>}{recordingBlob && !isRecording && <Button onClick={checkSpeaking} disabled={isCheckingSpeaking}><Sparkles /> {isCheckingSpeaking ? "Checking…" : speakingFeedback ? "Check again" : "Check recording"}</Button>}</div>{recordingUrl && <div className="chapter-recording"><Volume2 /><span><b>Your recording</b><small>Kept in this open page. It is sent for feedback only when you submit.</small></span><audio controls src={recordingUrl}>Your browser cannot play this recording.</audio></div>}{recordingError && <p className="chapter-error" role="alert">{recordingError}</p>}<p className="ai-tutor-privacy">Your audio is transcribed securely when submitted. The course saves only your best skill score, not the recording or transcript.</p></div>
        {speakingFeedback && <AiTutorFeedback feedback={speakingFeedback} mode="speaking" onRetry={() => setSpeakingFeedback(null)} />}
      </section>

      <section className="chapter-learning-section chapter-writing" id="writing">
        <div className="chapter-section-copy"><span>06 · Writing</span><h2>Write a personal introduction.</h2><p>Write 30–50 words. Include your name, origin, current city, languages, and one reason for learning German.</p></div>
        <div className="writing-workspace"><label><span>Your German text · {writingWords} words</span><Textarea lang="de" value={chapter.writingDraft} onChange={(event) => updateChapter(CHAPTER_ID, (current) => ({ ...current, writingDraft: event.target.value }))} placeholder="Hallo! Ich heiße …" /></label><div className="writing-rubric"><span>Self-check before submitting</span>{[
          ["content", "I included all five requested details."],
          ["grammar", "I checked ich bin, ich komme and ich spreche."],
          ["clarity", "Every sentence begins with a capital letter and ends clearly."],
        ].map(([id, text]) => <button key={id} type="button" aria-pressed={writingChecks.has(id)} onClick={() => setWritingChecks((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })}><Check />{text}</button>)}</div><div className="writing-submit"><p>Example structure: <span lang="de">Hallo! Ich heiße … Ich komme aus … Jetzt wohne ich in … Ich spreche … Ich lerne Deutsch, weil …</span></p><Button disabled={writingWords < 30 || writingChecks.size < 3 || isCheckingWriting} onClick={checkWriting}><Sparkles /> {isCheckingWriting ? "Checking…" : writingFeedback ? "Check again" : "Submit"}</Button></div>{writingWords < 30 && <p className="ai-tutor-requirement">Write {30 - writingWords} more {30 - writingWords === 1 ? "word" : "words"} to submit.</p>}{writingWords >= 30 && writingChecks.size < 3 && <p className="ai-tutor-requirement">Complete all three self-checks to submit.</p>}{writingError && <p className="chapter-error" role="alert">{writingError}</p>}<p className="ai-tutor-privacy">Your text is sent for feedback only when you submit. The course keeps your draft and best skill score on this device.</p></div>
        {writingFeedback && <AiTutorFeedback feedback={writingFeedback} mode="writing" onRetry={() => setWritingFeedback(null)} />}
      </section>

      <section className="chapter-learning-section chapter-checkpoint" id="checkpoint">
        <div className="chapter-section-copy"><span>07 · Integrated checkpoint</span><h2>Prove that the chapter works together.</h2><p>This final check mixes the central vocabulary, grammar, reading situation, and communicative goal. You need at least 80%.</p></div>
        <QuizBlock questions={CHAPTER_ONE_CHECKPOINT} eyebrow="Chapter checkpoint" title="Ready to use what you learned?" savedScore={chapter.checkpointScore ?? 0} onScore={(score) => updateChapter(CHAPTER_ID, (current) => ({ ...current, checkpointScore: Math.max(current.checkpointScore ?? 0, score) }))} />
      </section>

      <section className={`chapter-finish${chapter.completed ? " is-complete" : ""}`}>
        <div>{chapter.completed ? <CheckCircle2 /> : <Sparkles />}</div>
        <span>{chapter.completed ? "Chapter mastered" : "Mastery gate"}</span>
        <h2>{chapter.completed ? "Du kannst dich vorstellen." : readyForMastery ? "Every skill is ready." : "Complete every skill before moving on."}</h2>
        <p>{chapter.completed ? "A1 is now 1 of 24 chapters complete. Your Chapter 1 skills remain available for review." : "Each skill needs 70%, all five grammar sets must be attempted, and the checkpoint needs 80%."}</p>
        <div className="mastery-requirements">{SKILLS.map(({ id, label }) => <span key={id} className={(chapter.skillScores[id] ?? 0) >= 70 ? "is-ready" : ""}>{(chapter.skillScores[id] ?? 0) >= 70 ? <Check /> : <Circle />}{label} {chapter.skillScores[id] ?? 0}%</span>)}<span className={(chapter.checkpointScore ?? 0) >= 80 ? "is-ready" : ""}>{(chapter.checkpointScore ?? 0) >= 80 ? <Check /> : <Circle />}Checkpoint {chapter.checkpointScore ?? 0}%</span></div>
        {chapter.completed ? <Button variant="outline" asChild><Link href="/">Return to A1 roadmap</Link></Button> : <Button size="lg" disabled={!readyForMastery || !hydrated} onClick={completeChapter}>Complete Chapter 1 <ArrowRight /></Button>}
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through complete courses</small></span></Link><p>A1 Chapter 1 integrates all six language skills and a mastery checkpoint.</p><div><a href="#top">Back to top</a><Link href="/">A1 course</Link></div></footer>
    </main>
  );
}
