import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommunityPage.css';
import ChannelList from './ChannelList';
import ChannelDetail from './ChannelDetail';
import CreateChannelModal from './CreateChannelModal';
import NotificationCenter from './NotificationCenter';

const CommunityPage = ({ token, user }) => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/community/channels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setChannels(response.data.data);
        // Select first channel if available
        if (response.data.data.length > 0 && !selectedChannel) {
          setSelectedChannel(response.data.data[0]);
        }
      }
    } catch (error) {
      setError('Error fetching channels');
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelCreated = (newChannel) => {
    setChannels([newChannel, ...channels]);
    setSelectedChannel(newChannel);
  };

  const handleChannelJoined = (channelId) => {
    // Refresh channels to update member count
    fetchChannels();
  };

  return (
    <div className="community-page">
      <header className="community-header">
        <h1>🌍 Community & Channels</h1>
        <NotificationCenter token={token} user={user} />
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="community-container">
        <aside className="channels-sidebar">
          <div className="sidebar-header">
            <h2>Channels</h2>
            {user?.role === 'admin' && (
              <button
                className="btn btn-primary btn-small"
                onClick={() => setShowCreateModal(true)}
              >
                + New Channel
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading channels...</div>
          ) : (
            <ChannelList
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              userRole={user?.role}
            />
          )}
        </aside>

        <main className="community-main">
          {selectedChannel ? (
            <ChannelDetail
              channel={selectedChannel}
              token={token}
              user={user}
              onChannelJoined={handleChannelJoined}
            />
          ) : (
            <div className="no-channel-selected">
              <p>Select a channel to start or create a new one</p>
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onChannelCreated={handleChannelCreated}
          token={token}
        />
      )}
    </div>
  );
};

export default CommunityPage;
