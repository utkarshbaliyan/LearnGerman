import assert from 'node:assert/strict';
import test from 'node:test';
import {b2DraftIssues, storySimilarity, germanWordCount} from '../scripts/lib/b2-story-quality.mjs';

test('B2 draft checks reject old plot text and matching titles across levels', () => {
  const previous={id:'reading-a2-old',title:'Ein anderer Weg',text:'Mara prüft den Vertrag und bemerkt eine falsche Summe. „Das müssen wir klären“, sagt sie.'};
  const issues=b2DraftIssues({title:previous.title},{text:previous.text,speakerAssignments:[{index:0,speaker:'Mara',voice:'female'}]},[previous]);
  assert.ok(issues.some(issue=>issue.includes('title repeats')));
  assert.ok(issues.some(issue=>issue.includes('text repeats')));
});

test('B2 draft checks reject short stories and incomplete voice assignments', () => {
  const issues=b2DraftIssues({title:'Neue Handlung'},{text:'„Das ist meine Entscheidung“, sagt Jo.',speakerAssignments:[]});
  assert.ok(issues.some(issue=>issue.includes('required 900–1000')));
  assert.ok(issues.some(issue=>issue.includes('speaker plan')));
});

test('phrase overlap catches copied passages despite case and punctuation changes', () => {
  const text='Ein Team prüft einen Entwurf und entdeckt dabei mehrere ungeklärte Fragen zur geplanten Umsetzung.';
  assert.equal(storySimilarity(text,text.toLocaleUpperCase('de')+'!').containment,1);
  assert.ok(storySimilarity(text,'Auf dem Bahnsteig verabschiedet sich die Familie vor einer langen Reise.').jaccard<.1);
  assert.equal(germanWordCount('„E-Mail“ und Zeitplanung: zwei unterschiedliche Aufgaben.'),6);
});
