import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateChannelModal.css';

const CreateChannelModal = ({ onClose, onChannelCreated, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: 'General',
    subject: '',
    subjectMatterExpertId: '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const topics = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'Databases',
    'DevOps',
    'UI/UX',
    'General',
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Channel name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.subjectMatterExpertId) {
      setError('Please select a Subject Matter Expert');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/community/channels`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onChannelCreated(response.data.data);
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating channel');
      console.error('Error creating channel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Channel</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-channel-form">
          <div className="form-group">
            <label htmlFor="name">Channel Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g., React Basics"
              value={formData.name}
              onChange={handleInputChange}
              maxLength={50}
            />
            <small>{formData.name.length}/50</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Brief description of the channel"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              maxLength={200}
            />
            <small>{formData.description.length}/200</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="topic">Topic *</label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
              >
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="e.g., Component Development"
                value={formData.subject}
                onChange={handleInputChange}
                maxLength={100}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sme">Subject Matter Expert *</label>
            <select
              id="sme"
              name="subjectMatterExpertId"
              value={formData.subjectMatterExpertId}
              onChange={handleInputChange}
            >
              <option value="">Select an expert...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {users.length === 0 && (
              <small className="warning">No users available. Please create users first.</small>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
