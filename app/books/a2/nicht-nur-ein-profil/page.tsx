import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookResumeLink } from '@/app/components/book-bookmark-controls';
import { A2_BOOK, A2_BOOK_CHAPTERS } from '@/app/lib/a2-book-data';
import { A2_BOOK_PATH } from '@/app/lib/a2-book-info';

export const metadata = { title: `${A2_BOOK.title} · LeseLaut`, description: 'Read an A2 German story about dating, friendship and finding love.' };

export default function A2BookContents() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--contents">
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />A2 books</Link>
    <div className="book-volume book-volume--front">
      <header className="book-cover book-cover--inside"><span className="book-cover-level">A2</span><h1 lang="de">{A2_BOOK.title}</h1></header>
      <section className="book-front-page" aria-label="Inside the book">
        <p className="book-front-kicker">{A2_BOOK.title}</p>
        <BookResumeLink bookId={A2_BOOK.id} path={A2_BOOK_PATH} />
        <nav className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{A2_BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}>
          <Link href={`${A2_BOOK_PATH}/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link>
        </li>)}</ol></nav>
      </section>
    </div>
  </main></div>;
}
