import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';
test('every story word has an explicit gloss and capital letters never imply a name', async()=>{
 const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try {
  const {getCurriculum,meaningFor,cleanWord}=await vite.ssrLoadModule('/app/curriculum/index.ts');
  const {meaningFor:a1Meaning}=await vite.ssrLoadModule('/app/curriculum/a1.ts');
  let count=0;
  for(const level of ['A1','A2','B1']) for(const story of getCurriculum(level).stories){
   count++;
   for(const token of story.text.split(/\s+/)) {
    if(!cleanWord(token)||/\d/.test(token))continue;
    const gloss=meaningFor(token);
    assert.ok(gloss,`${level} story ${story.number}: missing ${token}`);
    assert.notEqual(gloss,'name / place');
   }
  }
  assert.equal(count,440);
  for(const [word,meaning] of [['Zimmer','room'],['Kaffee','coffee'],['Fahrrad','bicycle'],['Schränke','cupboards'],['genommen','taken'],['Prioritäten','priorities']]) assert.ok(meaningFor(word).includes(meaning),word);
  assert.match(meaningFor('Mia'),/personal name/);
  assert.match(meaningFor('Köln'),/Cologne/);
  assert.match(meaningFor('E-Mail'),/email/);
  assert.equal(meaningFor('UnbekanntesTestwort'),'');
  assert.equal(a1Meaning('UnbekanntesTestwort'),'');
 } finally {await vite.close();}
});
