import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { A1_BOOK, BOOK_CHAPTERS } from '@/app/lib/book-data';

export const metadata = { title: 'A1 Books · LeseLaut', description: 'Read Unser Leben in Lindenstadt page by page, with four paragraph recordings and word translations.' };

export default function BooksPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-library">
    <header className="book-library-hero"><span className="reading-eyebrow">Books · A1</span><h1>Read a whole book in German.</h1><p>Follow Mia and her family through 200 pages in Lindenstadt. Each page keeps the book’s four paragraphs, with a separate recording and word meanings for each one.</p></header>
    <section className="book-library-feature" aria-labelledby="book-title"><div className="book-cover" aria-hidden="true"><BookOpen size={44} /><span>A1</span><strong>Unser Leben in Lindenstadt</strong><small>200 pages · 10 chapters</small></div><div><span className="reading-eyebrow">A1 · Continued story</span><h2 id="book-title" lang="de">{A1_BOOK.title}</h2><p lang="de">{A1_BOOK.subtitle}</p><p>Read in page order or jump to a chapter. There are no quizzes in this book.</p><Link className="reading-primary" href="/books/a1/unser-leben-in-lindenstadt/1">Start reading <ArrowRight size={18} /></Link></div></section>
    <section className="book-chapters" aria-label="Book contents"><h2>Contents</h2>{BOOK_CHAPTERS.map(chapter => <details key={chapter.number} open={chapter.number === 1}>
      <summary><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><small>Pages {(chapter.number - 1) * 20 + 1}–{chapter.number * 20}</small></summary>
      <ol start={(chapter.number - 1) * 20 + 1}>{chapter.pages.map(page => <li key={page.number}><Link href={`/books/a1/unser-leben-in-lindenstadt/${page.number}`}><span>{page.number}</span><span lang="de">{page.title}</span><ArrowRight size={15} /></Link></li>)}</ol>
    </details>)}</section>
  </main></div>;
}
