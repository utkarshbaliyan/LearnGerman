"""Prepare a compact, licensed German lemma snapshot; no examples or media.

Requires wordfreq==3.1.1 in an isolated Python environment. Usage and source
checksums are in docs/C1_VOCABULARY.md. Vocabulary placement is editorial.
"""
import argparse
import gzip
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from wordfreq import zipf_frequency

BAD_TAGS = {
    'form-of', 'alt-of', 'inflection-of', 'archaic', 'obsolete', 'dated',
    'dialectal', 'nonstandard', 'misspelling', 'slang', 'vulgar', 'offensive',
    'derogatory', 'pejorative', 'colloquial', 'regional', 'abbreviation',
    'acronym', 'initialism', 'error-unrecognized-form', 'romanization',
    'historical', 'rare', 'poetic', 'Austrian', 'Swiss',
    'Germany', 'Bavarian', 'northern-Germany', 'southern-Germany',
    'informal', 'Austria', 'Switzerland', 'Northern-Germany', 'Southern-Germany',
    'Bavaria', 'Liechtenstein', 'Vienna',
}
BAD_GLOSS = re.compile(
    r'\b(?:alternative (?:form|spelling)|obsolete (?:form|spelling)|'
    r'misspelling|inflection|plural|genitive|dative|accusative|comparative|'
    r'superlative|past participle|present participle) of\b|'
    r'\b(?:given name|surname|family name|abbreviation of|initialism of|acronym of|'
    r'(?:former|obsolete|obsolet|old|historical|standard) spelling|'
    r'nominalization of|feminine equivalent of|female equivalent of|synonym of|'
    r'inhabitant of|resident of|native of|whore|to shit|slut)\b', re.I)
TOKEN = re.compile(r'[^\W\d_]+(?:-[^\W\d_]+)*\Z', re.U)
GENDERS = {'masculine': 'der', 'feminine': 'die', 'neuter': 'das'}
POS = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb'}


def candidate(entry):
    word = unicodedata.normalize('NFC', entry.get('word', ''))
    pos = entry.get('pos')
    if entry.get('lang_code') != 'de' or pos not in POS or not TOKEN.fullmatch(word) or len(word) < 3:
        return None
    if (pos == 'noun') != word[0].isupper() or word.isupper():
        return None
    if pos == 'verb' and not word.endswith(('en', 'eln', 'ern')):
        return None
    frequency = zipf_frequency(word, 'de', wordlist='large')
    if not 2.0 <= frequency <= 4.5:
        return None
    entry_tags = set(entry.get('tags', []))
    for sense in entry.get('senses', []):
        tags = entry_tags | set(sense.get('tags', []))
        if tags & BAD_TAGS or sense.get('form_of') or sense.get('alt_of'):
            continue
        glosses = sense.get('glosses', [])
        if not glosses:
            continue
        gloss = re.sub(r'\s+', ' ', glosses[-1]).strip().rstrip('.')
        if not 3 <= len(gloss) <= 150 or BAD_GLOSS.search(gloss) or re.search(r'[\[\]{}<>\n]|https?://', gloss):
            continue
        # Avoid unattributed third-party quotation/example text altogether.
        if '"' in gloss or '“' in gloss or gloss.count(';') > 2:
            continue
        gender = None
        if pos == 'noun':
            sense_genders = set(sense.get('tags', [])) & GENDERS.keys()
            genders = sense_genders or (entry_tags & GENDERS.keys())
            if len(genders) != 1 or 'plural-only' in tags:
                continue
            gender = GENDERS[next(iter(genders))]
        if pos == 'verb':
            if not gloss.lower().startswith('to '):
                continue
            gloss = 'to ' + gloss[3:]
        return {'word': word, 'wordClass': POS[pos], 'article': gender,
                'english': gloss, 'reflexive': pos == 'verb' and 'reflexive' in tags and bool(re.search(r'\b(?:oneself|itself|yourself)\b', gloss)),
                'tags': sorted(tags), 'zipf': frequency}
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    source_hash = hashlib.sha256(args.source.read_bytes()).hexdigest()
    if source_hash != 'ff03802fa4d034a80c03fd72a78243834cc06e69d7031c7be9d745a02c78b34e':
        raise ValueError('Expected the reviewed 2026-09-02 English Wiktionary snapshot.')
    candidates = []
    with gzip.open(args.source, 'rt', encoding='utf-8') as source:
        for line in source:
            row = candidate(json.loads(line))
            if row:
                candidates.append(row)
    candidates.sort(key=lambda row: (-row['zipf'], row['word'].casefold(), row['wordClass'], row['english']))
    args.output.write_text(json.dumps(candidates, ensure_ascii=False, separators=(',', ':'))+'\n')
    print('Dictionary source SHA-256:', source_hash)
    print('Qualified lemma candidates:', len(candidates), dict(Counter(r['wordClass'] for r in candidates)))


if __name__ == '__main__':
    main()
