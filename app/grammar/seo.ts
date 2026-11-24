// Search-facing slugs, titles and descriptions for grammar lessons.
// Lesson IDs (a1-1-1 …) stay the internal key for progress and exercises; public URLs use the slug.
// Old /grammar/lessons/<id> URLs redirect permanently to /grammar/lessons/<slug>.
// Titles follow what learners type into Google ("German dative prepositions"), not course labels.
// Keep titles ≤ 50 characters (" | LeseLaut" is appended) and descriptions ≤ 155.

export type GrammarSeo = { slug: string; title: string; description: string };

export const GRAMMAR_SEO: Record<string, GrammarSeo> = {
  'a1-1-1': { slug: 'personal-pronouns-and-sein', title: 'German Personal Pronouns and sein (to be)', description: 'ich, du, er, sie, es … and every form of sein, with tables, examples and common mistakes. A1 German grammar with free practice.' },
  'a1-1-2': { slug: 'present-tense-regular-verbs', title: 'German Present Tense: Regular Verb Endings', description: 'How to conjugate regular German verbs in the present tense: endings table, examples like ich mache / du machst, and common mistakes.' },
  'a1-1-3': { slug: 'present-tense-irregular-verbs', title: 'German Irregular Verbs in the Present Tense', description: 'Stem-changing German verbs like fahren, essen, sehen and lesen: which forms change, conjugation tables, examples and free practice.' },
  'a1-1-4': { slug: 'word-order-verb-second', title: 'German Word Order: The Verb-Second Rule', description: 'Why the conjugated verb comes second in German main clauses, with clear examples, inversion after time words and common learner mistakes.' },
  'a1-1-5': { slug: 'questions-w-words', title: 'German Questions: W-Questions and Yes/No', description: 'How to ask questions in German: wer, was, wo, wann, wie, warum and yes/no questions with the verb first. Examples and practice.' },
  'a1-1-6': { slug: 'nicht-vs-kein', title: 'nicht vs kein: German Negation Explained', description: 'When to use nicht and when to use kein in German, where nicht goes in the sentence, with examples, tables and common mistakes.' },
  'a1-2-1': { slug: 'der-die-das-gender', title: 'der, die, das: German Noun Gender Rules', description: 'How German noun gender works, useful der/die/das patterns and endings, and how to learn articles with every noun. A1 grammar with practice.' },
  'a1-2-2': { slug: 'indefinite-articles-ein-eine', title: 'German Indefinite Articles: ein, eine, einen', description: 'When to use ein, eine and einen in German, with a full table, examples and the difference between definite and indefinite articles.' },
  'a1-2-3': { slug: 'plural-nouns', title: 'German Plural: How to Form Noun Plurals', description: 'The main German plural patterns (-e, -er, -n, -s) with examples, tips to guess the plural and common mistakes.' },
  'a1-2-4': { slug: 'nominative-case', title: 'German Nominative Case: The Subject', description: 'What the nominative case is in German, how to find the subject of a sentence, article table and simple examples for beginners.' },
  'a1-2-5': { slug: 'accusative-case', title: 'German Accusative Case: Articles and Examples', description: 'When to use the accusative in German, how der changes to den, an article table, examples and common mistakes. Free A1 practice.' },
  'a1-2-6': { slug: 'possessive-articles', title: 'German Possessive Articles: mein, dein, sein', description: 'mein, dein, sein, ihr, unser, euer, Ihr: German possessive articles with endings, tables and examples for beginners.' },
  'a1-3-1': { slug: 'modal-verbs', title: 'German Modal Verbs: können, müssen, wollen', description: 'Conjugation and use of German modal verbs können, müssen, wollen, dürfen and sollen, with word order rules, tables and examples.' },
  'a1-3-2': { slug: 'separable-verbs', title: 'German Separable Verbs: Prefixes and Word Order', description: 'How German separable verbs like aufstehen and einkaufen work, where the prefix goes, and which prefixes separate. Examples and practice.' },
  'a1-3-3': { slug: 'imperative', title: 'German Imperative: Commands with du, ihr, Sie', description: 'How to form the German imperative for du, ihr and Sie, with polite forms, irregular verbs, examples and common mistakes.' },
  'a1-3-4': { slug: 'moegen-vs-moechten', title: 'mögen vs möchten in German: The Difference', description: 'When to use mögen (to like) and möchten (would like) in German, conjugation tables, polite requests and examples.' },
  'a1-3-5': { slug: 'es-gibt', title: 'es gibt in German: Meaning and Use', description: 'How to use es gibt (there is / there are) with the accusative, and how it differs from haben. Examples and A1 practice.' },
  'a1-3-6': { slug: 'reflexive-verbs-basics', title: 'German Reflexive Verbs for Beginners', description: 'Common German reflexive verbs like sich waschen and sich freuen, reflexive pronouns mich and dich, with daily-routine examples.' },
  'a1-4-1': { slug: 'dative-case-basics', title: 'German Dative Case for Beginners', description: 'What the dative case is in German, dative articles dem, der, den, indirect objects and simple examples. A1 grammar with practice.' },
  'a1-4-2': { slug: 'dative-prepositions-basics', title: 'German Dative Prepositions: mit, nach, bei, zu', description: 'The most common German dative prepositions mit, nach, bei, seit, von and zu, with contractions like zum and beim, examples and practice.' },
  'a1-4-3': { slug: 'two-way-prepositions-location', title: 'German Two-Way Prepositions: Where? (Dative)', description: 'in, an, auf, unter, über, vor, hinter, neben, zwischen with the dative to say where something is. Tables, examples and practice.' },
  'a1-4-4': { slug: 'time-expressions', title: 'German Time Expressions: am, um, im, seit', description: 'How to say when, how often and how long in German: am Montag, um 8 Uhr, im Mai, seit zwei Jahren, with examples.' },
  'a1-4-5': { slug: 'und-aber-oder-denn', title: 'German Conjunctions: und, aber, oder, denn', description: 'How to connect sentences with und, aber, oder and denn without changing word order. Examples and common mistakes.' },
  'a1-4-6': { slug: 'perfect-tense-basics', title: 'German Perfect Tense for Beginners (Perfekt)', description: 'Form the German Perfekt with haben or sein and the past participle (gemacht, gegangen). Rules, examples and A1 practice.' },
  'a2-1-1': { slug: 'dative-case', title: 'German Dative Case: Articles, Pronouns, Verbs', description: 'The full German dative system: articles, pronouns mir and dir, dative verbs like helfen and gefallen, tables and examples.' },
  'a2-1-2': { slug: 'two-way-prepositions-wechselpraepositionen', title: 'Two-Way Prepositions: Accusative or Dative?', description: 'German Wechselpräpositionen explained: wohin takes the accusative, wo takes the dative. Clear rule, tables, examples and practice.' },
  'a2-1-3': { slug: 'accusative-prepositions', title: 'German Accusative Prepositions: durch, für …', description: 'The German accusative prepositions durch, für, gegen, ohne and um, with article changes, examples and common mistakes.' },
  'a2-1-4': { slug: 'dative-prepositions', title: 'German Dative Prepositions: aus, bei, mit …', description: 'All German dative prepositions aus, außer, bei, mit, nach, seit, von and zu: rules, contractions, tables, examples, practice.' },
  'a2-1-5': { slug: 'possession-von-and-genitive', title: 'Possession in German: von + Dative or Genitive', description: 'How to show possession in German: Annas Buch, das Buch von Anna and the genitive des Mannes. When to use each, with examples.' },
  'a2-1-6': { slug: 'adjective-endings-definite-article', title: 'German Adjective Endings after der, die, das', description: 'Weak adjective endings after definite articles in German: the -e / -en pattern, a full table for all cases, examples and practice.' },
  'a2-2-1': { slug: 'adjective-endings-ein-words', title: 'German Adjective Endings after ein, kein, mein', description: 'Mixed adjective endings after ein, kein and possessives in German: full table for all cases, examples and common mistakes.' },
  'a2-2-2': { slug: 'comparative-and-superlative', title: 'German Comparative and Superlative', description: 'How to compare in German: größer als, so groß wie, am größten. Irregular forms like gut, besser, am besten, with examples.' },
  'a2-2-3': { slug: 'dieser-and-welcher', title: 'German Demonstratives: dieser, jener, welcher', description: 'How to use dieser and welcher in German with all endings, plus demonstrative der/die/das. Tables, examples and practice.' },
  'a2-2-4': { slug: 'relative-clauses-nominative', title: 'German Relative Clauses: Nominative (der, die)', description: 'How to build German relative clauses with der, die, das in the nominative, where the verb goes, and comma rules. Examples.' },
  'a2-2-5': { slug: 'relative-clauses-accusative', title: 'German Relative Clauses: Accusative (den)', description: 'German relative pronouns in the accusative (den, die, das), how to choose the right one, with examples and common mistakes.' },
  'a2-2-6': { slug: 'sich-vs-einander', title: 'Reflexive vs Reciprocal: sich and einander', description: 'The difference between sich and einander in German, reflexive pronouns in accusative and dative, with examples.' },
  'a2-3-1': { slug: 'perfect-tense', title: 'German Perfect Tense: haben or sein?', description: 'The German Perfekt explained: when to use haben or sein, regular and irregular past participles, word order, tables and examples.' },
  'a2-3-2': { slug: 'praeteritum-war-hatte-modals', title: 'German Präteritum: war, hatte and Modal Verbs', description: 'The simple past forms Germans use in speech: war, hatte, konnte, musste, wollte. Conjugation tables, examples and practice.' },
  'a2-3-3': { slug: 'future-tense-werden', title: 'German Future Tense: werden and the Present', description: 'How to talk about the future in German: present tense with time words and Futur I with werden. Rules, examples and practice.' },
  'a2-3-4': { slug: 'weil-dass-da-verb-at-end', title: 'weil, dass, da: German Verb at the End', description: 'German subordinate clauses with weil, da and dass send the verb to the end. Word order rules, comma rules and examples.' },
  'a2-3-5': { slug: 'wenn-vs-als', title: 'wenn vs als in German: The Difference', description: 'When to use wenn and when to use als in German: repeated vs one-time past events, conditions, with clear examples and practice.' },
  'a2-3-6': { slug: 'indirect-questions-ob', title: 'German Indirect Questions with ob and W-Words', description: 'Polite indirect questions in German: Können Sie mir sagen, ob … / wo …? Word order, examples and common mistakes.' },
  'a2-4-1': { slug: 'infinitive-with-zu', title: 'German Infinitive with zu: Rules and Examples', description: 'When to use zu + infinitive in German, where zu goes with separable verbs, which verbs need zu, with examples.' },
  'a2-4-2': { slug: 'um-zu-vs-damit', title: 'um … zu vs damit: Purpose in German', description: 'Express purpose in German with um … zu (same subject) or damit (different subject). Clear rule, word order and examples.' },
  'a2-4-3': { slug: 'dative-and-accusative-word-order', title: 'German Word Order: Dative and Accusative', description: 'In which order do dative and accusative objects go in German? Rules for nouns and pronouns, with examples and practice.' },
  'a2-4-4': { slug: 'tekamolo-time-manner-place', title: 'German Word Order: Time, Manner, Place', description: 'German word order in the middle of the sentence: time before manner before place (TeKaMoLo). Rules, examples and practice.' },
  'a2-4-5': { slug: 'deshalb-trotzdem-sonst', title: 'deshalb, trotzdem, sonst: German Connectors', description: 'German connecting adverbs deshalb, trotzdem and sonst take the verb right after them. Meaning, word order and examples.' },
  'a2-4-6': { slug: 'passive-voice-present', title: 'German Passive Voice: Present Tense', description: 'How to form the German passive with werden + participle (Das Haus wird gebaut), when to use it, von + dative, examples.' },
  'b1-1-1': { slug: 'adjective-endings', title: 'German Adjective Endings: Complete Table', description: 'All German adjective endings in one system: strong, weak and mixed declension across all four cases, with tables and examples.' },
  'b1-1-2': { slug: 'genitive-case', title: 'German Genitive Case: Articles and Prepositions', description: 'The German genitive: des/der, -s endings, and genitive prepositions wegen, trotz, während, statt. Tables, examples and practice.' },
  'b1-1-3': { slug: 'relative-clauses-dative-genitive', title: 'German Relative Clauses: Dative and Genitive', description: 'German relative pronouns dem, denen, dessen and deren, and relative clauses with prepositions. Tables and examples.' },
  'b1-1-4': { slug: 'n-declension', title: 'German N-Declension (Weak Nouns)', description: 'Which German masculine nouns take -n or -en (der Student, den Studenten), how to recognise them, tables and examples.' },
  'b1-1-5': { slug: 'da-compounds-wo-compounds', title: 'German da- and wo-Compounds: darauf, worauf', description: 'How to use da-compounds (dafür, darauf) and wo-compounds (wofür, worauf) in German, and when not to use them. Examples.' },
  'b1-1-6': { slug: 'indefinite-pronouns', title: 'German Indefinite Pronouns: man, jemand, etwas', description: 'man, jemand, niemand, etwas, nichts, alle, einige in German: meaning, endings and examples.' },
  'b1-2-1': { slug: 'praeteritum-simple-past', title: 'German Präteritum: Simple Past Tense', description: 'The German Präteritum for stories and writing: regular and irregular forms, conjugation tables, when to use it vs Perfekt.' },
  'b1-2-2': { slug: 'plusquamperfekt', title: 'German Plusquamperfekt (Past Perfect)', description: 'Form the German Plusquamperfekt with hatte/war + participle to show what happened earlier. Rules, nachdem and examples.' },
  'b1-2-3': { slug: 'futur-1-assumptions', title: 'German Futur I: Future and Assumptions', description: 'Use werden + infinitive for the future and for guesses about now (Er wird krank sein). Rules, word order and examples.' },
  'b1-2-4': { slug: 'passive-voice-tenses', title: 'German Passive in All Tenses', description: 'The German passive in present, Präteritum and Perfekt (wurde gebaut, ist gebaut worden), with modal verbs and examples.' },
  'b1-2-5': { slug: 'passive-alternatives-man-lassen', title: 'German Passive Alternatives: man, lassen', description: 'Ways to avoid the passive in German: man, lassen and sich lassen. When each sounds natural, with examples and practice.' },
  'b1-2-6': { slug: 'konjunktiv-2-present', title: 'German Konjunktiv II: würde, wäre, hätte', description: 'German Konjunktiv II for polite requests, wishes and hypotheticals: würde + infinitive, wäre, hätte, könnte. Tables and examples.' },
  'b1-3-1': { slug: 'konjunktiv-2-past', title: 'German Konjunktiv II Past: hätte / wäre + Participle', description: 'Talk about unreal past events and regrets in German: Ich hätte gelernt, wenn … Rules, modal verbs and examples.' },
  'b1-3-2': { slug: 'conditional-sentences-wenn-falls', title: 'German Conditional Sentences: wenn and falls', description: 'Real and unreal conditions in German with wenn and falls, word order, Konjunktiv II and examples.' },
  'b1-3-3': { slug: 'obwohl-waehrend-trotzdem', title: 'obwohl, während: German Contrast Clauses', description: 'Express contrast in German with obwohl, während and wohingegen, and how obwohl differs from trotzdem. Examples.' },
  'b1-3-4': { slug: 'bevor-nachdem-seitdem-bis', title: 'German Time Clauses: bevor, nachdem, seitdem', description: 'German temporal conjunctions bevor, nachdem, seitdem, bis and sobald with the right tenses and word order. Examples.' },
  'b1-3-5': { slug: 'infinitive-clauses', title: 'German Infinitive Clauses: ohne zu, statt zu', description: 'Shorten German sentences with infinitive clauses: ohne … zu, statt … zu, um … zu. When the subject must be the same, examples.' },
  'b1-3-6': { slug: 'sowohl-als-auch-weder-noch', title: 'sowohl … als auch, weder … noch, entweder … oder', description: 'German two-part conjunctions: sowohl … als auch, weder … noch, entweder … oder, nicht nur … sondern auch. Examples.' },
  'b1-4-1': { slug: 'nominalisation', title: 'German Nominalisation: Verbs and Adjectives as Nouns', description: 'How to turn German verbs and adjectives into nouns (das Lesen, die Entscheidung, das Gute), with capitalisation rules and examples.' },
  'b1-4-2': { slug: 'participles-as-adjectives', title: 'German Participles as Adjectives', description: 'Use Partizip I and II as adjectives in German: der lachende Junge, das gekochte Ei. Endings, meaning and examples.' },
  'b1-4-3': { slug: 'reported-speech-konjunktiv-1', title: 'German Reported Speech: Konjunktiv I', description: 'Indirect speech in German with dass and Konjunktiv I (er sagt, er sei krank). Forms, when to use Konjunktiv II, examples.' },
  'b1-4-4': { slug: 'pronoun-order-and-nicht-position', title: 'German Word Order: Pronouns and nicht', description: 'Where pronouns, nouns and nicht go in a German sentence. Clear rules for the middle field, with examples and practice.' },
  'b1-4-5': { slug: 'text-cohesion-connectors', title: 'German Text Cohesion: Connectors and Reference', description: 'Link sentences and paragraphs in German with pronouns and connective adverbs so your writing flows. Examples for B1 writing.' },
  'b1-4-6': { slug: 'comma-rules-formal-style', title: 'German Comma Rules and Formal Writing', description: 'The main German comma rules for subordinate, relative and infinitive clauses, plus how to adjust formal register in writing.' },
};

const BY_SLUG = new Map(Object.entries(GRAMMAR_SEO).map(([id, seo]) => [seo.slug, id]));

/** Public URL path for a grammar lesson. */
export const grammarLessonPath = (id: string) => `/grammar/lessons/${GRAMMAR_SEO[id]?.slug ?? id}`;

/** Resolve a URL segment to a lesson ID; `redirect` is true when an old ID URL should move to its slug. */
export function resolveGrammarLessonParam(param: string): { id: string; redirect: boolean } {
  const fromSlug = BY_SLUG.get(param);
  if (fromSlug) return { id: fromSlug, redirect: false };
  return { id: param, redirect: Boolean(GRAMMAR_SEO[param]) };
}
