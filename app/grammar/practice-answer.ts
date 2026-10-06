export function joinGrammarTokens(tokens: string[]) {
  return tokens.join(" ").replace(/\s+([,.;:!?])/g, "$1");
}

export function acceptsGrammarAnswer(answer: string | string[], value: string, caseSensitive = false) {
  const normalize = (text: string) => {
    const cleaned = text.trim().replace(/\s+([,.;:!?])/g, "$1").replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
    return caseSensitive ? cleaned : cleaned.toLocaleLowerCase("de");
  };
  return (Array.isArray(answer) ? answer : [answer]).some(item => normalize(item) === normalize(value));
}
