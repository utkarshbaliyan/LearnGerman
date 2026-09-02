import { BookOpen, CalendarCheck2, CircleUserRound, GraduationCap, Languages } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/app/components/theme-toggle";

type SiteHeaderProps = {
  active: "course" | "stories" | "vocabulary" | "grammar" | "account";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="topbar">
      <Link href="/" prefetch className="brand" aria-label="LeseLaut home">
        <span className="brand-mark" aria-hidden="true">ä</span>
        <span><strong>LeseLaut</strong><small>German through stories</small></span>
      </Link>
      <nav className="topnav" aria-label="Main navigation">
        <Link href="/" prefetch aria-current={active === "course" ? "page" : undefined}><CalendarCheck2 aria-hidden="true" /><span>Course</span></Link>
        <Link href="/stories" prefetch aria-current={active === "stories" ? "page" : undefined}><BookOpen aria-hidden="true" /><span>Stories</span></Link>
        <Link href="/vocabulary" prefetch aria-current={active === "vocabulary" ? "page" : undefined}><Languages aria-hidden="true" /><span>Vocabulary</span></Link>
        <Link href="/grammar" prefetch aria-current={active === "grammar" ? "page" : undefined}><GraduationCap aria-hidden="true" /><span>Grammar</span></Link>
        <Link href="/account" prefetch aria-current={active === "account" ? "page" : undefined}><CircleUserRound aria-hidden="true" /><span>Account</span></Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
