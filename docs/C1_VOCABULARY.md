# C1 advanced vocabulary extension

Release: 7 October 2026. The extension adds **10,000 new headwords**: 6,500 nouns,
1,800 verbs, 1,400 adjectives and 300 adverbs. The public catalog contains
**17,397 distinct German headwords** across A1–C1. A1 870, A2 1,079, B1 2,148 and
B2 3,300 are unchanged, including every earlier identity and progress alias.

## Placement and review limits

This is an **editorial advanced and specialist extension**, not a certified
inventory of words that are inherently C1. It includes useful vocabulary missing
from the earlier levels. CEFR describes communicative competence, not a fixed
10,000-word German checklist. Dictionary evidence establishes a lemma and its
selected sense; word frequency and a source level label do not establish CEFR
certification. The collection has not been fully teacher reviewed.

The MIT-licensed Tartarus C1 corpus has only 2,753 raw entries. The importer
prioritises dictionary headwords matching that source and supplements them with
German dictionary lemmas ranked by estimated usage. The final manifest records
the actual C1-source match count. We do not claim that Tartarus supplied 10,000
C1-rated words.

## Dictionary data and selection

English Wiktionary German entries, via [Kaikki / Wiktextract](https://kaikki.org/dictionary/German/index.html),
were extracted on 3 October 2026 from the 2 September 2026 English Wiktionary dump.
The compressed original has SHA-256
`ff03802fa4d034a80c03fd72a78243834cc06e69d7031c7be9d745a02c78b34e`.

`extract-c1-dictionary.py` selects German nouns, infinitive verbs, adjectives and
adverbs with usable English definitions. It rejects inflections, alternative
forms, spelling redirects, obsolete/marked nonstandard senses, local demonyms,
malformed nominalisations, gender-referencing glosses and abbreviations. Nouns
require a single gender tied to the selected dictionary sense. English senses,
genders and reflexive marking receive targeted corrections. Productive numeric
adverb padding and identified extraction errors are excluded.

`wordfreq` 3.1.1 German `large` data supplies Zipf usage estimates between 2.0 and
4.5, then the builder applies fixed word-class quotas. This frequency interval
is an editorial selection heuristic, not a CEFR classifier. Source order prefers
C1 matches before frequency ranking. One suitable dictionary sense is retained;
other senses and genders can exist. No quotations, examples or dictionary audio
are imported. Topic assignment uses German stems and English keywords and may
need further editorial refinement.

A deterministic 100-entry stratified sample and targeted whole-list scans were
reviewed. This caught spelling aliases, regional tags, nominalised adjective
article mismatches, misleading gloss references and reflexive mismatches. The
review does not certify all 10,000 entries.

## Uniqueness and progress

The existing canonical headword comparator handles Unicode, articles, case,
known verb lemmas, reflexive markers and listed spelling variants. It preserves
`ß` versus `ss` so *Maße* and *Masse* remain separate. C1 must add exactly 10,000
keys and must not collide with any published or legacy A1–B2 key. IDs derive from
headwords (`lexicon-c1-…`) and must not be renumbered. Different lemmas may share
English glosses. Inflectional forms and alternative spellings do not count as
additional words.

Search, topics, word-class/verb-type filters, 120-card rendering batches,
pronunciation playback, quizzes, FSRS flashcards and learned/review flags use the
existing vocabulary behavior. Progress keys, migration, aliases, scheduling,
D1 and Supabase semantics are unchanged; no data migration is required.

## Licensing and reproduction

The adapted lexical data in `app/vocabulary/c1-data.json` and the compact source
snapshot in `content/vocabulary/c1-dictionary-source.json.gz` are **CC BY-SA 4.0**,
separate from application code. Cards link to each original Wiktionary entry;
`/vocabulary/sources`, the data license file and `THIRD_PARTY_NOTICES.md` credit
contributors and describe changes. Source and row hashes are pinned in
`app/vocabulary/c1-provenance.json`.

Rebuild the released rows from the committed compact snapshot, without network
access, Python dependencies or AI requests:

```sh
node scripts/build-c1-vocabulary.mjs
npm test
```

To repeat initial extraction, obtain the checksum-matching Kaikki `.jsonl.gz`,
install `wordfreq==3.1.1` in an isolated Python environment, and run:

```sh
python scripts/extract-c1-dictionary.py /path/to/kaikki-German.jsonl.gz /tmp/candidates.json
C1_DICTIONARY_CANDIDATES=/tmp/candidates.json TARTARUS_C1_DATA_DIR=/path/to/pinned-c1 node scripts/build-c1-vocabulary.mjs
```

The Tartarus input directory must contain its four C1 JSON files and
`source-commit.txt` at `308e64a848f803379ecdbe9a17bf85745be5f85e`.
The public Kaikki download changes; fail on a changed checksum and review a new
snapshot rather than silently importing a different release.

Tests verify counts, global uniqueness, all earlier card/alias fingerprints,
standalone forms, noun articles, known extraction-error exclusions, attribution,
source hashes and mixed earlier/C1 review scheduling. Run using stable Node 22.
