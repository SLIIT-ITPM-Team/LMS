import React, { useState } from 'react';
import axios from 'axios';
import './CommentItem.css';

const CommentItem = ({ comment, postId, token, user, onReplyAdded, onCommentDeleted }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [replies, setReplies] = useState(comment.replies || []);
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const isAuthor = comment.author?._id === user._id || comment.author === user._id;
  const isAdmin = user.role === 'admin';

  const handleLikeComment = async () => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await axios.post(
        `${API_BASE_URL}/community/comments/${comment._id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikeCount(response.data.data.likeCount);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/community/comments/${comment._id}/reply`,
        {
          content: replyText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReplies([...replies, response.data.data]);
        setReplyText('');
        setShowReplyForm(false);
        onReplyAdded(response.data.data);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/community/comments/${comment._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          onCommentDeleted(comment._id);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return commentDate.toLocaleDateString();
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <img
          src={comment.author?.avatar || 'https://via.placeholder.com/32'}
          alt={comment.author?.firstName}
          className="comment-avatar"
        />
        <div className="comment-author">
          <h5 className="comment-name">
            {comment.author?.firstName} {comment.author?.lastName}
          </h5>
          <p className="comment-date">{formatDate(comment.createdAt)}</p>
        </div>

        {(isAuthor || isAdmin) && (
          <div className="comment-actions">
            {isAuthor && <button className="btn-action" title="Edit">✏️</button>}
            <button className="btn-action" title="Delete" onClick={handleDeleteComment}>🗑️</button>
          </div>
        )}
      </div>

      <div className="comment-body">
        <p>{comment.content}</p>
        {comment.isEdited && (
          <p className="edited-note">
            edited {new Date(comment.editedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="comment-actions-bar">
        <button
          className={`btn-action-text ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeComment}
        >
          {isLiked ? '❤️' : '🤍'} {likeCount > 0 && `${likeCount}`}
        </button>
        <button
          className="btn-action-text"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          💬 Reply
        </button>
        {replies.length > 0 && (
          <button
            className="btn-action-text"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? '▼' : '▶'} {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <form className="reply-form" onSubmit={handleSubmitReply}>
          <div className="reply-input-wrapper">
            <img
              src={user?.avatar || 'https://via.placeholder.com/32'}
              alt={user?.firstName}
              className="reply-avatar"
            />
            <div className="reply-input-group">
              <textarea
                placeholder="Reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
              />
              <div className="reply-buttons">
                <button
                  type="submit"
                  className="btn btn-primary btn-small"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Reply'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {showReplies && replies.length > 0 && (
        <div className="replies-section">
          {replies.map((reply) => (
            <div key={reply._id} className="nested-reply">
              <div className="reply-header">
                <img
                  src={reply.author?.avatar || 'https://via.placeholder.com/24'}
                  alt={reply.author?.firstName}
                  className="reply-avatar-small"
                />
                <div className="reply-author-info">
                  <h6>
                    {reply.author?.firstName} {reply.author?.lastName}
                    {reply.author?._id === comment.author?._id && (
                      <span className="badge badge-author">Author</span>
                    )}
                  </h6>
                  <p className="reply-date">{formatDate(reply.createdAt)}</p>
                </div>
              </div>
              <p className="reply-content">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
