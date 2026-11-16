import type { Metadata } from 'next';
import { SiteHeader } from '@/app/components/site-header';
import { LiveTraffic } from './live-traffic';
import './live-traffic.css';

export const metadata: Metadata = { title: 'Live traffic | LeseLaut', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function LiveTrafficPage() {
  return <main className="site-shell"><SiteHeader active="account" /><LiveTraffic /></main>;
}
