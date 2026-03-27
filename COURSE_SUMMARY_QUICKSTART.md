# Quick Start: Auto-Generate Course Summaries

## What Was Implemented

✅ **Real Transcript Extraction**
   - Uses `youtube-captions-scraper` to extract YouTube captions
   - Free, no API key needed

✅ **Automatic Summary Generation**
   - Uses TextRank algorithm (free, extractive summarization)
   - ~50% compression ratio while retaining key content

✅ **Database Storage**
   - All transcripts and summaries are stored in MongoDB
   - PDF summaries can be generated and downloaded

✅ **Manual Transcript Support**
   - For videos without captions, admins can paste transcript
   - System auto-generates summary from manual transcript

✅ **Migration Tools**
   - Script to regenerate all existing course summaries
   - Handles missing captions gracefully

---

## How to Use NOW

### Step 1: Verify Installation (Optional)
```bash
cd backend
npm list youtube-captions-scraper
# Should show: youtube-captions-scraper@2.0.0 (or similar)
```

### Step 2: Regenerate Existing Courses

Run this to update all courses in the database with real summaries:

```bash
cd backend
node src/scripts/regenerateSummaries.js
```

**What it does:**
- Finds all courses in MongoDB
- Tries to extract real transcript from each video
- Generates summary from transcript
- Stores both in database
- Reports results (updated, failed, skipped)

**Expected output:**
```
MIGRATION COMPLETE
==================================================
✓ Updated:               X courses
⚠ No captions available: Y courses  
✗ Failed:                Z courses
- Valid/Skipped:         W courses
⊕ Total:                 (sum)
```

### Step 3: Create New Courses with Auto-Summary

**In Admin Panel:**

1. Go: Admin → Manage Courses → Add New Course
2. Fill form:
   - Department, Module, Title
   - YouTube URL (with captions recommended)
3. **Optional**: Scroll down, paste transcript in "Manual Transcript" field
4. Click "Create Course"
5. **Done!** Summary stored automatically in database

### Step 4: View Summaries

**For Students:**
- Go: Courses → Select Course → Click "Summary" tab
- Copy text or download PDF

**In Admin:**
- Go: Admin → Manage Courses → Click "View"
- Click "Summary" tab
- Edit button lets you update transcript

---

## For Videos WITHOUT Captions

If migration reports "No captions available":

1. **Option A**: Add English captions to YouTube video (if you own it)

2. **Option B**: Provide manual transcript
   - Go: Admin → Manage Courses → Edit Course
   - Paste transcript in "Manual Transcript" field
   - Check "Regenerate summary from transcript"
   - Click Update
   - Done! Summary generates from your transcript

3. **Option C**: Transcript service
   - Use services like: Rev, Otter.ai, or Google Docs auto-transcribe
   - Copy transcript → paste in course edit form

---

## What Gets Stored in Database

For **each course**, the database now stores:

```javascript
{
  _id: ObjectID,
  title: "Course Name",
  videoUrl: "https://youtube.com/...",
  moduleId: ObjectID,
  
  // NEW - Automatically populated:
  transcriptText: "Full transcript text from YouTube...",
  summaryText: "Auto-generated summary using TextRank...",
  summaryPdfUrl: "/path/to/summary.pdf",
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Summary Not Available" message | Video has no YouTube captions. Add manual transcript in edit form. |
| Transcript says "sample" text | Run migration script to regenerate: `node src/scripts/regenerateSummaries.js` |
| Migration reports failed courses | Those videos don't have captions. Use manual transcript option. |
| No captions on YouTube video | Add English captions in YouTube video settings (if you own it). |
| Slow transcript extraction | YouTube might be rate-limiting. Wait 5 mins and retry. |

---

## Commands Reference

```bash
# Check installation
npm list youtube-captions-scraper

# Regenerate all existing course summaries
node src/scripts/regenerateSummaries.js

# Test transcript extraction (optional)
node src/scripts/testTranscriptExtraction.js

# Restart dev server (usually needed after npm installs)
npm run dev
```

---

## System Architecture

```
New Video Added
    ↓
[Transcript Extraction]
  - Try YouTube captions
  - Fall back to manual transcript
    ↓
[Summary Generation]
  - TextRank algorithm
  - ~50% compression
    ↓
[Store in MongoDB]
  - transcriptText
  - summaryText
  - summaryPdfUrl
    ↓
[Display to Users]
  - View summary tab
  - Copy or download PDF
```

---

## Next Steps

1. **NOW**: Run the migration script
   ```bash
   cd backend && node src/scripts/regenerateSummaries.js
   ```

2. **Test**: Create a new course via admin UI

3. **Verify**: Check course detail page → Summary tab

4. **For each video without captions**: Add manual transcript in edit form

---

## Success Criteria

- ✅ Database has actual summaries (not sample text)
- ✅ New courses auto-generate summaries
- ✅ Students can view/download summaries
- ✅ Admin can manually add transcripts for missing captions

---

If issues persist, check:
- MongoDB is running
- Backend .env has correct MONGO_URI
- `youtube-captions-scraper` is installed
- Network connection to YouTube (for caption access)
