import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const circleRadius = 62;
const circumference = 2 * Math.PI * circleRadius;

function getOptionText(option) {
  if (typeof option === 'string') return option;
  if (option && typeof option === 'object' && typeof option.text === 'string') return option.text;
  return '';
}

function normalizeQuestion(rawQuestion, index) {
  const questionText =
    rawQuestion?.questionText ||
    rawQuestion?.question ||
    `Question ${index + 1}`;

  const rawOptions = Array.isArray(rawQuestion?.options) ? rawQuestion.options : [];
  const options = rawOptions.map(getOptionText).filter(Boolean);

  return {
    questionNumber: rawQuestion?.questionNumber || index + 1,
    questionText,
    difficulty: rawQuestion?.difficulty || 'medium',
    options
  };
}

function escapePdfText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '');
}

function createGradientBands() {
  const bands = [];
  const steps = 20;
  for (let index = 0; index < steps; index += 1) {
    const ratio = index / (steps - 1);
    const r = 0.96 - ratio * 0.02;
    const g = 0.98 - ratio * 0.03;
    const b = 1 - ratio * 0.04;
    const y = 842 - ((index + 1) * (842 / steps));
    bands.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg 0 ${y.toFixed(2)} 595 ${(842 / steps + 0.5).toFixed(2)} re f`);
  }
  return bands.join('\n');
}

function clipText(value, maxLength = 64) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3)}...`;
}

function formatLearnerName(emailOrName) {
  const raw = String(emailOrName || 'Learner')
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .trim();

  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Learner';
}

function wrapTextForPdf(value, maxCharsPerLine = 40, maxLines = 3) {
  const words = String(value || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines - 1) break;
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  if (words.join(' ').length > lines.join(' ').length && lines.length) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = clipText(lines[lastIndex], Math.max(8, maxCharsPerLine - 2));
  }

  return lines;
}

