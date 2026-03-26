import React from 'react';
import { useParams } from 'react-router-dom';

const QuizPage = () => {
	const { id } = useParams();

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-24 md:px-8">
			<div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-slate-900">Quiz Attempt</h1>
				<p className="mt-2 text-sm text-slate-600">Quiz ID: {id}</p>
			</div>
		</div>
	);
};

export default QuizPage;
