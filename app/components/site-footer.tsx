import Link from 'next/link';
import { RumMonitoring } from './rum-monitoring';

export function SiteFooter() {
  return <footer className="site-footer"><span>LeseLaut beta</span><nav aria-label="Help and privacy"><Link href="/privacy" prefetch={false}>Privacy</Link><Link href="/support" prefetch={false}>Help & contact</Link><RumMonitoring /></nav></footer>;
}
