const Groq = require('groq-sdk');
const { generateSummary } = require('../utils/textrank');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Groq model to use. llama-3.3-70b-versatile gives excellent summaries for
 *  free (1,000 RPD / 12,000 TPM on the free tier). */
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/** Max words of transcript we send to the LLM. Keeps token usage reasonable
 *  while still covering most full-length videos. */
const MAX_TRANSCRIPT_WORDS = 10000;

/** System prompt that shapes the summary style. */
const SYSTEM_PROMPT = `You are an expert educational content summarizer for a Learning Management System (LMS).
Your task is to read a YouTube video transcript and produce a well-structured, meaningful summary for students.

Follow this structure strictly:

**Overview**
Write 2–3 sentences describing what the video is about and its main purpose.

**Key Topics Covered**
List 4–8 key topics or concepts discussed in the video as concise bullet points.

**Core Concepts Explained**
Write 2–4 short paragraphs explaining the most important ideas from the video in clear, student-friendly language.

**Key Takeaways**
List 3–5 actionable or memorable takeaways a student should remember after watching.

Rules:
- Write in clear, professional English suitable for university students.
- Do NOT copy sentences verbatim from the transcript — paraphrase and explain.
- Do NOT mention "the transcript" or "the video says" — write directly about the content.
- Aim for 300–450 words total.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate transcript to a safe word count before sending to the LLM. */
function truncateTranscript(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + ' [transcript truncated]';
}

/** TextRank-based extractive summary used as a fallback. */
function textRankFallback(text) {
  const summary = generateSummary(text, 500);
  if (!summary || summary.trim().length === 0) {
    throw new Error('Unable to generate summary from the provided text');
  }
  return summary;
}

// ---------------------------------------------------------------------------
// Groq LLM summarizer
// ---------------------------------------------------------------------------

/**
 * Generate a meaningful, abstractive summary using the Groq LLM API (free tier).
 * Falls back to TextRank if the API key is missing or the call fails.
 *
 * @param {string} transcriptText - Full transcript text
 * @returns {Promise<{summary: string, method: 'groq'|'textrank'}>}
 */
async function generateGroqSummary(transcriptText) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    console.warn('[Summarizer] GROQ_API_KEY not set — falling back to TextRank');
    return { summary: textRankFallback(transcriptText), method: 'textrank' };
  }

  const groq = new Groq({ apiKey });
  const safeTranscript = truncateTranscript(transcriptText, MAX_TRANSCRIPT_WORDS);

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Please summarize the following video transcript:\n\n${safeTranscript}`,
        },
      ],
      temperature: 0.4,   // low temperature = focused, factual summaries
      max_tokens: 1024,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error('Empty response from Groq');

    console.log(`[Summarizer] Groq summary generated (${summary.split(' ').length} words)`);
    return { summary, method: 'groq' };

  } catch (err) {
    console.error('[Summarizer] Groq API error — falling back to TextRank:', err.message);
    return { summary: textRankFallback(transcriptText), method: 'textrank' };
  }
}

// ---------------------------------------------------------------------------
// Public API  (matches the shape the controller already expects)
// ---------------------------------------------------------------------------

/**
 * Process a transcript into a summary.
 * Drop-in replacement for the old processSummary().
 *
 * @param {string} text - Transcript text
 * @param {number} maxWords - Only used by the TextRank fallback path
 * @returns {Promise<{summary: string, validation: object, metadata: object}>}
 */
async function processSummary(text, maxWords = 500) {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text is required for summarization');
  }

  const { summary, method } = await generateGroqSummary(text);

  const originalWords = text.split(/\s+/).length;
  const summaryWords = summary.split(/\s+/).length;

  return {
    summary,
    validation: {
      originalWordCount: originalWords,
      summaryWordCount: summaryWords,
      compressionRatio: summaryWords / originalWords,
      isValid: summaryWords > 0,
      quality: 'good',
      method,
    },
    metadata: {
      maxWords,
      generatedAt: new Date().toISOString(),
      model: method === 'groq' ? GROQ_MODEL : 'textrank',
    },
  };
}

/**
 * Legacy named export kept for any code that imports generateTextRankSummary directly.
 */
function generateTextRankSummary(text, maxWords = 500) {
  return textRankFallback(text);
}

module.exports = { processSummary, generateTextRankSummary };
