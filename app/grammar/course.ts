export type GrammarLevel = "A1" | "A2" | "B1";

export type GrammarExercise =
  | { id: string; type: "choice"; prompt: string; options: string[]; answer: string; explanation: string }
  | { id: string; type: "fill"; prompt: string; answer: string | string[]; explanation: string }
  | { id: string; type: "order"; prompt: string; tokens: string[]; answer: string; explanation: string }
  | { id: string; type: "correction"; prompt: string; answer: string | string[]; explanation: string }
  | { id: string; type: "production"; prompt: string; model: string; explanation: string };

export type GrammarLesson = {
  id: string;
  number: number;
  title: string;
  outcome: string;
  released: boolean;
};

export type GrammarModule = {
  id: string;
  level: GrammarLevel;
  number: number;
  title: string;
  description: string;
  lessons: GrammarLesson[];
};

export type GrammarLessonContent = {
  id: string;
  lead: string;
  pattern: string;
  explanation: string[];
  examples: { german: string; english: string; note?: string }[];
  mistakes: { wrong: string; right: string; why: string }[];
  memoryTip: string;
  exercises: GrammarExercise[];
};

const createModule = (level: GrammarLevel, number: number, title: string, description: string, lessons: [string, string][]): GrammarModule => ({
  id: `${level.toLowerCase()}-${number}`,
  level,
  number,
  title,
  description,
  lessons: lessons.map(([lessonTitle, outcome], index) => ({
    id: `${level.toLowerCase()}-${number}-${index + 1}`,
    number: (number - 1) * 6 + index + 1,
    title: lessonTitle,
    outcome,
    released: level === "A1" && number === 1,
  })),
});

