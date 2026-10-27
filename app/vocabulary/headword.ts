import { germanVerbLemma } from "./verb-forms";

/** Compare lemmas across levels, articles, reflexive forms and spelling variants. */
export function vocabularyHeadwordKey(german: string) {
  const isNoun = /^(?:der|die|das|der\/die|die\/der)\s+/i.test(german.trim());
  // German has no locale-specific lowercase tailoring. Avoid repeated ICU
  // locale setup while constructing the static vocabulary catalogue.
  const bare = german.normalize("NFKC").toLowerCase()
    .split(",")[0].trim().replace(/^(?:der|die|das|der\/die|die\/der)\s+/, "");
  const lemma = (isNoun ? bare : germanVerbLemma(bare)).replace(/^sich\s+/, "").split(/\s+/)[0];
  return lemma
    .replace(/^aufwändig$/, "aufwendig")
    .replace(/^selbständig$/, "selbstständig")
    .replace(/^potentiell$/, "potenziell")
    .replace(/^substantiell$/, "substanziell");
}
