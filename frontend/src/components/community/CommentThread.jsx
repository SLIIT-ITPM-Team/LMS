import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentThread.css';
import CommentItem from './CommentItem';

const CommentThread = ({ postId, token, user, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
        { content: newComment.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setComments([response.data.data, ...comments]);
        setNewComment('');
        setError('');
        onCommentAdded();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error posting comment');
      console.error('Error posting comment:', error);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  return (
    <div className="comment-thread">
      <h4>Comments</h4>

      {error && <div className="comment-error">{error}</div>}

      <form className="comment-form" onSubmit={handleSubmitComment}>
        <div className="comment-input-wrapper">
          <img
            src={user?.avatar || 'https://via.placeholder.com/40'}
            alt={user?.firstName}
            className="user-avatar"
          />
          <div className="comment-input-group">
            <textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
            <button
              type="submit"
              className="btn btn-primary btn-small"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      </form>

      <div className="comments-list">
        {loading ? (
          <div className="loading">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              token={token}
              user={user}
              onReplyAdded={() => {}}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        ) : (
          <div className="no-comments">
            <p>No comments yet</p>
            <small>Be the first to comment!</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;
