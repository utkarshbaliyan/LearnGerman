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
