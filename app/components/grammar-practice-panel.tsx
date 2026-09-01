"use client";

import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { GrammarExercise } from "@/app/grammar/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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

export function GrammarPracticePanel({ exercises: allExercises, completedSets, onFinish }: {
  exercises: GrammarExercise[];
  completedSets: Record<string, number>;
  onFinish: (setName: string, score: number) => void;
}) {
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
    const score = gradedTotal === 0 ? 100 : Math.round((correctCount / gradedTotal) * 100);
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

        {exercise.type === "choice" && <div className="choice-grid">{exercise.options.map((option) => <button key={option} type="button" className={value === option ? "is-selected" : ""} disabled={submitted} onClick={() => setValue(option)}>{option}</button>)}</div>}

        {(exercise.type === "fill" || exercise.type === "correction" || exercise.type === "translation") && (
          <label className="answer-field">
            <span>{exercise.type === "fill" ? "Your answer" : exercise.type === "correction" ? "Correct sentence" : exercise.direction === "en-de" ? "German translation" : "English translation"}</span>
            <Input lang={exercise.type === "translation" && exercise.direction === "de-en" ? "en" : "de"} value={value} disabled={submitted} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && canSubmit && !submitted) checkAnswer(); }} placeholder={exercise.type === "fill" ? "Type the missing word" : exercise.type === "correction" ? "Rewrite the complete sentence" : "Type the complete translation"} />
          </label>
        )}

        {exercise.type === "order" && <div className="order-builder"><div className="order-answer">{ordered.length ? ordered.map((tokenIndex) => <button key={tokenIndex} type="button" disabled={submitted} onClick={() => setOrdered((items) => items.filter((item) => item !== tokenIndex))}>{exercise.tokens[tokenIndex]}</button>) : <span>Tap the words in the correct order.</span>}</div><div className="order-tokens">{exercise.tokens.map((token, tokenIndex) => <button key={`${token}-${tokenIndex}`} type="button" disabled={submitted || ordered.includes(tokenIndex)} onClick={() => setOrdered((items) => [...items, tokenIndex])}>{token}</button>)}</div></div>}

        {exercise.type === "production" && !submitted && <div className="production-note"><Lightbulb /><p>Say or write your own answer first. Then reveal the model and compare the grammar—not the personal details.</p></div>}

        {submitted && <div className={`exercise-feedback ${exercise.type === "production" || correct ? "is-correct" : "is-wrong"}`}>{exercise.type === "production" ? <BookOpenCheck /> : correct ? <CheckCircle2 /> : <TriangleAlert />}<div><strong>{exercise.type === "production" ? "Model answer" : correct ? "Correct" : "Not yet"}</strong>{exercise.type === "production" && <p lang="de">{exercise.model}</p>}{exercise.type !== "production" && !correct && <p>Correct answer: <b lang="de">{Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer}</b></p>}<p>{exercise.explanation}</p></div></div>}

        <div className="exercise-actions">{!submitted ? <Button onClick={checkAnswer} disabled={!canSubmit}>{exercise.type === "production" ? "Show model answer" : "Check answer"}<ArrowRight /></Button> : <Button onClick={next}>{index === exercises.length - 1 ? "Finish set" : "Next exercise"}<ArrowRight /></Button>}</div>
      </article>
    </section>
  );
}
