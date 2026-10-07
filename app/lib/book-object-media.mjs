// Only release-validated, exact-hash objects can be served or uploaded.
const ROOT = 'books/zwischen-hoersaal-und-arbeitswelt/';
const FILE = /^p(\d{3})-page-[a-f0-9]{12}-[a-f0-9]{8}-qwen-dialogue-opus16-([a-f0-9]{12})\.(webm|json)$/;
const CACHE = 'public, max-age=31536000, immutable';
const error = (status, message, headers = {}) => new Response(message, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');

export function allowedMedia(asset, registry) {
  const match = typeof asset === 'string' && asset.match(FILE);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 200) return null;
  const key = ROOT + asset, entry = registry[key];
  return entry && Number.isSafeInteger(entry.bytes) && entry.bytes > 0 && entry.bytes <= 2 * 1024 ** 2
    && /^[a-f0-9]{64}$/.test(entry.sha256) && entry.sha256.slice(0, 12) === match[2]
    && entry.localFilename === asset.replace(`-${match[2]}.`, '.')
    && entry.contentType === (asset.endsWith('.webm') ? 'audio/webm' : 'application/json') ? { key, entry } : null;
}

export function singleRange(value, size) {
  if (!value || value.includes(',')) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return false;
    start = Math.max(0, size - suffix); end = size - 1;
  } else {
    start = Number(match[1]); end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return false;
    end = Math.min(end, size - 1);
  }
  return { offset: start, length: end - start + 1, end };
}

function matches(value, etag) {
  return value?.split(',').some(tag => tag.trim() === '*' || tag.trim().replace(/^W\//, '') === etag) ?? false;
}

async function validSignature(request, secret, key, entry, now) {
  if (!secret) return false;
  const expiry = request.headers.get('x-media-expiry') ?? '', signature = request.headers.get('x-media-signature') ?? '';
  if (!/^\d{10}$/.test(expiry) || Number(expiry) <= Math.floor(now / 1000) || Number(expiry) > Math.floor(now / 1000) + 900
    || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return false;
  try {
    const bytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/') + '='), c => c.charCodeAt(0));
    const imported = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const message = `PUT\n${key}\n${expiry}\n${entry.bytes}\n${entry.sha256}`;
    return await crypto.subtle.verify('HMAC', imported, bytes, new TextEncoder().encode(message));
  } catch { return false; }
}

export async function bookMediaResponse(request, asset, options) {
  return immutableMediaResponse(request, allowedMedia(asset, options.registry), options);
}

export async function immutableMediaResponse(request, allowed, { bucket, uploadSecret, now = Date.now() }) {
  if (!allowed) return error(404, 'Recording not found.');
  if (!bucket) return error(503, 'Recording storage is unavailable.');
  const { key, entry } = allowed;
  if (request.method === 'PUT') {
    if (!uploadSecret) return error(503, 'Media uploads are disabled.');
    if (!await validSignature(request, uploadSecret, key, entry, now)) return error(403, 'Upload not authorized.');
    if (request.headers.get('content-type')?.split(';')[0].trim() !== entry.contentType) return error(415, 'Incorrect content type.');
    const declared = request.headers.get('content-length');
    if (declared !== null && declared !== String(entry.bytes)) return error(400, 'Incorrect content length.');
    const reader = request.body?.getReader();
    if (!reader) return error(400, 'Missing content.');
    const chunks = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > entry.bytes) { await reader.cancel(); return error(413, 'Content exceeds the permitted size.'); }
      chunks.push(value);
    }
    if (length !== entry.bytes) return error(400, 'Incorrect content length.');
    const data = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
    const checksum = await crypto.subtle.digest('SHA-256', data);
    if (hex(checksum) !== entry.sha256) return error(422, 'Content checksum differs.');
    const current = await bucket.head(key);
    if (current) return current.size === entry.bytes && current.customMetadata?.sha256 === entry.sha256
      ? new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } }) : error(409, 'An immutable object already exists.');
    const created = await bucket.put(key, data, { httpMetadata: { contentType: entry.contentType, cacheControl: CACHE },
      customMetadata: { sha256: entry.sha256 }, sha256: checksum, onlyIf: new Headers({ 'If-None-Match': '*' }) });
    if (!created) {
      const raced = await bucket.head(key);
      if (raced?.size !== entry.bytes || raced.customMetadata?.sha256 !== entry.sha256) return error(409, 'An immutable object already exists.');
    }
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!['GET', 'HEAD'].includes(request.method)) return error(405, 'Method not allowed.', { Allow: 'GET, HEAD, PUT' });
  const object = await bucket.head(key);
  if (!object) return error(404, 'Recording not found.');
  if (object.size !== entry.bytes || object.customMetadata?.sha256 !== entry.sha256) return error(503, 'Recording integrity check failed.');
  const headers = new Headers({ 'Content-Type': entry.contentType, 'Cache-Control': CACHE, 'ETag': object.httpEtag,
    'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', 'X-Media-SHA256': entry.sha256 });
  if (matches(request.headers.get('if-none-match'), object.httpEtag)) return new Response(null, { status: 304, headers });
  if (request.method === 'HEAD') { headers.set('Content-Length', String(object.size)); return new Response(null, { headers }); }
  const validator = request.headers.get('if-range');
  const range = !validator || validator === object.httpEtag ? singleRange(request.headers.get('range'), object.size) : null;
  if (range === false) return error(416, 'Range is outside the recording.', { 'Content-Range': `bytes */${object.size}` });
  const body = await bucket.get(key, range ? { range: { offset: range.offset, length: range.length } } : undefined);
  if (!body || !('body' in body)) return error(503, 'Recording is temporarily unavailable.');
  headers.set('Content-Length', String(range ? range.length : object.size));
  if (range) headers.set('Content-Range', `bytes ${range.offset}-${range.end}/${object.size}`);
  return new Response(body.body, { status: range ? 206 : 200, headers });
}
