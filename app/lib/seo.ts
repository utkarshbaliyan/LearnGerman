import type { Metadata } from 'next';

export const SITE_ORIGIN = 'https://leselaut.com';
export const SITE_NAME = 'LeseLaut';
export const SITE_DESCRIPTION = 'Learn German with free A1–B2 stories, audio, English translations, vocabulary and grammar practice. Read at your level and save your progress.';
export const absoluteUrl = (path = '/') => new URL(path, SITE_ORIGIN).href;

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = absoluteUrl(path), fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle }, description, alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_US', siteName: SITE_NAME, title: fullTitle, description, url,
      images: [{ url: absoluteUrl('/social-card.png'), width: 1200, height: 630, alt: 'LeseLaut — German through stories' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [absoluteUrl('/social-card.png')] },
  };
}

export const PRIVATE_PAGE_METADATA: Metadata = { robots: { index: false, follow: true } };

export function bookPageMetadata(book: string, level: string, path: string, page: { number: number; title: string; paragraphs: string[] } | null): Metadata {
  if (!page) return { title: 'Page not found', ...PRIVATE_PAGE_METADATA };
  const excerpt = page.paragraphs.join(' ').replace(/\s+/g, ' ').slice(0, 90);
  return pageMetadata(`${page.title} — ${level} German Reader, Page ${page.number}`,
    `${level} German reading with audio and English help. ${book}, page ${page.number}. ${excerpt}`.slice(0, 165).trimEnd() + '…', `${path}/${page.number}`);
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({
    '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path),
  })) };
}

export const organization = { '@type': 'Organization', '@id': `${SITE_ORIGIN}/#organization`, name: SITE_NAME,
  url: SITE_ORIGIN, logo: absoluteUrl('/icon-192.png'), email: 'leselaut.team@gmail.com' };
export const website = { '@context': 'https://schema.org', '@graph': [organization,
  { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, url: SITE_ORIGIN, name: SITE_NAME,
    alternateName: 'LeseLaut German', description: SITE_DESCRIPTION, inLanguage: 'en', publisher: { '@id': organization['@id'] } },
] };
export const serializeStructuredData = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
