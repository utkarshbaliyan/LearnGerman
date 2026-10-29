'use client';
import Link from 'next/link';
import { BookOpen, Check, Flame, Sprout } from 'lucide-react';
import { DAILY_WORD_GOAL, type dailyLearningSummary } from '@/app/lib/daily-learning';
import type { ReadingSummary } from '@/app/lib/reading-path';

export function DailyLearning({ summary, story, level, signedIn }: { summary: ReturnType<typeof dailyLearningSummary>; story?: ReadingSummary; level: string; signedIn: boolean }) {
  const goals = [
    { title: 'Discover a new story', detail: 'Complete one story you haven’t finished before.', count: summary.stories, target: 1, href: story ? `/stories/${story.id}` : '/stories', action: 'Read a story', Icon: BookOpen },
    { title: 'Make five words familiar', detail: 'Mark new words learned, or recall them correctly.', count: summary.words, target: DAILY_WORD_GOAL, href: `/vocabulary?level=${level}&goal=daily`, action: 'Learn words', Icon: Sprout },
  ];
  return <section className="daily-learning" aria-labelledby="daily-learning-heading">
    <div className="daily-learning-heading"><div><span className="reading-eyebrow">Your daily goal</span><h2 id="daily-learning-heading">A little German, every day</h2><p>Complete either task to keep your streak going.</p></div><div className="daily-streak"><Flame aria-hidden="true" /><div><strong>{summary.streak}</strong><span>day{summary.streak === 1 ? '' : 's'} in a row</span></div></div></div>
    <div className="daily-week" aria-label="Learning activity over the last seven days">{summary.week.map(day => <div key={day.date} className={`daily-day${day.complete ? ' is-complete' : ''}${day.today ? ' is-today' : ''}`} aria-label={`${day.date}${day.today ? ', today' : ''}: ${day.complete ? 'goal complete' : 'goal not complete'}`} aria-current={day.today ? 'date' : undefined}><span>{day.label}</span><span className="daily-day-mark">{day.complete ? <Check aria-hidden="true" /> : <span aria-hidden="true">{Number(day.date.slice(-2))}</span>}</span></div>)}</div>
    <div className="daily-goals">{goals.map(({ title, detail, count, target, href, action, Icon }) => <article key={title} className={count >= target ? 'is-complete' : ''}><div className="daily-goal-icon">{count >= target ? <Check aria-hidden="true" /> : <Icon aria-hidden="true" />}</div><div className="daily-goal-copy"><h3>{title}</h3><p>{detail}</p><div className="daily-goal-progress"><progress aria-label={title} value={Math.min(count, target)} max={target} /><span>{Math.min(count, target)} / {target}</span></div><Link href={href}>{count >= target ? 'Keep exploring' : action} <span aria-hidden="true">→</span></Link></div></article>)}</div>
    <div className="daily-learning-note"><p role="status">{summary.todayComplete ? 'Daily goal complete. Your streak is saved—see you tomorrow.' : summary.streak ? 'One small task today keeps your streak alive.' : 'Your next completed goal starts your streak.'}</p><span>Best: {summary.best} day{summary.best === 1 ? '' : 's'} · Resets at midnight ({summary.timeZone.replaceAll('_', ' ')}){!signedIn && ' · Sign in to sync'}</span></div>
  </section>;
}
