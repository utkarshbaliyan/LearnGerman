'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { VIDEO_COURSE_PUBLIC } from '@/app/lib/feature-availability';
import { authenticatedFetch } from '@/app/lib/authenticated-fetch';
import { browserSession } from '@/app/lib/browser-session';
import { isSiteOwnerEmail, SITE_OWNER_EMAIL } from '@/app/lib/site-owner';

type GateState = 'checking' | 'allowed' | 'signin' | 'denied';

export function VideoCourseGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(VIDEO_COURSE_PUBLIC ? 'allowed' : 'checking');

  useEffect(() => {
    if (VIDEO_COURSE_PUBLIC) return;
    let cancelled = false;
    async function verify() {
      try {
        const session = await browserSession(AbortSignal.timeout(8_000));
        if (cancelled) return;
        if (!session?.user?.email) { setState('signin'); return; }
        if (!isSiteOwnerEmail(session.user.email)) { setState('denied'); return; }
        // Confirm server-side with the same owner check used by /api/admin/live.
        const res = await authenticatedFetch('/api/video-course/access', { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) setState('allowed');
        else if (res.status === 401) setState('signin');
        else setState('denied');
      } catch {
        if (!cancelled) setState('signin');
      }
    }
    void verify();
    return () => { cancelled = true; };
  }, []);

  if (VIDEO_COURSE_PUBLIC) return <>{children}</>;
  if (state === 'allowed') {
    return <>
      <div className="vc-owner-banner" role="status">
        <Lock aria-hidden="true" />
        <span><strong>Owner preview</strong> — visible only to {SITE_OWNER_EMAIL} while the A1 video course is being prepared.</span>
      </div>
      {children}
    </>;
  }
  return <section className="vc-gate" aria-label="Video course preview">
    <span className="reading-eyebrow">German A1 Video Course</span>
    <h1>{state === 'checking' ? 'Checking access…' : 'Coming soon'}</h1>
    {state === 'checking' && <p>Loading preview…</p>}
    {state === 'signin' && <>
      <p>The A1 cartoon video course is in private preview right now. In the meantime, explore our <Link href="/stories">German stories</Link>, <Link href="/vocabulary">vocabulary</Link>, and <Link href="/grammar">grammar</Link>.</p>
      <p className="vc-gate-owner">Team preview? <Link href="/account">Sign in with {SITE_OWNER_EMAIL} →</Link></p>
    </>}
    {state === 'denied' && <>
      <p>The A1 cartoon video course is currently in private preview and will open publicly soon. Explore <Link href="/stories">stories</Link>, <Link href="/vocabulary">vocabulary</Link>, and <Link href="/grammar">grammar</Link> in the meantime.</p>
    </>}
  </section>;
}
