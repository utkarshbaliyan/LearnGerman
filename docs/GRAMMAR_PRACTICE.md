# Practice-first grammar

The 144 A1–C1 lessons combine a short working rule, the existing pattern, a
visible reference table and two source-based notes explaining application.
Learners can choose among a lesson’s tables where several exist and show or hide
an English column. The sein lesson starts with its conjugation; adjective tables
whose source columns contain phrase/ending pairs use matching display labels.

An example explorer presents two distinct source examples at a time, with
meanings visible initially and a control to hide or reveal them. Previous/next
controls make the remaining examples available without a long wall of text.
Source grammar notes remain alongside examples where supplied. A comparison
panel lets learners reveal a taught revision and its reason, hide it again or
try another comparison. It is ungraded exploration; advanced alternatives are
not labelled universally ungrammatical.

Understand, Examples and Practise links let learners jump between the stages.
The lesson browser stays collapsed by default. Fuller notes and source links
remain optional after practice; tables and examples already present in the guide
are not repeated there. Existing exercise-level rule hints, keyboard focus and
direct next-set navigation remain available. Selecting a lesson updates its URL,
so reloading retains the chosen topic. German text preserves capitalisation,
including sie versus Sie. Production remains a model-based self-check.

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

Validation is recorded in the local release receipt. Checks cover the unchanged
exercise bank, source-based table/example/note coverage across all 144 lessons,
accurate headers, duplicate handling and the rendered learning sequence. Browser
checks exercise table switching and meaning controls, example pagination,
comparison reveal/reset, existing answer feedback, lesson navigation and
narrow/desktop layouts in both themes.

Interactive-guide release validation: 185 tests, TypeScript, the production build
and migration verification passed. Browser checks covered the regular-verbs and
advanced infinitive lessons, table selection, English visibility, example
pagination, revision reveal/hide/reset, unchanged exercise feedback, and narrow
layouts in light and dark themes with scrolling confined to tables.
