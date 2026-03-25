import { useState } from 'react';
import { createChannel } from '../../api/community.api';

const CreateChannelModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', subject: '', description: '', expertName: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.subject.trim()) return alert('Name and Subject are required');
    setLoading(true);
    try {
      const res = await createChannel(form);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      background: '#fff', borderRadius: 16, padding: 28,
      width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    },
    title: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#222' },
    label: { fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' },
    input: {
      width: '100%', border: '1px solid #ddd', borderRadius: 8,
      padding: '10px 12px', fontSize: 14, marginBottom: 14,
      fontFamily: 'inherit', boxSizing: 'border-box',
    },
    btnRow: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
    btn: {
      border: 'none', borderRadius: 8, padding: '10px 20px',
      cursor: 'pointer', fontWeight: 600, fontSize: 14,
    },
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>📌 Create Channel</div>

        <label style={s.label}>Channel Name *</label>
        <input style={s.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Mathematics" />

        <label style={s.label}>Subject *</label>
        <input style={s.input} name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Algebra" />

        <label style={s.label}>Description</label>
        <input style={s.input} name="description" value={form.description} onChange={handleChange} placeholder="Short description..." />

        <label style={s.label}>Expert / Lecturer Name</label>
        <input style={s.input} name="expertName" value={form.expertName} onChange={handleChange} placeholder="e.g. Dr. Silva" />
        <p style={{ fontSize: 11, color: '#aaa', marginTop: -10, marginBottom: 14 }}>
          🔒 Expert contact details are kept private
        </p>

        <div style={s.btnRow}>
          <button style={{ ...s.btn, background: '#f0f0f0', color: '#555' }} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btn, background: '#6c63ff', color: '#fff' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
