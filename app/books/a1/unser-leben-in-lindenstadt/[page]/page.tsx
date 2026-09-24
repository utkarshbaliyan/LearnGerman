import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookPageReader } from '@/app/components/book-page-reader';
import { A1_BOOK, getBookPage } from '@/app/lib/book-data';

const path = '/books/a1/unser-leben-in-lindenstadt';

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const number = Number((await params).page);
  const page = getBookPage(number);
  return page ? { title: `${page.title} · Page ${number} · LeseLaut`, description: `${A1_BOOK.title}, chapter ${page.chapter}, page ${number}.` } : { title: 'Page not found · LeseLaut' };
}

export default async function BookPage({ params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page;
  if (!/^[1-9]\d*$/.test(raw)) notFound();
  const page = getBookPage(Number(raw));
  if (!page) notFound();
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader" key={page.number}>
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />A1 books · Contents</Link>
    <header className="book-page-header"><span className="reading-eyebrow">{A1_BOOK.title} · Chapter {page.chapter} of 10</span><p lang="de" className="book-chapter-title">{page.chapterTitle}</p><h1 lang="de">{page.title}</h1><p>Page {page.number} of 200 · Chapter page {page.chapterPage} of 20</p><progress value={page.number} max={200} aria-label={`Page ${page.number} of 200`} /></header>
    <BookPageReader paragraphs={page.paragraphs} glosses={page.glosses} audio={page.audio} />
    <nav className="book-page-navigation" aria-label="Book pages">{page.number > 1 ? <Link href={`${path}/${page.number - 1}`}><ArrowLeft size={17} />Previous page</Link> : <span />}
      <Link href="/books">Contents</Link>{page.number < 200 ? <Link className="reading-primary" href={`${path}/${page.number + 1}`}>Next page <ArrowRight size={17} /></Link> : <Link className="reading-primary" href="/books">Finish book <ArrowRight size={17} /></Link>}</nav>
  </main></div>;
}
