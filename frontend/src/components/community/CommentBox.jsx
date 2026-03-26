import { useState, useEffect, useContext } from 'react';
import { getCommentsByPost, createComment, updateComment, deleteComment } from '../../api/community.api';
import { AuthContext } from '../../context/AuthContext';
import socket from '../../utils/socket';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CommentBox = ({ post, channelId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, authorName }
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();

    socket.on('comment:new', (comment) => {
      if (comment.post === post._id) {
        setComments((prev) => [...prev, comment]);
      }
    });
    socket.on('comment:updated', (updated) => {
      setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    });
    socket.on('comment:deleted', ({ id }) => {
      setComments((prev) => prev.filter((c) => c._id !== id));
    });

    return () => {
      socket.off('comment:new');
      socket.off('comment:updated');
      socket.off('comment:deleted');
    };
  }, [post._id]);

  const fetchComments = async () => {
    try {
      const res = await getCommentsByPost(post._id);
      setComments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await createComment(post._id, {
        content: text,
        parentCommentId: replyTo?.id || null,
      });
      setText('');
      setReplyTo(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await updateComment(id, { content: editText });
      setEditingId(null);
      setEditText('');
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(id);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // Build tree: top-level comments + their replies
  const topLevel = comments.filter((c) => !c.parentComment);
  const replies = (parentId) => comments.filter((c) => c.parentComment === parentId);

  const canDelete = (comment) =>
    user?.role === 'admin' || comment.author?._id === user?._id;

  const canReply = (comment) => {
    // Admin can reply to anyone; users can only reply to admin's comments
    if (user?.role === 'admin') return true;
    return comment.author?.role === 'admin';
  };

  const styles = {
    wrap: { padding: '12px 0' },
    comment: {
      display: 'flex', gap: 10, marginBottom: 12,
    },
    avatar: {
      width: 32, height: 32, borderRadius: '50%',
      background: '#6c63ff', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13, flexShrink: 0,
    },
    bubble: {
      background: '#f1f3f5', borderRadius: 12,
      padding: '8px 12px', flex: 1,
    },
    author: { fontWeight: 600, fontSize: 13 },
    role: {
      fontSize: 11, marginLeft: 6, padding: '1px 6px',
      borderRadius: 10, background: '#6c63ff', color: '#fff',
    },
    content: { fontSize: 14, marginTop: 4, color: '#333' },
    meta: { fontSize: 11, color: '#888', marginTop: 4, display: 'flex', gap: 12 },
    metaBtn: {
      cursor: 'pointer', color: '#6c63ff', fontWeight: 600,
      border: 'none', background: 'none', padding: 0, fontSize: 11,
    },
    replyWrap: { marginLeft: 42 },
    inputRow: {
      display: 'flex', gap: 8, marginTop: 12, alignItems: 'flex-start',
    },
    textarea: {
      flex: 1, border: '1px solid #ddd', borderRadius: 8,
      padding: '8px 12px', fontSize: 14, resize: 'none',
      fontFamily: 'inherit',
    },
    sendBtn: {
      background: '#6c63ff', color: '#fff', border: 'none',
      borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
      fontWeight: 600, fontSize: 13,
    },
    replyBanner: {
      background: '#eee', borderRadius: 8, padding: '4px 10px',
      fontSize: 12, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 6,
    },
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div style={{ ...styles.comment, marginLeft: isReply ? 42 : 0 }}>
      <div style={styles.avatar}>
        {comment.author?.name?.[0]?.toUpperCase() || 'U'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={styles.bubble}>
          <div>
            <span style={styles.author}>{comment.author?.name}</span>
            {comment.author?.role === 'admin' && (
              <span style={styles.role}>Admin</span>
            )}
          </div>
          {editingId === comment._id ? (
            <div>
              <textarea
                style={styles.textarea}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button style={styles.sendBtn} onClick={() => handleEdit(comment._id)}>Save</button>
                <button
                  style={{ ...styles.sendBtn, background: '#aaa' }}
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={styles.content}>{comment.content}</p>
          )}
        </div>
        <div style={styles.meta}>
          <span>{timeAgo(comment.createdAt)}</span>
          {!isReply && canReply(comment) && (
            <button
              style={styles.metaBtn}
              onClick={() => setReplyTo({ id: comment._id, authorName: comment.author?.name })}
            >
              Reply
            </button>
          )}
          {comment.author?._id === user?._id && (
            <button
              style={styles.metaBtn}
              onClick={() => { setEditingId(comment._id); setEditText(comment.content); }}
            >
              Edit
            </button>
          )}
          {canDelete(comment) && (
            <button
              style={{ ...styles.metaBtn, color: '#e74c3c' }}
              onClick={() => handleDelete(comment._id)}
            >
              Delete
            </button>
          )}
        </div>
        {/* Replies to this comment */}
        {replies(comment._id).map((reply) => (
          <CommentItem key={reply._id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.wrap}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>
        💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </p>

      {topLevel.map((c) => (
        <CommentItem key={c._id} comment={c} />
      ))}

      {/* Input */}
      <div>
        {replyTo && (
          <div style={styles.replyBanner}>
            <span>↩ Replying to <strong>{replyTo.authorName}</strong></span>
            <button style={styles.metaBtn} onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <div style={styles.inputRow}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <textarea
            style={styles.textarea}
            rows={2}
            placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : 'Write a comment...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button style={styles.sendBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
