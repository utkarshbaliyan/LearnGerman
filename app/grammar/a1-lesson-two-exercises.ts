import type { GrammarExercise } from "@/app/grammar/course";

const PATTERN = "1 · Stems and endings";
const CONJUGATION = "2 · Conjugation in context";
const SPELLING = "3 · Spelling rules";
const SENTENCES = "4 · Sentences and errors";
const TRANSLATION = "5 · Translation and production";

export const A1_LESSON_TWO_EXERCISES: GrammarExercise[] = [
  { id: "a112-01", group: PATTERN, type: "choice", prompt: "What is the stem of machen?", options: ["mach", "mache", "machen", "ma"], answer: "mach", explanation: "Remove the infinitive ending -en: machen → mach-." },
  { id: "a112-02", group: PATTERN, type: "choice", prompt: "What is the stem of wohnen?", options: ["woh", "wohn", "wohne", "wohnen"], answer: "wohn", explanation: "Remove -en from wohnen to find the stem wohn-." },
  { id: "a112-03", group: PATTERN, type: "choice", prompt: "Which ending normally goes with ich?", options: ["-e", "-st", "-t", "-en"], answer: "-e", explanation: "Regular verbs normally take -e with ich: ich mache." },
  { id: "a112-04", group: PATTERN, type: "choice", prompt: "Which ending normally goes with du?", options: ["-e", "-st", "-t", "-en"], answer: "-st", explanation: "Regular verbs normally take -st with du: du machst." },
  { id: "a112-05", group: PATTERN, type: "choice", prompt: "Which ending goes with er, sie, and es?", options: ["-e", "-st", "-t", "-en"], answer: "-t", explanation: "Third-person singular takes -t: er macht." },
  { id: "a112-06", group: PATTERN, type: "choice", prompt: "Which ending goes with wir?", options: ["-e", "-st", "-t", "-en"], answer: "-en", explanation: "wir uses the infinitive-looking ending -en: wir machen." },
  { id: "a112-07", group: PATTERN, type: "choice", prompt: "Which ending goes with ihr?", options: ["-e", "-st", "-t", "-en"], answer: "-t", explanation: "ihr takes -t: ihr macht." },
  { id: "a112-08", group: PATTERN, type: "choice", prompt: "Which subjects share the -en form?", options: ["ich and du", "er and ihr", "wir, sie, and Sie", "du and ihr"], answer: "wir, sie, and Sie", explanation: "wir, plural sie, and formal Sie all use the infinitive form." },
  { id: "a112-09", group: PATTERN, type: "choice", prompt: "Which form correctly matches ihr?", options: ["ihr lernen", "ihr lernst", "ihr lernt", "ihr lerne"], answer: "ihr lernt", explanation: "The stem lern- takes the ihr ending -t." },
  { id: "a112-10", group: PATTERN, type: "choice", prompt: "Which form correctly matches meine Freunde?", options: ["lernt", "lernst", "lernen", "lerne"], answer: "lernen", explanation: "Meine Freunde is plural and can be replaced by sie, so use lernen." },

  { id: "a112-11", group: CONJUGATION, type: "fill", prompt: "Ich ___ jeden Morgen Kaffee. (machen)", answer: "mache", explanation: "ich takes the ending -e: mache." },
  { id: "a112-12", group: CONJUGATION, type: "fill", prompt: "Du ___ in München. (wohnen)", answer: "wohnst", explanation: "du takes -st: wohnst." },
  { id: "a112-13", group: CONJUGATION, type: "fill", prompt: "Sara ___ Deutsch und Englisch. (lernen)", answer: "lernt", explanation: "Sara is third-person singular and takes -t: lernt." },
  { id: "a112-14", group: CONJUGATION, type: "fill", prompt: "Das Kind ___ im Garten. (spielen)", answer: "spielt", explanation: "Das Kind can be replaced by es, so use spielt." },
  { id: "a112-15", group: CONJUGATION, type: "fill", prompt: "Wir ___ am Samstag. (kochen)", answer: "kochen", explanation: "wir takes -en, which matches the infinitive." },
  { id: "a112-16", group: CONJUGATION, type: "fill", prompt: "Ihr ___ viele Fragen. (fragen)", answer: "fragt", explanation: "ihr takes -t: fragt." },
  { id: "a112-17", group: CONJUGATION, type: "fill", prompt: "Meine Eltern ___ in einem Krankenhaus. (arbeiten)", answer: "arbeiten", explanation: "The plural subject meine Eltern takes -en." },
  { id: "a112-18", group: CONJUGATION, type: "fill", prompt: "Herr Weber, wo ___ Sie? (wohnen)", answer: "wohnen", explanation: "Formal Sie always takes the -en form." },
  { id: "a112-19", group: CONJUGATION, type: "fill", prompt: "Lena und ich ___ heute zusammen. (lernen)", answer: "lernen", explanation: "Lena und ich equals wir, so use lernen." },
  { id: "a112-20", group: CONJUGATION, type: "fill", prompt: "Wer ___ heute das Abendessen? (kochen)", answer: "kocht", explanation: "Wer is treated as third-person singular, so use kocht." },

  { id: "a112-21", group: SPELLING, type: "choice", prompt: "Choose the correct form: du ___ heute. (arbeiten)", options: ["arbeitst", "arbeitest", "arbeiten", "arbeittest"], answer: "arbeitest", explanation: "After a stem ending in -t, insert e before the du ending: arbeitest." },
  { id: "a112-22", group: SPELLING, type: "choice", prompt: "Choose the correct form: er ___. (warten)", options: ["wart", "wartt", "wartet", "warten"], answer: "wartet", explanation: "The stem wart- needs an extra e before the -t ending: wartet." },
  { id: "a112-23", group: SPELLING, type: "fill", prompt: "Ihr ___ die Tür. (öffnen)", answer: "öffnet", explanation: "öffnen loses the unstressed e before n in the stem; the ihr form is öffnet." },
  { id: "a112-24", group: SPELLING, type: "choice", prompt: "Choose the correct du form of tanzen.", options: ["tanzst", "tanzt", "tanzest", "tanzen"], answer: "tanzt", explanation: "After a stem ending in z, du uses only -t because the s sound is already present: du tanzt." },
  { id: "a112-25", group: SPELLING, type: "choice", prompt: "Choose the correct du form of heißen.", options: ["heißst", "heißt", "heißest", "heißen"], answer: "heißt", explanation: "After ß, the du form does not add another s: du heißt." },
  { id: "a112-26", group: SPELLING, type: "fill", prompt: "Du ___ gern nach Berlin. (reisen)", answer: "reist", explanation: "The stem reis- already ends in an s sound, so the du form is reist." },
  { id: "a112-27", group: SPELLING, type: "choice", prompt: "Choose the natural ich form of sammeln.", options: ["sammele", "sammle", "sammelst", "sammelt"], answer: "sammle", explanation: "With many -eln verbs, the first-person form commonly drops the stem e: ich sammle." },
  { id: "a112-28", group: SPELLING, type: "fill", prompt: "Ich ___ im Supermarkt. (handeln)", answer: ["handle", "handele"], explanation: "The common form is ich handle; the full form handele is also grammatically possible." },
  { id: "a112-29", group: SPELLING, type: "choice", prompt: "Which form is correct?", options: ["du rechnst", "du rechnest", "du rechnet", "du rechnen"], answer: "du rechnest", explanation: "rechnen inserts e before the du ending: du rechnest." },
  { id: "a112-30", group: SPELLING, type: "fill", prompt: "Der Kurs ___ um neun Uhr. (enden)", answer: "endet", explanation: "The stem end- needs an extra e before third-person -t: endet." },

  { id: "a112-31", group: SENTENCES, type: "order", prompt: "Build the statement: I learn German every day.", tokens: ["jeden", "Deutsch", "Ich", "Tag", "lerne", "."], answer: "Ich lerne jeden Tag Deutsch.", explanation: "The subject comes first and the conjugated verb occupies position two." },
  { id: "a112-32", group: SENTENCES, type: "order", prompt: "Build the statement: We live in Cologne.", tokens: ["Köln", "Wir", "in", "wohnen", "."], answer: "Wir wohnen in Köln.", explanation: "wir takes wohnen." },
  { id: "a112-33", group: SENTENCES, type: "order", prompt: "Build the question: Where do you work? (informal singular)", tokens: ["du", "Wo", "arbeitest", "?"], answer: "Wo arbeitest du?", explanation: "A W-question uses question word + conjugated verb + subject." },
  { id: "a112-34", group: SENTENCES, type: "order", prompt: "Build the yes/no question: Do you all play football?", tokens: ["Fußball", "Spielt", "ihr", "?"], answer: "Spielt ihr Fußball?", explanation: "A yes/no question begins with the conjugated verb; ihr takes spielt." },
  { id: "a112-35", group: SENTENCES, type: "order", prompt: "Start with the time phrase.", tokens: ["meine", "Am", "arbeitet", "Mutter", "Montag", "."], answer: "Am Montag arbeitet meine Mutter.", explanation: "The opening time phrase is position one, so the conjugated verb follows it." },
  { id: "a112-36", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Du lernen sehr schnell.", answer: "Du lernst sehr schnell.", explanation: "du requires the ending -st." },
  { id: "a112-37", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Er wohnst in Bonn.", answer: "Er wohnt in Bonn.", explanation: "er takes -t, not -st." },
  { id: "a112-38", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Ihr machen heute Pizza.", answer: "Ihr macht heute Pizza.", explanation: "ihr takes the ending -t." },
  { id: "a112-39", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Frau Klein arbeit in Berlin.", answer: "Frau Klein arbeitet in Berlin.", explanation: "arbeiten has a stem ending in -t, so the third-person form is arbeitet." },
  { id: "a112-40", group: SENTENCES, type: "correction", prompt: "Correct the sentence: Wo Sie wohnen?", answer: "Wo wohnen Sie?", explanation: "In a direct W-question, the verb comes after the W-word and before the subject." },

  { id: "a112-41", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: I work in a school.", answer: ["Ich arbeite in einer Schule.", "Ich arbeite in einer Schule"], explanation: "ich takes arbeite. The place phrase is in einer Schule." },
  { id: "a112-42", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: You learn German. (informal singular)", answer: ["Du lernst Deutsch.", "Du lernst Deutsch"], explanation: "du takes lernst." },
  { id: "a112-43", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: She lives in Vienna.", answer: ["Sie wohnt in Wien.", "Sie wohnt in Wien"], explanation: "Third-person singular sie takes wohnt; Vienna is Wien in German." },
  { id: "a112-44", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate: We cook together on Sunday.", answer: ["Wir kochen am Sonntag zusammen.", "Wir kochen zusammen am Sonntag.", "Am Sonntag kochen wir zusammen."], explanation: "wir takes kochen. German allows different placements, but the conjugated verb remains second in a statement." },
  { id: "a112-45", group: TRANSLATION, type: "translation", direction: "en-de", prompt: "Translate politely: Where do you work?", answer: ["Wo arbeiten Sie?", "Wo arbeiten Sie"], explanation: "Formal Sie takes arbeiten and follows the verb in the W-question." },
  { id: "a112-46", group: TRANSLATION, type: "translation", direction: "de-en", prompt: "Translate into English: Ihr wartet vor dem Kino.", answer: ["You are waiting in front of the cinema.", "You are waiting in front of the movie theater.", "You wait in front of the cinema."], explanation: "ihr is informal plural you, and wartet is its regular present-tense form." },
  { id: "a112-47", group: TRANSLATION, type: "production", prompt: "Write four sentences about activities you do during a normal week. Use four different regular verbs.", model: "Ich arbeite von Montag bis Freitag. Ich lerne Deutsch. Ich koche am Abend. Am Samstag spiele ich Tennis.", explanation: "Check the ich ending -e and keep the conjugated verb in position two." },
  { id: "a112-48", group: TRANSLATION, type: "production", prompt: "Describe two other people with four regular verbs.", model: "Meine Schwester wohnt in Köln und arbeitet im Krankenhaus. Mein Freund lernt Deutsch und spielt Fußball.", explanation: "A singular name or noun phrase takes the third-person ending -t." },
  { id: "a112-49", group: TRANSLATION, type: "production", prompt: "Write three questions with regular verbs: one yes/no question and two W-questions.", model: "Arbeitest du heute? Wo wohnst du? Was lernt ihr?", explanation: "Use verb-first order for the yes/no question and W-word + verb + subject for the others." },
  { id: "a112-50", group: TRANSLATION, type: "production", prompt: "Write a short six-sentence daily routine using at least five regular present-tense verbs.", model: "Ich wohne in Berlin. Am Morgen mache ich Kaffee. Dann arbeite ich zu Hause. Mittags koche ich. Am Abend lerne ich Deutsch und höre Musik.", explanation: "Check every subject–verb ending and underline the conjugated verb in each sentence." },
];
