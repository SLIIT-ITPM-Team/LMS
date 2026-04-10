const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.client = null;
        this.isConfigured = false;
        this.initialize();
    }

    initialize() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey
            });
            this.isConfigured = true;
        } else {
            console.warn('OpenAI API key not configured. Creative quiz generation will be unavailable.');
        }
    }

    /**
     * Generate creative quiz questions using OpenAI
     * @param {string} topic - The topic or subject for the quiz
     * @param {string} content - Optional content/context to base questions on
     * @param {number} questionCount - Number of questions to generate (default: 10)
     * @param {string} difficulty - Difficulty level: easy, medium, hard
     * @param {string} questionType - Type of questions: multiple_choice, true_false, mixed
     * @returns {Promise<Array>} Array of generated questions
     */
    async generateCreativeQuiz({
        topic,
        content = '',
        questionCount = 10,
        difficulty = 'medium',
        questionType = 'mixed'
    }) {
        if (!this.isConfigured) {
            throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.');
        }

        const prompt = this.buildPrompt(topic, content, questionCount, difficulty, questionType);

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert educational content creator specializing in creating engaging, creative, and thought-provoking quiz questions. Your questions should:
- Test understanding, not just memorization
- Include real-world scenarios and applications
- Be clear and unambiguous
- Have plausible distractors that test common misconceptions
- Vary in cognitive complexity based on difficulty level`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000,
                response_format: { type: 'json_object' }
            });

            const responseText = completion.choices[0].message.content;
            const parsed = JSON.parse(responseText);

            if (!parsed.questions || !Array.isArray(parsed.questions)) {
                throw new Error('Invalid response format from OpenAI');
            }

            return this.validateAndFormatQuestions(parsed.questions, questionCount);
        } catch (error) {
            if (error.response) {
                console.error('OpenAI API Error:', error.response.status, error.response.data);
                throw new Error(`OpenAI API error: ${error.response.status}`);
            }
            throw error;
        }
    }

    /**
     * Build the prompt for OpenAI based on parameters
     */
    buildPrompt(topic, content, questionCount, difficulty, questionType) {
        let prompt = `Create ${questionCount} creative quiz questions about "${topic}".`;

        if (content) {
            prompt += `\n\nBase the questions on the following content:\n${content}`;
        }

        prompt += `\n\nDifficulty level: ${difficulty}`;
        prompt += `\nQuestion format: ${questionType}`;

        if (difficulty === 'easy') {
            prompt += '\nFocus on basic recall and understanding of key concepts.';
        } else if (difficulty === 'medium') {
            prompt += '\nInclude application and analysis questions that require deeper thinking.';
        } else {
            prompt += '\nInclude complex scenario-based questions requiring evaluation and synthesis.';
        }

        if (questionType === 'true_false') {
            prompt += '\nAll questions should be True/False format.';
        } else if (questionType === 'multiple_choice') {
            prompt += '\nAll questions should have 4 options with one correct answer.';
        } else {
            prompt += '\nMix different question types for variety.';
        }

        prompt += `\n\nIMPORTANT: Return the response as a JSON object with the following structure:
{
    "questions": [
        {
            "questionText": "The question text here",
            "type": "multiple_choice or true_false",
            "difficulty": "easy, medium, or hard",
            "options": [
                {"text": "Option A", "isCorrect": true},
                {"text": "Option B", "isCorrect": false},
                {"text": "Option C", "isCorrect": false},
                {"text": "Option D", "isCorrect": false}
            ],
            "correctAnswer": "The correct answer text",
            "explanation": "Brief explanation of why this answer is correct"
        }
    ]
}

For true_false questions, use options: [{"text": "True", "isCorrect": true}, {"text": "False", "isCorrect": false}] or vice versa.

Ensure exactly ${questionCount} questions are generated.`;

        return prompt;
    }

    /**
     * Validate and format questions from OpenAI response
     */
    validateAndFormatQuestions(questions, expectedCount) {
        const formattedQuestions = questions
            .filter(q => q.questionText && q.options && q.correctAnswer)
            .map((q, index) => ({
                questionText: this.cleanText(q.questionText),
                type: this.validateType(q.type),
                difficulty: this.validateDifficulty(q.difficulty),
                options: this.formatOptions(q.options),
                correctAnswer: this.cleanText(q.correctAnswer),
                explanation: q.explanation ? this.cleanText(q.explanation) : ''
            }))
            .slice(0, expectedCount);

        if (formattedQuestions.length < expectedCount) {
            console.warn(`Only ${formattedQuestions.length} valid questions generated out of ${expectedCount} requested.`);
        }

        return formattedQuestions;
    }

    /**
     * Clean and sanitize text
     */
    cleanText(text) {
        if (!text) return '';
        return String(text)
            .replace(/\s+/g, ' ')
            .replace(/^["']|["']$/g, '')
            .trim();
    }

    /**
     * Validate question type
     */
    validateType(type) {
        const validTypes = ['multiple_choice', 'true_false', 'fact', 'concept', 'inference', 'application'];
        if (type && validTypes.includes(type.toLowerCase())) {
            return type.toLowerCase();
        }
        return 'multiple_choice';
    }

    /**
     * Validate difficulty level
     */
    validateDifficulty(difficulty) {
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (difficulty && validDifficulties.includes(difficulty.toLowerCase())) {
            return difficulty.toLowerCase();
        }
        return 'medium';
    }

    /**
     * Format options array
     */
    formatOptions(options) {
        if (!Array.isArray(options) || options.length === 0) {
            return [
                { text: 'Option A', isCorrect: false },
                { text: 'Option B', isCorrect: false },
                { text: 'Option C', isCorrect: false },
                { text: 'Option D', isCorrect: false }
            ];
        }

        return options.map(opt => ({
            text: this.cleanText(typeof opt === 'string' ? opt : opt.text),
            isCorrect: Boolean(opt.isCorrect)
        }));
    }

    /**
     * Generate quiz title using OpenAI
     */
    async generateQuizTitle(topic, summary) {
        if (!this.isConfigured) {
            return `Creative Quiz: ${topic}`;
        }

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: `Create a short, engaging, and creative title (max 60 characters) for a quiz about "${topic}". Return only the title, nothing else.`
                    }
                ],
                max_tokens: 50
            });

            return completion.choices[0].message.content.trim() || `Quiz: ${topic}`;
        } catch (error) {
            console.warn('Failed to generate creative title:', error.message);
            return `Quiz: ${topic}`;
        }
    }
}

module.exports = new OpenAIService();