import type { GrammarExercise } from "@/app/grammar/course";

const PRONOUNS = "1 · Pronouns and meaning";
const CONJUGATION = "2 · Conjugating sein";
const BUILDING = "3 · Sentence building";
const ERRORS = "4 · Error clinic";
const TRANSLATION = "5 · Translation and production";

export const A1_LESSON_ONE_EXERCISES: GrammarExercise[] = [
  { id: "a111-01", group: PRONOUNS, type: "choice", prompt: "Which German pronoun means I?", options: ["du", "ich", "wir", "sie"], answer: "ich", explanation: "ich refers to the speaker: I." },
  { id: "a111-02", group: PRONOUNS, type: "choice", prompt: "You are speaking to one close friend. Which pronoun do you use?", options: ["du", "ihr", "Sie", "sie"], answer: "du", explanation: "du is informal singular you." },
  { id: "a111-03", group: PRONOUNS, type: "choice", prompt: "Replace der Mann with a pronoun.", options: ["er", "sie", "es", "ihr"], answer: "er", explanation: "A masculine singular noun is normally replaced by er." },
  { id: "a111-04", group: PRONOUNS, type: "choice", prompt: "Replace die Lampe with a pronoun.", options: ["er", "sie", "es", "wir"], answer: "sie", explanation: "A feminine singular noun is normally replaced by sie." },
  { id: "a111-05", group: PRONOUNS, type: "choice", prompt: "Replace das Buch with a pronoun.", options: ["er", "sie", "es", "Sie"], answer: "es", explanation: "A neuter singular noun is normally replaced by es." },
  { id: "a111-06", group: PRONOUNS, type: "choice", prompt: "Which pronoun means we?", options: ["wir", "ihr", "sie", "du"], answer: "wir", explanation: "wir includes the speaker and means we." },
  { id: "a111-07", group: PRONOUNS, type: "choice", prompt: "You are speaking to two friends. Which pronoun do you use?", options: ["du", "ihr", "sie", "Sie"], answer: "ihr", explanation: "ihr is informal plural you." },
  { id: "a111-08", group: PRONOUNS, type: "choice", prompt: "Replace Anna und Leo with a pronoun.", options: ["wir", "ihr", "sie", "es"], answer: "sie", explanation: "A third-person plural group is replaced by sie: they." },
  { id: "a111-09", group: PRONOUNS, type: "choice", prompt: "You speak politely to Frau Berger. Which pronoun is correct?", options: ["du", "sie", "ihr", "Sie"], answer: "Sie", explanation: "Formal you is Sie with a capital S." },
  { id: "a111-10", group: PRONOUNS, type: "choice", prompt: "In Die Kinder sind müde. ___ sind zu Hause, which pronoun completes the second sentence?", options: ["Es", "Sie", "Ihr", "Wir"], answer: "Sie", explanation: "Die Kinder is plural, so use sie. At the start of a sentence it is capitalized: Sie." },

  { id: "a111-11", group: CONJUGATION, type: "fill", prompt: "Ich ___ heute müde. (sein)", answer: "bin", explanation: "The sein form for ich is bin." },
  { id: "a111-12", group: CONJUGATION, type: "fill", prompt: "Du ___ sehr freundlich. (sein)", answer: "bist", explanation: "The sein form for du is bist." },
  { id: "a111-13", group: CONJUGATION, type: "fill", prompt: "Omar ___ mein Nachbar. (sein)", answer: "ist", explanation: "Omar can be replaced by er, and er takes ist." },
  { id: "a111-14", group: CONJUGATION, type: "fill", prompt: "Die Tasche ___ neu. (sein)", answer: "ist", explanation: "Die Tasche can be replaced by sie, and singular sie takes ist." },
  { id: "a111-15", group: CONJUGATION, type: "fill", prompt: "Das Hotel ___ im Zentrum. (sein)", answer: "ist", explanation: "Das Hotel can be replaced by es, and es takes ist." },
  { id: "a111-16", group: CONJUGATION, type: "fill", prompt: "Wir ___ im Deutschkurs. (sein)", answer: "sind", explanation: "The sein form for wir is sind." },
  { id: "a111-17", group: CONJUGATION, type: "fill", prompt: "Ihr ___ heute pünktlich. (sein)", answer: "seid", explanation: "The sein form for ihr is seid." },
  { id: "a111-18", group: CONJUGATION, type: "fill", prompt: "Meine Eltern ___ in Hamburg. (sein)", answer: "sind", explanation: "Meine Eltern is plural and can be replaced by sie: sind." },
  { id: "a111-19", group: CONJUGATION, type: "fill", prompt: "___ Sie Frau König? (sein)", answer: "Sind", explanation: "Formal Sie always uses sind; the verb is capitalized here because it begins the question." },
  { id: "a111-20", group: CONJUGATION, type: "fill", prompt: "Lena und ich ___ Kolleginnen. (sein)", answer: "sind", explanation: "Lena und ich equals wir, so use sind." },

  { id: "a111-21", group: BUILDING, type: "order", prompt: "Build the statement: I am new here.", tokens: ["neu", "Ich", "hier", "bin", "."], answer: "Ich bin neu hier.", explanation: "A basic statement uses subject + conjugated verb + the remaining information." },
  { id: "a111-22", group: BUILDING, type: "order", prompt: "Build the statement: You are very nice. (informal singular)", tokens: ["sehr", "Du", "nett", "bist", "."], answer: "Du bist sehr nett.", explanation: "du pairs with bist." },
  { id: "a111-23", group: BUILDING, type: "order", prompt: "Build the statement about Paul.", tokens: ["ist", "Paul", "Lehrer", "."], answer: "Paul ist Lehrer.", explanation: "A name is third-person singular and takes ist." },
  { id: "a111-24", group: BUILDING, type: "order", prompt: "Build the statement: We are from Vienna.", tokens: ["Wien", "aus", "Wir", "sind", "."], answer: "Wir sind aus Wien.", explanation: "wir pairs with sind; aus Wien expresses origin." },
  { id: "a111-25", group: BUILDING, type: "order", prompt: "Build an informal plural statement.", tokens: ["Ihr", "müde", "seid", "."], answer: "Ihr seid müde.", explanation: "ihr pairs with seid." },
  { id: "a111-26", group: BUILDING, type: "order", prompt: "Build the plural statement: They are at home.", tokens: ["zu", "Sie", "sind", "Hause", "."], answer: "Sie sind zu Hause.", explanation: "Plural sie takes sind. It is capitalized because it begins the sentence." },
  { id: "a111-27", group: BUILDING, type: "order", prompt: "Build the yes/no question: Are you tired?", tokens: ["du", "Bist", "müde", "?"], answer: "Bist du müde?", explanation: "A yes/no question begins with the conjugated verb: Bist du …?" },
  { id: "a111-28", group: BUILDING, type: "order", prompt: "Build the formal question: Are you Mr Roth?", tokens: ["Herr", "Sind", "Sie", "Roth", "?"], answer: "Sind Sie Herr Roth?", explanation: "Formal Sie uses sind, and the verb moves to the first position in a yes/no question." },
  { id: "a111-29", group: BUILDING, type: "order", prompt: "Build the W-question: Where are you? (informal plural)", tokens: ["Wo", "ihr", "seid", "?"], answer: "Wo seid ihr?", explanation: "A W-question uses question word + verb + subject." },
  { id: "a111-30", group: BUILDING, type: "order", prompt: "Build the answer: The children are in the garden.", tokens: ["Garten", "Die", "im", "Kinder", "sind", "."], answer: "Die Kinder sind im Garten.", explanation: "The plural subject die Kinder takes sind." },

  { id: "a111-31", group: ERRORS, type: "correction", prompt: "Correct the sentence: Ich ist Student.", answer: "Ich bin Student.", explanation: "ich must be followed by bin." },
  { id: "a111-32", group: ERRORS, type: "correction", prompt: "Correct the sentence: Du bin sehr ruhig.", answer: "Du bist sehr ruhig.", explanation: "du takes bist, not bin." },
  { id: "a111-33", group: ERRORS, type: "correction", prompt: "Correct the sentence: Herr Wolf sind Arzt.", answer: "Herr Wolf ist Arzt.", explanation: "Herr Wolf is one person and can be replaced by er, so use ist." },
  { id: "a111-34", group: ERRORS, type: "correction", prompt: "Correct the sentence: Das Buch sind interessant.", answer: "Das Buch ist interessant.", explanation: "Das Buch is singular and can be replaced by es, so use ist." },
  { id: "a111-35", group: ERRORS, type: "correction", prompt: "Correct the sentence: Wir seid aus Spanien.", answer: "Wir sind aus Spanien.", explanation: "wir takes sind; ihr takes seid." },
  { id: "a111-36", group: ERRORS, type: "correction", prompt: "Correct the sentence: Ihr sind meine Freunde.", answer: "Ihr seid meine Freunde.", explanation: "The sein form for ihr is seid." },
  { id: "a111-37", group: ERRORS, type: "correction", prompt: "Correct the sentence: Meine Eltern ist zu Hause.", answer: "Meine Eltern sind zu Hause.", explanation: "Meine Eltern is plural, so use sind." },
  { id: "a111-38", group: ERRORS, type: "correction", prompt: "Correct the formal question: Bist sie Frau Sommer?", answer: "Sind Sie Frau Sommer?", explanation: "Formal Sie is capitalized and pairs with sind." },
  { id: "a111-39", group: ERRORS, type: "correction", prompt: "Correct the pronoun: Der Tisch ist alt. Es ist braun.", answer: "Der Tisch ist alt. Er ist braun.", explanation: "Tisch is grammatically masculine, so replace it with er." },
  { id: "a111-40", group: ERRORS, type: "correction", prompt: "Correct the word order: Wo du bist?", answer: "Wo bist du?", explanation: "In a direct W-question, the conjugated verb comes immediately after the question word." },

  { id: "a111-41", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: I am from India.", answer: ["Ich bin aus Indien.", "Ich bin aus Indien"], explanation: "Use ich bin for I am and aus for origin." },
  { id: "a111-42", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: You are my friend. (informal singular)", answer: ["Du bist mein Freund.", "Du bist meine Freundin.", "Du bist mein Freund", "Du bist meine Freundin"], explanation: "Informal singular you is du, which takes bist. The noun can reflect the friend's gender." },
  { id: "a111-43", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: She is a doctor.", answer: ["Sie ist Ärztin.", "Sie ist eine Ärztin.", "Sie ist Ärztin", "Sie ist eine Ärztin"], explanation: "Third-person singular sie takes ist. Profession nouns commonly appear without an article after sein." },
  { id: "a111-44", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: We are ready.", answer: ["Wir sind bereit.", "Wir sind bereit"], explanation: "wir takes sind." },
  { id: "a111-45", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate politely: Are you new here?", answer: ["Sind Sie neu hier?", "Sind Sie neu hier"], explanation: "Formal Sie takes sind; yes/no questions begin with the verb." },
  { id: "a111-46", group: TRANSLATION, type: "translation", direction: "de-en", prompt: "Translate into English: Ihr seid sehr pünktlich.", answer: ["You are very punctual.", "You are very punctual", "You are all very punctual.", "You are all very punctual"], explanation: "ihr means informal plural you; seid is its sein form." },
  { id: "a111-47", group: TRANSLATION, type: "production", prompt: "Introduce yourself with your name, origin, and one adjective. Use three sentences with ich bin.", model: "Ich bin Amina. Ich bin aus Marokko. Ich bin neugierig.", explanation: "Personal details may differ. Confirm that every sentence uses ich bin and that nouns begin with a capital letter." },
  { id: "a111-48", group: TRANSLATION, type: "production", prompt: "Introduce two people, then replace their names with the correct pronouns.", model: "Das ist Jonas. Er ist mein Kollege. Das ist Lea. Sie ist meine Nachbarin.", explanation: "Use er for a masculine person and sie for a feminine person." },
  { id: "a111-49", group: TRANSLATION, type: "production", prompt: "Write one informal and one formal question with sein.", model: "Bist du neu hier? Sind Sie Frau Wagner?", explanation: "Use bist du for one familiar person and sind Sie for polite address." },
  { id: "a111-50", group: TRANSLATION, type: "production", prompt: "Write a four-line mini-dialogue in which two people introduce themselves.", model: "Hallo, ich bin Mia. Wer bist du? – Ich bin Karim. Bist du neu hier? – Ja, ich bin neu.", explanation: "Check every pronoun–verb pair and use verb-first order in the yes/no question." },
];
