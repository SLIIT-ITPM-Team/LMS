const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');

const Quiz = require('../models/Quiz');
const { summarizeText } = require('../utils/summarize');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'), false);
    }
    return cb(null, true);
  }
});

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'that', 'with', 'this', 'from', 'into', 'your', 'have', 'has', 'had', 'were',
  'was', 'their', 'there', 'about', 'which', 'when', 'where', 'while', 'will', 'would', 'could', 'should',
  'what', 'how', 'why', 'who', 'whose', 'whom', 'been', 'being', 'also', 'than', 'then', 'them', 'they',
  'you', 'our', 'out', 'not', 'only', 'some', 'many', 'more', 'most', 'very', 'such', 'over', 'under',
  'each', 'other', 'through', 'between', 'during', 'before', 'after', 'because', 'these', 'those', 'its',
  'can', 'may', 'might', 'shall', 'per', 'any', 'all', 'both', 'few', 'own', 'same', 'too', 'just', 'like',
  'than', 'via', 'use', 'used', 'using', 'based', 'within'
]);

function ensureDatabaseConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database is not connected.' });
    return false;
  }
  return true;
}

function normalizeSummary(summary) {
  return String(summary || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(summary) {
  return normalizeSummary(summary)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractKeywords(text, limit = 24) {
  const tokens = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOP_WORDS.has(token));

  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}

function toTitleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function createQuizTitle(summary, keywords) {
  const firstSentence = splitSentences(summary)[0] || '';
  const heading = firstSentence.length > 64 ? `${firstSentence.slice(0, 61)}...` : firstSentence;

  if (heading) {
    return `Quiz: ${heading}`;
  }

  if (keywords.length >= 2) {
    return `Quiz: ${toTitleCase(keywords[0])} and ${toTitleCase(keywords[1])}`;
  }

  return 'Quiz: Topic Understanding';
}

function cleanFragment(value, fallback = 'the topic') {
  const cleaned = String(value || '')
    .replace(/[\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return fallback;
  if (cleaned.length <= 88) return cleaned;
  return `${cleaned.slice(0, 85)}...`;
}

function makeDistractors(correctAnswer, keywords, sentences) {
  const lowerCorrect = String(correctAnswer || '').toLowerCase();
  const sentenceFragments = sentences
    .map((sentence) => cleanFragment(sentence))
    .filter((fragment) => fragment.toLowerCase() !== lowerCorrect)
    .slice(0, 8);

  const keywordOptions = keywords
    .map((keyword) => `Focuses on ${toTitleCase(keyword)} only`)
    .filter((value) => value.toLowerCase() !== lowerCorrect);

  const generic = [
    'Not discussed in the summary',
    'An unrelated interpretation',
    'The opposite of the main point',
    'A detail from a different topic'
  ];

  const pool = [...sentenceFragments, ...keywordOptions, ...generic];
  const unique = [];

  for (const item of pool) {
    if (!item) continue;
    const exists = unique.some((entry) => entry.toLowerCase() === item.toLowerCase());
    if (!exists) unique.push(item);
    if (unique.length >= 8) break;
  }

  return unique.slice(0, 3);
}

function shuffled(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[random]] = [copy[random], copy[index]];
  }
  return copy;
}

function buildQuestion(seed, type, difficulty, index, keywords) {
  const keyA = keywords[index % keywords.length] || 'the subject';
  const keyB = keywords[(index + 3) % keywords.length] || 'the concept';
  const base = cleanFragment(seed, 'The summary describes an important concept.');

  if (type === 'fact') {
    return {
      questionText: `Which statement best matches the summary about ${toTitleCase(keyA)}?`,
      correctAnswer: base
    };
  }

  if (type === 'concept') {
    return {
      questionText: `What is the primary idea connected to ${toTitleCase(keyA)} in the summary?`,
      correctAnswer: base
    };
  }

  if (type === 'inference') {
    return {
      questionText: `Based on the summary, what can be inferred about ${toTitleCase(keyA)} and ${toTitleCase(keyB)}?`,
      correctAnswer: base
    };
  }

  if (type === 'application') {
    return {
      questionText: `In a practical scenario, how should ${toTitleCase(keyA)} be applied according to the summary?`,
      correctAnswer: base
    };
  }

  const isTrue = index % 2 === 0;
  return {
    questionText: `True or False: ${base}`,
    correctAnswer: isTrue ? 'True' : 'False'
  };
}

function createContextualQuestions(summary, count = 10) {
  const normalized = normalizeSummary(summary);
  const sentences = splitSentences(normalized);

  if (!normalized || normalized.length < 60 || sentences.length < 3) {
    throw new Error('Summary must contain at least three meaningful sentences for quiz generation.');
  }

  const keywords = extractKeywords(normalized);
  if (!keywords.length) {
    throw new Error('Failed to extract enough context from summary. Please provide richer content.');
  }

  const typePattern = ['fact', 'concept', 'inference', 'application', 'true_false'];
  const difficultyPattern = ['easy', 'easy', 'medium', 'medium', 'hard'];

  const questions = [];
  for (let index = 0; index < count; index += 1) {
    const sentenceSeed = sentences[index % sentences.length];
    const type = typePattern[index % typePattern.length];
    const difficulty = difficultyPattern[index % difficultyPattern.length];
    const core = buildQuestion(sentenceSeed, type, difficulty, index, keywords);

    const rawCorrect = cleanFragment(core.correctAnswer);
    const rawDistractors = makeDistractors(rawCorrect, keywords, shuffled(sentences));

    while (rawDistractors.length < 3) {
      rawDistractors.push(`Related to ${toTitleCase(keywords[(index + rawDistractors.length) % keywords.length])}`);
    }

    const optionObjects = shuffled([
      { text: rawCorrect, isCorrect: true },
      ...rawDistractors.slice(0, 3).map((text) => ({ text: cleanFragment(text), isCorrect: false }))
    ]);

    questions.push({
      type,
      difficulty,
      questionText: core.questionText,
      options: optionObjects,
      correctAnswer: rawCorrect
    });
  }

  if (questions.length !== 10) {
    throw new Error('Failed to generate exactly 10 questions.');
  }

  return questions;
}

function resolveSelectedAnswer(question, answerPayload) {
  const getOptionText = (option) => {
    if (typeof option === 'string') return option;
    if (option && typeof option === 'object' && typeof option.text === 'string') return option.text;
    return '';
  };

  if (typeof answerPayload === 'number') {
    const option = question.options[answerPayload];
    return getOptionText(option);
  }

  if (typeof answerPayload === 'string') {
    return answerPayload.trim();
  }

  if (answerPayload && typeof answerPayload === 'object') {
    if (typeof answerPayload.text === 'string') {
      return answerPayload.text.trim();
    }

    if (typeof answerPayload.selectedAnswer === 'string') {
      return answerPayload.selectedAnswer.trim();
    }

    if (typeof answerPayload.index === 'number') {
      const option = question.options[answerPayload.index];
      return getOptionText(option);
    }
  }

  return '';
}

function createCertificateId(userEmail, quizId, attemptNumber) {
  const emailPart = String(userEmail || 'user').split('@')[0].slice(0, 6).toUpperCase();
  const quizPart = String(quizId || '').slice(-6).toUpperCase();
  const sequence = String(attemptNumber).padStart(3, '0');
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `LMS-${datePart}-${quizPart}-${emailPart}-${sequence}`;
}

function sanitizeQuestionsForClient(questions) {
  const getOptionText = (option) => {
    if (typeof option === 'string') return option;
    if (option && typeof option === 'object' && typeof option.text === 'string') return option.text;
    return '';
  };

  return questions.map((question, index) => ({
    questionNumber: index + 1,
    questionText: question.questionText,
    type: question.type,
    difficulty: question.difficulty,
    options: question.options.map((option) => getOptionText(option)).filter(Boolean)
  }));
}

// Create quiz from uploaded PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const parsedPdf = await pdfParse(dataBuffer);
    const rawText = normalizeSummary(parsedPdf.text);

    if (!rawText) {
      return res.status(400).json({ success: false, message: 'Unable to extract text from the uploaded PDF.' });
    }

    const summary = summarizeText(rawText, 7);
    const keywords = extractKeywords(summary);
    const questions = createContextualQuestions(summary, 10);

    const quiz = await Quiz.create({
      title: createQuizTitle(summary, keywords),
      summary,
      questions
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz generated from PDF successfully.',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        summary: quiz.summary,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz from PDF.'
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
});

// Create quiz directly from summary
router.post('/from-summary', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const summary = normalizeSummary(req.body.summary);
    if (!summary) {
      return res.status(400).json({ success: false, message: 'Summary is required.' });
    }

    if (summary.length < 60) {
      return res.status(400).json({
        success: false,
        message: 'Summary is too short. Please provide more context for meaningful question generation.'
      });
    }

    const keywords = extractKeywords(summary);
    const questions = createContextualQuestions(summary, 10);

    const quiz = await Quiz.create({
      title: createQuizTitle(summary, keywords),
      summary,
      questions
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz generated successfully.',
      quiz,
      _id: quiz._id,
      title: quiz.title,
      summary: quiz.summary,
      questions: quiz.questions,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Question generation failed.'
    });
  }
});

