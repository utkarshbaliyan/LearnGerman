"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isVocabularyReview, vocabularyCardKey, vocabularyReviewDueAt, type VocabularyProgress } from "@/app/lib/progress-sync";
import { FLASHCARD_RATINGS, flashcardOptions, flashcardInterval, type FlashcardRating } from "@/app/lib/flashcard-scheduler";
import type { VocabularyWord } from "@/app/vocabulary/data";
import { buildVocabularyQuiz, startVocabularyQuiz, advanceVocabularyQuiz, type VocabularyQuizCursor } from "@/app/vocabulary/quiz";
import { vocabularyPracticeQueue } from "@/app/vocabulary/review-queue";

type Props = {
  words: VocabularyWord[];
  progress: VocabularyProgress;
  hydrated: boolean;
  setLearned: (word: VocabularyWord, learned: boolean) => void;
  recordGuess: (word: VocabularyWord, correct: boolean) => void;
  rateFlashcard: (word: VocabularyWord, rating: FlashcardRating) => void;
  pronounce: (word: VocabularyWord) => void;
};

export function VocabularyPractice({ words, progress, hydrated, setLearned, recordGuess, rateFlashcard, pronounce }: Props) {
  const [mode, setMode] = useState<"guess" | "flashcard">("guess");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [now, setNow] = useState(0);
  const [cursor, setCursor] = useState<VocabularyQuizCursor | null>(null);
  const [question, setQuestion] = useState<ReturnType<typeof buildVocabularyQuiz>>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastId, setLastId] = useState<string>();
  const [streak, setStreak] = useState(0);

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
  const options = question && finished ? flashcardOptions(progress.cards?.[vocabularyCardKey(question.word)], now) : null;

  function next() {
    setLastId(question?.word.id);
    setQuestion(null);
    setAnswer(null);
    setRevealed(false);
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

  function rate(rating: FlashcardRating) {
    if (!question || !finished) return;
    rateFlashcard(question.word, rating);
    next();
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
    <p className="practice-description">Due cards come first. Reveal the answer, then rate your recall. Again means forgotten; Hard means you remembered with difficulty. Review intervals adjust automatically.</p>
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
          {mode === "guess" && <><Button onClick={() => { setLearned(question.word, true); next(); }}>Mark learned</Button>
          <Button variant="outline" onClick={next}>Next word</Button></>}
        </div>
        {options && (mode === "flashcard" || needsReview) && <div className="practice-ratings" role="group" aria-label="Rate your recall">
          {FLASHCARD_RATINGS.map(({ rating, label, hint }) => <Button variant="outline" key={rating} title={hint} onClick={() => rate(rating)}>
            <span>{label}</span><small>{flashcardInterval(options[rating].card.due.getTime(), now)}</small>
          </Button>)}
        </div>}
      </div>}
    </div>}
  </section>;
}
