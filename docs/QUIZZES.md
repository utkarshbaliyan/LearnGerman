# Story comprehension quizzes

All 654 story quizzes use a separately reviewed question bank:

| Level | Stories | Questions per story | Total questions |
| --- | ---: | ---: | ---: |
| A1 | 104 | 4 | 416 |
| A2 | 150 | 4 | 600 |
| B1 | 200 | 4 | 800 |
| B2 | 200 | 6 | 1,200 |
| Total | 654 | | 3,016 |

Each quiz has two more questions than its previous edition. The questions use
sequence, speaker and reference tracking, cause, inference, perspective, summary
and links between details. Alternatives distinguish events from intentions,
competing interpretations and limits of what the story establishes. English
question wording remains appropriate to the reading level. Explanations appear
after checking, and answer positions vary across the bank.

## Source review and compilation

`content/reading/quizzes/reviewed.json` retains the editorial record, German source
excerpts and skill tags. Each row records a hash of the unchanged story and an
independent peer review tied to the source and question hashes. Review includes
the full story, all alternatives and the explanation, not only whether a quoted
sentence occurs. This is an editorial review, not independent CEFR certification
or a full teacher review of the curriculum.

`scripts/compile-story-quizzes.mjs` requires all 654 rows together. It rejects
incorrect counts, stale story hashes, missing independent reviews, edits after
review, repeated prompts, invalid alternatives and evidence absent from the
source. At least three comprehension skills and two questions connecting source
excerpts are required in every quiz. Compilation deterministically redistributes
correct-answer positions and writes `app/lib/reading-quizzes.json`, which includes
only the existing learner-facing fields. Run with Node 22:

```sh
node scripts/compile-story-quizzes.mjs
```

A new editorial bank can be supplied explicitly with `--source=path/to/bank.json`.
The full bank must pass validation before either output is written. Tests verify
full coverage, the additional question counts, answer distribution, source and
peer-review binding, matching runtime data, and rejection without overwriting
published data when the candidate is incomplete or its review is stale.

Release validation: 177 tests, the production build and migration verification
passed. Local browser checks covered four- and six-question completion, an
incorrect answer, retry reset, reload persistence and preservation of an earlier
completion after an incorrect repeat attempt.

## Preservation

The question overlay is used by story routes and the retained course chapters.
Story IDs and editions remain unchanged, so previously completed stories stay
completed and can be practised again. The existing all-correct completion rule,
retry flow and percentage scoring work with the expanded counts. No story text,
translation, audio, timing, artwork, saved words, book pages, database migration
or authentication setting is changed by this release.

Some existing source stories contain inconsistent details. Questions avoid using
those inconsistencies as established facts. The manuscripts still need their own
content review; this question update does not claim to resolve all source issues.
