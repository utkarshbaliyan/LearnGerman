import { A1_LESSON_ONE_EXERCISES } from "@/app/grammar/a1-lesson-one-exercises";
import { A1_LESSON_TWO_EXERCISES } from "@/app/grammar/a1-lesson-two-exercises";
import { A1_LESSON_THREE_EXERCISES } from "@/app/grammar/a1-lesson-three-exercises";
import { A1_LESSON_FOUR_EXERCISES } from "@/app/grammar/a1-lesson-four-exercises";
import { A1_LESSON_FIVE_EXERCISES } from "@/app/grammar/a1-lesson-five-exercises";
import { A1_LESSON_SIX_EXERCISES } from "@/app/grammar/a1-lesson-six-exercises";
import { A1_LESSON_SEVEN_EXERCISES } from "@/app/grammar/a1-lesson-seven-exercises";
import { A1_LESSON_EIGHT_EXERCISES } from "@/app/grammar/a1-lesson-eight-exercises";

export type GrammarLevel = "A1" | "A2" | "B1";

type ExerciseMeta = { id: string; group?: string; explanation: string };

export type GrammarExercise =
  | (ExerciseMeta & { type: "choice"; prompt: string; options: string[]; answer: string })
  | (ExerciseMeta & { type: "fill"; prompt: string; answer: string | string[] })
  | (ExerciseMeta & { type: "order"; prompt: string; tokens: string[]; answer: string })
  | (ExerciseMeta & { type: "correction"; prompt: string; answer: string | string[] })
  | (ExerciseMeta & { type: "translation"; prompt: string; direction: "en-de" | "de-en"; answer: string | string[] })
  | (ExerciseMeta & { type: "production"; prompt: string; model: string });

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
  sections?: { title: string; paragraphs: string[]; examples?: { german: string; english: string }[] }[];
  tables?: { title: string; caption?: string; headers: string[]; rows: string[][] }[];
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
    lead: "Personal pronouns let you refer to people and things without repeating their names. The verb sein—German for to be—is the most important irregular verb in the language and appears in introductions, descriptions, locations, professions, identities, and hundreds of everyday expressions.",
    pattern: "ich bin · du bist · er/sie/es ist · wir sind · ihr seid · sie/Sie sind",
    explanation: [
      "A subject pronoun tells us who or what the sentence is about. German normally states the subject explicitly: Ich bin müde. The form of the verb must agree with that subject.",
      "Use ich for the speaker. Use du for one familiar person and ihr for two or more familiar people. Use formal Sie for one or several people when politeness, distance, or a professional situation requires it. Formal Sie is always capitalized.",
      "The third-person pronouns er, sie, and es can refer to people, but they also replace nouns according to grammatical gender: der Tisch → er, die Lampe → sie, das Buch → es. This does not mean the object has a biological sex.",
      "Lowercase sie can mean she or they. The verb resolves the meaning: sie ist means she is, while sie sind means they are. Capitalized Sie means formal you and also takes sind.",
      "sein is irregular: its forms do not come from one predictable stem. Learn the whole conjugation as a spoken sequence, then practise the forms inside complete sentences.",
      "In a statement, the conjugated verb is normally the second sentence element: Ich bin heute müde. In a yes/no question, it moves to the front: Bist du müde? In a W-question, it follows the question word: Wo bist du?",
    ],
    tables: [
      {
        title: "Personal pronouns at a glance",
        caption: "The English word you has three common German equivalents. Choose by number, familiarity, and formality.",
        headers: ["Person", "German", "English", "Typical use"],
        rows: [
          ["1st singular", "ich", "I", "the speaker"],
          ["2nd singular informal", "du", "you", "one friend, child, family member"],
          ["3rd singular masculine", "er", "he / it", "male person or masculine noun"],
          ["3rd singular feminine", "sie", "she / it", "female person or feminine noun"],
          ["3rd singular neuter", "es", "it", "neuter noun, child, situation"],
          ["1st plural", "wir", "we", "speaker plus another person"],
          ["2nd plural informal", "ihr", "you", "two or more familiar people"],
          ["3rd plural", "sie", "they", "people or things already mentioned"],
          ["formal singular/plural", "Sie", "you", "polite or professional address"],
        ],
      },
      {
        title: "Complete present-tense conjugation of sein",
        caption: "Notice the singular group bin–bist–ist and the plural group sind–seid–sind.",
        headers: ["Subject", "sein", "English", "Example"],
        rows: [
          ["ich", "bin", "I am", "Ich bin bereit."],
          ["du", "bist", "you are", "Du bist pünktlich."],
          ["er / sie / es", "ist", "he / she / it is", "Sie ist Ärztin."],
          ["wir", "sind", "we are", "Wir sind hier."],
          ["ihr", "seid", "you are", "Ihr seid nett."],
          ["sie / Sie", "sind", "they / you are", "Sind Sie neu hier?"],
        ],
      },
      {
        title: "How sentence type changes the position of sein",
        headers: ["Sentence type", "Structure", "German", "English"],
        rows: [
          ["Statement", "subject + sein + rest", "Du bist müde.", "You are tired."],
          ["Yes/no question", "sein + subject + rest", "Bist du müde?", "Are you tired?"],
          ["W-question", "W-word + sein + subject", "Warum bist du müde?", "Why are you tired?"],
        ],
      },
    ],
    sections: [
      {
        title: "Choosing between du, ihr, and Sie",
        paragraphs: [
          "Use du with one person you address informally. Use ihr when you address several people informally. Use Sie in formal or polite situations, regardless of whether you address one person or a group.",
          "German speakers may explicitly offer the informal form with Wollen wir uns duzen? Until that happens, Sie is the safer choice in many professional or service situations.",
        ],
        examples: [
          { german: "Mia, bist du fertig?", english: "Mia, are you ready?" },
          { german: "Kinder, seid ihr fertig?", english: "Children, are you ready?" },
          { german: "Frau Klein, sind Sie fertig?", english: "Ms Klein, are you ready?" },
        ],
      },
      {
        title: "Why sie can mean three different things",
        paragraphs: [
          "Lowercase sie means she with ist and they with sind. Capitalized Sie means formal you and also uses sind. At the beginning of a sentence, capitalization alone cannot distinguish they from formal you, so context does the work.",
          "Read the subject and verb together as one unit: sie ist, sie sind, Sie sind. This prevents translation word by word.",
        ],
        examples: [
          { german: "Nora ist neu. Sie ist aus Bonn.", english: "Nora is new. She is from Bonn." },
          { german: "Nora und Tim sind neu. Sie sind aus Bonn.", english: "Nora and Tim are new. They are from Bonn." },
          { german: "Sind Sie Frau Brandt?", english: "Are you Ms Brandt?" },
        ],
      },
      {
        title: "Using sein for identity, description, origin, and location",
        paragraphs: [
          "sein links the subject to information about identity or description. It does not express an action. German often omits the article before a profession after sein: Er ist Lehrer; Sie ist Ärztin.",
          "For origin, use sein + aus. For location, use sein with a place expression. These chunks are immediately useful in introductions and everyday conversations.",
        ],
        examples: [
          { german: "Ich bin Studentin.", english: "I am a student." },
          { german: "Wir sind aus Indien.", english: "We are from India." },
          { german: "Das Handy ist in der Tasche.", english: "The phone is in the bag." },
          { german: "Ihr seid sehr freundlich.", english: "You are very friendly." },
        ],
      },
    ],
    examples: [
      { german: "Ich bin neu hier.", english: "I am new here.", note: "ich → bin" },
      { german: "Bist du müde?", english: "Are you tired?", note: "du → bist" },
      { german: "Frau Keller ist Lehrerin. Sie ist sehr freundlich.", english: "Ms Keller is a teacher. She is very friendly." },
      { german: "Sind Sie Herr Weber?", english: "Are you Mr Weber?", note: "formal Sie → sind" },
      { german: "Das Wetter ist schön. Es ist warm.", english: "The weather is nice. It is warm.", note: "das Wetter → es" },
      { german: "Wir sind heute in Berlin.", english: "We are in Berlin today.", note: "wir → sind" },
      { german: "Seid ihr schon fertig?", english: "Are you all finished already?", note: "informal plural" },
      { german: "Meine Freunde sind im Café. Sie sind müde.", english: "My friends are in the café. They are tired.", note: "plural sie → sind" },
    ],
    mistakes: [
      { wrong: "Ich ist müde.", right: "Ich bin müde.", why: "The sein form for ich is bin." },
      { wrong: "sie sind nett. (formal)", right: "Sie sind nett.", why: "Formal Sie is capitalized." },
      { wrong: "Wir seid bereit.", right: "Wir sind bereit.", why: "wir pairs with sind; seid belongs only to ihr." },
      { wrong: "Wo du bist?", right: "Wo bist du?", why: "In a direct W-question, the conjugated verb comes immediately after the W-word." },
    ],
    memoryTip: "Learn sein as three sound groups: bin/bist/ist, sind/seid/sind. Say the full chain aloud until it feels rhythmic.",
    exercises: A1_LESSON_ONE_EXERCISES,
  },
  "a1-1-2": {
    id: "a1-1-2",
    lead: "Most German verbs follow a stable present-tense pattern. Once you can identify the stem and choose the correct personal ending, you can describe routines, actions happening now, general facts, and even planned future events with hundreds of verbs.",
    pattern: "machen → ich mache · du machst · er/sie/es macht · wir machen · ihr macht · sie/Sie machen",
    explanation: [
      "The infinitive is the dictionary form of a verb. Most regular infinitives end in -en, for example lernen, wohnen, and machen. Remove -en to find the stem: lern-, wohn-, mach-. The stem carries the meaning; the ending identifies the subject.",
      "Add -e for ich, -st for du, -t for er/sie/es, -en for wir, -t for ihr, and -en for sie/Sie. The plural forms wir and sie/Sie therefore look exactly like the infinitive.",
      "A name or noun phrase uses the same form as its matching pronoun. Maria equals sie, das Kind equals es, and meine Freunde equals sie plural. This lets you conjugate without memorising a separate rule for every possible subject.",
      "When a stem ends in -d or -t, an extra e makes the ending pronounceable: arbeiten → du arbeitest, er arbeitet, ihr arbeitet; warten → du wartest, er wartet. The same pattern appears with several stems ending in consonant + n, such as rechnen → du rechnest.",
      "When a stem already ends in an s sound—s, ß, z, or x—the du form does not add another s. Use only -t: reisen → du reist, heißen → du heißt, tanzen → du tanzt.",
      "German has one present tense where English often uses several forms. Ich arbeite can mean I work or I am working. With a future time expression, Morgen arbeite ich can also mean I am working tomorrow. Context supplies the exact time meaning.",
    ],
    tables: [
      {
        title: "Regular present-tense endings",
        caption: "Build each form from the stem lern-. The same six endings work with most regular verbs.",
        headers: ["Subject", "Ending", "lernen", "English"],
        rows: [
          ["ich", "-e", "ich lerne", "I learn / I am learning"],
          ["du", "-st", "du lernst", "you learn / are learning"],
          ["er / sie / es", "-t", "er lernt", "he learns / is learning"],
          ["wir", "-en", "wir lernen", "we learn / are learning"],
          ["ihr", "-t", "ihr lernt", "you all learn / are learning"],
          ["sie / Sie", "-en", "sie lernen / Sie lernen", "they learn / you learn"],
        ],
      },
      {
        title: "Spelling adjustments that protect pronunciation",
        caption: "The endings stay systematic; only the spelling is adjusted so that the form is easy to say.",
        headers: ["Stem type", "Rule", "Infinitive", "Example"],
        rows: [
          ["ends in -d or -t", "insert e before -st or -t", "arbeiten", "du arbeitest · er arbeitet"],
          ["ends in an s sound", "du adds only -t", "tanzen", "du tanzt"],
          ["ends in -eln", "ich often drops the stem e", "sammeln", "ich sammle"],
          ["consonant + n", "often insert e", "rechnen", "du rechnest · er rechnet"],
        ],
      },
      {
        title: "What the German present tense can express",
        headers: ["Meaning", "German", "Natural English"],
        rows: [
          ["habit or routine", "Ich lerne jeden Abend.", "I study every evening."],
          ["action happening now", "Ich lerne gerade.", "I am studying right now."],
          ["general fact", "Der Kurs beginnt um neun.", "The course begins at nine."],
          ["planned future", "Morgen arbeite ich zu Hause.", "I am working at home tomorrow."],
        ],
      },
    ],
    sections: [
      {
        title: "A reliable three-step method",
        paragraphs: [
          "First find the infinitive and remove -en. Second identify the subject and match it to ich, du, er/sie/es, wir, ihr, or sie/Sie. Third attach the correct ending and check whether the stem needs a spelling adjustment.",
          "For Meine Schwester arbeitet, the infinitive is arbeiten, the stem is arbeit-, and meine Schwester equals sie. The normal third-person ending is -t, but a stem ending in -t needs an extra e: arbeit + e + t = arbeitet.",
        ],
        examples: [
          { german: "lernen → lern- → du lernst", english: "to learn → stem → you learn" },
          { german: "arbeiten → arbeit- → er arbeitet", english: "to work → stem → he works" },
          { german: "tanzen → tanz- → du tanzt", english: "to dance → stem → you dance" },
        ],
      },
      {
        title: "Matching real subjects to pronoun forms",
        paragraphs: [
          "Conjugation depends on grammatical person and number, not on how long the subject is. A single name, person, animal, or thing normally takes the er/sie/es form. Two or more people or things take the plural sie form.",
          "The phrase du und ich includes the speaker and therefore equals wir. A direct address with a title and capitalised Sie uses the formal -en form, even when only one person is being addressed.",
        ],
        examples: [
          { german: "Meine Mutter kocht heute.", english: "My mother is cooking today." },
          { german: "Lena und Amir wohnen in Bonn.", english: "Lena and Amir live in Bonn." },
          { german: "Du und ich lernen zusammen.", english: "You and I are studying together." },
          { german: "Herr Klein, arbeiten Sie hier?", english: "Mr Klein, do you work here?" },
        ],
      },
      {
        title: "Statements and direct questions",
        paragraphs: [
          "In a statement, the conjugated verb occupies position two: Ich lerne heute. A time or place phrase may take position one, but the verb remains second: Heute lerne ich; In Berlin arbeitet Sara.",
          "A yes/no question begins with the conjugated verb: Lernst du Deutsch? A W-question begins with the question word and places the verb second: Wo wohnst du? The subject follows the verb in both question patterns.",
        ],
        examples: [
          { german: "Wir arbeiten heute zu Hause.", english: "We are working at home today." },
          { german: "Morgen arbeitet meine Schwester zu Hause.", english: "Tomorrow my sister is working at home." },
          { german: "Spielt ihr Fußball?", english: "Do you all play football?" },
          { german: "Wo wohnen Sie?", english: "Where do you live?" },
        ],
      },
    ],
    examples: [
      { german: "Ich lerne jeden Tag Deutsch.", english: "I study German every day.", note: "ich → -e" },
      { german: "Wo wohnst du?", english: "Where do you live?", note: "du → -st" },
      { german: "Wir arbeiten heute zu Hause.", english: "We are working at home today.", note: "wir → -en" },
      { german: "Ihr wartet vor dem Kino.", english: "You are waiting in front of the cinema.", note: "wart- inserts e before -t" },
      { german: "Meine Mutter kocht am Sonntag.", english: "My mother cooks on Sunday.", note: "Meine Mutter → sie → -t" },
      { german: "Die Kinder spielen im Garten.", english: "The children are playing in the garden.", note: "plural subject → -en" },
      { german: "Morgen lernen wir in der Bibliothek.", english: "Tomorrow we are studying in the library.", note: "present tense with future time" },
      { german: "Arbeiten Sie in Berlin?", english: "Do you work in Berlin?", note: "formal Sie → -en" },
    ],
    mistakes: [
      { wrong: "Du lernen Deutsch.", right: "Du lernst Deutsch.", why: "du needs the ending -st." },
      { wrong: "Er arbeitst heute.", right: "Er arbeitet heute.", why: "A stem ending in -t takes -et for er/sie/es." },
      { wrong: "Sie arbeite in Köln. (they)", right: "Sie arbeiten in Köln.", why: "Plural sie uses the -en form." },
      { wrong: "Du tanzst sehr gut.", right: "Du tanzt sehr gut.", why: "After a stem ending in z, the du form adds only -t." },
      { wrong: "Wo du wohnst?", right: "Wo wohnst du?", why: "In a direct W-question, the conjugated verb follows the question word." },
    ],
    memoryTip: "Think of the endings as a six-beat chant: -e, -st, -t, -en, -t, -en.",
    exercises: A1_LESSON_TWO_EXERCISES,
  },
  "a1-1-3": {
    id: "a1-1-3",
    lead: "Many of the most useful German verbs change their stem vowel in the present tense. The change is limited and predictable: it normally appears only with du and er/sie/es, while the personal endings and the other forms remain familiar.",
    pattern: "fahren → du fährst · er fährt | lesen → du liest · sie liest | sprechen → du sprichst · er spricht",
    explanation: [
      "The most common changes are a → ä, e → i, and e → ie. A smaller group changes au → äu. These changes appear with du and er/sie/es: du fährst, er spricht, sie liest, das Kind läuft.",
      "The endings are still the regular endings. After changing the vowel, add -st for du and -t for er/sie/es: fahr- → fähr- + st = fährst; sprech- → sprich- + t = spricht.",
      "The change disappears with ich and all plural persons: ich fahre, wir fahren, ihr fahrt, sie/Sie fahren. This is why memorising only one changed form is enough to predict the other changed form.",
      "Names and noun phrases follow the same rule as pronouns. Paul and mein Bruder use the er-form; die Lehrerin uses the sie-form; das Kind uses the es-form. Plural noun phrases use the unchanged plural form.",
      "A few high-frequency verbs have additional spelling changes. nehmen becomes du nimmst and er nimmt; essen becomes du isst and er isst. Learn these complete forms aloud instead of trying to construct them letter by letter.",
      "Not every irregular German verb changes its vowel in this pattern, and the infinitive alone does not always predict the change. Learn new verbs as a pair: fahren – er fährt, helfen – er hilft, lesen – er liest.",
    ],
    tables: [
      {
        title: "The main stem-change families",
        caption: "The er/sie/es form is the most efficient dictionary companion because it clearly displays the change.",
        headers: ["Change", "Infinitive", "du", "er / sie / es"],
        rows: [
          ["a → ä", "fahren", "du fährst", "er fährt"],
          ["a → ä", "schlafen", "du schläfst", "sie schläft"],
          ["e → i", "sprechen", "du sprichst", "er spricht"],
          ["e → i", "nehmen", "du nimmst", "sie nimmt"],
          ["e → ie", "lesen", "du liest", "er liest"],
          ["e → ie", "sehen", "du siehst", "sie sieht"],
          ["au → äu", "laufen", "du läufst", "es läuft"],
        ],
      },
      {
        title: "Where the change appears—and where it does not",
        headers: ["Subject", "fahren", "sprechen", "lesen"],
        rows: [
          ["ich", "fahre", "spreche", "lese"],
          ["du", "fährst", "sprichst", "liest"],
          ["er / sie / es", "fährt", "spricht", "liest"],
          ["wir", "fahren", "sprechen", "lesen"],
          ["ihr", "fahrt", "sprecht", "lest"],
          ["sie / Sie", "fahren", "sprechen", "lesen"],
        ],
      },
      {
        title: "High-frequency verbs worth learning as pairs",
        headers: ["Infinitive + er-form", "Meaning", "Example", "English"],
        rows: [
          ["essen – er isst", "to eat", "Was isst du?", "What are you eating?"],
          ["geben – er gibt", "to give", "Sie gibt mir das Buch.", "She gives me the book."],
          ["helfen – er hilft", "to help", "Hilfst du mir?", "Are you helping me?"],
          ["treffen – er trifft", "to meet", "Er trifft seine Freunde.", "He meets his friends."],
          ["tragen – er trägt", "to wear / carry", "Sie trägt eine Jacke.", "She is wearing a jacket."],
        ],
      },
    ],
    sections: [
      {
        title: "The two change zones",
        paragraphs: [
          "Imagine the conjugation table with two highlighted cells: du and er/sie/es. Change the stem vowel only inside those cells. The other cells use the ordinary stem, including ihr even though it also has a -t ending.",
          "This prevents a common overgeneralisation such as wir fähren or ihr schläft. The correct forms are wir fahren and ihr schlaft because plural subjects remain outside the change zones.",
        ],
        examples: [
          { german: "du fährst · er fährt", english: "change zone: a becomes ä" },
          { german: "ich fahre · wir fahren · ihr fahrt", english: "ordinary stem outside the change zone" },
          { german: "du liest · sie liest", english: "change zone: e becomes ie" },
        ],
      },
      {
        title: "Choosing the form from a real subject",
        paragraphs: [
          "Replace the subject mentally with a pronoun before conjugating. Meine Schwester equals sie, so Meine Schwester liest. Paul und Sara equals sie plural, so Paul und Sara lesen. Herr Klein addressed directly equals formal Sie, so Lesen Sie gern?",
          "The question word wer normally takes a singular er/sie/es form when the person is unknown: Wer fährt heute? The answer may later name one person or several people.",
        ],
        examples: [
          { german: "Der Bus fährt um acht.", english: "The bus leaves at eight." },
          { german: "Meine Eltern fahren morgen.", english: "My parents are travelling tomorrow." },
          { german: "Wer hilft heute?", english: "Who is helping today?" },
          { german: "Lesen Sie gern?", english: "Do you like reading?" },
        ],
      },
      {
        title: "Learning irregular verbs efficiently",
        paragraphs: [
          "Store each new verb with its meaning, er-form, and one short phrase: nehmen – er nimmt – den Bus nehmen. This compact bundle gives you the changed vowel, pronunciation, and a natural object at the same time.",
          "Contrast the changed singular with an unchanged plural aloud: Er spricht, aber wir sprechen. Sie liest, aber ihre Freunde lesen. Alternating the forms makes the boundary of the rule memorable.",
        ],
        examples: [
          { german: "nehmen – er nimmt – den Bus nehmen", english: "to take – he takes – to take the bus" },
          { german: "helfen – sie hilft – einem Freund helfen", english: "to help – she helps – to help a friend" },
          { german: "Er schläft, aber die Kinder schlafen nicht.", english: "He is sleeping, but the children are not." },
        ],
      },
    ],
    examples: [
      { german: "Du fährst mit dem Bus.", english: "You travel by bus.", note: "fahren: a → ä" },
      { german: "Lea liest jeden Abend.", english: "Lea reads every evening.", note: "lesen: e → ie" },
      { german: "Wir sprechen im Kurs Deutsch.", english: "We speak German in class.", note: "No vowel change with wir" },
      { german: "Was isst du zum Frühstück?", english: "What do you eat for breakfast?", note: "essen → du isst" },
      { german: "Mein Vater schläft noch.", english: "My father is still sleeping.", note: "schlafen: a → ä" },
      { german: "Nimmst du den Zug?", english: "Are you taking the train?", note: "nehmen → du nimmst" },
      { german: "Die Ärztin hilft dem Kind.", english: "The doctor helps the child.", note: "helfen: e → i" },
      { german: "Sehen Sie das Gebäude?", english: "Do you see the building?", note: "Formal Sie has no stem change" },
    ],
    mistakes: [
      { wrong: "Er fahrt nach Hause.", right: "Er fährt nach Hause.", why: "fahren changes a to ä with er." },
      { wrong: "Wir fähren nach Hause.", right: "Wir fahren nach Hause.", why: "The stem change does not occur with wir." },
      { wrong: "Ihr schläft lange.", right: "Ihr schlaft lange.", why: "ihr uses the unchanged stem schlaf-." },
      { wrong: "Du lesst die Zeitung.", right: "Du liest die Zeitung.", why: "The du form of lesen changes e to ie: liest." },
      { wrong: "Sie nehmt den Bus. (she)", right: "Sie nimmt den Bus.", why: "nehmen has the singular form nimmt." },
    ],
    memoryTip: "Mark du and er/sie/es as the two change zones. Learn every new verb as infinitive + er-form: fahren–fährt, sprechen–spricht, lesen–liest.",
    exercises: A1_LESSON_THREE_EXERCISES,
  },
  "a1-1-4": {
    id: "a1-1-4",
    lead: "The conjugated verb is the structural anchor of a German main clause. It occupies position two—not necessarily the second written word—and stays there when time, place, an object, or another idea moves to the beginning for emphasis.",
    pattern: "Position 1 + VERB + subject + rest: Heute lerne ich Deutsch.",
    explanation: [
      "A sentence position is a functional unit, not a single word. Heute is one element, but Am Montag, Nach dem Deutschkurs, and In meiner neuen Wohnung are also one element each. The conjugated verb follows that complete opening unit.",
      "When the subject occupies position one, the familiar order is subject + verb: Ich arbeite heute. When another element moves to position one, the verb stays second and the subject moves behind it: Heute arbeite ich.",
      "Time and place phrases commonly appear first because they connect a sentence to its context. Objects can also appear first for contrast or emphasis: Das Buch lese ich heute; den Film sehe ich morgen.",
      "Only the conjugated part of the verb holds position two. With a separable verb, the prefix goes to the end: Nach der Arbeit kauft Tom ein. With a modal verb, the infinitive goes to the end: Heute muss ich arbeiten.",
      "The verb-second rule applies to statements and main clauses. Direct yes/no questions use verb-first order, and subordinate clauses later in the course place the conjugated verb at the end.",
      "Varying position one makes German sound connected and natural. It also lets you guide attention without changing the basic meaning: Ich lerne heute zu Hause; Heute lerne ich zu Hause; Zu Hause lerne ich heute.",
    ],
    tables: [
      {
        title: "The verb-second sentence frame",
        caption: "Position one can grow, shrink, or change type. The conjugated verb keeps its reserved second position.",
        headers: ["Position 1", "Position 2", "Subject", "Remaining information"],
        rows: [
          ["Ich", "arbeite", "—", "heute zu Hause."],
          ["Heute", "arbeite", "ich", "zu Hause."],
          ["Am Montag", "arbeite", "ich", "zu Hause."],
          ["Nach dem Kurs", "trinke", "ich", "einen Kaffee."],
          ["In Berlin", "wohnt", "meine Schwester", "seit zwei Jahren."],
        ],
      },
      {
        title: "What can occupy position one?",
        headers: ["Opening type", "Example", "English", "Focus"],
        rows: [
          ["subject", "Mara kocht heute.", "Mara is cooking today.", "who"],
          ["time", "Heute kocht Mara.", "Today Mara is cooking.", "when"],
          ["place", "Zu Hause kocht Mara.", "Mara is cooking at home.", "where"],
          ["object", "Die Suppe kocht Mara heute.", "Mara is cooking the soup today.", "what"],
          ["adverb", "Danach isst die Familie.", "After that, the family eats.", "connection"],
        ],
      },
      {
        title: "The same anchor with more than one verb part",
        headers: ["Verb structure", "Position two", "End", "Example"],
        rows: [
          ["simple verb", "lerne", "—", "Heute lerne ich Deutsch."],
          ["separable verb", "kaufe", "ein", "Heute kaufe ich ein."],
          ["modal + infinitive", "muss", "arbeiten", "Heute muss ich arbeiten."],
          ["perfect tense", "habe", "gelernt", "Heute habe ich viel gelernt."],
        ],
      },
    ],
    sections: [
      {
        title: "Count elements, not words",
        paragraphs: [
          "Learners often count written words and incorrectly think the verb in Am Montag arbeite ich is third. Am Montag answers one question—when?—and functions as one time element, so arbeite is the second sentence element.",
          "Use a bracket test: place brackets around everything that belongs to the opening phrase. [Nach dem langen Deutschkurs] trinke ich einen Kaffee. The verb begins immediately after the closing bracket.",
        ],
        examples: [
          { german: "[Heute Morgen] lerne ich Deutsch.", english: "[This morning] I am studying German." },
          { german: "[In meiner neuen Wohnung] arbeite ich gern.", english: "[In my new apartment] I like working." },
          { german: "[Nach dem Essen] gehen wir spazieren.", english: "[After the meal] we go for a walk." },
        ],
      },
      {
        title: "The subject–verb inversion",
        paragraphs: [
          "When the subject leaves position one, it usually appears directly after the conjugated verb. This is sometimes called inversion, but the verb has not moved away from its rule: position two remains fixed while the subject changes position.",
          "Compare Ich arbeite heute and Heute arbeite ich. English often keeps the subject before the verb after a time phrase, but German normally does not: Heute ich arbeite is incorrect.",
        ],
        examples: [
          { german: "Meine Schwester wohnt in Bonn.", english: "My sister lives in Bonn." },
          { german: "In Bonn wohnt meine Schwester.", english: "My sister lives in Bonn." },
          { german: "Morgen besuchen wir unsere Oma.", english: "Tomorrow we are visiting our grandmother." },
        ],
      },
      {
        title: "Using position one to build coherent text",
        paragraphs: [
          "Position one can connect each new sentence to the previous one. Time words such as dann, danach, später, and am Abend create a clear sequence. Place phrases can maintain a scene, while an object can repeat or contrast a topic.",
          "In a short narrative, avoid beginning every sentence with ich. Keep the verb second while varying the opening: Am Morgen stehe ich auf. Danach mache ich Kaffee. Im Büro beantworte ich E-Mails.",
        ],
        examples: [
          { german: "Am Morgen mache ich Kaffee. Danach lese ich die Nachrichten.", english: "In the morning I make coffee. After that I read the news." },
          { german: "Im Park treffe ich Lea. Dort trinken wir einen Kaffee.", english: "I meet Lea in the park. We have a coffee there." },
          { german: "Den Kaffee trinke ich schwarz. Tee trinke ich mit Milch.", english: "I drink coffee black. I drink tea with milk." },
        ],
      },
    ],
    examples: [
      { german: "Ich kaufe heute Brot.", english: "I am buying bread today.", note: "subject in position one" },
      { german: "Heute kaufe ich Brot.", english: "Today I am buying bread.", note: "time in position one" },
      { german: "Nach der Arbeit besucht Maria ihre Freundin.", english: "After work Maria visits her friend.", note: "multiword opening = one element" },
      { german: "In Berlin wohnt mein Bruder.", english: "My brother lives in Berlin.", note: "place + verb + subject" },
      { german: "Das Buch lese ich morgen.", english: "I am reading the book tomorrow.", note: "object emphasised in position one" },
      { german: "Danach trinken wir einen Kaffee.", english: "After that we have a coffee.", note: "connecting adverb first" },
      { german: "Heute kauft Tom im Supermarkt ein.", english: "Tom is shopping at the supermarket today.", note: "conjugated part second, prefix last" },
      { german: "Am Montag muss ich lange arbeiten.", english: "On Monday I have to work for a long time.", note: "modal verb second, infinitive last" },
    ],
    mistakes: [
      { wrong: "Heute ich lerne Deutsch.", right: "Heute lerne ich Deutsch.", why: "The conjugated verb must be the second element." },
      { wrong: "Am Wochenende meine Freunde kommen.", right: "Am Wochenende kommen meine Freunde.", why: "The opening phrase occupies position one, so the verb follows it." },
      { wrong: "In Berlin mein Bruder wohnt.", right: "In Berlin wohnt mein Bruder.", why: "The place phrase is first, so the subject must follow the verb." },
      { wrong: "Nach dem Kurs ich trinke Kaffee.", right: "Nach dem Kurs trinke ich Kaffee.", why: "The full opening phrase counts as one element and the verb must be next." },
      { wrong: "Heute ich muss arbeiten.", right: "Heute muss ich arbeiten.", why: "The conjugated modal verb occupies position two; the infinitive remains at the end." },
    ],
    memoryTip: "Imagine the conjugated verb in a reserved chair marked 2. Put one complete idea in chair 1; if it is not the subject, the subject waits behind the verb.",
    exercises: A1_LESSON_FOUR_EXERCISES,
  },
  "a1-1-5": {
    id: "a1-1-5",
    lead: "German questions use two compact and reliable frames. Verb-first questions confirm a complete idea, while W-questions request one missing piece of information. Mastering both frames turns statements into real conversations.",
    pattern: "Kommst du heute? | Wann kommst du?",
    explanation: [
      "A yes/no question begins with the conjugated verb, followed by the subject: Arbeitest du heute? It asks whether the whole proposition is true and can normally be answered with ja, nein, or doch.",
      "A W-question begins with a question word. The conjugated verb occupies position two and the subject usually follows: Wo wohnst du? Warum lernt ihr Deutsch?",
      "Choose the question word by the missing information: wer for a person, was for a thing or action, wo for location, wohin for destination, woher for origin, wann for time, warum for reason, and wie for manner or condition.",
      "Question phrases can contain more than one word: wie viel asks an amount or price, wie viele asks a countable number, wie lange asks duration, and wie oft asks frequency. The whole phrase occupies position one.",
      "When wer is the subject, no separate subject follows: Wer kommt heute? When was is the object, the normal subject remains: Was kaufst du? This difference explains two structures that initially look similar.",
      "Formal Sie follows the same frames and remains capitalised: Arbeiten Sie hier? Woher kommen Sie? Informal plural ihr uses its own verb ending: Kommt ihr heute?",
    ],
    tables: [
      {
        title: "The two direct-question frames",
        caption: "The conjugated verb is the anchor in both patterns.",
        headers: ["Question type", "Position 1", "Position 2", "Next", "Example"],
        rows: [
          ["yes/no", "verb", "subject", "rest", "Arbeitest du heute?"],
          ["W-question", "W-word", "verb", "subject", "Wo arbeitest du?"],
          ["subject question", "wer / was", "verb", "rest", "Wer arbeitet heute?"],
        ],
      },
      {
        title: "Core question words",
        headers: ["Question word", "Asks about", "Example", "Typical answer"],
        rows: [
          ["wer", "person", "Wer kommt?", "Mara."],
          ["was", "thing / action", "Was liest du?", "Ein Buch."],
          ["wo", "location", "Wo wohnst du?", "In Köln."],
          ["wohin", "destination", "Wohin fährst du?", "Nach Berlin."],
          ["woher", "origin", "Woher kommen Sie?", "Aus Indien."],
          ["wann", "time", "Wann beginnt es?", "Um acht."],
          ["warum", "reason", "Warum lernst du?", "Für meine Arbeit."],
          ["wie", "manner / condition", "Wie geht es dir?", "Gut, danke."],
        ],
      },
      {
        title: "Useful question phrases with wie",
        headers: ["Phrase", "Meaning", "Example", "English"],
        rows: [
          ["wie viel", "amount / price", "Wie viel kostet das?", "How much does that cost?"],
          ["wie viele", "countable number", "Wie viele Gäste kommen?", "How many guests are coming?"],
          ["wie lange", "duration", "Wie lange bleibst du?", "How long are you staying?"],
          ["wie oft", "frequency", "Wie oft lernst du?", "How often do you study?"],
          ["wie spät", "clock time", "Wie spät ist es?", "What time is it?"],
        ],
      },
    ],
    sections: [
      {
        title: "Turning a statement into a yes/no question",
        paragraphs: [
          "Find the conjugated verb and move it before the subject. Du arbeitest heute becomes Arbeitest du heute? The remaining information keeps its natural order.",
          "With multi-part verbs, only the conjugated part moves. Du kaufst heute ein becomes Kaufst du heute ein? Du musst heute arbeiten becomes Musst du heute arbeiten?",
        ],
        examples: [
          { german: "Du hast Zeit. → Hast du Zeit?", english: "You have time. → Do you have time?" },
          { german: "Ihr kommt morgen. → Kommt ihr morgen?", english: "You are coming tomorrow. → Are you coming tomorrow?" },
          { german: "Sie kaufen hier ein. → Kaufen Sie hier ein?", english: "You shop here. → Do you shop here?" },
        ],
      },
      {
        title: "Choosing wo, wohin, or woher",
        paragraphs: [
          "Use wo for a fixed location, wohin for movement toward a destination, and woher for movement or origin from somewhere. The verbs and prepositions in the answer reinforce the distinction.",
          "Compare Wo bist du? — In Berlin. Wohin fährst du? — Nach Berlin. Woher kommst du? — Aus Berlin. English often uses where for all three, so learn the German direction contrast explicitly.",
        ],
        examples: [
          { german: "Wo ist der Bahnhof?", english: "Where is the station?" },
          { german: "Wohin gehst du?", english: "Where are you going?" },
          { german: "Woher kommt der Zug?", english: "Where does the train come from?" },
        ],
      },
      {
        title: "Questions that keep a conversation moving",
        paragraphs: [
          "A natural conversation mixes yes/no questions with open W-questions. A yes/no question establishes a topic; a W-question invites detail: Lernst du Deutsch? Warum lernst du Deutsch?",
          "Short follow-up questions such as Und du?, Wirklich?, Warum?, and Wie oft? can sound natural, but full question frames are essential when the context is not already clear.",
        ],
        examples: [
          { german: "Arbeiten Sie hier? Was machen Sie genau?", english: "Do you work here? What exactly do you do?" },
          { german: "Fährst du gern Rad? Wie oft fährst du?", english: "Do you like cycling? How often do you cycle?" },
          { german: "Kommst du morgen? Um wie viel Uhr?", english: "Are you coming tomorrow? At what time?" },
        ],
      },
    ],
    examples: [
      { german: "Hast du Zeit?", english: "Do you have time?", note: "verb-first question" },
      { german: "Woher kommen Sie?", english: "Where do you come from?", note: "formal address" },
      { german: "Warum lernst du Deutsch?", english: "Why are you learning German?", note: "reason" },
      { german: "Wer arbeitet heute?", english: "Who is working today?", note: "Wer is the subject" },
      { german: "Was liest du?", english: "What are you reading?", note: "Was is the object" },
      { german: "Wohin fährt der Bus?", english: "Where is the bus going?", note: "destination" },
      { german: "Wie lange bleibt ihr?", english: "How long are you staying?", note: "duration" },
      { german: "Wie viel kostet das Zimmer?", english: "How much does the room cost?", note: "price" },
    ],
    mistakes: [
      { wrong: "Wo du wohnst?", right: "Wo wohnst du?", why: "In a direct W-question, the verb is second." },
      { wrong: "Du hast Zeit?", right: "Hast du Zeit?", why: "Neutral yes/no questions begin with the verb." },
      { wrong: "Wann der Kurs beginnt?", right: "Wann beginnt der Kurs?", why: "The conjugated verb follows the question word." },
      { wrong: "Woher Sie kommen?", right: "Woher kommen Sie?", why: "Formal Sie follows the conjugated verb." },
      { wrong: "Wer er kommt heute?", right: "Wer kommt heute?", why: "Wer already functions as the subject, so do not add er." },
    ],
    memoryTip: "Keep two spoken frames ready: VERB–person? and W–VERB–person? Then choose the question word by the exact information you need.",
    exercises: A1_LESSON_FIVE_EXERCISES,
  },
  "a1-1-6": {
    id: "a1-1-6",
    lead: "German divides negation between kein and nicht. kein rejects or removes an indefinite noun, while nicht negates actions, qualities, specific phrases, and contrasts. The choice and position together show exactly what the speaker denies.",
    pattern: "kein + noun | nicht + verb/adjective/specific element",
    explanation: [
      "Use kein when an affirmative sentence contains ein/eine or a noun with no article: Ich habe ein Auto → Ich habe kein Auto; Ich trinke Kaffee → Ich trinke keinen Kaffee.",
      "kein behaves like the indefinite article and carries gender, number, and case endings. At this stage, note kein Mann, keine Frau, kein Kind, keine Kinder, and the masculine accusative form keinen Mann.",
      "Use nicht to negate a verb or the whole action: Ich arbeite heute nicht. It often stands near the end, but before a separated prefix: Ich kaufe heute nicht ein.",
      "Place nicht directly before an adjective, adverb, prepositional phrase, or other element being specifically denied: nicht teuer, nicht heute, nicht in Berlin, nicht mit dem Bus.",
      "A noun with a definite article, demonstrative, name, or possessive normally uses nicht: nicht der Bus, nicht dieses Hotel, nicht Paul, nicht mein Schlüssel. kein cannot stand beside another determiner.",
      "Use nicht … sondern … to correct one detail explicitly: Wir kommen nicht heute, sondern morgen. The position of nicht identifies the incorrect element; sondern introduces the replacement.",
    ],
    tables: [
      {
        title: "Decision guide: kein or nicht?",
        headers: ["What is negated?", "Use", "Affirmative", "Negative"],
        rows: [
          ["noun with ein/eine", "kein", "Ich habe ein Auto.", "Ich habe kein Auto."],
          ["noun with no article", "kein", "Ich trinke Kaffee.", "Ich trinke keinen Kaffee."],
          ["adjective", "nicht", "Das ist teuer.", "Das ist nicht teuer."],
          ["whole action", "nicht", "Wir kommen heute.", "Wir kommen heute nicht."],
          ["specific/possessive noun", "nicht", "Das ist mein Bus.", "Das ist nicht mein Bus."],
        ],
      },
      {
        title: "Core forms of kein",
        caption: "Masculine accusative is the visible A1 case change: kein becomes keinen.",
        headers: ["Gender / number", "Nominative", "Accusative", "Example"],
        rows: [
          ["masculine", "kein", "keinen", "kein Mann · keinen Mann"],
          ["feminine", "keine", "keine", "keine Zeit"],
          ["neuter", "kein", "kein", "kein Auto"],
          ["plural", "keine", "keine", "keine Tickets"],
        ],
      },
      {
        title: "Position changes the focus of nicht",
        headers: ["Meaning", "German", "What is denied?"],
        rows: [
          ["whole action", "Ich arbeite heute nicht.", "working today as a whole"],
          ["time contrast", "Ich arbeite nicht heute, sondern morgen.", "today"],
          ["place contrast", "Ich arbeite nicht in Bonn.", "in Bonn"],
          ["quality", "Die Arbeit ist nicht schwer.", "difficult"],
          ["specific noun", "Das ist nicht der Chef.", "the identified person"],
        ],
      },
    ],
    sections: [
      {
        title: "The article replacement test",
        paragraphs: [
          "Ask whether the affirmative noun would use ein/eine or no article. If yes, replace that article slot with a form of kein: ein Termin → kein Termin; einen Termin → keinen Termin; Milch → keine Milch.",
          "If another determiner is already present—der, dieser, mein, dein—or the noun is a name, use nicht instead. German does not combine kein with these words.",
        ],
        examples: [
          { german: "Sie hat eine Frage. → Sie hat keine Frage.", english: "She has a question. → She has no question." },
          { german: "Das ist mein Fahrrad. → Das ist nicht mein Fahrrad.", english: "That is my bicycle. → That is not my bicycle." },
          { german: "Dort wartet Paul. → Dort wartet nicht Paul.", english: "Paul is waiting there. → It is not Paul waiting there." },
        ],
      },
      {
        title: "Placing nicht by meaning",
        paragraphs: [
          "For broad sentence negation, nicht tends toward the right side of the middle field: Ich kenne ihn nicht; Ich arbeite heute nicht. With a separable verb, it comes before the separated prefix: Ich rufe heute nicht an.",
          "For focused negation, place nicht immediately before the element you reject. Compare Ich fahre heute nicht (I am not going today) with Ich fahre nicht heute, sondern morgen (not today specifically, but tomorrow).",
        ],
        examples: [
          { german: "Wir sehen den Film nicht.", english: "We are not watching the film." },
          { german: "Wir sehen den Film nicht heute.", english: "We are not watching the film today." },
          { german: "Wir sehen nicht den Film, sondern die Serie.", english: "We are watching not the film but the series." },
        ],
      },
      {
        title: "Answering negative questions with doch",
        paragraphs: [
          "German has a useful answer word that English lacks. When a negative question or statement is wrong, use doch to contradict it positively: Kommst du nicht? — Doch, ich komme.",
          "Use nein when the negative assumption is correct: Kommst du nicht? — Nein, ich komme nicht. This three-way system—ja, nein, doch—makes answers precise.",
        ],
        examples: [
          { german: "Hast du kein Auto? — Doch, ich habe ein Auto.", english: "Don't you have a car? — Yes, actually I do." },
          { german: "Arbeitest du heute nicht? — Nein, heute nicht.", english: "Aren't you working today? — No, not today." },
          { german: "Ist das nicht teuer? — Doch, sehr teuer.", english: "Isn't that expensive? — Yes, it is very expensive." },
        ],
      },
    ],
    examples: [
      { german: "Ich habe kein Auto.", english: "I do not have a car.", note: "neuter noun" },
      { german: "Mara trinkt keinen Kaffee.", english: "Mara does not drink coffee.", note: "masculine accusative → keinen" },
      { german: "Der Film ist nicht langweilig.", english: "The film is not boring.", note: "adjective" },
      { german: "Wir kommen heute nicht.", english: "We are not coming today.", note: "whole action" },
      { german: "Das ist nicht meine Tasche.", english: "That is not my bag.", note: "possessive noun phrase" },
      { german: "Sie wohnt nicht in Berlin.", english: "She does not live in Berlin.", note: "place phrase" },
      { german: "Ich kaufe heute nicht ein.", english: "I am not shopping today.", note: "before separated prefix" },
      { german: "Nicht heute, sondern morgen.", english: "Not today, but tomorrow.", note: "explicit contrast" },
    ],
    mistakes: [
      { wrong: "Ich habe nicht Hund.", right: "Ich habe keinen Hund.", why: "An indefinite noun is negated with kein; Hund is masculine accusative." },
      { wrong: "Das ist kein mein Fahrrad.", right: "Das ist nicht mein Fahrrad.", why: "A noun with a possessive determiner is negated with nicht." },
      { wrong: "Der Kaffee ist kein heiß.", right: "Der Kaffee ist nicht heiß.", why: "An adjective is negated with nicht." },
      { wrong: "Wir nicht wohnen in Köln.", right: "Wir wohnen nicht in Köln.", why: "The conjugated verb remains in position two." },
      { wrong: "Ich brauche kein Termin.", right: "Ich brauche keinen Termin.", why: "Termin is a masculine accusative object, so use keinen." },
    ],
    memoryTip: "Use the article test: ein/eine or no article becomes kein-. Everything else uses nicht, placed directly before the idea you want to deny.",
    exercises: A1_LESSON_SIX_EXERCISES,
  },
  "a1-2-1": {
    id: "a1-2-1",
    lead: "Every German noun belongs to a grammatical gender, and its article is part of the word's identity. Learning article, noun, and plural together creates the foundation for cases, pronouns, adjective endings, and accurate vocabulary recall.",
    pattern: "masculine: der · feminine: die · neuter: das · plural: die",
    explanation: [
      "German nouns always begin with a capital letter. Store each noun as a complete unit: der Tisch, die Wohnung, das Fenster—not as an English meaning with the article added later.",
      "Grammatical gender is not the same as biological sex. Objects and abstract ideas also have gender, and nouns for people can follow word-form rules: das Mädchen is neuter because the suffix -chen always creates a neuter noun.",
      "Some suffixes are reliable. -ung, -heit, -keit, -schaft, -ion, and -tät strongly signal feminine gender; -chen and -lein are neuter. Days, months, seasons, and many male-person nouns are masculine.",
      "Patterns reduce memorisation, but they do not replace a dictionary. When a word has no reliable clue, verify its gender and practise the article and noun aloud as one rhythmic chunk.",
      "The forms der, die, and das shown here are nominative. Articles later change with case, but the noun's underlying gender does not: der Tisch can become den Tisch, while Tisch remains masculine.",
      "Gender also determines the pronoun that replaces a singular noun: der Tisch → er, die Lampe → sie, das Buch → es. Plural nouns use sie regardless of their singular genders.",
    ],
    tables: [
      {
        title: "The four article categories",
        headers: ["Category", "Article", "Example", "Pronoun"],
        rows: [
          ["masculine", "der", "der Tisch", "er"],
          ["feminine", "die", "die Lampe", "sie"],
          ["neuter", "das", "das Fenster", "es"],
          ["plural", "die", "die Fenster", "sie"],
        ],
      },
      {
        title: "Reliable gender suffixes",
        headers: ["Gender", "Common suffixes", "Examples"],
        rows: [
          ["feminine", "-ung, -heit, -keit", "die Wohnung · die Freiheit · die Möglichkeit"],
          ["feminine", "-schaft, -ion, -tät", "die Freundschaft · die Information · die Universität"],
          ["neuter", "-chen, -lein", "das Mädchen · das Brötchen · das Büchlein"],
          ["masculine", "days, months, seasons", "der Montag · der Januar · der Sommer"],
          ["neuter", "nominalised infinitives", "das Essen · das Lesen · das Lernen"],
        ],
      },
      {
        title: "Article–noun–plural learning cards",
        headers: ["Article + noun", "Plural", "English", "Pattern"],
        rows: [
          ["der Tisch", "die Tische", "table", "masculine"],
          ["die Wohnung", "die Wohnungen", "apartment", "-ung feminine"],
          ["das Buch", "die Bücher", "book", "neuter; umlaut plural"],
          ["das Mädchen", "die Mädchen", "girl", "-chen neuter"],
        ],
      },
    ],
    sections: [
      {
        title: "Why the article belongs to the noun",
        paragraphs: [
          "Gender cannot always be recovered from meaning, so a bare noun is incomplete learning data. If you memorise Tisch alone, every later article, pronoun, and adjective requires a guess. If you memorise der Tisch, the masculine category is available immediately.",
          "Add the plural at the same time because plural formation is also partly unpredictable: der Tisch – die Tische; das Buch – die Bücher. One compact card solves two future problems.",
        ],
        examples: [
          { german: "der Tisch – die Tische", english: "the table – the tables" },
          { german: "die Hand – die Hände", english: "the hand – the hands" },
          { german: "das Kind – die Kinder", english: "the child – the children" },
        ],
      },
      {
        title: "Using patterns without overguessing",
        paragraphs: [
          "A strong suffix is more useful than a vague meaning rule. -ung is dependable in die Rechnung and die Übung, while an object's size, shape, or material tells you nothing reliable about its gender.",
          "Treat weaker patterns as memory support rather than laws. When uncertain, check a dictionary that shows the article and plural, then record the complete noun phrase.",
        ],
        examples: [
          { german: "die Zeitung · die Rechnung · die Übung", english: "-ung nouns are feminine" },
          { german: "das Häuschen · das Kätzchen", english: "-chen nouns are neuter" },
          { german: "der Sommer · der Winter", english: "seasons are masculine" },
        ],
      },
      {
        title: "From noun gender to pronoun reference",
        paragraphs: [
          "German pronouns follow grammatical gender when they replace things. A lamp becomes sie because Lampe is feminine; a phone becomes es because Handy is neuter. This is grammar, not personification.",
          "Plural reference is simpler: all plural nouns use sie. Read article–noun–pronoun chains aloud to connect vocabulary and sentence building.",
        ],
        examples: [
          { german: "Der Computer ist neu. Er ist schnell.", english: "The computer is new. It is fast." },
          { german: "Die Tasche ist groß. Sie ist schwer.", english: "The bag is large. It is heavy." },
          { german: "Das Handy ist hier. Es ist alt.", english: "The phone is here. It is old." },
        ],
      },
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
    memoryTip: "Store every noun as article + noun + plural: der Tisch – die Tische. Say the complete chunk aloud so gender is recalled automatically, not calculated later.",
    exercises: A1_LESSON_SEVEN_EXERCISES,
  },
  "a1-2-2": {
    id: "a1-2-2",
    lead: "The indefinite article introduces one person or thing without assuming the listener already knows which one. German marks its gender with ein or eine, then normally switches to a definite article when that same noun becomes known in the conversation.",
    pattern: "der → ein · die → eine · das → ein | no indefinite plural article",
    explanation: [
      "In the nominative, masculine and neuter nouns use ein, while feminine nouns use eine: ein Mann, eine Frau, ein Kind. The article inherits the noun's gender.",
      "German has no plural form of ein. Indefinite plural nouns appear without an article: Dort sind Kinder; Auf dem Tisch liegen Bücher. The plural verb remains essential.",
      "Use ein/eine for a new or non-specific singular noun. Use der/die/das when the listener can identify the noun from previous mention, shared context, or uniqueness.",
      "A common information pattern is indefinite first mention followed by definite reference: Dort ist ein Hund. Der Hund heißt Max. The article change tracks what has become known.",
      "An unmodified profession, nationality, or role after sein often has no article: Sie ist Ärztin; Er ist Lehrer. Add an article when the noun is described or evaluated: Er ist ein guter Lehrer.",
      "The negative counterpart of ein/eine is kein/keine: ein Auto → kein Auto; eine Wohnung → keine Wohnung. This shared pattern becomes important throughout the case system.",
    ],
    tables: [
      {
        title: "Nominative indefinite articles",
        headers: ["Gender / number", "Definite", "Indefinite", "Example"],
        rows: [
          ["masculine", "der", "ein", "ein Mann"],
          ["feminine", "die", "eine", "eine Frau"],
          ["neuter", "das", "ein", "ein Kind"],
          ["plural", "die", "—", "Kinder"],
        ],
      },
      {
        title: "New information becomes known information",
        headers: ["Stage", "Article", "German", "Why"],
        rows: [
          ["first mention", "indefinite", "Dort ist ein Hund.", "new to the listener"],
          ["second mention", "definite", "Der Hund heißt Max.", "now identifiable"],
          ["new feminine noun", "indefinite", "Hier ist eine Tasche.", "first mention"],
          ["reference", "definite", "Die Tasche ist schwer.", "same known bag"],
        ],
      },
      {
        title: "Professions after sein",
        headers: ["Meaning", "German", "Article use"],
        rows: [
          ["neutral profession", "Mia ist Ärztin.", "no article"],
          ["described profession", "Mia ist eine gute Ärztin.", "article + adjective"],
          ["identified person", "Mia ist die Ärztin aus Bonn.", "definite article"],
          ["plural profession", "Mia und Tom sind Ärzte.", "no indefinite plural"],
        ],
      },
    ],
    sections: [
      {
        title: "Choosing by gender",
        paragraphs: [
          "First retrieve the noun with its definite article: der Bahnhof, die Küche, das Hotel. Then map der and das to ein, and die to eine. This avoids memorising the indefinite form separately.",
          "Only feminine visibly stands out in the nominative with -e. Masculine and neuter share ein, while plural leaves the indefinite article slot empty.",
        ],
        examples: [
          { german: "der Bahnhof → ein Bahnhof", english: "the station → a station" },
          { german: "die Küche → eine Küche", english: "the kitchen → a kitchen" },
          { german: "das Hotel → ein Hotel", english: "the hotel → a hotel" },
        ],
      },
      {
        title: "Tracking first and second mention",
        paragraphs: [
          "Articles help manage information, not just gender. ein/eine signals that the listener cannot yet identify the exact referent. der/die/das signals that both speaker and listener can now locate it mentally.",
          "Practise in pairs rather than isolated sentences. Introduce something, then say one more thing about it with the definite article or a pronoun.",
        ],
        examples: [
          { german: "Ich sehe ein Café. Das Café ist voll.", english: "I see a café. The café is full." },
          { german: "Eine Frau wartet. Die Frau telefoniert.", english: "A woman is waiting. The woman is on the phone." },
          { german: "Ein Kind spielt. Es lacht.", english: "A child is playing. It is laughing." },
        ],
      },
      {
        title: "The missing plural form",
        paragraphs: [
          "English uses some or no article for indefinite plurals. German normally uses the bare plural noun: Hier stehen Autos; Im Park spielen Kinder. Do not invent eine or einen before a plural.",
          "Other determiners can fill that slot when needed: viele Bücher, keine Autos, meine Freunde. The absence applies specifically to the indefinite article ein.",
        ],
        examples: [
          { german: "Auf dem Tisch liegen Bücher.", english: "There are books on the table." },
          { german: "Vor dem Haus stehen Autos.", english: "There are cars in front of the house." },
          { german: "Hier arbeiten Ärztinnen.", english: "Female doctors work here." },
        ],
      },
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
    memoryTip: "Map der/das → ein, die → eine, plural → no indefinite article. Then track the conversation: introduce with ein/eine and refer back with der/die/das.",
    exercises: A1_LESSON_EIGHT_EXERCISES,
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
