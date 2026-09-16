export const RECEPTION_CATALOG = [
 { id: 'reception-a1-01-v1', level: 'A1', chapter: 1, title: 'Names and places' },
 { id: 'reception-a1-09-v1', level: 'A1', chapter: 9, title: 'Buying what you need' },
 { id: 'reception-a2-04-v1', level: 'A2', chapter: 4, title: 'Understanding an appointment' },
 { id: 'reception-a2-18-v1', level: 'A2', chapter: 18, title: 'Finding the right connection' },
 { id: 'reception-b1-01-v1', level: 'B1', chapter: 1, title: 'Choosing accommodation' },
 { id: 'reception-b1-04-v1', level: 'B1', chapter: 4, title: 'Resolving a repair problem' },
] as const;
export const receptionChapterId = (level: string, chapter: number) => `${level.toLowerCase()}-${Math.ceil(chapter / 6)}-${(chapter - 1) % 6 + 1}`;
