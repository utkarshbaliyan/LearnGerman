import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

function normalize(...texts) {
  const modulePath = fileURLToPath(new URL('../scripts/lib/german_transcript_normalization.py', import.meta.url));
  const output = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('german_numbers', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
print(json.dumps([module.normal(text) for text in json.load(sys.stdin)]))
`, modulePath], {input: JSON.stringify(texts), encoding: 'utf8'});
  return JSON.parse(output);
}

test('spoken German prices match digit transcripts without lowering audio thresholds', () => {
  const [spoken, digits] = normalize(
    'Dazu kamen sechshundertneunzig Euro. Insgesamt dreiundzwanzigtausendneunzig Euro. Service für dreihundertneunzig Euro und Zulassung für hundertzehn Euro.',
    'Dazu kamen 690 Euro. Insgesamt 23.090 Euro. Service für 390 Euro und Zulassung für 110 Euro.',
  );
  assert.deepEqual(spoken, digits);
});

test('different prices and malformed thousands separators remain different', () => {
  const [price, otherPrice, hundreds, thousands, grouped, decimal] = normalize(
    'sechshundertneunzig Euro', '680 Euro', 'dreihundertneunzig Euro', '3900 Euro', '23.090 Euro', '23.09 Euro',
  );
  assert.notDeepEqual(price, otherPrice);
  assert.notDeepEqual(hundreds, thousands);
  assert.notDeepEqual(grouped, decimal);
});

test('quantity normalization preserves articles, names and other transcript words', () => {
  const [words, platforms, platformDigits, compound, digits] = normalize(
    'Ein Tausendfüßler neben Hundertwasser und einer Hundertschaft.',
    'Gleisacht und Gleisneun', 'Gleis 8 und Gleis 9',
    'neunhundertneunundneunzigtausendneunhundertneunundneunzig', '999.999',
  );
  assert.deepEqual(words, ['ein', 'tausendfüssler', 'neben', 'hundertwasser', 'und', 'einer', 'hundertschaft']);
  assert.deepEqual(platforms, platformDigits);
  assert.deepEqual(compound, digits);
});
