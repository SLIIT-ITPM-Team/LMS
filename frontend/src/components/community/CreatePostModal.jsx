import { useState, useContext } from 'react';
import { createPost } from '../../api/community.api';
import { AuthContext } from '../../context/AuthContext';

const CreatePostModal = ({ channelId, onClose, onCreated }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('post');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async () => {
    if (!content.trim()) return alert('Content is required');
    setLoading(true);
    try {
      const res = await createPost({ channelId, title, content, type });
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create post');
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
      width: '100%', maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    },
    title: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#222' },
    label: { fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' },
    input: {
      width: '100%', border: '1px solid #ddd', borderRadius: 8,
      padding: '10px 12px', fontSize: 14, marginBottom: 14,
      fontFamily: 'inherit', boxSizing: 'border-box',
    },
    select: {
      width: '100%', border: '1px solid #ddd', borderRadius: 8,
      padding: '10px 12px', fontSize: 14, marginBottom: 14,
      background: '#fff', cursor: 'pointer',
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

        <label style={s.label}>Title (optional)</label>
        <input
          style={s.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
        />

        <label style={s.label}>Content *</label>
        <textarea
          style={{ ...s.input, resize: 'vertical', minHeight: 100 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
        />

        <div style={s.btnRow}>
          <button
            style={{ ...s.btn, background: '#f0f0f0', color: '#555' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{ ...s.btn, background: '#6c63ff', color: '#fff' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
