'use client';

import { useCallback, useEffect, useState } from 'react';
import { BOOK_PAGE_COUNT, readBookBookmark, type BookBookmark } from '@/app/lib/book-bookmark';
import { PROGRESS_SYNCED_EVENT } from '@/app/lib/cloud-progress-keys';
import { queueCloudProgress } from '@/app/lib/cloud-progress-save';

export function useBookBookmark() {
  const [bookmark, setBookmark] = useState<BookBookmark | null>(null);

  useEffect(() => {
    const refresh = () => setBookmark(readBookBookmark(localStorage));
    refresh();
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const savePage = useCallback((page: number) => {
    if (!Number.isInteger(page) || page < 1 || page > BOOK_PAGE_COUNT) return;
    const previous = readBookBookmark(localStorage);
    const next = { page, updatedAt: Math.max(Date.now(), (previous?.updatedAt ?? 0) + 1) };
    setBookmark(next);
    queueCloudProgress('books', next);
  }, []);

  return { bookmark, savePage };
}
