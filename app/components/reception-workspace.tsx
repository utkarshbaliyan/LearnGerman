'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReceptionActivity, ReceptionLesson } from '@/app/lib/reception-types';
import type { ReceptionAudio } from '@/app/lib/reception';
import { beginReception, mergeReceptionProgress, questionCorrect, receptionAnswered, receptionDueAt, receptionResultLabel, receptionScore, recordReceptionAttempt, supportReception, type ReceptionProgress, type ReceptionRecord } from '@/app/lib/reception-progress';
import { receptionChapterId } from '@/app/lib/reception-catalog';
import { useCourseProgress } from '@/app/hooks/use-course-progress';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_SYNCED_EVENT } from '@/app/lib/cloud-progress-keys';
import { Button } from '@/components/ui/button';

const ownerNow = () => localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY) ?? 'guest';
const timeLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`;

export function ReceptionWorkspace({lesson,audio}: {lesson: ReceptionLesson;audio: Record<string,ReceptionAudio>}) {
 const {progress,hydrated,updateChapter}=useCourseProgress();
 const [owner,setOwner]=useState('');
 const [selection,setSelection]=useState('reading-guided');
 const [now,setNow]=useState(0);
 useEffect(()=>{
  const refresh=()=>{setOwner(ownerNow());setNow(Date.now());};refresh();
  const timer=setInterval(()=>setNow(Date.now()),60_000);
  window.addEventListener(PROGRESS_SYNCED_EVENT,refresh);window.addEventListener('storage',refresh);
  return()=>{clearInterval(timer);window.removeEventListener(PROGRESS_SYNCED_EVENT,refresh);window.removeEventListener('storage',refresh);};
 },[]);
 const chapterId=receptionChapterId(lesson.level,lesson.chapter);
 const records=mergeReceptionProgress(progress.chapters[chapterId]?.reception,undefined);
 const due=receptionDueAt(records,lesson.guided.map(a=>a.id));
 const unlocked=!!due&&now>=due;
 const transfer=selection.endsWith('transfer');
 const activity=(transfer?lesson.transfer:lesson.guided).find(a=>selection.startsWith(a.skill))!;
 function change(update: (current: ReceptionProgress)=>ReceptionProgress) {
  if(!hydrated||!owner||owner!==ownerNow())return;
  updateChapter(chapterId,current=>({...current,reception:update(mergeReceptionProgress(current.reception,undefined))}));
 }
 return <div className="reception-workspace">
  <nav className="reception-tabs" aria-label="Practice activity">{lesson.guided.map(a=><button type="button" key={a.id} aria-pressed={selection===`${a.skill}-guided`} onClick={()=>setSelection(`${a.skill}-guided`)}>{a.skill==='reading'?'Read':'Listen'}{records[a.id]?.attempts.length?' · checked':''}</button>)}</nav>
  {transfer&&<p className="reading-eyebrow">A different situation</p>}
  {(!transfer||unlocked)?<ReceptionTask key={`${activity.id}-${owner}`} activity={activity} audio={audio[activity.id]} record={records[activity.id]} enabled={hydrated} owner={owner}
   onStart={()=>change(current=>current[activity.id]?.startedAt?current:beginReception(current,activity.id,new Date().toISOString()))}
   onSupport={()=>change(current=>supportReception(current,activity.id,new Date().toISOString()))}
   onCheck={(score,audioComplete,playbackStarts)=>change(current=>recordReceptionAttempt(current,activity.id,{id:crypto.randomUUID(),checkedAt:new Date().toISOString(),score,audioComplete,playbackStarts}))}/>:<p>Loading your practice…</p>}
  <section className="reception-later" aria-label="Later practice"><h2>Try it in a new situation</h2>
   {unlocked?<><p>Ready for your later check. Start without help if you can.</p><div className="reception-tabs">{lesson.transfer.map(a=><button key={a.id} type="button" aria-pressed={selection===`${a.skill}-transfer`} onClick={()=>setSelection(`${a.skill}-transfer`)}>{a.skill==='reading'?'New reading':'New listening'}{records[a.id]?.attempts.length?' · checked':''}</button>)}</div></>:<p>{due?`Available ${new Date(due).toLocaleDateString(undefined,{day:'numeric',month:'long'})} — seven days after your initial checks.`:'Check both activities first. A different reading and listening task will open seven days later.'}</p>}
  </section>
  <p className="reception-note">Practice results sync when you’re signed in.</p>
  <Link href={`/course/${lesson.level.toLowerCase()}/chapter-${lesson.chapter}#story`}>Back to the course chapter →</Link>
 </div>;
}