export const GRAMMAR_MODULES: GrammarModule[] = [
  createModule("A1", 1, "Sentence foundations", "Build correct statements, questions, and negatives from the beginning.", [
    ["Personal pronouns and sein", "Introduce people and say who or what they are."],
    ["Regular verbs in the present", "Conjugate common verbs and describe everyday actions."],
    ["Irregular present-tense verbs", "Use frequent stem-changing verbs confidently."],
    ["Main-clause word order", "Keep the conjugated verb in the correct position."],
    ["Questions", "Ask natural yes/no and W-questions."],
    ["Negation with nicht and kein", "Choose the right negative form and place it correctly."],
  ]),
  createModule("A1", 2, "Nouns and the first cases", "Understand articles, noun gender, plurals, and the accusative.", [
    ["Gender and definite articles", "Learn nouns together with der, die, or das."],
    ["Indefinite articles", "Use ein and eine when something is not yet specific."],
    ["Plural forms", "Recognize and form the most useful noun plurals."],
    ["The nominative", "Identify the subject of a sentence."],
    ["The accusative", "Mark direct objects with the correct article."],
    ["Possessive determiners", "Express my, your, his, her, and our."],
  ]),
  createModule("A1", 3, "Everyday verb patterns", "Talk about ability, wishes, routines, requests, and instructions.", [
    ["Modal verbs", "Use können, müssen, wollen, dürfen, and sollen."],
    ["Separable verbs", "Place prefixes correctly in statements and questions."],
    ["The imperative", "Give friendly and formal instructions."],
    ["mögen and möchten", "Express preferences and polite wishes."],
    ["es gibt and haben", "Say what exists and what someone has."],
    ["Reflexive verbs: first steps", "Use common daily-routine verbs with mich and dich."],
  ]),
  createModule("A1", 4, "Time, place, and connection", "Connect simple ideas and locate events in daily life.", [
    ["The dative: first steps", "Recognize common indirect objects and dative articles."],
    ["Common dative prepositions", "Use mit, nach, bei, seit, von, and zu."],
    ["Two-way prepositions: location", "Describe where something is with the dative."],
    ["Time expressions", "Say when, how often, and for how long."],
    ["Coordinating conjunctions", "Connect clauses with und, aber, oder, and denn."],
    ["The perfect tense: introduction", "Report completed everyday actions with haben and sein."],
  ]),
  createModule("A2", 1, "Cases and prepositions", "Control the case system in common descriptions and interactions.", [
    ["The dative system", "Use dative articles and pronouns with confidence."],
    ["Two-way prepositions: movement", "Contrast location and direction."],
    ["Accusative prepositions", "Use durch, für, gegen, ohne, and um."],
    ["Dative prepositions", "Use aus, außer, bei, mit, nach, seit, von, and zu."],
    ["Possession: von and genitive", "Express ownership in spoken and written German."],
    ["Adjective endings after definite articles", "Describe known nouns accurately."],
  ]),
  createModule("A2", 2, "Description and reference", "Describe, compare, and refer to people and things precisely.", [
    ["Adjective endings with ein-words", "Describe nouns after ein, kein, and possessives."],
    ["Comparison", "Use comparative, superlative, als, and wie."],
    ["Demonstratives and welcher", "Point to and select specific people or things."],
    ["Relative clauses: nominative", "Add information about a subject."],
    ["Relative clauses: accusative", "Add information about an object."],
    ["Reflexive and reciprocal meaning", "Distinguish sich from einander."],
  ]),
  createModule("A2", 3, "Past, future, and subordinate clauses", "Tell connected stories and explain reasons, plans, and conditions.", [
    ["The perfect tense", "Choose haben or sein and build participles."],
    ["sein, haben, and modals in the preterite", "Use the most frequent spoken past forms."],
    ["Future meaning", "Express plans with the present and predictions with werden."],
    ["weil, da, and dass", "Move the conjugated verb to the end."],
    ["wenn and als", "Separate repeated conditions from one-time past events."],
    ["Indirect questions", "Form polite questions with ob and W-words."],
  ]),
  createModule("A2", 4, "Purpose, sequence, and voice", "Make longer texts coherent and handle typical A2 structures.", [
    ["Infinitives with zu", "Connect two verb ideas economically."],
    ["um … zu and damit", "Express purpose with the same or different subject."],
    ["Dative and accusative objects", "Order two objects naturally."],
    ["Time–manner–place", "Organize information in the middle field."],
    ["deshalb, trotzdem, and sonst", "Connect cause, contrast, and consequence."],
    ["The present passive", "Focus on processes instead of the actor."],
  ]),
  createModule("B1", 1, "Precision with nouns and pronouns", "Handle denser noun phrases and avoid repetition.", [
    ["Adjective endings: complete system", "Choose endings across articles and cases."],
    ["The genitive", "Express possession and use common genitive prepositions."],
    ["Advanced relative clauses", "Use dative, genitive, and prepositional relatives."],
    ["N-declension", "Decline frequent masculine nouns correctly."],
    ["da- and wo-compounds", "Refer naturally to things and ideas with prepositions."],
    ["Indefinite pronouns", "Use man, jemand, niemand, etwas, and nichts."],
  ]),
  createModule("B1", 2, "Narrative time, voice, and modality", "Tell fuller stories and change perspective or certainty.", [
    ["The narrative preterite", "Use common written past forms in connected narration."],
    ["The pluperfect", "Show what happened before another past event."],
    ["Future and assumptions", "Use werden for future meaning and probability."],
    ["Passive in present and past", "Describe processes across time."],
    ["Passive alternatives", "Use man, lassen, and sich lassen naturally."],
    ["Konjunktiv II: present", "Make polite, hypothetical, and unreal statements."],
  ]),
  createModule("B1", 3, "Complex clause architecture", "Express unreal past, contrast, sequence, and layered relationships.", [
    ["Konjunktiv II: past", "Discuss unreal past situations and regrets."],
    ["Conditions with wenn and falls", "State real and hypothetical conditions."],
    ["Contrast clauses", "Use obwohl, während, and wohingegen."],
    ["Time clauses", "Use bevor, nachdem, seitdem, bis, and sobald."],
    ["Infinitive clauses and reductions", "Avoid repetition with compact structures."],
    ["Paired conjunctions", "Use sowohl … als auch, weder … noch, and related pairs."],
  ]),
  createModule("B1", 4, "Connected and appropriate German", "Write and speak with stronger cohesion, register, and accuracy.", [
    ["Nominalisation", "Turn verbs and adjectives into useful nouns."],
    ["Participles as adjectives", "Compress information inside noun phrases."],
    ["Reported speech", "Report statements with dass and common Konjunktiv I forms."],
    ["Object and pronoun order", "Place pronouns, nouns, and negation naturally."],
    ["Cohesion and reference", "Link paragraphs with pronouns and connective adverbs."],
    ["Commas and formal register", "Punctuate complex clauses and adjust style to context."],
  ]),
];

