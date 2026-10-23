# Backend audit — 23 October 2026

Historical D1 audit. AWS is now authoritative; see [AWS hosting](AWS_HOSTING.md)
and the current [launch checklist](LAUNCH_READINESS.md). Google sign-in and an
isolated AWS restore have since been verified. Do not use the older remaining-work
paragraphs below as the current operational status.

The core backend supports multiple authenticated accounts. This audit verifies
correctness under concurrent local D1 operations; it does not establish a
production user-count or throughput guarantee.

## Verified

- Live pre-release checks: all ten protected GET endpoints returned 401 without
  a Supabase access token. The live D1 binding exposes the expected four tables.
  Recent logs contained a canceled overview request and a crawler 404, not a
  demonstrated database failure. No live learner records were modified for tests.
- Real ES256 JWT verification rejects unsigned/forged identities, foreign keys,
  wrong issuer/audience, expired tokens, missing expiration and non-authenticated
  roles. Header names and client-provided account IDs cannot establish identity.
- Local workerd D1 test: 100 concurrent test accounts, 600 measured API-handler
  operations (500 reads and 100 saves), no cross-account leakage. A first isolated
  run measured p50 83 ms / p95 127 ms. Test identity is injected; JWT verification
  is tested separately. These figures include local dispatch/SQL overhead and
  exclude network distance, real Supabase authentication, production D1 queuing
  and paid AI traffic. They are reproducibility evidence, not a service SLA.
- Ten concurrent edits to one progress document converge through compare-and-swap
  and client retry; tutor session versions reject stale writes. Exports and tutor
  records remain scoped to the authenticated subject.
- Of 100 simultaneous single-unit quota reservations, exactly 20 succeed for one
  account. Two-unit reservations allow exactly ten. Accounts and UTC days remain
  independent; retries of the same stored operation do not reserve quota again.

## Fixes

- Existing account reads no longer rewrite profiles. A progress GET normally
  performs two reads and no writes, versus five database operations previously.
  Changed profile metadata still synchronizes. Existing usernames are preserved;
  new collisions use bounded, subject-derived suffixes instead of up to 10,000
  sequential allocation attempts.
- Progress JSON, vocabulary summaries and word-key lookups are byte-bounded
  before parsing, including streams without Content-Length. The existing progress
  character limit is retained, with UTF-8 bounds below D1's 2 MB row ceiling.
- Account/progress responses use private, no-store caching. Database failures
  return a controlled 503 with no SQL errors, tokens or learner text in responses
  or new diagnostic events. Invalid progress saves do not allocate accounts.
- An append-only migration adds `(user_id, updated_at)` for tutor history.
  EXPLAIN confirms the index serves per-user recent history without a temporary
  sorting tree. All prior migrations and all learner records are preserved.
- `/api/health` performs a minimal SELECT 1 readiness probe and returns only
  `{ "status": "ok" }` or a 503 `{ "status": "unavailable" }`.
- Translation provider 429 errors are distinguished from the learner's daily
  allowance. Saved answers and idempotent operations survive provider backpressure.
- Google OAuth code uses PKCE and the existing Supabase identity. SDK callback
  initialization consumes the authorization code once; legacy email token-hash
  verification and already-issued implicit confirmation links remain supported.
  The Google button appears only when Supabase's
  public provider settings report that Google is enabled.

## Capacity and remaining launch work

Cloudflare documents that one D1 database executes queries sequentially; query
duration and the number of round trips determine throughput. An index and fewer
profile writes reduce load, but cannot prove an arbitrary number of concurrent
production users. The hosting plan and its quotas were not changed or verified.

AI traffic has a separate shared provider capacity. Runtime secret entries for
Groq and OpenAI are present; this audit did not make paid provider calls or verify
the current model permissions and aggregate token limits. Application quota units
are not a provider throughput guarantee: one sentence-generation operation may
retry repeated output internally while reserving one daily unit.

Before a large public launch, measure realistic authenticated production traffic
at an agreed target and watch D1 row reads/writes, queueing, 429/503 rates, provider
limits and p95 latency. The local test uses small progress documents. Very large
histories still need an export/background-job and normalized-history strategy;
the current export reads a consistent account snapshot into one response.

Account deletion spanning Supabase and D1, a retention policy, and an independently
verified production backup/restore drill remain unfinished. Do not claim these
are solved by the new readiness probe. No retention deletion, production restore,
new recurring monitor or data backfill was performed in this audit.

## Running the checks

Use Node 22. The complete suite is `node --test tests/*.test.mjs` after the
production build. `tests/backend-d1.test.mjs` starts an ephemeral local workerd
instance and therefore needs permission to listen on loopback. It applies the
committed migrations to its own database and disposes it afterwards. No live
credentials or production database connection are used. The installed Miniflare
alpha's Node binding proxy stalls, so the test helper executes SQL inside its
ephemeral Worker through local dispatch instead.

Google configuration is intentionally incomplete until the owner follows
[GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md). Provider-disabled behavior is tested;
an actual Google round trip must be checked after configuration.

## Primary references

- [Cloudflare D1 limits and concurrency](https://developers.cloudflare.com/d1/platform/limits/)
- [D1 recovery and Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
