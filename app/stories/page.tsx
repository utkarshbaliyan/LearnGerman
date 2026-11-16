import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { SiteHeader } from '@/app/components/site-header';
import { StoryArt } from '@/app/components/story-art';
import { StructuredData } from '@/app/components/structured-data';
import { READING_STORIES, READING_LEVELS, readingWordCount } from '@/app/lib/reading-path';
import { STORY_LEVELS, storyLevelPath } from '@/app/lib/story-levels';
import { absoluteUrl, pageMetadata, breadcrumbs } from '@/app/lib/seo';
export const metadata = pageMetadata('German Stories with Audio and English Translations',
  'Explore free German short stories from A1 to B2. Read and listen at your level, check English translations, learn words and test your understanding.', '/stories');
export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const requested = (await searchParams).level?.toUpperCase();
  const level = READING_LEVELS.find(item => item === requested);
  if (level) permanentRedirect(absoluteUrl(storyLevelPath(level)));
  return <div className="site-shell"><SiteHeader active="stories" /><main className="discovery-page">
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German stories', path: '/stories' }])} />
    <header className="discovery-intro"><h1>German stories with audio and English translations</h1><p>Explore {READING_STORIES.length} free German short stories about everyday life. Choose a level, listen to the narration and use the English translation or word meanings when you need help.</p></header>
    <nav className="story-level-nav" aria-label="Jump to a level">{READING_LEVELS.map(level => <a key={level} href={`#level-${level.toLowerCase()}`}>{level} · {STORY_LEVELS[level].label}</a>)}</nav>
    <p className="stories-start-hint">New to German? Start with <Link href={storyLevelPath('A1')}>A1</Link>. Every story has audio, tap-to-translate words and a short quiz.</p>
    <div className="stories-levels">{READING_LEVELS.map(level => {
      const stories = READING_STORIES.filter(story => story.level === level), info = STORY_LEVELS[level];
      return <section className="stories-level" id={`level-${level.toLowerCase()}`} key={level} aria-labelledby={`stories-${level}`}>
        <header className="stories-level-header">
          <div>
            <h2 id={`stories-${level}`}><Link href={storyLevelPath(level)}>{level} German stories</Link></h2>
            <p className="reading-eyebrow">{info.label} · {stories.length} stories</p>
            <p>{info.introduction}</p>
          </div>
          <Link className="discovery-more" href={storyLevelPath(level)}>Browse all {stories.length} →</Link>
        </header>
        <ul className="stories-level-grid">{stories.slice(0, 4).map(story => <li key={story.id}>
          <Link className="stories-card" href={`/stories/${story.id}`}>
            <StoryArt storyId={story.id} className="stories-card-art" />
            <strong lang="de">{story.title}</strong>
            <span>{readingWordCount(story.text)} words · Audio & quiz</span>
          </Link>
        </li>)}</ul>
      </section>;
    })}</div>
    <section className="discovery-guide"><h2>How to practise German with a short story</h2><ol><li>Listen once without the translation and notice the situation and main idea.</li><li>Read the German text. Open a word meaning or English translation when a sentence is unclear.</li><li>Listen again while following the text, then answer the comprehension questions.</li><li>Save useful words for review and try describing the story in your own German.</li></ol><p>Start at A1 if you are new to German. If you can follow everyday conversations, try A2 or B1; B2 adds more detailed arguments and implied meaning. The level labels guide practice and are not an exam or certificate.</p><p>For a study routine, follow the <Link href="/course">German self-study course</Link>. For a longer read, explore our <Link href="/books">German books with audio</Link>.</p></section>
  </main></div>;
}
