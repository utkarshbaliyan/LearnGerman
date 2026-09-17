'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Mic, PenLine } from 'lucide-react';
import { ACTIVE_LEVELS, activeLessons, activeReviews, starterCheckpoint, type ActiveLevel } from '@/app/lib/active-learning';
import { reviewDueAt, type ActiveMode } from '@/app/lib/active-progress';
import { useActiveProgress } from '@/app/hooks/use-active-progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
const modes: ActiveMode[] = ['speaking','writing'];
export function CourseMap() {
 const [level,setLevel] = useState<ActiveLevel>('A1');
 const {progress,loading,signedIn,error} = useActiveProgress();
 const lessons = activeLessons.filter(row => row.level === level);
 const completed = lessons.reduce((sum,row) => sum + modes.filter(mode => progress[row.id]?.[mode]?.checked).length,0);
 const next = lessons.flatMap(row => modes.map(mode => ({row,mode}))).find(({row,mode}) => !progress[row.id]?.[mode]?.checked);
 const due = activeReviews.filter(row => row.level === level).flatMap(row => {
  const at = reviewDueAt(row.id,progress);
  return at && at <= Date.now() ? modes.filter(mode => !progress[row.id]?.[mode]?.checked).map(mode => ({row,mode})) : [];
 });
 return <>
  <Tabs value={level} onValueChange={value => setLevel(value as ActiveLevel)}><TabsList aria-label="Learning level">{ACTIVE_LEVELS.map(item => <TabsTrigger value={item} key={item}>{item}</TabsTrigger>)}</TabsList></Tabs>
  <section className="active-next">
   <div><p className="active-eyebrow">{loading ? 'YOUR COURSE' : completed ? 'YOUR NEXT SMALL STEP' : 'START SMALL'}</p><h2>{next ? next.row.communication_goal : 'You’ve completed every task in this level.'}</h2><p>{next ? `${next.row.module_title} · ${next.mode === 'speaking' ? 'Speak' : 'Write'} · ${level === 'A1' ? '3–8' : level === 'A2' ? '8–12' : '12–18'} min` : 'Revisit a task or try a later check in a new situation.'}</p>{next && <Link className="active-primary" href={`/active-learning/${next.row.id}?mode=${next.mode}`}>{completed ? 'Continue' : next.mode === 'speaking' ? 'Start speaking' : 'Start writing'}<ArrowRight size={18}/></Link>}</div>
   <div className="active-progress"><strong>{completed}<span> / 96</span></strong><p>{level} activities completed</p><Progress value={completed / 96 * 100} aria-label={`${completed} of 96 ${level} activities completed`}/><small>{loading ? 'Loading saved progress…' : signedIn ? 'Saved to your account' : 'Sign in to save your progress'}</small></div>
  </section>
  {error && <p role="alert" className="chapter-error">{error} Refresh this page to try again.</p>}
  {!signedIn && !loading && <p><Link href="/account">Sign in</Link> for saved drafts and AI feedback. You can explore all tasks now.</p>}
  {due.length > 0 && <section className="active-review"><h2>Try it in a new situation</h2><p>A short return to something you practised earlier.</p>{due.map(({row,mode}) => <Link key={`${row.id}-${mode}`} href={`/active-learning/${row.id}?mode=${mode}`}>{row.module_title} · {mode}<ArrowRight size={16}/></Link>)}</section>}
  <h2 className="active-map-title">Your {level} course <span>12 modules · develop one answer at a time</span></h2>
  <div className="active-modules">{Array.from({length:12},(_,i) => i+1).map(module => {
   const group = lessons.filter(row => row.module === module);
   const done = group.reduce((sum,row) => sum + modes.filter(mode => progress[row.id]?.[mode]?.checked).length,0);
   return <details key={`${level}-${module}`} className="active-module" open={next?.row.module === module || undefined}>
    <summary><span className="active-module-number">{done === 8 ? <Check size={20}/> : String(module).padStart(2,'0')}</span><span><b>{group[0].module_title}</b><small>{done} / 8 activities completed</small></span><span className="active-expand">+</span></summary>
    <ol>{group.map(row => <li key={row.id}><span>{row.communication_goal}</span><div>{modes.map(mode => <Link key={mode} href={`/active-learning/${row.id}?mode=${mode}`} className={progress[row.id]?.[mode]?.checked ? 'is-practised' : ''} aria-label={`${mode === 'speaking' ? 'Speak' : 'Write'}: ${row.communication_goal}${progress[row.id]?.[mode]?.checked ? ', practised' : ''}`}>{progress[row.id]?.[mode]?.checked ? <Check size={16}/> : mode === 'speaking' ? <Mic size={16}/> : <PenLine size={16}/>} {mode === 'speaking' ? 'Speak' : 'Write'}</Link>)}</div></li>)}</ol>
    {level === 'A1' && module === 1 && <div className="starter-module-check"><b>Try a new introduction</b><p>Use the phrases in a new situation, without an example.</p>{modes.map(mode => <Link key={mode} href={`/active-learning/${starterCheckpoint.id}?mode=${mode}`}>{progress[starterCheckpoint.id]?.[mode]?.checked ? '✓ ' : ''}{mode === 'speaking' ? 'Speak' : 'Write'}</Link>)}</div>}
   </details>;
  })}</div>
  <p className="active-footnote">Completion means your answer included enough relevant detail. Later checks help you see what you can use again; completion is not a B1 certificate.</p>
 </>;
}
