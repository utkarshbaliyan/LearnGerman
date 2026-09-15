# Learning quality implementation plan

15 September 2026. Deliver in ordered, reviewable releases. Preserve existing work and keep learner-facing instructions short. Completion is practice evidence, not a CEFR certificate.

## 1. Honest practice results — implemented in this release

- Separate chapter reading and listening submissions and stored results.
- Present audio before optional story text. Record whether text was opened in the current visit; do not describe this as verified independent listening.
- Merge the latest result for each skill across devices, including lower results. Preserve legacy combined results and previous completed chapters as history; do not convert them into new separate checks.
- Replace grammar mastery claims with practice completion language.
- Keep grammar errors permissible: the existing tutor taskSuccess flag conflates task accomplishment with error-free grammar, so it is not a suitable new completion gate.

Validation: independent skill updates, lower/latest results, cross-device merge, malformed and legacy records, full regression suite and production build.

Limit: existing comprehension questions still use recognition of familiar story material. This release fixes measurement separation, not assessment validity. Course overview history may retain previous completion while a chapter shows newly separated checks. Repeated checks are still practice.

## 2. Rebuild A1 module 1 as a teaching unit — initial implementation

- Four small lessons: name, origin, home, combined introduction.
- Actual German phrases with meanings, listenable models and one supported attempt before an own-details response.
- A short unfamiliar listening exchange and a separate reading message with authored meaning-based questions.
- A new-context check without visible models. Model/help use recorded consistently for typing, photos and speech; retries after correction remain assisted.
- Link only the relevant grammar and vocabulary; remove syllabus-author language from learner help.
- Success criteria: a new learner can understand the task and attempt it without unexplained prerequisites. No requirement for reasons or long answers in first-day tasks.

## 3. Validate before scaling

- Recruit a German teacher and pilot learners; requires people outside the app, not an automated sign-off.
- Teacher reviews level fit, examples, realistic alternative answers and false corrections.
- Baseline and unfamiliar delayed checks after at least seven days. Track task success without help, recurring errors, completion, latency and cost.
- Do not label unreviewed content validated or promise fluency.

## 4. Extend the proven lesson pattern

- Audit all 36 Active Learning modules against communicative outcomes and prerequisites.
- Replace vague prompts with a recipient, purpose and concrete information/constraints.
- Match model development to each task; treat length as guidance, never as proof of proficiency.
- Map integrated chapters to exact preparation and output tasks in one recommended route.
- Add varied listening and reading genres: conversations, notices, announcements, timetables, forms, messages, emails and accessible opinions.

## 5. Conversation and pronunciation

- Keep one question and recording control on screen; add short responsive follow-ups and practical changes of circumstance.
- Teach asking for repetition, clarification and paraphrasing.
- Provide sound contrasts, stress models and record/compare practice. Audio-based scoring requires separate implementation and validation; transcript evaluation cannot establish pronunciation or fluency.

## 6. Readiness and adaptation

- Skills-based entry checks and unfamiliar end-of-level assessments.
- Separate meaningful task achievement from grammatical accuracy in the tutor rubric.
- Recommend review from recurring errors and delayed reuse, rather than a completion total.
- Readiness evidence across listening, reading, writing and interaction, with teacher calibration. Keep certificates and fluency claims out until supported.

### Module 1 release — 15 September 2026

Implemented four short preparation sequences: taught question/meaning, usable phrase, listening message, separate reading message and a supported fill-in. Preparation is optional and ungraded; its intermediate state is page-local. Own-details writing/photo/speaking retains durable existing tutor progress. Core module-1 attempts are conservatively classified as guided (hint) even if preparation is skipped, avoiding unsupported independent-use evidence. This rule applies to new attempts; historical attempts are unchanged.

Added a separate paired introduction check without visible models, under a distinct task ID. It uses existing account-owned tutor progress, quotas, revisions and feedback. It is accessible from module 1 and after its last lesson; it is not included in the 96 core-activity count. The seven-day return scenario remains separate. The new check is practice evidence, not a calibrated readiness test.

Listening uses browser German speech synthesis with optional transcript and an error fallback. No pronunciation or audio-comprehension certification is claimed. Human review, a recorded multi-speaker listening bank, exact grammar prerequisite links and broader readiness assessment remain outstanding. Validate the teaching sequence before expanding it to the remaining modules.
