import { useState, useContext } from 'react';
import { createPost } from '../../api/community.api';
import { AuthContext } from '../../context/AuthContext';

const CreatePostModal = ({ channelId, onClose, onCreated }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('post');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await createPost({
        channelId,
        title: trimmedTitle,
        content: trimmedContent,
        type,
      });
      onCreated?.(res.data.data);
      onClose();
      setTitle('');
      setContent('');
      setType('post');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: 16,
    },
    modal: {
      background: '#ffffff', borderRadius: 18, padding: 32,
      width: '100%', maxWidth: 540,
      boxShadow: '0 24px 60px rgba(15,23,42,0.15)',
      border: '1px solid #e5e7eb',
    },
    title: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#1f2937' },
    label: {
      fontSize: 13, fontWeight: 600, color: '#374151',
      marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5,
    },
    input: {
      width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '10px 14px', fontSize: 14, marginBottom: 16,
      fontFamily: 'inherit', boxSizing: 'border-box',
      background: '#f9fafb', color: '#1f2937',
    },
    select: {
      width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '10px 14px', fontSize: 14, marginBottom: 16,
      background: '#f9fafb', color: '#1f2937', cursor: 'pointer',
    },
    btnRow: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 },
    btn: {
      border: 'none', borderRadius: 10, padding: '10px 18px',
      cursor: 'pointer', fontWeight: 600, fontSize: 13,
      transition: 'transform 0.2s ease',
    },
    error: {
      color: '#dc2626',
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 12,
    },
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>📝 Create New Post</div>

        {isAdmin && (
          <>
            <label style={s.label}>Post Type</label>
            <select style={s.select} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="post">Post</option>
              <option value="announcement">📢 Announcement</option>
            </select>
          </>
        )}

        <label style={s.label}>Title *</label>
        <input
          style={s.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
        />

        <label style={s.label}>Content *</label>
        <textarea
          style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
        />

        {error && <div style={s.error}>{error}</div>}

        <div style={s.btnRow}>
          <button
            style={{ ...s.btn, background: '#f3f4f6', color: '#374151' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{ ...s.btn, background: '#7c3aed', color: '#fff' }}
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
