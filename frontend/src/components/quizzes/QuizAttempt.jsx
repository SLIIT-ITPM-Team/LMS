import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FileText, Mail, BrainCircuit, FileUp } from 'lucide-react';
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 md:px-8 pt-32">
      {/* Background Decorative Blobs */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-400/20 blur-[100px] duration-7000" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 animate-pulse rounded-full bg-indigo-400/20 blur-[120px] duration-5000 delay-1000" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl shadow-blue-900/5 backdrop-blur-xl md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 md:text-4xl">Generate Contextual Quiz</h1>
              <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                Add a summary or upload a PDF and generate 10 balanced questions with contextual options.
              </p>
            </div>
          </div>

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
            <div className="mt-6 inline-flex rounded-2xl border border-blue-100 bg-blue-50/50 p-1.5 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setInputMode('summary')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  inputMode === 'summary'
                    ? 'bg-white text-blue-700 shadow-md shadow-blue-900/10'
                    : 'text-slate-600 hover:bg-white/50 hover:text-blue-600'
                }`}
              >
                <FileText size={16} />
                Use Summary
              </button>
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  inputMode === 'pdf'
                    ? 'bg-white text-blue-700 shadow-md shadow-blue-900/10'
                    : 'text-slate-600 hover:bg-white/50 hover:text-blue-600'
                }`}
              >
                <FileUp size={16} />
                Upload PDF
              </button>
            </div>
          )}

          <div className="mt-8 space-y-6">
            <label className="block group">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-focus-within:text-blue-600">
                <Mail size={16} className="text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                User Email (optional prefill)
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="student@example.com"
                className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
              />
            </label>

            {inputMode === 'summary' ? (
              <>
                <label className="block group">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-focus-within:text-blue-600">
                    <FileText size={16} className="text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                    Summary
                  </span>
                  <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleInputChange}
                    rows={10}
                    placeholder="Paste or type a detailed summary here to generate your quiz..."
                    className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                  />
                </label>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{form.summary.trim().length} characters</span>
                  <span>{canGenerate ? 'Ready' : 'Minimum 60 characters'}</span>
                </div>
              </>
            ) : (
              <>
                <label className="block group">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-focus-within:text-blue-600">
                    <FileUp size={16} className="text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                    PDF Document
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => {
                      const selected = event.target.files?.[0] || null;
                      setPdfFile(selected);
                    }}
                    className="w-full cursor-pointer rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-3.5 text-sm font-medium text-slate-600 shadow-sm outline-none transition-all hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 file:mr-5 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-100 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-blue-700 hover:file:bg-blue-200 file:transition-colors"
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
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Sparkles size={20} className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              {isGenerating ? 'Generating Quiz...' : `Generate 10 Questions from ${inputMode === 'pdf' ? 'PDF' : 'Summary'}`}
              
              {/* Decorative shine effect on button */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuizAttempt;
