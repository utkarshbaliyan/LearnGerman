import type { GrammarExercise } from "@/app/grammar/course";

const PATTERNS = "1 · Recognising stem changes";
const FORMS = "2 · Building the forms";
const CONTEXT = "3 · Verbs in context";
const SENTENCES = "4 · Sentences and corrections";
const TRANSFER = "5 · Translation and production";

export const A1_LESSON_THREE_EXERCISES: GrammarExercise[] = [
  { id: "a113-01", group: PATTERNS, type: "choice", prompt: "Which persons normally show the vowel change?", options: ["ich and wir", "du and er/sie/es", "ihr and sie", "all persons"], answer: "du and er/sie/es", explanation: "The present-tense stem change normally appears only with du and er/sie/es." },
  { id: "a113-02", group: PATTERNS, type: "choice", prompt: "Which verb follows the pattern a → ä?", options: ["fahren", "lesen", "sprechen", "geben"], answer: "fahren", explanation: "fahren changes a to ä: du fährst, er fährt." },
  { id: "a113-03", group: PATTERNS, type: "choice", prompt: "Which verb follows the pattern e → ie?", options: ["helfen", "nehmen", "lesen", "essen"], answer: "lesen", explanation: "lesen changes e to ie: du liest, er liest." },
  { id: "a113-04", group: PATTERNS, type: "choice", prompt: "Which verb follows the pattern e → i?", options: ["sehen", "schlafen", "sprechen", "laufen"], answer: "sprechen", explanation: "sprechen changes e to i: du sprichst, sie spricht." },
  { id: "a113-05", group: PATTERNS, type: "choice", prompt: "Choose the correct pair.", options: ["fahren – er fahrt", "lesen – er lest", "essen – er isst", "schlafen – er schlaft"], answer: "essen – er isst", explanation: "essen changes e to i with er/sie/es: er isst." },
  { id: "a113-06", group: PATTERNS, type: "choice", prompt: "Which form does not have a stem change?", options: ["du schläfst", "er nimmt", "wir fahren", "sie liest"], answer: "wir fahren", explanation: "Plural wir uses the unchanged stem fahr-." },
  { id: "a113-07", group: PATTERNS, type: "choice", prompt: "Complete the learning pair: nehmen – er ___.", options: ["nehmt", "nimmt", "nehmt", "nehmtet"], answer: "nimmt", explanation: "nehmen changes e to i and also loses the h: er nimmt." },
  { id: "a113-08", group: PATTERNS, type: "choice", prompt: "Complete the learning pair: sehen – du ___.", options: ["sehst", "siehst", "seht", "sehen"], answer: "siehst", explanation: "sehen changes e to ie with du: du siehst." },
  { id: "a113-09", group: PATTERNS, type: "choice", prompt: "Which plural form is correct?", options: ["wir sprechen", "wir sprichen", "wir sprecht", "wir spricht"], answer: "wir sprechen", explanation: "The vowel change disappears in the plural: wir sprechen." },
  { id: "a113-10", group: PATTERNS, type: "choice", prompt: "Which dictionary note is most useful to learn?", options: ["fahren – ich fahre", "fahren – er fährt", "fahren – wir fahren", "fahren – ihr fahrt"], answer: "fahren – er fährt", explanation: "Learning the infinitive with its er-form reveals whether and how the stem changes." },

  { id: "a113-11", group: FORMS, type: "fill", prompt: "Du ___ jeden Morgen mit dem Bus. (fahren)", answer: "fährst", explanation: "fahren changes a to ä with du and takes -st: fährst." },
  { id: "a113-12", group: FORMS, type: "fill", prompt: "Mila ___ acht Stunden. (schlafen)", answer: "schläft", explanation: "Mila equals sie; schlafen changes a to ä: schläft." },
  { id: "a113-13", group: FORMS, type: "fill", prompt: "Was ___ du zum Frühstück? (essen)", answer: "isst", explanation: "essen changes e to i with du: isst." },
  { id: "a113-14", group: FORMS, type: "fill", prompt: "Der Lehrer ___ langsam. (sprechen)", answer: "spricht", explanation: "The singular subject takes spricht with the e → i change." },
  { id: "a113-15", group: FORMS, type: "fill", prompt: "Nora ___ ein Glas Wasser. (nehmen)", answer: "nimmt", explanation: "nehmen changes to nimmt with er/sie/es." },
  { id: "a113-16", group: FORMS, type: "fill", prompt: "Du ___ deinen Schlüssel. (geben)", answer: "gibst", explanation: "geben changes e to i with du: gibst." },
  { id: "a113-17", group: FORMS, type: "fill", prompt: "Er ___ am Wochenende seine Freunde. (treffen)", answer: "trifft", explanation: "treffen changes e to i: er trifft." },
  { id: "a113-18", group: FORMS, type: "fill", prompt: "Meine Schwester ___ gern Romane. (lesen)", answer: "liest", explanation: "Meine Schwester equals sie; lesen changes e to ie: liest." },
  { id: "a113-19", group: FORMS, type: "fill", prompt: "___ du den Bahnhof? (sehen)", answer: "Siehst", explanation: "sehen changes e to ie with du; a yes/no question begins with Siehst." },
  { id: "a113-20", group: FORMS, type: "fill", prompt: "Das Kind ___ schnell nach Hause. (laufen)", answer: "läuft", explanation: "laufen changes au to äu with er/sie/es: läuft." },

  { id: "a113-21", group: CONTEXT, type: "choice", prompt: "Wir ___ heute nach Hamburg.", options: ["fährt", "fährst", "fahren", "fahrt"], answer: "fahren", explanation: "wir uses the unchanged plural form fahren." },
  { id: "a113-22", group: CONTEXT, type: "choice", prompt: "Ihr ___ sehr gut Deutsch.", options: ["spricht", "sprecht", "sprichst", "sprechen"], answer: "sprecht", explanation: "ihr uses the unchanged stem and the ending -t: sprecht." },
  { id: "a113-23", group: CONTEXT, type: "choice", prompt: "Herr Roth, ___ Sie gern Krimis?", options: ["liest", "lest", "lesen", "liestest"], answer: "lesen", explanation: "Formal Sie uses the unchanged -en form lesen." },
  { id: "a113-24", group: CONTEXT, type: "fill", prompt: "Warum ___ du mir nicht? (helfen)", answer: "hilfst", explanation: "helfen changes e to i with du: hilfst." },
  { id: "a113-25", group: CONTEXT, type: "fill", prompt: "Am Abend ___ Amir oft fern. (sehen)", answer: "sieht", explanation: "Amir equals er, so sehen becomes sieht." },
  { id: "a113-26", group: CONTEXT, type: "choice", prompt: "Die Gäste ___ Kuchen und trinken Kaffee.", options: ["isst", "esst", "essen", "iss"], answer: "essen", explanation: "Die Gäste is plural and takes essen without a vowel change." },
  { id: "a113-27", group: CONTEXT, type: "fill", prompt: "Lea ___ heute ein rotes Kleid. (tragen)", answer: "trägt", explanation: "tragen changes a to ä with er/sie/es: trägt." },
  { id: "a113-28", group: CONTEXT, type: "choice", prompt: "Du ___ jeden Abend ein Buch.", options: ["lest", "liest", "lesst", "lesen"], answer: "liest", explanation: "lesen changes e to ie with du: liest." },
  { id: "a113-29", group: CONTEXT, type: "fill", prompt: "Mein Vater ___ am Sonntag lange. (schlafen)", answer: "schläft", explanation: "Mein Vater equals er; schlafen becomes schläft." },
  { id: "a113-30", group: CONTEXT, type: "choice", prompt: "What does Er fährt morgen nach Köln mean?", options: ["He drove to Cologne yesterday.", "He is travelling to Cologne tomorrow.", "He wants to travel to Cologne.", "He never travels to Cologne."], answer: "He is travelling to Cologne tomorrow.", explanation: "The present tense plus morgen expresses a planned future action." },

  { id: "a113-31", group: SENTENCES, type: "order", prompt: "Build the statement: She reads the newspaper every morning.", tokens: ["jeden", "Zeitung", "Sie", "Morgen", "liest", "die", "."], answer: "Sie liest jeden Morgen die Zeitung.", explanation: "The singular subject takes liest; the verb occupies position two." },
  { id: "a113-32", group: SENTENCES, type: "order", prompt: "Build the question: What are you eating today?", tokens: ["du", "Was", "heute", "isst", "?"], answer: "Was isst du heute?", explanation: "Use W-word + verb + subject; essen becomes isst with du." },
  { id: "a113-33", group: SENTENCES, type: "order", prompt: "Start with the time phrase.", tokens: ["nach", "Am", "fährt", "Berlin", "Montag", "Jonas", "."], answer: "Am Montag fährt Jonas nach Berlin.", explanation: "Am Montag is position one, fährt is position two, and the subject follows." },
  { id: "a113-34", group: SENTENCES, type: "order", prompt: "Build the yes/no question.", tokens: ["du", "gern", "Liest", "Romane", "?"], answer: "Liest du gern Romane?", explanation: "A yes/no question begins with the conjugated verb liest." },
  { id: "a113-35", group: SENTENCES, type: "order", prompt: "Build the plural statement.", tokens: ["im", "Wir", "Deutsch", "Kurs", "sprechen", "."], answer: "Wir sprechen im Kurs Deutsch.", explanation: "wir uses sprechen without a vowel change." },
  { id: "a113-36", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Er fahrt jeden Tag zur Arbeit.", answer: "Er fährt jeden Tag zur Arbeit.", explanation: "fahren changes a to ä with er: fährt." },
  { id: "a113-37", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Du lesst sehr schnell.", answer: "Du liest sehr schnell.", explanation: "The du form of lesen is liest." },
  { id: "a113-38", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Wir nimmt den Bus.", answer: "Wir nehmen den Bus.", explanation: "wir uses the unchanged plural form nehmen." },
  { id: "a113-39", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Ihr schläft bis neun Uhr.", answer: "Ihr schlaft bis neun Uhr.", explanation: "The stem change occurs with du and er/sie/es, not with ihr." },
  { id: "a113-40", group: SENTENCES, type: "correction", prompt: "Correct the question: Was du isst zum Frühstück?", answer: ["Was isst du zum Frühstück?", "Was isst du zum Frühstück"], explanation: "The conjugated verb comes directly after the W-word." },

  { id: "a113-41", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate: He travels to work by train.", answer: ["Er fährt mit dem Zug zur Arbeit.", "Er fährt mit dem Zug zur Arbeit"], explanation: "fahren changes to fährt with er." },
  { id: "a113-42", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate: What are you reading? (informal singular)", answer: ["Was liest du?", "Was liest du"], explanation: "lesen becomes liest with du; use W-word + verb + subject." },
  { id: "a113-43", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate: My sister speaks German.", answer: ["Meine Schwester spricht Deutsch.", "Meine Schwester spricht Deutsch"], explanation: "Meine Schwester equals sie; sprechen becomes spricht." },
  { id: "a113-44", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate politely: Do you take the bus?", answer: ["Nehmen Sie den Bus?", "Nehmen Sie den Bus"], explanation: "Formal Sie uses nehmen without a stem change." },
  { id: "a113-45", group: TRANSFER, type: "translation", direction: "de-en", prompt: "Translate into English: Das Kind schläft schon.", answer: ["The child is already sleeping.", "The child already sleeps.", "The child is asleep already."], explanation: "schläft is the third-person form of schlafen; schon means already." },
  { id: "a113-46", group: TRANSFER, type: "translation", direction: "de-en", prompt: "Translate into English: Warum hilfst du ihm?", answer: ["Why are you helping him?", "Why do you help him?"], explanation: "hilfst is the du form of helfen; ihm means him in the dative." },
  { id: "a113-47", group: TRANSFER, type: "production", prompt: "Write four sentences using fahren, lesen, essen, and sprechen. Include two singular and two plural subjects.", model: "Mira fährt mit dem Bus. Du liest ein Buch. Wir essen zusammen. Meine Freunde sprechen Deutsch.", explanation: "Apply the stem change only with du and er/sie/es." },
  { id: "a113-48", group: TRANSFER, type: "production", prompt: "Write three direct questions using different stem-changing verbs.", model: "Was liest du? Fährt er heute nach Berlin? Wann schläfst du?", explanation: "Check both the stem change and question word order." },
  { id: "a113-49", group: TRANSFER, type: "production", prompt: "Describe a family member's normal day in five sentences. Use at least three stem-changing verbs.", model: "Mein Bruder schläft bis sieben Uhr. Er nimmt den Bus. Mittags isst er in der Kantine. Am Abend trifft er Freunde und liest ein Buch.", explanation: "A singular person uses the er/sie/es form throughout." },
  { id: "a113-50", group: TRANSFER, type: "production", prompt: "Write a six-sentence mini-dialogue that includes a question and answer with lesen, essen, and fahren.", model: "Was liest du? Ich lese einen Roman. Isst du jetzt? Ja, ich esse gleich. Fährst du später nach Hause? Ja, ich fahre um acht.", explanation: "Use changed stems with du and unchanged stems with ich." },
];
