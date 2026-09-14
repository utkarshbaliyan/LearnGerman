'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Volume2 } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { SpeakingWorkspace } from '@/app/components/speaking-workspace';
import { WritingRepairWorkspace } from '@/app/components/writing-repair-workspace';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { activeLessons, activeTask, type ActiveLesson } from '@/app/lib/active-learning';
import { reviewDueAt, type ActiveMode } from '@/app/lib/active-progress';
import { useActiveProgress } from '@/app/hooks/use-active-progress';
export function ActiveLessonWorkspace({lesson,initialMode}:{lesson:ActiveLesson;initialMode:ActiveMode}) {
 const [mode,setMode] = useState(initialMode), [audioError,setAudioError] = useState('');
 const {progress,error} = useActiveProgress();
 const task = activeTask(lesson.id)!;
 const completed = progress[lesson.id]?.[mode]?.checked;
 const otherMode: ActiveMode = mode === 'speaking' ? 'writing' : 'speaking';
 const index = activeLessons.findIndex(row => row.id === lesson.id);
 const next = !progress[lesson.id]?.[otherMode]?.checked ? {id:lesson.id,mode:otherMode} : activeLessons[index+1] && !lesson.review ? {id:activeLessons[index+1].id,mode:'speaking'} : null;
 const due = lesson.review ? reviewDueAt(lesson.id,progress) : null;
 function hearExample() {
  if (!('speechSynthesis' in window)) { setAudioError('Example audio is unavailable in this browser. You can read it below.'); return; }
  const speech = new SpeechSynthesisUtterance(lesson.example); speech.lang = 'de-DE'; speech.rate = lesson.level === 'A1' ? .8 : .9;
  speech.onerror = () => setAudioError('Example audio could not play. You can read it below.');
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(speech);
 }
 return <div className="site-shell"><SiteHeader active="active-learning"/><main className="active-learning active-lesson">
  <Link href="/active-learning" className="active-back"><ArrowLeft size={16}/> Course overview</Link>
  <p className="active-eyebrow">{lesson.level} · MODULE {lesson.module} · {lesson.review ? 'LATER PRACTICE' : `LESSON ${lesson.lesson} OF 4`}</p>
  <h1>{lesson.communication_goal}</h1><p className="active-intro">{lesson.module_title}</p>
  <Tabs value={mode} onValueChange={value => setMode(value as ActiveMode)}><TabsList aria-label="Practice mode"><TabsTrigger value="speaking">Speaking</TabsTrigger><TabsTrigger value="writing">Writing & photo</TabsTrigger></TabsList></Tabs>
  {!lesson.review && <details className="active-input"><summary>A little help before you start</summary><p>One example. Change the details to make it yours.</p><blockquote lang="de">{lesson.example}</blockquote><Button variant="ghost" onClick={hearExample}><Volume2 size={18}/> Listen to example</Button>{audioError && <p role="status">{audioError}</p>}<details><summary>Useful language</summary><p>{lesson.language_to_teach_or_refresh}</p><Link href="/grammar">Grammar reference</Link> · <Link href="/vocabulary">Vocabulary practice</Link></details></details>}
  {lesson.review && <p className="active-intro">Try this new situation in your own words.{due && due > Date.now() ? ` For a spaced check, return from ${new Date(due).toLocaleDateString()}.` : ''}</p>}
  <section className="active-workspace" aria-label={`${mode} task`}>{mode === 'speaking' ? <SpeakingWorkspace outputTask={task} key={`${lesson.id}-speaking`} taskId={lesson.id}/> : <WritingRepairWorkspace outputTask={task} key={`${lesson.id}-writing`} taskId={lesson.id} prompt={lesson.writing_prompt} suggestedWords={task.suggestedWords}/>}</section>
  {error && <p role="alert" className="chapter-error">{error}</p>}
  {completed && <section className="active-finish"><div><Check/><div><h2>You’ve completed this task.</h2><p>Your answer is developed enough. Practise any corrections, or stop here for today.</p></div></div><div className="active-finish-actions"><Link href="/active-learning">Done for today</Link>{next && <Link className="active-primary" href={`/active-learning/${next.id}?mode=${next.mode}`}>Next activity<ArrowRight size={16}/></Link>}</div></section>}
 </main></div>;
}
