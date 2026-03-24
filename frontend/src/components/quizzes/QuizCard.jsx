import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import theme from '../theme';

const LOCAL_BACKEND_PORTS = [8070, 8071, 8072, 8073, 8074, 8075];

const createBackendUrl = (port, path) => `http://localhost:${port}${path}`;

async function getWithBackendFallback(path) {
  let lastNetworkError = null;

  for (const port of LOCAL_BACKEND_PORTS) {
    try {
      return await axios.get(createBackendUrl(port, path), { timeout: 5000 });
    } catch (err) {
      if (err.response) {
        throw err;
      }
      lastNetworkError = err;
    }
  }

  throw lastNetworkError || new Error('Backend not reachable');
}

const Quits = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizName, setQuizName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError('');
        const res = await getWithBackendFallback(`/quiz/${id}/questions`);
        setQuizName(res.data.name || 'Quiz');
        setQuestions((res.data.questions || []).slice(0, 10));
      } catch (err) {
        setError('Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [id]);

  const selectOption = (qId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = () => {
    if (!questions.length) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      alert('Please answer all 10 quizzes before submitting.');
      return;
    }

    let correct = 0;
    questions.forEach((q, index) => {
      const selected = answers[index + 1];
      if (selected && selected.isCorrect) {
        correct += 1;
      }
    });

    const total = questions.length;
    const percent = Math.round((correct / total) * 100);
    setScore({ correct, total, percent });
    setSubmitted(true);
    setShowResult(false);
  };

  const resetAll = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setShowResult(false);
  };

  const downloadCertificate = () => {
    if (!score || score.percent < 60) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1270;
    const ctx = canvas.getContext('2d');
    const today = new Date();
    const formattedDate = today.toLocaleDateString();
    const certId = `CERT-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(id || '').slice(-6).toUpperCase() || '000001'}`;

    const w = canvas.width;
    const h = canvas.height;

    const bgGradient = ctx.createLinearGradient(0, 0, w, h);
    bgGradient.addColorStop(0, '#fffdf5');
    bgGradient.addColorStop(1, '#f8fbff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#053668';
    ctx.lineWidth = 14;
    ctx.strokeRect(38, 38, w - 76, h - 76);

    ctx.strokeStyle = '#FF7100';
    ctx.lineWidth = 4;
    ctx.strokeRect(64, 64, w - 128, h - 128);

    ctx.strokeStyle = '#F7ECB5';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(88, 88, w - 176, h - 176);
    ctx.setLineDash([]);

    ctx.fillStyle = '#053668';
    ctx.textAlign = 'center';
    ctx.font = '600 32px Georgia, serif';
    ctx.fillText('Certificate ID: ' + certId, w / 2, 170);

    ctx.fillStyle = '#053668';
    ctx.font = '700 88px Georgia, serif';
    ctx.fillText('Certificate of Achievement', w / 2, 300);

    ctx.fillStyle = '#FF7100';
    ctx.font = '600 40px Georgia, serif';
    ctx.fillText('This certifies successful completion of the quiz', w / 2, 380);

    ctx.fillStyle = '#1f2937';
    ctx.font = '500 34px Georgia, serif';
    ctx.fillText('Course / Topic', w / 2, 485);

    ctx.fillStyle = '#053668';
    ctx.font = '700 58px Georgia, serif';
    ctx.fillText(quizName || 'Summary Quiz', w / 2, 570);

    ctx.fillStyle = '#1f2937';
    ctx.font = '500 34px Georgia, serif';
    ctx.fillText('Final Score', w / 2, 675);

    ctx.fillStyle = '#053668';
    ctx.font = '700 62px Georgia, serif';
    ctx.fillText(`${score.correct}/${score.total} (${score.percent}%)`, w / 2, 755);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(240, 980);
    ctx.lineTo(760, 980);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1040, 980);
    ctx.lineTo(1560, 980);
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = '500 30px Georgia, serif';
    ctx.fillText('Authorized Signature', 500, 1030);
    ctx.fillText('Date Issued', 1300, 1030);

    ctx.fillStyle = '#111827';
    ctx.font = '600 34px Georgia, serif';
    ctx.fillText(formattedDate, 1300, 940);

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 24px Georgia, serif';
    ctx.fillText('Generated by Quiz Learning Platform', w / 2, 1145);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${(quizName || 'summary-quiz').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(145deg, ${theme.givry} 0%, #ffffff 55%, ${theme.givry} 100%)`,
        padding: '28px 16px',
        fontFamily: 'Inter, system-ui, Arial'
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 18,
          border: `1px solid ${theme.givry}`,
          boxShadow: '0 14px 40px rgba(5,54,104,0.12)',
          padding: 24
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, color: theme.teal, fontSize: 30, letterSpacing: 0.2 }}>Quizzes</h2>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontWeight: 600 }}>{quizName}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${theme.teal}`,
                background: '#fff',
                color: theme.teal,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </div>

        {loading && <p style={{ color: '#6b7280', fontWeight: 600 }}>Loading quizzes...</p>}
        {error && (
          <p style={{ color: '#b91c1c', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 12px', fontWeight: 600 }}>
            {error}
          </p>
        )}
        {!loading && !error && questions.length === 0 && <p style={{ color: '#6b7280' }}>No quizzes available.</p>}

        {questions.length > 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ color: '#6b7280', fontSize: 14, fontWeight: 700 }}>
              Showing {questions.length}/10 quizzes
            </div>

          {showResult && score && (
            <div
              style={{
                padding: 24,
                borderRadius: 14,
                background: '#fff',
                border: `1px solid ${theme.givry}`,
                boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
                textAlign: 'center',
                marginBottom: 8
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', fontSize: 32, color: theme.teal }}>My Result</h2>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                  Correct answers: {score.correct} / {score.total}
                </div>
                <div style={{ fontSize: 42, fontWeight: 700, color: score.percent >= 60 ? '#10b981' : '#f59e0b' }}>
                  {score.percent}%
                </div>
              </div>

              {score.percent >= 60 ? (
                <button onClick={downloadCertificate} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: theme.blaze, color: '#fff', fontWeight: 700, cursor: 'pointer', marginRight: 8 }}>
                  Download Certificate
                </button>
              ) : (
                <p style={{ color: '#6b7280', marginBottom: 12 }}>Get at least 60% to download certificate.</p>
              )}

              <button onClick={() => setShowResult(false)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: theme.teal, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          )}

          {questions.map((q, index) => {
            const questionId = index + 1;
            return (
              <div
                key={questionId}
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: '#ffffff',
                  border: `1px solid ${theme.givry}`,
                  boxShadow: '0 8px 24px rgba(15,23,42,0.06)'
                }}
              >
                <div style={{ marginBottom: 12, fontWeight: 700, color: theme.teal, lineHeight: 1.45 }}>
                  Q{questionId}. {q.questionText}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  {q.options.map((opt, idx) => {
                    const selected = answers[questionId];
                    const isChosen = selected && selected.text === opt.text;
                    let background = isChosen ? '#e7f0ff' : '#fff';
                    let borderColor = isChosen ? '#93c5fd' : '#e5e7eb';
                    let color = '#111827';

                    if (submitted) {
                      if (opt.isCorrect) {
                        background = '#dcfce7';
                        borderColor = '#16a34a';
                        color = '#166534';
                      } else if (isChosen && !opt.isCorrect) {
                        background = '#fee2e2';
                        borderColor = '#dc2626';
                        color = '#991b1b';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(questionId, opt)}
                        disabled={submitted}
                        style={{
                          padding: '11px 12px',
                          borderRadius: 10,
                          border: `1px solid ${borderColor}`,
                          background,
                          color,
                          cursor: submitted ? 'default' : 'pointer',
                          textAlign: 'left',
                          fontWeight: 600
                        }}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {submitted && answers[questionId] && (
                  <p style={{ marginTop: 8, fontWeight: 700, color: answers[questionId].isCorrect ? '#166534' : '#991b1b' }}>
                    {answers[questionId].isCorrect ? 'Correct answer' : 'Incorrect answer'}
                  </p>
                )}
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              onClick={resetAll}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${theme.teal}`,
                background: '#fff',
                color: theme.teal,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: theme.teal,
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(5,54,104,0.25)'
                }}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => setShowResult(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: theme.teal,
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(5,54,104,0.25)'
                }}
              >
                View my result
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Quits;
