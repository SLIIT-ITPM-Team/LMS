const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/channel.controller');
const { protect } = require('../middlewares/auth.middleware');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.post('/', protect, adminOnly, ctrl.createChannel);
router.get('/', protect, ctrl.getAllChannels);
router.delete('/', protect, adminOnly, ctrl.deleteAllChannels);
router.get('/:channelId', protect, ctrl.getChannelById);
router.put('/:channelId', protect, adminOnly, ctrl.updateChannel);
router.delete('/:channelId', protect, adminOnly, ctrl.deleteChannel);
router.post('/:channelId/join', protect, ctrl.joinChannel);
router.post('/:channelId/leave', protect, ctrl.leaveChannel);

module.exports = router;
