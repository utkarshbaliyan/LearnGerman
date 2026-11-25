import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { pageMetadata, breadcrumbs } from '@/app/lib/seo';
import { A1_EPISODES, A1_MOCKS, episodePath, hasFullPractice, youtubeIdFor } from '@/app/video-course/course';
import { EpisodeProgressBadge } from '@/app/video-course/episode-progress';
import { CourseDashboard } from '@/app/video-course/course-dashboard';
import { VideoCourseGate } from '@/app/video-course/owner-gate';
import { VIDEO_COURSE_PUBLIC } from '@/app/lib/feature-availability';

export const metadata = {
  ...pageMetadata('A1 German Video Course — Watch, Then Practise',
    'Watch each A1 German lesson video, then practise its vocabulary and grammar with instant-feedback exercises. 24 episodes from greetings to the hotel.', '/video-course'),
  ...(VIDEO_COURSE_PUBLIC ? {} : { robots: { index: false, follow: false } }),
};

export default function VideoCoursePage() {
  const dashEpisodes = A1_EPISODES.map(e => ({ n: e.n, slug: e.slug, title: e.title, english: e.english, hasFull: hasFullPractice(e.n) }));
  return <div className="site-shell"><SiteHeader active="course" /><main className="discovery-page vc-page">
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Video course', path: '/video-course' }])} />
    <VideoCourseGate>
    <header className="discovery-intro"><span className="reading-eyebrow">A1 · 24 episodes · 3 practice exams</span>
      <h1>German A1 video course</h1>
      <p>Each episode: watch the lesson in Frau Weber&apos;s class, then practise the words and grammar here. You pass an episode at 80 %.</p></header>
    <CourseDashboard episodes={dashEpisodes} />
    <ol className="vc-episode-list">
      {A1_EPISODES.map(e => <li key={e.n}>
        <Link href={episodePath(e.n)} className="vc-episode-card">
          <span className="vc-ep-num">{String(e.n).padStart(2, '0')}</span>
          <span className="vc-ep-body"><strong>{e.title}</strong><span>{e.english} · {e.location}</span></span>
          <span className="vc-ep-meta">{hasFullPractice(e.n) && <span className="vc-tag">Full practice</span>}{youtubeIdFor(e.n) ? '▶ Video' : 'Video soon'}<EpisodeProgressBadge episode={e.n} /></span>
        </Link>
        {A1_MOCKS.filter(m => m.afterEpisode === e.n).map(m => <div key={m.id} className="vc-episode-card vc-mock">
          <span className="vc-ep-num">{m.id.toUpperCase()}</span><span className="vc-ep-body"><strong>Practice exam {m.id.slice(1)}</strong><span>Exam prep · episodes {e.n - 7}–{e.n}</span></span><span className="vc-ep-meta">Coming soon</span>
        </div>)}
      </li>)}
    </ol>
    </VideoCourseGate>
  </main></div>;
}
