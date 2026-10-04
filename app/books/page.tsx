import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { A1_BOOK } from '@/app/lib/book-data';
import { A2_BOOK_INFO, A2_BOOK_PATH } from '@/app/lib/a2-book-info';
import { B1_BOOK_INFO, B1_BOOK_PATH } from '@/app/lib/b1-book-info';

const bookPath = '/books/a1/der-schluessel-im-blauen-korb';

export const metadata = { title: 'Books · LeseLaut', description: 'A1, A2 and B1 German readers on LeseLaut.' };

export default function BooksPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-library">
    <h1>Books</h1>
    <section className="book-shelf" aria-labelledby="a1-books-heading">
      <h2 id="a1-books-heading">A1</h2>
      <Link className="book-shelf-item" href={bookPath} aria-label={`Open ${A1_BOOK.title}`}>
        <span className="book-cover book-cover--shelf" aria-hidden="true"><span className="book-cover-level">A1</span><strong lang="de">{A1_BOOK.title}</strong></span>
      </Link>
    </section>
    <section className="book-shelf" aria-labelledby="a2-books-heading">
      <h2 id="a2-books-heading">A2</h2>
      <Link className="book-shelf-item" href={A2_BOOK_PATH} aria-label={`Open ${A2_BOOK_INFO.title}`}>
        <span className="book-cover book-cover--shelf" aria-hidden="true"><span className="book-cover-level">A2</span><strong lang="de">{A2_BOOK_INFO.title}</strong></span>
      </Link>
    </section>
    <section className="book-shelf" aria-labelledby="b1-books-heading">
      <h2 id="b1-books-heading">B1</h2>
      <Link className="book-shelf-item" href={B1_BOOK_PATH} aria-label={`Open ${B1_BOOK_INFO.title}`}>
        <span className="book-cover book-cover--shelf book-cover--b1" aria-hidden="true"><span className="book-cover-level">B1</span><strong lang="de">{B1_BOOK_INFO.title}</strong></span>
      </Link>
    </section>
  </main></div>;
}
