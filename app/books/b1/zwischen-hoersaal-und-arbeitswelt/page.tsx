import { pageMetadata } from '@/app/lib/seo';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookResumeLink } from '@/app/components/book-bookmark-controls';
import { B1_BOOK, B1_BOOK_CHAPTERS } from '@/app/lib/b1-book-data';
import { B1_BOOK_PATH } from '@/app/lib/b1-book-info';

export const metadata = pageMetadata('Zwischen Hörsaal und Arbeitswelt — B1 German Book', 'Read a free 200-page B1 German book about student jobs and working life in Germany, with audio, English translations and vocabulary help.', '/books/b1/zwischen-hoersaal-und-arbeitswelt');

export default function B1BookContents() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--contents">
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />B1 books</Link>
    <div className="book-volume book-volume--front">
      <header className="book-cover book-cover--inside book-cover--b1"><span className="book-cover-level">B1</span><h1 lang="de">{B1_BOOK.title}</h1></header>
      <section className="book-front-page" aria-label="Inside the book">
        <p className="book-front-kicker">{B1_BOOK.title}</p>
        <p className="book-description">Read a free 200-page B1 German book about student jobs and working life in Germany, with audio, English translations and vocabulary help.</p>
        <BookResumeLink bookId={B1_BOOK.id} path={B1_BOOK_PATH} />
        <nav className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{B1_BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}>
          <Link href={`${B1_BOOK_PATH}/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link>
        </li>)}</ol></nav>
      </section>
    </div>
  </main></div>;
}
