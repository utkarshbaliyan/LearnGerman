"use client";

import {
  ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, ChevronRight,
  Circle, Lightbulb, LockKeyhole, RefreshCcw, Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { acceptsGrammarAnswer, joinGrammarTokens } from "./practice-answer";
import { GRAMMAR_BRIEF_RULES } from "./brief-rules";
import { LessonReference } from "./lesson-reference";
import { LessonGuide } from "./lesson-guide";
import { uniqueGrammarTasks, grammarChoiceOptions, grammarTaskFocus } from "./practice-sequence";
import { SiteHeader } from "@/app/components/site-header";
import { TopicArt } from "@/app/components/topic-art";
import {
  ALL_GRAMMAR_LESSONS, GRAMMAR_LEVELS, GRAMMAR_MODULES, LIVE_GRAMMAR_LESSONS,
  getGrammarModuleForLesson, type GrammarExercise, type GrammarLevel,
} from "@/app/grammar/course";
import {
  mergeGrammarProgressWithCourse,
  readCourseProgress,
  readGrammarProgress,
  syncGrammarLessonToCourse,
  writeGrammarProgress,
  type GrammarProgress,
} from "@/app/lib/progress-sync";
import { PROGRESS_SYNCED_EVENT } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const REQUIRED_GRAMMAR_SETS = Object.fromEntries(Object.entries(LIVE_GRAMMAR_LESSONS).map(([lessonId, lesson]) => [
  lessonId,
  [...new Set(lesson.exercises.map((exercise) => exercise.group ?? "Core practice"))],
]));

function ExerciseType({ exercise }: { exercise: GrammarExercise }) {
  const labels: Record<GrammarExercise["type"], string> = {
    choice: "Choose",
    fill: "Complete",
    order: "Build",
    correction: "Correct",
    translation: "Translate",
    production: "Produce",
  };
  return <Badge variant="outline">{labels[exercise.type]}</Badge>;
}

function PracticePanel({ lessonId, completedSets, onFinish }: { lessonId: string; completedSets: Record<string, number>; onFinish: (setName: string, score: number) => void }) {
  const allExercises = useMemo(() => uniqueGrammarTasks(LIVE_GRAMMAR_LESSONS[lessonId].exercises), [lessonId]);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const groups = useMemo(() => [...new Set(allExercises.map((item) => item.group ?? "Core practice"))], [allExercises]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [ordered, setOrdered] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const exercises = allExercises.filter((item) => (item.group ?? "Core practice") === activeGroup);
  const exercise = exercises[index];
  const gradedTotal = exercises.filter((item) => item.type !== "production").length;

  useEffect(() => {
    if (activeGroup && !finished) questionHeading.current?.focus({ preventScroll: true });
  }, [activeGroup, index, finished]);

  function currentValue() {
    if (exercise.type === "order") return joinGrammarTokens(ordered.map((tokenIndex) => exercise.tokens[tokenIndex]));
    return value;
  }

  function checkAnswer() {
    if (submitted) return;
    if (exercise.type === "production") {
      setSubmitted(true);
      return;
    }
    const isCorrect = acceptsGrammarAnswer(exercise.answer, currentValue(), exercise.caseSensitive);
    setCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
  }

  function next() {
    if (index === exercises.length - 1) {
      const score = gradedTotal === 0 ? 100 : Math.round((correctCount / gradedTotal) * 100);
      setFinished(true);
      onFinish(activeGroup!, score);
      return;
    }
    setIndex((current) => current + 1);
    setValue("");
    setOrdered([]);
    setSubmitted(false);
    setCorrect(false);
  }

  function restart() {
    setIndex(0);
    setValue("");
    setOrdered([]);
    setSubmitted(false);
    setCorrect(false);
    setCorrectCount(0);
    setFinished(false);
  }

  function chooseSet(group: string) {
    setActiveGroup(group);
    restart();
  }

  if (!activeGroup) {
    return (
      <section className="grammar-practice" id="grammar-practice" aria-label="Lesson practice">
        <div className="practice-heading">
          <div><span>Learn by doing</span><h3>Choose a practice set.</h3></div>
          <div><strong>{allExercises.length} tasks</strong><Progress value={(Object.keys(completedSets).length / groups.length) * 100} /></div>
        </div>
        <div className="practice-set-grid">
          {groups.map((group, groupIndex) => {
            const count = allExercises.filter((item) => (item.group ?? "Core practice") === group).length;
            const score = completedSets[group];
            const selfChecked = allExercises.filter(item => (item.group ?? "Core practice") === group).every(item => item.type === "production");
            return <button key={group} type="button" onClick={() => chooseSet(group)}><span>{String(groupIndex + 1).padStart(2, "0")}</span><div><strong>{group.replace(/^\d+ · /, "")}</strong><small>{count} exercises · {score === undefined ? "Not started" : selfChecked ? "Self-check complete" : `Best ${score}%`}</small></div>{score === undefined ? <ChevronRight /> : <CheckCircle2 />}</button>;
          })}
        </div>
      </section>
    );
  }

  if (finished) {
    const score = gradedTotal === 0 ? 100 : Math.round((correctCount / gradedTotal) * 100);
    return (
      <section className="practice-finish" id="grammar-practice" aria-label="Practice result" role="status">
        <span><CheckCircle2 /></span>
        <p>Practice set complete</p>
        <strong>{gradedTotal === 0 ? "Self-check complete" : `${score}%`}</strong>
        <h3>{gradedTotal === 0 ? "Review your own grammar against the models." : score >= 80 ? "Strong result on this set." : "Review the patterns and try again."}</h3>
        <p>{gradedTotal === 0 ? "Production is self-checked; it is not independently graded." : `${correctCount} of ${gradedTotal} graded tasks were correct.`} Your best result is saved.</p>
        <div className="practice-finish-actions"><Button onClick={restart} variant="outline"><RefreshCcw /> Practice again</Button><Button onClick={() => { const following = groups[groups.indexOf(activeGroup!) + 1]; if (following) chooseSet(following); else setActiveGroup(null); }}>{groups.indexOf(activeGroup!) < groups.length - 1 ? "Next practice set" : "All practice sets"}<ArrowRight /></Button></div>
      </section>
    );
  }

  const canSubmit = exercise.type === "production" || currentValue().trim().length > 0;

  return (
    <section className="grammar-practice" id="grammar-practice" aria-label="Lesson practice">
      <div className="practice-heading">
        <div><button type="button" className="practice-back" onClick={() => setActiveGroup(null)}><ArrowLeft /> Practice sets</button><h3>{activeGroup.replace(/^\d+ · /, "")}</h3></div>
        <div><strong>{index + 1}/{exercises.length}</strong><Progress value={(index / exercises.length) * 100} /></div>
      </div>

      <article className="exercise-card">
        <div className="exercise-meta"><ExerciseType exercise={exercise} /><span>{exercise.type === "production" ? "Self-check" : "Instant feedback"}</span></div>
        <h4 ref={questionHeading} tabIndex={-1}>{exercise.prompt}</h4>
        {grammarTaskFocus(exercise) && <p className="exercise-target">{grammarTaskFocus(exercise)}</p>}
        <details className="exercise-rule-hint" key={exercise.id}><summary>Need the rule?</summary><p>{GRAMMAR_BRIEF_RULES[lessonId]}</p></details>

        {exercise.type === "choice" && (
          <div className="choice-grid">
            {grammarChoiceOptions(exercise).map((option) => <button key={option} type="button" className={value === option ? "is-selected" : ""} disabled={submitted} onClick={() => setValue(option)}>{option}</button>)}
          </div>
        )}

        {(exercise.type === "fill" || exercise.type === "correction" || exercise.type === "translation") && (
          <label className="answer-field">
            <span>{exercise.caseSensitive && "Use the model’s capitalisation. "}{exercise.type === "fill" ? "Your answer" : exercise.type === "correction" ? "Correct sentence" : exercise.direction === "en-de" ? "German translation" : "English translation"}</span>
            <Input lang={exercise.type === "translation" && exercise.direction === "de-en" ? "en" : "de"} value={value} disabled={submitted} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && canSubmit && !submitted) checkAnswer(); }} placeholder={exercise.type === "fill" ? "Type the missing word" : exercise.type === "correction" ? "Rewrite the complete sentence" : "Type the complete translation"} />
          </label>
        )}

        {exercise.type === "order" && (
          <div className="order-builder">
            <div className="order-answer">
              {ordered.length ? ordered.map((tokenIndex) => <button key={tokenIndex} type="button" disabled={submitted} onClick={() => setOrdered((items) => items.filter((item) => item !== tokenIndex))}>{exercise.tokens[tokenIndex]}</button>) : <span>Tap the words in the correct order.</span>}
            </div>
            <div className="order-tokens">
              {exercise.tokens.map((token, tokenIndex) => <button key={`${token}-${tokenIndex}`} type="button" disabled={submitted || ordered.includes(tokenIndex)} onClick={() => setOrdered((items) => [...items, tokenIndex])}>{token}</button>)}
            </div>
          </div>
        )}

        {exercise.type === "production" && !submitted && <div className="production-note"><Lightbulb /><p>Say or write your own answer first. Then reveal the model and compare the grammar—not the personal details.</p></div>}

        {submitted && (
          <div role="status" className={`exercise-feedback ${exercise.type === "production" || correct ? "is-correct" : "is-wrong"}`}>
            {exercise.type === "production" ? <BookOpenCheck /> : correct ? <CheckCircle2 /> : <TriangleAlert />}
            <div>
              <strong>{exercise.type === "production" ? "Model answer" : correct ? "Correct" : "Not yet"}</strong>
              {exercise.type === "production" && <p lang="de">{exercise.model}</p>}
              {exercise.type !== "production" && !correct && <p>Correct answer: <b lang="de">{Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer}</b></p>}
              <p>{exercise.explanation}</p>
            </div>
          </div>
        )}

        <div className="exercise-actions">
          {!submitted ? <Button onClick={checkAnswer} disabled={!canSubmit}>{exercise.type === "production" ? "Show model answer" : "Check answer"}<ArrowRight /></Button> : <Button onClick={next}>{index === exercises.length - 1 ? "Finish set" : "Next exercise"}<ArrowRight /></Button>}
        </div>
      </article>
    </section>
  );
}

