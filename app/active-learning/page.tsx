import { SiteHeader } from '@/app/components/site-header';
import { CourseMap } from './course-map';
export const metadata = { title: 'Active Learning · LeseLaut', description: 'Build everyday German with gradual A1–B1 speaking and writing tasks, photo submissions and personal AI feedback.' };
export default function ActiveLearningPage() {
 return <div className="site-shell"><SiteHeader active="active-learning"/><main className="active-learning"><p className="active-eyebrow">SPEAK • WRITE • TRY AGAIN</p><h1>German you can use.</h1><p className="active-intro">Start with one sentence. Build towards everyday conversations.</p><CourseMap/></main></div>;
}
