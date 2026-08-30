import type { GrammarExercise } from "@/app/grammar/course";

const ARTICLES = "1 · Articles and gender";
const ENDINGS = "2 · Gender clues";
const NOUNS = "3 · Nouns in context";
const REPAIR = "4 · Building and correcting";
const TRANSFER = "5 · Translation and production";

export const A1_LESSON_SEVEN_EXERCISES: GrammarExercise[] = [
  { id: "a121-01", group: ARTICLES, type: "choice", prompt: "Which article marks a masculine noun in the nominative?", options: ["der", "die", "das", "den"], answer: "der", explanation: "The masculine nominative definite article is der." },
  { id: "a121-02", group: ARTICLES, type: "choice", prompt: "Which article marks a feminine noun in the nominative?", options: ["der", "die", "das", "den"], answer: "die", explanation: "The feminine nominative definite article is die." },
  { id: "a121-03", group: ARTICLES, type: "choice", prompt: "Which article marks a neuter noun in the nominative?", options: ["der", "die", "das", "den"], answer: "das", explanation: "The neuter nominative definite article is das." },
  { id: "a121-04", group: ARTICLES, type: "choice", prompt: "Which article do all nominative plurals use?", options: ["der", "die", "das", "den"], answer: "die", explanation: "All nominative plural nouns use die." },
  { id: "a121-05", group: ARTICLES, type: "choice", prompt: "Which learning unit is best?", options: ["Tisch", "der Tisch", "Tisch = table", "masculine"], answer: "der Tisch", explanation: "Store article and noun together so gender becomes part of the word." },
  { id: "a121-06", group: ARTICLES, type: "choice", prompt: "Choose the complete noun: ___ Wohnung", options: ["der", "die", "das", "den"], answer: "die", explanation: "Wohnung is feminine: die Wohnung." },
  { id: "a121-07", group: ARTICLES, type: "choice", prompt: "Choose the complete noun: ___ Fenster", options: ["der", "die", "das", "den"], answer: "das", explanation: "Fenster is neuter: das Fenster." },
  { id: "a121-08", group: ARTICLES, type: "choice", prompt: "Choose the complete noun: ___ Bahnhof", options: ["der", "die", "das", "den"], answer: "der", explanation: "Bahnhof is masculine: der Bahnhof." },
  { id: "a121-09", group: ARTICLES, type: "choice", prompt: "Why is grammatical gender important?", options: ["It changes spelling only.", "It controls articles, pronouns, and adjective endings.", "It shows biological sex in every noun.", "It disappears in sentences."], answer: "It controls articles, pronouns, and adjective endings.", explanation: "Gender affects several connected parts of German grammar." },
  { id: "a121-10", group: ARTICLES, type: "choice", prompt: "Which statement is true?", options: ["All objects are neuter.", "Gender is always logical.", "The article belongs to the noun's stored form.", "Plural nouns keep three genders in the article."], answer: "The article belongs to the noun's stored form.", explanation: "Because gender is not fully predictable, learn each noun with its article." },

  { id: "a121-11", group: ENDINGS, type: "choice", prompt: "Nouns ending in -ung are usually ___.", options: ["masculine", "feminine", "neuter", "plural"], answer: "feminine", explanation: "-ung is a strong feminine signal: die Wohnung, die Zeitung." },
  { id: "a121-12", group: ENDINGS, type: "choice", prompt: "Nouns ending in -heit or -keit are usually ___.", options: ["masculine", "feminine", "neuter", "genderless"], answer: "feminine", explanation: "Abstract nouns with -heit and -keit are feminine." },
  { id: "a121-13", group: ENDINGS, type: "choice", prompt: "Nouns ending in -chen are always ___.", options: ["masculine", "feminine", "neuter", "plural"], answer: "neuter", explanation: "The diminutive suffix -chen always creates a neuter noun." },
  { id: "a121-14", group: ENDINGS, type: "choice", prompt: "Nouns ending in -lein are always ___.", options: ["masculine", "feminine", "neuter", "plural"], answer: "neuter", explanation: "Like -chen, -lein is a neuter diminutive suffix." },
  { id: "a121-15", group: ENDINGS, type: "choice", prompt: "Which noun is feminine because of its suffix?", options: ["der Lehrer", "die Information", "das Brötchen", "der Computer"], answer: "die Information", explanation: "Nouns ending in -ion are usually feminine." },
  { id: "a121-16", group: ENDINGS, type: "choice", prompt: "Which noun is neuter because of its suffix?", options: ["die Freundschaft", "der Motor", "das Mädchen", "die Universität"], answer: "das Mädchen", explanation: "The suffix -chen makes Mädchen neuter." },
  { id: "a121-17", group: ENDINGS, type: "choice", prompt: "Days, months, and seasons are usually ___.", options: ["masculine", "feminine", "neuter", "plural"], answer: "masculine", explanation: "Use der Montag, der Januar, and der Sommer." },
  { id: "a121-18", group: ENDINGS, type: "choice", prompt: "Infinitives used as nouns are usually ___.", options: ["masculine", "feminine", "neuter", "plural"], answer: "neuter", explanation: "Nominalised infinitives use das: das Essen, das Lesen." },
  { id: "a121-19", group: ENDINGS, type: "choice", prompt: "Which suffix is a strong feminine clue?", options: ["-er", "-schaft", "-chen", "-lein"], answer: "-schaft", explanation: "Words such as die Freundschaft and die Mannschaft are feminine." },
  { id: "a121-20", group: ENDINGS, type: "choice", prompt: "What should you do when no reliable clue exists?", options: ["Guess from meaning.", "Use das for every object.", "Check and learn the noun with its article.", "Omit the article forever."], answer: "Check and learn the noun with its article.", explanation: "Patterns help, but the dictionary article remains authoritative." },

  { id: "a121-21", group: NOUNS, type: "fill", prompt: "___ Tisch ist neu.", answer: "Der", explanation: "Tisch is masculine: der Tisch." },
  { id: "a121-22", group: NOUNS, type: "fill", prompt: "___ Lampe ist alt.", answer: "Die", explanation: "Lampe is feminine: die Lampe." },
  { id: "a121-23", group: NOUNS, type: "fill", prompt: "___ Buch ist interessant.", answer: "Das", explanation: "Buch is neuter: das Buch." },
  { id: "a121-24", group: NOUNS, type: "fill", prompt: "___ Kinder spielen draußen.", answer: "Die", explanation: "The nominative plural article is die." },
  { id: "a121-25", group: NOUNS, type: "fill", prompt: "___ Zeitung liegt auf dem Tisch.", answer: "Die", explanation: "Zeitung is feminine, confirmed by the suffix -ung." },
  { id: "a121-26", group: NOUNS, type: "fill", prompt: "___ Brötchen ist frisch.", answer: "Das", explanation: "The suffix -chen makes Brötchen neuter." },
  { id: "a121-27", group: NOUNS, type: "fill", prompt: "___ Sommer ist warm.", answer: "Der", explanation: "Seasons are masculine: der Sommer." },
  { id: "a121-28", group: NOUNS, type: "fill", prompt: "___ Universität ist groß.", answer: "Die", explanation: "Universität is feminine; -tät is a strong feminine suffix." },
  { id: "a121-29", group: NOUNS, type: "choice", prompt: "Choose the pronoun replacement: der Computer → ___.", options: ["er", "sie", "es", "sie plural"], answer: "er", explanation: "A masculine noun is normally replaced by er." },
  { id: "a121-30", group: NOUNS, type: "choice", prompt: "Choose the pronoun replacement: das Handy → ___.", options: ["er", "sie", "es", "ihr"], answer: "es", explanation: "A neuter noun is normally replaced by es." },

  { id: "a121-31", group: REPAIR, type: "order", prompt: "Build the sentence.", tokens: ["ist", "neu", "Der", "Computer", "."], answer: "Der Computer ist neu.", explanation: "Computer is masculine and takes der as the subject." },
  { id: "a121-32", group: REPAIR, type: "order", prompt: "Build the sentence.", tokens: ["ist", "Die", "Küche", "klein", "."], answer: "Die Küche ist klein.", explanation: "Küche is feminine: die Küche." },
  { id: "a121-33", group: REPAIR, type: "order", prompt: "Build the plural sentence.", tokens: ["sind", "Die", "teuer", "Hotels", "."], answer: "Die Hotels sind teuer.", explanation: "All nominative plurals use die and a plural verb." },
  { id: "a121-34", group: REPAIR, type: "correction", prompt: "Correct: Der Lampe ist alt.", answer: "Die Lampe ist alt.", explanation: "Lampe is feminine." },
  { id: "a121-35", group: REPAIR, type: "correction", prompt: "Correct: Die Mädchen spielt draußen.", answer: "Das Mädchen spielt draußen.", explanation: "The -chen suffix makes Mädchen neuter." },
  { id: "a121-36", group: REPAIR, type: "correction", prompt: "Correct: Das Zeitung ist neu.", answer: "Die Zeitung ist neu.", explanation: "The suffix -ung marks a feminine noun." },
  { id: "a121-37", group: REPAIR, type: "correction", prompt: "Correct: Der Kinder sind müde.", answer: "Die Kinder sind müde.", explanation: "All nominative plurals use die." },
  { id: "a121-38", group: REPAIR, type: "correction", prompt: "Correct: tisch ist groß.", answer: "Der Tisch ist groß.", explanation: "German nouns are capitalised, and a specific singular noun needs its article." },
  { id: "a121-39", group: REPAIR, type: "fill", prompt: "Replace with a pronoun: Die Wohnung ist hell. ___ ist groß.", answer: "Sie", explanation: "Wohnung is feminine, so use sie." },
  { id: "a121-40", group: REPAIR, type: "fill", prompt: "Replace with a pronoun: Das Fenster ist offen. ___ ist neu.", answer: "Es", explanation: "Fenster is neuter, so use es." },

  { id: "a121-41", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate: The table is new.", answer: ["Der Tisch ist neu.", "Der Tisch ist neu"], explanation: "Tisch is masculine: der Tisch." },
  { id: "a121-42", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate: The apartment is small.", answer: ["Die Wohnung ist klein.", "Die Wohnung ist klein"], explanation: "Wohnung is feminine: die Wohnung." },
  { id: "a121-43", group: TRANSFER, type: "translation", direction: "en-de", prompt: "Translate: The book is interesting.", answer: ["Das Buch ist interessant.", "Das Buch ist interessant"], explanation: "Buch is neuter: das Buch." },
  { id: "a121-44", group: TRANSFER, type: "translation", direction: "de-en", prompt: "Translate: Die Informationen sind wichtig.", answer: ["The information is important.", "The pieces of information are important."], explanation: "Informationen is plural and uses die; German uses a plural verb." },
  { id: "a121-45", group: TRANSFER, type: "translation", direction: "de-en", prompt: "Translate: Das Mädchen liest ein Buch.", answer: ["The girl is reading a book.", "The girl reads a book."], explanation: "Mädchen is grammatically neuter because of -chen." },
  { id: "a121-46", group: TRANSFER, type: "production", prompt: "List ten objects around you with their definite articles.", model: "der Tisch · die Lampe · das Fenster · der Stuhl · die Tür · das Buch · der Computer · die Tasche · das Handy · die Uhr", explanation: "Say every article–noun pair aloud as one unit." },
  { id: "a121-47", group: TRANSFER, type: "production", prompt: "Write six article–noun pairs that demonstrate three reliable gender suffixes.", model: "die Wohnung · die Zeitung · die Freiheit · die Möglichkeit · das Mädchen · das Brötchen", explanation: "Group nouns by visible suffix to make the pattern memorable." },
  { id: "a121-48", group: TRANSFER, type: "production", prompt: "Describe a room in six sentences, using at least two nouns of each gender.", model: "Der Tisch ist groß. Der Stuhl ist alt. Die Lampe ist neu. Die Tür ist offen. Das Fenster ist groß. Das Bild ist schön.", explanation: "Check each noun's article rather than guessing from the object." },
  { id: "a121-49", group: TRANSFER, type: "production", prompt: "Write five noun cards in the format article + noun + plural + English.", model: "der Tisch – die Tische – table · die Lampe – die Lampen – lamp · das Buch – die Bücher – book", explanation: "This four-part card prepares gender and plural recall together." },
  { id: "a121-50", group: TRANSFER, type: "production", prompt: "Write a short eight-sentence description that replaces four nouns with er, sie, es, or sie plural in the next sentence.", model: "Der Tisch ist neu. Er ist groß. Die Lampe ist alt. Sie ist schön. Das Fenster ist offen. Es ist sauber. Die Stühle sind bequem. Sie sind braun.", explanation: "Match each pronoun to the grammatical gender or plural number of its noun." },
];
