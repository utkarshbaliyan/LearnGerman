import { advancedLesson } from './advanced-builder';
import { B2_STRUCTURES } from './b2-structures';
import { B2_MEANING } from './b2-meaning';
import { B2_TEXT } from './b2-text';
import { C1_STRUCTURES } from './c1-structures';
import { C1_MEANING } from './c1-meaning';
import { C1_TEXT } from './c1-text';
import type { GrammarModule } from './course';

export const ADVANCED_DEFINITIONS = [...B2_STRUCTURES, ...B2_MEANING, ...B2_TEXT, ...C1_STRUCTURES, ...C1_MEANING, ...C1_TEXT];
const moduleTitles = [
  ['B2', 'Complements and verb chains', 'Control lexical frames, infinitive actors and auxiliary placement.'],
  ['B2', 'Time and passive perspective', 'Distinguish reference time, completion, process, state and recipient.'],
  ['B2', 'Reporting and degrees of certainty', 'Attribute claims and separate inference, intention and obligation.'],
  ['B2', 'Conditions and logical relationships', 'Express counterfactual time, comparison, method and consequence.'],
  ['B2', 'Dense noun phrases and reference', 'Build participial attributes, nominal style and reliable reference.'],
  ['B2', 'Discourse, spelling and synthesis', 'Control focus, negation, particles and current punctuation.'],
  ['C1', 'Lexical precision and complex time', 'Refine case frames, predicate integration and nested verb chains.'],
  ['C1', 'Voice, modality and careful inference', 'Preserve roles and certainty across advanced transformations.'],
  ['C1', 'Attribution and refined clause relations', 'Sustain reporting and distinguish restriction, concession and cause.'],
  ['C1', 'Noun phrase precision and cohesion', 'Resolve attachment, agreement, lexical formation and reference.'],
  ['C1', 'Information structure and register', 'Organise focus, interactional stance and economical formal prose.'],
  ['C1', 'Orthography and cumulative production', 'Revise requests, arguments and reports with explicit self-check criteria.'],
] as const;

export const ADVANCED_GRAMMAR_MODULES: GrammarModule[] = moduleTitles.map(([level,title,description],index) => {
  const number = index % 6 + 1;
  const id = `${level.toLowerCase()}-${number}`;
  return { id, level, number, title, description,
    lessons: ADVANCED_DEFINITIONS.filter(d => d.id.startsWith(`${id}-`)).map((d,i) => ({
      id:d.id, number:(number - 1) * 6 + i + 1, title:d.title, outcome:d.outcome, released:true,
    })) };
});
export const ADVANCED_GRAMMAR_LESSONS = Object.fromEntries(ADVANCED_DEFINITIONS.map(d => [d.id, advancedLesson(d)]));
