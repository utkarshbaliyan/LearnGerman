import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { GRAMMAR_LEVELS, GRAMMAR_MODULES } from '../course';
import { GRAMMAR_SOURCES } from '../sources';
import { GRAMMAR_REFERENCE } from './patterns';
export const metadata: Metadata = {
  title:'A1–C1 German Grammar Reference — LeseLaut',
  description:'Case tables, advanced grammar patterns, A1–C1 topic coverage and primary rule references.',
};
export default function GrammarReference() {
  return <main className="site-shell"><SiteHeader active="grammar" /><div className="grammar-reference-page">
    <header><Link href="/grammar">← Grammar lessons</Link><h1>Your German grammar reference.</h1><p>Study the explanations and practise in the lessons, then use these tables to retrieve the patterns. The core path contains 24 lessons each at A1, A2 and B1, and 36 each at B2 and C1.</p><p>The levels are an editorial learning sequence informed by CEFR competence descriptors. This covers core standard German grammar through C1; lexical exceptions, regional variation and specialist linguistic analysis remain open-ended. The content has not been independently teacher certified.</p></header>
    <nav aria-label="Grammar reference topics"><Link href="/grammar/cheat-sheets">Full case cheat sheets</Link>{GRAMMAR_REFERENCE.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}<a href="#coverage">Topic coverage</a><a href="#sources">Sources</a></nav>
    {GRAMMAR_REFERENCE.map(section => <section id={section.id} key={section.id}><h2>{section.title}</h2><div className="reference-scroll"><table><thead><tr>{section.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{section.rows.map((row,i) => <tr key={i}>{row.map((cell,j) => <td key={j} lang={j === 2 ? 'de' : undefined}>{cell}</td>)}</tr>)}</tbody></table></div></section>)}
    <section id="coverage"><h2>The complete core study path</h2><p>Every lesson has explanation, examples, tables and 50 tasks: recognition, completion, ordering/correction, translation and guided production. Controlled tasks use model wording; production uses explicit self-check criteria. Completing practice does not certify CEFR proficiency.</p><div className="coverage-levels">{GRAMMAR_LEVELS.map(level => <article key={level}><h3>{level}</h3>{GRAMMAR_MODULES.filter(module => module.level === level).map(module => <div key={module.id}><h4>{module.title}</h4><ul>{module.lessons.map(lesson => <li key={lesson.id}><Link href={`/grammar?lesson=${lesson.id}`}>{lesson.title}</Link></li>)}</ul></div>)}</article>)}</div></section>
    <section id="sources"><h2>Rule references and curriculum research</h2><p>Explanations and examples are original. IDS grammis and the official spelling rules support the grammatical distinctions; CEFR and Goethe materials inform communicative scope and practice goals. These sources do not certify the individual lessons.</p><ul>{Object.entries(GRAMMAR_SOURCES).map(([id,source]) => <li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></section>
    <Link href="/grammar">Return to the lessons →</Link>
  </div></main>;
}
