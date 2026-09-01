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
import { SiteHeader } from "@/app/components/site-header";
import { courseChapterHref, getCourseChapter } from "@/app/course/course-data";
import type { ChapterQuestion } from "@/app/course/a1/chapter-one";
import type { GrammarLevel } from "@/app/grammar/course";
import {
  COURSE_SKILLS,
  EMPTY_CHAPTER_PROGRESS,
  type CourseSkill,
  useCourseProgress,
} from "@/app/hooks/use-course-progress";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

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
      {submitted
        ? <div className="chapter-quiz-result"><strong>{score}%</strong><span>{score >= 80 ? "Strong result. This skill is ready." : "Review the feedback, then try again."}</span><Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); }}><RotateCcw /> Try again</Button></div>
        : <Button onClick={submit} disabled={Object.keys(answers).length < questions.length}>Check all answers <ArrowRight /></Button>}
    </div>
  );
}

export function IntegratedCourseChapter({ level, number }: { level: GrammarLevel; number: number }) {
  const content = getCourseChapter(level, number)!;
  const { progress, hydrated, updateChapter, setSkillScore } = useCourseProgress();
  const { setStoryCompleted } = useStoryProgress();
  const chapter = progress.chapters[content.id] ?? EMPTY_CHAPTER_PROGRESS;
  const grammarGroups = useMemo(() => [...new Set(content.grammar.exercises.map((exercise) => exercise.group ?? "Core practice"))], [content.grammar.exercises]);
  const [showAllWords, setShowAllWords] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [writingChecks, setWritingChecks] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrl = `${content.curriculum.audioBasePath}/story-${String(content.story.number).padStart(3, "0")}.webm?v=${content.curriculum.audioVersion}`;
  const writingMinimum = level === "A1" ? 40 : level === "A2" ? 70 : 100;
  const speakingLength = level === "A1" ? "45–60 seconds" : level === "A2" ? "60–90 seconds" : "90–120 seconds";

  const chapterPercent = useMemo(() => {
    const skillTotal = COURSE_SKILLS.reduce((sum, skill) => sum + (chapter.skillScores[skill] ?? 0), 0);
    return Math.round((skillTotal + (chapter.checkpointScore ?? 0)) / (COURSE_SKILLS.length + 1));
  }, [chapter]);
  const readyForMastery = COURSE_SKILLS.every((skill) => (chapter.skillScores[skill] ?? 0) >= 70)
    && (chapter.checkpointScore ?? 0) >= 80
    && Object.keys(chapter.grammarSets).length === grammarGroups.length;
  const writingWords = chapter.writingDraft.trim() ? chapter.writingDraft.trim().split(/\s+/).length : 0;
  const previousHref = number > 1 ? courseChapterHref(level, number - 1) : level === "A1" ? "/" : courseChapterHref(level === "A2" ? "A1" : "A2", 24);
  const nextHref = number < 24 ? courseChapterHref(level, number + 1) : level === "B1" ? "/" : courseChapterHref(level === "A1" ? "A2" : "B1", 1);

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
      } else audioRef.current.pause();
      return;
    }
    setAudioError("");
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.playbackRate = level === "A1" ? 0.92 : level === "A2" ? 0.96 : 1;
    audioRef.current = audio;
    audio.onplaying = () => setIsListening(true);
    audio.onpause = () => setIsListening(false);
    audio.onended = () => setIsListening(false);
    audio.onerror = () => { setIsListening(false); setAudioError("The chapter audio could not be loaded."); };
    void audio.play().catch(() => setAudioError("Playback could not start. Please try again."));
  }

  function toggleKnownWord(wordId: string) {
    updateChapter(content.id, (current) => {
      const known = new Set(current.knownWords);
      if (known.has(wordId)) known.delete(wordId); else known.add(wordId);
      const score = Math.round((known.size / content.vocabulary.length) * 100);
      return { ...current, knownWords: [...known], skillScores: { ...current.skillScores, vocabulary: Math.max(current.skillScores.vocabulary ?? 0, score) } };
    });
  }

  function finishGrammarSet(setName: string, score: number) {
    updateChapter(content.id, (current) => {
      const sets = { ...current.grammarSets, [setName]: Math.max(current.grammarSets[setName] ?? 0, score) };
      const average = Math.round(Object.values(sets).reduce((sum, value) => sum + value, 0) / grammarGroups.length);
      return { ...current, grammarSets: sets, skillScores: { ...current.skillScores, grammar: Math.max(current.skillScores.grammar ?? 0, average) } };
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
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setRecordingUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob); });
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        setIsRecording(false);
        updateChapter(content.id, (current) => ({ ...current, recordedSpeaking: true, skillScores: { ...current.skillScores, speaking: 100 } }));
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordingError("Microphone access was not available. Check browser permission and try again.");
    }
  }

  function completeChapter() {
    if (!readyForMastery) return;
    updateChapter(content.id, (current) => ({ ...current, completed: true }));
    setStoryCompleted(content.story.id, true);
  }

  return (
    <main className="site-shell chapter-page" id="top">
      <SiteHeader active="course" />

      <header className="chapter-topbar">
        <Link href="/"><ArrowLeft /> {level} course</Link>
        <div><span>Chapter {String(number).padStart(2, "0")} of 24</span><Progress value={chapterPercent} aria-label={`Chapter ${number} ${chapterPercent}% complete`} /><strong>{chapterPercent}%</strong></div>
      </header>

      <section className="chapter-hero">
        <div>
          <div className="chapter-kicker"><Badge>{level}</Badge><span>Module {content.module.number} · {content.module.title}</span></div>
          <h1 lang="de">{content.story.title}</h1>
          <p>{content.lesson.outcome} Story context: <em>{content.story.theme}</em>.</p>
          <div className="chapter-facts"><span><BookOpen /> 1 narrated story</span><span><Languages /> {content.vocabulary.length} core words</span><span><GraduationCap /> {content.grammar.exercises.length} grammar exercises</span><span><Mic /> Speaking mission</span></div>
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
        <div>{content.outcomes.map((outcome) => <p key={outcome}><Check />{outcome}</p>)}</div>
      </section>

      <section className="chapter-learning-section chapter-listening" id="listening">
        <div className="chapter-section-copy"><span>01 · Listening</span><h2>Listen before you read.</h2><p>First listen for the situation and main idea. Listen again for exact expressions and details before answering.</p><div className="chapter-audio-player"><Button size="icon-lg" onClick={toggleAudio} aria-label={isListening ? "Pause chapter audio" : "Play chapter audio"}>{isListening ? <Pause /> : <Play />}</Button><div><strong>{isListening ? "Listening in German" : content.story.title}</strong><span>Narrated story · {level === "A1" ? "learning speed" : "natural speed"}</span></div><Button variant="ghost" size="icon-sm" onClick={() => { if (!audioRef.current) toggleAudio(); else { audioRef.current.currentTime = 0; void audioRef.current.play(); } }} aria-label="Restart chapter audio"><RotateCcw /></Button></div>{audioError && <p className="chapter-error" role="alert">{audioError}</p>}</div>
        <QuizBlock questions={content.listening} eyebrow="Listening check" title="What did you understand?" savedScore={chapter.skillScores.listening ?? 0} onScore={(score) => setSkillScore(content.id, "listening", score)} />
      </section>

      <section className="chapter-learning-section chapter-reading" id="reading">
        <div className="chapter-section-copy"><span>02 · Reading</span><h2>Read for meaning and detail.</h2><p>Read the complete story. Infer meaning from context first, then use the chapter vocabulary to confirm important expressions.</p></div>
        <article className="chapter-story" lang="de"><div><Badge>Story {String(content.story.number).padStart(3, "0")}</Badge><span>{content.story.text.split(/\s+/).length} words</span></div><h3>{content.story.title}</h3>{content.story.text.split(/\n\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>
        <QuizBlock questions={content.reading} eyebrow="Reading check" title="Read beyond individual words." savedScore={chapter.skillScores.reading ?? 0} onScore={(score) => setSkillScore(content.id, "reading", score)} />
      </section>

      <section className="chapter-learning-section chapter-vocabulary" id="vocabulary">
        <div className="chapter-section-copy"><span>03 · Vocabulary</span><h2>Recall language from the story.</h2><p>Say the meaning before revealing it mentally, then read the complete story sentence. Mark a word only when you can recall it without help.</p><div className="vocabulary-mastery-line"><strong>{chapter.knownWords.filter((word) => content.vocabulary.some((item) => item.id === word)).length}/{content.vocabulary.length} recalled</strong><Progress value={(chapter.knownWords.filter((word) => content.vocabulary.some((item) => item.id === word)).length / content.vocabulary.length) * 100} /></div></div>
        <div className="chapter-vocab-grid">{content.vocabulary.slice(0, showAllWords ? undefined : 12).map((word) => { const known = chapter.knownWords.includes(word.id); return <article key={word.id} className={known ? "is-known" : ""}><span>{word.english}</span><h3 lang="de">{word.german}</h3>{word.note && <small>{word.note}</small>}<p lang="de">{word.example}</p><button type="button" aria-pressed={known} onClick={() => toggleKnownWord(word.id)}><Check /> {known ? "I can recall this" : "Mark after recalling"}</button></article>; })}</div>
        {!showAllWords && content.vocabulary.length > 12 && <Button variant="outline" className="show-chapter-words" onClick={() => setShowAllWords(true)}>Show all {content.vocabulary.length} chapter words</Button>}
      </section>

      <section className="chapter-learning-section chapter-grammar" id="grammar">
        <div className="chapter-section-copy"><span>04 · Grammar</span><h2>{content.lesson.title}.</h2><p>{content.grammar.lead}</p></div>
        <div className="chapter-grammar-pattern"><span>Core pattern</span><strong lang="de">{content.grammar.pattern}</strong></div>
        <div className="chapter-explanation">{content.grammar.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {content.grammar.sections?.map((section) => <article className="chapter-grammar-detail" key={section.title}><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.examples?.map((example) => <p key={example.german}><b lang="de">{example.german}</b> — {example.english}</p>)}</article>)}
        <div className="chapter-tables">{content.grammar.tables?.map((table) => <article key={table.title}><h3>{table.title}</h3>{table.caption && <p>{table.caption}</p>}<div><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`} lang={index > 0 ? "de" : undefined}>{cell}</td>)}</tr>)}</tbody></table></div></article>)}</div>
        <div className="chapter-examples"><div><span>See it in use</span><h3>Useful examples</h3></div><div>{content.grammar.examples.map((example) => <article key={example.german}><strong lang="de">{example.german}</strong><span>{example.english}</span>{example.note && <small>{example.note}</small>}</article>)}</div></div>
        <div className="chapter-memory-tip"><Lightbulb /><div><span>Memory strategy</span><p>{content.grammar.memoryTip}</p></div></div>
        <GrammarPracticePanel lessonId={content.id} completedSets={chapter.grammarSets} onFinish={finishGrammarSet} />
      </section>

      <section className="chapter-learning-section chapter-speaking" id="speaking">
        <div className="chapter-section-copy"><span>05 · Speaking</span><h2>Respond without reading.</h2><p>{content.speakingPrompt}</p></div>
        <div className="speaking-mission"><div><Target /><span><b>Your mission</b><small>Speak for {speakingLength}. Use the grammar pattern and at least five chapter expressions.</small></span></div><ol><li>Listen to one paragraph again and shadow its rhythm.</li><li>Prepare keywords, not a complete script.</li><li>Record your response in one continuous attempt.</li><li>Listen back and repeat one weaker sentence.</li></ol><div>{!isRecording ? <Button onClick={startRecording}><Mic /> Start private recording</Button> : <Button className="recording-button" onClick={() => recorderRef.current?.stop()}><Square /> Stop recording</Button>}</div>{recordingUrl && <div className="chapter-recording"><Volume2 /><span><b>Your recording</b><small>Stored only in this open page; it is not uploaded.</small></span><audio controls src={recordingUrl}>Your browser cannot play this recording.</audio></div>}{recordingError && <p className="chapter-error" role="alert">{recordingError}</p>}</div>
      </section>

      <section className="chapter-learning-section chapter-writing" id="writing">
        <div className="chapter-section-copy"><span>06 · Writing</span><h2>Produce connected German.</h2><p>{content.writingPrompt} Minimum: {writingMinimum} words.</p></div>
        <div className="writing-workspace"><label><span>Your German text · {writingWords} words</span><Textarea lang="de" value={chapter.writingDraft} onChange={(event) => updateChapter(content.id, (current) => ({ ...current, writingDraft: event.target.value }))} placeholder={`Kapitel ${number}: ${content.story.theme} …`} /></label><div className="writing-rubric"><span>Self-check before submitting</span>{[
          ["content", "I answered every part of the writing mission."],
          ["grammar", `I deliberately used the focus: ${content.lesson.title}.`],
          ["clarity", "I checked sentence order, capitals, endings, and punctuation."],
        ].map(([id, text]) => <button key={id} type="button" aria-pressed={writingChecks.has(id)} onClick={() => setWritingChecks((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })}><Check />{text}</button>)}</div><div className="writing-submit"><p>Use expressions from the story, but make the response your own. Clear, accurate sentences matter more than unusual vocabulary.</p><Button disabled={writingWords < writingMinimum || writingChecks.size < 3} onClick={() => setSkillScore(content.id, "writing", 100)}>Submit writing task <ArrowRight /></Button></div></div>
      </section>

      <section className="chapter-learning-section chapter-checkpoint" id="checkpoint">
        <div className="chapter-section-copy"><span>07 · Integrated checkpoint</span><h2>Prove that the chapter works together.</h2><p>This final check mixes the story, contextual vocabulary, grammar patterns, correction, and communicative outcome. You need at least 80%.</p></div>
        <QuizBlock questions={content.checkpoint} eyebrow="Chapter checkpoint" title="Ready to use what you learned?" savedScore={chapter.checkpointScore ?? 0} onScore={(score) => updateChapter(content.id, (current) => ({ ...current, checkpointScore: Math.max(current.checkpointScore ?? 0, score) }))} />
      </section>

      <section className={`chapter-finish${chapter.completed ? " is-complete" : ""}`}>
        <div>{chapter.completed ? <CheckCircle2 /> : <Sparkles />}</div>
        <span>{chapter.completed ? "Chapter mastered" : "Mastery gate"}</span>
        <h2>{chapter.completed ? content.lesson.outcome : readyForMastery ? "Every skill is ready." : "Complete every skill before moving on."}</h2>
        <p>{chapter.completed ? `${level} is now one chapter closer to completion. Review remains available at any time.` : `Each skill needs 70%, all ${grammarGroups.length} grammar sets must be attempted, and the checkpoint needs 80%.`}</p>
        <div className="mastery-requirements">{SKILLS.map(({ id, label }) => <span key={id} className={(chapter.skillScores[id] ?? 0) >= 70 ? "is-ready" : ""}>{(chapter.skillScores[id] ?? 0) >= 70 ? <Check /> : <Circle />}{label} {chapter.skillScores[id] ?? 0}%</span>)}<span className={(chapter.checkpointScore ?? 0) >= 80 ? "is-ready" : ""}>{(chapter.checkpointScore ?? 0) >= 80 ? <Check /> : <Circle />}Checkpoint {chapter.checkpointScore ?? 0}%</span></div>
        <div className="chapter-finish-actions"><Button variant="outline" asChild><Link href={previousHref}><ArrowLeft /> Previous chapter</Link></Button>{chapter.completed ? <Button asChild><Link href={nextHref}>Continue to next chapter <ArrowRight /></Link></Button> : <Button size="lg" disabled={!readyForMastery || !hydrated} onClick={completeChapter}>Complete Chapter {number} <ArrowRight /></Button>}</div>
      </section>

      <footer><Link href="/" className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through complete courses</small></span></Link><p>{level} Chapter {number} integrates all six language skills and a mastery checkpoint.</p><div><a href="#top">Back to top</a><Link href="/">Course roadmap</Link></div></footer>
    </main>
  );
}
