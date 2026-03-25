import React, { useState } from 'react';
import axios from 'axios';
import './PostCard.css';
import CommentThread from './CommentThread';

const PostCard = ({ post, token, user, channelId }) => {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(id => id === user._id || id._id === user._id) || false
  );
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const handleLikePost = async () => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await axios.post(
        `${API_BASE_URL}/community/posts/${post._id}/${endpoint}`,
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
      console.error('Error liking post:', error);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(commentCount + 1);
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString();
  };

  const isAuthor = post.author?._id === user._id || post.author === user._id;
  const isAdmin = user.role === 'admin';

  return (
    <div className={`post-card ${post.isPinned ? 'pinned' : ''} ${post.type === 'announcement' ? 'announcement' : ''}`}>
      {post.isPinned && <div className="pinned-badge">📌 Pinned</div>}
      {post.type === 'announcement' && <div className="announcement-badge">📢 Announcement</div>}

      <div className="post-header">
        <div className="post-author-info">
          <img
            src={post.author?.avatar || 'https://via.placeholder.com/40'}
            alt={post.author?.firstName}
            className="author-avatar"
          />
          <div className="author-details">
            <h4 className="author-name">
              {post.author?.firstName} {post.author?.lastName}
            </h4>
            <p className="post-timestamp">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {(isAuthor || isAdmin) && (
          <div className="post-actions">
            <button className="btn-action" title="Edit">✏️</button>
            <button className="btn-action" title="Delete">🗑️</button>
          </div>
        )}
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-body">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.isEdited && (
          <p className="post-edited">
            edited {new Date(post.editedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="post-stats">
        <span className="stat">👁️ {post.viewCount || 0} views</span>
        <span className="stat">❤️ {likeCount} likes</span>
        <span className="stat">💬 {commentCount} comments</span>
      </div>

      <div className="post-footer">
        <button
          className={`btn-engagement ${isLiked ? 'liked' : ''}`}
          onClick={handleLikePost}
        >
          {isLiked ? '❤️' : '🤍'} Like
        </button>
        <button
          className="btn-engagement"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
        <button className="btn-engagement">
          🔗 Share
        </button>
      </div>

      {showComments && (
        <CommentThread
          postId={post._id}
          token={token}
          user={user}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
};

export default PostCard;
