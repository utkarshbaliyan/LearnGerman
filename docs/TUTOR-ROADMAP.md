# LeseLaut tutor implementation roadmap

Objective: help A2–B1 learners independently use German they recognize. Preserve the existing course, account isolation, photo confirmation, quotas and saved repair history.

## 1. Shared memory and personalized follow-up tasks — implemented; validation passing
- Use a stable German error taxonomy across writing and confirmed speaking.
- Derive the shared profile from durable, account-owned attempts. Count distinct scenarios; never count a style suggestion or disputed/invalid correction as a recurring error.
- Separate independent use, hinted repair, correction-assisted repair and delayed use.
- Provide server-defined follow-up scenarios with explicit opportunities to use the construction.
- Require seven days and a different scenario before recording delayed independent reuse. A missing error alone is not proof of correct use.
- Verify ownership, repeat/idempotent reads, date eligibility, source-span validation and deletion propagation.

## 2. Speaking workflow and dialogue missions — in progress
- Authenticate every request; use the shared durable quota and server-owned task definitions.
- Record with explicit consent, cap duration and payload, replay locally, transcribe, then require editable transcript confirmation before language feedback.
- Offer goal-based, 3–6-turn dialogues with responses grounded in the student's last turn.
- Conversation mode: feedback after the exchange. Focus mode: repair after each response.
- Persist confirmed turns and feedback, resume sessions, support deletion. Do not store raw audio or claim pronunciation scoring.

## 3. Graduated help — queued
- Progress through clue, guiding question, partial example and correction with explanation.
- Persist support requests; subsequent attempts inherit the highest assistance already seen.
- Show one or two prioritized errors and identify optional style separately.

## 4. Autosave and recovery — queued
- Debounce authenticated draft saves without interrupting typing or overwriting new edits.
- Preserve unsent work locally under its account and task; restore after reload and retry after reconnect.
- Surface conflicting remote edits and let the student choose; never silently overwrite another browser.

## 5. Feedback challenges — queued
- Let the learner flag incorrect feedback or explain that a correction changes their meaning.
- Save the report with its source attempt and exclude disputed evidence from the learning profile pending review.
- Keep deletion and history views consistent.

## 6. Validation and release — queued
- Automated tests of new state transitions, isolation, quotas, concurrency, assistance, transfer eligibility, recovery and challenges.
- Production build, types and lint; bounded synthetic live-provider checks where needed.
- Commit and push each complete milestone to GitHub. Preserve the running local preview.
- Sites upload/public deployment remains blocked by the earlier automatic approval review until the user authorizes that destination and release.

## Human validation before broad launch — not yet run
- Ten paired speaking/writing scenarios reviewed by a German teacher.
- Pilot with 20–30 A2 learners and unfamiliar delayed tasks after 7+ days.
- Measure independent task success, recurring errors, false corrections, completed repairs, retention, latency and cost.
- These product features and automated checks do not establish educational effectiveness or validated pronunciation assessment.
