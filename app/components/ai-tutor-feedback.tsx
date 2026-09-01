"use client";

import { Check, CheckCircle2, GraduationCap, RotateCcw, Sparkles } from "lucide-react";

import type { TutorFeedback } from "@/app/lib/ai-tutor-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AiTutorFeedback({ feedback, mode, onRetry }: { feedback: TutorFeedback; mode: "writing" | "speaking"; onRetry?: () => void }) {
  return (
    <section className={`ai-tutor-feedback${feedback.mastery ? " is-mastered" : ""}`} aria-live="polite">
      <header>
        <div><Sparkles /><span><b>AI tutor feedback</b><small>{mode === "speaking" ? "German transcript review" : "Detailed writing review"}</small></span></div>
        <div className="ai-tutor-score"><strong>{feedback.overallScore}%</strong><Badge variant={feedback.mastery ? "default" : "outline"}>{feedback.mastery ? "Mastered" : "Revise and retry"}</Badge></div>
      </header>
      <p className="ai-tutor-summary">{feedback.summary}</p>
      {feedback.transcript && <div className="ai-tutor-transcript"><span>What the tutor heard</span><p lang="de">{feedback.transcript}</p><small>Speaking feedback is based on the transcript, so it assesses language use rather than accent or pronunciation.</small></div>}
      {feedback.strengths.length > 0 && <div className="ai-tutor-strengths"><span>What worked</span>{feedback.strengths.map((strength) => <p key={strength}><CheckCircle2 />{strength}</p>)}</div>}
      <div className="ai-tutor-corrected"><span>Corrected answer</span><p lang="de">{feedback.correctedAnswer}</p></div>
      {feedback.corrections.length > 0 && <div className="ai-tutor-corrections"><span>Mistakes explained</span>{feedback.corrections.map((correction, index) => <article key={`${correction.original}-${index}`}><div><Badge variant="outline">{correction.category}</Badge><span>{String(index + 1).padStart(2, "0")}</span></div><p><del lang="de">{correction.original}</del><Check /><ins lang="de">{correction.corrected}</ins></p><small>{correction.explanation}</small></article>)}</div>}
      <footer><GraduationCap /><div><span>Next improvement</span><p>{feedback.nextStep}</p><small>{feedback.retryPrompt}</small></div>{onRetry && <Button variant="outline" onClick={onRetry}><RotateCcw /> Try an improved answer</Button>}</footer>
    </section>
  );
}
