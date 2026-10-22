'use client';

import { ArrowLeft, ArrowRight, BookOpen, Eye, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import type { GrammarLessonContent } from './course';
import { GRAMMAR_BRIEF_RULES } from './brief-rules';
import { lessonArticle, lessonGuideExamples, lessonGuideTables } from './lesson-guide-data';
import { LessonScene } from './lesson-scene';

export function LessonGuide({ content, outcome }: { content: GrammarLessonContent; outcome?: string }) {
  const tables = lessonGuideTables(content);
  const examples = lessonGuideExamples(content);
  const article = lessonArticle(content);
  const [tableIndex, setTableIndex] = useState(0);
  const [tableEnglish, setTableEnglish] = useState(true);
  const [examplePage, setExamplePage] = useState(0);
  const [exampleEnglish, setExampleEnglish] = useState(true);
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const table = tables[tableIndex];
  const englishColumn = table?.headers.findIndex(header => /english/iu.test(header)) ?? -1;
  const visibleColumns = table?.headers.map((_, index) => index).filter(index => tableEnglish || index !== englishColumn) ?? [];
  const pageCount = Math.ceil(examples.length / 2);
  const comparison = content.mistakes[comparisonIndex];

  return <section className="lesson-guide" aria-label="Lesson explanation">
    <nav className="lesson-guide-nav" aria-label="Jump within the lesson">
      <a href="#grammar-scene"><span>01</span> Read a scene</a>
      <a href="#grammar-understand"><span>02</span> Understand</a>
      <a href="#grammar-forms"><span>03</span> Forms & examples</a>
      <a href="#grammar-practice"><span>04</span> Practise <ArrowRight aria-hidden="true" /></a>
    </nav>

    {content.lead !== outcome && <p className="grammar-article-lead">{content.lead}</p>}
    <LessonScene lessonId={content.id} />

    <div className="lesson-guide-intro" id="grammar-understand">
      <div className="lesson-guide-label"><BookOpen aria-hidden="true" /> The rule in a nutshell</div>
      <p>{GRAMMAR_BRIEF_RULES[content.id]}</p>
      <div className="lesson-guide-pattern"><span>Keep this pattern in mind</span><strong lang="de">{content.pattern}</strong></div>
    </div>

    <section className="grammar-article-explanation" aria-labelledby="grammar-usage-title"><span className="grammar-editorial-kicker">From the story to your own German</span><h3 id="grammar-usage-title">When and how to use it</h3>{article.core.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>

    <section className="lesson-forms" id="grammar-forms" aria-labelledby="lesson-forms-title">
      <div className="lesson-section-heading"><div><span>See how the forms fit together</span><h3 id="lesson-forms-title">{table?.title ?? 'Forms at a glance'}</h3></div>
        {englishColumn >= 0 && <button className="lesson-text-button" type="button" aria-pressed={tableEnglish} aria-controls="lesson-forms-table" onClick={() => setTableEnglish(value => !value)}><Eye aria-hidden="true" />{tableEnglish ? 'Hide English in table' : 'Show English in table'}</button>}
      </div>
      {tables.length > 1 && <label className="lesson-table-picker"><span>Explore a table</span><select aria-label="Choose a grammar table" value={tableIndex} onChange={event => setTableIndex(Number(event.target.value))}>{tables.map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}</select></label>}
      {table?.caption && !table.caption.startsWith('Use this table as a reference') && <p className="lesson-table-caption">{table.caption}</p>}
      {table && <div className="lesson-table-scroll" role="region" aria-label={table.title} tabIndex={0}>
        <table id="lesson-forms-table"><thead><tr>{visibleColumns.map(index => <th key={index} scope="col">{table.headers[index]}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>{visibleColumns.map(index => index === 0 ? <th key={index} scope="row">{row[index]}</th> : <td key={index} lang={/german|lernen|sein/iu.test(table.headers[index]) ? 'de' : undefined}>{row[index]}</td>)}</tr>)}</tbody></table>
      </div>}
    </section>

    <aside className="grammar-memory"><Lightbulb aria-hidden="true" /><div><h4>Keep this in mind</h4><p>{article.memoryTip}</p></div></aside>
    {article.details.length > 0 && <details className="grammar-article-details"><summary>Details, exceptions and useful distinctions <span>{article.details.length} short notes</span></summary><div>{article.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></details>}

    <section className="lesson-example-explorer" id="grammar-explore" aria-labelledby="lesson-examples-title">
      <div className="lesson-section-heading"><div><span>Read it in a real sentence</span><h3 id="lesson-examples-title">Examples in context</h3></div><button className="lesson-text-button" type="button" aria-pressed={exampleEnglish} aria-controls="lesson-example-cards" onClick={() => setExampleEnglish(value => !value)}><Eye aria-hidden="true" />{exampleEnglish ? 'Hide example meanings' : 'Show example meanings'}</button></div>
      <div className="lesson-example-cards" id="lesson-example-cards" aria-live="polite">
        {examples.slice(examplePage * 2, examplePage * 2 + 2).map((example, index) => <article key={example.german}>
          <span className="lesson-example-number">Example {examplePage * 2 + index + 1}</span>
          <p lang="de" className="lesson-example-german">{example.german}</p>
          <p className={`lesson-example-meaning${exampleEnglish ? '' : ' is-concealed'}`}>{exampleEnglish ? example.english : 'Work out the meaning, then reveal it above.'}</p>
          {example.note && <p className="lesson-example-note"><span>Notice</span>{example.note}</p>}
        </article>)}
      </div>
      <div className="lesson-example-pager"><span aria-live="polite">{examplePage * 2 + 1}–{Math.min(examplePage * 2 + 2, examples.length)} of {examples.length} examples</span><div><button type="button" aria-label="Previous examples" onClick={() => setExamplePage(page => page - 1)} disabled={examplePage === 0}><ArrowLeft aria-hidden="true" /></button><button type="button" onClick={() => setExamplePage(page => page + 1)} disabled={examplePage >= pageCount - 1}>More examples <ArrowRight aria-hidden="true" /></button></div></div>
    </section>

    {comparison && <section className="lesson-comparison" aria-labelledby="lesson-comparison-title">
      <div className="lesson-section-heading"><div><span>Spot what changes</span><h3 id="lesson-comparison-title">Compare two versions</h3></div><span className="lesson-comparison-counter">{comparisonIndex + 1} / {content.mistakes.length}</span></div>
      <div className="lesson-comparison-versions"><div><span>Version to revise</span><p lang="de">{comparison.wrong}</p></div>{revealed ? <div className="lesson-revised-version" id="lesson-taught-revision"><span>The taught revision</span><p lang="de">{comparison.right}</p></div> : <div className="lesson-comparison-prompt"><span>Your turn</span><p>What would you change?</p></div>}</div>
      <button className="lesson-reveal-button" type="button" aria-expanded={revealed} onClick={() => setRevealed(value => !value)}>{revealed ? "Hide the revision" : "Reveal the revision"}<ArrowRight aria-hidden="true" /></button>
      {revealed && <div className="lesson-comparison-result" role="status"><p>{comparison.why}</p><button className="lesson-text-button" type="button" onClick={() => { setComparisonIndex(index => (index + 1) % content.mistakes.length); setRevealed(false); }}>Another comparison <ArrowRight aria-hidden="true" /></button></div>}
    </section>}
    <a className="lesson-guide-practise" href="#grammar-practice">Now put it into practice <ArrowRight aria-hidden="true" /></a>
  </section>;
}
