"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isVocabularyReview, vocabularyReviewDueAt, type VocabularyProgress } from "@/app/lib/progress-sync";
import type { VocabularyWord } from "@/app/vocabulary/data";
import { buildVocabularyQuiz, startVocabularyQuiz, advanceVocabularyQuiz, type VocabularyQuizCursor } from "@/app/vocabulary/quiz";
import { vocabularyPracticeQueue } from "@/app/vocabulary/review-queue";

type Props = {
  words: VocabularyWord[];
  progress: VocabularyProgress;
  hydrated: boolean;
  setLearned: (word: VocabularyWord, learned: boolean) => void;
  recordGuess: (word: VocabularyWord, correct: boolean) => void;
  scheduleReview: (word: VocabularyWord, minutes: number) => void;
  pronounce: (word: VocabularyWord) => void;
};

export function VocabularyPractice({ words, progress, hydrated, setLearned, recordGuess, scheduleReview, pronounce }: Props) {
  const [mode, setMode] = useState<"guess" | "flashcard">("guess");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [now, setNow] = useState(0);
  const [cursor, setCursor] = useState<VocabularyQuizCursor | null>(null);
  const [question, setQuestion] = useState<ReturnType<typeof buildVocabularyQuiz>>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastId, setLastId] = useState<string>();
  const [streak, setStreak] = useState(0);
  const [custom, setCustom] = useState("2");
  const [unit, setUnit] = useState("days");
  const [scheduled, setScheduled] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setNow(Date.now());
      setCursor(startVocabularyQuiz(localStorage, () => crypto.getRandomValues(new Uint32Array(1))[0]));
    });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { cancelAnimationFrame(frame); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!hydrated || !cursor || !now || question) return;
    const queue = vocabularyPracticeQueue(words, progress, now, reviewOnly, lastId);
    if (!queue.length) return;
    const target = queue[(cursor.seed + cursor.round) % queue.length];
    const frame = requestAnimationFrame(() => setQuestion(buildVocabularyQuiz(words, cursor, target)));
    return () => cancelAnimationFrame(frame);
  }, [cursor, hydrated, lastId, now, progress, question, reviewOnly, words]);

  const reviews = words.filter((word) => isVocabularyReview(progress, word));
  const due = reviews.filter((word) => vocabularyReviewDueAt(progress, word) <= now);
  const nextDue = Math.min(...reviews.map((word) => vocabularyReviewDueAt(progress, word)).filter((time) => time > now));
  const finished = Boolean(answer) || revealed;
  const needsReview = question && isVocabularyReview(progress, question.word);

  function next() {
    setLastId(question?.word.id);
    setQuestion(null);
    setAnswer(null);
    setRevealed(false);
    setScheduled(null);
    setNow(Date.now());
    setCursor((current) => current ? advanceVocabularyQuiz(localStorage, current) : current);
  }

  function guess(german: string) {
    if (!question || answer) return;
    setAnswer(german);
    recordGuess(question.word, german === question.word.german);
    if (german === question.word.german) {
      setStreak((value) => value + 1);
    } else {
      setStreak(0);
    }
  }

  function postpone(minutes: number, label: string) {
    if (!question || !Number.isFinite(minutes) || minutes < 1 || minutes > 525600) return;
    scheduleReview(question.word, minutes);
    next();
    setScheduled(`Repeats in ${label}.`);
  }

  return <section className="vocabulary-practice" aria-label="Vocabulary practice">
    <div className="practice-controls">
      <div role="group" aria-label="Practice mode">
        <Button variant={mode === "guess" ? "default" : "outline"} onClick={() => { setMode("guess"); next(); }}>Quick guess</Button>
        <Button variant={mode === "flashcard" ? "default" : "outline"} onClick={() => { setMode("flashcard"); setReviewOnly(true); next(); }}>Review flashcards</Button>
      </div>
      <label><input type="checkbox" checked={reviewOnly} onChange={(event) => { setReviewOnly(event.target.checked); next(); }} /> Review only</label>
      <span>{due.length} due · {reviews.length} in review</span>
    </div>
    <p className="practice-description">Due review words come first. Choose when to repeat them, or mark them learned to finish.</p>
    {!hydrated || !cursor ? <p role="status">Loading your progress…</p> : !question ? <div className="practice-empty" role="status">
      <strong>{reviews.length ? "All scheduled reviews are caught up." : reviewOnly ? "Your review deck is empty." : "You’ve learned every word in this selection."}</strong>
      {Number.isFinite(nextDue) && <p>Next review: {new Date(nextDue).toLocaleString()}.</p>}
      <p>Mark any word Review to add it to this deck.</p>
    </div> : <div className="vocabulary-quiz">
      <div className="vocabulary-quiz-heading">
        <span>{needsReview ? "Review" : "Practice"} · {question.word.level} · {mode === "guess" ? `${streak} correct in a row` : "Recall before revealing"}</span>
        <h2>What is <strong lang="en">{question.word.english}</strong> in German?</h2>
      </div>
      {mode === "guess" ? <div className="vocabulary-quiz-answers" role="group" aria-label="Choose the German answer">
        {question.choices.map((choice) => <button key={choice.id} lang="de" disabled={Boolean(answer)}
          className={answer ? choice.german === question.word.german ? "is-correct" : choice.german === answer ? "is-wrong" : "" : ""}
          onClick={() => guess(choice.german)}>{choice.german}</button>)}
      </div> : <div className="practice-flashcard">
        {revealed ? <strong lang="de">{question.word.german}</strong> : <Button onClick={() => setRevealed(true)}>Show answer</Button>}
      </div>}
      {finished && <div className="practice-feedback">
        <p role="status">{mode === "flashcard" ? question.word.german : answer === question.word.german
          ? needsReview ? "Correct. Still in review until you mark it learned." : "Correct. Added to learned."
          : `The answer is ${question.word.german}. Added to review.`}</p>
        <div className="practice-actions">
          <Button variant="outline" onClick={() => pronounce(question.word)}><Volume2 /> Listen</Button>
          <Button onClick={() => { setLearned(question.word, true); next(); }}>Mark learned</Button>
          <Button variant="outline" onClick={next}>Next word</Button>
        </div>
        <div className="practice-schedule">
          <span>Repeat in</span>
          {[[1, "1 min"], [10, "10 min"], [1440, "1 day"], [4320, "3 days"], [10080, "7 days"]].map(([minutes, label]) =>
            <Button variant="outline" key={minutes} onClick={() => postpone(Number(minutes), String(label))}>{label}</Button>)}
          <form onSubmit={(event) => { event.preventDefault(); postpone(Number(custom) * (unit === "days" ? 1440 : unit === "hours" ? 60 : 1), `${custom} ${unit}`); }}>
            <Input aria-label="Custom review interval" type="number" min="1" max={unit === "days" ? 365 : unit === "hours" ? 8760 : 525600} step="1" value={custom} onChange={(event) => setCustom(event.target.value)} required />
            <select aria-label="Review interval unit" value={unit} onChange={(event) => setUnit(event.target.value)}><option value="minutes">minutes</option><option value="hours">hours</option><option value="days">days</option></select>
            <Button variant="outline" type="submit">Schedule</Button>
          </form>
        </div>
      </div>}
    </div>}
    {scheduled && <p role="status">{scheduled}</p>}
  </section>;
}
