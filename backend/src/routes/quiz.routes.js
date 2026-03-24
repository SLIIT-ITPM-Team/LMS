const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');

const Quiz = require('../models/Quiz');
const { summarizeText } = require('../utils/summarize');
const { generateQuizQuestions } = require('../utils/quizGenerator');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please check backend MongoDB connection and try again.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(dataBuffer);
    const text = (parsed.text || '').trim();

    if (!text) {
      return res.status(400).json({ message: 'Unable to extract text from PDF.' });
    }

    const summary = summarizeText(text, 6);
    const questions = generateQuizQuestions(summary, 10);

    if (questions.length !== 10) {
      return res.status(500).json({ message: 'Quiz generation failed to create 10 questions.' });
    }

    const newQuiz = new Quiz({
      summary,
      questions
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
      }
    }
  }
});

router.post('/from-summary', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please check backend MongoDB connection and try again.' });
    }

    const summary = (req.body.summary || '').trim();
    if (!summary) {
      return res.status(400).json({ message: 'Summary is required.' });
    }

    const questions = generateQuizQuestions(summary, 10);

    if (questions.length !== 10) {
      return res.status(500).json({ message: 'Quiz generation failed to create 10 questions.' });
    }

    const newQuiz = new Quiz({
      summary,
      questions
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ uploadedAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/summary', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('summary');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ summary: quiz.summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/questions', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ name: 'Summary Quiz', questions: quiz.questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

module.exports = router;