function ReceptionTask({activity,audio,record,enabled,owner,onStart,onSupport,onCheck}:{
 activity:ReceptionActivity;audio?:ReceptionAudio;record?:ReceptionRecord;enabled:boolean;owner:string;
 onStart:()=>void;onSupport:()=>void;onCheck:(score:number,audioComplete:boolean,playbackStarts:number)=>void;
}) {
 const player=useRef<HTMLAudioElement>(null);
 const [answers,setAnswers]=useState<Record<number,number[]>>({});
 const [checked,setChecked]=useState(false);
 const [support,setSupport]=useState(false);
 const [helpOpen,setHelpOpen]=useState(false);
 const [heard,setHeard]=useState(false);
 const [error,setError]=useState('');
 const [summary,setSummary]=useState('');
 const [showSummary,setShowSummary]=useState(false);
 const starts=useRef(0), began=useRef(false), submitted=useRef(false);
 const listening=activity.skill==='listening';
 const score=receptionScore(activity,answers);
 const latest=record?.attempts.at(-1), first=record?.attempts[0];
 const available=enabled&&owner===ownerNow();
 useEffect(()=>{if(enabled&&!began.current){began.current=true;onStart();}},[enabled,onStart]);
 function toggleHelp(){if(!helpOpen){onSupport();setSupport(true);}setHelpOpen(!helpOpen);}
 function answer(question:number,slot:number,value:number) {
  setAnswers(current=>{const next=[...(current[question]??[])];next[slot]=value;return {...current,[question]:next};});
 }
 function check(){
  if(submitted.current||!available||!receptionAnswered(activity,answers)|| (listening&&!heard&&!support))return;
  submitted.current=true;onCheck(score,heard,starts.current);setChecked(true);
 }
 async function replay(segment:number){
  if(!player.current||!audio)return;
  player.current.currentTime=audio.starts[segment]??0;
  try{await player.current.play();}catch{setError('Audio could not start. Use the play button or open the transcript.');}
 }
 return <section className="reception-task" aria-label={activity.title}>
  <header><span className="reading-eyebrow">{listening?'Listening':'Practical reading'}</span><h2>{activity.title}</h2><p>{activity.instruction}</p></header>
  {latest&&<p className="reception-saved">Latest: {latest.score}% · {receptionResultLabel(latest,activity.skill)}{first&&first.id!==latest.id&&<>. First check: {first.score}% · {receptionResultLabel(first,activity.skill)}</>}</p>}
  {listening?<div className="reception-player">
   {audio&&<audio ref={player} controls preload="metadata" aria-label={activity.title} src={audio.src}
    onPlay={()=>{starts.current++;onStart();setError('');}}
    onTimeUpdate={event=>{const el=event.currentTarget;let played=0;for(let i=0;i<el.played.length;i++)played+=el.played.end(i)-el.played.start(i);if(Number.isFinite(el.duration)&&el.duration>0&&played>=el.duration*.9)setHeard(true);}}
    onError={()=>setError('The recording could not load. Try again, or use the transcript for supported practice.')} />}
   <div className="reception-audio-options"><label>Speed <select defaultValue="1" onChange={event=>{if(player.current)player.current.playbackRate=Number(event.target.value);}}><option value="0.85">Slower</option><option value="1">Normal</option></select></label><small>Synthetic German voices · {audio?timeLabel(audio.duration):'audio unavailable'}</small></div>
   {error&&<div role="alert"><p>{error}</p><Button variant="outline" onClick={()=>{player.current?.load();setError('');}}>Retry audio</Button></div>}
   <div className="reading-support"><Button variant="outline" disabled={!available} aria-expanded={helpOpen} onClick={toggleHelp}>{helpOpen?'Hide transcript':'Show transcript and word help'}</Button>{helpOpen&&<><div className="reception-document" lang="de">{activity.segments.map((s,i)=><p key={i}><strong>{s.speaker}: </strong>{s.text}</p>)}</div><p>{activity.help}</p></>}</div>
  </div>:<><article className="reception-document" lang="de">{activity.segments.map((s,i)=><p key={i}>{s.text}</p>)}</article><div className="reading-support"><Button variant="outline" disabled={!available} aria-expanded={helpOpen} onClick={toggleHelp}>English word help</Button>{helpOpen&&<p>{activity.help}</p>}</div></>}
  <div className="reception-questions">{activity.questions.map((q,i)=><fieldset key={i}><legend><span>{i+1}.</span> {q.prompt}</legend>
   {q.kind==='choice'?q.options.map((option,j)=><label className="reception-option" key={option}><input type="radio" name={`${activity.id}-${i}`} disabled={checked||!available} checked={answers[i]?.[0]===j} onChange={()=>answer(i,0,j)}/>{option}</label>):q.answers.map((_,j)=><label className="reception-select" key={j}><span>{q.kind==='sequence'?`Step ${j+1}`:q.labels?.[j]}</span><select disabled={checked||!available} value={answers[i]?.[j]??''} onChange={event=>answer(i,j,Number(event.target.value))}><option value="" disabled>Choose…</option>{q.options.map((option,k)=><option key={option} value={k}>{option}</option>)}</select></label>)}
   {checked&&<div className={questionCorrect(q,answers[i])?'reading-correct':'reading-retry'}><p><strong>{questionCorrect(q,answers[i])?'Correct.':'Try this detail again.'}</strong> {q.explanation}</p>{q.evidence.map(index=>listening?<Button key={index} type="button" variant="outline" onClick={()=>void replay(index)}>Hear the evidence · {timeLabel(audio?.starts[index]??0)}</Button>:<blockquote key={index} lang="de">{activity.segments[index].text}</blockquote>)}</div>}
  </fieldset>)}</div>
  <div aria-live="polite">{checked&&<p className="reception-result">{score}% · {score>=75?'You understood the key information.':'Read or listen to the highlighted details, then try again.'}</p>}</div>
  {!checked&&listening&&!heard&&!support&&<p className="reception-note">Listen through before checking. You can replay or open the transcript for help.</p>}
  {checked?<Button type="button" variant="outline" onClick={()=>{submitted.current=false;setChecked(false);setAnswers({});}}>Try again</Button>:<Button type="button" onClick={check} disabled={!available||!receptionAnswered(activity,answers)||(listening&&!heard&&!support)}>Check my understanding</Button>}
  {checked&&activity.summary&&<details className="reading-support"><summary>Optional: put it in your own words</summary><label className="reception-summary">{activity.summary.prompt}<textarea value={summary} maxLength={1500} onChange={event=>setSummary(event.target.value)} rows={4}/></label><Button variant="outline" disabled={!summary.trim()} onClick={()=>setShowSummary(true)}>Compare the key points</Button>{showSummary&&<><ul>{activity.summary.points.map(point=><li key={point}>{point}</li>)}</ul><p className="reception-note">Self-check only. This summary is not graded or saved.</p></>}</details>}
 </section>;
}
