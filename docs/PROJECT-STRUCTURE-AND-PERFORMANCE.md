# Project structure and performance audit

Audit date: 30 September 2026. Baseline: `9f02e8631809be1559a8ba3d225dc22338ad6bc3`.

## Where the project lives

The working repository is `/Users/utkarshbaliyan/Documents/ChatGPT/LeseLaut`.
The Desktop folder with the same name was empty at this audit; it was not a second working copy.
GitHub is `utkarshbaliyan/LearnGerman`. Sites publishes the built application to
`https://leselaut-german.professor-ut7.chatgpt.site` using its separate source repository.

| Folder | Purpose | Deployed? |
| --- | --- | --- |
| `app/` | Routes, React components, client logic, API endpoints and learning datasets | Compiled code and required data |
| `app/lib/` | Stories, book, translations, audio indexes, progress and tutor logic | Required server/client code and data |
| `app/api/` | Account, progress and tutor HTTP endpoints | Server only |
| `public/` | Narration, timing sidecars and favicon; approximately 104.9 MiB | Yes, served on demand |
| `content/` | Editorial data, glosses and dialogue attribution plans | Only imported runtime content; plans support generation/validation |
| `components/`, `hooks/`, `lib/` | Shared interface primitives and helpers | Only used modules |
| `db/`, `drizzle/` | Database schema, access and versioned migrations | Backend/migrations |
| `worker/`, `build/`, `.openai/` | Cloudflare entry point and Sites build/hosting configuration | Relevant build output/configuration |
| `scripts/`, `tests/`, `docs/` | Generation tools, checks and project documentation | No, except build tooling |
| `dist/` | Reproducible deployment output, approximately 114 MiB | This is the release artifact |
| `node_modules/` | Installed development/build dependencies, approximately 1.19 GiB | No; only bundled code |
| `.git/` | Version history and repository metadata, approximately 0.98 GiB | No |
| `.local-piper/` | Local speech tools, models, generation checkpoints and retained intermediate recordings, approximately 2.34 GiB | No |
| `.sites-runtime/` | Development/build caches and tool state, approximately 796 MiB | No |
| `.wrangler/` | Local Cloudflare development state | No; may contain a local development database |

Sizes are logical file lengths, not macOS allocated disk space. Cloud-managed/dehydrated
files can have much smaller allocated sizes. Temporary release copies and Qwen models
also live under `/tmp`; they are not durable backups and are not part of a deployment.
Do not delete models/checkpoints indiscriminately: they support reproducibility and repairs.

## Where learner data lives

Supabase Auth stores identities/authentication. The live Sites D1 database has four
tables, confirmed through the database overview:

- `users`: profile records.
- `user_progress`: Stories, Books/bookmarks, Vocabulary, Grammar and legacy Course progress.
- `tutor_sessions`: drafts, attempts, transcripts, feedback and tutor history.
- `tutor_quotas`: per-user daily usage counts.

Browser local storage provides cache/recovery and synchronizes signed-in progress.
It is not the authoritative replacement for cloud storage. No learner records were
deleted or migrated in this audit. Table names and implementation were inspected;
individual private records and production query timings were not audited. Therefore
this report does not classify any learner records as unnecessary.

## Cleanup findings and changes

- All 1,320 audio/timing files were referenced by current application/content source;
  there were no orphaned audio files. All 454 stories and 200 book recordings remain intact.
- No `... 2.json`/`... 2.webm` duplicates were present in source or existing build output.
- Removed three unreferenced starter images: `public/file.svg`, `globe.svg`, `window.svg`.
- Removed generated `tsconfig.tsbuildinfo` from Git tracking and ignored future build caches;
  the existing local cache was retained.
- Repaired two invalid Git ref filenames containing `main 2`, which blocked source fetches.
  Their file contents were copied to `/tmp/leselaut-git-metadata-recovery-20260930` and
  their commits remain reachable under valid local `refs/recovery/` references.
- Retained dormant Course code and historical content: it is still used by compatibility
  logic/tests and some shared helpers. Deleting it by folder name would be unsafe.
