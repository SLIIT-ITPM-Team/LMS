const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, ctrl.getUserNotifications);
router.get('/unread-count', protect, ctrl.getUnreadCount);
router.get('/:notificationId', protect, ctrl.getNotificationById);
router.patch('/:notificationId/read', protect, ctrl.markAsRead);
router.patch('/read-all', protect, ctrl.markAllAsRead);
router.delete('/:notificationId', protect, ctrl.deleteNotification);
router.delete('/', protect, ctrl.deleteAllNotifications);

module.exports = router;
