"use client";

import {
  ArrowLeft, ArrowRight, BookOpenCheck, Check, CheckCircle2, ChevronRight,
  Circle, GraduationCap, Lightbulb, LockKeyhole, RefreshCcw, Sparkles,
  Target, TriangleAlert, X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SiteHeader } from "@/app/components/site-header";
import {
  ALL_GRAMMAR_LESSONS, GRAMMAR_LEVELS, GRAMMAR_MODULES, LIVE_GRAMMAR_LESSONS,
  getGrammarModuleForLesson, type GrammarExercise, type GrammarLevel,
} from "@/app/grammar/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const STORAGE_KEY = "leselaut:grammar-progress:v1";

type GrammarProgress = {
  completed: string[];
  scores: Record<string, number>;
  sets: Record<string, Record<string, number>>;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("de").replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
}

function accepted(answer: string | string[], value: string) {
  const answers = Array.isArray(answer) ? answer : [answer];
  return answers.some((item) => normalize(item) === normalize(value));
}

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
  const allExercises = LIVE_GRAMMAR_LESSONS[lessonId].exercises;
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

  function currentValue() {
    if (exercise.type === "order") return ordered.map((tokenIndex) => exercise.tokens[tokenIndex]).join(" ").replace(/\s+([.!?])/g, "$1");
    return value;
  }

  function checkAnswer() {
    if (exercise.type === "production") {
      setSubmitted(true);
      return;
    }
    const isCorrect = accepted(exercise.answer, currentValue());
    setCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
  }

  function next() {
    if (index === exercises.length - 1) {
      const score = Math.round((correctCount / gradedTotal) * 100);
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
      <section className="grammar-practice" aria-label="Lesson practice">
        <div className="practice-heading">
          <div><span>Chapter practice</span><h2>Choose a focused practice set.</h2></div>
          <div><strong>{allExercises.length} tasks</strong><Progress value={(Object.keys(completedSets).length / groups.length) * 100} /></div>
        </div>
        <div className="practice-set-grid">
          {groups.map((group, groupIndex) => {
            const count = allExercises.filter((item) => (item.group ?? "Core practice") === group).length;
            const score = completedSets[group];
            return <button key={group} type="button" onClick={() => chooseSet(group)}><span>{String(groupIndex + 1).padStart(2, "0")}</span><div><strong>{group.replace(/^\d+ · /, "")}</strong><small>{count} exercises · {score === undefined ? "Not started" : `Best ${score}%`}</small></div>{score === undefined ? <ChevronRight /> : <CheckCircle2 />}</button>;
          })}
        </div>
      </section>
    );
  }

  if (finished) {
    const score = Math.round((correctCount / gradedTotal) * 100);
    return (
      <div className="practice-finish">
        <span><CheckCircle2 /></span>
        <p>Practice set complete</p>
        <strong>{score}%</strong>
        <h3>{score >= 80 ? "You reached mastery." : "Good first pass—review once more."}</h3>
        <p>{correctCount} of {gradedTotal} graded tasks were correct. Your best score is saved on this device.</p>
        <div className="practice-finish-actions"><Button onClick={restart} variant="outline"><RefreshCcw /> Practice again</Button><Button onClick={() => setActiveGroup(null)}>All practice sets</Button></div>
      </div>
    );
  }

  const canSubmit = exercise.type === "production" || currentValue().trim().length > 0;

  return (
    <section className="grammar-practice" aria-label="Lesson practice">
      <div className="practice-heading">
        <div><span>{activeGroup}</span><h2>Use the rule, don’t just recognize it.</h2></div>
        <div><strong>{index + 1}/{exercises.length}</strong><Progress value={(index / exercises.length) * 100} /></div>
      </div>

      <article className="exercise-card">
        <div className="exercise-meta"><ExerciseType exercise={exercise} /><span>{exercise.type === "production" ? "Self-check" : "Instant feedback"}</span></div>
        <h3>{exercise.prompt}</h3>

        {exercise.type === "choice" && (
          <div className="choice-grid">
            {exercise.options.map((option) => <button key={option} type="button" className={value === option ? "is-selected" : ""} disabled={submitted} onClick={() => setValue(option)}>{option}</button>)}
          </div>
        )}

        {(exercise.type === "fill" || exercise.type === "correction" || exercise.type === "translation") && (
          <label className="answer-field">
            <span>{exercise.type === "fill" ? "Your answer" : exercise.type === "correction" ? "Correct sentence" : exercise.direction === "en-de" ? "German translation" : "English translation"}</span>
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
          <div className={`exercise-feedback ${exercise.type === "production" || correct ? "is-correct" : "is-wrong"}`}>
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<GrammarProgress>;
        setProgress({ completed: stored.completed ?? [], scores: stored.scores ?? {}, sets: stored.sets ?? {} });
      } catch { /* Ignore damaged local data. */ }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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

  function selectLevel(next: GrammarLevel) {
    setLevel(next);
    const firstLive = GRAMMAR_MODULES.filter((item) => item.level === next).flatMap((item) => item.lessons).find((lesson) => lesson.released);
    setSelectedLessonId(firstLive?.id ?? "");
  }

  function selectLesson(id: string) {
    if (!LIVE_GRAMMAR_LESSONS[id]) return;
    setSelectedLessonId(id);
    document.getElementById("lesson")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function finishSet(setName: string, score: number) {
    setProgress((current) => {
      const previousSets = current.sets[selectedLessonId] ?? {};
      const lessonSets = { ...previousSets, [setName]: Math.max(previousSets[setName] ?? 0, score) };
      const requiredSets = new Set(LIVE_GRAMMAR_LESSONS[selectedLessonId].exercises.map((exercise) => exercise.group ?? "Core practice"));
      const chapterComplete = [...requiredSets].every((name) => lessonSets[name] !== undefined);
      const average = Math.round(Object.values(lessonSets).reduce((sum, value) => sum + value, 0) / Object.values(lessonSets).length);
      return {
        completed: chapterComplete && !current.completed.includes(selectedLessonId) ? [...current.completed, selectedLessonId] : current.completed,
        scores: { ...current.scores, [selectedLessonId]: average },
        sets: { ...current.sets, [selectedLessonId]: lessonSets },
      };
    });
  }

  const overallRoadmap = Math.round((progress.completed.length / ALL_GRAMMAR_LESSONS.length) * 100);
  const liveProgress = Math.round((completedLive / liveLessons.length) * 100);

  return (
    <main className="site-shell grammar-page" id="top">
      <SiteHeader active="grammar" />

      <section className="grammar-hero">
        <div>
          <Badge className="eyebrow"><Sparkles /> A1–B1 · Grammar course</Badge>
          <h1>Understand the rule.<br /><em>Use it with confidence.</em></h1>
          <p>A complete 72-lesson roadmap from first sentences to connected B1 German. Every lesson follows the same learning loop: notice, understand, build, correct, produce, and review.</p>
          <div className="grammar-hero-actions"><Button onClick={() => document.getElementById("lesson")?.scrollIntoView({ behavior: "smooth" })}>Continue learning <ArrowRight /></Button><a href="#roadmap">View the full roadmap</a></div>
        </div>
        <aside className="grammar-progress-card">
          <span>Your grammar course</span>
          <div className="grammar-score"><strong>{liveProgress}%</strong><small>current release</small></div>
          <Progress value={liveProgress} />
          <p>{completedLive} of {liveLessons.length} available lessons completed.</p>
          <div className="grammar-progress-meta"><span><b>72</b> total lessons</span><span><b>{overallRoadmap}%</b> full path</span></div>
        </aside>
      </section>

      <section className="grammar-method">
        <div><Target /><strong>Understand</strong><span>Plain-English rules and visual patterns</span></div>
        <div><BookOpenCheck /><strong>Notice</strong><span>German examples with useful contrasts</span></div>
        <div><TriangleAlert /><strong>Correct</strong><span>Common mistakes explained clearly</span></div>
        <div><GraduationCap /><strong>Produce</strong><span>Guided output and cumulative review</span></div>
      </section>

      <section className="grammar-course" id="roadmap">
        <div className="grammar-roadmap">
          <div className="grammar-roadmap-heading"><span>Course roadmap</span><h2>From your first sentence to B1 precision.</h2><p>The entire syllabus is mapped now. Lessons become available module by module so each explanation and exercise set receives the same depth.</p></div>
          <div className="grammar-level-switcher" aria-label="Choose a grammar level">
            {GRAMMAR_LEVELS.map((item) => <button key={item} type="button" className={level === item ? "is-active" : ""} onClick={() => selectLevel(item)}><b>{item}</b><span>24 lessons</span></button>)}
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

        {content ? (
          <article className="grammar-lesson" id="lesson">
            <header className="grammar-lesson-heading">
              <div><Badge>{selectedModule.level} · Module {selectedModule.number}</Badge><span>Lesson {String(selectedLesson.number).padStart(2, "0")}</span></div>
              <h2>{selectedLesson.title}</h2>
              <p>{content.lead}</p>
              {progress.completed.includes(selectedLessonId) && <Badge className="mastery-badge"><CheckCircle2 /> Completed · Best score {progress.scores[selectedLessonId] ?? 0}%</Badge>}
            </header>

            <div className="grammar-pattern"><span>The pattern</span><strong lang="de">{content.pattern}</strong></div>

            <section className="grammar-explanation">
              <span className="grammar-section-label">How it works</span>
              {content.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            {content.tables?.map((table) => <section className="grammar-reference-table" key={table.title}><span className="grammar-section-label">Reference table</span><h3>{table.title}</h3>{table.caption && <p>{table.caption}</p>}<div><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} lang={cellIndex > 0 ? "de" : undefined}>{cell}</td>)}</tr>)}</tbody></table></div></section>)}

            {content.sections?.map((section) => <section className="grammar-deep-dive" key={section.title}><span className="grammar-section-label">Deep explanation</span><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.examples && <div>{section.examples.map((example) => <article key={example.german}><strong lang="de">{example.german}</strong><span>{example.english}</span></article>)}</div>}</section>)}

            <section className="grammar-examples">
              <span className="grammar-section-label">Examples in context</span>
              <div>{content.examples.map((example) => <article key={example.german}><strong lang="de">{example.german}</strong><p>{example.english}</p>{example.note && <small>{example.note}</small>}</article>)}</div>
            </section>

            <section className="grammar-mistakes">
              <span className="grammar-section-label">Common mistakes</span>
              {content.mistakes.map((mistake) => <article key={mistake.wrong}><div><span><X /> Not this</span><del lang="de">{mistake.wrong}</del></div><ArrowRight /><div><span><Check /> Use this</span><strong lang="de">{mistake.right}</strong></div><p>{mistake.why}</p></article>)}
            </section>

            <aside className="grammar-memory-tip"><Lightbulb /><div><span>Memory hook</span><p>{content.memoryTip}</p></div></aside>

            <PracticePanel key={selectedLessonId} lessonId={selectedLessonId} completedSets={progress.sets[selectedLessonId] ?? {}} onFinish={finishSet} />

            {nextLesson && <button type="button" className="next-grammar-lesson" onClick={() => selectLesson(nextLesson.id)}><span>Next lesson</span><strong>{nextLesson.title}</strong><ArrowRight /></button>}
          </article>
        ) : (
          <aside className="grammar-release-note"><LockKeyhole /><h2>{level} lessons are in the roadmap.</h2><p>This level is being released module by module after its explanations, examples, mistakes, and exercise sets pass review.</p><Button variant="outline" onClick={() => selectLevel("A1")}><ArrowLeft /> Open the current module</Button></aside>
        )}
      </section>

      <footer><Link href="/" prefetch className="brand footer-brand"><span className="brand-mark">ä</span><span><strong>LeseLaut</strong><small>German through stories</small></span></Link><p>A structured A1–B1 grammar course with explanations, practice, and saved mastery.</p><div><Link href="/" prefetch>Stories</Link><Link href="/vocabulary" prefetch>Vocabulary</Link><a href="#top">Back to top</a></div></footer>
    </main>
  );
}
