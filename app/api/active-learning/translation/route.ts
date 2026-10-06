import { z } from 'zod';
import { getD1 } from '@/db';
import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { reserveTutorQuota } from '@/app/api/tutor/_sessions';
import { boundedBody, readAssignmentPhoto } from '@/app/api/tutor/_photo';
import { transcribeGerman } from '@/app/api/tutor/_shared';
import { MAX_PHOTO_BYTES, photoProblem } from '@/app/lib/writing-photo';
import { MAX_SPEAKING_AUDIO_BYTES, speakingAudioProblem } from '@/app/lib/speaking-audio';
import { answerSchema, countSchema, exerciseIdSchema, levelSchema, requestIdSchema, sameAnswers, type TranslationRecord, type TranslationSession, type TranslationOperation } from '@/app/lib/translation-practice';
import { generateTranslationSentences, checkTranslationSentences } from './_ai';

const headers = { 'cache-control': 'no-store' };
const fail = (error: string, status = 400, record?: TranslationRecord) => Response.json({ ...record, error }, { status, headers });
const respond = (record: TranslationRecord) => Response.json(record, { headers });
async function read(db: D1Database, user: string, id: string): Promise<TranslationRecord | null> {
  const row = await db.prepare('SELECT data, version FROM tutor_sessions WHERE user_id = ? AND task_id = ?').bind(user, id).first<{ data: string; version: number }>();
  if (!row) return null;
  const session = JSON.parse(row.data) as TranslationSession;
  if (session.kind !== 'translation-v1') throw new Error('Unexpected exercise record.');
  return { exerciseId: id, version: row.version, session };
}
async function save(db: D1Database, user: string, record: TranslationRecord) {
  const result = record.version === 0
    ? await db.prepare('INSERT INTO tutor_sessions (user_id, task_id, data, version, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT DO NOTHING').bind(user, record.exerciseId, JSON.stringify(record.session), new Date().toISOString()).run()
    : await db.prepare('UPDATE tutor_sessions SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND task_id = ? AND version = ?').bind(JSON.stringify(record.session), new Date().toISOString(), user, record.exerciseId, record.version).run();
  if (!result.meta.changes) return false;
  record.version++; return true;
}
async function fingerprint(value: unknown) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value))))].map(x => x.toString(16).padStart(2, '0')).join('');
}
function existingOperation(record: TranslationRecord, id: string, hash: string) {
  const operation = record.session.operations.find(x => x.id === id);
  if (!operation) return null;
  if (operation.fingerprint !== hash) return fail('This request ID belongs to different work.', 409, record);
  if (operation.status === 'pending') return fail('This request is still processing. Reload saved work shortly; retrying will not use another AI request.', 409, record);
  return operation.status === 'failed' ? fail(operation.error ?? 'This request did not finish. Start a new request to try again.', operation.errorStatus ?? 502, record) : respond(record);
}
async function replay(db: D1Database, user: string, record: TranslationRecord, id: string, hash: string) {
  const op = record.session.operations.find(x => x.id === id);
  if (op?.fingerprint === hash && op.status === 'pending' && Date.now() - Date.parse(op.createdAt) >= 120_000) {
    op.status = 'failed'; op.error = 'This request timed out. Start a new request to try again.'; op.errorStatus = 502;
    if (!await save(db, user, record)) return fail('Your exercise changed. Reload saved work.', 409);
  }
  return existingOperation(record, id, hash);
}
async function authenticate(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return { response: fail('Sign in to generate sentences and check your translations.', 401) };
  const owner = request.headers.get('x-translation-owner');
  if (owner && owner !== user.id) return { response: fail('Your account changed. Reload this exercise.', 409) };
  return { user };
}
export async function GET(request: Request) {
  const auth = await authenticate(request); if (!auth.user) return auth.response;
  try {
    const db = await getD1(), id = new URL(request.url).searchParams.get('exerciseId');
    if (id && !exerciseIdSchema.safeParse(id).success) return fail('Invalid exercise ID.');
    const rows = await db.prepare("SELECT task_id AS exerciseId, json_extract(data, '$.level') AS level, json_extract(data, '$.count') AS count FROM tutor_sessions WHERE user_id = ? AND task_id LIKE 'translation-%' AND json_extract(data, '$.kind') = 'translation-v1' ORDER BY updated_at DESC LIMIT 10").bind(auth.user.id).all<{ exerciseId: string; level: string; count: number }>();
    const selected = id ?? rows.results[0]?.exerciseId;
    const record = selected ? await read(db, auth.user.id, selected) : null;
    if (id && !record) return fail('Exercise not found.', 404);
    return Response.json({ ...record, recent: rows.results }, { headers });
  } catch { return fail('Saved exercises are temporarily unavailable. Your browser draft is safe.', 503); }
}

