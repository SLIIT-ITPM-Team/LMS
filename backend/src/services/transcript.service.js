const { getSubtitles } = require('youtube-captions-scraper');

/**
 * Extract transcript from YouTube video using youtube-captions-scraper.
 * @param {string} videoUrl - YouTube video URL
 * @returns {Promise<string>} - Concatenated transcript text
 */
async function extractTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    // Fetch subtitles/captions from YouTube
    const captions = await getSubtitles({ videoID: videoId });

    if (!captions || captions.length === 0) {
      throw new Error('No captions available for this video');
    }

    // Concatenate all caption text
    const transcriptText = captions
      .map((caption) => (caption?.text || '').trim())
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!transcriptText) {
      throw new Error('No captions available for this video');
    }

    return transcriptText;
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();

    if (
      message.includes('could not retrieve') ||
      message.includes('disabled') ||
      message.includes('not available') ||
      message.includes('no transcript') ||
      message.includes('no captions') ||
      message.includes('error getting captions')
    ) {
      throw new Error('No captions available for this video');
    }

    console.error('Transcript extraction error:', error);
    throw new Error('Failed to extract transcript');
  }
}

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Video ID or null if invalid
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  return null;
}

module.exports = {
  extractTranscript,
};