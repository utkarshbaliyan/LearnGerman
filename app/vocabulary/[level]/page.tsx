import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { pageMetadata, PRIVATE_PAGE_METADATA, breadcrumbs, absoluteUrl } from '@/app/lib/seo';
import { ALL_VOCABULARY, VOCABULARY_CATEGORIES, type VocabularyCategory } from '@/app/vocabulary/data';

// Server-rendered word lists so Google can find the vocabulary (the main /vocabulary page is an app).
// B2 and C1 are left out: very large lists with little search demand.
const LEVELS = { a1: 'A1', a2: 'A2', b1: 'B1' } as const;
type LevelSlug = keyof typeof LEVELS;

const TOPIC_NAMES: Record<VocabularyCategory, string> = {
  'Grundlagen & Kommunikation': 'Basics and communication', 'Familie & Menschen': 'Family and people',
  'Zuhause & Wohnen': 'Home and living', 'Essen & Trinken': 'Food and drink', 'Einkaufen & Kleidung': 'Shopping and clothes',
  'Schule & Lernen': 'School and learning', 'Arbeit & Beruf': 'Work and jobs', 'Stadt & Verkehr': 'City and transport',
  'Reisen & Unterkunft': 'Travel and accommodation', 'Gesundheit & Körper': 'Health and the body',
  'Freizeit, Kultur & Sport': 'Free time, culture and sport', 'Natur, Wetter & Umwelt': 'Nature, weather and environment',
  'Zeit, Zahlen & Mengen': 'Time, numbers and quantities', 'Medien & Digitales': 'Media and digital',
  'Dienstleistungen & Behörden': 'Services and offices', 'Verben': 'Verbs', 'Adjektive & Adverbien': 'Adjectives and adverbs',
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const wordsFor = (level: string) => ALL_VOCABULARY.filter(word => word.level === level);
const isLevel = (value: string): value is LevelSlug => Object.hasOwn(LEVELS, value);

export function generateStaticParams() { return Object.keys(LEVELS).map(level => ({ level })); }

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }) {
  const slug = (await params).level;
  if (!isLevel(slug)) return { title: 'Page not found', ...PRIVATE_PAGE_METADATA };
  const level = LEVELS[slug], count = wordsFor(level).length;
  return pageMetadata(`${level} German Vocabulary List (${count.toLocaleString('en')} Words)`,
    `Free ${level} German vocabulary list with ${count.toLocaleString('en')} words and English meanings, nouns with der/die/das, sorted by topic. Practise them with flashcards.`,
    `/vocabulary/${slug}`);
}

export default async function VocabularyLevelList({ params }: { params: Promise<{ level: string }> }) {
  const slug = (await params).level;
  if (!isLevel(slug)) notFound();
  const level = LEVELS[slug], words = wordsFor(level);
  const topics = VOCABULARY_CATEGORIES.map(category => ({ category, name: TOPIC_NAMES[category],
    words: words.filter(word => word.category === category).sort((a, b) => a.german.replace(/^(der|die|das) /, '').localeCompare(b.german.replace(/^(der|die|das) /, ''), 'de')) }))
    .filter(topic => topic.words.length > 0);
  const others = Object.entries(LEVELS).filter(([key]) => key !== slug);
  return <main className="site-shell vocabulary-sources-page">
    <SiteHeader active="vocabulary" />
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German vocabulary', path: '/vocabulary' }, { name: `${level} word list`, path: `/vocabulary/${slug}` }])} />
    <StructuredData data={{ '@context': 'https://schema.org', '@type': 'LearningResource', name: `${level} German vocabulary list`, url: absoluteUrl(`/vocabulary/${slug}`), inLanguage: ['en', 'de'], educationalLevel: level, learningResourceType: 'Vocabulary list', isAccessibleForFree: true, provider: { '@id': 'https://leselaut.com/#organization' } }} />
    <section className="vocabulary-sources-content">
      <Link href="/vocabulary">← Vocabulary library</Link>
      <h1>{`${level} German vocabulary list`}</h1>
      <p>{words.length.toLocaleString('en')} German words for level {level} with English meanings, grouped by topic. Nouns are listed with their article (der, die, das), so you learn the gender together with the word.</p>
      <p><Link href="/vocabulary"><strong>Practise these words with flashcards →</strong></Link> Your progress is saved, and words you mark go to your review list.</p>
      <nav aria-label="Topics"><h2>Topics</h2><ul>{topics.map(topic => <li key={topic.category}><a href={`#${slugify(topic.name)}`}>{topic.name}</a> ({topic.words.length})</li>)}</ul></nav>
      {topics.map(topic => <section key={topic.category} id={slugify(topic.name)}>
        <h2>{level} vocabulary: {topic.name.toLowerCase()} <span lang="de">({topic.category})</span></h2>
        <table><thead><tr><th scope="col">German</th><th scope="col">English</th></tr></thead>
          <tbody>{topic.words.map(word => <tr key={word.id}><td lang="de">{word.german}</td><td>{word.english}</td></tr>)}</tbody></table>
      </section>)}
      <h2>Other levels</h2>
      <ul>{others.map(([key, name]) => <li key={key}><Link href={`/vocabulary/${key}`}>{name} German vocabulary list</Link></li>)}</ul>
      <p>Level placement is an editorial guide, not an official exam list. See <Link href="/vocabulary/sources">sources and level guidance</Link>.</p>
    </section>
  </main>;
}
