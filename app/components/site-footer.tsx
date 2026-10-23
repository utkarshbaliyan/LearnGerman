import Link from 'next/link';

export function SiteFooter() {
  return <footer className="site-footer"><span>LeseLaut beta</span><nav aria-label="Help and privacy"><Link href="/privacy" prefetch={false}>Privacy</Link><Link href="/support" prefetch={false}>Help & contact</Link></nav></footer>;
}
