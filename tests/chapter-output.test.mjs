import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("all 72 chapter tasks follow taught grammar and increase output gradually", async () => {
  const vite = await createServer({ configFile:false, resolve:{ alias:{"@":process.cwd()} }, server:{middlewareMode:true,ws:false} });
  try {
    const {getChapterOutputTask} = await vite.ssrLoadModule("/app/lib/chapter-output-tasks.ts");
    const {getSpeakingMission} = await vite.ssrLoadModule("/app/lib/speaking-missions.ts");
    const {getWritingTask} = await vite.ssrLoadModule("/app/lib/writing-task.ts");
    const {dialogueReply} = await vite.ssrLoadModule("/app/api/tutor/_dialogue.ts");
    const titles = new Set();
    let previousWords = 0, previousTurns = 0;
    for (const level of ["a1","a2","b1"]) for(let n=1;n<=24;n++) {
      const id = `${level}-${Math.ceil(n/6)}-${(n-1)%6+1}`;
      const task = getChapterOutputTask(id), mission = getSpeakingMission(id), writing = getWritingTask(id);
      assert.ok(task && mission && writing);
      assert.equal(writing.prompt, task.writing);
      assert.equal(mission.grammarFocus, writing.grammarFocus);
      assert.equal(mission.chapter,n);
      assert.equal(mission.turns,task.questions.length);
      assert.ok(task.suggestedWords >= previousWords); assert.ok(mission.turns >= previousTurns);
      previousWords=task.suggestedWords; previousTurns=mission.turns;
      assert.ok(!titles.has(task.title)); titles.add(task.title);
      assert.match(writing.rubric,/never a minimum word-count penalty/);
    }
    const first=getSpeakingMission("a1-1-1");
    assert.equal(first.turns,2);
    assert.equal(first.title,"Say hello");
    assert.match(first.grammarFocus,/Personal pronouns and sein/);
    assert.doesNotMatch(first.goal,/appointment|reason|languages|50 words/i);
    assert.equal(await dialogueReply(first,{turns:[]},"Ich bin Mira."),"Bist du neu hier?");
    assert.equal(await dialogueReply(first,{turns:[{}]},"Ja, ich bin neu."),"Danke! Gut gemacht.");
    assert.equal(getChapterOutputTask("a1-9-9"),null);
    assert.match(getWritingTask("a2-3-4").prompt,/appointment/);
  } finally { await vite.close(); }
});