export default function GrammarPage() {
  const [level, setLevel] = useState<GrammarLevel>("A1");
  const [selectedLessonId, setSelectedLessonId] = useState("a1-1-1");
  const [progress, setProgress] = useState<GrammarProgress>({ completed: [], scores: {}, sets: {} });
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const lessonBrowser = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const refresh = () => {
      setProgress(mergeGrammarProgressWithCourse(
        readGrammarProgress(localStorage),
        readCourseProgress(localStorage),
        REQUIRED_GRAMMAR_SETS,
      ));
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lesson");
    if (!requested || !LIVE_GRAMMAR_LESSONS[requested]) return;
    const frame = requestAnimationFrame(() => {
      setSelectedLessonId(requested);
      setLevel(requested.split("-")[0].toUpperCase() as GrammarLevel);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) {
      writeGrammarProgress(localStorage, progress);
      queueCloudProgress("grammar", progress);
    }
  }, [hydrated, progress]);

  const levelModules = GRAMMAR_MODULES.filter((item) => item.level === level);
  const liveLessons = ALL_GRAMMAR_LESSONS.filter((lesson) => lesson.released);
  const completedLive = liveLessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
  const selectedLesson = ALL_GRAMMAR_LESSONS.find((lesson) => lesson.id === selectedLessonId)!;
  const selectedModule = getGrammarModuleForLesson(selectedLessonId)!;
  const content = LIVE_GRAMMAR_LESSONS[selectedLessonId];
  const nextLesson = useMemo(() => {
    const currentIndex = liveLessons.findIndex((lesson) => lesson.id === selectedLessonId);
    return liveLessons[currentIndex + 1];
  }, [liveLessons, selectedLessonId]);

  function rememberLesson(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("lesson", id);
    url.hash = "lesson";
    window.history.replaceState(window.history.state, "", url);
  }

  function selectLevel(next: GrammarLevel) {
    setLevel(next);
    const firstLive = GRAMMAR_MODULES.filter((item) => item.level === next).flatMap((item) => item.lessons).find((lesson) => lesson.released);
    setSelectedLessonId(firstLive?.id ?? "");
    if (firstLive) rememberLesson(firstLive.id);
  }

  function selectLesson(id: string) {
    if (!LIVE_GRAMMAR_LESSONS[id]) return;
    setSelectedLessonId(id);
    rememberLesson(id);
    setLevel(getGrammarModuleForLesson(id)!.level);
    setQuery("");
    if (lessonBrowser.current) lessonBrowser.current.open = false;
    document.getElementById("lesson")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function finishSet(setName: string, score: number) {
    const previousSets = progress.sets[selectedLessonId] ?? {};
    const lessonSets = { ...previousSets, [setName]: Math.max(previousSets[setName] ?? 0, score) };
    const requiredSets = REQUIRED_GRAMMAR_SETS[selectedLessonId] ?? [];
    const chapterComplete = requiredSets.every((name) => lessonSets[name] !== undefined);
    const average = Math.round(Object.values(lessonSets).reduce((sum, value) => sum + value, 0) / Object.values(lessonSets).length);
    const next = {
      completed: chapterComplete && !progress.completed.includes(selectedLessonId) ? [...progress.completed, selectedLessonId] : progress.completed,
      scores: { ...progress.scores, [selectedLessonId]: average },
      sets: { ...progress.sets, [selectedLessonId]: lessonSets },
    };
    setProgress(next);
    queueCloudProgress("course", syncGrammarLessonToCourse(localStorage, selectedLessonId, lessonSets, average));
  }

  const overallRoadmap = Math.round((completedLive / ALL_GRAMMAR_LESSONS.length) * 100);
  const searchResults = query.trim() ? ALL_GRAMMAR_LESSONS.filter(lesson => {
    const content = LIVE_GRAMMAR_LESSONS[lesson.id];
    return `${lesson.title} ${lesson.outcome} ${content.pattern} ${content.explanation.join(" ")}`.toLocaleLowerCase("de").includes(query.trim().toLocaleLowerCase("de"));
  }) : [];
  const liveProgress = Math.round((completedLive / liveLessons.length) * 100);

  return (
    <main className="site-shell grammar-page" id="top">
      <SiteHeader active="grammar" />

      <section className="grammar-hero">
        <div>
          <div className="module-kicker"><Badge className="eyebrow"><Sparkles /> A1–C1 · Grammar lessons</Badge><TopicArt kind="learn" className="topic-art--sticker" /></div>
          <h1>Grammar that makes sense.<br /><em>German you can use.</em></h1>
          <p>144 lessons from A1 to C1. Follow a short story, understand the rules, explore the forms—then make them your own in practice.</p>
          <div className="grammar-hero-actions"><Button onClick={() => document.getElementById("lesson")?.scrollIntoView({ behavior: "smooth" })}>Start practising <ArrowRight /></Button><button type="button" className="grammar-browse-link" onClick={() => { if (lessonBrowser.current) lessonBrowser.current.open = true; document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" }); }}>Browse lessons</button><Link href="/grammar/reference">Grammar reference →</Link><Link href="/grammar/cheat-sheets">Case cheat sheets →</Link></div>
        </div>
        <aside className="grammar-progress-card">
          <span>Your grammar progress</span>
          <div className="grammar-score"><strong>{liveProgress}%</strong><small>current release</small></div>
          <Progress value={liveProgress} />
          <p>{completedLive} of {liveLessons.length} available lessons completed. Your practice results are saved to your account.</p>
          <div className="grammar-progress-meta"><span><b>{ALL_GRAMMAR_LESSONS.length}</b> total lessons</span><span><b>{overallRoadmap}%</b> full path</span></div>
        </aside>
      </section>

      <section className="grammar-course" id="roadmap">
        <details className="grammar-roadmap" ref={lessonBrowser}>
          <summary className="grammar-browse-summary"><span><BookOpenCheck /> Browse lessons</span><small>{selectedModule.level} · {selectedLesson.title}</small><ChevronRight /></summary>
          <div className="grammar-browser-content">
          <div className="grammar-roadmap-heading"><span>Grammar roadmap</span><h2>From your first sentence to C1 precision.</h2><p>Choose a topic, then put it into practice.</p></div>
          <label className="grammar-topic-search"><span>Find a topic across A1–C1</span><Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try passive, Konjunktiv, commas…" /></label>
          {query.trim() && <div className="grammar-search-results" aria-live="polite"><p>{searchResults.length} matching lessons</p>{searchResults.map(lesson => <button type="button" key={lesson.id} onClick={() => selectLesson(lesson.id)}><b>{getGrammarModuleForLesson(lesson.id)!.level} · {lesson.title}</b><span>{lesson.outcome}</span></button>)}</div>}
          <div className="grammar-level-switcher" aria-label="Choose a grammar level">
            {GRAMMAR_LEVELS.map((item) => <button key={item} type="button" className={level === item ? "is-active" : ""} onClick={() => selectLevel(item)}><b>{item}</b><span>{GRAMMAR_MODULES.filter(module => module.level === item).reduce((sum, module) => sum + module.lessons.length, 0)} lessons</span></button>)}
          </div>

          <div className="grammar-module-list">
            {levelModules.map((item) => (
              <article key={item.id} className="grammar-module-card">
                <header><span>{item.level} · Module {item.number}</span><h3>{item.title}</h3><p>{item.description}</p></header>
                <div>
                  {item.lessons.map((lesson) => {
                    const complete = progress.completed.includes(lesson.id);
                    const selected = lesson.id === selectedLessonId;
                    return (
                      <button key={lesson.id} type="button" className={`${selected ? "is-active" : ""}${complete ? " is-complete" : ""}`} disabled={!lesson.released} onClick={() => selectLesson(lesson.id)}>
                        <span>{lesson.released ? complete ? <CheckCircle2 /> : <Circle /> : <LockKeyhole />}</span>
                        <div><small>Lesson {String(lesson.number).padStart(2, "0")}</small><strong>{lesson.title}</strong><p>{lesson.outcome}</p></div>
                        {lesson.released && <ChevronRight />}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
          </div>
        </details>

        {content ? (
          <article className="grammar-lesson" id="lesson">
            <header className="grammar-lesson-heading">
              <div><Badge>{selectedModule.level} · Module {selectedModule.number}</Badge><span>Lesson {String(selectedLesson.number).padStart(2, "0")}</span></div>
              <h2>{selectedLesson.title}</h2>
              <p className="grammar-lesson-outcome">{selectedLesson.outcome}</p>

              {progress.completed.includes(selectedLessonId) && <Badge className="mastery-badge"><CheckCircle2 /> Completed · Best score {progress.scores[selectedLessonId] ?? 0}%</Badge>}
            </header>

            <LessonGuide key={`guide-${selectedLessonId}`} content={content} outcome={selectedLesson.outcome} />

            <PracticePanel key={selectedLessonId} lessonId={selectedLessonId} completedSets={progress.sets[selectedLessonId] ?? {}} onFinish={finishSet} />

            <LessonReference key={`reference-${selectedLessonId}`} content={content} />
            <nav className="grammar-help-links" aria-label="Grammar references"><Link href="/grammar/reference">Grammar reference</Link><Link href="/grammar/cheat-sheets">Case cheat sheets</Link></nav>

            {nextLesson && <button type="button" className="next-grammar-lesson" onClick={() => selectLesson(nextLesson.id)}><span>Next lesson</span><strong>{nextLesson.title}</strong><ArrowRight /></button>}
          </article>
        ) : (
          <aside className="grammar-release-note"><LockKeyhole /><h2>{level} lessons are in the roadmap.</h2><p>This level is released module by module after its explanations, examples, and exercise sets pass review.</p><Button variant="outline" onClick={() => selectLevel("A1")}><ArrowLeft /> Open the current module</Button></aside>
        )}
      </section>

      <footer><Link href="/" prefetch className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></Link><p>A1–C1 grammar through practice and feedback.</p><div><Link href="/stories" prefetch>Stories</Link><Link href="/vocabulary" prefetch>Vocabulary</Link><a href="#top">Back to top</a></div></footer>
    </main>
  );
}
