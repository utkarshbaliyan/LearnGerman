"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PhotoReading } from "@/app/lib/writing-photo";

async function preparePhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG or WebP photo. Export HEIC photos as JPG first.");
  if (!file.size || file.size > 12_000_000) throw new Error("Choose a photo smaller than 12 MB.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error("This photo could not be opened. Try another JPG or PNG."); }
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("This photo is too large. Crop it to one assignment page first.");
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the photo.");
    context.fillStyle = "white"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob || blob.size > 2_500_000) throw new Error("The photo is still too large. Crop it closer to the written answer.");
    // Canvas conversion removes EXIF/location metadata before upload.
    return new File([blob], "assignment.jpg", { type: "image/jpeg" });
  } finally { bitmap.close(); }
}

function ConfirmPhotoText({ reading, busy, hasDraft, onConfirm }: { reading: PhotoReading; busy: boolean; hasDraft: boolean; onConfirm: (text: string, photoId: string) => Promise<void> }) {
  const [text, setText] = useState(reading.text ?? "");
  const [confirmed, setConfirmed] = useState(false);
  return <div className="writing-photo-confirm">
    <h4>Check what the AI read</h4>
    <p>Compare this with your paper. Fix recognition mistakes, but leave your original German mistakes for the tutor to explain.</p>
    {reading.uncertain && <p className="writing-photo-warning">Some handwriting was uncertain. Check every line and replace any [unclear] markers.</p>}
    <label><span>Text read from your assignment</span><Textarea lang="de" maxLength={8000} value={text} disabled={busy} onChange={(event) => { setText(event.target.value); setConfirmed(false); }} /></label>
    <label className="writing-photo-consent"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} /><span>I compared this text with my assignment and fixed any reading mistakes.</span></label>
    {hasDraft && <p className="writing-guidance">Using this text replaces your current draft. Previous submitted attempts remain saved.</p>}
    <Button disabled={busy || !confirmed || text.trim().length < 10 || /\[unclear\]/i.test(text)} onClick={() => void onConfirm(text, reading.id)}>Use confirmed text in my draft</Button>
  </div>;
}

export function WritingPhotoUpload({ photos, busy, hasDraft, onUpload, onConfirm }: {
  photos: PhotoReading[]; busy: boolean; hasDraft: boolean;
  onUpload: (file: File, requestId: string) => Promise<void>;
  onConfirm: (text: string, photoId: string) => Promise<void>;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [consent, setConsent] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const urlRef = useRef("");
  const sequence = useRef(0);
  const requestId = useRef("");
  useEffect(() => { const sequenceRef = sequence; return () => { sequenceRef.current++; if (urlRef.current) URL.revokeObjectURL(urlRef.current); }; }, []);
  async function choose(file?: File) {
    const current = ++sequence.current;
    setPhoto(null); setConsent(false); setError(""); setPreview("");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    if (!file) return;
    setPreparing(true);
    try {
      const prepared = await preparePhoto(file);
      if (current !== sequence.current) return;
      setPhoto(prepared); urlRef.current = URL.createObjectURL(prepared); setPreview(urlRef.current); requestId.current = crypto.randomUUID();
    } catch (cause) { if (current === sequence.current) setError(cause instanceof Error ? cause.message : "Photo could not be prepared."); }
    finally { if (current === sequence.current) setPreparing(false); }
  }
  const latest = photos.at(-1);
  async function upload() {
    if (!photo || !consent || busy) return;
    // A completed or failed request is a deliberate fresh read. An uncertain network retry keeps its ID.
    if (photos.some((reading) => reading.id === requestId.current && reading.status !== "pending")) requestId.current = crypto.randomUUID();
    await onUpload(photo, requestId.current);
  }
  return <section className="writing-photo-upload" aria-label="Upload a written assignment">
    <h3><Camera aria-hidden="true" /> Upload your handwritten assignment</h3>
    <p>Photograph your answer to this chapter’s writing task. Use good light, keep the page flat, and include one page at a time.</p>
    <label><span>Assignment photo · JPG, PNG or WebP · up to 12 MB</span><Input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || preparing} onChange={(event) => { void choose(event.target.files?.[0]); event.target.value = ""; }} /></label>
    {preparing && <p role="status">Preparing your photo…</p>}
    {preview && <div className="writing-photo-preview">
      {/* A local blob preview must not pass through the image optimization service. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="Your selected handwritten assignment" />
      <div><label className="writing-photo-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} /><span>Send this photo to the AI provider to read my handwriting.</span></label>
        <div className="writing-repair-actions"><Button disabled={busy || !consent} onClick={() => void upload()}>{busy ? "Please wait…" : "Read photo"}</Button><Button variant="outline" disabled={busy} onClick={() => void choose()}>Remove photo</Button></div>
      </div>
    </div>}
    <p className="writing-guidance">LeseLaut keeps the extracted text, not the photo. The photo is sent only when you choose Read photo. One photo read uses one daily AI request; checking the confirmed text uses another.</p>
    {error && <p className="chapter-error" role="alert">{error}</p>}
    {latest?.status === "pending" && <p role="status">Your photo is being read. Reload saved work if the connection was interrupted.</p>}
    {latest?.status === "failed" && <p>The last photo could not be read. Try a clearer photo or type your assignment below.</p>}
    {latest?.status === "complete" && !latest.confirmedAt && <ConfirmPhotoText key={latest.id} reading={latest} busy={busy} hasDraft={hasDraft} onConfirm={onConfirm} />}
    {latest?.confirmedAt && <p role="status">Photo text confirmed. Choose Get a hint or Check my revision below for corrections and explanations.</p>}
  </section>;
}
