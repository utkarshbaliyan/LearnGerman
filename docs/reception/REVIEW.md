# Review before expanding the pilot

Status: software/content pilot; not externally teacher-reviewed. Synthetic audio has been checked for nonempty output, matching source text hashes and consistent segment timestamps. These checks do not establish natural pronunciation or level validity.

## Teacher review
For every initial and delayed activity, review: natural German; suitability at its chapter; reading load; spoken speed and pronunciation; whether each correct answer is uniquely supported; distractors; English help; evidence segment accuracy; and whether the later context tests the same ability without simply repeating facts. Record pass / revise / reject and a concrete replacement for each issue.

| Sample | Reading form | Listening form | Review status |
| --- | --- | --- | --- |
| A1 chapter 1 | Registration / library card | Introductions | Pending |
| A1 chapter 9 | Price list / bakery notice | Shopping dialogue | Pending |
| A2 chapter 4 | Appointment email | Voicemail | Pending |
| A2 chapter 18 | Timetable and service notice | Transport announcement | Pending |
| B1 chapter 1 | Comparison of offers | Joint planning | Pending |
| B1 chapter 4 | Service email | Problem-solving call | Pending |

Lesson URLs: `/stories/practice/reception-{a1|a2|b1}-{chapter:02}-v1`. All source texts, answer keys and evidence appear in `app/lib/reception-data.json`. The corresponding listening files are in `public/audio/reception`; their segment times are in `app/lib/reception-audio.json`.

## Learner pilot
Recruit separately with consent; do not share account data or contact users automatically. Test 20–30 learners matched to their current level. Ask learners to try without help first while leaving support available. Observe confusion, unclear controls and recording quality on common phones. Have a teacher independently assess a sample of responses.

Use first-check comprehension, support use, repeat improvement and 7+ day new-context performance. Do not treat a replay, completion, high repeat score or time spent as proof of proficiency. Track reading and listening separately. The optional written summary is a self-check and must not be counted as AI-assessed writing.

The current product stores up to 20 check records per activity, retaining the first and latest 19, plus first exposure and support use. It records playback starts and whether roughly 90% of audio played; seeking to the end alone does not satisfy that check. These are client-reported practice observations. It does not store summaries or collect user recordings for this pilot.

## Expansion decision
Revise confusing/incorrect content before adding chapters. Expand only after teacher approval and learner evidence show manageable difficulty and useful delayed transfer. Add professionally reviewed human dialogue and more genres; synthetic pilot recordings do not close the entire listening gap.
