# Practice-first grammar

The 144 A1–C1 lessons open with one specific working rule (at most 45 words),
the existing pattern and one existing German example with its English meaning.
Practice follows immediately. The lesson browser is collapsed by default, so a
mobile learner does not scroll through the entire roadmap before reaching a task.
The full explanation, forms, further examples, exceptions and source links remain
available under “Need more detail?”. Repeated reference paragraphs and generated
practice instructions are omitted from this optional view.

Learners can reveal a short rule alongside a question, return to the set chooser
or continue directly to the next set. Each new question receives keyboard focus.
Selecting a lesson updates its URL, so reloading retains the chosen topic.
Task text and patterns preserve German capitalisation, including sie versus Sie.
Production remains a model-based self-check and is not independently graded.

## Exercise audit and preservation

The original bank contains 7,200 exercise entries. Their IDs, wording, answers,
feedback, group names and case-sensitive checking are unchanged. A preservation
checksum in `tests/grammar-learning.test.mjs` covers the complete bank.

The audit found 360 exact repeats inside 36 lessons. The practice view presents
6,840 distinct tasks, retaining the first occurrence of each identical task in
its original set. Tasks with the same generic instruction but different tokens
or answers remain distinct. Reusing a grammatical structure in recognition,
building, translation and production is deliberate practice, not an identical
repeat of the same task. All set names and completion requirements remain stable;
existing scores and completions are retained. A new attempt scores its displayed
unique tasks, and the existing best-score rule still applies.

Five choice tasks contain repeated labels, including two repeated correct labels.
Display removes identical labels and deterministically varies option order without
changing the available distinct alternatives or the answer. C1 integrated and
separate infinitive constructions with the same English meaning receive explicit
target hints before checking; neither valid construction is called universally
wrong.

The audit checks coverage, repetition, distinct options, target clarity and
preservation. It does not claim independent teacher review of all 7,200 entries,
CEFR certification or measured learning gains.

## References

The brief rules condense the existing curriculum rather than introduce a new
syllabus. Existing lesson references remain accessible. Precision checks included
[IDS on the Konjunktiv](https://grammis.ids-mannheim.de/sgt/2233?termini=term),
[official 2024 clause and infinitive comma rules](https://grammis.ids-mannheim.de/rechtschreibung/6203)
and [IDS on middle-field order](https://grammis.ids-mannheim.de/progr%40mm/5261).
No story, book, authentication, quota or database migration is changed.

Validation: 183 tests, TypeScript, the production build and migration verification
passed. Browser checks covered short introductions, optional references, choice
feedback, typed answers, sentence building, model-based production, a completed
five-task set, next-set navigation, score persistence, cross-level search, selected
lesson reload, visible German capitalisation, light/dark themes and narrow/desktop
layouts without horizontal page overflow.
