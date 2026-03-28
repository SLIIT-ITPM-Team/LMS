const { generateSummary } = require('../utils/textrank');

/**
 * Generate summary from text using TextRank algorithm
 * @param {string} text - Input text to summarize
 * @param {number} maxWords - Maximum number of words (default: 500)
 * @returns {string} - Generated summary
 */
function generateTextRankSummary(text, maxWords = 500) {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text is required for summarization');
  }

  try {
    const summary = generateSummary(text, maxWords);
    
    if (!summary || summary.trim().length === 0) {
      throw new Error('Unable to generate summary from the provided text');
    }

    return summary;
  } catch (error) {
    console.error('Summarization error:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

/**
 * Validate summary quality
 * @param {string} originalText - Original text
 * @param {string} summary - Generated summary
 * @returns {Object} - Validation result
 */
function validateSummary(originalText, summary) {
  const originalWords = originalText.split(/\s+/).length;
  const summaryWords = summary.split(/\s+/).length;
  const compressionRatio = summaryWords / originalWords;

  return {
    originalWordCount: originalWords,
    summaryWordCount: summaryWords,
    compressionRatio: compressionRatio,
    isValid: summaryWords > 0 && compressionRatio <= 1,
    quality: compressionRatio < 0.5 ? 'good' : 'fair'
  };
}

/**
 * Process and validate summary
 * @param {string} text - Input text
 * @param {number} maxWords - Maximum words for summary
 * @returns {Object} - Processed summary with validation
 */
function processSummary(text, maxWords = 500) {
  const summary = generateTextRankSummary(text, maxWords);
  const validation = validateSummary(text, summary);

  return {
    summary,
    validation,
    metadata: {
      maxWords,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  generateTextRankSummary,
  validateSummary,
  processSummary
};