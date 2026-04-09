const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');

const Quiz = require('../models/Quiz');
const { summarizeText } = require('../utils/summarize');
const openAIService = require('../services/openai.service');
const {
	normalizeSummary,
	extractKeywords,
	createContextualQuestions,
	createQuizTitle,
	sanitizeQuestionsForClient,
	evaluateQuizAnswers,
	createCertificateId
} = require('../services/quizgen.service');

const uploadsDir = path.join(__dirname, '..', 'uploads');

function normalizeSummaryText(value) {
	if (typeof normalizeSummary === 'function') {
		return normalizeSummary(value);
	}

	return String(value || '')
		.replace(/\s+/g, ' ')
		.trim();
}

function ensureDatabaseConnected(res) {
	if (mongoose.connection.readyState !== 1) {
		res.status(503).json({ success: false, message: 'Database is not connected.' });
		return false;
	}
	return true;
}

const createQuizFromPdf = async (req, res) => {
	try {
		if (!ensureDatabaseConnected(res)) return;

		if (!req.file) {
			return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
		}

		const dataBuffer = fs.readFileSync(req.file.path);
		const parsedPdf = await pdfParse(dataBuffer);
		const rawText = normalizeSummaryText(parsedPdf.text);

		if (!rawText) {
			return res.status(400).json({ success: false, message: 'Unable to extract text from the uploaded PDF.' });
		}

		const summary = summarizeText(rawText, 7);
		const keywords = extractKeywords(summary);
		const questions = createContextualQuestions(summary, 10);

		const quiz = await Quiz.create({
			title: createQuizTitle(summary, keywords),
			summary,
			sourceType: 'pdf',
			sourceDocument: {
				originalName: req.file.originalname || '',
				storedName: req.file.filename || '',
				mimeType: req.file.mimetype || '',
				size: req.file.size || 0,
				extractedTextLength: rawText.length
			},
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
};

const createQuizFromSummary = async (req, res) => {
	try {
		if (!ensureDatabaseConnected(res)) return;

		const summary = normalizeSummaryText(req.body.summary);
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
			sourceType: 'summary',
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
};

const getAllQuizzes = async (req, res) => {
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
				createdAt: quiz.createdAt,
				updatedAt: quiz.updatedAt
			}))
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || 'Failed to fetch quizzes.' });
	}
};

const updateQuiz = async (req, res) => {
	try {
		if (!ensureDatabaseConnected(res)) return;

		const quiz = await Quiz.findById(req.params.id);
		if (!quiz) {
			return res.status(404).json({ success: false, message: 'Quiz not found.' });
		}

		const nextTitle = String(req.body.title || '').trim();
		const nextSummary = normalizeSummaryText(req.body.summary);

		if (!nextTitle) {
			return res.status(400).json({ success: false, message: 'Title is required.' });
		}

		if (!nextSummary) {
			return res.status(400).json({ success: false, message: 'Summary is required.' });
		}

		quiz.title = nextTitle;
		quiz.summary = nextSummary;

		const updatedQuiz = await quiz.save();

		return res.status(200).json({
			success: true,
			message: 'Quiz updated successfully.',
			quiz: {
				_id: updatedQuiz._id,
				title: updatedQuiz.title,
				summary: updatedQuiz.summary,
				questionCount: updatedQuiz.questions.length,
				totalAttempts: updatedQuiz.totalAttempts,
				totalPasses: updatedQuiz.totalPasses,
				createdAt: updatedQuiz.createdAt,
				updatedAt: updatedQuiz.updatedAt,
			},
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message || 'Failed to update quiz.' });
	}
};

const getQuizById = async (req, res) => {
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
};

const getQuizQuestions = async (req, res) => {
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
};

const attemptQuiz = async (req, res) => {
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

		const {
			evaluatedAnswers,
			correctCount,
			scorePercentage,
			passed
		} = evaluateQuizAnswers(quiz.questions, answers, userEmail);
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
};

const getPerQuizUserStats = async (req, res) => {
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
};

const getUserOverallStats = async (req, res) => {
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
};

const deleteQuiz = async (req, res) => {
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
};

/**
 * Generate a creative quiz using OpenAI
 * This endpoint uses AI to create engaging, thought-provoking questions
 */
