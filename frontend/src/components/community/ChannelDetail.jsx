import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './ChannelDetail.css';
import PostForm from './PostForm';
import PostCard from './PostCard';
import SMECard from './SMECard';

const ChannelDetail = ({ channel, token, user, onChannelJoined }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isChannelMember, setIsChannelMember] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [socket, setSocket] = useState(null);
  const [page, setPage] = useState(1);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    // Check if user is channel member
    const isMember = channel.members?.some(m => m._id === user._id || m === user._id);
    setIsChannelMember(isMember);

    // Fetch posts
    fetchPosts();

    // Setup Socket.io connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
      auth: {
        token,
      },
    });

    setSocket(newSocket);

    newSocket.on('newPost', (post) => {
      setPosts([post, ...posts]);
    });

    newSocket.on('postUpdated', (post) => {
      setPosts(posts.map(p => (p._id === post._id ? post : p)));
    });

    newSocket.on('postDeleted', ({ postId }) => {
      setPosts(posts.filter(p => p._id !== postId));
    });

    newSocket.on('postLiked', ({ postId, likeCount }) => {
      setPosts(posts.map(p =>
        p._id === postId ? { ...p, likeCount } : p
      ));
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leaveChannel', channel._id);
        newSocket.disconnect();
      }
    };
  }, [channel._id, user._id, token]);

  useEffect(() => {
    if (socket) {
      socket.emit('joinChannel', channel._id);
    }
  }, [socket, channel._id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/community/channels/${channel._id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: 10,
          },
        }
      );

      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/community/channels/${channel._id}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsChannelMember(true);
        onChannelJoined(channel._id);
      }
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowPostForm(false);
  };

  const handleLeaveChannel = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/community/channels/${channel._id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsChannelMember(false);
      }
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  return (
    <div className="channel-detail">
      <div className="channel-header-detail">
        <div className="channel-header-info">
          <h2>#{channel.name}</h2>
          <p className="channel-description">{channel.description}</p>
          <p className="channel-subject">📌 {channel.subject}</p>
        </div>
        <div className="channel-actions">
          {!isChannelMember ? (
            <button className="btn btn-primary" onClick={handleJoinChannel}>
              Join Channel
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={handleLeaveChannel}>
              Leave Channel
            </button>
          )}
        </div>
      </div>

      <div className="channel-content-wrapper">
        <div className="channel-posts">
          {isChannelMember && (
            <>
              {!showPostForm && (
                <button
                  className="btn btn-create-post"
                  onClick={() => setShowPostForm(true)}
                >
                  Create New Post
                </button>
              )}

              {showPostForm && (
                <PostForm
                  channelId={channel._id}
                  token={token}
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowPostForm(false)}
                  userRole={user?.role}
                />
              )}
            </>
          )}

          <div className="posts-list">
            {loading ? (
              <div className="loading-spinner">Loading posts...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  token={token}
                  user={user}
                  channelId={channel._id}
                />
              ))
            ) : (
              <div className="no-posts">
                <p>No posts yet</p>
                <small>Be the first to start a discussion!</small>
              </div>
            )}
          </div>
        </div>

        <div className="channel-sidebar-detail">
          <SMECard sme={channel.subjectMatterExpert} channelName={channel.name} />

          <div className="channel-stats">
            <h3>Channel Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Members</span>
              <span className="stat-value">{channel.memberCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posts</span>
              <span className="stat-value">{posts.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Created</span>
              <span className="stat-value">
                {new Date(channel.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="channel-guidelines">
            <h3>Guidelines</h3>
            <ul>
              <li>Be respectful and professional</li>
              <li>Stay on topic</li>
              <li>Search before posting</li>
              <li>No spam or harassment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetail;
