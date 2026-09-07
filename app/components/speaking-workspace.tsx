"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MAX_SPEAKING_AUDIO_BYTES, speakingAudioFile, speakingAudioProblem } from "@/app/lib/speaking-audio";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import type { WritingRecord } from "@/app/lib/writing-repair";
import type { SpeakingMission } from "@/app/lib/speaking-missions";
import { getChapterOutputTask } from "@/app/lib/chapter-output-tasks";


type SpeakingRecord = WritingRecord & { mission: SpeakingMission; error?: string };
export function SpeakingWorkspace({ taskId }: { taskId: string }) {
  const [record, setRecord] = useState<SpeakingRecord | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const owner = useRef<string | null>(null), epoch = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null), stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null), url = useRef("");
  const key = useRef<{ signature: string; id: string } | null>(null);
  const lock = useRef(false);
  const micPending = useRef(false);
  function stopMedia() {
    if (timer.current) clearTimeout(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null;
  }
  async function load(generation = epoch.current) {
    const response = await authenticatedFetch(`/api/tutor/speaking/drill?taskId=${encodeURIComponent(taskId)}`);
    const payload = await response.json() as SpeakingRecord;
    if (generation !== epoch.current) return;
    if (!response.ok) throw new Error(payload.error ?? "Speaking practice could not be loaded.");
    setRecord(payload); setQuestionIndex(payload.session.attempts.at(-1)?.questionIndex ?? 0); setTranscript(payload.session.attempts.at(-1)?.answer ?? ""); setError("");
  }
  useEffect(() => {
    let active = true; const generationRef = epoch;
    let unsubscribe: (() => void) | undefined;
    void import("@/app/lib/supabase-client").then(({ supabase }) => {
      if (!active) return;
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const id = session?.user.id ?? null;
        if (id === owner.current) return;
        const generation = ++epoch.current; owner.current = id;
        stopMedia(); if (url.current) URL.revokeObjectURL(url.current); url.current = "";
        setRecord(null); setAudio(null); setAudioUrl(""); setTranscript("");  setRecording(false); setQuestionIndex(0); setError(""); setBusy(false); lock.current = false; key.current = null; setSignedIn(Boolean(id));
        if (id) queueMicrotask(() => { if (active) void load(generation).catch((e) => { if (active && generation === epoch.current) setError(e.message); }); });
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => { active = false; generationRef.current++; unsubscribe?.(); stopMedia(); if (url.current) URL.revokeObjectURL(url.current); };
    // Account switches invalidate pending recordings, loads and AI requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);
  async function startRecording() {
    if (busy || recording || micPending.current) return;
    micPending.current = true; setBusy(true);
    const generation = epoch.current; setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Recording is not supported in this browser.");
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== epoch.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const capture = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = []; let total = 0; let captureFailed = false;
      recorder.current = capture; setAudio(null); setAudioUrl(""); key.current = null;
      if (url.current) URL.revokeObjectURL(url.current); url.current = "";
      capture.ondataavailable = (event) => { total += event.data.size; chunks.push(event.data); if (total > MAX_SPEAKING_AUDIO_BYTES && capture.state === "recording") capture.stop(); };
      capture.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        if (timer.current) clearTimeout(timer.current);
        if (generation !== epoch.current) return;
        setRecording(false);
        if (captureFailed) return;
        if (total > MAX_SPEAKING_AUDIO_BYTES) { setError("Recording was too large. Try a shorter response."); return; }
        const blob = new Blob(chunks, { type: capture.mimeType || "audio/webm" });
        const problem = speakingAudioProblem(blob);
        if (problem) { setError(problem); return; }
        setAudio(blob); url.current = URL.createObjectURL(blob); setAudioUrl(url.current);
        void check("check", blob);
      };
      capture.onerror = () => { captureFailed = true; if (generation === epoch.current) { stopMedia(); setRecording(false); setError("Recording stopped unexpectedly. Please record again."); } };
      capture.start(1000); setRecording(true); timer.current = setTimeout(() => capture.state === "recording" && capture.stop(), 90_000);
    } catch (cause) { if (generation === epoch.current) { stopMedia(); setRecording(false); setError(cause instanceof Error ? cause.message : "Microphone permission was unavailable."); } }
    finally { micPending.current = false; if (generation === epoch.current) setBusy(false); }
  }
  async function check(action: "check" | "correct-transcript" | "delete", recordingBlob?: Blob, attemptId?: string) {
    if (!record || lock.current) return;
    const generation = epoch.current;
    lock.current = true; setBusy(true); setError("");
    try {
      const signature = `${action}:${questionIndex}:${transcript}:${recordingBlob?.size ?? 0}`;
      if (key.current?.signature !== signature) key.current = { signature, id: crypto.randomUUID() };
      const headers: Record<string, string> = { "x-tutor-owner": owner.current ?? "" };
      let body: FormData | string;
      if (action === "check" && recordingBlob) {
        body = new FormData(); body.set("audio", speakingAudioFile(recordingBlob));
        body.set("taskId", taskId); body.set("questionIndex", String(questionIndex)); body.set("requestId", key.current.id); body.set("version", String(record.version)); body.set("consent", "true");
      } else {
        headers["content-type"] = "application/json";
        body = JSON.stringify({action, taskId, version:record.version, answer:transcript || record.session.attempts.find(item => item.id === attemptId)?.answer, attemptId, requestId:key.current.id});
      }
      const response = await authenticatedFetch("/api/tutor/speaking/drill", {method:"POST",headers,body});
      const payload = await response.json() as SpeakingRecord;
      if (generation !== epoch.current) return;
      if (payload.session) { setRecord(payload); key.current = null; window.dispatchEvent(new Event("leselaut-tutor-updated")); }
      if (!response.ok) throw new Error(payload.error ?? "Please try again.");
      setTranscript(payload.session.attempts.at(-1)?.answer ?? "");
      if (action === "delete") { setDeleteOpen(false); setAudio(null); setAudioUrl(""); if (url.current) URL.revokeObjectURL(url.current); url.current = ""; }
    } catch (cause) { if (generation === epoch.current) setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { if (generation === epoch.current) { lock.current = false; setBusy(false); } }
  }
  function play(text: string) {
    if (!("speechSynthesis" in window)) { setError("Audio playback is not supported in this browser."); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "de-DE"; utterance.rate = .9; window.speechSynthesis.speak(utterance);
  }
  const task = getChapterOutputTask(taskId);
  const questions = record?.mission.questions ?? task?.questions ?? [];
  const question = questions[questionIndex] ?? questions[0] ?? "Introduce yourself.";
  const latest = record?.session.attempts.filter(item => item.questionIndex === questionIndex && item.status === "complete").at(-1);
  const changeQuestion = () => {
    const next = (questionIndex + 1) % questions.length;
    setQuestionIndex(next); setTranscript(record?.session.attempts.filter(item => item.questionIndex === next && item.status === "complete").at(-1)?.answer ?? ""); setAudio(null); setAudioUrl(""); setError(""); key.current = null;
    if (url.current) URL.revokeObjectURL(url.current); url.current = "";
  };
  return <div className="speaking-workspace speaking-drill">
    <div className="speaking-partner"><p lang="de">{question}</p><Button variant="ghost" disabled={busy || recording} onClick={() => play(question)}>Hear question</Button></div>
    {!signedIn ? <p><Link href="/account">Sign in</Link> to record your answer.</p> : !record ? <p>Loading…</p> : <>
      <div className="writing-repair-actions"><Button disabled={busy} onClick={() => recording ? stopMedia() : void startRecording()}>{recording ? "Stop & check" : busy ? "Checking…" : latest ? "Try again" : "Record answer"}</Button>{latest && !recording && <Button variant="outline" disabled={busy} onClick={changeQuestion}>{questionIndex + 1 < questions.length ? "Next question" : "Back to first question"}</Button>}</div>
      {!latest && !busy && <p className="writing-guidance">A short answer is enough. Stopping sends your recording for AI feedback.</p>}
      {error && <div role="alert"><p className="chapter-error">{error}</p>{audio && <Button variant="outline" disabled={busy || recording} onClick={() => void check("check", audio)}>Check recording again</Button>}</div>}
      {latest && !busy && <section className="writing-repair-feedback" aria-label="Speaking feedback"><h3>{latest.feedback?.taskSuccess ? "Well done" : "Your feedback"}</h3><p><span>I heard: </span><span lang="de">{latest.answer}</span></p>
        {latest.feedback?.issues.map((issue) => <article key={issue.start}><p lang="de">{issue.original} → <strong>{issue.corrected}</strong></p><p>{issue.explanation}</p>{issue.kind === "style" && <small>Optional suggestion</small>}</article>)}
        {!latest.feedback?.issues.length && <p>{latest.feedback?.needsReview ? "I could not give reliable feedback. Please try again." : latest.feedback?.taskSuccess ? "Your answer works. Try the next question." : "Try answering the question more directly."}</p>}
        <details className="tutor-optional"><summary>Did I hear you incorrectly?</summary><label><span>Change only speech-recognition mistakes.</span><Textarea value={transcript || latest.answer} onChange={event => { setTranscript(event.target.value); key.current = null; }} maxLength={2000} /></label><Button variant="outline" disabled={busy || recording} onClick={() => void check("correct-transcript", undefined, latest.id)}>Update feedback</Button></details>
      </section>}
      <details className="tutor-optional"><summary>Recording & saved work</summary>{audioUrl && <audio controls src={audioUrl}>Your recording</audio>}<p className="ai-tutor-privacy">AI checks the transcript, not pronunciation. Audio is sent for transcription; text and feedback are saved until deleted. Each recording check uses two of your 20 daily AI requests.</p><Button variant="outline" disabled={busy || recording} onClick={() => void load().catch(e => setError(e.message))}>Reload saved work</Button>{deleteOpen ? <><p>Delete this chapter’s saved speaking drills?</p><Button variant="destructive" disabled={busy || recording} onClick={() => void check("delete")}>Delete</Button><Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button></> : <Button variant="ghost" disabled={busy || recording} onClick={() => setDeleteOpen(true)}>Delete saved drills</Button>}</details>
    </>}
  </div>;
}
