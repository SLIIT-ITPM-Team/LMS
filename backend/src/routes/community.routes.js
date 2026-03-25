const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Import controllers
const channelController = require('../controllers/ChannelController');
const postController = require('../controllers/PostController');
const commentController = require('../controllers/CommentController');
const notificationController = require('../controllers/NotificationController');

// ======================== CHANNEL ROUTES ========================

// Create channel (Admin only)
router.post('/channels', verifyToken, isAdmin, channelController.createChannel);

// Get all channels
router.get('/channels', verifyToken, channelController.getAllChannels);

// Get channel by ID
router.get('/channels/:channelId', verifyToken, channelController.getChannelById);

// Update channel (Admin only)
router.put('/channels/:channelId', verifyToken, isAdmin, channelController.updateChannel);

// Delete channel (Admin only)
router.delete('/channels/:channelId', verifyToken, isAdmin, channelController.deleteChannel);

// Join channel
router.post('/channels/:channelId/join', verifyToken, channelController.joinChannel);

// Leave channel
router.post('/channels/:channelId/leave', verifyToken, channelController.leaveChannel);

// ======================== POST ROUTES ========================

// Create post or announcement
router.post('/posts', verifyToken, postController.createPost);

// Get posts by channel
router.get('/channels/:channelId/posts', verifyToken, postController.getPostsByChannel);

// Get post by ID
router.get('/posts/:postId', verifyToken, postController.getPostById);

// Update post
router.put('/posts/:postId', verifyToken, postController.updatePost);

// Delete post
router.delete('/posts/:postId', verifyToken, postController.deletePost);

// Like post
router.post('/posts/:postId/like', verifyToken, postController.likePost);

// Unlike post
router.post('/posts/:postId/unlike', verifyToken, postController.unlikePost);

// Pin post (Admin only)
router.post('/posts/:postId/pin', verifyToken, isAdmin, postController.pinPost);

// Unpin post (Admin only)
router.post('/posts/:postId/unpin', verifyToken, isAdmin, postController.unpinPost);

// ======================== COMMENT ROUTES ========================

// Create comment on post
router.post('/posts/:postId/comments', verifyToken, commentController.createComment);

// Get comments by post
router.get('/posts/:postId/comments', verifyToken, commentController.getCommentsByPost);

// Get comment by ID
router.get('/comments/:commentId', verifyToken, commentController.getCommentById);

// Update comment
router.put('/comments/:commentId', verifyToken, commentController.updateComment);

// Delete comment
router.delete('/comments/:commentId', verifyToken, commentController.deleteComment);

// Reply to comment
router.post('/comments/:commentId/reply', verifyToken, commentController.replyToComment);

// Like comment
router.post('/comments/:commentId/like', verifyToken, commentController.likeComment);

// Unlike comment
router.post('/comments/:commentId/unlike', verifyToken, commentController.unlikeComment);

// ======================== NOTIFICATION ROUTES ========================

// Get user notifications
router.get('/notifications', verifyToken, notificationController.getUserNotifications);

// Get unread count
router.get('/notifications/unread/count', verifyToken, notificationController.getUnreadCount);

// Get notification by ID
router.get('/notifications/:notificationId', verifyToken, notificationController.getNotificationById);

// Mark notification as read
router.put('/notifications/:notificationId/read', verifyToken, notificationController.markAsRead);

// Mark all notifications as read
router.put('/notifications/read/all', verifyToken, notificationController.markAllAsRead);

// Delete notification
router.delete('/notifications/:notificationId', verifyToken, notificationController.deleteNotification);

// Delete all notifications
router.delete('/notifications/delete/all', verifyToken, notificationController.deleteAllNotifications);

module.exports = router;
