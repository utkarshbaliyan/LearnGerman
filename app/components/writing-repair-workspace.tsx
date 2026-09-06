"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WritingPhotoUpload } from "@/app/components/writing-photo-upload";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import type { WritingRecord, WritingAttempt } from "@/app/lib/writing-repair";

function HighlightedAnswer({ attempt }: { attempt: WritingAttempt }) {
  const issues = [...(attempt.feedback?.issues ?? [])].sort((a, b) => a.start - b.start);
  const parts = issues.map((issue, index) => {
    const before = attempt.answer.slice(index === 0 ? 0 : issues[index - 1].end, issue.start);
    return <span key={issue.start}>{before}<mark title={`${issue.kind === "style" ? "Optional style" : "Error"}: ${issue.category}`} className={issue.kind === "style" ? "writing-style-mark" : ""}>{issue.original}<sup> {index + 1}</sup></mark></span>;
  });
  return <p className="writing-source" lang="de">{parts}{attempt.answer.slice(issues.at(-1)?.end ?? 0)}</p>;
}

export function WritingRepairWorkspace({ taskId, prompt, suggestedWords }: { taskId: string; prompt: string; suggestedWords: number }) {
  const [record, setRecord] = useState<WritingRecord | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const generation = useRef(0);
  const owner = useRef<string | null>(null);
  const requestKey = useRef<{ answer: string; id: string } | null>(null);

  async function load(epoch = generation.current) {
    const response = await authenticatedFetch(`/api/tutor/writing?taskId=${encodeURIComponent(taskId)}`);
    const payload = await response.json() as WritingRecord & { error?: string };
    if (epoch !== generation.current) return;
    if (!response.ok) throw new Error(payload.error ?? "Saved writing could not be loaded.");
    setRecord(payload); setDraft(payload.session.draft); setError("");
  }
  useEffect(() => {
    let active = true;
    const generationRef = generation;
    let unsubscribe: (() => void) | undefined;
    void import("@/app/lib/supabase-client").then(({ supabase }) => {
      if (!active) return;
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;
      if (userId === owner.current) return;
      owner.current = userId;
      const epoch = ++generation.current;
      setRecord(null); setDraft(""); setError(""); setNotice(""); setBusy(false); requestKey.current = null;
      setSignedIn(Boolean(userId));
      if (userId) queueMicrotask(() => { if (active) void load(epoch).catch((e) => { if (active && epoch === generation.current) setError(e.message); }); });
    });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => { active = false; generationRef.current++; owner.current = null; unsubscribe?.(); };
    // A different chapter mounts a fresh workspace; auth changes invalidate all pending responses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  async function act(action: "draft" | "check" | "reveal" | "delete" | "confirm-photo" | "photo", attemptId?: string, photoInput?: { file?: File; requestId?: string; text?: string }) {
    if (busy || !record) return;
    const epoch = generation.current;
    setBusy(true); setError(""); setNotice("");
    if (action === "check" && requestKey.current?.answer !== draft) requestKey.current = { answer: draft, id: crypto.randomUUID() };
    try {
      let body: FormData | string;
      const headers: Record<string, string> = { "x-writing-owner": owner.current ?? "" };
      if (action === "photo" && photoInput?.file) {
        body = new FormData();
        body.set("photo", photoInput.file); body.set("taskId", taskId); body.set("version", String(record.version));
        body.set("requestId", photoInput.requestId ?? ""); body.set("consent", "true");
      } else {
        headers["content-type"] = "application/json";
        body = JSON.stringify({ action, taskId, version: record.version, answer: photoInput?.text ?? draft, attemptId, photoId: attemptId, requestId: requestKey.current?.id });
      }
      const response = await authenticatedFetch("/api/tutor/writing", { method: "POST", headers, body });
      const payload = await response.json() as WritingRecord & { error?: string };
      if (epoch !== generation.current) return;
      if (!response.ok) {
        if (payload.session) { setRecord(payload); requestKey.current = null; }
        throw new Error(payload.error ?? "Writing could not be saved.");
      }
      setRecord(payload);
      if (action === "delete") { setDraft(""); setConfirmDelete(false); }
      if (action === "confirm-photo") { setDraft(payload.session.draft); requestKey.current = null; }
      if (action === "check") requestKey.current = null;
      setNotice(action === "draft" ? "Draft saved to your account." : action === "delete" ? "Writing history deleted." : "Saved to your account.");
    } catch (e) { if (epoch === generation.current) setError(e instanceof Error ? e.message : "Please try again."); }
    finally { if (epoch === generation.current) setBusy(false); }
  }
  const attempts = record?.session.attempts ?? [];
  const latest = attempts.filter((a) => a.status === "complete").at(-1);
  const sortedIssues = [...(latest?.feedback?.issues ?? [])].sort((a, b) => a.start - b.start);
  return <div className="writing-workspace writing-repair">
    <p>{prompt}</p>
    <p className="writing-guidance">Aim for about {suggestedWords} words. Communicating your message matters more than length.</p>
    {!signedIn ? <p><Link href="/account">Sign in</Link> to save drafts and practise with feedback.</p> : <>
      {!record ? <p>Load your saved writing to begin.</p> : <>
        <WritingPhotoUpload photos={record.session.photos ?? []} busy={busy} hasDraft={Boolean(draft.trim())} onUpload={(file, requestId) => act("photo", undefined, { file, requestId })} onConfirm={(text, photoId) => act("confirm-photo", photoId, { text })} />
        <label><span>Your German message · {draft.trim() ? draft.trim().split(/\s+/).length : 0} words</span><Textarea lang="de" value={draft} maxLength={8000} disabled={busy} onChange={(event) => { setDraft(event.target.value); setNotice(""); requestKey.current = null; }} placeholder="Schreib deine Nachricht …" /></label>
        <div className="writing-repair-actions"><Button variant="outline" disabled={busy || draft === record.session.draft} onClick={() => void act("draft")}>Save draft</Button><Button disabled={busy || draft.trim().length < 10 || draft === latest?.answer} onClick={() => void act("check")}>{busy ? "Saving / checking…" : latest ? "Check my revision" : "Get a hint"}</Button></div>
        <p className="writing-guidance">Drafts save when you choose Save draft or submit. {draft !== record.session.draft ? "You have unsaved changes." : "Your draft is saved."} 20 AI requests per account per day, shared between photo reads and writing checks.</p>
        {latest && <section className="writing-repair-feedback" aria-label="Writing feedback">
          <h3>{latest.feedback?.taskSuccess ? "Task completed in practice" : "Your repair focus"}</h3>
          <p>{latest.feedback?.summary}</p>
          <HighlightedAnswer attempt={latest} />
          {sortedIssues.map((issue, index) => <article key={issue.start}><b>{index + 1}. {issue.category} · {issue.kind === "style" ? "Optional style suggestion" : "Error to repair"}</b><p>{issue.hint}</p>{latest.revealed && <div><p lang="de">{issue.original} → <strong>{issue.corrected}</strong></p><p>{issue.explanation}</p></div>}</article>)}
          {sortedIssues.length > 0 && !latest.revealed && <Button variant="outline" disabled={busy} onClick={() => void act("reveal", latest.id)}>Show correction</Button>}
          <p className="writing-guidance">{latest.revealed ? "Correction viewed. Later revisions are recorded as correction-assisted." : "Use the hints to rewrite your message above."} A revision of this task does not prove independent reuse.</p>
        </section>}
        {attempts.length > 0 && <details><summary>Saved attempts ({attempts.length})</summary>{[...attempts].reverse().map((attempt, i) => <article className="writing-attempt" key={attempt.id}><b>Attempt {attempts.length - i}{attempt.sourcePhotoId ? " · From confirmed photo" : ""} · {attempt.status === "complete" ? attempt.assistance === "independent" ? "Independent first attempt" : attempt.assistance === "hint" ? "Hint-assisted revision" : "Correction-assisted revision" : attempt.status === "pending" ? "Check pending" : "Check incomplete"}</b><p className="writing-source" lang="de">{attempt.answer}</p><small>{new Date(attempt.createdAt).toLocaleString()}{attempt.revealed ? " · Correction viewed" : ""}</small></article>)}</details>}
        <p className="ai-tutor-privacy">Submitted text is sent to our feedback provider. Drafts, attempts, hints and correction views are saved to your account until you delete this task’s history. This history records practice, not mastery. Transfer assessment is not available yet, so writing practice does not raise your course mastery score.</p>
        {confirmDelete ? <div><p>Delete all saved writing for this task? This cannot be undone.</p><Button variant="destructive" disabled={busy} onClick={() => void act("delete")}>Delete this task’s history</Button> <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button></div> : <Button variant="ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete saved writing</Button>}
      </>}
      <Button variant="ghost" disabled={busy} onClick={() => { setBusy(true); void load().catch((e) => setError(e.message)).finally(() => setBusy(false)); }}>Reload saved work</Button>
    </>}
    {error && <p className="chapter-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
  </div>;
}
