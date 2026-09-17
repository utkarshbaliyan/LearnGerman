import { RECEPTION_CATALOG } from '@/app/lib/reception-catalog';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { ReadingText, ReadingCheck } from '@/app/components/reading-experience';
import { ReadingAudio, ReadingNarrationProvider } from '@/app/components/reading-narration';
import { getReadingContent } from '@/app/lib/reading-content';
import { READING_STORIES, READING_SECTIONS, readingWordCount } from '@/app/lib/reading-path';
export async function generateMetadata({ params }: { params: Promise<{ storyId: string }> }) {
  const content = getReadingContent((await params).storyId);
  return content ? { title: `${content.story.title} · ${content.story.level} story · LeseLaut`, description: content.story.goal } : { title: 'Story not found · LeseLaut' };
}
export default async function StoryPage({ params }: { params: Promise<{ storyId: string }> }) {
  const content = getReadingContent((await params).storyId);
  if (!content) notFound();
  const { story, glosses } = content;
  const companion = RECEPTION_CATALOG.find(item => item.level === story.level && item.chapter === story.courseChapter);
  const next = READING_STORIES[READING_STORIES.findIndex(item => item.id === story.id) + 1];
  return <div className="site-shell"><SiteHeader active="stories" /><main className="reading-reader" key={story.id}>
    <Link className="reading-back" href={`/stories?level=${story.level}`}><ArrowLeft size={17} />{story.level} stories</Link>
    <header><span className="reading-eyebrow">{story.level} · {READING_SECTIONS[story.level][story.section - 1]} · {story.number}/24</span><h1 lang="de">{story.title}</h1><p>{story.goal} <span className="reading-length">{readingWordCount(story.text)} words</span></p></header>
    <ReadingNarrationProvider key={story.id}>
    <ReadingAudio storyId={story.id} />
    <ReadingText story={story} glosses={glosses} />
    </ReadingNarrationProvider>
    <ReadingCheck key={story.id} story={story} />
    {companion && <section className="reception-teaser"><h2>Use this in everyday life</h2><Link href={`/stories/practice/${companion.id}`}>Try a practical reading and listening task →</Link></section>}
    <nav className="reading-reader-next" aria-label="Continue learning"><Link href={`/stories?level=${story.level}`}>{story.level} stories <ArrowRight size={17} /></Link>{next && <Link className="reading-primary" href={`/stories/${next.id}`}>{next.level !== story.level ? `Try the first ${next.level} story` : story.number % 6 === 0 ? 'Start the next section' : 'Next story'} <ArrowRight size={17} /></Link>}</nav>
  </main></div>;
}
