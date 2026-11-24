import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { ALL_GRAMMAR_LESSONS, LIVE_GRAMMAR_LESSONS } from '../../course';
import { lessonArticle, lessonGuideExamples, lessonGuideTables } from '../../lesson-guide-data';
import { GRAMMAR_BRIEF_RULES } from '../../brief-rules';
import { pageMetadata, PRIVATE_PAGE_METADATA, breadcrumbs, absoluteUrl } from '@/app/lib/seo';
import { GRAMMAR_SEO, grammarLessonPath, resolveGrammarLessonParam } from '../../seo';

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }) {
  const { id: lessonId } = resolveGrammarLessonParam((await params).lessonId), lesson = ALL_GRAMMAR_LESSONS.find(item => item.id === lessonId && item.released);
  if (!lesson) return { title: 'Lesson not found', ...PRIVATE_PAGE_METADATA };
  const seo = GRAMMAR_SEO[lessonId];
  return pageMetadata(seo?.title ?? `${lesson.title} — ${lessonId.split('-')[0].toUpperCase()} German Grammar`, seo?.description ?? `${lesson.outcome} Learn the German pattern with explanations, examples, common mistakes and practice.`, grammarLessonPath(lessonId));
}

export default async function GrammarLesson({ params }: { params: Promise<{ lessonId: string }> }) {
  const { id: lessonId, redirect } = resolveGrammarLessonParam((await params).lessonId), lesson = ALL_GRAMMAR_LESSONS.find(item => item.id === lessonId && item.released), content = LIVE_GRAMMAR_LESSONS[lessonId];
  if (!lesson || !content) notFound();
  if (redirect) permanentRedirect(absoluteUrl(grammarLessonPath(lessonId)));
  const level = lessonId.split('-')[0].toUpperCase(), article = lessonArticle(content), tables = lessonGuideTables(content), examples = lessonGuideExamples(content);
  const related = ALL_GRAMMAR_LESSONS.filter(item => item.released && item.id !== lessonId && item.id.split('-')[0] === lessonId.split('-')[0]);
  const index = ALL_GRAMMAR_LESSONS.findIndex(item => item.id === lessonId), next = ALL_GRAMMAR_LESSONS[index + 1];
  return <div className="site-shell"><SiteHeader active="grammar" /><main className="discovery-page grammar-public-guide"><StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Grammar lessons', path: '/grammar/lessons' }, { name: lesson.title, path: grammarLessonPath(lessonId) }])} />
    <Link href={`/grammar/lessons#${level.toLowerCase()}`}>← {level} grammar lessons</Link>
    <StructuredData data={{ '@context': 'https://schema.org', '@type': 'LearningResource', name: GRAMMAR_SEO[lessonId]?.title ?? lesson.title, description: GRAMMAR_SEO[lessonId]?.description ?? lesson.outcome, url: absoluteUrl(grammarLessonPath(lessonId)), inLanguage: 'en', learningResourceType: 'Grammar lesson', educationalLevel: level, teaches: lesson.title, isAccessibleForFree: true, provider: { '@id': 'https://leselaut.com/#organization' } }} />
    <header className="discovery-intro"><span className="reading-eyebrow">{level} German grammar · {lesson.title}</span><h1>{GRAMMAR_SEO[lessonId]?.title ?? lesson.title}</h1><p>{lesson.outcome}</p></header>
    <section className="discovery-guide"><h2>The rule</h2><p>{GRAMMAR_BRIEF_RULES[lessonId]}</p><p className="grammar-public-pattern" lang="de">{content.pattern}</p>{article.core.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
    {tables.map(table => <section className="discovery-guide" key={table.title}><h2>{table.title}</h2>{table.caption && <p>{table.caption}</p>}<div className="grammar-public-table" role="region" aria-label={table.title} tabIndex={0}><table><thead><tr>{table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>)}
    <section className="discovery-guide"><h2>German examples with English meanings</h2>{examples.map((example, i) => <blockquote className="grammar-public-example" key={`${i}-${example.german}`}><p lang="de"><strong>{example.german}</strong></p><p>{example.english}</p>{example.note && <p><small>{example.note}</small></p>}</blockquote>)}</section>
    <section className="discovery-guide"><h2>Common mistakes</h2>{content.mistakes.map((mistake, i) => <div className="grammar-public-example" key={i}><p>Incorrect: <span lang="de">{mistake.wrong}</span></p><p>Correct: <strong lang="de">{mistake.right}</strong></p><p>{mistake.why}</p></div>)}</section>
    {article.details.length > 0 && <section className="discovery-guide"><h2>Details and useful distinctions</h2>{article.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>}
    <section className="discovery-guide"><h2>Practise this grammar</h2><p>{article.memoryTip}</p><p><Link className="discovery-more" href={`/grammar?lesson=${lessonId}`}>Open {lesson.title} exercises →</Link></p><p>For source references and editorial level notes, see the <Link href="/grammar/reference#sources">grammar reference</Link>. You can <Link href="/support">report a correction</Link> if an explanation or example seems wrong.</p></section>
    <nav className="discovery-guide" aria-label="Related grammar lessons"><h2>Continue learning</h2><ul>{[...(next?.released ? [next] : []), ...related.slice(0, 3)].filter((item, i, list) => list.findIndex(other => other.id === item.id) === i).map(item => <li key={item.id}><Link href={grammarLessonPath(item.id)}>{item.title}</Link></li>)}</ul><Link href="/grammar/lessons">All German grammar lessons →</Link></nav>
  </main></div>;
}
