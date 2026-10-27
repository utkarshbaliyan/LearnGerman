import { singleRange } from '../../app/lib/book-object-media.mjs';

function sliceStream(body, offset, length) {
  const reader = body.getReader(); let position = 0, remaining = length;
  return new ReadableStream({
    async pull(controller) {
      try {
        while (remaining > 0) {
          const { value, done } = await reader.read();
          if (done) throw new Error('Truncated static media.');
          const start = Math.max(0, offset - position); position += value.byteLength;
          if (start >= value.byteLength) continue;
          const chunk = value.subarray(start, Math.min(value.byteLength, start + remaining));
          remaining -= chunk.byteLength; controller.enqueue(chunk);
          if (!remaining) { controller.close(); await reader.cancel(); }
          return;
        }
      } catch (error) { await reader.cancel().catch(() => {}); controller.error(error); }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
}

function fixedLength(body, length) {
  if (typeof globalThis.FixedLengthStream !== 'function') return body;
  const stream = new globalThis.FixedLengthStream(length);
  body.pipeTo(stream.writable).catch(() => {}); // Readers receive an aborted stream on mismatch.
  return stream.readable;
}

// Cloudflare's static service currently ignores Range. Slice its identity
// stream without buffering a recording or adding a billed storage service.
export async function staticMediaResponse(request, { assets, registry }) {
  const url = new URL(request.url); url.search = ''; url.hash = '';
  const legacy = url.pathname.startsWith('/audio/');
  let key;
  try { key = decodeURIComponent(legacy ? url.pathname : url.pathname.slice('/media/'.length)); } catch { return new Response(null, { status: 404 }); }
  const registered = (legacy || url.pathname.startsWith('/media/')) && Object.hasOwn(registry, key) ? registry[key] : null;
  if (!registered) return new Response(null, { status: 404 });
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  if (!assets) return new Response(null, { status: 503 });
  const init = method => ({ method, headers: { 'accept-encoding': 'identity' }, redirect: 'manual' });
  const head = await assets.fetch(new Request(url, init('HEAD')));
  await head.body?.cancel();
  if (!head.ok) return new Response(null, { status: head.status === 404 ? 404 : 503 });
  // ASSETS omits Content-Length even for HEAD. Use verified build metadata;
  // FixedLengthStream still aborts a truncated or inconsistent response body.
  const size = registered.bytes, reportedSize = head.headers.get('content-length');
  const type = registered.contentType;
  if (!Number.isSafeInteger(size) || size <= 0 || size > 25 * 1024 * 1024
    || (reportedSize !== null && Number(reportedSize) !== size)) return new Response(null, { status: 503 });
  const etag = `"${registered.sha256}"`;
  const headers = new Headers({ 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes',
    'Cache-Control': legacy ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
  if (etag) headers.set('ETag', etag);
  if (registered) headers.set('X-Media-SHA256', registered.sha256);
  if (etag && request.headers.get('if-none-match')?.split(',').some(value => value.trim() === '*' || value.trim().replace(/^W\//, '') === etag)) {
    headers.delete('Content-Length'); return new Response(null, { status: 304, headers });
  }
  if (request.method === 'HEAD') return new Response(null, { headers });
  const validator = request.headers.get('if-range');
  const range = !validator || validator === etag ? singleRange(request.headers.get('range'), size) : null;
  if (range === false) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Cache-Control': 'no-store' } });
  const response = await assets.fetch(new Request(url, init('GET')));
  if (!response.ok || !response.body || (response.headers.get('content-encoding') && response.headers.get('content-encoding') !== 'identity')) {
    await response.body?.cancel(); return new Response(null, { status: 503 });
  }
  const length = range ? range.length : size;
  headers.set('Content-Length', String(length));
  if (range) headers.set('Content-Range', `bytes ${range.offset}-${range.end}/${size}`);
  return new Response(fixedLength(range ? sliceStream(response.body, range.offset, range.length) : response.body, length), { status: range ? 206 : 200, headers });
}
