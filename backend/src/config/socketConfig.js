const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

let io;
const connectedUsers = new Map();

exports.initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  global.io = io;

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      connectedAt: new Date(),
    });

    // Broadcast user online status
    io.emit('userOnline', {
      userId: socket.userId,
      status: 'online',
      timestamp: new Date(),
    });

    // Join user's personal room for notifications
    socket.join(`user-${socket.userId}`);

    // =================== CHANNEL EVENTS ===================

    // Join channel room
    socket.on('joinChannel', (channelId) => {
      socket.join(`channel-${channelId}`);
      console.log(`User ${socket.userId} joined channel ${channelId}`);

      // Broadcast user joined
      io.to(`channel-${channelId}`).emit('userJoinedChannel', {
        userId: socket.userId,
        channelId,
        timestamp: new Date(),
      });
    });

    // Leave channel room
    socket.on('leaveChannel', (channelId) => {
      socket.leave(`channel-${channelId}`);
      console.log(`User ${socket.userId} left channel ${channelId}`);

      io.to(`channel-${channelId}`).emit('userLeftChannel', {
        userId: socket.userId,
        channelId,
        timestamp: new Date(),
      });
    });

    // =================== POST EVENTS ===================

    // Join post room (for comment updates)
    socket.on('joinPost', (postId) => {
      socket.join(`post-${postId}`);
      console.log(`User ${socket.userId} joined post ${postId}`);
    });

    // Leave post room
    socket.on('leavePost', (postId) => {
      socket.leave(`post-${postId}`);
    });

    // Send typing indicator
    socket.on('isTyping', ({ channelId, postId }) => {
      if (channelId) {
        io.to(`channel-${channelId}`).emit('userTyping', {
          userId: socket.userId,
          channelId,
        });
      }

      if (postId) {
        io.to(`post-${postId}`).emit('userTyping', {
          userId: socket.userId,
          postId,
        });
      }
    });

    // Stop typing indicator
    socket.on('stopTyping', ({ channelId, postId }) => {
      if (channelId) {
        io.to(`channel-${channelId}`).emit('userStoppedTyping', {
          userId: socket.userId,
          channelId,
        });
      }

      if (postId) {
        io.to(`post-${postId}`).emit('userStoppedTyping', {
          userId: socket.userId,
          postId,
        });
      }
    });

    // =================== COMMENT EVENTS ===================

    // Join comment thread
    socket.on('joinComment', (commentId) => {
      socket.join(`comment-${commentId}`);
    });

    // Leave comment thread
    socket.on('leaveComment', (commentId) => {
      socket.leave(`comment-${commentId}`);
    });

    // =================== PRESENCE EVENTS ===================

    // Get online users in channel
    socket.on('getOnlineUsers', (channelId) => {
      const onlineUsers = Array.from(connectedUsers.entries()).map(([userId, data]) => ({
        userId,
        socketId: data.socketId,
      }));

      socket.emit('onlineUsers', onlineUsers);
    });

    // =================== NOTIFICATION EVENTS ===================

    // Send real-time notification
    socket.on('sendNotification', async (notificationData) => {
      try {
        const notification = new Notification(notificationData);
        await notification.save();

        // Send to recipient
        io.to(`user-${notificationData.recipient}`).emit('newNotification', notification);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });

    // =================== PRESENCE BROADCAST ===================

    // Broadcast user activity
    socket.on('userActivity', (activity) => {
      io.emit('userActivity', {
        userId: socket.userId,
        activity,
        timestamp: new Date(),
      });
    });

    // =================== DISCONNECT EVENT ===================

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);

      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Broadcast user offline status
      io.emit('userOffline', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date(),
      });
    });

    // =================== ERROR HANDLING ===================

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Helper function to send notification to user
exports.sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('newNotification', notification);
  }
};

// Helper function to broadcast to channel
exports.broadcastToChannel = (channelId, event, data) => {
  if (io) {
    io.to(`channel-${channelId}`).emit(event, data);
  }
};

// Helper function to broadcast to post
exports.broadcastToPost = (postId, event, data) => {
  if (io) {
    io.to(`post-${postId}`).emit(event, data);
  }
};

// Get connected users
exports.getConnectedUsers = () => {
  return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
    userId,
    ...data,
  }));
};

// Check if user is online
exports.isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Get IO instance
exports.getIO = () => {
  return io;
};
