import Link from 'next/link';

export function SiteFooter() {
  return <footer className="site-footer"><span>LeseLaut · free German stories, A1–B2 · beta</span><nav aria-label="Learning and help"><Link href="/about" prefetch={false}>About</Link><Link href="/privacy" prefetch={false}>Privacy</Link><Link href="/support" prefetch={false}>Help & contact</Link></nav></footer>;
}
