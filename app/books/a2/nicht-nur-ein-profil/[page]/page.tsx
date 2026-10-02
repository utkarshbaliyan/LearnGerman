import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookPageReader } from '@/app/components/book-page-reader';
import { BookBookmarkButton, BookPageNavigation } from '@/app/components/book-bookmark-controls';
import { A2_BOOK, getA2BookPage } from '@/app/lib/a2-book-data';
import { A2_BOOK_PATH } from '@/app/lib/a2-book-info';

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const number = Number((await params).page), page = getA2BookPage(number);
  return page ? { title: `${page.title} · Page ${number} · LeseLaut`, description: `${A2_BOOK.title}, chapter ${page.chapter}, page ${number}.` }
    : { title: 'Page not found · LeseLaut' };
}

export default async function A2BookPage({ params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page;
  if (!/^[1-9]\d*$/.test(raw)) notFound();
  const page = getA2BookPage(Number(raw));
  if (!page) notFound();
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--page" key={page.number}>
    <Link className="reading-back" href={A2_BOOK_PATH}><ArrowLeft size={17} />{A2_BOOK.title} · Contents</Link>
    <article className="book-volume book-volume--page">
      <header className="book-page-header"><span className="book-page-running-title" lang="de">{A2_BOOK.title}</span><span className="reading-eyebrow">Chapter {page.chapter} · {page.chapterTitle}</span><h1 lang="de">{page.title}</h1><p>Page {page.number} of 200</p><progress value={page.number} max={200} aria-label={`Page ${page.number} of 200`} /><BookBookmarkButton page={page.number} bookId={A2_BOOK.id} /></header>
      <BookPageReader paragraphs={page.paragraphs} translations={page.translations} glosses={page.glosses} audio={page.audio} />
      <BookPageNavigation page={page.number} bookId={A2_BOOK.id} path={A2_BOOK_PATH} />
      <p className="book-leaf-number" aria-hidden="true">{page.number}</p>
    </article>
  </main></div>;
}
