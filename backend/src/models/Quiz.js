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
    questionText: { type: String, required: true },
    options: { type: [optionSchema], required: true },
    correctAnswer: { type: String, required: true }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true
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
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
