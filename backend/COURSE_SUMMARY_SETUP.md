# Course Summary Auto-Generation Guide

## System Overview

The LMS now automatically generates and stores course summaries using the following flow:

1. **Transcript Extraction** (Free)
   - Uses `youtube-captions-scraper` to extract captions from YouTube videos
   - Falls back to manual transcript if video has no captions

2. **Summary Generation** (Free)
   - Uses TextRank algorithm to generate summaries from transcripts
   - Compresses transcript to ~50% while maintaining key content

3. **PDF Generation**
   - Creates downloadable PDF summary for each course

## How to Use

### Option 1: Create New Course with Auto-Summary (Recommended)

1. Go to Admin → Manage Courses → Add New Course
2. Fill in course details:
   - Department
   - Module
   - Course Title
   - YouTube Video URL (must have captions enabled)
   
3. Optional: Add Manual Transcript
   - If video has no captions, paste the transcript in the "Manual Transcript" field
   - System will auto-generate summary from it

4. Click "Create Course"
   - Summary will be extracted and generated automatically
   - You'll see warnings if transcript wasn't available

### Option 2: Regenerate Existing Course Summaries

#### For a Single Course:
1. Go to Admin → Manage Courses
2. Click Edit on a course
3. Update the Manual Transcript field (if needed)
4. Check "Regenerate transcript from video" (if video has captions)
5. Check "Regenerate summary from transcript"
6. Click Update

#### For All Courses at Once (Migration):
```bash
cd backend
node src/scripts/regenerateSummaries.js
```

This script will:
- Find all courses in the database
- Try to extract real transcripts from YouTube videos
- Generate summaries from transcripts
- Skip courses that already have valid summaries
- Report which courses couldn't be processed (no captions available)

### Option 3: Manually Add Transcript for Videos Without Captions

1. Identify courses where "Summary Not Available" message appears
2. Obtain the video transcript (options):
   - YouTube auto-generated captions (copy from video)
   - Manual transcription
   - Third-party transcript services
   
3. Go to Admin → Manage Courses → Edit course
4. Paste transcript in "Manual Transcript" field
5. Check "Regenerate summary from transcript"
6. Click Update → Summary will generate from your transcript

## Workflow for Students

1. Go to Courses → Select a course
2. Click "Summary" tab
3. View auto-generated summary
4. Options:
   - Copy Text: Copy summary to clipboard
   - Download PDF: Download summary as PDF
   - Read Transcript: View full transcript in "Transcript" tab

## Transcript Not Available?

If you see "Summary Not Available" message:

**Reason:** The video has no captions enabled on YouTube

**Solutions:**
1. Add English captions to the YouTube video (if you own it)
2. Enable auto-generated captions on YouTube
3. Provide manual transcript in course edit form

## Technical Details

### Dependencies
- `youtube-captions-scraper`: Free caption extraction
- `textrank`: Free TextRank summarization algorithm
- `pdfkit`: Free PDF generation

### Database Fields
- `transcriptText`: Full video transcript (max 50KB)
- `summaryText`: Generated summary (max 10KB)
- `summaryPdfUrl`: Path to generated PDF

### API Endpoints

#### Create Course
```
POST /api/courses
{
  "moduleId": "...",
  "title": "...",
  "videoUrl": "https://youtube.com/watch?v=...",
  "manualTranscriptText": "..." (optional)
}
```

Response includes `warnings` array if transcript extraction failed.

#### Update Course
```
PUT /api/courses/:id
{
  "title": "...",
  "videoUrl": "...",
  "manualTranscriptText": "..." (optional),
  "regenerateTranscript": true,
  "regenerateSummary": true
}
```

#### Get Course
```
GET /api/courses/:id
```

Returns course with populated `transcriptText` and `summaryText`.

## Troubleshooting

### "No captions available for this video"
- The video doesn't have captions enabled on YouTube
- Add manual transcript in course edit form

### "Summary generation failed"
- Usually temporary network issue
- Try regenerating again
- Check browser console for detailed error

### "PDF generation failed"
- Summary is still saved, only PDF failed
- Try regenerating PDF again

### Transcript extraction very slow
- YouTube might be rate-limiting
- Wait a few minutes before trying again

## Performance Notes

- **First time setup**: ~1-2 minutes per course (includes all processing)
- **Transcript extraction**: 2-30 seconds per video (depends on caption length)
- **Summary generation**: 1-3 seconds per transcript
- **PDF generation**: 1-2 seconds per document

## Migration Checklist

- [ ] Install packages: `npm install` (already done)
- [ ] Test transcript extraction: `node src/scripts/testTranscriptExtraction.js`
- [ ] Run migration on existing courses: `node src/scripts/regenerateSummaries.js`
- [ ] Verify summaries appear in course view
- [ ] Test creating new course with auto-summary
- [ ] Test manual transcript upload
- [ ] Test PDF download

## Support

If summaries aren't generating:

1. Check browser console for error messages
2. Check MongoDB that transcript/summary fields are populated
3. Verify youtube-captions-scraper is installed: `npm list youtube-captions-scraper`
4. Try with a video that definitely has captions
5. Check backend logs for errors
