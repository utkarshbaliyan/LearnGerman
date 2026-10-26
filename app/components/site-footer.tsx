import Link from 'next/link';
import { RumMonitoring } from './rum-monitoring';

export function SiteFooter() {
  return <footer className="site-footer"><span>LeseLaut beta</span><nav aria-label="Learning and help"><Link href="/course" prefetch={false}>German course</Link><Link href="/stories" prefetch={false}>German stories</Link><Link href="/about" prefetch={false}>About</Link><Link href="/privacy" prefetch={false}>Privacy</Link><Link href="/support" prefetch={false}>Help & contact</Link><RumMonitoring /></nav></footer>;
}
