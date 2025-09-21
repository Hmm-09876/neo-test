export function splitTextPreserveWords(text = '', maxLen = 5000) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const chunks = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLen) {
      if (!cur) {
        chunks.push(w.slice(0, maxLen));
        cur = w.slice(maxLen);
      } else {
        chunks.push(cur);
        cur = w;
      }
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}
