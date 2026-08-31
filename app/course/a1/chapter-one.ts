export type ChapterVocabulary = {
  id: string;
  german: string;
  english: string;
  example: string;
  note?: string;
};

export type ChapterQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export const CHAPTER_ONE_OUTCOMES = [
  "Introduce yourself and another person",
  "Ask and answer simple questions about names and origin",
  "Understand the main details in a first meeting",
  "Use personal pronouns with the correct form of sein",
  "Record a short spoken introduction",
  "Write a clear personal profile in German",
];

export const CHAPTER_ONE_VOCABULARY: ChapterVocabulary[] = [
  { id: "guten-morgen", german: "Guten Morgen", english: "good morning", example: "Guten Morgen, Frau Sommer!" },
  { id: "hallo", german: "hallo", english: "hello", example: "Hallo, ich bin Mia." },
  { id: "heissen", german: "heißen", english: "to be called", example: "Ich heiße Mia.", note: "ich heiße · du heißt · Sie heißen" },
  { id: "name", german: "der Name, die Namen", english: "name", example: "Mein Name ist Paul." },
  { id: "neu", german: "neu", english: "new", example: "Mia ist neu in Berlin." },
  { id: "sein", german: "sein", english: "to be", example: "Ich bin neu hier.", note: "bin · bist · ist · sind · seid" },
  { id: "ich", german: "ich", english: "I", example: "Ich bin Amina." },
  { id: "du", german: "du", english: "you (informal singular)", example: "Wie heißt du?" },
  { id: "sie-formal", german: "Sie", english: "you (formal)", example: "Wie heißen Sie?", note: "Always capitalized" },
  { id: "er", german: "er", english: "he / it", example: "Paul ist Kellner. Er ist freundlich." },
  { id: "sie", german: "sie", english: "she / they", example: "Mia ist neu. Sie ist im Café." },
  { id: "wir", german: "wir", english: "we", example: "Wir sind im Deutschkurs." },
  { id: "kommen", german: "kommen", english: "to come", example: "Ich komme aus Indien." },
  { id: "aus", german: "aus", english: "from / out of", example: "Sie kommt aus Spanien." },
  { id: "wohnen", german: "wohnen", english: "to live", example: "Wo wohnst du?" },
  { id: "sprechen", german: "sprechen", english: "to speak", example: "Welche Sprachen sprichst du?" },
  { id: "sprache", german: "die Sprache, die Sprachen", english: "language", example: "Deutsch ist eine Sprache." },
  { id: "fragen", german: "fragen", english: "to ask", example: "Mia fragt nach dem Namen." },
  { id: "antworten", german: "antworten", english: "to answer", example: "Mia antwortet freundlich." },
  { id: "vorstellen", german: "sich vorstellen", english: "to introduce oneself", example: "Ich stelle mich vor: Ich bin Mia." },
  { id: "begruessen", german: "begrüßen", english: "to greet", example: "Die Personen begrüßen sich." },
  { id: "person", german: "die Person, die Personen", english: "person", example: "Mia kennt eine Person in Berlin." },
  { id: "land", german: "das Land, die Länder", english: "country", example: "Sie sprechen über ihre Länder." },
  { id: "cafe", german: "das Café, die Cafés", english: "café", example: "Mia geht in ein Café." },
  { id: "kellner", german: "der Kellner, die Kellner", english: "waiter", example: "Der Kellner heißt Paul." },
  { id: "platz", german: "der Platz, die Plätze", english: "seat / place", example: "Ist der Platz frei?" },
  { id: "frei", german: "frei", english: "free / available", example: "Ja, der Platz ist frei." },
  { id: "freundlich", german: "freundlich", english: "friendly", example: "Mia antwortet freundlich." },
  { id: "langsam", german: "langsam", english: "slowly", example: "Am Anfang spricht Mia langsam." },
  { id: "zusammen", german: "zusammen", english: "together", example: "Sie üben zusammen Deutsch." },
];

export const CHAPTER_ONE_LISTENING: ChapterQuestion[] = [
  { id: "l1", prompt: "Where does Mia go in the morning?", options: ["A language school", "A café", "A train station"], answer: "A café", explanation: "The story says: Am Morgen geht sie in ein Café." },
  { id: "l2", prompt: "What is the waiter’s name?", options: ["Paul", "Leo", "Max"], answer: "Paul", explanation: "Der Kellner heißt Paul." },
  { id: "l3", prompt: "What do Mia and the young woman order?", options: ["Coffee", "Water", "Tea"], answer: "Tea", explanation: "Bevor sie gehen, bestellen sie Tee." },
];

export const CHAPTER_ONE_READING: ChapterQuestion[] = [
  { id: "r1", prompt: "Why is this meeting important for Mia?", options: ["She gets a job", "She meets her first person in Berlin", "She finds a new apartment"], answer: "She meets her first person in Berlin", explanation: "Paul becomes the first person Mia knows in Berlin." },
  { id: "r2", prompt: "Which information do the people exchange?", options: ["Names, countries and telephone numbers", "Prices and opening hours", "Jobs and salaries"], answer: "Names, countries and telephone numbers", explanation: "They introduce themselves, discuss their countries and write down telephone numbers." },
  { id: "r3", prompt: "How does Mia practise at the end of the day?", options: ["She translates a newspaper", "She writes words and retells the story", "She watches a film"], answer: "She writes words and retells the story", explanation: "She writes five words with examples and tells the story aloud." },
];

export const CHAPTER_ONE_CHECKPOINT: ChapterQuestion[] = [
  { id: "c1", prompt: "Choose the correct introduction.", options: ["Ich ist Mia.", "Ich bin Mia.", "Ich sind Mia."], answer: "Ich bin Mia.", explanation: "The form of sein for ich is bin." },
  { id: "c2", prompt: "You politely ask someone’s name. What do you say?", options: ["Wie heißt du?", "Wie heißen Sie?", "Wo sind Sie?"], answer: "Wie heißen Sie?", explanation: "Formal Sie uses heißen and is capitalized." },
  { id: "c3", prompt: "Complete: Paul ist Kellner. ___ ist freundlich.", options: ["Er", "Sie", "Es"], answer: "Er", explanation: "Paul and the masculine noun Kellner are replaced by er." },
  { id: "c4", prompt: "Which sentence expresses origin?", options: ["Ich komme aus Indien.", "Ich wohne Indien.", "Ich heiße aus Indien."], answer: "Ich komme aus Indien.", explanation: "kommen aus expresses where someone comes from." },
  { id: "c5", prompt: "Build the correct question.", options: ["Wo du wohnst?", "Wo wohnst du?", "Du wohnst wo?"], answer: "Wo wohnst du?", explanation: "A W-question uses question word + conjugated verb + subject." },
  { id: "c6", prompt: "Which noun entry is complete and useful for learning?", options: ["Name", "der Name, die Namen", "Namen der"], answer: "der Name, die Namen", explanation: "Learn German nouns with their article and plural." },
];
