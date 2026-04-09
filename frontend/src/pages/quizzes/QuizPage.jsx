import React from 'react';
import { useParams } from 'react-router-dom';
import QuizAttempt from '../../components/quizzes/QuizAttempt';
import QuizCard from '../../components/quizzes/QuizCard';

const QuizPage = () => {
	const { id } = useParams();

	if (id) {
		return <QuizCard />;
	}

	return <QuizAttempt />;
};

export default QuizPage;