// Get all quiz metadata
router.get('/', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .select('_id title summary questions totalAttempts totalPasses createdAt updatedAt');

    return res.status(200).json({
      success: true,
      quizzes: quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        summary: quiz.summary,
        summaryPreview: quiz.summary.slice(0, 180),
        questionCount: quiz.questions.length,
        totalAttempts: quiz.totalAttempts,
        totalPasses: quiz.totalPasses,
        createdAt: quiz.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch quizzes.' });
  }
});

// Get one quiz with full details
router.get('/:id', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch quiz.' });
  }
});

// Get safe question payload for attempts
router.get('/:id/questions', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const quiz = await Quiz.findById(req.params.id).select('title summary questions createdAt');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    return res.status(200).json({
      success: true,
      quizId: quiz._id,
      title: quiz.title,
      summary: quiz.summary,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt,
      questions: sanitizeQuestionsForClient(quiz.questions)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load questions.' });
  }
});

// Evaluate and persist a quiz attempt
router.post('/:id/attempt', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const userEmail = String(req.body.userEmail || '').trim().toLowerCase();
    const answers = req.body.answers;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
      return res.status(400).json({ success: false, message: 'Answers payload is required.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const perUserPreviousAttempts = quiz.attempts.filter((attempt) => attempt.userEmail === userEmail).length;
    const attemptNumber = perUserPreviousAttempts + 1;

    const evaluatedAnswers = quiz.questions.map((question, index) => {
      const payload = Array.isArray(answers) ? answers[index] : answers[index + 1] ?? answers[String(index + 1)] ?? answers[index] ?? answers[String(index)];
      const selectedAnswer = resolveSelectedAnswer(question, payload);
      const isCorrect = selectedAnswer.toLowerCase() === String(question.correctAnswer || '').toLowerCase();

      return {
        questionNumber: index + 1,
        questionText: question.questionText,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const correctCount = evaluatedAnswers.filter((item) => item.isCorrect).length;
    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = scorePercentage >= 60;
    const certificateId = passed ? createCertificateId(userEmail, quiz._id, attemptNumber) : null;

    quiz.attempts.push({
      userEmail,
      scorePercentage,
      correctCount,
      passed,
      attemptNumber,
      answers: evaluatedAnswers,
      certificateId
    });

    quiz.totalAttempts += 1;
    if (passed) quiz.totalPasses += 1;

    await quiz.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz evaluated successfully.',
      result: {
        quizId: quiz._id,
        title: quiz.title,
        userEmail,
        attemptNumber,
        scorePercentage,
        correctCount,
        totalQuestions: quiz.questions.length,
        passed,
        certificate: passed
          ? {
              certificateId,
              issuedAt: new Date().toISOString()
            }
          : null,
        answers: evaluatedAnswers
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to evaluate quiz attempt.' });
  }
});

// Per-quiz user stats
router.get('/:id/stats/:userEmail', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const userEmail = String(req.params.userEmail || '').trim().toLowerCase();
    const quiz = await Quiz.findById(req.params.id).select('title attempts');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const attempts = quiz.attempts.filter((attempt) => attempt.userEmail === userEmail);
    const passedAttempts = attempts.filter((attempt) => attempt.passed).length;
    const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => attempt.scorePercentage)) : 0;

    const averageScore = attempts.length
      ? Math.round(attempts.reduce((total, attempt) => total + attempt.scorePercentage, 0) / attempts.length)
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        quizId: quiz._id,
        title: quiz.title,
        userEmail,
        totalAttempts: attempts.length,
        passCount: passedAttempts,
        failCount: attempts.length - passedAttempts,
        bestScore,
        averageScore
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch quiz stats.' });
  }
});

