/**
 * Simple extractive summarizer: take the first few non-empty sentences.
 * Keeps dependency-light and predictable for server-side usage.
 */
const splitIntoSentences = (text = '') =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence && sentence.length > 2);

export const summarizeText = (text = '', maxSentences = 3) => {
  if (!text) return 'No text available for summarization.';

  const sentences = splitIntoSentences(text);
  if (!sentences.length) return 'No text available for summarization.';

  return sentences.slice(0, maxSentences).join(' ');
};

export default summarizeText;
