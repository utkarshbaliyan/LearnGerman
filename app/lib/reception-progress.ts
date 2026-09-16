import type { ReceptionActivity, ReceptionQuestion } from './reception-types';
export type ReceptionAttempt = { id: string; checkedAt: string; score: number; supportUsed: boolean; repeated: boolean; audioComplete: boolean; playbackStarts: number };
export type ReceptionRecord = { startedAt?: string; supportUsed: boolean; attempts: ReceptionAttempt[] };
export type ReceptionProgress = Record<string, ReceptionRecord>;
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const date = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
const validAttempt = (value: unknown): value is ReceptionAttempt => {
 const r = object(value);
 return typeof r.id === 'string' && r.id.length > 0 && r.id.length < 100 && date(r.checkedAt) && typeof r.score === 'number' && Number.isFinite(r.score) && r.score >= 0 && r.score <= 100 && typeof r.supportUsed === 'boolean' && typeof r.repeated === 'boolean' && typeof r.audioComplete === 'boolean' && Number.isSafeInteger(r.playbackStarts) && Number(r.playbackStarts) >= 0;
};
export function mergeReceptionProgress(left: unknown, right: unknown): ReceptionProgress {
 const a=object(left), b=object(right), result: ReceptionProgress = {};
 for(const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
  if(!/^reception-(a1|a2|b1)-\d{2}-v\d+-(reading|listening)-(guided|transfer)$/.test(id)) continue;
  const x=object(a[id]), y=object(b[id]);
  const starts=[x.startedAt,y.startedAt].filter(date).sort((m,n)=>Date.parse(m)-Date.parse(n));
  const records=[...(Array.isArray(x.attempts)?x.attempts:[]),...(Array.isArray(y.attempts)?y.attempts:[])].filter(validAttempt);
  // Immutable attempt IDs; canonical tie handling keeps cross-device merges symmetric.
  const unique=new Map<string,ReceptionAttempt>();
  for(const r of records.sort((m,n)=>JSON.stringify(m).localeCompare(JSON.stringify(n)))) unique.set(r.id,r);
  const attempts=[...unique.values()].sort((m,n)=>Date.parse(m.checkedAt)-Date.parse(n.checkedAt)||m.id.localeCompare(n.id)).map((r,i)=>({...r,repeated:r.repeated||i>0}));
  result[id]={...(starts[0]?{startedAt:starts[0]}:{}),supportUsed:x.supportUsed===true||y.supportUsed===true||attempts.some(r=>r.supportUsed),attempts:attempts.length>20?[attempts[0],...attempts.slice(-19)]:attempts};
 }
 return result;
}
export function beginReception(progress: ReceptionProgress, id: string, now: string) {
 const record=progress[id];
 return {...progress,[id]:{...(record??{supportUsed:false,attempts:[]}),startedAt:record?.startedAt??now}};
}
export function supportReception(progress: ReceptionProgress, id: string, now: string) {
 const next=beginReception(progress,id,now);next[id]={...next[id],supportUsed:true};return next;
}
export function recordReceptionAttempt(progress: ReceptionProgress,id: string,attempt: Omit<ReceptionAttempt,'supportUsed'|'repeated'>) {
 const next=beginReception(progress,id,attempt.checkedAt), record=next[id];
 return mergeReceptionProgress(next,{[id]:{...record,attempts:[...record.attempts,{...attempt,supportUsed:record.supportUsed,repeated:record.attempts.length>0}]}});
}
export function receptionDueAt(progress: ReceptionProgress, guidedIds: string[]) {
 const dates=guidedIds.map(id=>progress[id]?.attempts[0]?.checkedAt);
 if(!dates.length||dates.some(d=>!d))return undefined;
 return Math.max(...dates.map(d=>Date.parse(d!)))+7*24*60*60*1000;
}
export function questionCorrect(q: ReceptionQuestion, answers: number[] | undefined) {
 return !!answers && answers.length===q.answers.length && q.answers.every((answer,i)=>answer===answers[i]);
}
export function receptionAnswered(activity: ReceptionActivity, answers: Record<number,number[]>) {
 return activity.questions.every((q,i)=>answers[i]?.length===q.answers.length&&q.answers.every((_,j)=>Number.isInteger(answers[i][j])&&answers[i][j]>=0&&answers[i][j]<q.options.length)&& (q.kind!=='sequence'||new Set(answers[i]).size===answers[i].length));
}
export function receptionScore(activity: ReceptionActivity, answers: Record<number,number[]>) {
 return Math.round(activity.questions.filter((q,i)=>questionCorrect(q,answers[i])).length/activity.questions.length*100);
}
export function receptionResultLabel(attempt: ReceptionAttempt, skill: 'reading'|'listening') {
 if(attempt.repeated)return 'Repeat practice';
 if(attempt.supportUsed || (skill==='listening'&&!attempt.audioComplete))return 'With support';
 return 'First check without help';
}
