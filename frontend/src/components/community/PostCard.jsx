import { useState, useContext } from 'react';
import { toggleLike, updatePost, deletePost } from '../../api/community.api';
import { AuthContext } from '../../context/AuthContext';
import CommentBox from './CommentBox';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const PostCard = ({ post, channelId, onDeleted, onUpdated }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editTitle, setEditTitle] = useState(post.title);
  const [likes, setLikes] = useState(post.likes || []);
  const [liking, setLiking] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOwner = post.author?._id === user?._id;
  const isLiked = likes.includes(user?._id);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await toggleLike(post._id);
      // Optimistic update (socket will also sync)
      if (res.data.liked) {
        setLikes((prev) => [...prev, user._id]);
      } else {
        setLikes((prev) => prev.filter((id) => id !== user._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await updatePost(post._id, { title: editTitle, content: editContent });
      onUpdated(res.data.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post._id);
      onDeleted(post._id);
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const isAnnouncement = post.type === 'announcement';

  const s = {
    card: {
      background: '#fff',
      borderRadius: 14,
      padding: '18px 20px',
      marginBottom: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      border: isAnnouncement ? '2px solid #f39c12' : '1px solid #eee',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    authorRow: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: {
      width: 38, height: 38, borderRadius: '50%',
      background: isAnnouncement ? '#f39c12' : '#6c63ff',
      color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize: 15,
    },
    name: { fontWeight: 600, fontSize: 14 },
    badge: {
      fontSize: 11, padding: '2px 8px', borderRadius: 10,
      background: isAnnouncement ? '#fff3cd' : '#ede7ff',
      color: isAnnouncement ? '#e67e22' : '#6c63ff',
      fontWeight: 600, border: `1px solid ${isAnnouncement ? '#f39c12' : '#c9b8ff'}`,
    },
    time: { fontSize: 12, color: '#aaa' },
    title: { fontWeight: 700, fontSize: 17, marginBottom: 6, color: '#222' },
    content: { fontSize: 14, color: '#444', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
    footer: {
      display: 'flex', gap: 12, marginTop: 14,
      paddingTop: 10, borderTop: '1px solid #f0f0f0', alignItems: 'center',
    },
    likeBtn: {
      border: 'none', background: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5,
      color: isLiked ? '#e74c3c' : '#888', fontWeight: 600, fontSize: 14,
    },
    commentBtn: {
      border: 'none', background: 'none', cursor: 'pointer',
      color: '#6c63ff', fontWeight: 600, fontSize: 14,
    },
    actionBtn: {
      border: 'none', background: 'none', cursor: 'pointer',
      fontSize: 13, padding: '4px 10px', borderRadius: 6,
    },
    textarea: {
      width: '100%', border: '1px solid #ddd', borderRadius: 8,
      padding: '8px 12px', fontSize: 14, resize: 'vertical',
      fontFamily: 'inherit', marginBottom: 8,
    },
    saveBtn: {
      background: '#6c63ff', color: '#fff', border: 'none',
      borderRadius: 8, padding: '6px 16px', cursor: 'pointer',
      fontWeight: 600, marginRight: 8,
    },
  };

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.authorRow}>
          <div style={s.avatar}>{post.author?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={s.name}>{post.author?.name}</span>
              <span style={s.badge}>
                {isAnnouncement ? '📢 Announcement' : post.author?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
            <div style={s.time}>{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        {(isAdmin || isOwner) && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              style={{ ...s.actionBtn, color: '#6c63ff' }}
              onClick={() => setEditing(!editing)}
            >
              ✏️
            </button>
            <button
              style={{ ...s.actionBtn, color: '#e74c3c' }}
              onClick={handleDelete}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div>
          <input
            style={{ ...s.textarea, height: 38 }}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title (optional)"
          />
          <textarea
            style={s.textarea}
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <button style={s.saveBtn} onClick={handleUpdate}>Save</button>
          <button
            style={{ ...s.saveBtn, background: '#aaa' }}
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {post.title && <div style={s.title}>{post.title}</div>}
          <div style={s.content}>{post.content}</div>
        </>
      )}

      {/* Footer */}
      <div style={s.footer}>
        <button style={s.likeBtn} onClick={handleLike} disabled={liking}>
          {isLiked ? '❤️' : '🤍'} {likes.length}
        </button>
        <button style={s.commentBtn} onClick={() => setShowComments(!showComments)}>
          💬 {showComments ? 'Hide' : 'Comments'}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentBox post={post} channelId={channelId} />
      )}
    </div>
  );
};

export default PostCard;
