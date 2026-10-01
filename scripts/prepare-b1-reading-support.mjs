import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
import {readingSentences} from '../app/lib/reading-sentence-segmentation.mjs';
const root=process.cwd();
const read=p=>JSON.parse(readFileSync(`${root}/${p}`,'utf8'));
const originals=read('content/reading/b1-reviews/original-editions.json');
const drafts=read('content/reading/b1-rewrite-drafts.json');
const glosses=read('content/reading/b1-reviews/word-glosses.reviewed.json');
const vocabulary=read('content/reading/b1-reviews/vocabulary-replacements.reviewed.json');
const revisitEdits=read('content/reading/b1-reviews/revisit-replacements.reviewed.json');
const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,ws:false}});
try{
 const {READING_STORIES}=await vite.ssrLoadModule('/app/lib/reading-path.ts');
 const {glossesForText}=await vite.ssrLoadModule('/app/lib/reading-glossary.ts');
 const priorTexts=new Map([...READING_STORIES,...originals].map(s=>[s.id,drafts[s.id]?.text??s.text]));
 const result={};
 for(const original of originals){
  const draft=drafts[original.id];assert.equal(draft.reviewStatus,'editorially-accepted');
  assert.equal(draft.sourceHash,createHash('sha256').update(original.text).digest('hex'));
  const text=draft.text;
  const sentenceList=text.split('\n\n').flatMap(readingSentences);
  const words=original.words.map((w,i)=>{
   const next={...w,...vocabulary[original.id]?.[i]};
   next.example=sentenceList.find(s=>s.toLowerCase().includes(next.form.toLowerCase()));
   assert.ok(next.example,`${original.id}/${i}: missing vocabulary example`);
   return next;
  });
  assert.equal(new Set(words.map(w=>w.form.toLowerCase())).size,words.length,original.id+': duplicate vocabulary');
  const revisit=original.revisit.map((w,i)=>{
   const next={...w,...revisitEdits[original.id]?.[i]};
   assert.ok(text.toLowerCase().includes(next.german.toLowerCase()),original.id+': missing reuse '+next.german);
   assert.ok(priorTexts.get(next.storyId)?.toLowerCase().includes(next.german.toLowerCase()),original.id+': missing prior reuse '+next.german);
   if(next.storyId.startsWith('reading-b1-'))next.storyId=next.storyId.replace(/-v1$/,'-v2');
   return next;
  });
  const id=original.id.replace(/-v1$/,'-v2');
  result[id]={sourceHash:createHash('sha256').update(text).digest('hex'),words,revisit,
   wordGlosses:glossesForText(text,{...original.wordGlosses,...glosses})};
 }
 writeFileSync(`${root}/content/reading/b1-reviews/reading-support.json`,JSON.stringify(result,null,2)+'\n');
 console.log('Prepared exact vocabulary examples, reuse links and scoped glosses for '+Object.keys(result).length+' stories');
}finally{await vite.close();}
