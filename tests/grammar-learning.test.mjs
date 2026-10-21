import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test, { after } from 'node:test';
import { createServer } from 'vite';
const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, ws: false, watch: null } });
after(() => vite.close());
const { LIVE_GRAMMAR_LESSONS: lessons } = await vite.ssrLoadModule('/app/grammar/course.ts');
const { GRAMMAR_BRIEF_RULES: rules } = await vite.ssrLoadModule('/app/grammar/brief-rules.ts');
const { uniqueGrammarTasks, grammarTaskKey, grammarChoiceOptions, grammarTaskFocus, grammarReferenceParagraphs } = await vite.ssrLoadModule('/app/grammar/practice-sequence.ts');

test('every grammar lesson has a short specific rule and an existing contextual example', () => {
  assert.equal(Object.keys(lessons).length, 144);
  assert.deepEqual(Object.keys(rules).sort(), Object.keys(lessons).sort());
  assert.equal(new Set(Object.values(rules)).size, 144);
  for (const [id, lesson] of Object.entries(lessons)) {
    assert.ok(rules[id].split(/\s+/u).length <= 45, id);
    assert.ok(rules[id].length >= 70, id);
    assert.ok(lesson.examples[0].german && lesson.examples[0].english, id);
  }
  assert.match(rules['a2-1-2'], /Movement alone does not decide/);
  assert.match(rules['b2-1-6'], /haben precedes/);
  assert.match(rules['c1-1-3'], /both arrangements/);
});

test('the original 7200 exercise entries, answers, IDs and set names remain unchanged', () => {
  const signature = JSON.stringify(Object.entries(lessons).sort(([a], [b]) => a.localeCompare(b)).map(([id, lesson]) => [id, lesson.exercises]));
  assert.equal(createHash('sha256').update(signature).digest('hex'), '42f0ac3f7c5e3a3d813ff1f79c461a58c9b7ccb84eb8bab4db8765e4ddeeee26');
  assert.equal(Object.values(lessons).reduce((count, lesson) => count + lesson.exercises.length, 0), 7200);
});

test('practice skips 360 identical repeats while retaining every existing set and distinct task', () => {
  let removed = 0;
  for (const [id, lesson] of Object.entries(lessons)) {
    const before = JSON.stringify(lesson.exercises), unique = uniqueGrammarTasks(lesson.exercises);
    removed += lesson.exercises.length - unique.length;
    assert.equal(new Set(unique.map(grammarTaskKey)).size, unique.length, id);
    assert.deepEqual([...new Set(unique.map(e => e.group))], [...new Set(lesson.exercises.map(e => e.group))], id);
    assert.ok(unique.every(e => lesson.exercises.includes(e)), id);
    assert.equal(JSON.stringify(lesson.exercises), before, id);
  }
  assert.equal(removed, 360);
  const samePromptDifferentTask = [
    {id:'one',group:'Build',type:'order',prompt:'Build.',tokens:['Ich','komme','.'],answer:'Ich komme.',explanation:'A'},
    {id:'two',group:'Build',type:'order',prompt:'Build.',tokens:['Du','kommst','.'],answer:'Du kommst.',explanation:'B'},
  ];
  assert.equal(uniqueGrammarTasks(samePromptDifferentTask).length, 2);
});

test('choice display has no duplicate labels or fixed correct slot and preserves all distinct options', () => {
  const positions = new Set(); let repaired = 0;
  for (const lesson of Object.values(lessons)) for (const e of lesson.exercises.filter(e => e.type === 'choice')) {
    const before = [...e.options], options = grammarChoiceOptions(e);
    assert.equal(new Set(options).size, options.length, e.id);
    assert.deepEqual([...options].sort(), [...new Set(e.options)].sort(), e.id);
    assert.equal(options.filter(option => option === e.answer).length, 1, e.id);
    assert.deepEqual(grammarChoiceOptions(e), options, e.id);
    assert.deepEqual(e.options, before, e.id);
    if (options.length < e.options.length) repaired++;
    positions.add(options.indexOf(e.answer));
  }
  assert.equal(repaired, 5);
  assert.equal(positions.size, 4);
  const firstLessonSlots = lessons['a1-1-1'].exercises.filter(e => e.type === 'choice').map(e => grammarChoiceOptions(e).indexOf(e.answer));
  assert.ok(new Set(firstLessonSlots).size >= 3);
});

test('contrasting valid C1 infinitive targets are identified before checking an answer', () => {
  const items = lessons['c1-1-3'].exercises;
  for (const id of ['c113-04','c113-24','c113-34']) assert.match(grammarTaskFocus(items.find(e => e.id === id)), /integrated.*before versucht/);
  for (const id of ['c113-05','c113-25','c113-35']) assert.match(grammarTaskFocus(items.find(e => e.id === id)), /separate.*after versucht/);
  assert.equal(grammarTaskFocus(lessons['a1-1-1'].exercises[0]), undefined);
});

test('optional reference removes repeated paragraphs and generic practice instructions', () => {
  for (const [id, lesson] of Object.entries(lessons)) {
    const paragraphs = grammarReferenceParagraphs(lesson);
    assert.ok(paragraphs.length > 0, id);
    assert.equal(new Set(paragraphs).size, paragraphs.length, id);
    assert.ok(paragraphs.every(p => !/^(The central working pattern is|Build accuracy in three passes:)/u.test(p)), id);
    assert.ok(lesson.explanation.filter(p => !/^(The central working pattern is|Build accuracy in three passes:)/u.test(p)).every(p => paragraphs.includes(p.normalize('NFC').replace(/\s+/gu,' ').trim())), id);
  }
});
