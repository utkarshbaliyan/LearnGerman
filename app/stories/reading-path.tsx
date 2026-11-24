'use client';
import Link from 'next/link';
import { RECEPTION_CATALOG } from '@/app/lib/reception-catalog';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { StoryArt } from '@/app/components/story-art';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import type { ReadingLevel, ReadingSummary } from '@/app/lib/reading-path';
import { filterReadingStories } from '@/app/lib/reading-library';
import topicLabels from '@/app/lib/reading-topics.json';
import { STORY_LEVELS, storyLevelPath } from '@/app/lib/story-levels';
import { bookForLevel, readingMinutes } from '@/app/lib/book-catalog';
import { Progress } from '@/components/ui/progress';

const topicLabel = (topic: string) => (topicLabels as Record<string, string>)[topic] ?? topic.replaceAll('-', ' ');

export function ReadingPath({ stories, initialLevel }: {
  stories: ReadingSummary[]; sections: Record<ReadingLevel, string[]>; goals: Record<ReadingLevel, string[]>; initialLevel: ReadingLevel;
}) {
  const level = initialLevel;
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { completedIds, hydrated } = useStoryProgress();
  const selected = stories.filter(story => story.level === level);
  const matched = filterReadingStories(stories, level, topic, query);
  const visible = unreadOnly ? matched.filter(story => !completedIds.has(story.id)) : matched;
  const completed = selected.filter(story => completedIds.has(story.id)).length;
  const next = visible.find(story => !completedIds.has(story.id)) ?? visible[0];
  const topicCounts = new Map<string, number>();
  for (const story of selected) for (const item of story.topics) topicCounts.set(item, (topicCounts.get(item) ?? 0) + 1);
  const topics = [...topicCounts.keys()].sort((a, b) => topicLabel(a).localeCompare(topicLabel(b)));
  const popularTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([key]) => key);
  const matchingBook = bookForLevel(level);
  const filtering = topic !== 'all' || !!query.trim() || unreadOnly;
  return <div className="site-shell"><SiteHeader active="stories" /><main className="reading-path">
    <header className="reading-heading"><p className="reading-breadcrumb"><Link href="/stories">German stories</Link> <span aria-hidden="true">›</span> {level}</p><h1>{level} German stories with audio</h1><p>{STORY_LEVELS[level].introduction}</p><p>{stories.length} free stories with narration, English translations, word meanings and comprehension quizzes.</p></header>
    <nav className="story-level-nav" aria-label="Story level">{(Object.keys(STORY_LEVELS) as ReadingLevel[]).map(item => <Link key={item} href={storyLevelPath(item)} aria-current={level === item ? 'page' : undefined}>{item} / {STORY_LEVELS[item].label}</Link>)}</nav>
    {matchingBook && <p className="book-from-stories">Ready for a longer read? <Link href={matchingBook.path}>Read the {level} book: <span lang="de">{matchingBook.title}</span> · 200 pages <ArrowRight size={16} /></Link></p>}
    <div className="reading-filters" role="search" aria-label="Find a story">
      <label>Search stories<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="House, hospital, dative, café…" /></label>
      <label>Situation<select value={topic} onChange={event => setTopic(event.target.value)}><option value="all">All situations</option>{topics.map(item => <option key={item} value={item}>{topicLabel(item)}</option>)}</select></label>
      <label className="reading-unread-toggle"><input type="checkbox" checked={unreadOnly} onChange={event => setUnreadOnly(event.target.checked)} />Unread only</label>
      {filtering && <button type="button" onClick={() => { setQuery(''); setTopic('all'); setUnreadOnly(false); }}>Clear filters</button>}
    </div>
    {popularTopics.length > 0 && <div className="reading-topic-chips" aria-label="Popular situations">
      <button type="button" aria-pressed={topic === 'all'} onClick={() => setTopic('all')}>All</button>
      {popularTopics.map(item => <button key={item} type="button" aria-pressed={topic === item} onClick={() => setTopic(current => current === item ? 'all' : item)}>{topicLabel(item)}</button>)}
    </div>}
    <p className="reading-filter-count" role="status">{visible.length} of {selected.length} {level} stories{filtering ? ' match your filters' : ''}. Every story includes narration.</p>
    {next && <section className="reading-next" aria-label="Your next story"><Link href={`/stories/${next.id}`}><span>{completed === selected.length ? 'Read again' : completed ? 'Continue reading' : 'Start reading'}:</span> <strong lang="de">{next.title}</strong> <ArrowRight size={17} /></Link><div className="reading-count"><span>{hydrated ? completed : '—'} / {selected.length} completed</span><Progress value={completed / selected.length * 100} aria-label={`${completed} of ${selected.length} stories completed`} /></div></section>}
    {!visible.length && <p className="reading-empty">No matching stories. Try another word, situation or level, or clear the filters.</p>}
    <ol className="reading-gallery">{visible.map(story => <li key={story.id}><Link className="reading-story-card" href={`/stories/${story.id}`}><StoryArt storyId={story.id} /><span className="reading-card-copy"><span className="reading-card-meta"><span>{story.level}</span><span>{completedIds.has(story.id) ? <CheckCircle2 aria-label="Completed" size={17} /> : `Story ${story.number}`}</span></span><strong lang="de">{story.title}</strong><small>{story.goal}</small><span className="reading-item-length">~{readingMinutes(story.wordCount)} min · {story.wordCount} words · {story.hasAudio ? 'Audio' : 'Reading'}</span></span></Link></li>)}</ol>
    <section className="reception-teaser"><h2>Read & listen in everyday life</h2><ul>{RECEPTION_CATALOG.filter(lesson => lesson.level === level).map(lesson => <li key={lesson.id}><Link href={`/stories/practice/${lesson.id}`}>{lesson.title} →</Link></li>)}</ul></section>
    <footer className="reading-footer"><p>Your reading progress syncs when you’re signed in.</p></footer>
  </main></div>;
}
