# B2 vocabulary expansion

The vocabulary library adds **3,300 new B2 headwords**: 2,050 nouns, 700 verbs,
450 adjectives and 100 adverbs. The public library contains 7,397 unique
headwords: A1 870, A2 1,079, B1 2,148 and B2 3,300.

## Source and placement

The input is the MIT-licensed [Tartarus German B2 vocabulary corpus](https://github.com/bahman-farhadian/tartarus/tree/308e64a848f803379ecdbe9a17bf85745be5f85e/data/word_lists/german/vocabulary/b2)
at revision `308e64a848f803379ecdbe9a17bf85745be5f85e`. The provenance manifest
records the four input SHA-256 hashes and the generated row digest.

B2 is an editorial placement inherited from this source, with structural
checks, a vocabulary audit and targeted corrections/exclusions. It is **not an
independently certified or fully teacher-reviewed list**. The
[Council of Europe B2 descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale)
describe competence across concrete and abstract topics; this collection is
practice material, not an official exam inventory or a guarantee of B2 ability.

We retain dictionary headwords, noun gender, primary noun senses and up to two
short senses for other word classes. Reviewed noun glosses may clarify a sense.
Examples and source plural forms are omitted. Non-German padding, truncated
forms, some slang and name-derived adjectives are excluded; confusing glosses
have targeted corrections in the importer. The importer consumes the source's
order within each word class and stops at the declared quotas. Topic assignment
uses German topic stems and English keyword rules and may need future editorial
refinement. It does not determine the B2 label.

## Uniqueness and learner progress

Comparison uses Unicode normalization, case-insensitive headwords, article
removal, known verb lemmas, reflexive/preposition removal and listed spelling
variants. German `ß` and `ss` remain distinct to avoid conflating *Maße* and
*Masse*. Nouns such as *Stand* and *Sucht* are not mapped to verb conjugations.
English synonyms can occur on different German headwords.

No B2 headword overlaps any existing A1–B1 entry. We consolidate 45 existing
duplicate cards into their earliest placements. The original 4,142 identities
remain unchanged in `LEGACY_VOCABULARY`; retained cards carry the removed IDs,
German forms and English meanings as progress aliases. Legacy ID migration,
modern learned/review keys and the latest FSRS card state survive consolidation.
Historical progress keys are retained. No D1 or Supabase migration is needed.

New B2 IDs derive from normalized headwords rather than row positions. Do not
renumber these cards or remove legacy aliases in later expansions. The UI offers
B2 in the existing level selector for library, practice and review, with the
same search, topic filters and 120-card rendering batches.

## Rebuild and verify

Download `german_noun_b2.json`, `german_verb_b2.json`,
`german_adjective_b2.json` and `german_adverb_b2.json` from the pinned directory
above into an external temporary directory. Save the pinned SHA followed by a
newline as `source-commit.txt` there. Then run:

```sh
TARTARUS_B2_DATA_DIR=/path/to/source node scripts/build-b2-vocabulary.mjs
npm test
```

The generator makes no AI API requests. Tests verify uniqueness across every
level, counts, standalone forms, noun articles, unchanged original identities,
legacy migration, retained review schedules, new B2 progress and the default
rendering batch. Run with a stable Node 22 runtime.
