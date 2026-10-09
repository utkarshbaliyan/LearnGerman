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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const topicLabel = (topic: string) => (topicLabels as Record<string, string>)[topic] ?? topic.replaceAll('-', ' ');

export function ReadingPath({ stories, initialLevel }: {
  stories: ReadingSummary[]; sections: Record<ReadingLevel, string[]>; goals: Record<ReadingLevel, string[]>; initialLevel: ReadingLevel;
}) {
  const [level, setLevel] = useState<ReadingLevel>(initialLevel);
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');
  const { completedIds, hydrated } = useStoryProgress();
  const selected = stories.filter(story => story.level === level);
  const visible = filterReadingStories(stories, level, topic, query);
  const completed = selected.filter(story => completedIds.has(story.id)).length;
  const next = visible.find(story => !completedIds.has(story.id)) ?? visible[0];
  const topics = [...new Set(selected.flatMap(story => story.topics))].sort((a,b) => topicLabel(a).localeCompare(topicLabel(b)));
  const filtering = topic !== 'all' || !!query.trim();
  return <div className="site-shell"><SiteHeader active="stories" /><main className="reading-path">
    <header className="reading-heading"><p className="reading-breadcrumb">German <span aria-hidden="true">›</span> Stories</p><h1>German Stories</h1><p>Explore {stories.length} German stories about everyday life. Read and listen, discover word meanings, check the English translation and practise with a comprehension quiz.</p></header>
    <Tabs value={level} onValueChange={value => { setLevel(value as ReadingLevel); setTopic('all'); }}><TabsList aria-label="Story level">{[...new Set(stories.map(story => story.level))].map(item => <TabsTrigger key={item} value={item}>{item} / {item === 'A1' ? 'Beginner' : item === 'A2' ? 'Elementary' : item === 'B1' ? 'Intermediate' : 'Upper intermediate'}</TabsTrigger>)}</TabsList></Tabs>
    {level === 'A1' && <p className="book-from-stories">Ready for a longer read? <Link href="/books">Explore the A1 book · 200 pages <ArrowRight size={16} /></Link></p>}
    <div className="reading-filters" role="search" aria-label="Find a story">
      <label>Search stories<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="House, hospital, dative, café…" /></label>
      <label>Situation<select value={topic} onChange={event => setTopic(event.target.value)}><option value="all">All situations</option>{topics.map(item => <option key={item} value={item}>{topicLabel(item)}</option>)}</select></label>
      {filtering && <button type="button" onClick={() => { setQuery(''); setTopic('all'); }}>Clear filters</button>}
    </div>
    <p className="reading-filter-count" role="status">{visible.length} of {selected.length} {level} stories{filtering ? ' match your filters' : ''}. Every story includes narration.</p>
    {next && <section className="reading-next" aria-label="Your next story"><Link href={`/stories/${next.id}`}><span>{completed === selected.length ? 'Read again' : completed ? 'Continue reading' : 'Start reading'}:</span> <strong lang="de">{next.title}</strong> <ArrowRight size={17} /></Link><div className="reading-count"><span>{hydrated ? completed : '—'} / {selected.length} completed</span><Progress value={completed / selected.length * 100} aria-label={`${completed} of ${selected.length} stories completed`} /></div></section>}
    {!visible.length && <p className="reading-empty">No matching stories. Try another word, situation or level, or clear the filters.</p>}
    <ol className="reading-gallery">{visible.map(story => <li key={story.id}><Link className="reading-story-card" href={`/stories/${story.id}`}><StoryArt storyId={story.id} level={story.level} number={story.number} /><span className="reading-card-copy"><span className="reading-card-meta"><span>{story.level}</span><span>{completedIds.has(story.id) ? <CheckCircle2 aria-label="Completed" size={17} /> : `Story ${story.number}`}</span></span><strong lang="de">{story.title}</strong><small>{story.goal}</small><span className="reading-item-length">{story.wordCount} words · {story.hasAudio ? 'Audio' : 'Reading'}</span></span></Link></li>)}</ol>
    <section className="reception-teaser"><h2>Read & listen in everyday life</h2><ul>{RECEPTION_CATALOG.filter(lesson => lesson.level === level).map(lesson => <li key={lesson.id}><Link href={`/stories/practice/${lesson.id}`}>{lesson.title} →</Link></li>)}</ul></section>
    <footer className="reading-footer"><p>Your reading progress syncs when you’re signed in.</p></footer>
  </main></div>;
}
