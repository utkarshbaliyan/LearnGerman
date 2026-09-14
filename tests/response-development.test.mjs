import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';
test('response development distinguishes beginners, missing content, repetition and meaningful B1 expansion',async()=>{
 const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false}});
 try {
 const {assessDevelopment,speakingTarget}=await vite.ssrLoadModule('/app/lib/response-development.ts');
 const yes={sufficient:true,explanation:'The requested information is present.',nextQuestions:[]};
 const no={sufficient:false,explanation:'You named the place but did not explain the experience.',nextQuestions:['What happened during your visit?','Why was it important to you?']};
 assert.equal(assessDevelopment(yes,'Bo','A1','writing').sufficient,true);
 assert.equal(assessDevelopment(yes,'Ich wohne in Bonn.','B1','speaking').sufficient,false);
 assert.equal(assessDevelopment(yes,'Das war gut. '.repeat(50),'B1','writing').sufficient,false);
 assert.deepEqual(assessDevelopment(no,'Viele Wörter '.repeat(50),'B1','writing').nextQuestions,no.nextQuestions);
 const meaningful='Letzte Woche habe ich mit meiner Schwester ein Museum besucht. Wir haben viel über die Geschichte unserer Stadt gelernt. Besonders interessant fand ich die alten Fotos, weil ich einige Straßen wiedererkannt habe. Beim nächsten Mal möchte ich auch meinen Freund mitnehmen und ihm die Ausstellung zeigen.';
 assert.equal(assessDevelopment(yes,meaningful,'B1','speaking').sufficient,true);
 assert.equal(assessDevelopment(no,meaningful,'B1','writing').sufficient,false,'Length does not override missing task content');
 assert.equal(assessDevelopment(undefined,meaningful,'B1','writing').sufficient,false);
 assert.equal(assessDevelopment({...no,nextQuestions:[]},meaningful,'B1','writing').sufficient,false);
 assert.match(speakingTarget('A1',1),/5–15/);assert.match(speakingTarget('A2',1),/30–60/);assert.match(speakingTarget('B1',1),/60–120/);
 } finally {await vite.close();}
});
