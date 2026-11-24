# Security hardening & 20-point audit (24 November 2026)

This document records the codebase and AWS infrastructure security audit performed on **24 November 2026** and the invariants future developers and AI assistants must preserve.

## Summary of posture

No critical or high-severity vulnerabilities were found. Production runs behind AWS CloudFront (HTTPS, HTTP/2 & HTTP/3 edge normalization, `Managed-CachingDisabled` default behavior), Nginx (`proxy_http_version 1.1`, CloudFront prefix-list Security Group + `X-LeseLaut-Origin` shared header), and Node 22/Vinext with SQLite on an encrypted EBS volume. Supabase Auth handles authentication, passwords, email confirmation, and Google OAuth (PKCE).

## Hardening fixes applied (24 November 2026)

1. **Explicit JWT asymmetric algorithm allowlist (`app/lib/supabase-auth.ts`)**
   - `jwtVerify` explicitly pins `algorithms: ['ES256', 'RS256']` alongside `issuer`, `audience: 'authenticated'`, `requiredClaims: ['sub', 'exp']`, `role === 'authenticated'`, and `account_deletions` lookup.
   - Regression test in `tests/backend-auth.test.mjs` verifies `HS256` and `alg: none` tokens are rejected.
2. **Spoof-resistant client IP resolution (`deploy/aws/traffic.mjs`)**
   - Added `clientAddress(headers, remoteAddress)` which reads the second-to-last `X-Forwarded-For` hop (the viewer IP appended by CloudFront before Nginx appends CloudFront's edge IP) rather than the client-spoofable leftmost IP.
   - Regression test in `tests/live-traffic.test.mjs` verifies forged leftmost `X-Forwarded-For` chains collapse to the single real viewer IP.
3. **Removed unused spoofable IP rate limiter (`app/api/tutor/_shared.ts`)**
   - Deleted the unused `rateLimited()` helper and in-memory `attempts` map that trusted `cf-connecting-ip` (attacker-controlled on AWS CloudFront) and leftmost `x-forwarded-for`. Active tutor routes use DB-backed per-account `reserveTutorQuota`.
4. **Constant-time token digest comparison (`app/api/internal/migration/route.ts`)**
   - Replaced string `!==` on SHA-256 hex digests with `crypto.timingSafeEqual` on raw 32-byte digests. (The endpoint remains disabled/404 by default unless short-lived `LESELAUT_EXPORT_TOKEN_SHA256` + `LESELAUT_EXPORT_EXPIRES` are configured.)
5. **Prototype-safe progress merging (`app/lib/progress-merge.ts`, `app/lib/story-progress.ts`)**
   - Filtered `__proto__`, `constructor`, and `prototype` keys and guarded map lookups with `Object.hasOwn` in `maxNumbers`, `mergeCourse`, `mergeGrammar`, `readStoryProgress`, `mergeStoryProgress`, and `markStory` (matching existing guards in `learning-state.ts`, `recall-decks.ts`, and `progress-sync.ts`).
   - Regression tests added in `tests/security-hardening.test.mjs`.

## Security invariants for future changes

- **Identity & auth:** Always key account data by Supabase UUID `user.id` (`payload.sub`), never by username or display name. Keep `algorithms: ['ES256', 'RS256']` in `app/lib/supabase-auth.ts`.
- **Owner-only `/api/admin/live`:** Authorizes via `user.email` against `LESELAUT_OWNER_EMAILS` / `SITE_OWNER_EMAIL`. Keep email confirmation enforced in Supabase and never add an OAuth provider that returns unverified emails without pinning the owner check to `user.id`.
- **IP headers on AWS:** Never trust `cf-connecting-ip` or the leftmost `x-forwarded-for` entry on AWS CloudFront + Nginx. Use `clientAddress()` in `deploy/aws/traffic.mjs` or per-account DB quotas.
- **Secret comparisons:** Always use `crypto.timingSafeEqual` or `crypto.subtle.verify` for token/HMAC verification; never `===` / `!==`.
- **Untrusted JSON maps:** Reject `__proto__`, `constructor`, `prototype` and use `Object.hasOwn` when merging client-supplied objects into plain records.
- **Caching & media:** Keep `Cache-Control: private, no-store` (or `no-store`) on all `/api/*` routes and keep `/media/*` strictly allowlisted to content-hashed, registry-verified immutable assets.
- **Headers & HTML:** Preserve `deploy/security-headers.json` (`frame-ancestors 'none'`, `object-src 'none'`, no `unsafe-eval`), both `/` and `/:path*` rules in `next.config.ts`, and `<`-escaping in `serializeStructuredData`.
