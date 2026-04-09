const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middlewares/auth.middleware');
const quizController = require('../controllers/quiz.controller');

if (!fs.existsSync(quizController.uploadsDir)) {
  fs.mkdirSync(quizController.uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, quizController.uploadsDir);
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

router.post('/upload', upload.single('pdf'), quizController.createQuizFromPdf);
router.post('/from-summary', quizController.createQuizFromSummary);
router.post('/creative', quizController.createCreativeQuiz);
router.post('/creative-pdf', upload.single('pdf'), quizController.createCreativeQuizFromPdf);
router.get('/', quizController.getAllQuizzes);
router.put('/:id', protect, authorize('admin'), quizController.updateQuiz);
router.get('/:id', quizController.getQuizById);
router.get('/:id/questions', quizController.getQuizQuestions);
router.post('/:id/attempt', quizController.attemptQuiz);
router.get('/:id/stats/:userEmail', quizController.getPerQuizUserStats);
router.get('/stats/:userEmail', quizController.getUserOverallStats);
router.delete('/:id', protect, authorize('admin'), quizController.deleteQuiz);

module.exports = router;