export async function POST(request: Request) {
  const auth = await authenticate(request); if (!auth.user) return auth.response;
  let body: Record<string, unknown>, upload: File | undefined;
  try {
    const contentType = request.headers.get('content-type') ?? '', multipart = contentType.startsWith('multipart/form-data;');
    const bytes = await boundedBody(request, multipart ? MAX_SPEAKING_AUDIO_BYTES + 16_000 : 30_000);
    if (!bytes) return fail('The request is too large.', 413);
    if (multipart) {
      const form = await new Response(new Blob([bytes.buffer as ArrayBuffer]), { headers: { 'content-type': contentType } }).formData();
      const action = form.get('action'); if (action !== 'speech' && action !== 'photo') return fail('Invalid upload action.');
      if (form.get('consent') !== 'true') return fail('Confirm that this file may be sent to the AI provider.');
      const file = form.get(action === 'photo' ? 'photo' : 'audio'); if (!(file instanceof File)) return fail('Choose a file first.');
      const problem = action === 'photo' ? photoProblem(new Uint8Array(await file.arrayBuffer()), file.type) : speakingAudioProblem(file);
      if (problem) return fail(problem);
      upload = file; body = { action, exerciseId: form.get('exerciseId'), requestId: form.get('requestId'), version: Number(form.get('version')), sentenceIndex: Number(form.get('sentenceIndex')) };
    } else body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('Invalid request.');
  } catch { return fail('Invalid request.'); }
  try {
    const db = await getD1(), user = auth.user.id, action = body.action;
    if (action === 'generate') {
      const config = z.object({ level: levelSchema, count: countSchema, requestId: requestIdSchema }).safeParse(body);
      if (!config.success) return fail('Choose a level from A1 to C1 and 1–12 sentences.');
      const { level, count, requestId } = config.data, id = `translation-${requestId}`, hash = await fingerprint({ action, level, count });
      const previous = await read(db, user, id);
      if (previous) return await replay(db, user, previous, requestId, hash) ?? fail('This exercise already exists.', 409, previous);
      const createdAt = new Date().toISOString();
      const operation: TranslationOperation = { id: requestId, action, fingerprint: hash, status: 'pending', createdAt };
      const record: TranslationRecord = { exerciseId: id, version: 0, session: { kind: 'translation-v1', level, count, createdAt, draftUpdatedAt: createdAt, sentences: [], answers: Array(count).fill(''), checks: [], operations: [operation] } };
      if (!await save(db, user, record)) return fail('This exercise is being generated. Reload saved work shortly.', 409);
      try {
        if (!await reserveTutorQuota(db, user)) { operation.errorStatus = 429; throw new Error('quota'); }
        const history = await db.prepare("SELECT sentence.value AS sentence FROM tutor_sessions AS sessions, json_each(sessions.data, '$.sentences') AS sentence WHERE sessions.user_id = ? AND sessions.task_id LIKE 'translation-%' AND json_extract(sessions.data, '$.kind') = 'translation-v1' AND sentence.type = 'text' ORDER BY sessions.updated_at DESC, sentence.key ASC").bind(user).all<{ sentence: string }>();
        record.session.sentences = await generateTranslationSentences(level, count, requestId, history.results.map(row => row.sentence)); operation.status = 'complete';
      } catch { operation.status = 'failed'; operation.error = operation.errorStatus === 429 ? 'Daily AI limit reached (20 requests). Try again after midnight UTC.' : 'Sentences could not be generated. Generate a new set to try again.'; operation.errorStatus ??= 502; }
      if (!await save(db, user, record)) return fail('Your exercise changed. Reload saved work.', 409);
      return operation.status === 'failed' ? fail(operation.error!, operation.errorStatus, record) : respond(record);
    }
    const id = exerciseIdSchema.safeParse(body.exerciseId);
    if (!id.success) return fail('Invalid exercise ID.');
    const record = await read(db, user, id.data); if (!record) return fail('Exercise not found.', 404);
    if (record.session.sentences.length !== record.session.count) return fail('Generate a complete set of sentences first.', 409, record);
    if (!['draft', 'check', 'speech', 'photo'].includes(String(action))) return fail('Unknown exercise action.');
    let answers: string[] | undefined;
    if (action === 'draft' || action === 'check') {
      const parsed = z.array(answerSchema).length(record.session.count).safeParse(body.answers);
      if (!parsed.success) return fail('Provide one German answer per sentence, with no more than 1,200 characters each.');
      answers = parsed.data;
      if (action === 'check' && answers.some(s => !s.trim() || /\[unclear\]/i.test(s))) return fail('Translate every sentence and resolve unclear text before checking.');
    }
    if (action === 'speech' && (!Number.isInteger(body.sentenceIndex) || Number(body.sentenceIndex) < 0 || Number(body.sentenceIndex) >= record.session.count)) return fail('Choose a valid sentence to record.');
    let hash = '', requestId = '';
    if (action !== 'draft') {
      const parsed = requestIdSchema.safeParse(body.requestId); if (!parsed.success) return fail('A valid request ID is required.'); requestId = parsed.data;
      const fileHash = upload ? [...new Uint8Array(await crypto.subtle.digest('SHA-256', await upload.arrayBuffer()))].map(x => x.toString(16).padStart(2, '0')).join('') : null;
      hash = await fingerprint({ action, answers, sentenceIndex: action === 'speech' ? body.sentenceIndex : null, fileHash });
      const duplicate = await replay(db, user, record, requestId, hash); if (duplicate) return duplicate;
    }
    if (body.version !== record.version) return fail('This exercise changed in another tab. Reload saved work before continuing.', 409, record);
    let expired = false;
    for (const op of record.session.operations.filter(x => x.status === 'pending')) {
      if (Date.now() - Date.parse(op.createdAt) < 120_000) return fail('An AI request is still processing. Reload saved work shortly.', 409, record);
      op.status = 'failed'; op.error = 'The earlier request timed out. Start a new request to try again.'; op.errorStatus = 502; expired = true;
    }
    if (expired && !await save(db, user, record)) return fail('Your exercise changed. Reload saved work.', 409);
    if (action === 'draft') {
      if (body.photoId !== undefined) {
        const photo = record.session.operations.find(x => x.id === body.photoId && x.action === 'photo' && x.status === 'complete');
        if (!photo) return fail('Photo reading not found.', 404);
        photo.confirmedAt = new Date().toISOString();
      }
      record.session.answers = answers!; record.session.draftUpdatedAt = new Date().toISOString();
      if (!await save(db, user, record)) return fail('Your exercise changed. Reload saved work.', 409);
      return respond(record);
    }
    if (action === 'check' && sameAnswers(record.session.checks.at(-1)?.answers ?? [], answers!)) return respond(record);
    if (record.session.operations.length >= 40) return fail('This set has reached its saved-request limit. Generate a new set; your previous work stays saved.');
    if ((action === 'photo' || action === 'speech') && !upload) return fail('Choose a file first.');
    const op: TranslationOperation = { id: requestId, action: action as TranslationOperation['action'], fingerprint: hash, createdAt: new Date().toISOString(), status: 'pending', ...(action === 'speech' ? { sentenceIndex: Number(body.sentenceIndex) } : {}) };
    record.session.operations.push(op);
    if (answers) { record.session.answers = answers; record.session.draftUpdatedAt = op.createdAt; }
    if (!await save(db, user, record)) return fail('Your exercise changed. Reload saved work.', 409);
    try {
      if (!await reserveTutorQuota(db, user)) { op.errorStatus = 429; throw new Error('quota'); }
      if (action === 'check') record.session.checks.push({ id: requestId, createdAt: op.createdAt, answers: answers!, feedback: await checkTranslationSentences(record.session.level, record.session.sentences, answers!) });
      else if (action === 'speech') {
        op.text = await transcribeGerman(upload!);
        if (op.text.length > 1200) throw new Error('Transcript too long.');
      } else {
        const value = await readAssignmentPhoto(new Uint8Array(await upload!.arrayBuffer()), upload!.type, 2);
        if (!value) { op.errorStatus = 422; throw new Error('unreadable'); }
        op.text = value.text; op.uncertain = value.uncertain;
      }
      op.status = 'complete';
    } catch {
      op.status = 'failed'; op.errorStatus ??= 502;
      op.error = op.errorStatus === 429 ? 'Daily AI limit reached (20 requests). Try again after midnight UTC. Your answers are saved.' : op.errorStatus === 422 ? 'The handwriting could not be read. Try a clearer photo or type your translations.' : 'The AI request did not finish reliably. Your saved answers are safe; try again with a new request.';
    }
    if (!await save(db, user, record)) return fail('Your exercise changed. Reload saved work.', 409);
    return op.status === 'failed' ? fail(op.error!, op.errorStatus, record) : respond(record);
  } catch { return fail('Practice is temporarily unavailable. Your browser draft is safe; reload saved work before trying again.', 503); }
}
