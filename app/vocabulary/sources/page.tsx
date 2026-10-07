import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/app/components/site-header';

export const metadata: Metadata = { title: 'Vocabulary Sources and Levels — LeseLaut' };

export default function VocabularySources() {
  return <main className="site-shell vocabulary-sources-page">
    <SiteHeader active="vocabulary" />
    <section className="vocabulary-sources-content">
      <Link href="/vocabulary">← Vocabulary library</Link>
      <h1>Sources and level guidance</h1>
      <p>The C1 extension adds 10,000 distinct German headwords: 6,500 nouns, 1,800 verbs, 1,400 adjectives and 300 adverbs. None repeats an A1–B2 headword under our article, lemma and spelling-variant comparison.</p>
      <h2>What the C1 label means</h2>
      <p>This is an editorial collection for advanced and specialist practice. It also fills useful gaps in earlier levels. A word’s difficulty depends on its meaning and context; not every entry is inherently C1. The collection is not an official examination list and has not been independently CEFR certified or fully teacher reviewed.</p>
      <p><a href="https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale">Council of Europe descriptors</a> describe communicative ability. Memorising a fixed number of words does not establish that ability.</p>
      <h2>C1 dictionary data</h2>
      <p>The English definitions and noun genders are adapted from <a href="https://en.wiktionary.org/">English Wiktionary contributors</a>, extracted through <a href="https://kaikki.org/dictionary/German/index.html">Kaikki / Wiktextract by Tatu Ylonen</a> from the 2 September 2026 dump. Each C1 library card links to its original German dictionary entry and contributor history.</p>
      <p>We select one usable standard sense, shorten terminal punctuation, filter inflections, alternate spellings and marked nonstandard senses, and make targeted corrections. Some entries have multiple genders or meanings; the card teaches its selected sense. Definitions and the adapted C1 lexical dataset are available under <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution–ShareAlike 4.0</a>. This notice applies to that lexical data, separately from the application code.</p>
      <p><a href="https://github.com/rspeer/wordfreq">wordfreq 3.1.1, by Robyn Speer and contributors</a>, supplies usage estimates for selection. These are frequency estimates, not CEFR ratings. We also use the MIT-licensed <a href="https://github.com/bahman-farhadian/tartarus/tree/308e64a848f803379ecdbe9a17bf85745be5f85e/data/word_lists/german/vocabulary/c1">Tartarus C1 list by Bahman Farhadian</a> to prioritise matching headwords.</p>
      <h2>Earlier vocabulary</h2>
      <p>The B1 extension and B2 collection draw on <a href="https://github.com/bahman-farhadian/tartarus">Tartarus</a> under its MIT licence. Earlier cards and their progress identities are retained.</p>
      <p><a href="https://github.com/utkarshbaliyan/LearnGerman/blob/main/docs/C1_VOCABULARY.md">Import method and review limits</a> · <a href="https://github.com/utkarshbaliyan/LearnGerman/blob/main/THIRD_PARTY_NOTICES.md">Full credits and licences</a> · <a href="https://github.com/utkarshbaliyan/LearnGerman/blob/main/app/vocabulary/c1-data.json">Adapted C1 data</a></p>
    </section>
  </main>;
}
