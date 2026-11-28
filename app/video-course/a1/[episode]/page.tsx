import Link from 'next/link';
import { ArrowDown, Download } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { pageMetadata, breadcrumbs } from '@/app/lib/seo';
import { getReadingStory } from '@/app/lib/reading-path';
import { A1_EPISODES, blocksFor, episodePath, getEpisode, hasFullPractice, youtubeIdFor } from '@/app/video-course/course';
import { courseWords } from '@/app/video-course/course-vocab';
import { LessonWords } from '@/app/video-course/lesson-words';
import { VideoEmbed } from '@/app/video-course/video-embed';
import { EpisodeBlocks } from '@/app/video-course/episode-blocks';
import { Flashcards } from '@/app/video-course/flashcards';
import { MistakesReview } from '@/app/video-course/mistakes';
import { VideoCourseGate } from '@/app/video-course/owner-gate';
import { VIDEO_COURSE_PUBLIC } from '@/app/lib/feature-availability';
import type { Episode } from '@/app/video-course/types';

type Props = { params: Promise<{ episode: string }> };

export async function generateMetadata({ params }: Props) {
  const e = getEpisode((await params).episode);
  if (!e) return {};
  return {
    ...pageMetadata(`A1 Episode ${e.n}: ${e.title} — German Video Lesson`, `${e.goal} Watch the A1 German video lesson, then practise the vocabulary and grammar (${e.grammarTitle}).`.slice(0, 165), episodePath(e.n)),
    ...(VIDEO_COURSE_PUBLIC ? {} : { robots: { index: false, follow: false } }),
  };
}

function GrammarCard({ e }: { e: Episode }) {
  return <div className="vc-grammar-card">
    <h3>{e.grammarTitle}</h3>
    {e.board.length > 0 && <ul className="vc-board" lang="de">{e.board.map(b => <li key={b}>{b}</li>)}</ul>}
    {e.mistake && <p className="vc-mistake">Typical mistake: <span className="vc-wrong" lang="de">{e.mistake.wrong}</span> → <strong lang="de">{e.mistake.right}</strong></p>}
    {e.examples.length > 0 && <ul className="vc-examples">{e.examples.map(x => <li key={x.de}><span lang="de">{x.de}</span><em>{x.en}</em></li>)}</ul>}
  </div>;
}

export default async function EpisodePage({ params }: Props) {
  const e = getEpisode((await params).episode);
  if (!e) notFound();
  const prev = A1_EPISODES.find(x => x.n === e.n - 1), next = A1_EPISODES.find(x => x.n === e.n + 1);
  const matchingStory = getReadingStory(`reading-a1-${String(e.n).padStart(2, '0')}-v1`);
  const blocks = blocksFor(e);
  const source = { episode: e.n, title: e.title, href: episodePath(e.n) };
  const main = courseWords(e, ['core', 'topic', 'sentence']), bonus = courseWords(e, ['website']);
  // scripts/build-video-course-pdf.py writes one PDF per episode with full practice.
  const pdf = hasFullPractice(e.n) ? `/video-course/pdf/a1-episode-${e.n}.pdf` : null;
  const extras = {
    words: <>
      <Flashcards episode={e.n} words={main} source={source} />
      <p className="vc-vocab-link">Words you add to review are saved in your <Link href="/vocabulary">Vocabulary</Link>.</p>
      <details className="vc-wordlist-toggle"><summary>Word list · {main.length + bonus.length} words in this lesson</summary><LessonWords words={[...main, ...bonus]} source={source} /></details>
      {bonus.length > 0 && <details className="vc-bonus"><summary>Bonus flashcards: {bonus.length} extra words (not in the video)</summary><Flashcards episode={e.n} words={bonus} source={source} track={false} /></details>}
    </>,
    grammar: <GrammarCard e={e} />,
  };

  return <div className="site-shell"><SiteHeader active="course" /><main className="discovery-page vc-page">
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Video course', path: '/video-course' }, { name: `Episode ${e.n}`, path: episodePath(e.n) }])} />
    <VideoCourseGate>
    <nav className="vc-crumbs"><Link href="/video-course">← A1 video course</Link></nav>
    <header className="vc-head vc-hero"><span className="reading-eyebrow">A1 · Episode {e.n} · {e.location}</span><h1 lang="de">{e.title}</h1>
      <p>{/[.!?]$/.test(e.english) ? e.english : `${e.english}.`} <strong>After this episode you can:</strong> {e.goal.charAt(0).toLowerCase() + e.goal.slice(1)}</p>
      <div className="vc-hero-actions">
        <a className="vc-btn vc-hero-start" href="#vc-blocks">Start practice <ArrowDown aria-hidden="true" /></a>
        {pdf && <a className="vc-btn-ghost vc-download-ghost" href={pdf} download><Download aria-hidden="true" /> Worksheet PDF</a>}
      </div></header>

    <VideoEmbed youtubeId={youtubeIdFor(e.n)} title={`LeseLaut A1 Episode ${e.n}: ${e.title}`} chapters={e.chapters} />

    <EpisodeBlocks episode={e.n} blocks={blocks} extras={extras}
      next={next ? { href: episodePath(next.n), title: `Episode ${next.n}: ${next.title}` } : undefined}
      story={matchingStory ? { href: `/stories/${matchingStory.id}`, title: matchingStory.title } : undefined} />
    {!hasFullPractice(e.n) && <p className="vc-note">Full practice for this episode (video questions, grammar, listening, reading, writing, speaking and the test) is coming soon.</p>}

    <section id="review" className="vc-block vc-review" aria-label="Your mistakes"><h2>Review</h2><MistakesReview episode={e.n} /></section>

    <nav className="vc-pager">{prev ? <Link href={episodePath(prev.n)}>← {prev.n}. {prev.title}</Link> : <span />}{next && <Link href={episodePath(next.n)}>{next.n}. {next.title} →</Link>}</nav>
    </VideoCourseGate>
  </main></div>;
}
