'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { useStoryProgress } from '@/app/hooks/use-story-progress';
import type { ReadingLevel, ReadingSummary } from '@/app/lib/reading-path';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export function ReadingPath({ stories, sections, goals, initialLevel }: {
  stories: ReadingSummary[]; sections: Record<ReadingLevel, string[]>; goals: Record<ReadingLevel, string[]>; initialLevel: ReadingLevel;
}) {
  const [level, setLevel] = useState<ReadingLevel>(initialLevel);
  const { completedIds, hydrated } = useStoryProgress();
  const selected = stories.filter(story => story.level === level);
  const completed = selected.filter(story => completedIds.has(story.id)).length;
  const next = selected.find(story => !completedIds.has(story.id)) ?? selected[0];
  return <div className="site-shell"><SiteHeader active="stories" /><main className="reading-path">
    <header className="reading-heading"><div><span className="reading-eyebrow">Read a little. Discover more.</span><h1>Stories</h1><p>One short story at a time, from your first words to connected German.</p></div><BookOpen aria-hidden="true" /></header>
    <Tabs value={level} onValueChange={value => setLevel(value as ReadingLevel)}><TabsList aria-label="Story level">{(['A1', 'A2', 'B1'] as const).map(item => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}</TabsList></Tabs>
    <section className="reading-next" aria-label="Your next story"><div><span className="reading-eyebrow">{completed === 24 ? 'Read again' : completed ? 'Continue your story path' : 'Your first small step'}</span><h2 lang="de">{next.title}</h2><p>{next.goal}</p><Link className="reading-primary" href={`/stories/${next.id}`}>{completed ? 'Continue reading' : 'Read the first story'} <ArrowRight size={18} /></Link></div><div className="reading-count"><strong>{hydrated ? completed : '—'}<small> / 24</small></strong><span>{level} stories completed</span><Progress value={completed / 24 * 100} aria-label={`${completed} of 24 stories completed`} /></div></section>
    <div className="reading-sections" key={level}>{sections[level].map((title, index) => {
      const group = selected.filter(story => story.section === index + 1);
      const done = group.filter(story => completedIds.has(story.id)).length;
      return <details className="reading-section" key={title} open={next.section === index + 1}>
        <summary><span className="reading-section-number">{done === 6 ? <CheckCircle2 aria-label="Section complete" /> : String(index + 1).padStart(2, '0')}</span><span><strong>{title}</strong><small>{goals[level][index]}</small></span><span className="reading-section-count">{done}/6</span></summary>
        <ol>{group.map(story => <li key={story.id}><Link href={`/stories/${story.id}`}><span className="reading-item-number">{completedIds.has(story.id) ? <CheckCircle2 aria-label="Completed" size={20} /> : String(story.number).padStart(2, '0')}</span><span><strong lang="de">{story.title}</strong><small>{story.goal}</small></span><span className="reading-item-length">{story.wordCount} words <ArrowRight size={16} /></span></Link></li>)}</ol>
        {done === 6 && <p className="reading-section-success">Section complete. You practised: {goals[level][index].toLowerCase()}</p>}
      </details>;
    })}</div>
    <footer className="reading-footer"><p>Your reading progress syncs when you’re signed in.</p><Link href="/stories/previous">Previous story library <ArrowRight size={15} /></Link></footer>
  </main></div>;
}
