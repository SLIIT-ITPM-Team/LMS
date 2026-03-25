import React from 'react';
import './ChannelList.css';

const ChannelList = ({ channels, selectedChannel, onSelectChannel, userRole }) => {
  const getTopicIcon = (topic) => {
    const icons = {
      JavaScript: '📜',
      Python: '🐍',
      React: '⚛️',
      'Node.js': '🟢',
      Databases: '🗄️',
      DevOps: '🔧',
      'UI/UX': '🎨',
      General: '💬',
    };
    return icons[topic] || '📌';
  };

  const groupedChannels = channels.reduce((acc, channel) => {
    const topic = channel.topic || 'General';
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push(channel);
    return acc;
  }, {});

  return (
    <div className="channel-list">
      {Object.entries(groupedChannels).map(([topic, topicChannels]) => (
        <div key={topic} className="channel-group">
          <h3 className="channel-group-title">
            {getTopicIcon(topic)} {topic}
          </h3>
          <div className="channels-in-group">
            {topicChannels.map((channel) => (
              <div
                key={channel._id}
                className={`channel-item ${selectedChannel?._id === channel._id ? 'active' : ''}`}
                onClick={() => onSelectChannel(channel)}
              >
                <div className="channel-item-header">
                  <div className="channel-name"># {channel.name}</div>
                  {userRole === 'admin' && (
                    <span className="badge badge-admin">Admin</span>
                  )}
                </div>
                <div className="channel-meta">
                  <span className="member-count">👥 {channel.memberCount}</span>
                  <span className="subject">{channel.subject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {channels.length === 0 && (
        <div className="no-channels">
          <p>No channels found</p>
          <small>Create a new channel to get started</small>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
