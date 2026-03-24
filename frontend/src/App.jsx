import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import QuizAttempt from './components/quizzes/QuizAttempt';
import QuizCard from './components/quizzes/QuizCard';

function App() {
	return (
		<Routes>
			<Route path="/" element={<QuizAttempt />} />
			<Route path="/quiz/:id/quits" element={<QuizCard />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
