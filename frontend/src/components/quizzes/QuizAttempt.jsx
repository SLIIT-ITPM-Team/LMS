import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import theme from '../theme';

const AddSummary = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!summary.trim()) {
      setError('Please enter a summary first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/api/quiz/from-summary', {
        summary: summary.trim(),
      });
      navigate(`/quiz/${response.data._id}/quits`);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('Cannot reach backend server. Please start backend and try again.');
      } else {
        setError('Failed to generate quiz from summary.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(145deg, ${theme.givry} 0%, #ffffff 55%, ${theme.givry} 100%)`,
        padding: '28px 16px'
      }}
    >
      <div
        style={{
          maxWidth: 840,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 18,
          padding: 28,
          border: `1px solid ${theme.givry}`,
          boxShadow: '0 14px 40px rgba(5,54,104,0.12)'
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 30, color: theme.teal, letterSpacing: 0.2 }}>Add Summary</h1>
          <p style={{ marginTop: 8, color: '#6b7280', fontSize: 15 }}>
            Paste your summary and generate 10 quizzes.
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 700, color: theme.teal }}>Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={12}
            placeholder="Paste the summary text here..."
            style={{
              width: '100%',
              padding: 14,
              border: `1px solid ${theme.givry}`,
              borderRadius: 12,
              fontSize: 15,
              resize: 'vertical',
              outline: 'none',
              background: '#fffdf5'
            }}
          />
        </div>

        {error && (
          <p
            style={{
              marginTop: 12,
              color: '#b91c1c',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 10,
              padding: '10px 12px',
              fontWeight: 600
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              border: 'none',
              background: theme.teal,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
              boxShadow: '0 8px 20px rgba(5,54,104,0.25)'
            }}
          >
            {loading ? 'Generating...' : 'Generate 10 Quiz'}
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              border: `1px solid ${theme.teal}`,
              background: '#fff',
              color: theme.teal,
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSummary;