- Retained installed dependencies and local media tools. Their disk usage does not mean
  visitors download those directories. A separate dependency/legacy-code cleanup needs
  an import and behavior audit, not blanket deletion.

## Performance changes

| Item | Before | After |
| --- | --- | --- |
| Story audio component JavaScript | 141,590 bytes | 3,249 bytes |
| Same component, gzip estimate | 32,718 bytes | 1,409 bytes |
| Story audio metadata delivered | Full 454-story index in client code | Selected story asset passed by the server |
| Main-navigation prefetching | All navigation targets explicitly prefetched | Disabled for these links; navigation loads the chosen section |
| Brand/home link | `/` followed by a Stories redirect | Direct `/stories` link |
| Hashed story/book audio browser caching | No explicit long-lived media rule in build | One-year immutable caching for the two versioned media directories |
| Build timeout | Required GNU `timeout`, unavailable on this Mac | Node-based timeout with termination/forced-kill handling |

The audio component's raw size fell 97.7%; this is **not** a 97.7% reduction in total
page size or load time. Gzip figures are reproducible local compression estimates,
not measured live transfers. Book pages already passed their selected recording and
did not include the full story index. Content and voices did not change.

The new `public/_headers` preserves immutable caching for built `/assets/*` and extends
it only to versioned story/book media. It does not cache authenticated APIs. Tests require
every file in those media directories to carry source and voice-plan hashes.
Cloudflare's [static asset header documentation](https://developers.cloudflare.com/workers/static-assets/headers/)
describes this configuration. Live response headers still require verification from
an environment with HTTP access to the site.

## Remaining priorities

1. **Measure actual users/devices.** The live site opened in the in-app browser, but direct
   HTTP measurement returned 403 and the browser tool did not expose navigation/paint
   timing. There is no reliable Lighthouse, LCP, INP, CLS or mobile load-time result here.
   Bundle inspection cannot establish that the site is fast enough for all learners.
2. **Split heavier sections by selected lesson/level.** Grammar's page chunk is 453,577
   bytes (125,824 gzip); Vocabulary's is 351,696 bytes (111,353 gzip). These are individual
   chunks, excluding shared dependencies. Active Learning's shared chunk also contains
   the full lesson dataset. Server-owned compact catalogs and on-demand lesson content
   are the next meaningful payload reduction, with progress/quiz regression coverage.
3. **Reduce global CSS after a selector audit.** The stylesheet is 311,360 bytes raw and
   includes styles for historical interfaces. Remove only selectors proven unused across
   components and responsive/dark states.
4. **Profile saved-history queries.** Active Learning derives completion by expanding
   attempt JSON from `tutor_sessions`. It filters by the authenticated user and has an
   indexed user/task primary key, but work grows with that user's history. Precomputed
   summaries are a scaling improvement; no measured production database bottleneck was
   established. Progress also synchronizes on focus, visibility and a 30-second timer.
5. **Complete operations before scale.** Full account deletion, retention rules, verified
   backup/restore drills and error/latency/cost reporting remain incomplete. See
   `docs/OPERATIONS.md`. Do not delete learner histories to make queries faster.
6. **Keep media growth separate.** The approximately 105 MiB public library is fetched
   by requested path, not as one download. Consider object storage when expansion makes
   deployment size/build times a problem; moving it alone is not proof of faster reading.

The Documents checkout showed another stalled file-copy operation during this audit.
Validation used `/tmp/leselaut-performance-stage`, verified against Git blob hashes and
then updated with this change. Longer term, use one canonical checkout outside cloud-synced
Documents/Desktop; moving the repository and changing sync settings were not done here.

## Validation

The final production build passed. All 73 tests passed using
`node --test --test-concurrency=1 tests/*.test.mjs` against that build after a parallel
Vite test run stalled. No tests were skipped. Checks cover narration/source hashes,
bookmarks, translations, rendered routes, progress merges, authentication, quotas and
the new client-bundle/cache rules. The portable command runner was also checked for
successful exit, nonzero exit, missing command, graceful timeout and forced termination.
