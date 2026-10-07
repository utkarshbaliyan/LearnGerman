import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { vocabularyTopic } from './vocabulary-topics.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const QUOTAS={noun:6500,verb:1800,adjective:1400,adverb:300};
const TARGET=10000;
const SOURCE_COMMIT='308e64a848f803379ecdbe9a17bf85745be5f85e';
const SOURCE_HASHES={noun:'eb7ac24c90d5e3c029a42cc04f913f6cd8efb31fb40b2c4f0ab557cc7e6ac431',verb:'02eec988578819367bdb0183df5a6805e844383a69087348d4d7b59f3b87475a',adjective:'ce0fbe521a56408ba0abccf5e1c9914684a197a43b290b15dcd220c3768ee623',adverb:'8e1a3b6eafd0f3b7f1b2a0bc1f6d7ca81071246f1edac01b4b2f38607c55e660'};
const digest=value=>createHash('sha256').update(value).digest('hex');
const snapshot=path.join(ROOT,'content/vocabulary/c1-dictionary-source.json.gz');
const prepared=process.env.C1_DICTIONARY_CANDIDATES;
const sourceDirectory=process.env.TARTARUS_C1_DATA_DIR;
const vite=await createServer({root:ROOT,configFile:false,resolve:{alias:{'@':ROOT}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,ws:false,watch:null}});
let prior, vocabularyHeadwordKey;
try {
 const data=await vite.ssrLoadModule('/app/vocabulary/data.ts');
 prior=[...data.ALL_VOCABULARY.filter(w=>w.level!=='C1'),...data.LEGACY_VOCABULARY];
 ({vocabularyHeadwordKey}=await vite.ssrLoadModule('/app/vocabulary/headword.ts'));
} finally {await vite.close()}
let input;
if(prepared) {
 if(!sourceDirectory) throw new Error('Initial preparation also needs the pinned Tartarus C1 source for ranking.');
 if((await readFile(path.join(sourceDirectory,'source-commit.txt'),'utf8')).trim()!==SOURCE_COMMIT)throw new Error('C1 ranking source revision changed.');
 const sources=[]; const preferred=new Set();
 for(const kind of Object.keys(QUOTAS)) {
  const file=`german_${kind}_c1.json`; const bytes=await readFile(path.join(sourceDirectory,file));
  if(digest(bytes)!==SOURCE_HASHES[kind])throw new Error(`C1 ranking source checksum mismatch: ${file}`);
  const data=JSON.parse(bytes);
  if(data.metadata?.level!=='c1'||data.metadata?.language!=='german')throw new Error(`Invalid C1 ranking source: ${file}`);
  sources.push({file,sha256:digest(bytes)});
  data.items.forEach(item=>preferred.add(vocabularyHeadwordKey(item.word)));
 }
 const candidates=JSON.parse(await readFile(prepared,'utf8'));
 candidates.forEach(row=>row.sourceC1=preferred.has(vocabularyHeadwordKey(row.article?`${row.article} ${row.word}`:row.word)));
 candidates.sort((a,b)=>Number(b.sourceC1)-Number(a.sourceC1)||b.zipf-a.zipf||a.word.localeCompare(b.word,'de')||a.wordClass.localeCompare(b.wordClass)||a.english.localeCompare(b.english,'en'));
 input={metadata:{dictionary:'https://kaikki.org/dictionary/German/index.html',download:'https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl.gz',dump:'2026-09-02',extracted:'2026-10-03',archiveSha256:'ff03802fa4d034a80c03fd72a78243834cc06e69d7031c7be9d745a02c78b34e',license:'CC-BY-SA-4.0',frequency:{package:'wordfreq',version:'3.1.1',wordlist:'large',language:'de',range:[2,4.5]},placementSource:{repository:'https://github.com/bahman-farhadian/tartarus',commit:'308e64a848f803379ecdbe9a17bf85745be5f85e',license:'MIT',sources}},items:candidates};
} else {
 const bytes=await readFile(snapshot); input=JSON.parse(gunzipSync(bytes));
 const previous=JSON.parse(await readFile(path.join(ROOT,'app/vocabulary/c1-provenance.json'),'utf8'));
 if(digest(bytes)!==previous.snapshotSha256)throw new Error('C1 source snapshot changed. Review it before rebuilding.');
}
const seen=new Set(prior.map(w=>vocabularyHeadwordKey(w.german)));
const rows=[]; const accepted=[]; const classes=Object.fromEntries(Object.keys(QUOTAS).map(k=>[k,0]));
const excluded=new Set(['ur','sur','neo','public','fuck','shit','vögeln','derbe','Nutte'.toLowerCase(),'huren','kacken','geschoß','obergeschoß','untergeschoß']);
const overrides={inhaltlich:'relating to content / substance',bequemen:'to bring oneself to do something reluctantly',laben:'to feast on / to refresh oneself'};
for(const item of input.items) {
 const kind=item.wordClass;
 if(classes[kind]>=QUOTAS[kind])continue;
 const reflexive=['bequemen','laben'].includes(item.word)||item.reflexive;
 const german=kind==='noun'?`${item.article} ${item.word}`:reflexive?`sich ${item.word}`:item.word;
 const key=vocabularyHeadwordKey(german);
 if(seen.has(key)||excluded.has(key)||/^(ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|hundert|tausend)(mal|fach|tens)$/.test(key))continue;
 if(!item.english || item.english.length>150 || (kind==='noun'&&!/^(der|die|das)\s+[\p{Lu}]/u.test(german)))throw new Error(`Malformed dictionary lemma: ${item.word}`);
 seen.add(key);classes[kind]++;
 const english=overrides[key]??item.english;
 const category=/herzog/i.test(item.word)?'Dienstleistungen & Behörden':vocabularyTopic(item.word,english,kind);
 rows.push([german,english,category,kind,item.word]);
 accepted.push(item);
}
if(rows.length!==TARGET||Object.keys(QUOTAS).some(k=>classes[k]!==QUOTAS[k]))throw new Error(`Insufficient distinct headwords: ${JSON.stringify(classes)}`);
if(prepared) {
 await mkdir(path.dirname(snapshot),{recursive:true});
 await writeFile(snapshot,gzipSync(JSON.stringify({...input,items:accepted}),{mtime:0,level:9}));
}
const snapshotBytes=await readFile(snapshot);
await writeFile(path.join(ROOT,'app/vocabulary/c1-data.json'),JSON.stringify(rows,null,2)+'\n');
await writeFile(path.join(ROOT,'app/vocabulary/c1-provenance.json'),JSON.stringify({...input.metadata,target:TARGET,wordClasses:classes,sourceC1Matches:accepted.filter(r=>r.sourceC1).length,snapshotSha256:digest(snapshotBytes),rowsSha256:digest(JSON.stringify(rows)),zipfRanges:Object.fromEntries(Object.keys(QUOTAS).map(k=>[k,[Math.min(...accepted.filter(r=>r.wordClass===k).map(r=>r.zipf)),Math.max(...accepted.filter(r=>r.wordClass===k).map(r=>r.zipf))]])),review:'Dictionary-backed editorial C1 advanced and specialist practice; not independently CEFR-certified or fully teacher-reviewed. Inflections, alternative forms and marked nonstandard senses excluded.'},null,2)+'\n');
console.log(`Wrote ${rows.length} unique C1 additions: ${JSON.stringify(classes)}; ${accepted.filter(r=>r.sourceC1).length} match the C1 source.`);
