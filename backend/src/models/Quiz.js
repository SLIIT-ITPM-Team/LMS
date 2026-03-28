const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['fact', 'concept', 'inference', 'application', 'true_false'],
      default: 'fact'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    questionText: { type: String, required: true },
    options: { type: [optionSchema], required: true },
    correctAnswer: { type: String, required: true }
  },
  { _id: false }
);

const attemptAnswerSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true, min: 1, max: 10 },
    questionText: { type: String, required: true },
    selectedAnswer: { type: String, default: '' },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    scorePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    correctCount: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    passed: { type: Boolean, required: true },
    attemptNumber: { type: Number, required: true, min: 1 },
    answers: {
      type: [attemptAnswerSchema],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length === 10;
        },
        message: 'Each attempt must store exactly 10 evaluated answers.'
      }
    },
    certificateId: { type: String, default: null },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    sourceType: {
      type: String,
      enum: ['summary', 'pdf'],
      default: 'summary'
    },
    sourceDocument: {
      originalName: { type: String, default: '' },
      storedName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      extractedTextLength: { type: Number, default: 0 }
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length === 10;
        },
        message: 'Exactly 10 quiz questions are required.'
      }
    },
    totalAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPasses: {
      type: Number,
      default: 0,
      min: 0
    },
    attempts: {
      type: [attemptSchema],
      default: []
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

quizSchema.index({ 'attempts.userEmail': 1 });
quizSchema.index({ createdAt: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
