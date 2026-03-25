import React, { useState } from 'react';
import axios from 'axios';
import './PostForm.css';

const PostForm = ({ channelId, token, onPostCreated, onCancel, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const response = await axios.post(
        `${API_BASE_URL}/community/posts`,
        {
          title: formData.title.trim(),
          content: formData.content.trim(),
          channelId,
          type: isAnnouncement ? 'announcement' : 'post',
          tags,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onPostCreated(response.data.data);
        setFormData({ title: '', content: '', tags: '' });
        setIsAnnouncement(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating post');
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form">
      <h3>Create New {isAnnouncement ? 'Announcement' : 'Post'}</h3>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {userRole === 'admin' && (
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isAnnouncement"
              checked={isAnnouncement}
              onChange={(e) => setIsAnnouncement(e.target.checked)}
            />
            <label htmlFor="isAnnouncement">Post as Announcement</label>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Post title"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={200}
          />
          <small>{formData.title.length}/200</small>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your post content..."
            value={formData.content}
            onChange={handleInputChange}
            rows={5}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            name="tags"
            placeholder="e.g., react, javascript, help"
            value={formData.tags}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
