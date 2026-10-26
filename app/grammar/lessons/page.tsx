import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { GRAMMAR_MODULES, GRAMMAR_LEVELS } from '../course';
import { pageMetadata, breadcrumbs } from '@/app/lib/seo';
export const metadata = pageMetadata('German Grammar Lessons — A1 to C1 Topic Guide', 'Find German grammar explanations by level and topic, from beginner word order and cases to advanced sentence patterns. Read examples, then practise.', '/grammar/lessons');
export default function GrammarLessons() {
  return <div className="site-shell"><SiteHeader active="grammar" /><main className="discovery-page"><StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German grammar', path: '/grammar' }, { name: 'Grammar lessons', path: '/grammar/lessons' }])} />
    <header className="discovery-intro"><h1>German grammar lessons by level</h1><p>Choose a topic from A1 to C1. Each guide explains a pattern with German examples, English meanings and common mistakes, then links to its interactive practice.</p></header>
    <nav className="story-level-nav" aria-label="Grammar levels">{GRAMMAR_LEVELS.map(level => <a key={level} href={`#${level.toLowerCase()}`}>{level}</a>)}</nav>
    {GRAMMAR_LEVELS.map(level => <section id={level.toLowerCase()} key={level}><h2>{level} German grammar</h2><div className="discovery-levels">{GRAMMAR_MODULES.filter(module => module.level === level).map(module => <section className="discovery-level" key={module.id}><h3>{module.title}</h3><p>{module.description}</p><ul>{module.lessons.filter(lesson => lesson.released).map(lesson => <li key={lesson.id}><Link href={`/grammar/lessons/${lesson.id}`}>{lesson.title}</Link></li>)}</ul></section>)}</div></section>)}
    <p>Need a quick lookup? Open the <Link href="/grammar/reference">grammar reference</Link> or <Link href="/grammar/cheat-sheets">German case tables</Link>. Level placement is an editorial study sequence, not an independent certification.</p>
  </main></div>;
}
