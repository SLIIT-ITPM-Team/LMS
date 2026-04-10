/**
 * Transcript extraction using YouTube's InnerTube API directly.
 * No third-party library — uses the same endpoint YouTube apps call internally.
 */

const INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
    hl: 'en',
  },
};
// ANDROID client requires the matching app User-Agent to return playable content
const USER_AGENT = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract YouTube video ID from any YouTube URL format.
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^#&?]{11})/,
    /[?&]v=([^#&?]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/**
 * Decode XML/HTML entities and strip remaining tags.
 */
function decodeXml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/<[^>]+>/g, ' ');
}

/**
 * Parse YouTube caption XML into plain text.
 * Handles both <text> (older) and <p><s> (newer) formats.
 */
function parseCaptionXml(xml) {
  const texts = [];

  // Newer transcript format: <p t="..." d="..."><s>text</s></p>
  const pTagRe = /<p\s[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pTagRe.exec(xml)) !== null) {
    const inner = m[1];
    const sTexts = [];
    const sTagRe = /<s[^>]*>([^<]*)<\/s>/g;
    let sm;
    while ((sm = sTagRe.exec(inner)) !== null) sTexts.push(sm[1]);
    const text = sTexts.length ? sTexts.join('') : inner.replace(/<[^>]+>/g, '');
    const clean = decodeXml(text).trim();
    if (clean) texts.push(clean);
  }

  // Older format: <text start="..." dur="...">text</text>
  if (texts.length === 0) {
    const textTagRe = /<text[^>]*>([^<]*)<\/text>/g;
    while ((m = textTagRe.exec(xml)) !== null) {
      const clean = decodeXml(m[1]).trim();
      if (clean) texts.push(clean);
    }
  }

  return texts.join(' ');
}

/**
 * Remove caption noise: [Music], (applause), excessive spaces.
 */
function cleanTranscript(raw) {
  return raw
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------

/**
 * Fetch caption tracks for a video via the InnerTube API.
 * Returns array of { languageCode, baseUrl, name } objects.
 */
async function fetchCaptionTracks(videoId) {
  const body = JSON.stringify({ context: INNERTUBE_CONTEXT, videoId });

  const res = await fetch(INNERTUBE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
    },
    body,
  });

  if (!res.ok) throw new Error(`InnerTube request failed: HTTP ${res.status}`);

  const data = await res.json();
  const tracks =
    data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!Array.isArray(tracks) || tracks.length === 0) {
    throw new Error('No caption tracks found for this video');
  }

  return tracks;
}

/**
 * Pick the best caption track (English preferred, then first available).
 */
function pickBestTrack(tracks) {
  return (
    tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') || // manual English
    tracks.find((t) => t.languageCode === 'en') ||                      // auto English
    tracks.find((t) => t.languageCode?.startsWith('en')) ||             // en-GB etc.
    tracks[0]
  );
}

/**
 * Download and parse a single caption track into plain text.
 */
async function fetchTrackText(track) {
  // Force JSON=3 format for the newer p/s XML structure
  const url = track.baseUrl + '&fmt=json3&tlang=en';

  let res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
  });

  // json3 format
  if (res.ok) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      const json = await res.json();
      const events = json?.events || [];
      const parts = events
        .flatMap((e) => (e.segs || []).map((s) => s.utf8 || ''))
        .join(' ')
        .replace(/\n/g, ' ');
      if (parts.trim()) return cleanTranscript(parts);
    }
  }

  // Fallback: fetch the XML format
  res = await fetch(track.baseUrl, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
  });
  if (!res.ok) throw new Error(`Caption download failed: HTTP ${res.status}`);
  const xml = await res.text();
  const text = parseCaptionXml(xml);
  if (!text) throw new Error('Parsed caption XML is empty');
  return cleanTranscript(text);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract the transcript from a YouTube video URL.
 *
 * @param {string} videoUrl - Any valid YouTube video URL
 * @returns {Promise<string>} Clean transcript text
 */
async function extractTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL');

  let tracks;
  try {
    tracks = await fetchCaptionTracks(videoId);
  } catch (err) {
    console.warn('[Transcript] Could not fetch caption tracks:', err.message);
    throw new Error(
      'No captions available for this video. ' +
      'The video may have captions disabled or restricted.'
    );
  }

  const track = pickBestTrack(tracks);
  console.log(
    `[Transcript] Using track: ${track.languageCode} "${track.name?.simpleText || ''}" (${tracks.length} available)`
  );

  const text = await fetchTrackText(track);
  if (!text) throw new Error('Transcript text is empty after parsing');

  console.log(`[Transcript] Extracted ${text.split(' ').length} words`);
  return text;
}

module.exports = { extractTranscript };
