"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { recoveryKey, readRecovery, acknowledgeDraft } from "@/app/lib/writing-draft-recovery";
import { Button } from "@/components/ui/button";
import { TutorRepairFeedback } from "@/app/components/tutor-repair-feedback";
import { TutorMemoryPanel } from "@/app/components/tutor-memory-panel";
import { WritingPhotoUpload } from "@/app/components/writing-photo-upload";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import type { WritingRecord } from "@/app/lib/writing-repair";

export function WritingRepairWorkspace({ taskId, prompt, suggestedWords }: { taskId: string; prompt: string; suggestedWords: number }) {
  const [record, setRecord] = useState<WritingRecord | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [connection, setConnection] = useState(0);
  const lock = useRef(false);
  const currentDraft = useRef("");
  function cacheDraft(text: string, version: number) {
    if (!owner.current) return;
    try { localStorage.setItem(recoveryKey(owner.current ?? "", taskId), JSON.stringify({ text, version })); }
    catch { setNotice("Browser recovery is unavailable. Keep this tab open until your draft saves."); }
  }
  function clearCache() {
    try { localStorage.removeItem(recoveryKey(owner.current ?? "", taskId)); } catch { /* Storage may be disabled. */ }
  }
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
    setRecord(payload); setDraft(payload.session.draft); currentDraft.current = payload.session.draft; setError(""); setConflict(false);
    try {
      setRecovery(readRecovery(localStorage, owner.current ?? "", taskId, payload.session.draft));
    } catch { setRecovery(null); }
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
      setRecord(null); setDraft(""); setError(""); setNotice(""); setBusy(false); setAutoSaving(false); setRecovery(null); setConflict(false); lock.current = false; currentDraft.current = ""; requestKey.current = null;
      setSignedIn(Boolean(userId));
      if (userId) queueMicrotask(() => { if (active) void load(epoch).catch((e) => { if (active && epoch === generation.current) setError(e.message); }); });
    });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => { active = false; generationRef.current++; owner.current = null; unsubscribe?.(); };
    // A different chapter mounts a fresh workspace; auth changes invalidate all pending responses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  async function act(action: "draft" | "check" | "reveal" | "delete" | "confirm-photo" | "photo" | "help" | "dispute", attemptId?: string, photoInput?: { file?: File; requestId?: string; text?: string; level?: number; start?: number; reason?: string; note?: string }, automatic = false) {
    if (lock.current || !record || conflict || recovery !== null) return;
    lock.current = true;
    const epoch = generation.current;
    if (automatic) setAutoSaving(true); else setBusy(true);
    setError(""); setNotice("");
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
        body = JSON.stringify({ ...photoInput, action, taskId, version: record.version, answer: photoInput?.text ?? draft, attemptId, photoId: attemptId, requestId: requestKey.current?.id });
      }
      const response = await authenticatedFetch("/api/tutor/writing", { method: "POST", headers, body });
      const payload = await response.json() as WritingRecord & { error?: string };
      if (epoch !== generation.current) return;
      if (!response.ok) {
        if (response.status === 409) setConflict(true);
        if (payload.session) { setRecord(payload); requestKey.current = null; }
        throw new Error(payload.error ?? "Writing could not be saved.");
      }
      setRecord(payload);
      if (action === "draft" || action === "check") {
        try { acknowledgeDraft(localStorage, owner.current ?? "", taskId, draft, currentDraft.current, payload.version); } catch { /* The account save succeeded even if browser storage is unavailable. */ }
      }
      window.dispatchEvent(new Event("leselaut-tutor-updated"));
      if (action === "delete") { setDraft(""); currentDraft.current = ""; clearCache(); setConfirmDelete(false); }
      if (action === "confirm-photo") { setDraft(payload.session.draft); currentDraft.current = payload.session.draft; clearCache(); requestKey.current = null; }
      if (action === "check") requestKey.current = null;
      setNotice(action === "draft" ? "Draft saved to your account." : action === "delete" ? "Writing history deleted." : "Saved to your account.");
    } catch (e) { if (epoch === generation.current) setError(e instanceof Error ? e.message : "Please try again."); }
    finally { if (epoch === generation.current) { lock.current = false; setBusy(false); setAutoSaving(false); } }
  }
  useEffect(() => {
    if (!record || busy || autoSaving || error || conflict || recovery !== null || draft === record.session.draft) return;
    const timer = setTimeout(() => { if (navigator.onLine) void act("draft", undefined, undefined, true); }, 1200);
    return () => clearTimeout(timer);
    // Save the exact draft/version captured by this timer; changes cancel and reschedule it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, record, busy, autoSaving, error, conflict, recovery, connection]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (record && currentDraft.current !== record.session.draft) { event.preventDefault(); event.returnValue = ""; } };
    const reconnect = () => { setError(""); setConnection((value) => value + 1); };
    window.addEventListener("beforeunload", warn); window.addEventListener("online", reconnect);
    return () => { window.removeEventListener("beforeunload", warn); window.removeEventListener("online", reconnect); };
  }, [record]);
  const attempts = record?.session.attempts ?? [];
  const latest = attempts.filter((a) => a.status === "complete").at(-1);
  return <div className="writing-workspace writing-repair">
    <p>{prompt}</p>
    <p className="writing-guidance">Aim for about {suggestedWords} words. Communicating your message matters more than length.</p>
    {!signedIn ? <p><Link href="/account">Sign in</Link> to save drafts and practise with feedback.</p> : <>
      {!record ? <p>Load your saved writing to begin.</p> : <>
        {recovery !== null && <div role="status"><p>This browser has an unsent draft. Compare it with the saved version below before continuing.</p><pre className="writing-source">{recovery}</pre><Button onClick={() => { setDraft(recovery); currentDraft.current = recovery; cacheDraft(recovery, record.version); setRecovery(null); }}>Use recovered draft</Button> <Button variant="outline" onClick={() => { clearCache(); setRecovery(null); }}>Keep account version</Button></div>}
        <TutorMemoryPanel level={taskId.includes("a1") ? "A1" : taskId.includes("b1") ? "B1" : "A2"} />
        <WritingPhotoUpload photos={record.session.photos ?? []} busy={busy || autoSaving || conflict || recovery !== null} hasDraft={Boolean(draft.trim())} onUpload={(file, requestId) => act("photo", undefined, { file, requestId })} onConfirm={(text, photoId) => act("confirm-photo", photoId, { text })} />
        <label><span>Your German message · {draft.trim() ? draft.trim().split(/\s+/).length : 0} words</span><Textarea lang="de" value={draft} maxLength={8000} disabled={busy || recovery !== null} onChange={(event) => { setDraft(event.target.value); currentDraft.current = event.target.value; cacheDraft(event.target.value, record.version); setNotice(""); requestKey.current = null; }} placeholder="Schreib deine Nachricht …" /></label>
        <div className="writing-repair-actions"><Button variant="outline" disabled={busy || autoSaving || conflict || recovery !== null || draft === record.session.draft} onClick={() => void act("draft")}>Save draft</Button><Button disabled={busy || autoSaving || conflict || recovery !== null || draft.trim().length < 10 || draft === latest?.answer} onClick={() => void act("check")}>{busy ? "Saving / checking…" : latest ? "Check my revision" : "Get a hint"}</Button></div>
        <p className="writing-guidance">Drafts autosave after you pause typing. Unsent text is kept in this browser under your account for recovery. {autoSaving ? "Saving…" : draft !== record.session.draft ? "You have unsaved changes." : "Your draft is saved."} 20 AI requests per account per day, shared between writing, photo reads and speaking. Draft saves are free.</p>
        {latest && <TutorRepairFeedback attempt={latest} busy={busy || autoSaving || conflict || recovery !== null} onReveal={() => void act("reveal", latest.id)} onAction={(input) => void act(input.action, latest.id, input)} />}
        {attempts.length > 0 && <details><summary>Saved attempts ({attempts.length})</summary>{[...attempts].reverse().map((attempt, i) => <article className="writing-attempt" key={attempt.id}><b>Attempt {attempts.length - i}{attempt.sourcePhotoId ? " · From confirmed photo" : ""} · {attempt.status === "complete" ? attempt.assistance === "independent" ? "Independent first attempt" : attempt.assistance === "hint" ? "Hint-assisted revision" : "Correction-assisted revision" : attempt.status === "pending" ? "Check pending" : "Check incomplete"}</b><p className="writing-source" lang="de">{attempt.answer}</p><small>{new Date(attempt.createdAt).toLocaleString()}{attempt.revealed ? " · Correction viewed" : ""}</small></article>)}</details>}
        <p className="ai-tutor-privacy">Submitted text is sent to our feedback provider. Drafts, attempts, hints and correction views are saved to your account until you delete this task’s history. This history records practice, not mastery. Delayed independent reuse is recorded in your learning profile; practice does not raise the old course mastery score.</p>
        {confirmDelete ? <div><p>Delete all saved writing for this task? This cannot be undone.</p><Button variant="destructive" disabled={busy || autoSaving} onClick={() => void act("delete")}>Delete this task’s history</Button> <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button></div> : <Button variant="ghost" disabled={busy || autoSaving} onClick={() => setConfirmDelete(true)}>Delete saved writing</Button>}
      </>}
      {conflict && <p role="alert">Another save changed this task. Reload to compare your unsent draft with the account version before continuing.</p>}
      <Button variant="ghost" disabled={busy || autoSaving} onClick={() => { setBusy(true); void load().catch((e) => setError(e.message)).finally(() => setBusy(false)); }}>Reload saved work</Button>
    </>}
    {error && <p className="chapter-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
  </div>;
}
