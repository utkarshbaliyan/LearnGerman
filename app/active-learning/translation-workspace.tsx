'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PenLine, Mic, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';
import { WritingPhotoUpload } from '@/app/components/writing-photo-upload';
import { LEVEL_GUIDANCE, TRANSLATION_LEVELS, photoAnswers, sameAnswers, type TranslationLevel, type TranslationRecord, type TranslationResponse } from '@/app/lib/translation-practice';
import { TranslationRecording } from './translation-recording';

type Mode = 'write' | 'speak' | 'photo';
type Recent = NonNullable<TranslationResponse['recent']>;
const endpoint = '/api/active-learning/translation';
const cacheKey = (owner: string, exercise: string) => `leselaut:translation-draft:v1:${owner}:${exercise}`;
export function TranslationWorkspace() {
  const [level, setLevel] = useState<TranslationLevel>('A1'), [count, setCount] = useState(1), [mode, setMode] = useState<Mode>('write');
  const [record, setRecord] = useState<TranslationRecord | null>(null), [answers, setAnswers] = useState<string[]>([]), [recent, setRecent] = useState<Recent>([]);
  const [signedIn, setSignedIn] = useState(false), [loading, setLoading] = useState(true), [busy, setBusy] = useState(''), [saving, setSaving] = useState(false), [recording, setRecording] = useState(false), [speechConsent, setSpeechConsent] = useState(false);
  const [error, setError] = useState(''), [recovery, setRecovery] = useState<string[] | null>(null), [cacheWarning, setCacheWarning] = useState('');
  const owner = useRef<string | null>(null), epoch = useRef(0), lock = useRef(false), keys = useRef(new Map<string, string>());
  const recordRef = useRef(record), answersRef = useRef(answers); recordRef.current = record; answersRef.current = answers;
  const adopt = useCallback((value: TranslationRecord, recover = true) => {
    setRecord(value); setAnswers(value.session.answers); setLevel(value.session.level); setCount(value.session.count); setRecovery(null);
    if (recover && owner.current) try {
      const raw = localStorage.getItem(cacheKey(owner.current, value.exerciseId));
      const cached = raw ? JSON.parse(raw) : null;
      if (Array.isArray(cached?.answers) && cached.answers.length === value.session.count && cached.answers.every((a: unknown) => typeof a === 'string' && a.length <= 1200) && !sameAnswers(cached.answers, value.session.answers)) setRecovery(cached.answers);
    } catch { setCacheWarning('Browser recovery is unavailable. Save your draft before leaving.'); }
  }, []);
  const load = useCallback(async (id?: string, generation = epoch.current) => {
    const r = await authenticatedFetch(endpoint + (id ? `?exerciseId=${encodeURIComponent(id)}` : ''), { headers: { 'x-translation-owner': owner.current ?? '' }, signal: AbortSignal.timeout(20_000) });
    const data = await r.json() as TranslationResponse;
    if (generation !== epoch.current) return;
    if (!r.ok) throw new Error(data.error ?? 'Saved exercises could not be loaded.');
    if (data.session) adopt(data); else { setRecord(null); setAnswers([]); setRecovery(null); }
    setRecent(data.recent ?? []); setError(''); setLoading(false);
  }, [adopt]);
  useEffect(() => {
    let active = true, initialized = false, unsubscribe: (() => void) | undefined;
    void import('@/app/lib/supabase-client').then(({ supabase }) => {
      if (!active) return;
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const id = session?.user.id ?? null;
        if (initialized && id === owner.current) return; initialized = true;
        const generation = ++epoch.current; owner.current = id; lock.current = false; keys.current.clear();
        setRecord(null); setAnswers([]); setRecent([]); setRecovery(null); setError(''); setBusy(''); setSaving(false); setRecording(false); setSpeechConsent(false); setSignedIn(Boolean(id)); setLoading(Boolean(id));
        if (id) queueMicrotask(() => { if (active) void load(undefined, generation).catch(e => { if (active && generation === epoch.current) { setError(e.message); setLoading(false); } }); });
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }).catch(() => { if (active) { setError('Sign-in could not be loaded. Reload the page.'); setLoading(false); } });
    return () => { active = false; epoch.current++; unsubscribe?.(); };
  }, [load]);
  useEffect(() => {
    if (!record || !owner.current || recovery || loading) return;
    try { localStorage.setItem(cacheKey(owner.current, record.exerciseId), JSON.stringify({ answers })); setCacheWarning(''); }
    catch { setCacheWarning('This browser could not save your draft. Use Save draft before leaving.'); }
  }, [answers, record, recovery, loading]);
  const send = useCallback(async (action: 'generate' | 'draft' | 'check' | 'speech' | 'photo', extra: Record<string, unknown> = {}, file?: File, fixedId?: string) => {
    if (lock.current || !owner.current) return false;
    const current = recordRef.current, generation = epoch.current;
    if (action !== 'generate' && !current) return false;
    lock.current = true; if (action === 'draft') setSaving(true); else setBusy(action === 'generate' ? 'Generating sentences…' : action === 'check' ? 'Checking translations…' : action === 'photo' ? 'Reading your photo…' : 'Transcribing your recording…'); setError('');
    const submitted = action === 'check' || action === 'draft' ? (extra.answers as string[] | undefined) ?? answersRef.current : undefined;
    const data = { action, exerciseId: current?.exerciseId, version: current?.version, ...(submitted ? { answers: submitted } : {}), ...extra };
    const signature = JSON.stringify({ action, ...(action === 'generate' ? {} : { exerciseId: current?.exerciseId }), ...extra, answers: submitted });
    let requestId = fixedId ?? keys.current.get(signature);
    if (action !== 'draft' && !requestId) { requestId = crypto.randomUUID(); keys.current.set(signature, requestId); }
    let terminal = false;
    try {
      const headers: Record<string, string> = { 'x-translation-owner': owner.current };
      let body: string | FormData;
      if (file) {
        body = new FormData(); body.set(action === 'photo' ? 'photo' : 'audio', file);
        for (const [k, v] of Object.entries({ action, exerciseId: current!.exerciseId, version: current!.version, requestId, consent: 'true', ...extra })) body.set(k, String(v));
      } else { headers['content-type'] = 'application/json'; body = JSON.stringify({ ...data, requestId }); }
      const r = await authenticatedFetch(endpoint, { method: 'POST', headers, body, signal: AbortSignal.timeout(75_000) });
      const payload = await r.json() as TranslationResponse;
      if (generation !== epoch.current) return true;
      const op = payload.session?.operations.find(o => o.id === requestId);
      terminal = op?.status === 'complete' || op?.status === 'failed' || (!payload.session && r.status !== 503 && r.status !== 502);
      if (terminal) keys.current.delete(signature);
      if (payload.session) {
        if (action === 'generate') { adopt(payload, false); setRecent(rows => [{ exerciseId: payload.exerciseId, level: payload.session.level, count: payload.session.count }, ...rows.filter(x => x.exerciseId !== payload.exerciseId)].slice(0, 10)); }
        else setRecord(payload);
      }
      if (!r.ok) throw new Error(payload.error ?? 'The request did not finish. Try again.');
      if (action === 'draft' && extra.photoId) { setAnswers(submitted!); setRecovery(null); }
      if (action === 'speech' && op?.text) setAnswers(rows => rows.map((a, i) => i === Number(extra.sentenceIndex) ? op.text! : a));
      return true;
    } catch (e) { if (generation === epoch.current) setError(e instanceof Error ? e.message : 'Your work is still here. Retry the request.'); return terminal; }
    finally { if (generation === epoch.current) { lock.current = false; setSaving(false); setBusy(''); } }
  }, [adopt]);
  useEffect(() => {
    if (!record || record.session.sentences.length !== record.session.count || loading || busy || saving || recovery || error || recording || sameAnswers(answers, record.session.answers)) return;
    const timer = setTimeout(() => { void send('draft'); }, 1200); return () => clearTimeout(timer);
  }, [answers, record, loading, busy, saving, recovery, error, recording, send]);
  const locked = Boolean(busy) || saving || recording || loading || Boolean(recovery);
  const usable = record?.session.sentences.length === record?.session.count && Boolean(record?.session.count);
  const latest = record?.session.checks.at(-1);
  const photos = record?.session.operations.filter(o => o.action === 'photo').map(o => ({ ...o, imageHash: o.fingerprint })) ?? [];
  const pending = record?.session.operations.some(o => o.status === 'pending');
  async function reload(id?: string) {
    if (locked) return; setLoading(true);
    try { await load(id); } catch (e) { setError(e instanceof Error ? e.message : 'Reload failed.'); } finally { setLoading(false); }
  }
  return <section className="translation-workspace" aria-label="English to German practice">
    <div className="translation-setup">
      <fieldset disabled={locked}><legend>Your German level</legend><div className="translation-levels">{TRANSLATION_LEVELS.map(l => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}>{l}</button>)}</div><p>{LEVEL_GUIDANCE[level].label}</p></fieldset>
      <label className="translation-count" htmlFor="translation-count">English sentences<select id="translation-count" value={count} disabled={locked} onChange={e => setCount(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} {i ? 'sentences' : 'sentence'}</option>)}</select></label>
      <Button disabled={!signedIn || locked} onClick={() => void send('generate', { level, count })}>{record ? 'Generate new sentences' : 'Generate sentences'}</Button>
    </div>
    {!signedIn && !loading && <p className="translation-signin"><Link href="/account">Sign in</Link> to generate sentences and get AI feedback.</p>}
    {loading && <p role="status">Loading your saved practice…</p>}
    {busy && <p className="translation-status" role="status">{busy}</p>}
    {record && !usable && !busy && !loading && <div className="translation-error"><p>{record.session.operations[0]?.error ?? 'Your sentences are still being generated. Reload saved work shortly.'}</p><Button variant="outline" disabled={locked} onClick={() => void reload(record.exerciseId)}>Reload saved work</Button></div>}
    {error && <div role="alert" className="translation-error"><p>{error}</p>{signedIn && <Button variant="outline" disabled={Boolean(busy) || saving || recording || loading} onClick={() => void reload(record?.exerciseId)}><RefreshCw size={15} />Reload saved work</Button>}</div>}
    {recovery && <div className="translation-recovery"><p>You have a different unsent draft in this browser. Choose which version to use.</p><Button disabled={Boolean(busy)} onClick={() => { setAnswers(recovery); setRecovery(null); setError(''); }}>Restore browser draft</Button><Button variant="outline" onClick={() => { setRecovery(null); if (record) setAnswers(record.session.answers); }}>Keep saved version</Button></div>}
    {recent.length > 1 && <label className="translation-history" htmlFor="translation-history">Saved sets<select id="translation-history" value={record?.exerciseId ?? ''} disabled={locked} onChange={e => void reload(e.target.value)}>{recent.map((r, i) => <option key={r.exerciseId} value={r.exerciseId}>{r.level} · {r.count} {r.count === 1 ? 'sentence' : 'sentences'} · {i === 0 ? 'most recent set' : `set ${i + 1}`}</option>)}</select></label>}
    {usable && record && <div className="translation-exercise" key={`${owner.current}:${record.exerciseId}`}>
      <header className="translation-exercise-heading"><h2>Translate into German</h2><span>{record.session.level} · {record.session.count} {record.session.count === 1 ? 'sentence' : 'sentences'}</span></header>
      <div className="translation-modes" role="group" aria-label="How to answer">{([{ id: 'write', title: 'Write', Icon: PenLine }, { id: 'speak', title: 'Speak', Icon: Mic }, { id: 'photo', title: 'Upload photo', Icon: Camera }] as const).map(({ id, title, Icon }) => <button key={id} type="button" aria-pressed={mode === id} disabled={locked} onClick={() => setMode(id)}><Icon size={17} />{title}</button>)}</div>
      {mode === 'speak' && <div className="translation-speech-help"><p>Record one translation at a time. Review the recognized text before checking. Feedback checks the transcript, not pronunciation.</p><label><input type="checkbox" checked={speechConsent} disabled={locked} onChange={e => setSpeechConsent(e.target.checked)} />Send my recordings to AI for transcription. Stopping a recording sends it.</label></div>}
      {mode === 'photo' && <p>Write the translations in sentence order and number them 1–{record.session.count}. Upload one clear photo, then check what the AI read.</p>}
      <ol className="translation-sentences">{record.session.sentences.map((english, i) => {
        const feedback = latest?.feedback[i], matches = latest?.answers[i] === answers[i];
        return <li key={`${record.exerciseId}:${i}`} className="translation-sentence"><p className="translation-english" lang="en"><span aria-hidden="true">{i + 1}.</span>{english}</p>
          {mode === 'speak' && <TranslationRecording disabled={locked} consent={speechConsent} onRecording={setRecording} onTranscribe={(file, id) => send('speech', { sentenceIndex: i }, file, id)} />}
          <label htmlFor={`translation-answer-${i}`}>{mode === 'speak' ? 'German transcript · correct any recognition mistakes' : 'Your German translation'}</label>
          <Textarea id={`translation-answer-${i}`} lang="de" value={answers[i] ?? ''} maxLength={1200} disabled={Boolean(busy) || loading || recording || Boolean(recovery)} spellCheck={false} onChange={e => setAnswers(rows => rows.map((a, j) => i === j ? e.target.value : a))} />
          {feedback && matches && <section className={`translation-feedback translation-feedback--${feedback.verdict}`} aria-label={`Feedback for sentence ${i + 1}`}><h3>{feedback.verdict === 'correct' ? 'Your translation works' : 'What to improve'}</h3><p>{feedback.explanation}</p>{feedback.corrections.map((c, j) => <article key={j}><p lang="de"><span>{c.original || '…'}</span> → <strong>{c.corrected}</strong></p><p>{c.explanation}</p>{c.kind === 'style' && <small>Optional style suggestion</small>}</article>)}<div className="translation-model"><span>One possible correct translation</span><p lang="de">{feedback.correctTranslation}</p></div></section>}
          {feedback && !matches && <p className="translation-recheck">You changed this translation. Check again for updated feedback.</p>}
        </li>;
      })}</ol>
      {mode === 'photo' && <WritingPhotoUpload key={`${owner.current}:${record.exerciseId}:photo`} minCharacters={2} photos={photos} hasDraft={answers.some(s => s.trim())} busy={locked} onUpload={(file, id) => send('photo', {}, file, id).then(() => undefined)} onConfirm={async (text, photoId) => { try { const rows = photoAnswers(text, record.session.count); await send('draft', { answers: rows, photoId }); } catch (e) { setError(e instanceof Error ? e.message : 'Check the sentence numbers.'); } }} />}
      <div className="translation-actions"><Button disabled={locked || answers.some(s => !s.trim() || /\[unclear\]/i.test(s)) || sameAnswers(latest?.answers ?? [], answers)} onClick={() => void send('check')}>{latest ? 'Check my revision' : 'Check translations'}</Button><Button variant="outline" disabled={locked || sameAnswers(answers, record.session.answers)} onClick={() => void send('draft')}>Save draft</Button><span role="status">{saving ? 'Saving draft…' : answers.filter(s => s.trim()).length + ' of ' + record.session.count + ' translated'}</span></div>
      {pending && <p role="status">An earlier request is still processing. Reload saved work to see its result.</p>}
      <p className="translation-guidance">Translate every sentence before checking. You can revise your answers and check again.</p>
      {cacheWarning && <p role="alert">{cacheWarning}</p>}
    </div>}
    <p className="translation-privacy">20 AI requests per day. Generating a set, checking translations, reading a photo and transcribing a recording each use one request. Draft saves are free. Text and feedback are saved to your account; uploaded photos and recordings are not stored by LeseLaut.</p>
  </section>;
}
