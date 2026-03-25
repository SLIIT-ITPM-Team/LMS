const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/community.controller');
const { protect } = require('../middlewares/auth.middleware');

// Admin guard
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ── Channels ──────────────────────────────
router.get('/channels', protect, ctrl.getChannels);
router.get('/channels/:id', protect, ctrl.getChannel);
router.post('/channels', protect, adminOnly, ctrl.createChannel);
router.put('/channels/:id', protect, adminOnly, ctrl.updateChannel);
router.delete('/channels/:id', protect, adminOnly, ctrl.deleteChannel);

// ── Posts ─────────────────────────────────
router.get('/channels/:channelId/posts', protect, ctrl.getPostsByChannel);
router.post('/posts', protect, ctrl.createPost);
router.put('/posts/:id', protect, ctrl.updatePost);
router.delete('/posts/:id', protect, ctrl.deletePost);

// ── Likes ─────────────────────────────────
router.post('/posts/:id/like', protect, ctrl.toggleLike);

// ── Comments ──────────────────────────────
router.get('/posts/:postId/comments', protect, ctrl.getCommentsByPost);
router.post('/posts/:postId/comments', protect, ctrl.createComment);
router.put('/comments/:id', protect, ctrl.updateComment);
router.delete('/comments/:id', protect, ctrl.deleteComment);

module.exports = router;
