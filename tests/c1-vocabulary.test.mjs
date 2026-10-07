import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,ws:false,watch:null}});
after(()=>vite.close());
const data=await vite.ssrLoadModule('/app/vocabulary/data.ts');
const {vocabularyHeadwordKey}=await vite.ssrLoadModule('/app/vocabulary/headword.ts');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const words=data.C1_VOCABULARY;
const rows=JSON.parse(readFileSync('app/vocabulary/c1-data.json','utf8'));
const manifest=JSON.parse(readFileSync('app/vocabulary/c1-provenance.json','utf8'));

test('C1 adds 10000 dictionary lemmas while every earlier card and alias remains unchanged',()=>{
  assert.equal(words.length,10000);
  assert.equal(data.ALL_VOCABULARY.length,17397);
  assert.equal(hash(JSON.stringify(data.ALL_VOCABULARY.filter(w=>w.level!=='C1'))),'d7ef2eeab115b60cc15d72b32da658d130a32e7ffd0d71975ce7767b58a11db9');
  assert.equal(new Set(data.ALL_VOCABULARY.map(w=>vocabularyHeadwordKey(w.german))).size,17397);
  assert.equal(new Set(data.ALL_VOCABULARY.map(w=>w.id)).size,17397);
  const previous=new Set(data.ALL_VOCABULARY.filter(w=>w.level!=='C1').flatMap(w=>[w,...w.progressAliases??[]]).map(w=>vocabularyHeadwordKey(w.german)));
  assert.ok(words.every(w=>!previous.has(vocabularyHeadwordKey(w.german))));
  assert.ok(words.every(w=>w.id===`lexicon-c1-${vocabularyHeadwordKey(w.german)}`));
  assert.ok(words.every(data.isStandaloneVocabularyHeadword));
  assert.deepEqual(Object.fromEntries(['noun','verb','adjective','adverb'].map(k=>[k,words.filter(w=>w.wordClass===k).length])),{noun:6500,verb:1800,adjective:1400,adverb:300});
  assert.ok(words.filter(w=>w.wordClass==='noun').every(w=>/^(der|die|das)\s+[\p{Lu}]/u.test(w.german)));
  assert.ok(words.filter(w=>w.wordClass==='verb').every(w=>w.english.startsWith('to ')));
  assert.ok(words.every(w=>w.sourceUrl.startsWith('https://en.wiktionary.org/wiki/')&&w.sourceUrl.endsWith('#German')));
});

test('C1 provenance is reproducible and known dictionary extraction errors are excluded',()=>{
  assert.equal(hash(JSON.stringify(rows)),manifest.rowsSha256);
  const snapshot=readFileSync('content/vocabulary/c1-dictionary-source.json.gz');
  assert.equal(hash(snapshot),manifest.snapshotSha256);
  const source=JSON.parse(gunzipSync(snapshot));
  assert.equal(source.items.length,10000);
  assert.equal(manifest.license,'CC-BY-SA-4.0');
  assert.equal(source.metadata.archiveSha256,manifest.archiveSha256);
  assert.ok(words.every(w=>!/(?:former|obsolete|obsolet|standard) spelling|nominalization of|feminine equivalent of|synonym of|inhabitant of|resident of|native of/i.test(w.english)));
  const excluded=new Set(['Maas','Maaß','Act','Doctor','Scene','Camera','Author','Geschoß','Obergeschoß','Untergeschoß','Altes','Gleiches','Süßes','Grünes','Mieses','Junges','Einzelner','derbe','Nutte','huren','kacken','vögeln','neunmal'].map(w=>w.toLocaleLowerCase('de')));
  assert.ok(words.every(w=>!excluded.has(vocabularyHeadwordKey(w.german))));
  assert.ok(source.items.every(w=>w.zipf>=2&&w.zipf<=4.5));
  assert.equal(words.find(w=>w.german==='der Herzog').category,'Dienstleistungen & Behörden');
  assert.equal(words.find(w=>w.german==='inhaltlich').english,'relating to content / substance');
  const laben=words.find(w=>w.german==='sich laben');
  if(laben)assert.equal(laben.english,'to feast on / to refresh oneself');
  const maurer=words.find(w=>w.german==='der Maurer');
  if(maurer)assert.match(maurer.english,/mason|bricklayer/i);
});

test('C1 review scheduling round-trips alongside earlier vocabulary progress',async()=>{
  const p=await vite.ssrLoadModule('/app/lib/progress-sync.ts');
  const {rateVocabularyFlashcard}=await vite.ssrLoadModule('/app/lib/flashcard-progress.ts');
  const old=data.B2_VOCABULARY[0],newWord=words[0];
  const legacy=rateVocabularyFlashcard({...p.emptyVocabularyProgress(),legacyMigrated:true},old,3,1000);
  const next=rateVocabularyFlashcard(legacy,newWord,2,2000);
  assert.deepEqual(next.cards[p.vocabularyCardKey(old)],legacy.cards[p.vocabularyCardKey(old)]);
  assert.equal(p.isVocabularyReview(next,newWord),true);
  const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  p.writeVocabularyProgress(storage,next);
  assert.deepEqual(p.readVocabularyProgress(storage,data.ALL_VOCABULARY),next);
  assert.ok(p.vocabularyReviewDueAt(next,newWord)>2000);
});

test('published source guidance includes contributor attribution and honest level scope',async()=>{
  const {default:Sources}=await vite.ssrLoadModule('/app/vocabulary/sources/page.tsx');
  const html=renderToStaticMarkup(React.createElement(Sources));
  assert.match(html,/10,000 distinct German headwords/);
  assert.match(html,/not every entry is inherently C1/i);
  assert.match(html,/Wiktionary contributors/);
  assert.match(html,/creativecommons.org\/licenses\/by-sa\/4.0/);
  assert.match(html,/c1-data.json/);
});
