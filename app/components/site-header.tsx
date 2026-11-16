import { BookMarked, BookOpen, GraduationCap, Languages } from "lucide-react";
import Link from "next/link";

import { SiteMenu } from "@/app/components/site-menu";
import { ACTIVE_LEARNING_ENABLED } from '@/app/lib/feature-availability';

type SiteHeaderProps = {
  active: "today" | "review" | "active-learning" | "course" | "stories" | "books" | "vocabulary" | "grammar" | "account";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="topbar" data-section={active}>
      <Link href="/" prefetch={false} className="brand" aria-label="LeseLaut home" aria-current={active === 'today' || active === 'review' ? 'page' : undefined}>
        <span className="brand-mark" aria-hidden="true">ä</span>
        <span><strong>LeseLaut</strong><small>German through stories</small></span>
      </Link>
      <nav className="topnav" aria-label="Main navigation">
        <Link href="/" prefetch={false} aria-current={active === 'today' || active === 'review' ? 'page' : undefined}><span>Home</span></Link>
        <Link href="/stories" prefetch={false} aria-current={active === "stories" ? "page" : undefined}><BookOpen aria-hidden="true" /><span>Stories</span></Link>
        <Link href="/books" prefetch={false} aria-current={active === "books" ? "page" : undefined}><BookMarked aria-hidden="true" /><span>Books</span></Link>
        {ACTIVE_LEARNING_ENABLED && <Link href="/active-learning" prefetch={false} aria-current={active === "active-learning" ? "page" : undefined}><GraduationCap aria-hidden="true" /><span>Active Learning</span></Link>}
        <Link href="/vocabulary" prefetch={false} aria-current={active === "vocabulary" ? "page" : undefined}><Languages aria-hidden="true" /><span>Vocabulary</span></Link>
        <Link href="/grammar" prefetch={false} aria-current={active === "grammar" ? "page" : undefined}><GraduationCap aria-hidden="true" /><span>Grammar</span></Link>
      </nav>
      <SiteMenu accountActive={active === "account"} />
    </header>
  );
}