export const GRAMMAR_LEVELS: GrammarLevel[] = ["A1", "A2", "B1"];

export const LIVE_GRAMMAR_LESSONS: Record<string, GrammarLessonContent> = {
  "a1-1-1": {
    id: "a1-1-1",
    lead: "Personal pronouns replace names. The verb sein (to be) is irregular, so its forms must be learned as a complete pattern.",
    pattern: "ich bin · du bist · er/sie/es ist · wir sind · ihr seid · sie/Sie sind",
    explanation: [
      "Use ich for yourself, du for one familiar person, and Sie for polite or formal address. Sie is always capitalized.",
      "er refers to masculine nouns, sie to feminine nouns, and es to neuter nouns. Grammatical gender—not biological gender—controls the pronoun used for things.",
      "German normally states the subject: Ich bin müde. Unlike some languages, the verb ending does not usually replace the pronoun.",
    ],
    examples: [
      { german: "Ich bin neu hier.", english: "I am new here.", note: "ich → bin" },
      { german: "Bist du müde?", english: "Are you tired?", note: "du → bist" },
      { german: "Frau Keller ist Lehrerin. Sie ist sehr freundlich.", english: "Ms Keller is a teacher. She is very friendly." },
      { german: "Sind Sie Herr Weber?", english: "Are you Mr Weber?", note: "formal Sie → sind" },
    ],
    mistakes: [
      { wrong: "Ich ist müde.", right: "Ich bin müde.", why: "The sein form for ich is bin." },
      { wrong: "sie sind nett. (formal)", right: "Sie sind nett.", why: "Formal Sie is capitalized." },
    ],
    memoryTip: "Learn sein as three sound groups: bin/bist/ist, sind/seid/sind. Say the full chain aloud until it feels rhythmic.",
    exercises: [
      { id: "a111-1", type: "choice", prompt: "Mara ___ Studentin.", options: ["bin", "bist", "ist", "seid"], answer: "ist", explanation: "Mara can be replaced by sie, so the correct form is ist." },
      { id: "a111-2", type: "fill", prompt: "Wir ___ aus Köln.", answer: "sind", explanation: "The sein form for wir is sind." },
      { id: "a111-3", type: "order", prompt: "Build a polite question.", tokens: ["Sie", "Frau", "Sind", "Neumann", "?"], answer: "Sind Sie Frau Neumann?", explanation: "In a yes/no question, the conjugated verb comes first: Sind Sie …?" },
      { id: "a111-4", type: "correction", prompt: "Correct the sentence: Ihr sind sehr pünktlich.", answer: "Ihr seid sehr pünktlich.", explanation: "The sein form for ihr is seid." },
      { id: "a111-5", type: "production", prompt: "Introduce yourself in two sentences with ich bin and say where you are from.", model: "Ich bin Samira. Ich bin aus Indien.", explanation: "Your details can be different; check that both sentences use ich bin." },
    ],
  },
  "a1-1-2": {
    id: "a1-1-2",
    lead: "Most German verbs follow a dependable present-tense pattern. Remove -en from the infinitive and add an ending that matches the subject.",
    pattern: "machen → ich mache · du machst · er/sie/es macht · wir machen · ihr macht · sie/Sie machen",
    explanation: [
      "The dictionary form usually ends in -en: lernen, wohnen, arbeiten. The part before -en is the stem.",
      "Use -e with ich, -st with du, -t with er/sie/es and ihr, and -en with wir, sie, and Sie.",
      "If a stem ends in -t or -d, add an extra e where pronunciation needs it: du arbeitest, er arbeitet, ihr arbeitet.",
    ],
    examples: [
      { german: "Ich lerne Deutsch.", english: "I learn German." },
      { german: "Wo wohnst du?", english: "Where do you live?" },
      { german: "Wir arbeiten heute zu Hause.", english: "We are working at home today." },
      { german: "Ihr wartet vor dem Kino.", english: "You are waiting in front of the cinema." },
    ],
    mistakes: [
      { wrong: "Du lernen Deutsch.", right: "Du lernst Deutsch.", why: "du needs the ending -st." },
      { wrong: "Er arbeitst heute.", right: "Er arbeitet heute.", why: "A stem ending in -t takes -et for er/sie/es." },
    ],
    memoryTip: "Think of the endings as a six-beat chant: -e, -st, -t, -en, -t, -en.",
    exercises: [
      { id: "a112-1", type: "choice", prompt: "Du ___ in Berlin.", options: ["wohne", "wohnst", "wohnt", "wohnen"], answer: "wohnst", explanation: "du takes the ending -st: wohnst." },
      { id: "a112-2", type: "fill", prompt: "Meine Freunde ___ heute Fußball. (spielen)", answer: "spielen", explanation: "Meine Freunde is plural and can be replaced by sie: spielen." },
      { id: "a112-3", type: "order", prompt: "Build a statement.", tokens: ["jeden", "Deutsch", "Wir", "Tag", "lernen", "."], answer: "Wir lernen jeden Tag Deutsch.", explanation: "The subject can come first and the conjugated verb stays in position two." },
      { id: "a112-4", type: "correction", prompt: "Correct the sentence: Er wohnst in Bonn.", answer: "Er wohnt in Bonn.", explanation: "er takes the ending -t, not -st." },
      { id: "a112-5", type: "production", prompt: "Write three short sentences about activities you do every week.", model: "Ich lerne Deutsch. Ich spiele Tennis. Ich koche am Sonntag.", explanation: "Use the ich ending -e in each sentence." },
    ],
  },
  "a1-1-3": {
    id: "a1-1-3",
    lead: "Some frequent verbs change their stem vowel with du and er/sie/es. Their endings remain regular.",
    pattern: "fahren → du fährst · er fährt | lesen → du liest · sie liest | sprechen → du sprichst · er spricht",
    explanation: [
      "The common changes are a → ä and e → i/ie. They occur only with du and er/sie/es in the present tense.",
      "The plural forms return to the normal stem: wir fahren, ihr fahrt, sie fahren.",
      "Learn a changing verb with its third-person form: fahren – er fährt; lesen – er liest. This makes the change easier to retrieve.",
    ],
    examples: [
      { german: "Du fährst mit dem Bus.", english: "You travel by bus." },
      { german: "Lea liest jeden Abend.", english: "Lea reads every evening." },
      { german: "Wir sprechen im Kurs Deutsch.", english: "We speak German in the course.", note: "No vowel change with wir" },
      { german: "Was isst du zum Frühstück?", english: "What do you eat for breakfast?" },
    ],
    mistakes: [
      { wrong: "Er fahrt nach Hause.", right: "Er fährt nach Hause.", why: "fahren changes a to ä with er." },
      { wrong: "Wir ließen die Zeitung.", right: "Wir lesen die Zeitung.", why: "The stem change does not occur with wir." },
    ],
    memoryTip: "Mark du and er/sie/es as the two 'change zones'. Outside those zones, use the ordinary stem.",
    exercises: [
      { id: "a113-1", type: "choice", prompt: "Jonas ___ gern Krimis. (lesen)", options: ["lese", "lest", "liest", "lesen"], answer: "liest", explanation: "lesen changes e to ie with er: Jonas liest." },
      { id: "a113-2", type: "fill", prompt: "Du ___ sehr gut Deutsch. (sprechen)", answer: "sprichst", explanation: "sprechen changes e to i with du, then takes -st." },
      { id: "a113-3", type: "order", prompt: "Build a question.", tokens: ["du", "Was", "gern", "isst", "?"], answer: "Was isst du gern?", explanation: "The W-word comes first, the conjugated verb second, then the subject." },
      { id: "a113-4", type: "correction", prompt: "Correct the sentence: Wir fährt am Montag nach Hamburg.", answer: "Wir fahren am Montag nach Hamburg.", explanation: "wir uses the unchanged plural form fahren." },
      { id: "a113-5", type: "production", prompt: "Write one sentence each with fahren, lesen, and sprechen. Use du or er/sie at least once.", model: "Ich fahre mit dem Zug. Meine Schwester liest viel. Sprichst du Englisch?", explanation: "Check whether the stem changes only with du or er/sie/es." },
    ],
  },
  "a1-1-4": {
    id: "a1-1-4",
    lead: "The conjugated verb is the anchor of a German main clause. It occupies position two—even when another element starts the sentence.",
    pattern: "Position 1 + VERB + subject + rest: Heute lerne ich Deutsch.",
    explanation: [
      "A position can contain one word or a whole phrase. Am Montag is one time phrase and therefore fills position one.",
      "When the subject starts the sentence, the order is subject–verb: Ich arbeite heute. When time or place starts, the subject moves after the verb: Heute arbeite ich.",
      "Position two means the second sentence element, not necessarily the second written word.",
    ],
    examples: [
      { german: "Ich kaufe heute Brot.", english: "I am buying bread today." },
      { german: "Heute kaufe ich Brot.", english: "Today I am buying bread.", note: "The verb remains second" },
      { german: "Nach der Arbeit besucht Maria ihre Freundin.", english: "After work Maria visits her friend." },
      { german: "In Berlin wohnt mein Bruder.", english: "My brother lives in Berlin." },
    ],
    mistakes: [
      { wrong: "Heute ich lerne Deutsch.", right: "Heute lerne ich Deutsch.", why: "The conjugated verb must be the second element." },
      { wrong: "Am Wochenende meine Freunde kommen.", right: "Am Wochenende kommen meine Freunde.", why: "The opening phrase occupies position one, so the verb follows it." },
    ],
    memoryTip: "Imagine the conjugated verb sitting in a reserved chair marked 2. Whatever moves to chair 1, the verb keeps its seat.",
    exercises: [
      { id: "a114-1", type: "choice", prompt: "Choose the correct sentence.", options: ["Heute ich arbeite zu Hause.", "Heute arbeite ich zu Hause.", "Heute zu Hause ich arbeite."], answer: "Heute arbeite ich zu Hause.", explanation: "Heute fills position one, so arbeite must come next." },
      { id: "a114-2", type: "fill", prompt: "Am Dienstag ___ wir unsere Großeltern. (besuchen)", answer: "besuchen", explanation: "Am Dienstag is position one; the conjugated verb besuchen is position two." },
      { id: "a114-3", type: "order", prompt: "Start with the place.", tokens: ["meine", "Im", "arbeitet", "Stadtzentrum", "Mutter", "."], answer: "Im Stadtzentrum arbeitet meine Mutter.", explanation: "The place phrase comes first, then the verb, then the subject." },
      { id: "a114-4", type: "correction", prompt: "Correct the sentence: Morgen wir fahren ans Meer.", answer: "Morgen fahren wir ans Meer.", explanation: "fahren must occupy position two after Morgen." },
      { id: "a114-5", type: "production", prompt: "Write two sentences about the same action. Begin the first with ich and the second with heute.", model: "Ich lerne heute in der Bibliothek. Heute lerne ich in der Bibliothek.", explanation: "Compare the two versions: the conjugated verb is second in both." },
    ],
  },
  "a1-1-5": {
    id: "a1-1-5",
    lead: "German uses two basic question patterns: verb-first questions for yes/no answers and W-word questions for specific information.",
    pattern: "Kommst du heute? | Wann kommst du?",
    explanation: [
      "In a yes/no question, put the conjugated verb first and the subject second: Arbeitest du heute?",
      "In a W-question, the question word is first, the verb second, and the subject usually third: Wo wohnst du?",
      "Useful question words include wer, was, wo, wohin, woher, wann, wie, warum, and wie viel. Wer can itself be the subject: Wer kommt?",
    ],
    examples: [
      { german: "Hast du Zeit?", english: "Do you have time?" },
      { german: "Woher kommen Sie?", english: "Where do you come from?" },
      { german: "Warum lernst du Deutsch?", english: "Why are you learning German?" },
      { german: "Wer arbeitet heute?", english: "Who is working today?", note: "Wer is the subject" },
    ],
    mistakes: [
      { wrong: "Wo du wohnst?", right: "Wo wohnst du?", why: "In a direct W-question, the verb is second." },
      { wrong: "Du hast Zeit?", right: "Hast du Zeit?", why: "Neutral yes/no questions begin with the verb." },
    ],
    memoryTip: "Yes/no: VERB–person. W-question: W–VERB–person. Keep those two small frames ready.",
    exercises: [
      { id: "a115-1", type: "choice", prompt: "___ kostet das Ticket?", options: ["Wer", "Wie viel", "Woher", "Wohin"], answer: "Wie viel", explanation: "Wie viel asks about a price or quantity." },
      { id: "a115-2", type: "fill", prompt: "___ du heute Abend Zeit? (haben)", answer: "Hast", explanation: "A yes/no question begins with the conjugated verb: Hast du …?" },
      { id: "a115-3", type: "order", prompt: "Ask about the reason.", tokens: ["du", "Warum", "Deutsch", "lernst", "?"], answer: "Warum lernst du Deutsch?", explanation: "Use W-word + verb + subject + rest." },
      { id: "a115-4", type: "correction", prompt: "Correct the question: Wann der Kurs beginnt?", answer: "Wann beginnt der Kurs?", explanation: "The verb begins must be in position two after Wann." },
      { id: "a115-5", type: "production", prompt: "Write one yes/no question and two different W-questions for a new classmate.", model: "Kommst du aus Berlin? Wo wohnst du? Was machst du gern?", explanation: "Check verb-first order in the first question and W–verb–subject order in the others." },
    ],
  },
  "a1-1-6": {
    id: "a1-1-6",
    lead: "Use kein to negate a noun with an indefinite or no article. Use nicht to negate verbs, adjectives, specific nouns, or another part of the sentence.",
    pattern: "kein + noun | nicht + verb/adjective/specific element",
    explanation: [
      "kein behaves like ein and changes for gender and case: kein Kaffee, keine Milch, keinen Termin.",
      "nicht often stands near the end when it negates the whole action: Ich arbeite heute nicht. Put it directly before an adjective or the specific element being contrasted: Das ist nicht teuer; nicht heute, sondern morgen.",
      "A noun with a definite article is normally negated with nicht: Das ist nicht der Bus nach Bonn.",
    ],
    examples: [
      { german: "Ich habe kein Auto.", english: "I do not have a car." },
      { german: "Mara trinkt keinen Kaffee.", english: "Mara does not drink coffee.", note: "masculine accusative → keinen" },
      { german: "Der Film ist nicht langweilig.", english: "The film is not boring." },
      { german: "Wir kommen heute nicht.", english: "We are not coming today." },
    ],
    mistakes: [
      { wrong: "Ich habe nicht Hund.", right: "Ich habe keinen Hund.", why: "An indefinite noun is negated with kein; Hund is masculine accusative." },
      { wrong: "Das ist kein mein Fahrrad.", right: "Das ist nicht mein Fahrrad.", why: "A noun with a possessive determiner is negated with nicht." },
    ],
    memoryTip: "No noun? Think nicht. An unnamed or zero-article noun? Test kein first.",
    exercises: [
      { id: "a116-1", type: "choice", prompt: "Wir haben ___ Zeit.", options: ["nicht", "kein", "keine", "keinen"], answer: "keine", explanation: "Zeit is feminine and has no article here, so use keine." },
      { id: "a116-2", type: "fill", prompt: "Das Essen ist ___ teuer.", answer: "nicht", explanation: "An adjective such as teuer is negated with nicht." },
      { id: "a116-3", type: "order", prompt: "Build the negative sentence.", tokens: ["heute", "arbeitet", "nicht", "Er", "."], answer: "Er arbeitet heute nicht.", explanation: "Here nicht negates the whole action and stands near the end." },
      { id: "a116-4", type: "correction", prompt: "Correct the sentence: Sie kauft nicht Brot.", answer: ["Sie kauft kein Brot.", "Sie kauft kein Brot"], explanation: "Brot is a neuter noun without an article, so kein is required." },
      { id: "a116-5", type: "production", prompt: "Write three true negative sentences: one with kein, one with keine, and one with nicht.", model: "Ich habe kein Auto. Ich trinke keine Cola. Ich arbeite heute nicht.", explanation: "Check that kein/keine directly introduces a noun and nicht negates another idea." },
    ],
  },
};

export const ALL_GRAMMAR_LESSONS = GRAMMAR_MODULES.flatMap((item) => item.lessons);

export function getGrammarModuleForLesson(lessonId: string) {
  return GRAMMAR_MODULES.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
}
