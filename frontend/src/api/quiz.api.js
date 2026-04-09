import axios from './axios';

/**
 * Generate a creative quiz using AI
 * @param {Object} quizData - Quiz generation parameters
 * @param {string} quizData.topic - The topic for the quiz
 * @param {string} [quizData.content] - Optional content to base questions on
 * @param {number} [quizData.questionCount=10] - Number of questions (1-20)
 * @param {string} [quizData.difficulty='medium'] - Difficulty: easy, medium, hard
 * @param {string} [quizData.questionType='mixed'] - Type: multiple_choice, true_false, mixed
 * @returns {Promise} Quiz generation response
 */
export const createCreativeQuiz = async (quizData) => {
    const response = await axios.post('/api/quizzes/creative', quizData);
    return response.data;
};

/**
 * Generate a creative quiz from PDF using AI
 * @param {FormData} formData - FormData with PDF file and optional parameters
 * @returns {Promise} Quiz generation response
 */
export const createCreativeQuizFromPDF = async (formData) => {
    const response = await axios.post('/api/quizzes/creative-pdf', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Get all quizzes
 * @returns {Promise} List of quizzes
 */
export const getAllQuizzes = async () => {
    const response = await axios.get('/api/quizzes');
    return response.data;
};

/**
 * Get quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise} Quiz data
 */
export const getQuizById = async (quizId) => {
    const response = await axios.get(`/api/quizzes/${quizId}`);
    return response.data;
};

/**
 * Get quiz questions
 * @param {string} quizId - Quiz ID
 * @returns {Promise} Quiz questions
 */
export const getQuizQuestions = async (quizId) => {
    const response = await axios.get(`/api/quizzes/${quizId}/questions`);
    return response.data;
};

/**
 * Attempt a quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} attemptData - Attempt data
 * @param {string} attemptData.userEmail - User email
 * @param {Array} attemptData.answers - User's answers
 * @returns {Promise} Quiz result
 */
export const attemptQuiz = async (quizId, attemptData) => {
    const response = await axios.post(`/api/quizzes/${quizId}/attempt`, attemptData);
    return response.data;
};

/**
 * Get user stats for a specific quiz
 * @param {string} quizId - Quiz ID
 * @param {string} userEmail - User email
 * @returns {Promise} User stats
 */
export const getPerQuizUserStats = async (quizId, userEmail) => {
    const response = await axios.get(`/api/quizzes/${quizId}/stats/${userEmail}`);
    return response.data;
};

/**
 * Get overall user stats across all quizzes
 * @param {string} userEmail - User email
 * @returns {Promise} Overall user stats
 */
export const getUserOverallStats = async (userEmail) => {
    const response = await axios.get(`/api/quizzes/stats/${userEmail}`);
    return response.data;
};

/**
 * Create quiz from PDF (legacy)
 * @param {FormData} formData - FormData with PDF file
 * @returns {Promise} Quiz generation response
 */
export const createQuizFromPDF = async (formData) => {
    const response = await axios.post('/api/quizzes/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Create quiz from summary text (legacy)
 * @param {string} summary - Summary text
 * @returns {Promise} Quiz generation response
 */
export const createQuizFromSummary = async (summary) => {
    const response = await axios.post('/api/quizzes/from-summary', { summary });
    return response.data;
};

/**
 * Update a quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise} Updated quiz
 */
export const updateQuiz = async (quizId, quizData) => {
    const response = await axios.put(`/api/quizzes/${quizId}`, quizData);
    return response.data;
};

/**
 * Delete a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise} Deletion response
 */
export const deleteQuiz = async (quizId) => {
    const response = await axios.delete(`/api/quizzes/${quizId}`);
    return response.data;
};