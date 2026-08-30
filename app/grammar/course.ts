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
    released: level === "A1" && number <= 2,
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
  "a1-2-1": {
    id: "a1-2-1",
    lead: "Every German noun has a grammatical gender. The definite article—der, die, or das—shows that gender and means the in English.",
    pattern: "masculine: der · feminine: die · neuter: das · plural: die",
    explanation: [
      "German nouns begin with a capital letter. Learn a noun as one unit with its article: not Tisch, but der Tisch; not Wohnung, but die Wohnung.",
      "Gender is not always logical, so the article belongs in your memory of the word. Some endings help: nouns ending in -ung, -heit, -keit, -schaft, and -ion are usually feminine; -chen and -lein are neuter.",
      "The article changes later when a noun has a different job in the sentence. The dictionary form shown here is the nominative, which is the starting point for the case system.",
    ],
    examples: [
      { german: "der Tisch", english: "the table", note: "masculine" },
      { german: "die Wohnung", english: "the apartment", note: "-ung → usually feminine" },
      { german: "das Mädchen", english: "the girl", note: "-chen → neuter" },
      { german: "die Bücher", english: "the books", note: "all plurals use die in the nominative" },
    ],
    mistakes: [
      { wrong: "Tisch ist neu.", right: "Der Tisch ist neu.", why: "A specific singular noun normally needs its article." },
      { wrong: "die Mädchen", right: "das Mädchen", why: "Grammatical gender follows the word form; -chen nouns are neuter." },
    ],
    memoryTip: "Store each new noun as a three-part card: article + noun + plural—der Tisch, die Tische. Color can help, but saying the complete chunk is what builds recall.",
    exercises: [
      { id: "a121-1", type: "choice", prompt: "Choose the article: ___ Zeitung", options: ["der", "die", "das"], answer: "die", explanation: "Zeitung ends in -ung, a strongly feminine ending: die Zeitung." },
      { id: "a121-2", type: "fill", prompt: "___ Brötchen ist frisch.", answer: "Das", explanation: "The diminutive ending -chen is always neuter: das Brötchen." },
      { id: "a121-3", type: "order", prompt: "Build the sentence.", tokens: ["ist", "neu", "Der", "Computer", "."], answer: "Der Computer ist neu.", explanation: "Computer is masculine, so its nominative definite article is der." },
      { id: "a121-4", type: "correction", prompt: "Correct the sentence: Der Lampe ist alt.", answer: "Die Lampe ist alt.", explanation: "Lampe is feminine: die Lampe." },
      { id: "a121-5", type: "production", prompt: "Choose five objects near you and write each noun with its definite article.", model: "der Tisch · die Tür · das Fenster · der Stuhl · die Lampe", explanation: "Check every noun in a dictionary, then practise the article and noun as one spoken unit." },
    ],
  },
  "a1-2-2": {
    id: "a1-2-2",
    lead: "Use an indefinite article when you mention one person or thing without identifying a specific one. English uses a or an; German uses ein or eine.",
    pattern: "der → ein · die → eine · das → ein | no indefinite plural article",
    explanation: [
      "In the nominative, masculine and neuter nouns use ein; feminine nouns use eine: ein Mann, eine Frau, ein Kind.",
      "German has no plural of ein. Use the plural noun without an article when the meaning is general or indefinite: Dort sind Kinder.",
      "After the first mention, switch naturally from an indefinite article to a definite one: Dort ist ein Hund. Der Hund heißt Max.",
    ],
    examples: [
      { german: "Das ist ein Bahnhof.", english: "That is a train station." },
      { german: "Hier arbeitet eine Ärztin.", english: "A doctor works here." },
      { german: "Ein Kind spielt im Garten.", english: "A child is playing in the garden." },
      { german: "Dort stehen Fahrräder.", english: "There are bicycles over there.", note: "no plural form of ein" },
    ],
    mistakes: [
      { wrong: "Das ist eine Hotel.", right: "Das ist ein Hotel.", why: "Hotel is neuter, so use ein." },
      { wrong: "Hier sind eine Bücher.", right: "Hier sind Bücher.", why: "There is no indefinite article in the plural." },
    ],
    memoryTip: "Only feminine stands out in the nominative: eine. Masculine and neuter share ein; plural leaves the article space empty.",
    exercises: [
      { id: "a122-1", type: "choice", prompt: "Das ist ___ Küche.", options: ["ein", "eine", "einen", "—"], answer: "eine", explanation: "Küche is feminine, so the nominative form is eine Küche." },
      { id: "a122-2", type: "choice", prompt: "Im Park spielen ___ Kinder.", options: ["ein", "eine", "die", "no article"], answer: "no article", explanation: "German has no indefinite plural article. The sentence is Im Park spielen Kinder." },
      { id: "a122-3", type: "order", prompt: "Introduce a new object.", tokens: ["Das", "Regenschirm", "ein", "ist", "."], answer: "Das ist ein Regenschirm.", explanation: "Regenschirm is masculine, and after sein it appears here with nominative ein." },
      { id: "a122-4", type: "correction", prompt: "Correct the sentence: Ein Verkäuferin hilft mir.", answer: "Eine Verkäuferin hilft mir.", explanation: "Verkäuferin is feminine, so use eine." },
      { id: "a122-5", type: "production", prompt: "Describe three new things in a room with Das ist … or Dort ist … . Use ein and eine.", model: "Das ist ein Schrank. Dort ist eine Pflanze. Das ist ein Bild.", explanation: "Use the noun's gender to choose ein or eine." },
    ],
  },
  "a1-2-3": {
    id: "a1-2-3",
    lead: "German forms plurals in several ways. There is no single ending that works for every noun, so the plural must be learned together with the singular.",
    pattern: "-e · -(e)n · -er · -s · no ending | sometimes add an umlaut",
    explanation: [
      "Common patterns include der Tag → die Tage, die Frau → die Frauen, das Kind → die Kinder, das Auto → die Autos, and der Lehrer → die Lehrer.",
      "Some vowels change to an umlaut in the plural: der Apfel → die Äpfel, die Mutter → die Mütter, das Buch → die Bücher. The umlaut can appear with or without another ending.",
      "All nominative and accusative plurals use the definite article die. The verb is plural too: Das Buch ist neu; die Bücher sind neu.",
    ],
    examples: [
      { german: "der Stuhl → die Stühle", english: "the chair → the chairs", note: "umlaut + -e" },
      { german: "die Wohnung → die Wohnungen", english: "the apartment → the apartments", note: "-(e)n" },
      { german: "das Bild → die Bilder", english: "the picture → the pictures", note: "-er" },
      { german: "das Café → die Cafés", english: "the café → the cafés", note: "-s" },
    ],
    mistakes: [
      { wrong: "zwei Buchs", right: "zwei Bücher", why: "Buch has the irregular plural Bücher." },
      { wrong: "Die Kinder ist draußen.", right: "Die Kinder sind draußen.", why: "A plural subject needs a plural verb." },
    ],
    memoryTip: "Never record a bare noun. Write der Apfel, die Äpfel—even when the plural looks easy. Retrieval needs both forms as one pair.",
    exercises: [
      { id: "a123-1", type: "choice", prompt: "Choose the plural of die Freundin.", options: ["die Freundin", "die Freundins", "die Freundinnen", "die Freunde"], answer: "die Freundinnen", explanation: "Feminine person nouns ending in -in normally form the plural with -innen." },
      { id: "a123-2", type: "fill", prompt: "ein Buch, drei ___", answer: "Bücher", explanation: "The plural of das Buch is die Bücher." },
      { id: "a123-3", type: "order", prompt: "Build a plural sentence.", tokens: ["sind", "Die", "teuer", "Hotels", "."], answer: "Die Hotels sind teuer.", explanation: "Hotel forms its plural with -s, and the plural verb is sind." },
      { id: "a123-4", type: "correction", prompt: "Correct the sentence: Zwei Frau warten draußen.", answer: "Zwei Frauen warten draußen.", explanation: "The plural of Frau is Frauen." },
      { id: "a123-5", type: "production", prompt: "Write five singular–plural pairs from one category such as food, home, or school.", model: "der Apfel – die Äpfel · die Banane – die Bananen · das Brot – die Brote · das Ei – die Eier · der Saft – die Säfte", explanation: "Include both articles so your list trains gender and plural together." },
    ],
  },
  "a1-2-4": {
    id: "a1-2-4",
    lead: "The nominative marks the subject: the person or thing that performs the action or is being described. Finding the subject is the first step in understanding German cases.",
    pattern: "Who or what does it? → der/ein · die/eine · das/ein · die/—",
    explanation: [
      "Ask Wer? for a person or Was? for a thing. In Der Mann öffnet die Tür, der Mann answers Wer öffnet? and is therefore nominative.",
      "The subject controls the verb: Das Kind spielt; die Kinder spielen. A subject can come after the verb without losing the nominative: Heute arbeitet der Mann.",
      "After sein, werden, and bleiben, German normally uses a nominative description rather than a direct object: Das ist mein Bruder. Lena wird Ärztin.",
    ],
    examples: [
      { german: "Die Nachbarin kocht.", english: "The neighbour is cooking.", note: "Who cooks? die Nachbarin" },
      { german: "Heute kommt der Bus spät.", english: "Today the bus is late.", note: "position does not decide the case" },
      { german: "Das sind meine Eltern.", english: "Those are my parents." },
      { german: "Ein Problem bleibt.", english: "A problem remains." },
    ],
    mistakes: [
      { wrong: "Heute arbeitet den Mann.", right: "Heute arbeitet der Mann.", why: "The man performs the action, so he is the nominative subject." },
      { wrong: "Das ist meinen Bruder.", right: "Das ist mein Bruder.", why: "After sein, the identifying noun remains nominative." },
    ],
    memoryTip: "Do not ask which noun comes first. Ask who or what controls the verb. That answer is the nominative subject.",
    exercises: [
      { id: "a124-1", type: "choice", prompt: "Which phrase is the subject? Heute repariert der Mechaniker das Auto.", options: ["Heute", "der Mechaniker", "das Auto", "repariert"], answer: "der Mechaniker", explanation: "Who repairs? Der Mechaniker. It controls the singular verb repariert." },
      { id: "a124-2", type: "fill", prompt: "___ Hund schläft im Flur. (the)", answer: "Der", explanation: "Hund is the masculine subject, so its nominative article is der." },
      { id: "a124-3", type: "order", prompt: "Build a sentence with the subject after the verb.", tokens: ["meine", "Heute", "kommt", "Schwester", "."], answer: "Heute kommt meine Schwester.", explanation: "Meine Schwester remains the nominative subject even after the verb." },
      { id: "a124-4", type: "correction", prompt: "Correct the sentence: Das ist einen Lehrer.", answer: "Das ist ein Lehrer.", explanation: "After ist, the identifying noun is nominative: ein Lehrer." },
      { id: "a124-5", type: "production", prompt: "Write three sentences with different subjects. Start one sentence with a time expression.", model: "Der Kurs beginnt. Meine Freunde lernen Deutsch. Am Montag arbeitet meine Mutter.", explanation: "Identify who or what controls each verb, regardless of position." },
    ],
  },
  "a1-2-5": {
    id: "a1-2-5",
    lead: "The accusative usually marks the direct object: the person or thing directly affected by the action. At A1, the visible change is mainly masculine.",
    pattern: "der → den · ein → einen | die/eine, das/ein, plural die stay unchanged",
    explanation: [
      "First find the subject with Wer oder was tut etwas? Then ask Wen? for a person or Was? for a thing directly receiving the action.",
      "Only masculine articles show a new accusative form at this stage: Ich sehe den Mann; ich brauche einen Termin. Feminine, neuter, and plural articles look the same as in the nominative.",
      "Frequent verbs that take a direct object include haben, brauchen, kaufen, sehen, besuchen, lesen, essen, trinken, and suchen.",
    ],
    examples: [
      { german: "Die Frau kauft den Mantel.", english: "The woman buys the coat.", note: "Mantel is masculine accusative" },
      { german: "Ich brauche einen Termin.", english: "I need an appointment." },
      { german: "Er liest die Zeitung.", english: "He reads the newspaper." },
      { german: "Wir suchen das Hotel.", english: "We are looking for the hotel." },
    ],
    mistakes: [
      { wrong: "Ich sehe der Mann.", right: "Ich sehe den Mann.", why: "The man is the direct object, so masculine der changes to den." },
      { wrong: "Sie braucht ein Termin.", right: "Sie braucht einen Termin.", why: "Masculine ein changes to einen in the accusative." },
    ],
    memoryTip: "Think 'masculine takes an extra n': den, einen, keinen, meinen. The other article forms stay visually calm at A1.",
    exercises: [
      { id: "a125-1", type: "choice", prompt: "Mila besucht ___ Onkel.", options: ["der", "den", "dem", "die"], answer: "den", explanation: "Onkel is masculine and receives the action besuchen, so use accusative den." },
      { id: "a125-2", type: "fill", prompt: "Wir kaufen ___ neuen Computer. (a)", answer: "einen", explanation: "Computer is a masculine direct object: einen Computer." },
      { id: "a125-3", type: "order", prompt: "Build the sentence.", tokens: ["einen", "Sie", "Kaffee", "bestellt", "."], answer: "Sie bestellt einen Kaffee.", explanation: "Sie is the subject; einen Kaffee is the masculine accusative object." },
      { id: "a125-4", type: "correction", prompt: "Correct the sentence: Der Schüler liest der Text.", answer: "Der Schüler liest den Text.", explanation: "Text is the masculine direct object of liest, so der becomes den." },
      { id: "a125-5", type: "production", prompt: "Write four things you have, need, buy, or see. Include two masculine nouns.", model: "Ich habe einen Bruder. Ich brauche einen Stift. Ich kaufe eine Zeitung. Ich sehe das Rathaus.", explanation: "Check masculine objects for -n in einen or den." },
    ],
  },
  "a1-2-6": {
    id: "a1-2-6",
    lead: "Possessive determiners show who something belongs to. They stand before a noun and take endings like the indefinite article ein.",
    pattern: "ich → mein · du → dein · er/es → sein · sie → ihr · wir → unser · ihr → euer · sie/Sie → ihr/Ihr",
    explanation: [
      "Choose the stem from the owner, then choose the ending from the noun. Mein Bruder and meine Schwester both belong to me; the noun gender decides whether -e appears.",
      "In the nominative, masculine and neuter have no ending: mein Vater, mein Kind. Feminine and plural take -e: meine Mutter, meine Freunde.",
      "In the accusative, masculine adds -en: meinen Vater. Feminine, neuter, and plural keep the familiar forms: meine Mutter, mein Kind, meine Freunde. Formal Ihr is capitalized.",
    ],
    examples: [
      { german: "Das ist meine Schwester.", english: "That is my sister." },
      { german: "Paul sucht seinen Schlüssel.", english: "Paul is looking for his key.", note: "sein + masculine accusative -en" },
      { german: "Wir besuchen unsere Freunde.", english: "We visit our friends." },
      { german: "Ist das Ihr Pass, Frau Roth?", english: "Is that your passport, Ms Roth?", note: "formal Ihr is capitalized" },
    ],
    mistakes: [
      { wrong: "Anna besucht sein Bruder.", right: "Anna besucht ihren Bruder.", why: "The owner is Anna (sie), so choose ihr; Bruder is masculine accusative, so add -en." },
      { wrong: "Ich sehe mein Mutter.", right: "Ich sehe meine Mutter.", why: "Mutter is feminine, so mein takes -e." },
    ],
    memoryTip: "Solve possession in two moves: owner chooses the stem; noun chooses the ending. Never try to decide both at once.",
    exercises: [
      { id: "a126-1", type: "choice", prompt: "Tom liebt ___ Familie.", options: ["seine", "ihre", "seinen", "deine"], answer: "seine", explanation: "Tom is er, so the stem is sein-. Familie is feminine, so add -e." },
      { id: "a126-2", type: "fill", prompt: "Ich suche ___ Schlüssel. (my)", answer: "meinen", explanation: "Schlüssel is a masculine accusative object, so mein becomes meinen." },
      { id: "a126-3", type: "order", prompt: "Build the formal question.", tokens: ["das", "Ist", "Ihre", "Tasche", "?"], answer: "Ist das Ihre Tasche?", explanation: "Formal Ihre is capitalized and takes -e before the feminine noun Tasche." },
      { id: "a126-4", type: "correction", prompt: "Correct the sentence: Maria besucht sein Eltern.", answer: "Maria besucht ihre Eltern.", explanation: "Maria is sie, so use ihr-; the plural noun Eltern takes -e." },
      { id: "a126-5", type: "production", prompt: "Describe four people or belongings in your life using four different possessive forms.", model: "Das ist mein Bruder. Seine Frau heißt Mia. Ihre Kinder sind klein. Unser Haus ist in Köln.", explanation: "For each phrase, identify the owner first and the noun's gender, number, and case second." },
    ],
  },
};

export const ALL_GRAMMAR_LESSONS = GRAMMAR_MODULES.flatMap((item) => item.lessons);

export function getGrammarModuleForLesson(lessonId: string) {
  return GRAMMAR_MODULES.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
}
