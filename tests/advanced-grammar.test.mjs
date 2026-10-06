import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({configFile:false,root,resolve:{alias:{'@':root}},optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,ws:false,watch:null}});
after(()=>vite.close());
const course=await vite.ssrLoadModule('/app/grammar/course.ts');
const {ADVANCED_DEFINITIONS}=await vite.ssrLoadModule('/app/grammar/advanced-course.ts');
const {GRAMMAR_SOURCES}=await vite.ssrLoadModule('/app/grammar/sources.ts');
const {acceptsGrammarAnswer,joinGrammarTokens}=await vite.ssrLoadModule('/app/grammar/practice-answer.ts');

test('B2 and C1 provide complete sequenced modules with distinct model contexts and valid references',()=>{
  assert.deepEqual(course.GRAMMAR_LEVELS,['A1','A2','B1','B2','C1']);
  for(const level of ['B2','C1']) {
    const modules=course.GRAMMAR_MODULES.filter(m=>m.level===level);
    assert.equal(modules.length,6);
    assert.deepEqual(modules.flatMap(m=>m.lessons.map(l=>l.number)),Array.from({length:36},(_,i)=>i+1));
    for(const module of modules) for(const lesson of module.lessons) assert.ok(course.LIVE_GRAMMAR_LESSONS[lesson.id]);
  }
  assert.equal(ADVANCED_DEFINITIONS.length,72);
  for(const d of ADVANCED_DEFINITIONS) {
    const lesson=course.LIVE_GRAMMAR_LESSONS[d.id];
    assert.equal(d.rows.length,10,d.id);
    assert.equal(new Set(lesson.exercises.filter(e=>e.type==='choice').map(e=>e.answer)).size,10,d.id);
    assert.ok(d.rules.every(rule=>rule.length>50),`${d.id}: full specific rules`);
    assert.ok(lesson.sources.length>0);
    for(const source of lesson.sources) assert.ok(GRAMMAR_SOURCES[source],`${d.id}: ${source}`);
    const choices=lesson.exercises.filter(e=>e.type==='choice');
    assert.ok(new Set(choices.map(e=>e.options.indexOf(e.answer))).size>=3,`${d.id}: do not expose the answer in one fixed slot`);
    for(const e of choices) {
      assert.equal(new Set(e.options).size,4,e.id);
      assert.equal(e.options.filter(o=>acceptsGrammarAnswer(e.answer,o,e.caseSensitive)).length,1,e.id);
    }
    const fills=lesson.exercises.filter(e=>e.type==='fill');
    fills.forEach((e,i)=>assert.equal(e.prompt.replace('___',e.answer),choices[i].answer,e.id));
  }
});

test('ordered complex sentences accept commas and punctuation while advanced spelling remains precise',()=>{
  assert.equal(joinGrammarTokens(['Wenn','sie','kommt',',','beginnen','wir','.']),'Wenn sie kommt, beginnen wir.');
  assert.equal(joinGrammarTokens(['Er','fragt',':','Wann','kommt','sie','?']),'Er fragt: Wann kommt sie?');
  assert.ok(acceptsGrammarAnswer('Wenn sie kommt, beginnen wir.','Wenn sie kommt , beginnen wir .'));
  assert.ok(acceptsGrammarAnswer(['Ich danke dir.','Ich bin dir dankbar.'],'ich bin dir dankbar'));
  assert.equal(acceptsGrammarAnswer('Lesen','lesen',true),false);
  assert.equal(acceptsGrammarAnswer('Ich danke Ihnen.','Ich danke ihnen.',true),false);
  for(const d of ADVANCED_DEFINITIONS) for(const e of course.LIVE_GRAMMAR_LESSONS[d.id].exercises.filter(e=>e.type==='order')) {
    const tokens=e.answer.replace(/([,.!?;:])/g,' $1').trim().split(/\s+/);
    assert.deepEqual([...tokens].sort(),[...e.tokens].sort(),e.id);
    assert.ok(acceptsGrammarAnswer(e.answer,joinGrammarTokens(tokens),e.caseSensitive),e.id);
  }
});

test('advanced progress round-trips and merges with old scores without changing earlier completions',async()=>{
  const p=await vite.ssrLoadModule('/app/lib/progress-sync.ts');
  const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  const old={completed:['a1-1-1','b1-4-6'],scores:{'a1-1-1':95,'b1-4-6':82},sets:{'a1-1-1':{Recognition:95},'b1-4-6':{Production:82}}};
  p.writeGrammarProgress(storage,old);
  const required=Object.fromEntries(Object.entries(course.LIVE_GRAMMAR_LESSONS).map(([id,l])=>[id,[...new Set(l.exercises.map(e=>e.group))]]));
  for(const id of ['b2-1-1','c1-6-6']) {
    const sets=Object.fromEntries(required[id].map(name=>[name,90]));
    p.syncGrammarLessonToCourse(storage,id,sets,90);
    p.syncGrammarLessonToLibrary(storage,id,sets,90,true);
  }
  const local=p.readGrammarProgress(storage);
  const merged=p.mergeGrammarProgressWithCourse(local,p.readCourseProgress(storage),required);
  assert.deepEqual(merged.completed,['a1-1-1','b1-4-6','b2-1-1','c1-6-6']);
  for(const id of old.completed){assert.equal(merged.scores[id],old.scores[id]);assert.deepEqual(merged.sets[id],old.sets[id]);}
  assert.equal(merged.scores['c1-6-6'],90);
  assert.equal(Object.keys(merged.sets['b2-1-1']).length,5);
});

test('current infinitive comma guidance and mixed declension exceptions remain explicit',()=>{
  assert.match(course.LIVE_GRAMMAR_LESSONS['a2-4-1'].explanation.join(' '),/2024.*clause-like/);
  assert.match(course.LIVE_GRAMMAR_LESSONS['b1-1-4'].explanation.join(' '),/des Namens.*des Herzens/);
  assert.match(course.LIVE_GRAMMAR_LESSONS['b1-4-3'].explanation.join(' '),/does not automatically express disbelief/);
});