const createCreativeQuiz = async (req, res) => {
	try {
		if (!ensureDatabaseConnected(res)) return;

		const {
			topic,
			content,
			questionCount = 10,
			difficulty = 'medium',
			questionType = 'mixed'
		} = req.body;

		// Validate required fields
		if (!topic || !topic.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Topic is required for creative quiz generation.'
			});
		}

		// Validate question count
		const count = parseInt(questionCount, 10);
		if (isNaN(count) || count < 1 || count > 20) {
			return res.status(400).json({
				success: false,
				message: 'Question count must be between 1 and 20.'
			});
		}

		// Validate difficulty
		const validDifficulties = ['easy', 'medium', 'hard'];
		if (!validDifficulties.includes(difficulty.toLowerCase())) {
			return res.status(400).json({
				success: false,
				message: 'Difficulty must be one of: easy, medium, hard.'
			});
		}

		// Validate question type
		const validTypes = ['multiple_choice', 'true_false', 'mixed'];
		if (!validTypes.includes(questionType.toLowerCase())) {
			return res.status(400).json({
				success: false,
				message: 'Question type must be one of: multiple_choice, true_false, mixed.'
			});
		}

		// Use OpenAI to generate creative questions
		const questions = await openAIService.generateCreativeQuiz({
			topic: topic.trim(),
			content: content ? normalizeSummaryText(content) : '',
			questionCount: count,
			difficulty: difficulty.toLowerCase(),
			questionType: questionType.toLowerCase()
		});

		// Generate a creative title
		const title = await openAIService.generateQuizTitle(topic.trim(), content || '');

		// Create the quiz in the database
		const quiz = await Quiz.create({
			title,
			summary: content ? normalizeSummaryText(content) : `Creative quiz about ${topic.trim()}`,
			sourceType: 'ai_generated',
			questions,
			metadata: {
				generatedBy: 'openai',
				requestedDifficulty: difficulty.toLowerCase(),
				requestedType: questionType.toLowerCase(),
				topic: topic.trim()
			}
		});

		return res.status(201).json({
			success: true,
			message: 'Creative quiz generated successfully using AI!',
			quiz: {
				_id: quiz._id,
				title: quiz.title,
				summary: quiz.summary,
				questionCount: quiz.questions.length,
				sourceType: quiz.sourceType,
				questions: quiz.questions,
				createdAt: quiz.createdAt
			}
		});
	} catch (error) {
		console.error('Creative quiz generation error:', error);

		// Handle specific error cases
		if (error.message.includes('not configured')) {
			return res.status(503).json({
				success: false,
				message: 'AI quiz generation is not available. Please configure the OpenAI API key.'
			});
		}

		if (error.message.includes('API error')) {
			return res.status(502).json({
				success: false,
				message: 'Failed to connect to AI service. Please try again later.'
			});
		}

		return res.status(500).json({
			success: false,
			message: error.message || 'Failed to generate creative quiz.'
		});
	}
};

/**
 * Generate creative quiz from PDF using OpenAI
 * Combines PDF content extraction with AI-powered question generation
 */
const createCreativeQuizFromPdf = async (req, res) => {
	try {
		if (!ensureDatabaseConnected(res)) return;

		if (!req.file) {
			return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
		}

		const {
			topic,
			questionCount = 10,
			difficulty = 'medium',
			questionType = 'mixed'
		} = req.body;

		// Extract text from PDF
		const dataBuffer = fs.readFileSync(req.file.path);
		const parsedPdf = await pdfParse(dataBuffer);
		const rawText = normalizeSummaryText(parsedPdf.text);

		if (!rawText) {
			return res.status(400).json({
				success: false,
				message: 'Unable to extract text from the uploaded PDF.'
			});
		}

		// Use the provided topic or generate one from the content
		const quizTopic = topic || rawText.slice(0, 100);

		// Use OpenAI to generate creative questions from PDF content
		const questions = await openAIService.generateCreativeQuiz({
			topic: quizTopic,
			content: rawText,
			questionCount: parseInt(questionCount, 10) || 10,
			difficulty: difficulty || 'medium',
			questionType: questionType || 'mixed'
		});

		// Generate a creative title
		const title = await openAIService.generateQuizTitle(quizTopic, rawText);

		// Create summary
		const summary = summarizeText(rawText, 5);
		const keywords = extractKeywords(summary);

		const quiz = await Quiz.create({
			title,
			summary,
			sourceType: 'ai_generated_pdf',
			sourceDocument: {
				originalName: req.file.originalname || '',
				storedName: req.file.filename || '',
				mimeType: req.file.mimetype || '',
				size: req.file.size || 0,
				extractedTextLength: rawText.length
			},
			questions,
			metadata: {
				generatedBy: 'openai',
				requestedDifficulty: difficulty || 'medium',
				requestedType: questionType || 'mixed'
			}
		});

		return res.status(201).json({
			success: true,
			message: 'Creative quiz generated from PDF using AI!',
			quiz: {
				_id: quiz._id,
				title: quiz.title,
				summary: quiz.summary,
				questionCount: quiz.questions.length,
				sourceType: quiz.sourceType,
				questions: quiz.questions,
				createdAt: quiz.createdAt
			}
		});
	} catch (error) {
		console.error('Creative PDF quiz generation error:', error);

		if (error.message.includes('not configured')) {
			return res.status(503).json({
				success: false,
				message: 'AI quiz generation is not available. Please configure the OpenAI API key.'
			});
		}

		return res.status(500).json({
			success: false,
			message: error.message || 'Failed to generate creative quiz from PDF.'
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
};

module.exports = {
	uploadsDir,
	createQuizFromPdf,
	createQuizFromSummary,
	createCreativeQuiz,
	createCreativeQuizFromPdf,
	getAllQuizzes,
	updateQuiz,
	getQuizById,
	getQuizQuestions,
	attemptQuiz,
	getPerQuizUserStats,
	getUserOverallStats,
	deleteQuiz,
};
