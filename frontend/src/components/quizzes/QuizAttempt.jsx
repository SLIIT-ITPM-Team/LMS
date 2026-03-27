import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const initialForm = {
  summary: '',
  email: ''
};

const QuizAttempt = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const canGenerate = useMemo(() => {
    return form.summary.trim().length >= 60;
  }, [form.summary]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleGenerateQuiz = async () => {
    if (!canGenerate) {
      setError('Please enter a richer summary with at least 60 characters.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const response = await api.post('/api/quiz/from-summary', {
        summary: form.summary.trim()
      });

      const quizId = response.data?._id || response.data?.quiz?._id;
      if (!quizId) {
        throw new Error('Quiz creation succeeded but no quiz id was returned.');
      }

      if (form.email.trim()) {
        localStorage.setItem('quiz_user_email', form.email.trim().toLowerCase());
      }

      navigate(`/quiz/${quizId}/quits`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to generate quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
          <h1 className="text-2xl font-bold md:text-3xl">Generate Contextual Quiz</h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Enter a summary and generate 10 balanced questions with contextual options and validated answers.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">User Email (optional prefill)</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="student@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Summary</span>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleInputChange}
                rows={12}
                placeholder="Paste or type a detailed summary..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
              />
            </label>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{form.summary.trim().length} characters</span>
              <span>{canGenerate ? 'Ready' : 'Minimum 60 characters'}</span>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-300/60 bg-rose-500/20 px-3 py-2 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !canGenerate}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? 'Generating Quiz...' : 'Generate 10 Questions'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuizAttempt;
