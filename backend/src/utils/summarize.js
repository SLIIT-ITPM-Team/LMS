function summarizeText(text, sentenceCount = 6) {
  if (!text || typeof text !== 'string') return '';

  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (!sentences.length) return normalized;

  return sentences.slice(0, Math.max(1, sentenceCount)).join(' ');
}

module.exports = { summarizeText };
