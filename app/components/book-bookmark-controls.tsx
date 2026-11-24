'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookBookmark } from '@/app/hooks/use-book-bookmark';
import { A1_BOOK_ID, BOOK_PAGE_COUNT, readBookBookmark } from '@/app/lib/book-bookmark';

const bookPath = '/books/a1/der-schluessel-im-blauen-korb';

export function BookResumeLink({ bookId = A1_BOOK_ID, path = bookPath }: { bookId?: string; path?: string } = {}) {
  const { bookmark } = useBookBookmark(bookId);
  return <Link className="reading-primary" href={`${path}/${bookmark?.page ?? 1}`}>
    {bookmark ? `Continue reading · Page ${bookmark.page}` : 'Start reading'} <ArrowRight size={18} />
  </Link>;
}

export function BookBookmarkButton({ page, bookId = A1_BOOK_ID }: { page: number; bookId?: string }) {
  const { bookmark, savePage } = useBookBookmark(bookId);
  const saved = bookmark?.page === page;
  return <button type="button" className="book-bookmark-button" aria-pressed={saved} onClick={() => savePage(page)}>
    {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
    {saved ? 'Page bookmarked' : 'Bookmark this page'}
  </button>;
}

export function BookPageNavigation({ page, bookId = A1_BOOK_ID, path = bookPath }: { page: number; bookId?: string; path?: string }) {
  const { savePage } = useBookBookmark(bookId);
  const prevLink = useRef<HTMLAnchorElement>(null);
  const nextLink = useRef<HTMLAnchorElement>(null);

  // Auto-save forward reading progress on arrival without overwriting a further bookmark.
  useEffect(() => {
    const existing = readBookBookmark(localStorage, bookId);
    if (!existing || page > existing.page) savePage(page);
  }, [bookId, page, savePage]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;
      if (event.key === 'ArrowLeft' && prevLink.current) prevLink.current.click();
      else if (event.key === 'ArrowRight' && nextLink.current) nextLink.current.click();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [page]);

  return <nav className="book-page-navigation" aria-label="Book pages">
    {page > 1 ? <Link ref={prevLink} href={`${path}/${page - 1}`} onClick={() => savePage(page - 1)}><ArrowLeft size={17} />Previous page</Link> : <span />}
    <Link href={path}>Contents</Link>
    {page < BOOK_PAGE_COUNT ? <Link ref={nextLink} className="reading-primary" href={`${path}/${page + 1}`} onClick={() => savePage(page + 1)}>Next page <ArrowRight size={17} /></Link>
      : <Link className="reading-primary" href={path}>Finish book <ArrowRight size={17} /></Link>}
  </nav>;
}
