# Daily goals and streaks

Home offers two alternatives: complete one new story, or mark five new words familiar. Either earns the day; doing both still earns one day. Opening the site, saving a word to Review, and rating an existing flashcard do not earn a day. A first correct vocabulary guess or a first explicit Learned/Mark as read action counts toward the word goal. Story completion uses the existing completion action, including a fully correct comprehension quiz.

A streak covers consecutive completed calendar days. Yesterday's streak stays available while today's goal is pending; missing a whole day resets the current streak. The best streak and the last seven days are derived from retained first achievements. Repeating a story or switching a word between learned and unlearned cannot move its first achievement to another day.

## Persistence and compatibility

- Story entries carry optional `firstCompletedAt` timestamps. Vocabulary cards carry optional `firstLearned: { key, at }`; the original key avoids double counting when a catalog alias copies a card.
- These fields use the existing authenticated `stories` and `vocabulary` JSON progress scopes. No database migration, new service, subscription, AI call, or scheduled job is required.
- Status follows the existing latest-write rules; first achievements merge independently using the earliest valid timestamp. A newer client or legacy reading-card migration cannot erase an achievement by omitting the field.
- Previously completed/learned and imported items retain their status. They receive no invented history. Timestamp zero records a known pre-existing achievement without earning a day. Streaks begin with newly recorded activity after this feature is installed.
- `learning.daily` saves the browser's IANA timezone when Home is first opened. The earliest settings record wins during account merges, keeping devices on the same calendar. The timezone stays fixed when travelling and is shown beside the reset note.
- Guests save in browser storage; signed-in accounts use existing Supabase authentication and the AWS progress API. Signing into another account uses the existing scope clearing rules. The streak has no separate storage key to leak across accounts.
- Home refreshes time at minute boundaries and on focus/visibility changes. This changes the displayed date and due counts without adding network polling.

Daily story suggestions skip all previously completed stories, including ones later unmarked. The Learn words link opens a visible daily-goal filter at the selected level, excluding currently familiar and previously learned words; saved review words remain eligible for their first learning achievement.

## Review and session consistency

Home and Review share one resolved word pool, including legacy marks, catalog aliases and saved reading words. The session warm-up uses that same due list, limited to three, five or eight words for the selected duration. A saved unfinished session displays its original level and duration even if future session preferences change. Missing/retired stories do not prevent starting another session.

Story completion reads the latest browser storage before each save and persists immediately. Rendering or hydrating another copy of the story hook does not write an older snapshot back over newer progress. Storage failures are reported, and the quiz does not claim a saved completion when persistence fails.

## Verification

`tests/daily-learning.test.mjs` covers first completions, repeated/toggled/imported items, alternative goals, missed days, timezone midnight, both daylight saving transitions, malformed/future metadata, status/achievement merges, aliases, legacy migration and accessible goal rendering. Existing progress, recall-deck, cloud-sync and UI suites remain required in CI.

Local browser checks should use guest test progress, not change a production learner's history: learn five new words, reload Home, complete a new story quiz, and confirm both goals complete while the streak remains one day. Check that Home and Review due counts match. Verify the two themes and narrow layouts before publication.
