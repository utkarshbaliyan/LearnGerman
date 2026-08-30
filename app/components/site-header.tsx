import Link from "next/link";

type SiteHeaderProps = {
  active: "stories" | "vocabulary";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="topbar">
      <Link href="/" prefetch className="brand" aria-label="LeseLaut home">
        <span className="brand-mark" aria-hidden="true">ä</span>
        <span><strong>LeseLaut</strong><small>German through stories</small></span>
      </Link>
      <nav className="topnav" aria-label="Main navigation">
        {active === "stories" && <a href="#course">Course</a>}
        <Link href="/" prefetch aria-current={active === "stories" ? "page" : undefined}>Stories</Link>
        <Link href="/vocabulary" prefetch aria-current={active === "vocabulary" ? "page" : undefined}>Vocabulary</Link>
      </nav>
    </header>
  );
}
