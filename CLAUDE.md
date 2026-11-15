# LeseLaut — start here

Read `docs/DEVELOPMENT_HANDOFF.md` before the first implementation change. It
contains the architecture, laptop storage layout, development commands, known
documentation errors and verification evidence. Snapshot: 14 November 2026.

## Owner's requirements

- Be direct and candid. Keep technical updates short unless detail is requested.
- Publish technical changes to `utkarshbaliyan/LearnGerman` through feature branches
  and PRs. Review the diff, preserve branch protection and pass required checks.
- AWS hosting and Supabase authentication stay in place. Keep additional costs
  close to INR 0. Ask before activating paid services or making destructive changes.
- Keep AI/Active Learning and paid AWS browser RUM off unless the owner explicitly
  resumes them. Preserve existing learner data, login, progress sync and audio.
- Never print or commit credentials, `.env.local`, production data or complete
  runtime configuration. Use disposable test identities for auth/deletion tests.

## Repository and laptop safety

- Working source: `/Users/utkarshbaliyan/Documents/LeseLaut`.
- GitHub: `https://github.com/utkarshbaliyan/LearnGerman`.
- `.git` is a pointer file. The actual Git directory is
  `.local-piper/project-git-local.nosync`; `core.worktree` points back to this root.
  **Do not delete `.local-piper` as a cache: it contains Git history and an older
  registered worktree as well as audio tooling.**
- Some tracked media are macOS `compressed,dataless` files. Small `du` sizes do
  not mean the files are empty. File reads/copies can stall while data materializes.
  `git show HEAD:path` can inspect committed text without reading an offloaded file.
- Inspect `git status`, branch and `git rev-parse --show-toplevel` before editing.
  Do not reset, clean, relocate the project or remove worktrees as routine setup.

## Stack and data

- TypeScript, React 19, Next-style App Router implemented by Vinext 0.0.50 on
  Vite 8. This is not a standard `next dev` / Vercel project.
- Production: CloudFront -> Nginx -> Node 22/Vinext on one ARM EC2 `t4g.small`,
  Mumbai `ap-south-1`, CloudFormation stack `leselaut`.
- Supabase Auth owns identities/passwords and issues JWTs. The AWS backend
  verifies JWTs and uses the authenticated subject for account-owned data.
- Learner data: SQLite on a separate encrypted EBS volume at
  `/var/lib/leselaut/leselaut.sqlite`. Private S3 holds media, releases and backups.
  Supabase is not the production application-progress database.
- `db/index.ts` retains D1 names. AWS builds replace `platform-bindings.ts` with
  `deploy/aws/runtime.mjs`, whose SQLite adapter provides the compatible DB API.
- Default local development uses Cloudflare/Miniflare bindings and local D1/R2
  state. Legacy Cloudflare/Sites build support remains required by CI; it does
  not mean production is hosted on Workers or Pages.
- Local/staging clients share the configured Supabase project unless explicitly
  separated. Local preview is not a sandbox for real authentication identities.

## Development and checks

Use Node 22 for parity with CI; `package.json` requires >=22.13.0. The audited Mac
had Node 26.10.0/npm 11.19.1, so check the active runtime before troubleshooting.

```sh
npm ci --no-audit --no-fund  # only when dependencies need installation
npm run dev               # use the local URL printed by Vite
npx tsc --noEmit
npm test                  # existing Cloudflare target build + full tests
npm run build:aws         # dist/standalone/server.js and deployment files
node scripts/smoke-aws.mjs # disposable local SQLite smoke test
```

Do not assume `npm run start` starts the AWS standalone artifact; the AWS server
has its own runtime configuration. Do not point local tests at live learner data.

## Deployment and boundaries

- `.github/workflows/ci-deploy.yml` requires `check-and-deploy` on an up-to-date
  PR, including admins. Zero human approvals are required; CI is not human review.
- PRs run checks only. Merging to `main` repeats checks, then automatically deploys
  that run's checked archive via short-lived GitHub OIDC, private S3 and AWS SSM.
- Runtime secrets are in SSM SecureString `/leselaut/runtime`, not GitHub build
  inputs. Do not dump that parameter or `/etc/leselaut/runtime.env`.
- Code rollback preserves the latest database. Keep migrations additive and
  backward compatible. A database restore needs separate owner approval.
- Merging `deploy/aws/release.sh` does not update the installed root-owned helper;
  infrastructure, helper and Supabase dashboard changes require separate work.
- Keep both `/` and `/:path*` security-header rules in `next.config.ts` and the
  viewport compatibility plugin unless their locked-Vinext fixes are superseded.
- Cloudflare provides DNS and free consent-gated Web Analytics. Keep manual JS
  installation; automatic injection bypasses consent. Reports are visits/page
  views, not deduplicated people or completed-lesson activity.
- Preserve `public/analytics-boundary.js`: private routes must not share a
  document with the active analytics SDK. See `docs/CLOUDFLARE_ANALYTICS.md`.

## Feature invariants

- Keep stable story/book/card IDs, progress scopes, account-switch cleanup,
  merge rules, bookmarks, FSRS history and Safari-compatible audio range support.
- A daily goal is one newly completed story OR five newly learned words. Both
  together earn one day. Imported achievements get no invented streak history.
- Keep the shared light/dark palette in `app/platform-colours.css`; responsive
  overrides follow in `app/responsive.css`. Check both themes and narrow layouts.
- Account/theme controls belong in the top-right menu. Footer links are About,
  Privacy and Help & contact. Account greetings use the current profile name.
- Existing docs contain historical D1/Sites instructions and an obsolete
  `/Documents/ChatGPT/LeseLaut` path. Prefer current source, AWS hosting docs and
  fresh read-only verification over those older descriptions.
