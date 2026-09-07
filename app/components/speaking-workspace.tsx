"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MAX_SPEAKING_AUDIO_BYTES, speakingAudioFile, speakingAudioProblem } from "@/app/lib/speaking-audio";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import type { WritingRecord } from "@/app/lib/writing-repair";
import type { SpeakingMission } from "@/app/lib/speaking-missions";
import { TutorRepairFeedback } from "./tutor-repair-feedback";
import { TutorMemoryPanel } from "./tutor-memory-panel";

type SpeakingRecord = WritingRecord & { mission: SpeakingMission; error?: string };
export function SpeakingWorkspace({ taskId }: { taskId: string }) {
  const [record, setRecord] = useState<SpeakingRecord | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [mode, setMode] = useState<"conversation" | "focus">("conversation");
  const [repairing, setRepairing] = useState(false);
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
    const response = await authenticatedFetch(`/api/tutor/speaking?taskId=${encodeURIComponent(taskId)}`);
    const payload = await response.json() as SpeakingRecord;
    if (generation !== epoch.current) return;
    if (!response.ok) throw new Error(payload.error ?? "Speaking practice could not be loaded.");
    setRecord(payload); setTranscript(payload.session.speaking?.transcript?.consumed ? "" : payload.session.speaking?.transcript?.text ?? ""); setConfirmed(false); setError("");
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
        setRecord(null); setAudio(null); setAudioUrl(""); setTranscript(""); setConfirmed(false); setRecording(false); setConsent(false); setError(""); setBusy(false); lock.current = false; key.current = null; setSignedIn(Boolean(id));
        if (id) queueMicrotask(() => { if (active) void load(generation).catch((e) => { if (active && generation === epoch.current) setError(e.message); }); });
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => { active = false; generationRef.current++; unsubscribe?.(); stopMedia(); if (url.current) URL.revokeObjectURL(url.current); };
    // Account switches invalidate pending recordings, loads and AI requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);
  async function startRecording() {
    if (!consent || busy || recording || micPending.current) return;
    micPending.current = true; setBusy(true);
    const generation = epoch.current; setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Recording is not supported in this browser.");
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== epoch.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const capture = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = []; let total = 0;
      recorder.current = capture; setAudio(null); setAudioUrl(""); key.current = null;
      if (url.current) URL.revokeObjectURL(url.current); url.current = "";
      capture.ondataavailable = (event) => { total += event.data.size; chunks.push(event.data); if (total > MAX_SPEAKING_AUDIO_BYTES && capture.state === "recording") capture.stop(); };
      capture.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        if (timer.current) clearTimeout(timer.current);
        if (generation !== epoch.current) return;
        setRecording(false);
        if (total > MAX_SPEAKING_AUDIO_BYTES) { setError("Recording was too large. Try a shorter response."); return; }
        const blob = new Blob(chunks, { type: capture.mimeType || "audio/webm" });
        const problem = speakingAudioProblem(blob);
        if (problem) { setError(problem); return; }
        setAudio(blob); url.current = URL.createObjectURL(blob); setAudioUrl(url.current);
      };
      capture.onerror = () => { if (generation === epoch.current) { stopMedia(); setRecording(false); setError("Recording stopped unexpectedly. Please record again."); } };
      capture.start(1000); setRecording(true); timer.current = setTimeout(() => capture.state === "recording" && capture.stop(), 90_000);
    } catch (cause) { if (generation === epoch.current) { stopMedia(); setRecording(false); setError(cause instanceof Error ? cause.message : "Microphone permission was unavailable."); } }
    finally { micPending.current = false; if (generation === epoch.current) setBusy(false); }
  }
  async function act(action: "start" | "transcribe" | "respond" | "repair" | "reveal" | "delete" | "help" | "dispute", attemptId?: string, extra?: Record<string, unknown>) {
    if (!record || lock.current || recording) return;
    const generation = epoch.current;
    lock.current = true; setBusy(true); setError("");
    try {
      const signature = `${action}:${transcript}:${audio?.size ?? 0}:${record.session.speaking?.transcript?.id ?? ""}`;
      if (key.current?.signature !== signature) key.current = { signature, id: crypto.randomUUID() };
      const headers: Record<string, string> = { "x-tutor-owner": owner.current ?? "" };
      let body: FormData | string;
      if (action === "transcribe" && audio) {
        body = new FormData(); body.set("audio", speakingAudioFile(audio));
        body.set("taskId", taskId); body.set("requestId", key.current.id); body.set("version", String(record.version)); body.set("consent", String(consent));
      } else {
        headers["content-type"] = "application/json";
        body = JSON.stringify({ ...extra, action, taskId, version: record.version, mode, answer: transcript, confirmed, transcriptId: record.session.speaking?.transcript?.id, requestId: key.current.id, attemptId });
      }
      const response = await authenticatedFetch("/api/tutor/speaking", { method: "POST", headers, body });
      const payload = await response.json() as SpeakingRecord;
      if (generation !== epoch.current) return;
      if (payload.session) { setRecord(payload); key.current = null; window.dispatchEvent(new Event("leselaut-tutor-updated")); }
      if (!response.ok) throw new Error(payload.error ?? "Speaking request failed.");
      if (action === "transcribe") { setTranscript(payload.session.speaking?.transcript?.text ?? ""); setConfirmed(false); }
      if (action === "respond" || action === "repair" || action === "delete" || action === "start") { setTranscript(""); setConfirmed(false); setAudio(null); setAudioUrl(""); if (url.current) URL.revokeObjectURL(url.current); url.current = ""; }
      if (action === "repair" || action === "start") setRepairing(false);
      if (action === "delete") setDeleteOpen(false);
    } catch (cause) { if (generation === epoch.current) setError(cause instanceof Error ? cause.message : "Speaking request failed."); }
    finally { if (generation === epoch.current) { lock.current = false; setBusy(false); } }
  }
  function play(text: string) {
    if (!("speechSynthesis" in window)) { setError("Audio playback is not supported in this browser."); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "de-DE"; utterance.rate = .9; window.speechSynthesis.speak(utterance);
  }
  const state = record?.session.speaking;
  const latest = state?.missionId === record?.mission.id ? record?.session.attempts.filter((item) => item.status === "complete" && item.createdAt >= state.startedAt).at(-1) : undefined;
  return <div className="speaking-workspace">
    {!signedIn ? <p><Link href="/account">Sign in</Link> to start a speaking mission and save your progress.</p> : !record ? <p>Loading your speaking practice…</p> : <>
      <p>{record.mission.speakingSize} · {record.mission.turns} questions</p>
      {!state || state.ended && !repairing ? <div><p>{state?.ended ? "Done. Your feedback is below." : "Ready? Answer one question at a time."}</p><details className="tutor-optional"><summary>Practice mode</summary><div className="writing-repair-actions"><Button variant={mode === "conversation" ? "default" : "outline"} onClick={() => setMode("conversation")} aria-pressed={mode === "conversation"}>Conversation: feedback at the end</Button><Button variant={mode === "focus" ? "default" : "outline"} onClick={() => setMode("focus")} aria-pressed={mode === "focus"}>Focused: feedback after each turn</Button></div></details><div className="writing-repair-actions"><Button disabled={busy} onClick={() => void act("start")}>{state ? "Practise again" : "Start speaking"}</Button></div></div> : <>
        <p>{repairing ? "Repair turn" : "Turn"} {repairing ? state.turns.length : state.turns.length + 1} of {record.mission.turns} · {state.mode === "focus" ? "Focused practice" : "Conversation flow"}</p>
        <div className="speaking-partner"><p lang="de">{(repairing ? state.turns.at(-1)?.prompt : state.turns.at(-1)?.reply) ?? record.mission.opening}</p><Button variant="outline" onClick={() => play((repairing ? state.turns.at(-1)?.prompt : state.turns.at(-1)?.reply) ?? record.mission.opening)}>Listen</Button></div>
        {record.mission.support && <p className="writing-starter"><span>Start with:</span> <b lang="de">{record.mission.support}</b></p>}
        <label className="writing-photo-consent"><input type="checkbox" checked={consent} disabled={busy || recording} onChange={(event) => setConsent(event.target.checked)} /><span>Allow my recording to be sent for transcription.</span></label>
        <div className="writing-repair-actions"><Button disabled={busy || !consent} onClick={() => recording ? stopMedia() : void startRecording()}>{recording ? "Stop recording" : "Record a response"}</Button>{audio && !recording && <Button disabled={busy || !consent} onClick={() => void act("transcribe")}>{busy ? "Reading…" : "Read recording"}</Button>}</div>
        {audioUrl && <audio controls src={audioUrl}>Your recording</audio>}
        {state.transcript && !state.transcript.consumed && <div className="writing-photo-confirm"><label><span>Check the transcript against your recording</span><Textarea lang="de" value={transcript} disabled={busy || recording} maxLength={2000} onChange={(event) => { setTranscript(event.target.value); setConfirmed(false); key.current = null; }} /></label><label className="writing-photo-consent"><input type="checkbox" checked={confirmed} disabled={busy || recording} onChange={(event) => setConfirmed(event.target.checked)} /><span>This matches what I said.</span></label><Button disabled={busy || recording || !confirmed || transcript.trim().length < (record.mission.level === "A1" ? 1 : 3)} onClick={() => void act(repairing ? "repair" : "respond")}>{repairing ? "Check my spoken repair" : "Send confirmed response"}</Button></div>}
      </>}
      {state?.mode === "focus" && state.turns.length > 0 && !repairing && <Button variant="outline" disabled={busy || recording} onClick={() => { setRepairing(true); setAudio(null); setAudioUrl(""); setTranscript(""); setConfirmed(false); }}>Repair my last response</Button>}
      {repairing && <p role="status">Try the same answer again using your hint.</p>}
      {latest && <TutorRepairFeedback attempt={latest} busy={busy || recording} onReveal={() => void act("reveal", latest.id)} onAction={(input) => void act(input.action, latest.id, input)} />}
      {(state?.turns.length ?? 0) > 0 && <details><summary>Saved conversation</summary>{state?.turns.map((turn, index) => <article className="writing-attempt" key={turn.id}><b>Turn {index + 1}</b><p lang="de">{turn.prompt}</p><p className="writing-source" lang="de">You: {turn.text}</p><p lang="de">{turn.reply}</p><details><summary>Original speech recognition</summary><p lang="de">{turn.originalTranscript}</p></details></article>)}</details>}
      <TutorMemoryPanel level={record.mission.level} />
      <details className="tutor-optional"><summary>Saved work & privacy</summary><p className="ai-tutor-privacy">Recordings stay in this page and are sent only for transcription. LeseLaut saves confirmed text, turns and feedback until you delete them. Feedback assesses language in the transcript, not pronunciation. The daily allowance is 20 AI requests. Transcription and feedback each use one; A2–B1 partner replies also use one. A1 partner questions are free.</p>
      <div className="writing-repair-actions"><Button variant="outline" disabled={busy || recording} onClick={() => void load().catch((e) => setError(e.message))}>Reload saved work</Button>{deleteOpen ? <><span>Delete all speaking history for this chapter?</span><Button variant="destructive" disabled={busy || recording} onClick={() => void act("delete")}>Delete history</Button><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button></> : <Button variant="ghost" disabled={busy || recording} onClick={() => setDeleteOpen(true)}>Delete speaking history</Button>}</div></details>
    </>}
    {error && <p className="chapter-error" role="alert">{error}</p>}
  </div>;
}
