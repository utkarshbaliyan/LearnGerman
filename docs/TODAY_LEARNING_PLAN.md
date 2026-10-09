# Today, personal review and learning evidence

## Execution order

1. Make `/` a Today dashboard. Save the learner's self-selected level, goal and
   time budget; offer one resumable session with word recall, a recommended
   reading/listening activity, comprehension, and short German output.
2. Save tapped story words with their source sentence. Combine these with the
   existing scheduled vocabulary deck. Derive mistake review from account-owned
   translation checks; generate fresh contexts for actual errors, exclude optional
   style, and preserve the existing fresh-set exclusion and 20-request quota.
3. Report completed sessions separately from learning evidence. Record typed word
   attempts before answers are shown; show seven-day recall separately. Use first
   attempts on fresh translation contexts for delayed output evidence, distinguish
   self-reported help from revisions, and never infer CEFR mastery or pronunciation.

## Preservation and delivery

- Keep story IDs, narration/translation components, bookmarks and legacy progress.
- Add one `learning` progress scope to the existing account-owned D1 JSON store;
  no schema migration. Merge independent records and latest preferences across devices.
- Preserve account-switch isolation, drafts, request replay and existing quotas.
- Keep public audience and paused content/artwork automations.
- Test selection, malformed records, merging, delayed timing, assistance,
  account ownership, retries and fresh review generation. Run full regression,
  production build and migration contract. Check desktop/mobile and both themes.
- Push matching source to GitHub and Sites, package with the native Sites workflow,
  deploy, and verify the published entry flow.

## Acceptance

- A new visitor can choose a level/goal/time and start; returning visitors resume.
- Words saved in any story appear in personal review with their original context.
- Today's recall updates the existing vocabulary schedule where applicable.
- Actual translation mistakes reappear later in a new context, with feedback and revision.
- Empty history shows no fabricated learning scores. Immediate repeats, revealed
  answers and corrected revisions do not count as delayed independent success.
- Counts of past completed activities remain history rather than certification.

Time budgets are planning suggestions, not enforced timers. Self-selected levels,
AI feedback and help reports are uncalibrated practice evidence. Real learner and
teacher validation remain necessary after release.

## Verification completed

- 147 tests passed, including account isolation, merge preservation, review
  timing, unchecked reviews, fresh-sentence exclusions, retries and quota usage.
- TypeScript checks, the production build and migration contract passed.
- Desktop/mobile checks covered session resume, reading-only completion, story
  word saving, typed recall, updated schedules and light/dark layouts.
- The local preview required a restart after regression tests refreshed Vite's
  dependency cache; word recall then saved successfully.
