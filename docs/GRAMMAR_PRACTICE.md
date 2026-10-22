# Illustrated grammar lessons

All 144 A1–C1 lessons use an article sequence: a short introduction, an
illustrated scene, a concise working rule, three core explanation paragraphs,
a forms table, a memory aid, optional details, examples and existing practice.
The full authored explanation remains available without repeating its paragraphs
in the article or repeating it again below the exercises. English table columns
start visible; learners can hide them and switch between available tables.

`lesson-scenes.ts` contains 24 original connected scenes, one for each module.
Each has six sentences with English meanings, exact phrase highlights and
sentence-specific grammar notes. Each of the 144 lessons starts on its own
sentence. Tapping another sentence reveals its explanation and offers a link to
the related lesson; a return control restores the current lesson's sentence.
Highlights and the full English translation can be toggled. These are ungraded
exploration controls and do not save scores or change progress.

Existing watercolor topic illustrations provide visual context. No new images
are generated and no story cover assignments are changed. The shared scene is
explicitly labelled as context across a module's six topics, rather than six
supposedly different stories. Illustrations are decorative; text conveys the
complete lesson. Story sentences are keyboard-operable buttons with selected
states, and the meaning/note panel announces updates politely.

The article retains the full source explanation in core paragraphs and optional
detail notes, with exact duplicate paragraphs removed. Regular present-tense
verbs introduce stems, endings and present/future usage before spelling details.
The sein table starts with conjugation; two adjective table display labels match
their source phrase/ending column order. Existing examples can be browsed two at
a time, with English meanings hidden or revealed. The revision comparison retains
its model and reason, including valid alternatives in advanced lessons.

The lesson browser is not sticky over the article. Jump links connect Scene,
Understand, Forms and Practice. Tables scroll internally on narrow screens.
The existing exercise-level hints, feedback, self-check production, next-set
navigation and lesson URL persistence remain intact.

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

The article structure was informed by the sequence of context, usage, forms and
exceptions in [Lingolia's present-tense guide](https://deutsch.lingolia.com/en/grammar/tenses/present-tense).
No Lingolia text, stories or images were copied. New scenes were written for this
curriculum. Advanced checks referenced IDS on the
[Ersatzinfinitiv](https://grammis.ids-mannheim.de/systematische-grammatik/1615),
[recipient passive](https://grammis.ids-mannheim.de/terminologie/390) and
[seit](https://grammis.ids-mannheim.de/konnektoren/406893).

Validation for the illustrated-article release is recorded in its local release
receipt; it covers all 24 scenes and 144 lesson mappings, exact highlights,
retained source paragraphs, unchanged exercises and browser interactions.
