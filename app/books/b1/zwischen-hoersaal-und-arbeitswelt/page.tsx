import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookResumeLink } from '@/app/components/book-bookmark-controls';
import { B1_BOOK, B1_BOOK_CHAPTERS } from '@/app/lib/b1-book-data';
import { B1_BOOK_PATH } from '@/app/lib/b1-book-info';

export const metadata = { title: `${B1_BOOK.title} · LeseLaut`, description: 'Read a B1 German story about student jobs, graduation and finding full-time work in Germany.' };

export default function B1BookContents() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--contents">
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />B1 books</Link>
    <div className="book-volume book-volume--front">
      <header className="book-cover book-cover--inside book-cover--b1"><span className="book-cover-level">B1</span><h1 lang="de">{B1_BOOK.title}</h1></header>
      <section className="book-front-page" aria-label="Inside the book">
        <p className="book-front-kicker">{B1_BOOK.title}</p>
        <BookResumeLink bookId={B1_BOOK.id} path={B1_BOOK_PATH} />
        <nav className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{B1_BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}>
          <Link href={`${B1_BOOK_PATH}/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link>
        </li>)}</ol></nav>
      </section>
    </div>
  </main></div>;
}
