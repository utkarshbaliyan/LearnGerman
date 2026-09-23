'use client';
import Link from 'next/link';
import { RECEPTION_CATALOG } from '@/app/lib/reception-catalog';
import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import type { ReadingLevel, ReadingSummary } from '@/app/lib/reading-path';
import { filterReadingStories } from '@/app/lib/reading-library';
import topicLabels from '@/app/lib/reading-topics.json';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const topicLabel = (topic: string) => (topicLabels as Record<string, string>)[topic] ?? topic.replaceAll('-', ' ');

export function ReadingPath({ stories, sections, goals, initialLevel }: {
  stories: ReadingSummary[]; sections: Record<ReadingLevel, string[]>; goals: Record<ReadingLevel, string[]>; initialLevel: ReadingLevel;
}) {
  const [level, setLevel] = useState<ReadingLevel>(initialLevel);
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');
  const [narratedOnly, setNarratedOnly] = useState(false);
  const { completedIds, hydrated } = useStoryProgress();
  const selected = stories.filter(story => story.level === level);
  const visible = filterReadingStories(stories, level, topic, query, narratedOnly);
  const completed = selected.filter(story => completedIds.has(story.id)).length;
  const next = visible.find(story => !completedIds.has(story.id)) ?? visible[0];
  const topics = [...new Set(selected.flatMap(story => story.topics))].sort((a,b) => topicLabel(a).localeCompare(topicLabel(b)));
  const filtering = topic !== 'all' || !!query.trim() || narratedOnly;
  return <div className="site-shell"><SiteHeader active="stories" /><main className="reading-path">
    <header className="reading-heading"><div><span className="reading-eyebrow">Read a little. Discover more.</span><h1>Stories</h1><p>One short story at a time, from your first words to connected German.</p><p>{stories.length} stories about everyday life. Start with the guided path or explore a situation below.</p></div><BookOpen aria-hidden="true" /></header>
    <Tabs value={level} onValueChange={value => { setLevel(value as ReadingLevel); setTopic('all'); }}><TabsList aria-label="Story level">{(['A1', 'A2', 'B1'] as const).map(item => <TabsTrigger key={item} value={item}>{item} · {stories.filter(story => story.level === item).length}</TabsTrigger>)}</TabsList></Tabs>
    <div className="reading-filters" role="search" aria-label="Find a story">
      <label>Search stories<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="House, hospital, dative, café…" /></label>
      <label>Situation<select value={topic} onChange={event => setTopic(event.target.value)}><option value="all">All situations</option>{topics.map(item => <option key={item} value={item}>{topicLabel(item)}</option>)}</select></label>
      <label className="reading-audio-filter"><input type="checkbox" checked={narratedOnly} onChange={event => setNarratedOnly(event.target.checked)} />With recorded audio</label>
      {filtering && <button type="button" onClick={() => { setQuery(''); setTopic('all'); setNarratedOnly(false); }}>Clear filters</button>}
    </div>
    <p className="reading-filter-count" role="status">{visible.length} of {selected.length} {level} stories{filtering ? ' match your filters' : ''}. Recorded audio is available for the first 24 stories in each level; the new collection is reading practice.</p>
    {next && <section className="reading-next" aria-label="Your next story"><div><span className="reading-eyebrow">{completed === selected.length ? 'Read again' : filtering ? 'Explore this situation' : completed ? 'Continue your story path' : 'Your first small step'}</span><h2 lang="de">{next.title}</h2><p>{next.goal}</p><Link className="reading-primary" href={`/stories/${next.id}`}>{filtering ? 'Read this story' : completed ? 'Continue reading' : 'Read the first story'} <ArrowRight size={18} /></Link></div><div className="reading-count"><strong>{hydrated ? completed : '—'}<small> / {selected.length}</small></strong><span>{level} stories completed</span><Progress value={completed / selected.length * 100} aria-label={`${completed} of ${selected.length} stories completed`} /></div></section>}
    {!visible.length && <p className="reading-empty">No matching stories. Try another word, situation or level, or clear the filters.</p>}
    <div className="reading-sections" key={`${level}-${topic}-${query}-${narratedOnly}`}>{sections[level].map((title, index) => {
      const group = selected.filter(story => story.section === index + 1);
      const shown = visible.filter(story => story.section === index + 1);
      if (!shown.length) return null;
      const done = group.filter(story => completedIds.has(story.id)).length;
      const goal = goals[level][index] ?? `More short stories about ${title.toLowerCase()}.`;
      return <details className="reading-section" key={title} open={filtering || next?.section === index + 1}>
        <summary><span className="reading-section-number">{done === group.length ? <CheckCircle2 aria-label="Section complete" /> : String(index + 1).padStart(2, '0')}</span><span><strong>{title}</strong><small>{goal}</small></span><span className="reading-section-count">{done}/{group.length}</span></summary>
        <ol>{shown.map(story => <li key={story.id}><Link href={`/stories/${story.id}`}><span className="reading-item-number">{completedIds.has(story.id) ? <CheckCircle2 aria-label="Completed" size={20} /> : String(story.number).padStart(2, '0')}</span><span><strong lang="de">{story.title}</strong><small>{story.goal}</small></span><span className="reading-item-length">{story.wordCount} words · {story.hasAudio ? 'Audio' : 'Reading'} <ArrowRight size={16} /></span></Link></li>)}</ol>
        {done === group.length && <p className="reading-section-success">Section complete. You practised: {goal.toLowerCase()}</p>}
      </details>;
    })}</div>
    <section className="reception-teaser"><h2>Read & listen in everyday life</h2><ul>{RECEPTION_CATALOG.filter(lesson => lesson.level === level).map(lesson => <li key={lesson.id}><Link href={`/stories/practice/${lesson.id}`}>{lesson.title} →</Link></li>)}</ul></section>
    <footer className="reading-footer"><p>Your reading progress syncs when you’re signed in.</p><Link href="/stories/previous">Previous story library <ArrowRight size={15} /></Link></footer>
  </main></div>;
}
