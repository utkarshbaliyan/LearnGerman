import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';

test('separate comprehension results preserve latest evidence across devices', async () => {
 const vite = await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try {
  const {mergeComprehensionChecks:merge} = await vite.ssrLoadModule('/app/lib/comprehension-progress.ts');
  const {mergeProgress} = await vite.ssrLoadModule('/app/lib/progress-merge.ts');
  const early={score:100,checkedAt:'2026-09-14T10:00:00Z',usedText:false};
  const later={score:33,checkedAt:'2026-09-15T10:00:00Z',usedText:true};
  assert.deepEqual(merge({listening:early},{reading:later}),{listening:early,reading:later});
  assert.deepEqual(merge({listening:early},{listening:later}),{listening:later});
  assert.deepEqual(merge({listening:later},{listening:early}),{listening:later});
  assert.deepEqual(merge({listening:{...early,score:Infinity},reading:{...early,checkedAt:'invalid'}},null),{});
  const historical={chapters:{one:{completed:true,skillScores:{reading:100,listening:100}}}};
  const merged=mergeProgress('course',{chapters:{one:{comprehensionChecks:{listening:later}}}},historical);
  assert.equal(merged.chapters.one.completed,true);
  assert.equal(merged.chapters.one.skillScores.reading,100);
  assert.deepEqual(merged.chapters.one.comprehensionChecks,{listening:later});
  assert.deepEqual(mergeProgress('course',historical,historical).chapters.one.comprehensionChecks,{});
 } finally {await vite.close();}
});