function createCertificatePdfBlob({ userName, topic, score, date, certificateId }) {
  const safeName = escapePdfText(clipText(userName || 'Learner', 36));
  const topicLines = wrapTextForPdf(topic || 'Quiz Topic', 46, 2).map((line) => escapePdfText(line));
  const safeDate = escapePdfText(date || new Date().toLocaleDateString());
  const safeCertificateId = escapePdfText(certificateId || 'N/A');
  const safeScore = escapePdfText(`${score}%`);

  const topicLineOne = topicLines[0] || 'Quiz Topic';
  const topicLineTwo = topicLines[1] || '';

  const stream = [
    'q',
    createGradientBands(),
    'Q',
    '1 1 1 rg 24 24 547 794 re f',
    '0.14 0.22 0.42 RG 2.2 w 34 34 527 774 re S',
    '0.84 0.72 0.38 RG 0.9 w 46 46 503 750 re S',
    '0.14 0.22 0.42 rg 46 728 503 52 re f',
    '0.97 0.98 1 rg BT /F2 28 Tf 104 747 Td (CERTIFICATE OF ACHIEVEMENT) Tj ET',
    '0.45 0.54 0.68 rg BT /F1 11 Tf 66 706 Td (Certificate ID: ' + safeCertificateId + ') Tj ET',
    '0.37 0.44 0.57 rg BT /F1 13 Tf 220 662 Td (This certifies that) Tj ET',
    '0.12 0.20 0.40 rg BT /F2 34 Tf 98 620 Td (' + safeName + ') Tj ET',
    '0.82 0.86 0.93 RG 1 w 92 610 m 502 610 l S',
    '0.37 0.44 0.57 rg BT /F1 12 Tf 118 580 Td (has successfully completed a professional quiz assessment) Tj ET',
    '0.37 0.44 0.57 rg BT /F1 12 Tf 238 560 Td (on the topic) Tj ET',
    '0.10 0.19 0.39 rg BT /F2 18 Tf 90 532 Td (' + topicLineOne + ') Tj ET',
    '0.10 0.19 0.39 rg BT /F2 18 Tf 90 510 Td (' + topicLineTwo + ') Tj ET',
    '0.96 0.97 0.99 rg 82 420 431 82 re f',
    '0.83 0.88 0.96 RG 1 w 82 420 431 82 re S',
    '0.18 0.26 0.45 rg BT /F1 13 Tf 104 468 Td (Final Score) Tj ET',
    '0.11 0.49 0.32 rg BT /F2 30 Tf 228 460 Td (' + safeScore + ') Tj ET',
    '0.42 0.49 0.60 rg BT /F1 11 Tf 104 438 Td (Date Issued: ' + safeDate + ') Tj ET',
    '0.42 0.49 0.60 rg BT /F1 11 Tf 328 438 Td (Issued by LMS Quiz Engine) Tj ET',
    '0.95 0.96 1 rg 422 300 96 96 re f',
    '0.80 0.86 0.95 RG 1 w 422 300 96 96 re S',
    '0.16 0.24 0.43 rg BT /F2 15 Tf 452 352 Td (LMS) Tj ET',
    '0.16 0.24 0.43 rg BT /F1 9 Tf 437 338 Td (CERTIFIED) Tj ET',
    '0.16 0.24 0.43 rg BT /F1 9 Tf 438 325 Td (ACHIEVEMENT) Tj ET',
    '0.70 0.76 0.85 RG 1 w 78 214 m 286 214 l S',
    '0.32 0.40 0.53 rg BT /F1 11 Tf 133 199 Td (Academic Coordinator) Tj ET',
    '0.70 0.76 0.85 RG 1 w 315 214 m 520 214 l S',
    '0.32 0.40 0.53 rg BT /F1 11 Tf 381 199 Td (Authorized Signature) Tj ET'
  ].join('\n');

  const objects = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj');
  objects.push(`4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`);
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push('6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

const QuizCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState(localStorage.getItem('quiz_user_email') || '');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/quiz/${id}/questions`);
        const quizId = response.data?.quizId || response.data?._id || id;
        const normalizedQuestions = (response.data?.questions || []).map(normalizeQuestion);

        setQuiz({
          id: quizId,
          title: response.data?.title || response.data?.name || 'Quiz',
          summary: response.data?.summary || '',
          questions: normalizedQuestions
        });
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  const completion = useMemo(() => {
    if (!quiz?.questions?.length) return 0;
    return Math.round((Object.keys(answers).length / quiz.questions.length) * 100);
  }, [answers, quiz]);

  const question = quiz?.questions?.[currentQuestion];

  const handleSelectAnswer = (option) => {
    const selectedText = getOptionText(option);
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion + 1]: selectedText
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion + 1]: !prev[currentQuestion + 1]
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    if (!quiz.id) {
      setError('Invalid quiz id. Please reload and try again.');
      return;
    }

    if (!userEmail.trim()) {
      setError('Please enter your email before submitting.');
      return;
    }

    if (Object.keys(answers).length !== quiz.questions.length) {
      setError('Please answer all 10 questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      localStorage.setItem('quiz_user_email', userEmail.trim().toLowerCase());

      const response = await api.post(`/api/quiz/${quiz.id}/attempt`, {
        userEmail: userEmail.trim().toLowerCase(),
        answers
      });

      setResult(response.data.result);
      setShowResultModal(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to evaluate quiz attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!result?.passed || !result?.certificate?.certificateId) return;

    const learnerName = formatLearnerName(userEmail || 'Learner');
    const date = new Date().toLocaleDateString();

    const pdfBlob = createCertificatePdfBlob({
      userName: learnerName,
      topic: quiz?.title || 'Quiz Topic',
      score: result.scorePercentage,
      date,
      certificateId: result.certificate.certificateId
    });

    const url = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `certificate-${result.certificate.certificateId}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const strokeOffset = circumference - ((result?.scorePercentage || 0) / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-100 p-2 text-slate-900 md:p-4 lg:p-6">
      <div className="mx-auto flex w-full max-w-none flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl md:min-h-[calc(100vh-2rem)] md:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{quiz?.title || 'Quiz Attempt'}</h1>
            <p className="mt-1 text-sm text-slate-600">Answer all questions to get evaluated and generate certificate on 60%+.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Your Email</label>
          <input
            type="email"
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
            placeholder="student@example.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>Progress</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">Loading questions...</div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-400/50 bg-rose-600/20 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {!loading && quiz?.questions?.length ? (
          <div className="mt-6 grid flex-1 gap-6 md:grid-cols-[1fr,260px] lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,360px]">
            {/* Left Column: Active Question */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-full border border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                    Question <span className="text-cyan-900">{currentQuestion + 1}</span> / {quiz.questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                      flaggedQuestions[currentQuestion + 1]
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill={flaggedQuestions[currentQuestion + 1] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    {flaggedQuestions[currentQuestion + 1] ? 'Flagged' : 'Flag'}
                  </button>
                  <div className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 py-1.5 shadow-sm">
                    <svg className="h-3.5 w-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                      {question?.difficulty || 'medium'}
                    </span>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.24 }}
                >
                  <h2 className="text-lg font-semibold leading-relaxed text-slate-900 md:text-xl">
                    {question?.questionText}
                  </h2>

                  <div className="mt-4 grid gap-3">
                    {question?.options?.map((option, index) => {
                      const optionText = getOptionText(option);
                      const selected = answers[currentQuestion + 1] === optionText;
                      return (
                        <motion.button
                          key={`${index}-${optionText}`}
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={() => handleSelectAnswer(option)}
                          className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition md:text-base ${
                            selected
                              ? 'border-cyan-400 bg-cyan-50 text-cyan-900 shadow-md'
                              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {optionText}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
                  disabled={currentQuestion === 0}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {currentQuestion < quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion((prev) => Math.min(prev + 1, quiz.questions.length - 1))}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Quiz'}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Question Navigator */}
            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 md:block shadow-sm">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-slate-700 uppercase">
                Questions Navigator
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {quiz.questions.map((_, idx) => {
                  const isAnswered = !!answers[idx + 1];
                  const isCurrent = currentQuestion === idx;
                  const isFlagged = !!flaggedQuestions[idx + 1];
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQuestion(idx)}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        isCurrent
                          ? 'bg-cyan-500 text-white shadow-md ring-2 ring-cyan-500/30'
                          : isAnswered
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                      } ${isFlagged && !isCurrent ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col gap-2 text-xs font-semibold text-slate-600 border-t border-slate-200/50 pt-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                   <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-cyan-50 border border-cyan-200"></div>
                   <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div>
                   <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="relative w-3 h-3 rounded-full bg-white border border-slate-200 ring-2 ring-red-400 ring-offset-1">
                     <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white"></div>
                   </div>
                   <span>Flagged</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {showResultModal && result ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/20 bg-slate-900 p-5 text-white shadow-2xl md:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold md:text-2xl">Quiz Result</h3>
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="rounded-lg border border-white/30 px-3 py-1.5 text-sm"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-6 md:grid-cols-[180px,1fr] md:items-center">
                <div className="flex justify-center">
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="12" />
                    <circle
                      cx="75"
                      cy="75"
                      r={circleRadius}
                      fill="none"
                      stroke={result.passed ? '#34d399' : '#f59e0b'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      transform="rotate(-90 75 75)"
                    />
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-white text-2xl font-bold">
                      {result.scorePercentage}%
                    </text>
                  </svg>
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-100">{result.passed ? 'Passed ✅' : 'Not Passed ❌'}</p>
                  <p className="mt-1 text-sm text-slate-300">Correct Answers: {result.correctCount} / {result.totalQuestions}</p>
                  <p className="mt-1 text-sm text-slate-300">Attempt Number: {result.attemptNumber}</p>
                  <p className="mt-1 text-sm text-slate-300">User: {result.userEmail}</p>
                  {result.certificate?.certificateId ? (
                    <p className="mt-1 text-sm text-emerald-300">Certificate ID: {result.certificate.certificateId}</p>
                  ) : null}

                  {result.passed ? (
                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Download Certificate PDF
                    </button>
                  ) : (
                    <p className="mt-3 text-sm text-amber-300">Score at least 60% to generate the certificate.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="text-base font-semibold">Question Feedback</h4>
                {result.answers.map((item) => (
                  <div
                    key={item.questionNumber}
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      item.isCorrect ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-rose-400/50 bg-rose-500/10'
                    }`}
                  >
                    <p className="font-semibold">Q{item.questionNumber}: {item.questionText}</p>
                    <p className="mt-1 text-slate-200">Your Answer: {getOptionText(item.selectedAnswer) || 'Not answered'}</p>
                    <p className="text-slate-200">Correct Answer: {getOptionText(item.correctAnswer)}</p>
                    <p className={`mt-1 font-semibold ${item.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default QuizCard;
