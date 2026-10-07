# Third-party notices

## Tartarus German vocabulary corpus

The 2,000 extended German B1 headwords in `app/vocabulary/extended-data.ts`
are adapted from the German B1 vocabulary lists in
[Tartarus](https://github.com/bahman-farhadian/tartarus), copyright (c) 2025
Bahman Farhadian. Example sentences and secondary senses are not included.

The 3,300 B2 headwords in `app/vocabulary/b2-data.ts` are adapted from the
German B2 vocabulary lists in the same MIT-licensed project at revision
`308e64a848f803379ecdbe9a17bf85745be5f85e`, copyright (c) 2026 Bahman Farhadian.
Primary English noun senses and selected secondary senses for other word classes
are retained; example sentences are omitted. See `app/vocabulary/b2-provenance.json`,
`scripts/build-b2-vocabulary.mjs` and `docs/B2_VOCABULARY.md`.

Tartarus is distributed under the MIT License:

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## C1 advanced lexical data

The 10,000 C1 extension headwords in `app/vocabulary/c1-data.json` and the
compact dictionary snapshot in `content/vocabulary/c1-dictionary-source.json.gz`
are adapted from English Wiktionary contributors, via Kaikki / Wiktextract by
Tatu Ylonen (2026-09-02 dump, extracted 2026-10-03). These independent lexical
data are **CC BY-SA 4.0**, separately from application code. Each row retains its
original Wiktionary title; C1 library cards link to that page and its contributor
history. See [Wiktionary reuse terms](https://en.wiktionary.org/wiki/Wiktionary:Copyrights)
and [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Changes include selected senses, noun articles, reflexive display, filtering,
targeted English corrections, topic assignment and editorial ordering.
The data are not independently CEFR certified or fully teacher reviewed.

Frequency ranking uses **wordfreq 3.1.1**, by Robyn Speer and contributors;
frequency data are CC BY-SA 4.0 and software is Apache 2.0. The upstream notice
and its source acknowledgments accompany the snapshot in
`content/vocabulary/WORD_FREQ_NOTICE.md`. C1-match prioritisation uses Tartarus
C1 headwords at the same pinned revision as B2, copyright (c) 2026 Bahman
Farhadian, under the MIT licence reproduced above. See
`content/vocabulary/C1-LICENSE.md`, `app/vocabulary/c1-provenance.json` and
`docs/C1_VOCABULARY.md`.
