# Today, personal review and learning evidence

## Combined Today & Review

Home is one learning hub with Today and Review tabs. The shared header has one
Home link; `/review` redirects to `/?view=review` so existing bookmarks
and reader links open the Review tab. Tab changes retain the active daily session
and current recall input. Existing daily preferences, reading sessions, narration,
word stacks and translation mistake review remain available. Home opens directly
with the tabs: its introductory banner and collected-word progress panel are
removed. Collected-word progress remains on Vocabulary.

Four Home cards introduce Stories, Grammar, Vocabulary and Active Learning with
existing illustrations, useful links and section-specific saved progress.
Stories count completions against the current published IDs. Grammar uses the
same required-set merge with legacy course progress and links to its next
unfinished lesson. Vocabulary is a read-only, bounded server calculation of
the same connected catalog statuses used by its page, including reading words
and legacy marks; no migration is written by this summary. Its full catalog is
not downloaded on Home. Account changes abort and clear pending word summaries.
Active Learning adds first-check activity counts to the existing account-owned
memory response. Revisions are not counted twice, generated but unchecked sets
remain separate, and activity is not treated as independent recall evidence.

Review starts with one box containing the words added to Review in the word
library and the story/book stacks. The list deduplicates German headwords and
retains source context. Unmarked catalog words, familiar words and unsaved stack
entries never fill the deck; English synonyms do not add unrelated headwords.
The browser resolves only explicit review keys, across A1–C1, in bounded batches.

The workflow is Review word box → Practice → choose 8, 10 or 12 → flashcards.
If fewer words are available, the round uses only those words, even a single one.
Due words take priority, then the round shuffles its selected words. Learners
recall the German, show the answer and rate Again/Hard/Good/Easy using the existing
FSRS scheduler. Ratings are self-assessments and do not create independent recall
evidence. Mark as read marks a word familiar, removes it from active Review, and
updates Vocabulary/Today while retaining its FSRS memory and source metadata.
The action is available in both the word box and revealed flashcards.

The latest round is validated and saved as `learning.reviewSession` in the
existing account-owned JSON store; no migration is required. Same-round answers
merge across devices, newer rounds survive late offline answers, and interrupted
rounds resume at their next eligible unanswered word. A failed round save retries
without rating the word twice. Words removed elsewhere are skipped. Existing
named decks remain in `learning.decks`; their data and history are preserved.
Account changes clear the active round and pending actions and reload metadata.

Fresh translation mistake practice remains in a collapsible section below the
word deck. The Today tab keeps its existing typed recall,
learning evidence and resumable daily plan.

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

- Illustrated Home sections: all 169 tests, TypeScript, the production build
  and migration contract passed. Tests cover connected vocabulary and legacy
  marks, required grammar sets, bounded read-only summaries, first-check activity,
  revisions and account ownership. Desktop and 320px checks in both themes
  verified illustration loading, no horizontal overflow, matching Home/Vocabulary
  counts and the shared Review shortcut with 8/10/12-word choices.

- Home cleanup: all 165 tests, TypeScript, the production build and migration
  contract passed. Desktop and 320px checks in both themes verified the Home
  navigation label, direct Today/Review tabs and removed introductory banner
  and collected-word panel. The saved Review deck and daily resume stay available.

- Shared Review flashcards: all 165 tests, TypeScript, the production build and
  migration contract passed. Coverage includes explicit word selection without
  synonym filler, 8/10/12 rounds and single-word shortages, round reload/merging,
  familiar marks that preserve FSRS memory, bounded metadata lookup and account
  isolation. Browser checks covered library/story/book sources, hidden answers,
  all four ratings, Mark as read updating Vocabulary, completion and resume.
  Desktop and 320px layouts passed in both themes; the daily plan remains available.

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
