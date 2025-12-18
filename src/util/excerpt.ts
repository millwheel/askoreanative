export function makeExcerpt(text: string, maxLen = 140) {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1) + "…";
}
