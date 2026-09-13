import { notFound } from 'next/navigation';
import { getActiveLesson } from '@/app/lib/active-learning';
import { ActiveLessonWorkspace } from '../lesson-workspace';
export default async function ActiveLessonPage({params,searchParams}: {params: Promise<{taskId:string}>; searchParams: Promise<{mode?:string}>}) {
 const {taskId} = await params; const query = await searchParams;
 const lesson = getActiveLesson(taskId); if (!lesson) notFound();
 return <ActiveLessonWorkspace key={`${taskId}:${query.mode}`} lesson={lesson} initialMode={query.mode === 'writing' ? 'writing' : 'speaking'}/>;
}
