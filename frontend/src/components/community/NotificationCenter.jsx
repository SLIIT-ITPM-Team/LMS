import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './NotificationCenter.css';

const NotificationCenter = ({ token, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();

    // Setup Socket.io connection
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
    });

    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/community/notifications/unread/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/community/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/community/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(unreadCount - 1, 0));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return notifDate.toLocaleDateString();
  };

  return (
    <div className="notification-center">
      <button
        className="notification-btn"
        onClick={handleShowNotifications}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button
              className="btn-close"
              onClick={() => setShowNotifications(false)}
            >
              ✕
            </button>
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <img
                    src={notification.actor?.avatar || 'https://via.placeholder.com/32'}
                    alt={notification.actor?.firstName}
                    className="notif-avatar"
                  />
                  <div className="notif-content">
                    <h5 className="notif-title">{notification.title}</h5>
                    <p className="notif-message">{notification.message}</p>
                    <small className="notif-time">{formatDate(notification.createdAt)}</small>
                  </div>
                  {!notification.isRead && <span className="unread-indicator">●</span>}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
