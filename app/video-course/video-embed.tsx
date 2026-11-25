'use client';
import { useEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';

export const toSeconds = (t: string) => t.split(':').reduce((s, p) => s * 60 + Number(p), 0);
/** Ask the episode video to jump to a timestamp ("12:39"). */
export function seekVideo(t: string) { window.dispatchEvent(new CustomEvent('vc-seek', { detail: toSeconds(t) })); }

// Click-to-load: nothing is requested from YouTube until the learner presses play or jumps to a moment.
export function VideoEmbed({ youtubeId, title, chapters }: { youtubeId: string; title: string; chapters: { t: string; title: string }[] }) {
  const [start, setStart] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onSeek = (e: Event) => { setStart((e as CustomEvent<number>).detail); box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    window.addEventListener('vc-seek', onSeek);
    return () => window.removeEventListener('vc-seek', onSeek);
  }, []);

  let player;
  if (!youtubeId) player = <div className="vc-video vc-video-soon"><PlayCircle aria-hidden="true" /><p><strong>Video coming soon.</strong> The practice below already works.</p></div>;
  else if (start !== null) player = <div className="vc-video"><iframe key={start} src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&start=${start}`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin" /></div>;
  else player = <button type="button" className="vc-video vc-video-poster" onClick={() => setStart(0)} aria-label={`Play video: ${title}`}>
    <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy" /><PlayCircle aria-hidden="true" /><span>Play · loads YouTube</span>
  </button>;

  return <div ref={box} className="vc-video-wrap">
    {player}
    {chapters.length > 0 && <details className="vc-chapters"><summary>Chapters ({chapters.length})</summary><ol>
      {chapters.map(c => <li key={c.t}><button type="button" disabled={!youtubeId} onClick={() => setStart(toSeconds(c.t))}><span>{c.t}</span>{c.title}</button></li>)}
    </ol></details>}
  </div>;
}
