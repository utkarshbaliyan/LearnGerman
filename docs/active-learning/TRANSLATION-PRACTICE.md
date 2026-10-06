# Active Learning: translation practice

The current `/active-learning` page replaces the old task map with English-to-German translation practice. Learners select A1, A2, B1, B2 or C1 and generate 1–12 English sentences. These are AI practice targets, not certified CEFR placement or a mastery assessment.

Learners type German answers, record each answer, or upload a numbered handwritten set. Speech is transcribed and editable before checking; it does not assess pronunciation. Photo extraction preserves mistakes and requires text review and confirmation. Raw uploads are sent to the existing AI provider and are not persisted by LeseLaut. Provider retention is separate from application storage.

Checking returns sentence-level English explanations, actual error spans, optional style suggestions and one possible correct German translation. Valid alternative wording should be accepted. Learners can revise and check again. AI feedback can still be wrong; schema checks establish response consistency, not linguistic correctness.

Exercises, drafts, reviewed imported text and feedback are stored in account-owned `tutor_sessions` records under `translation-…` IDs with `kind: translation-v1`. They use `checks`, rather than the legacy `attempts` field, so they do not imply old course completion. Browser draft recovery is account- and exercise-specific. Old saved attempts remain available to account export; old task URLs redirect to the new page.

The shared daily limit remains 20 requests, resetting at midnight UTC. Generating a set, checking a whole set, transcribing one recording and reading one photo each reserve one request. Draft saves are free. Failed provider calls also consume their reservation. Retrying the same operation ID reuses its saved result or pending state without another charge; unchanged checked answers reuse feedback. Concurrent changes use version checks and pending operations expire after two minutes.

Implementation: `translation-workspace.tsx`, `translation-recording.tsx`, `app/lib/translation-practice.ts` and `app/api/active-learning/translation/`. No database migration or new provider credentials are needed. The historical course design and syllabus documents describe the retired interface.
