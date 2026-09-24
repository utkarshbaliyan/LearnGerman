#!/usr/bin/env python3
"""Validate and compile the supplied Lindenstadt book without rewriting its prose."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content/books/unser-leben-in-lindenstadt.txt'
DESTINATION = ROOT / 'app/lib/book-data.json'
HEADING = re.compile(r'^Kapitel (\d+) · (.+?) · (\d+)/(\d+)$', re.MULTILINE)


def main():
    source = SOURCE.read_text(encoding='utf-8').replace('\r\n', '\n')
    matches = list(HEADING.finditer(source))
    if len(matches) != 200:
        raise ValueError(f'Expected 200 page headings, found {len(matches)}')
    introduction = [line.strip() for line in source[:matches[0].start()].split('\n') if line.strip()]
    if introduction[:1] != ['Unser Leben in Lindenstadt']:
        raise ValueError('Unexpected book title')
    pages = []
    chapter_titles = {}
    for index, match in enumerate(matches):
        chapter, chapter_title, within, total = match.groups()
        chapter, within, total = map(int, (chapter, within, total))
        if (chapter, within, total) != (index // 20 + 1, index % 20 + 1, 20):
            raise ValueError(f'Unexpected chapter/page numbering at page {index + 1}')
        if chapter in chapter_titles and chapter_titles[chapter] != chapter_title:
            raise ValueError(f'Chapter {chapter} has conflicting titles')
        chapter_titles[chapter] = chapter_title
        body = source[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(source)].strip()
        blocks = [part.strip() for part in re.split(r'\n\s*\n', body) if part.strip()]
        if len(blocks) != 5 or any('\n' in part for part in blocks):
            raise ValueError(f'Page {index + 1} must contain one title and four paragraphs')
        title, *paragraphs = blocks
        pages.append({'number': index + 1, 'chapter': chapter, 'chapterTitle': chapter_title,
                      'chapterPage': within, 'title': title, 'paragraphs': paragraphs})
    DESTINATION.write_text(json.dumps({'id': 'unser-leben-in-lindenstadt', 'title': introduction[0],
                                       'subtitle': introduction[1] if len(introduction) > 1 else '',
                                       'level': 'A1', 'pages': pages}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Compiled {len(pages)} pages and {len(pages) * 4} paragraphs')


if __name__ == '__main__':
    main()
