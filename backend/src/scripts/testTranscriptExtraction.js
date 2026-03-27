/**
 * Test script to verify transcript extraction and summary generation
 * Usage: node src/scripts/testTranscriptExtraction.js
 */

require('dotenv').config();
const { extractTranscript } = require('../services/transcript.service');
const { processSummary } = require('../services/summarizer.service');

async function testTranscriptExtraction() {
  console.log('Testing Transcript Extraction & Summary Generation\n');

  // Test URLs that should have captions
  const testVideos = [
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo - has captions
    'https://www.youtube.com/watch?v=kFFV0qAEqW0', // TED-Ed sample
  ];

  for (const testVideoUrl of testVideos) {
    try {
      console.log(`Testing with: ${testVideoUrl}\n`);

      // Step 1: Extract transcript
      console.log('Step 1: Extracting transcript...');
      const transcript = await extractTranscript(testVideoUrl);
      console.log(`✓ Transcript extracted successfully!`);
      console.log(`  Length: ${transcript.length} characters`);
      console.log(`  Preview: ${transcript.substring(0, 150)}...\n`);

      // Step 2: Generate summary
      console.log('Step 2: Generating summary...');
      const summaryResult = processSummary(transcript, 500);
      const summary = summaryResult.summary;
      
      console.log(`✓ Summary generated successfully!`);
      console.log(`  Summary length: ${summary.length} characters`);
      console.log(`  Compression ratio: ${(summaryResult.validation.compressionRatio * 100).toFixed(1)}%`);
      console.log(`  Quality: ${summaryResult.validation.quality}`);
      console.log(`  Preview: ${summary.substring(0, 200)}...\n`);

      console.log('✓ Test passed!\n');
      console.log('System is ready. You can now:');
      console.log('1. Create new courses with videos that have captions');
      console.log('2. Run the migration: node src/scripts/regenerateSummaries.js\n');
      process.exit(0);

    } catch (error) {
      console.log(`✗ This video failed: ${error.message}\n`);
      continue;
    }
  }

  // If we get here, all videos failed
  console.error('✗ All test videos failed\n');
  console.error('Troubleshooting:');
  console.error('1. Make sure youtube-captions-scraper is installed correctly:');
  console.error('   npm list youtube-captions-scraper');
  console.error('2. Check your internet connection');
  console.error('3. Try these videos that are known to have captions:');
  console.error('   - https://www.youtube.com/watch?v=jNQXAC9IVRw');
  console.error('   - Search for "educational videos with subtitles"\n');
  
  process.exit(1);
}

testTranscriptExtraction();
