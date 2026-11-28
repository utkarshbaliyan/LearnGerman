import securityHeaders from './security-headers.json' with { type: 'json' };

// Plain-http localhost (local dev) can't use HTTPS-only rules: Safari would upgrade every asset to https
// and the page renders without CSS/JS. Never true for the deployed site.
const isLocalHttp = url => /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(url ?? '');

export function secureResponse(response, staging = false, requestUrl) {
  const headers = new Headers(response.headers);
  const local = isLocalHttp(requestUrl);
  for (const [key, value] of Object.entries(securityHeaders)) {
    if (local && key === 'Strict-Transport-Security') continue;
    headers.set(key, local && key === 'Content-Security-Policy' ? value.replace(/;\s*upgrade-insecure-requests/, '') : value);
  }
  if (staging) headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
