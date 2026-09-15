'use client';
import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {a1Starter} from '@/app/lib/a1-starter';

export function StarterPreparation({lesson,onReady}:{lesson:number;onReady:()=>void}) {
 const unit=a1Starter[lesson];
 const [step,setStep]=useState(0),[choice,setChoice]=useState(''),[answer,setAnswer]=useState(''),[checked,setChecked]=useState(false),[error,setError]=useState(''),[transcript,setTranscript]=useState(false);
 useEffect(()=>()=>{ if ('speechSynthesis' in window) window.speechSynthesis.cancel(); },[]);
 function speak(text:string) {
  if (!('speechSynthesis' in window)) {setError('Audio is unavailable here. You can open the words below.');return;}
  window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(text);speech.lang='de-DE';speech.rate=.85;
  speech.onerror=()=>setError('Audio could not play. Open the words below or try again.');window.speechSynthesis.speak(speech);
 }
 const advance=()=>{window.speechSynthesis?.cancel();setStep(step+1);setChoice('');setChecked(false);setError('');};
 const correct=step===1 ? choice===unit.listeningAnswer : step===2 ? choice===unit.readingAnswer : answer.trim().toLocaleLowerCase('de').replace(/ss/g,'ß')===unit.answer;
 return <section className="starter-preparation" aria-label="Prepare your first German answer">
  <div className="starter-heading"><strong>{['1 · Learn a phrase','2 · Listen','3 · Read','4 · Try the phrase'][step]}</strong><Button variant="ghost" onClick={onReady}>Practise with my details</Button></div>
  {step===0 ? <><p lang="de"><b>{unit.question}</b></p><p>{unit.meaning}</p><blockquote lang="de">{unit.phrase}</blockquote><p>{unit.translation}</p><p>{unit.tip}</p><Button variant="outline" onClick={()=>speak(unit.phrase)}>Listen to the example</Button> <Button onClick={advance}>Try listening</Button></> : <>
   {step===1 && <><Button onClick={()=>speak(unit.audio)}>Play short message</Button><p>{unit.listeningQuestion}</p><details onToggle={e=>{if(e.currentTarget.open)setTranscript(true);}}><summary>Show what was said</summary><p lang="de">{unit.audio}</p></details>{transcript && <small>Listening with text support</small>}</>}
   {step===2 && <><blockquote lang="de">{unit.reading}</blockquote><p>{unit.readingQuestion}</p></>}
   {(step===1||step===2) && <div className="starter-options">{(step===1?unit.listeningOptions:unit.readingOptions).map(option=><Button key={option} variant={choice===option?'default':'outline'} disabled={checked} aria-pressed={choice===option} onClick={()=>setChoice(option)}>{option}</Button>)}</div>}
   {step===3 && <><p>Complete this example before using your own details.</p><label lang="de" htmlFor="starter-answer">{unit.frame}</label><input id="starter-answer" lang="de" autoComplete="off" value={answer} disabled={checked} onChange={e=>setAnswer(e.target.value)} placeholder="Missing word"/></>}
   {checked && <p role="status">{correct?'That’s right.':step===3?`Use “${unit.answer}”. ${unit.explanation}`:`The answer is ${step===1?unit.listeningAnswer:unit.readingAnswer}. ${step===1?unit.audio:unit.reading}`}</p>}
   {!checked ? <Button disabled={step===3?!answer.trim():!choice} onClick={()=>setChecked(true)}>Check</Button> : correct ? <Button onClick={step===3?onReady:advance}>{step===3?'Now use my details':'Continue'}</Button> : <Button variant="outline" onClick={()=>{setChecked(false);setAnswer('');setChoice('');}}>Try again</Button>}
  </>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
