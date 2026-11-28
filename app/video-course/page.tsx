import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { pageMetadata, breadcrumbs, absoluteUrl, organization } from '@/app/lib/seo';
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

const CAST = ['weber', 'oezdemir', 'arjun', 'amara', 'mateo', 'yuki', 'schulz'] as const;
const MODULES = [
  { id: 'm1', title: 'Module 1 · First steps & daily life', range: [1, 8] as const, open: true },
  { id: 'm2', title: 'Module 2 · Routines, friends & work', range: [9, 16] as const, open: false },
  { id: 'm3', title: 'Module 3 · Home, travel & full A1', range: [17, 24] as const, open: false },
];

export default function VideoCoursePage() {
  const dashEpisodes = A1_EPISODES.map(e => ({ n: e.n, slug: e.slug, title: e.title, english: e.english, hasFull: hasFullPractice(e.n) }));
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'LeseLaut German A1 Video Course',
    description: 'Watch short animated German A1 lessons, then practise vocabulary, grammar, listening, reading, writing and speaking with instant feedback and downloadable worksheet PDFs.',
    url: absoluteUrl('/video-course'),
    inLanguage: ['de', 'en'],
    educationalLevel: 'CEFR A1',
    isAccessibleForFree: true,
    provider: { '@id': organization['@id'] },
  };
  return <div className="site-shell"><SiteHeader active="course" /><main className="discovery-page vc-page">
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Video course', path: '/video-course' }])} />
    <StructuredData data={courseSchema} />
    <VideoCourseGate>
    <header className="discovery-intro"><span className="reading-eyebrow">A1 · 24 episodes · 3 practice exams</span>
      <h1>German A1 video course</h1>
      <p>Each episode: watch the lesson in Frau Weber&apos;s class, then practise the words and grammar here. You pass an episode at 80 %.</p></header>
    <CourseDashboard episodes={dashEpisodes} />
    <div className="vc-modules">{MODULES.map(mod => {
      const eps = A1_EPISODES.filter(e => e.n >= mod.range[0] && e.n <= mod.range[1]);
      const readyCount = eps.filter(e => hasFullPractice(e.n)).length;
      const list = <ol className="vc-episode-list">
        {eps.map(e => <li key={e.n}>
          <Link href={episodePath(e.n)} className="vc-episode-card">
            <img className="vc-ep-avatar" src={`/video-course/img/${CAST[(e.n - 1) % CAST.length]}.webp`} alt="" width={44} height={44} loading="lazy" />
            <span className="vc-ep-num">{String(e.n).padStart(2, '0')}</span>
            <span className="vc-ep-body"><strong lang="de">{e.title}</strong><span>{e.english} · {e.location}</span></span>
            <span className="vc-ep-meta">{hasFullPractice(e.n) && <span className="vc-tag">Full practice</span>}{youtubeIdFor(e.n) ? <span>▶ Video</span> : null}<EpisodeProgressBadge episode={e.n} /></span>
          </Link>
          {A1_MOCKS.filter(m => m.afterEpisode === e.n).map(m => <div key={m.id} className="vc-episode-card vc-mock">
            <span className="vc-ep-num">{m.id.toUpperCase()}</span><span className="vc-ep-body"><strong>Practice exam {m.id.slice(1)}</strong><span>Exam prep · episodes {e.n - 7}–{e.n}</span></span><span className="vc-ep-meta">Coming soon</span>
          </div>)}
        </li>)}
      </ol>;
      return mod.open
        ? <section key={mod.id} className="vc-module"><h2>{mod.title} <small>{readyCount > 0 ? `${readyCount} of ${eps.length} full practice ready` : `Episodes ${mod.range[0]}–${mod.range[1]}`}</small></h2>{list}</section>
        : <details key={mod.id} className="vc-module vc-module-toggle"><summary><span>{mod.title}</span><small>Episodes {mod.range[0]}–{mod.range[1]} · {readyCount > 0 ? `${readyCount} ready` : 'Coming soon'}</small></summary>{list}</details>;
    })}</div>
    </VideoCourseGate>
  </main></div>;
}
