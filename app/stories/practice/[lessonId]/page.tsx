import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/app/components/site-header';
import { ReceptionWorkspace } from '@/app/components/reception-workspace';
import { getReceptionLesson, getReceptionAudio } from '@/app/lib/reception';
export async function generateMetadata({params}:{params:Promise<{lessonId:string}>}){
 const lesson=getReceptionLesson((await params).lessonId);
 return {title:lesson?`${lesson.title} · Reading & listening · LeseLaut`:'Practice not found · LeseLaut'};
}
export default async function ReceptionPage({params}:{params:Promise<{lessonId:string}>}){
 const lesson=getReceptionLesson((await params).lessonId);if(!lesson)notFound();
 const audio=Object.fromEntries([...lesson.guided,...lesson.transfer].filter(a=>a.skill==='listening').map(a=>[a.id,getReceptionAudio(a.id)!]));
 return <div className="site-shell"><SiteHeader active="stories"/><main className="reading-reader reception-page"><Link className="reading-back" href={`/stories?level=${lesson.level}`}>← {lesson.level} stories</Link><header><span className="reading-eyebrow">{lesson.level} · Chapter {lesson.chapter} · Read & listen</span><h1>{lesson.title}</h1><p>Two short activities. One at a time.</p></header><ReceptionWorkspace key={lesson.id} lesson={lesson} audio={audio}/></main></div>;
}
