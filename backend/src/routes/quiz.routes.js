// ==============================
//  IMPORT DEPENDENCIES
// ==============================
const express = require('express');
const router = express.Router(); // Router for API endpoints
const multer = require('multer'); // File upload handling
const path = require('path'); // File paths
const fs = require('fs'); // File system operations
const pdfParse = require('pdf-parse'); // PDF text extraction
const mongoose = require('mongoose'); // MongoDB connection

// ==============================
// IMPORT MODEL & UTILITIES
// ==============================
const Quiz = require('../models/Quiz'); // MongoDB model
const { summarizeText } = require('../utils/summarize'); // Summary generator
const { generateQuizQuestions } = require('../utils/quizGenerator'); // Quiz generator

// ==============================
//  FILE UPLOAD CONFIGURATION
// ==============================

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Save location
  },
  filename: function (req, file, cb) {
    // Unique filename using timestamp
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Allow only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Initialize upload middleware
const upload = multer({ storage, fileFilter });


// ==============================
//  POST PART (CREATE QUIZ)
// ==============================

// 📌 Upload PDF → Generate summary + quiz → Save
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected.' });
    }

    // Validate file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read PDF file
    const dataBuffer = fs.readFileSync(req.file.path);

    // Extract text
    const parsed = await pdfParse(dataBuffer);
    const text = (parsed.text || '').trim();

    // Validate extracted text
    if (!text) {
      return res.status(400).json({ message: 'Unable to extract text from PDF.' });
    }

    // Generate summary
    const summary = summarizeText(text, 6);

    // Generate 10 questions
    const questions = generateQuizQuestions(summary, 10);

    // Validate question count
    if (questions.length !== 10) {
      return res.status(500).json({ message: 'Quiz generation failed.' });
    }

    // Save to database
    const newQuiz = new Quiz({ summary, questions });
    const savedQuiz = await newQuiz.save();

    res.status(201).json(savedQuiz);

  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    // Delete uploaded file (cleanup)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
  }
});


// 📌 Generate quiz directly from summary
router.post('/from-summary', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected.' });
    }

    // Get summary from request
    const summary = (req.body.summary || '').trim();

    if (!summary) {
      return res.status(400).json({ message: 'Summary is required.' });
    }

    // Generate questions
    const questions = generateQuizQuestions(summary, 10);

    if (questions.length !== 10) {
      return res.status(500).json({ message: 'Quiz generation failed.' });
    }

    // Save quiz
    const newQuiz = new Quiz({ summary, questions });
    const savedQuiz = await newQuiz.save();

    res.status(201).json(savedQuiz);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// GET PART (READ QUIZ)
// ==============================

// 📌 Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ uploadedAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get only summary
router.get('/:id/summary', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('summary');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({ summary: quiz.summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get only questions
router.get('/:id/questions', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('questions');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    res.json({
      name: 'Summary Quiz',
      questions: quiz.questions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
//  DELETE PART
// ==============================

// 📌 Delete quiz by ID
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    await Quiz.deleteOne({ _id: req.params.id });

    res.json({ message: 'Deleted' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// 🔹 7. EXPORT ROUTER
// ==============================
module.exports = router;