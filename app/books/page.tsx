import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { A1_BOOK, BOOK_CHAPTERS } from '@/app/lib/book-data';

export const metadata = { title: 'A1 Books · LeseLaut', description: 'Read Unser Leben in Lindenstadt page by page, with four paragraph recordings and word translations.' };

export default function BooksPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-library">
    <p className="reading-eyebrow book-library-label">Books · A1</p>
    <section className="book-library-feature" aria-labelledby="book-title"><div className="book-cover" aria-hidden="true"><BookOpen size={44} /><span>A1</span><strong>Unser Leben in Lindenstadt</strong><small>200 pages · 10 chapters</small></div><div><span className="reading-eyebrow">A1 · Continued story</span><h1 id="book-title" lang="de">{A1_BOOK.title}</h1><p lang="de">{A1_BOOK.subtitle}</p><p>Read in page order or jump to a chapter. There are no quizzes in this book.</p><Link className="reading-primary" href="/books/a1/unser-leben-in-lindenstadt/1">Start reading <ArrowRight size={18} /></Link></div></section>
    <section className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}><Link href={`/books/a1/unser-leben-in-lindenstadt/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link></li>)}</ol></section>
  </main></div>;
}
