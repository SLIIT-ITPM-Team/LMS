import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const initialForm = {
  summary: '',
  email: ''
};

const QuizAttempt = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fromCourse = location.state?.summary || '';
  const courseTitle = location.state?.courseTitle || '';

  const [form, setForm] = useState({
    ...initialForm,
    summary: fromCourse,
  });
  const [inputMode, setInputMode] = useState('summary');
  const [pdfFile, setPdfFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [autoTriggered, setAutoTriggered] = useState(false);

  const canGenerate = useMemo(() => {
    if (inputMode === 'pdf') {
      return !!pdfFile;
    }
    return form.summary.trim().length >= 60;
  }, [form.summary, inputMode, pdfFile]);

  // Auto-generate quiz when navigated from a course with a summary
  useEffect(() => {
    if (fromCourse && fromCourse.trim().length >= 60 && !autoTriggered) {
      setAutoTriggered(true);
      handleGenerateQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleGenerateQuiz = async () => {
    if (!canGenerate) {
      setError(
        inputMode === 'pdf'
          ? 'Please select a PDF file to continue.'
          : 'Please enter a richer summary with at least 60 characters.'
      );
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      let response;
      if (inputMode === 'pdf') {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        response = await api.post('/api/quiz/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('/api/quiz/from-summary', {
          summary: form.summary.trim()
        });
      }

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
            Add a summary or upload a PDF and generate 10 balanced questions with contextual options and validated answers.
          </p>

          {/* Course context banner */}
          {fromCourse && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white text-xs font-bold">✓</span>
              <div>
                <p className="text-sm font-semibold text-cyan-800">
                  Auto-filled from course{courseTitle ? `: ${courseTitle}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-cyan-600">
                  {isGenerating
                    ? 'Generating your quiz now — please wait…'
                    : 'The course summary has been loaded. Click "Generate" or it will start automatically.'}
                </p>
              </div>
            </div>
          )}

          {!fromCourse && (
            <div className="mt-5 inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setInputMode('summary')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  inputMode === 'summary'
                    ? 'bg-[#3451a3] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Use Summary
              </button>
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  inputMode === 'pdf'
                    ? 'bg-[#3451a3] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Upload PDF
              </button>
            </div>
          )}

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

            {inputMode === 'summary' ? (
              <>
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
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">PDF Document</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const selected = event.target.files?.[0] || null;
                      setPdfFile(selected);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[#0B1F3B] file:px-3 file:py-2 file:text-white"
                  />
                </label>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{pdfFile ? `${pdfFile.name} (${Math.round(pdfFile.size / 1024)} KB)` : 'No file selected'}</span>
                  <span>{canGenerate ? 'Ready' : 'Select a PDF file'}</span>
                </div>
              </>
            )}

            {error ? (
              <div className="rounded-xl border border-rose-300/60 bg-rose-500/20 px-3 py-2 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !canGenerate}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-[#3451a3] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? 'Generating Quiz...' : `Generate 10 Questions from ${inputMode === 'pdf' ? 'PDF' : 'Summary'}`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuizAttempt;
