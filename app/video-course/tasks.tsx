'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Pause, Snail, Square, Volume2 } from 'lucide-react';
import type { AudioRef, SpeakItem, WriteItem } from '@/app/video-course/types';
import { playLine } from '@/app/video-course/audio';

const NAMES: Record<string, string> = { T: 'Frau Weber', A: 'Arjun', N: 'Amara', Y: 'Yuki', M: 'Mateo', O: 'Herr Özdemir', S: 'Frau Schulz' };

export function AudioButton({ line, label }: { line: AudioRef; label?: string }) {
  const [busy, setBusy] = useState(false);
  const play = async (slow: boolean) => { setBusy(true); await playLine(line, slow); setBusy(false); };
  return <span className="vc-audio">
    <button type="button" onClick={() => play(false)} aria-label={`Play ${NAMES[line.who] ?? ''}`} className={busy ? 'is-playing' : ''}><Volume2 aria-hidden="true" />{label ?? NAMES[line.who]}</button>
    <button type="button" onClick={() => play(true)} aria-label="Play slowly" title="Slower"><Snail aria-hidden="true" /></button>
  </span>;
}

export function writeResult(item: WriteItem, text: string) {
  const t = text.slice(0, 4000).normalize('NFC');
  const checks = item.checks.map(c => ({ label: c.label, ok: new RegExp(c.pattern, 'iu').test(t) }));
  const warnings = item.warnings.filter(w => new RegExp(w.pattern, 'iu').test(t)).map(w => w.message);
  return { checks, warnings, ok: checks.every(c => c.ok) && warnings.length === 0 };
}

export function WriteTask({ item, value, disabled, onChange, inputProps }: { item: WriteItem; value: string; disabled: boolean; onChange: (v: string) => void; inputProps: object }) {
  const [showModel, setShowModel] = useState(false);
  const r = writeResult(item, value), words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return <div className="vc-write">
    <p className="vc-prompt">{item.prompt}</p>
    <textarea {...inputProps} lang="de" rows={5} maxLength={4000} value={value} disabled={disabled} spellCheck={false} placeholder="Guten Tag, Herr Özdemir! …" onChange={e => onChange(e.target.value)} />
    <div className="vc-write-meta"><span>{words} words</span><button type="button" className="vc-btn-ghost" onClick={() => setShowModel(s => !s)}>{showModel ? 'Hide' : 'Show'} model answer</button></div>
    <ul className="vc-checklist">{r.checks.map(c => <li key={c.label} className={c.ok ? 'is-ok' : ''}>{c.ok ? '✓' : '○'} {c.label}</li>)}</ul>
    {r.warnings.length > 0 && <ul className="vc-warnings">{r.warnings.map(w => <li key={w}>⚠ {w}</li>)}</ul>}
    {showModel && <p className="vc-model" lang="de">{item.model}</p>}
  </div>;
}

export function SpeakTask({ item, onDone }: { item: SpeakItem; onDone: () => void }) {
  const [state, setState] = useState<'idle' | 'recording' | 'ready' | 'error'>('idle');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const rec = useRef<MediaRecorder | null>(null), chunks = useRef<Blob[]>([]), stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); if (stopTimer.current) clearTimeout(stopTimer.current); rec.current?.stream.getTracks().forEach(t => t.stop()); }, [url]);

  async function start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('This browser cannot record. Say it out loud anyway, then compare with the model.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(t => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = e => chunks.current.push(e.data);
      r.onstop = () => { stream.getTracks().forEach(t => t.stop()); setUrl(URL.createObjectURL(new Blob(chunks.current, { type: r.mimeType }))); setState('ready'); onDone(); };
      rec.current = r; r.start(); setState('recording');
      stopTimer.current = setTimeout(() => r.state === 'recording' && r.stop(), 30000);
    } catch (e) { setError(e instanceof Error && e.name !== 'NotAllowedError' ? e.message : 'Microphone blocked. Allow it in your browser, or just say it out loud.'); setState('error'); }
  }
  const stop = () => { if (stopTimer.current) clearTimeout(stopTimer.current); rec.current?.state === 'recording' && rec.current.stop(); };

  return <div className="vc-speak">
    <p className="vc-prompt">{item.prompt}</p>
    {item.audio && <AudioButton line={item.audio} label={`${NAMES[item.audio.who]} asks`} />}
    <div className="vc-speak-row">
      {state === 'recording'
        ? <button type="button" className="vc-btn vc-rec is-on" onClick={stop}><Square aria-hidden="true" /> Stop</button>
        : <button type="button" className="vc-btn vc-rec" onClick={start}><Mic aria-hidden="true" /> {state === 'ready' ? 'Record again' : 'Record'}</button>}
      {url && <audio controls src={url} />}
    </div>
    {error && <p className="vc-hint">{error}</p>}
    {(state === 'ready' || state === 'error') && <div className="vc-model"><span lang="de">{item.modelText}</span>{item.model && <AudioButton line={item.model} label="Model" />}</div>}
    {state === 'recording' && <p className="vc-hint"><Pause aria-hidden="true" /> Recording… (max 30 s)</p>}
  </div>;
}
