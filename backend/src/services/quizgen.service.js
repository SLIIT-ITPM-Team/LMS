const { summarizeText } = require('../utils/summarize');

const STOP_WORDS = new Set([
	'the', 'and', 'for', 'are', 'that', 'with', 'this', 'from', 'into', 'your', 'have', 'has', 'had', 'were',
	'was', 'their', 'there', 'about', 'which', 'when', 'where', 'while', 'will', 'would', 'could', 'should',
	'what', 'how', 'why', 'who', 'whose', 'whom', 'been', 'being', 'also', 'than', 'then', 'them', 'they',
	'you', 'our', 'out', 'not', 'only', 'some', 'many', 'more', 'most', 'very', 'such', 'over', 'under',
	'each', 'other', 'through', 'during', 'before', 'after', 'because', 'these', 'those', 'its',
	'can', 'may', 'might', 'shall', 'per', 'any', 'all', 'both', 'few', 'own', 'same', 'too', 'just', 'like',
	'than', 'via', 'use', 'used', 'using', 'based', 'within'
]);

/**
 * Normalize and clean summary text
 */
function normalizeSummary(summary) {
	return String(summary || '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Split summary into sentences
 */
function splitSentences(summary) {
	return normalizeSummary(summary)
		.split(/(?<=[.!?])\s+/)
		.map((sentence) => sentence.trim())
		.filter(Boolean);
}

/**
 * Extract keywords from text
 */
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

/**
 * Convert text to title case
 */
function toTitleCase(value) {
	return String(value || '')
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

/**
 * Create a quiz title from summary and keywords
 */
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

/**
 * Clean a text fragment for use in questions
 */
function cleanFragment(value, fallback = 'the topic') {
	const cleaned = String(value || '')
		.replace(/[\r\n]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!cleaned) return fallback;
	if (cleaned.length <= 88) return cleaned;
	return `${cleaned.slice(0, 85)}...`;
}

/**
 * Create distractor options for a question
 */
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

/**
 * Shuffle an array
 */
function shuffled(array) {
	const copy = [...array];
	for (let index = copy.length - 1; index > 0; index -= 1) {
		const random = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[random]] = [copy[random], copy[index]];
	}
	return copy;
}

/**
 * Build a question based on type and difficulty
 */
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

/**
 * Generate contextual quiz questions from a summary
 */
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

/**
 * Generate a quiz from raw text content
 */
function generateQuizFromText(rawText, options = {}) {
	const { questionCount = 10 } = options;
	
	const normalized = normalizeSummary(rawText);
	const summary = summarizeText(normalized, 7);
	const keywords = extractKeywords(summary);
	const questions = createContextualQuestions(summary, questionCount);
	const title = createQuizTitle(summary, keywords);

	return {
		title,
		summary,
		keywords,
		questions
	};
}

/**
 * Sanitize questions for client display (remove correct answers)
 */
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

/**
 * Evaluate quiz answers and calculate score
 */
function evaluateQuizAnswers(questions, answers, userEmail) {
	const resolveSelectedAnswer = (question, answerPayload) => {
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
	};

	const evaluatedAnswers = questions.map((question, index) => {
		const payload = Array.isArray(answers)
			? answers[index]
			: answers[index + 1] ?? answers[String(index + 1)] ?? answers[index] ?? answers[String(index)];
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
	const scorePercentage = Math.round((correctCount / questions.length) * 100);
	const passed = scorePercentage >= 60;

	return {
		evaluatedAnswers,
		correctCount,
		scorePercentage,
		passed
	};
}

/**
 * Create a certificate ID for passed quizzes
 */
function createCertificateId(userEmail, quizId, attemptNumber) {
	const emailPart = String(userEmail || 'user').split('@')[0].slice(0, 6).toUpperCase();
	const quizPart = String(quizId || '').slice(-6).toUpperCase();
	const sequence = String(attemptNumber).padStart(3, '0');
	const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	return `LMS-${datePart}-${quizPart}-${emailPart}-${sequence}`;
}

module.exports = {
	normalizeSummary,
	splitSentences,
	extractKeywords,
	toTitleCase,
	createQuizTitle,
	cleanFragment,
	makeDistractors,
	shuffled,
	buildQuestion,
	createContextualQuestions,
	generateQuizFromText,
	sanitizeQuestionsForClient,
	evaluateQuizAnswers,
	createCertificateId
};