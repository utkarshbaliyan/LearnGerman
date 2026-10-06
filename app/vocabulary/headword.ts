import { germanVerbLemma } from "./verb-forms";

/** Compare lemmas across levels, articles, reflexive forms and spelling variants. */
export function vocabularyHeadwordKey(german: string) {
  const isNoun = /^(?:der|die|das|der\/die|die\/der)\s+/i.test(german.trim());
  const bare = german.normalize("NFKC").toLocaleLowerCase("de")
    .split(",")[0].trim().replace(/^(?:der|die|das|der\/die|die\/der)\s+/, "");
  const lemma = (isNoun ? bare : germanVerbLemma(bare)).replace(/^sich\s+/, "").split(/\s+/)[0];
  return lemma
    .replace(/^aufwändig$/, "aufwendig")
    .replace(/^selbständig$/, "selbstständig")
    .replace(/^potentiell$/, "potenziell")
    .replace(/^substantiell$/, "substanziell");
}