// Overall user stats across all quizzes
router.get('/stats/:userEmail', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const userEmail = String(req.params.userEmail || '').trim().toLowerCase();
    const quizzes = await Quiz.find().select('title attempts');

    const perQuiz = [];
    let totalAttempts = 0;
    let totalPasses = 0;

    for (const quiz of quizzes) {
      const attempts = quiz.attempts.filter((attempt) => attempt.userEmail === userEmail);
      if (!attempts.length) continue;

      const passCount = attempts.filter((attempt) => attempt.passed).length;
      const bestScore = Math.max(...attempts.map((attempt) => attempt.scorePercentage));

      totalAttempts += attempts.length;
      totalPasses += passCount;

      perQuiz.push({
        quizId: quiz._id,
        title: quiz.title,
        attempts: attempts.length,
        passCount,
        bestScore,
        latestAttemptAt: attempts[attempts.length - 1].createdAt
      });
    }

    return res.status(200).json({
      success: true,
      userEmail,
      totalAttempts,
      totalPasses,
      totalFails: totalAttempts - totalPasses,
      passRate: totalAttempts ? Math.round((totalPasses / totalAttempts) * 100) : 0,
      perQuiz
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch user stats.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ensureDatabaseConnected(res)) return;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    await Quiz.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete quiz.' });
  }
});

module.exports = router;
