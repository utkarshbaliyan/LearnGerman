#!/usr/bin/env python3
"""Validate and compile the A1 reader without rewriting its prose."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content/books/der-schluessel-im-blauen-korb.txt'
DESTINATION = ROOT / 'app/lib/book-data.json'
HEADING = re.compile(r'^Seite (\d+) — ([^\n]+)$', re.MULTILINE)
CHAPTER = re.compile(r'^KAPITEL (\d+): ([^\n]+)$', re.MULTILINE)


def main():
    source = SOURCE.read_text(encoding='utf-8').replace('\r\n', '\n')
    matches = list(HEADING.finditer(source))
    if len(matches) != 200:
        raise ValueError(f'Expected 200 page headings, found {len(matches)}')
    introduction = [line.strip() for line in source[:matches[0].start()].split('\n') if line.strip() and not line.startswith('KAPITEL ')]
    if introduction[:1] != ['DER SCHLÜSSEL IM BLAUEN KORB']:
        raise ValueError('Unexpected book title')
    chapter_names = ['Neu in Lindenstadt', 'Garten 17', 'Herr Weber', 'Viel zu tun',
                     'Arbeit und Garten', 'Nach dem Sturm', 'Ein Besuch für Herrn Weber',
                     'Ein Fest wird geplant', 'Bleiben oder gehen?', 'Ein Platz für Mila']
    chapters = {int(number): title for number, title in CHAPTER.findall(source)}
    if set(chapters) != set(range(1, 11)):
        raise ValueError('Expected ten numbered chapters')
    if [chapters[index] for index in range(1, 11)] != [name.upper() for name in chapter_names]:
        raise ValueError('Unexpected chapter titles')
    pages = []
    for index, match in enumerate(matches):
        number, title = match.groups()
        number = int(number)
        chapter, within = index // 20 + 1, index % 20 + 1
        if number != index + 1:
            raise ValueError(f'Unexpected chapter/page numbering at page {index + 1}')
        body = source[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(source)].strip()
        if index % 20 == 19:
            body = re.split(r'(?m)^KAPITEL \d+: ', body)[0].strip()
        blocks = [part.strip() for part in re.split(r'\n\s*\n', body) if part.strip()]
        if len(blocks) != 4 or any('\n' in part for part in blocks):
            raise ValueError(f'Page {index + 1} must contain four paragraphs')
        pages.append({'number': index + 1, 'chapter': chapter, 'chapterTitle': chapter_names[chapter - 1],
                      'chapterPage': within, 'title': title, 'paragraphs': blocks})
    DESTINATION.write_text(json.dumps({'id': 'der-schluessel-im-blauen-korb', 'title': 'Der Schlüssel im blauen Korb',
                                       'subtitle': introduction[1] if len(introduction) > 1 else '',
                                       'level': 'A1', 'pages': pages}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Compiled {len(pages)} pages and {len(pages) * 4} paragraphs')


if __name__ == '__main__':
    main()
