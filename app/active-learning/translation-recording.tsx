'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAX_SPEAKING_AUDIO_BYTES, speakingAudioFile } from '@/app/lib/speaking-audio';

export function TranslationRecording({ disabled, consent, onRecording, onTranscribe }: { disabled: boolean; consent: boolean; onRecording: (value: boolean) => void; onTranscribe: (file: File, id: string) => Promise<boolean> }) {
  const [recording, setRecording] = useState(false), [audio, setAudio] = useState<File | null>(null), [preview, setPreview] = useState(''), [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null), stream = useRef<MediaStream | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), url = useRef(''), active = useRef(true), acquiring = useRef(false), requestId = useRef('');
  function stop() { if (timer.current) clearTimeout(timer.current); if (recorder.current?.state === 'recording') recorder.current.stop(); stream.current?.getTracks().forEach(t => t.stop()); }
  useEffect(() => { active.current = true; return () => { active.current = false; stop(); if (url.current) URL.revokeObjectURL(url.current); }; }, []);
  async function transcribe(file: File) {
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const terminal = await onTranscribe(file, requestId.current);
    if (terminal && active.current) requestId.current = '';
  }
  async function start() {
    if (disabled || !consent || acquiring.current || recording) return;
    acquiring.current = true; onRecording(true); setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('This browser cannot record audio. You can type your translation instead.');
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) { media.getTracks().forEach(t => t.stop()); return; }
      stream.current = media;
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t));
      const capture = new MediaRecorder(media, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 64000 }); recorder.current = capture;
      const chunks: Blob[] = []; let total = 0, failed = false;
      setAudio(null); setPreview(''); requestId.current = ''; if (url.current) URL.revokeObjectURL(url.current); url.current = '';
      capture.ondataavailable = event => { chunks.push(event.data); total += event.data.size; if (total > MAX_SPEAKING_AUDIO_BYTES && capture.state === 'recording') capture.stop(); };
      capture.onerror = () => { failed = true; stop(); if (active.current) { setError('Recording failed. Check your microphone and try again.'); setRecording(false); onRecording(false); } };
      capture.onstop = () => {
        media.getTracks().forEach(t => t.stop()); if (timer.current) clearTimeout(timer.current);
        if (!active.current) return; setRecording(false); onRecording(false); if (failed) return;
        try {
          const file = speakingAudioFile(new Blob(chunks, { type: capture.mimeType || 'audio/webm' }));
          setAudio(file); url.current = URL.createObjectURL(file); setPreview(url.current); void transcribe(file);
        } catch (e) { setError(e instanceof Error ? e.message : 'Record a shorter answer.'); }
      };
      capture.start(500); setRecording(true); timer.current = setTimeout(() => { if (capture.state === 'recording') capture.stop(); }, 60_000);
    } catch (e) { if (active.current) { stop(); onRecording(false); setError(e instanceof Error ? e.message : 'Microphone permission was unavailable.'); } }
    finally { acquiring.current = false; }
  }
  return <div className="translation-recording">
    <Button variant="outline" disabled={!recording && (disabled || !consent)} onClick={() => recording ? stop() : void start()}>{recording ? <Square size={16} /> : <Mic size={16} />}{recording ? 'Stop & transcribe' : 'Record translation'}</Button>
    {recording && <span role="status">Recording · up to 60 seconds</span>}
    {preview && <><audio controls src={preview} aria-label="Your recorded translation" /><Button variant="ghost" disabled={disabled || !consent || recording} onClick={() => { if (audio) void transcribe(audio); }}>Transcribe again</Button></>}
    {error && <p className="chapter-error" role="alert">{error}</p>}
  </div>;
}
