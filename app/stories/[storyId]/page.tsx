import { currentReadingEditionId } from '@/app/lib/reading-progress';
import { RECEPTION_CATALOG } from '@/app/lib/reception-catalog';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { ReadingText, ReadingCheck } from '@/app/components/reading-experience';
import { ReadingAudio, ReadingNarrationProvider } from '@/app/components/reading-narration';
import { getReadingContent } from '@/app/lib/reading-content';
import { READING_STORIES, READING_SECTIONS, readingWordCount } from '@/app/lib/reading-path';
import { pageMetadata, PRIVATE_PAGE_METADATA, absoluteUrl, breadcrumbs, organization } from '@/app/lib/seo';
import { storyLevelPath } from '@/app/lib/story-levels';
import { StructuredData } from '@/app/components/structured-data';
export async function generateMetadata({ params }: { params: Promise<{ storyId: string }> }) {
  const content = getReadingContent(currentReadingEditionId((await params).storyId));
  return content ? pageMetadata(`${content.story.title} — ${content.story.level} German Story`, `${content.story.level} German short story with audio, English translations and a comprehension quiz. ${content.story.goal}`, `/stories/${content.story.id}`) : { title: 'Story not found', ...PRIVATE_PAGE_METADATA };
}
export default async function StoryPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params;
  const currentId = currentReadingEditionId(storyId);
  const content = getReadingContent(currentId);
  if (content && currentId !== storyId) permanentRedirect(absoluteUrl(`/stories/${currentId}`));
  if (!content) notFound();
  const { story, glosses, sentenceTranslations } = content;
  const companion = RECEPTION_CATALOG.find(item => item.level === story.level && item.chapter === story.courseChapter);
  const next = READING_STORIES[READING_STORIES.findIndex(item => item.id === story.id) + 1];
  const total = READING_STORIES.filter(item => item.level === story.level).length;
  return <div className="site-shell"><SiteHeader active="stories" /><main className="reading-reader" key={story.id}>
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: `${story.level} German stories`, path: storyLevelPath(story.level) }, { name: story.title, path: `/stories/${story.id}` }])} />
    <StructuredData data={{ '@context': 'https://schema.org', '@type': 'LearningResource', name: story.title, description: story.goal, url: absoluteUrl(`/stories/${story.id}`), inLanguage: 'de', educationalLevel: story.level, learningResourceType: 'Reading and listening practice', isAccessibleForFree: true, publisher: organization }} />
    <Link className="reading-back" href={storyLevelPath(story.level)}><ArrowLeft size={17} />{story.level} stories</Link>
    <header><span className="reading-eyebrow">{story.level} · {READING_SECTIONS[story.level][story.section - 1]} · {story.number}/{total}</span><h1 lang="de">{story.title}</h1><p>{story.goal} <span className="reading-length">{readingWordCount(story.text)} words</span></p></header>
    <ReadingNarrationProvider key={story.id}>
    <ReadingAudio storyId={story.id} asset={content.audio} />
    <ReadingText story={story} glosses={glosses} sentenceTranslations={sentenceTranslations} />
    </ReadingNarrationProvider>
    <ReadingCheck key={story.id} story={story} />
    {companion && <section className="reception-teaser"><h2>Use this in everyday life</h2><Link href={`/stories/practice/${companion.id}`}>Try a practical reading and listening task →</Link></section>}
    <nav className="reading-reader-next" aria-label="Continue learning"><Link href={storyLevelPath(story.level)}>{story.level} stories <ArrowRight size={17} /></Link>{next && <Link className="reading-primary" href={`/stories/${next.id}`}>{next.level !== story.level ? `Try the first ${next.level} story` : next.section !== story.section ? 'Start the next section' : 'Next story'} <ArrowRight size={17} /></Link>}</nav>
  </main></div>;
}
