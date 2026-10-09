# Today, personal review and learning evidence

## Combined Today & Review

Home is one learning hub with Today and Review tabs. The shared header has one
Today & Review link; `/review` redirects to `/?view=review` so existing bookmarks
and reader links open the Review tab. Tab changes retain the active daily session
and current recall input. Existing daily preferences, reading sessions, narration,
word stacks and translation mistake review remain available.

Review starts with a named active recall deck builder. Learners choose 5–15
different German card identities from the A1–C1 vocabulary catalog and their saved
story/book words, mixing sources when useful. English meanings appear during
selection; German models remain hidden. Search is bounded to 24 public catalog
results and never sends the full vocabulary catalog to the browser.

Each round shuffles the selected words and asks for typed English-to-German recall.
The existing shared vocabulary action saves the first attempt and FSRS update
before revealing the model. Source-sentence hints and reveals mark assistance.
Deck state saves the same attempt ID; a failed deck save can retry without rating
the word twice. Returning learners resume at the next unchecked word. A completed
round reports unaided, missed and assisted counts; repeated practice does not
become a long-term retention claim.

Deck definitions and their latest rounds use the existing `learning` progress
scope and account-owned D1 JSON store. No migration is required. A deck accepts
5–15 unique canonical keys, safe reading links and at most one first answer per
word per round. Same-round answers merge across devices; the newer round survives
late answers from an old offline round. The UI permits 30 decks while merges
retain valid independent decks created concurrently. Account changes clear deck
selection and active rounds through the existing owner-isolation path.

Scheduled single-word and fresh translation reviews remain available in a
collapsible section below the deck builder. The Today tab continues to show the
shared word counts, existing learning evidence and resumable daily plan.

## Connected reading vocabulary

Stories, embedded course stories, Today readings, and all three book readers have
a word stack. Word clicks collect the displayed form, gloss and source locally in
the current reader. Add to review saves a word into the existing account-owned
`vocabulary` scope, immediately available in Vocabulary, its collected-word filter,
flashcards, Personal Review and Today. Unsaved stack entries are temporary; removing
an entry from the stack does not delete a saved word.

The shared German card key deduplicates articles and the existing supported verb
forms. Unrecognized inflections remain separate forms; this is not a full German
lemmatizer. Saved source context and glosses are retained. Catalog matches keep
their catalog placement, while extra reading forms retain their source level.
The first saved source is retained when the same card is encountered elsewhere.

Existing `learning.words` are copied into the shared deck without deleting their
original records, resetting due dates, or replacing newer vocabulary decisions.
All reading review uses the existing FSRS schedule. Typed attempts and their
card updates are saved together in vocabulary; older learning recalls remain
included without duplication. Self-ratings and familiarity marks remain distinct
from delayed typed recall evidence. Sign-in synchronizes the shared metadata,
schedule and typed recall through the existing D1 progress API; no migration or
authentication changes are needed. New collection is capped at 500 words; merges
retain existing words if concurrent devices exceed the cap. Typed history retains
up to 1,000 attempts.

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

- Combined hub and recall decks: all 159 tests, TypeScript, the production build
  and migration contract passed. Coverage includes 5–15 unique words, malformed
  records, independent device merges, newer-round preservation, shared FSRS and
  recall evidence, cloud account isolation, unique mounted form labels, route
  compatibility and reader bundle performance. Browser checks covered mixed word
  sources, hidden answers, typed failure/success, hints/reveals, round completion,
  tab state, reload/resume, C1 search and the existing daily session. Desktop and
  320px layouts passed in both themes.

- Connected word stacks: all 152 tests, TypeScript, the production build and
  migration contract passed. Desktop and 320px mobile checks covered collection
  in stories and all three books, one-click saving, filtered vocabulary practice,
  typed review, shared due counts and schedule preservation across sources.
- 147 tests passed, including account isolation, merge preservation, review
  timing, unchecked reviews, fresh-sentence exclusions, retries and quota usage.
- TypeScript checks, the production build and migration contract passed.
- Desktop/mobile checks covered session resume, reading-only completion, story
  word saving, typed recall, updated schedules and light/dark layouts.
- The local preview required a restart after regression tests refreshed Vite's
  dependency cache; word recall then saved successfully.
