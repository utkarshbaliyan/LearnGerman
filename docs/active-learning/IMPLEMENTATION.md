# Active Learning implementation

Implemented 13 September 2026. The original design remains a research proposal; this document describes the implemented scope.

- Separate course map and versioned task URLs: 36 modules, 144 paired lessons and 36 paired return scenarios (288 core activities plus 72 later activities).
- Authenticated writing with automatic draft saves, revisions, confirmed photo transcription, focused corrections, explanations and correction challenges.
- Speaking question, recording, automatic submission on stop, replay, re-recording and optional recognition correction. Assessment is transcript-based; no pronunciation or B1 fluency certification.
- Account-owned progress derives from completed checks in durable tutor sessions. It counts practice, not mastery. Failed requests and draft saves do not complete activities. Writing and speaking remain separate; deleting a task's history updates its progress.
- Later scenarios become suggested seven days after a module's eight core activities were first checked. This is a practice schedule, not validated transfer evidence.
- Existing shared quotas, optimistic concurrency, idempotency and deletion controls remain in use. Photos and audio are processed without adding permanent raw-media storage.

## Validation and remaining educational work

Regression tests cover task resolution across all levels, short typed/photo answers, retries, account isolation, separate mode progress, deletion, due scheduling and rendered routes. Provider responses are mocked in automated tests.

The content has not had external German-teacher validation. This release provides authored prompts and listenable example sentences; it does not implement fully adaptive multi-turn conversations, formal placement, teacher-scored end-of-level assessment or a fluency certificate. Continue teacher review and learner pilots before making outcome claims. The full curriculum design includes these further teaching and evaluation steps.

## Response development update — 14 September 2026

Speaking guidance: early A1 5–15 seconds, later A1 15–40 seconds, A2 30–60 seconds, B1 60–120 seconds. These are product practice targets, not official CEFR durations. Active Learning recordings can last up to three minutes and show elapsed recording time. Duration does not earn completion: audio is still assessed through its transcript.

The tutor now evaluates task development separately from grammar. Insufficient responses receive a gap explanation and up to three task-specific follow-up questions. B1 has a conservative anti-trivial-response floor (25 transcript words / 35 writing words and 15 distinct tokens); passing that floor does not pass semantic assessment. Repetition and unrelated filler must not satisfy the rubric. Missing or invalid assessment data fails closed with a retry instruction.

Completion and next-activity recommendations require the latest checked response to have sufficient development. Previous drafts and attempts remain saved; earlier checks without a development assessment need a fresh check and are no longer counted as completed activities. Minor grammar corrections alone do not block task completion. This replaces the earlier count-every-check progress rule and is not a fluency or mastery assessment.
