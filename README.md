# LeseLaut

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout`

## Sites Lifecycle

The Sites lifecycle CLI runs the locked dependency install before returning this checkout. Edit the source under `app/`, then checkpoint when a coherent milestone is ready to inspect or share. The remote Sites builder runs `npm run build` against the pushed commit. Do not repeat install or build as a normal pre-checkpoint step.

This starter does not use `wrangler.jsonc`.

`install:ci` is intentionally a single, non-retrying `npm ci`. It refuses a concurrent install for the same project, consumes a matching image-seeded npm cache with `--prefer-offline` while retaining registry fallback for a missing cache object, otherwise downloads and verifies the complete vinext tarball recorded in `package-lock.json`, limits npm to one socket, and terminates a stalled install. `build` applies a short timeout. These helpers target Linux and use GNU `timeout`; they are not native macOS scripts.

Scripts that need writable project-scoped home, npm, XDG, and temporary paths use `scripts/sites-env.sh`. The `dev` and `start` scripts honor the caller's runtime environment and keep Wrangler logs inside the checkout. The generated `.sites-runtime/` directory is disposable and ignored by Git.

## Included Shape

- edit site code under `app/`
- `app/lib/supabase-auth.ts` verifies Supabase user sessions for protected APIs
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `drizzle.config.ts` supports local migration generation when needed

## Authentication

LeseLaut uses Supabase Auth for username, email, and password accounts. The browser
keeps the Supabase session and sends its access token to the account and progress
APIs. Server routes verify every token against the project's JWKS before accessing
Cloudflare D1. Supabase stores passwords; LeseLaut stores only the user's profile,
unique username, and learning progress.

Email confirmation returns through `/auth/confirm`. Both local and deployed URLs
must be present in Supabase's redirect allow list. Production uses
`https://leselaut-german.professor-ut7.chatgpt.site/auth/confirm`, with the same
origin configured as Supabase's Site URL.

## Diagnostic Commands

- `npm run install:ci`: perform the one bounded lockfile install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: start the built Vinext application
- `npm test`: build and verify the rendered development-preview metadata
- `npm run db:generate`: generate Drizzle migrations after schema changes

Use build commands for targeted diagnosis after a remote failure, not as part of the normal checkpoint path.

The timeout defaults can be overridden for a controlled canary with `SITES_INSTALL_TIMEOUT`, `SITES_INSTALL_KILL_AFTER`, `SITES_BUILD_TIMEOUT`, and `SITES_BUILD_KILL_AFTER`. A timeout fails the command; the helpers never retry an unchanged install or build.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

### Writing repair (first tutor milestone)

Chapter writing now uses an account-owned repair loop: a purposeful message task,
explicit draft saving, up to two validated error/style spans, hints, revisions,
and an optional correction reveal. There is no word-count pass gate and no full
corrected answer in the initial response. Writing practice does not update course
mastery scores. Existing historical course scores are preserved, not revalidated.

`/api/tutor/writing` uses Supabase JWT identity and stores records in the existing
Sites D1 database (`tutor_sessions`), not browser storage. Apply the generated
`0002_legal_nehzno.sql` migration with the normal Sites deployment. GET loads a
chapter; POST actions are `draft`, `check`, `reveal`, and `delete`. Mutations use a
version for optimistic concurrency. Checks also require an idempotency request ID.
Account changes invalidate UI requests and owner headers prevent cross-account saves.

A daily atomic quota in `tutor_quotas` permits 20 writing checks per account per UTC
day across tasks and Worker instances. Provider failures count toward the budget.
Provider requests have a 30-second deadline and a 3,000-token output limit. A stale
pending attempt can be recovered after 60 seconds. Invalid, ambiguous, overlapping,
or low-confidence spans are withheld and cannot support task-success evidence.
Model confidence is not calibrated and feedback still needs teacher evaluation.

Records retain drafts and at most 40 attempts per chapter until the learner deletes
that chapter's history. Deletion clears content using a versioned tombstone so stale
tabs cannot restore it; content-free quota counts remain. The app does not control
provider retention. No new provider keys or settings are required.

Assistance is inferred from saved history: first attempt, hint-assisted revision,
or correction-assisted revision. This is recorded assistance, not proof that the
learner used no external help. Same-task success never establishes mastery. Shared
error-pattern memory, unfamiliar delayed tasks, speaking missions, transcript
confirmation, and durable speaking quotas remain subsequent milestones. The
speaking endpoint still has its older IP-based limiter; this release is not a
monetization-ready tutor backend.

Validation: `npx tsc --noEmit`, `npm run lint`, `npx vinext build`, and
`node --test tests/*.test.mjs`. The existing `npm test` wrapper requires GNU
`timeout`; on macOS without it, use the explicit build and test commands above.
Writing API tests use real SQLite queries and mocked authentication/provider
responses to verify ownership, quotas, concurrency, idempotency, deletion,
assistance tracking, and feedback redaction. No paid provider calls are used in tests.
