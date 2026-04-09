/**
 * Migration script to regenerate course summaries from video transcripts
 * Usage: node src/scripts/regenerateSummaries.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { extractTranscript } = require('../services/transcript.service');
const { processSummary } = require('../services/summarizer.service');
const { generateCoursePDF } = require('../services/pdf.service');

async function isSampleSummary(summary) {
  // Check if it's a sample/placeholder summary
  if (!summary) return false;
  
  const samplePatterns = [
    'this is a sample',
    'demonstration purposes',
    'real implementation',
    'placeholder',
    'mock data',
    'in production'
  ];
  
  return samplePatterns.some(pattern => 
    summary.toLowerCase().includes(pattern)
  );
}

async function regenerateSummaries() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
    console.log('✓ Connected to MongoDB\n');

    // Find all courses
    console.log('Fetching all courses...');
    const courses = await Course.find().populate('moduleId');
    console.log(`✓ Found ${courses.length} courses\n`);

    let updated = 0;
    let failed = 0;
    let skipped = 0;
    let noCaption = 0;

    // Process each course
    for (const course of courses) {
      const progress = `${updated + failed + skipped + noCaption + 1}/${courses.length}`;
      
      try {
        console.log(`[${progress}] Processing: "${course.title}"`);

        // Check if summary is a sample/placeholder
        const isSample = await isSampleSummary(course.summaryText);
        const hasGoodSummary = course.summaryText && course.summaryText.length > 150 && !isSample;

        if (hasGoodSummary) {
          console.log(`  ✓ Skipped - has valid summary (${course.summaryText.length} chars)`);
          skipped++;
          continue;
        }

        // Try to extract transcript from video
        let transcript = course.transcriptText;
        
        if (!transcript) {
          try {
            console.log(`  → Extracting transcript from video...`);
            transcript = await extractTranscript(course.videoUrl);
            console.log(`  ✓ Transcript extracted (${transcript.length} chars)`);
          } catch (error) {
            console.log(`  ⚠ No captions available on YouTube for this video`);
            console.log(`    Video: ${course.videoUrl}`);
            console.log(`    To enable summary: edit course and add manual transcript`);
            noCaption++;
            continue;
          }
        } else {
          console.log(`  ✓ Using existing transcript (${transcript.length} chars)`);
        }

        // Generate summary from transcript
        console.log(`  → Generating summary...`);
        const summaryResult = await processSummary(transcript, 500);
        const summary = summaryResult.summary;
        
        console.log(`  ✓ Summary generated (${summary.length} chars, ${(summaryResult.validation.compressionRatio * 100).toFixed(1)}% compression)`);

        // Generate PDF
        let pdfUrl = course.summaryPdfUrl;
        try {
          console.log(`  → Generating PDF...`);
          const module = course.moduleId;
          const pdfPath = await generateCoursePDF({
            title: course.title,
            moduleName: module?.name || 'Unknown Module',
            department: module?.department || 'Unknown',
            videoUrl: course.videoUrl,
            summaryText: summary
          });
          pdfUrl = pdfPath;
          console.log(`  ✓ PDF generated`);
        } catch (pdfError) {
          console.log(`  ⚠ PDF generation failed (continuing without PDF)`);
        }

        // Update course in database
        course.transcriptText = transcript;
        course.summaryText = summary;
        course.summaryPdfUrl = pdfUrl;
        await course.save();

        console.log(`  ✓ Course updated in database\n`);
        updated++;

      } catch (error) {
        console.log(`  ✗ Error: ${error.message}\n`);
        failed++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('MIGRATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`✓ Updated:               ${updated}`);
    console.log(`⚠ No captions available: ${noCaption}`);
    console.log(`✗ Failed:                ${failed}`);
    console.log(`- Valid/Skipped:         ${skipped}`);
    console.log(`⊕ Total:                 ${courses.length}`);
    console.log('='.repeat(70));

    if (noCaption > 0) {
      console.log(`\nℹ ${noCaption} course(s) need manual transcripts to enable summaries.`);
      console.log('  Solution: Go to admin → Manage Courses → Edit → Add Manual Transcript');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(updated > 0 ? 0 : 1);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run migration
regenerateSummaries();
