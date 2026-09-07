export const TUTOR_PATTERNS = {
  "verb-agreement": { label: "Subject–verb agreement", question: "Who is doing the action, and which verb ending matches that subject?", example: "du → du lernst; wir → wir lernen" },
  "verb-position": { label: "German word order", question: "Is this a main clause or a subordinate clause? Where does its conjugated verb belong?", example: "Heute … ich Deutsch. / …, weil ich Deutsch … ." },
  "case-articles": { label: "Cases and articles", question: "Which role does the noun have here: subject, direct object or indirect object?", example: "der Mann → Ich sehe den Mann." },
  "tense": { label: "Talking about time", question: "When did this happen? Check the tense, auxiliary and participle.", example: "Gestern habe ich … . / Morgen werde ich … ." },
  "prepositions": { label: "Prepositions", question: "Which preposition fits this meaning, and which case does it require?", example: "mit + dative: mit meinem Freund" },
  "adjective-endings": { label: "Adjective endings", question: "Check the noun's gender, case and article before choosing the adjective ending.", example: "ein kleiner Hund / mit einem kleinen Hund" },
  "negation": { label: "Negation", question: "Are you negating a noun with an indefinite article, or an action or other information?", example: "Ich habe kein Auto. / Ich fahre heute nicht." },
  "spelling": { label: "Spelling and capitalization", question: "Check noun capitals, umlauts and the spelling of the highlighted word.", example: "lernen → das Lernen; schon ≠ schön" },
  "other": { label: "Other language use", question: "Read the highlighted phrase in context. Which part changes the meaning?", example: "Use a short, familiar sentence to express the same idea." },
} as const;
export type TutorPatternId = keyof typeof TUTOR_PATTERNS;
export const TUTOR_PATTERN_IDS = Object.keys(TUTOR_PATTERNS) as TutorPatternId[];
export function tutorPattern(value: unknown): TutorPatternId | null {
  return typeof value === "string" && Object.hasOwn(TUTOR_PATTERNS, value) ? value as TutorPatternId : null;
}
