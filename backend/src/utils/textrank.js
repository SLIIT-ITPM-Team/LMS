/**
 * TextRank Algorithm Implementation for Extractive Summarization
 */

/**
 * Tokenize text into sentences
 * @param {string} text - Input text
 * @returns {string[]} - Array of sentences
 */
function tokenizeSentences(text) {
  // Split by sentence endings (period, exclamation mark, question mark)
  // followed by whitespace or end of string
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
  
  return sentences;
}

/**
 * Tokenize sentence into words
 * @param {string} sentence - Input sentence
 * @returns {string[]} - Array of words
 */
function tokenizeWords(sentence) {
  // Remove punctuation and convert to lowercase
  return sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
}

/**
 * Calculate similarity between two sentences
 * @param {string[]} sentence1 - First sentence tokens
 * @param {string[]} sentence2 - Second sentence tokens
 * @returns {number} - Similarity score
 */
function calculateSimilarity(sentence1, sentence2) {
  if (sentence1.length === 0 || sentence2.length === 0) {
    return 0;
  }

  // Find common words
  const commonWords = sentence1.filter(word => sentence2.includes(word));
  
  if (commonWords.length === 0) {
    return 0;
  }

  // Calculate similarity using Jaccard coefficient
  const union = new Set([...sentence1, ...sentence2]);
  const similarity = commonWords.length / union.size;
  
  return similarity;
}

/**
 * Calculate sentence scores using TextRank algorithm
 * @param {string[]} sentences - Array of sentences
 * @returns {number[]} - Array of sentence scores
 */
function calculateSentenceScores(sentences) {
  const n = sentences.length;
  const scores = new Array(n).fill(1.0);
  const tokenizedSentences = sentences.map(tokenizeWords);
  
  // Iterative scoring (PageRank-like algorithm)
  const dampingFactor = 0.85;
  const maxIterations = 50;
  const tolerance = 1e-4;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const newScores = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      let score = 0;
      
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const similarity = calculateSimilarity(tokenizedSentences[i], tokenizedSentences[j]);
          if (similarity > 0) {
            score += similarity * scores[j];
          }
        }
      }
      
      newScores[i] = (1 - dampingFactor) + dampingFactor * score;
    }
    
    // Check for convergence
    const diff = Math.max(...newScores.map((score, i) => Math.abs(score - scores[i])));
    if (diff < tolerance) {
      break;
    }
    
    scores.splice(0, n, ...newScores);
  }
  
  return scores;
}

/**
 * Generate summary using TextRank algorithm
 * @param {string} text - Input text
 * @param {number} maxWords - Maximum number of words in summary (default: 500)
 * @returns {string} - Generated summary
 */
function generateSummary(text, maxWords = 500) {
  if (!text || text.trim().length === 0) {
    return '';
  }

  const sentences = tokenizeSentences(text);
  
  if (sentences.length === 0) {
    return '';
  }

  // Calculate scores for each sentence
  const scores = calculateSentenceScores(sentences);
  
  // Create sentence-score pairs and sort by score
  const sentenceScores = sentences.map((sentence, index) => ({
    sentence,
    score: scores[index],
    index
  }));
  
  sentenceScores.sort((a, b) => b.score - a.score);
  
  // Select top sentences until we reach maxWords limit
  let summary = '';
  let wordCount = 0;
  const selectedIndices = new Set();
  
  for (const { sentence, index } of sentenceScores) {
    const sentenceWordCount = tokenizeWords(sentence).length;
    
    if (wordCount + sentenceWordCount <= maxWords) {
      selectedIndices.add(index);
      wordCount += sentenceWordCount;
    }
    
    if (wordCount >= maxWords) {
      break;
    }
  }
  
  // Sort selected sentences by their original order
  const selectedSentences = sentenceScores
    .filter(({ index }) => selectedIndices.has(index))
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence);
  
  summary = selectedSentences.join(' ');
  
  return summary;
}

module.exports = {
  tokenizeSentences,
  tokenizeWords,
  calculateSimilarity,
  calculateSentenceScores,
  generateSummary
};