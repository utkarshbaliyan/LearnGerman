"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { WritingAttempt } from "@/app/lib/writing-repair";

export type FeedbackAction = { action: "help"; level: 1 | 2 } | { action: "dispute"; start: number; reason: "incorrect" | "meaning"; note: string };
export function HighlightedAnswer({ attempt }: { attempt: WritingAttempt }) {
  const issues = [...(attempt.feedback?.issues ?? [])].sort((a, b) => a.start - b.start);
  return <p className="writing-source" lang="de">{issues.map((issue, index) => <span key={issue.start}>{attempt.answer.slice(index === 0 ? 0 : issues[index - 1].end, issue.start)}<mark className={issue.kind === "style" ? "writing-style-mark" : ""}>{issue.original}<sup> {index + 1}</sup></mark></span>)}{attempt.answer.slice(issues.at(-1)?.end ?? 0)}</p>;
}
function ChallengeCorrection({ start, busy, onAction }: { start: number; busy: boolean; onAction: (action: FeedbackAction) => void }) {
  const [open, setOpen] = useState(false), [note, setNote] = useState("");
  const [reason, setReason] = useState<"incorrect" | "meaning">("incorrect");
  if (!open) return <Button variant="ghost" disabled={busy} onClick={() => setOpen(true)}>Question this feedback</Button>;
  return <div className="feedback-challenge"><p>Why are you questioning this correction?</p><div className="writing-repair-actions"><Button variant={reason === "incorrect" ? "default" : "outline"} onClick={() => setReason("incorrect")} aria-pressed={reason === "incorrect"}>It looks incorrect</Button><Button variant={reason === "meaning" ? "default" : "outline"} onClick={() => setReason("meaning")} aria-pressed={reason === "meaning"}>It changes my meaning</Button></div><label><span>{reason === "meaning" ? "What did you mean?" : "Additional explanation (optional)"}</span><Textarea value={note} maxLength={1000} onChange={(event) => setNote(event.target.value)} /></label><Button disabled={busy || reason === "meaning" && note.trim().length < 3} onClick={() => onAction({ action: "dispute", start, reason, note })}>Save my concern</Button> <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>;
}
export function TutorRepairFeedback({ attempt, busy, onReveal, onAction, compact = false }: { attempt: WritingAttempt; compact?: boolean; busy: boolean; onReveal: () => void; onAction: (action: FeedbackAction) => void }) {
  const issues = [...(attempt.feedback?.issues ?? [])].sort((a, b) => a.start - b.start);
  if (compact) {
    let corrected = attempt.answer;
    for (const issue of [...issues].reverse()) if (attempt.revealed) corrected = corrected.slice(0, issue.start) + issue.corrected + corrected.slice(issue.end);
    return <section className="writing-repair-feedback" aria-label="Writing feedback"><h3>{attempt.feedback?.taskSuccess ? "Your message works" : "Your feedback"}</h3>
      {attempt.feedback?.needsReview && <p>Some feedback was uncertain. Try again if the correction does not match your meaning.</p>}
      {issues.length ? <><HighlightedAnswer attempt={attempt}/>{issues.map(issue => <article key={issue.start}><p lang="de">{issue.original} → <strong>{issue.corrected}</strong></p><p>{issue.explanation || issue.hint}</p>{issue.kind === "style" && <small>Optional style suggestion</small>}</article>)}<details><summary>See your message with these corrections</summary><p className="writing-source" lang="de">{corrected}</p><p>These are the focused corrections from this check. Try using them in your own revision.</p></details><details><summary>More help or question a correction</summary>{issues.map(issue => <div key={issue.start}><p>{issue.hint}</p>{attempt.disputes?.some(item => item.start === issue.start) ? <p>Concern saved.</p> : <ChallengeCorrection start={issue.start} busy={busy} onAction={onAction}/>}</div>)}</details></> : <p>{attempt.feedback?.taskSuccess ? "No changes needed in this check. You can continue." : "Try answering the task more directly. Use the example above if you need a starting point."}</p>}
    </section>;
  }
  return <section className="writing-repair-feedback" aria-label="Language feedback"><h3>{attempt.feedback?.taskSuccess && !attempt.disputes?.length ? "Message understood" : "Try this small change"}</h3><p>{attempt.feedback?.summary}</p><HighlightedAnswer attempt={attempt} />
    {issues.map((issue, index) => <article key={issue.start}><b>{index + 1}. {issue.category} · {issue.kind === "style" ? "Optional style suggestion" : "Error to repair"}</b><p>{issue.hint}</p>{issue.guidingQuestion && <p><b>Think about:</b> {issue.guidingQuestion}</p>}{issue.partialExample && <p><b>Example with different content:</b> <span lang="de">{issue.partialExample}</span></p>}{attempt.revealed && <div><p lang="de">{issue.original} → <strong>{issue.corrected}</strong></p><p>{issue.explanation}</p></div>}
      {attempt.disputes?.some((item) => item.start === issue.start) ? <p role="status">Concern saved. This correction will not count towards your practice record.</p> : <ChallengeCorrection key={`${attempt.id}:${issue.start}`} start={issue.start} busy={busy} onAction={onAction} />}
    </article>)}
    {issues.length > 0 && !attempt.revealed && <div className="writing-repair-actions">{(attempt.helpLevel ?? 0) < 1 && <Button variant="outline" disabled={busy} onClick={() => onAction({ action: "help", level: 1 })}>Give me a guiding question</Button>}{(attempt.helpLevel ?? 0) >= 1 && (attempt.helpLevel ?? 0) < 2 && <Button variant="outline" disabled={busy} onClick={() => onAction({ action: "help", level: 2 })}>Show a partial example</Button>}<Button variant="outline" disabled={busy} onClick={onReveal}>Show correction</Button></div>}

  </section>;
}
