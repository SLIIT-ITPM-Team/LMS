const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/post.controller');
const { protect } = require('../middlewares/auth.middleware');

const adminOnly = (req, res, next) => {
	if (req.user.role !== 'admin') {
		return res.status(403).json({ success: false, message: 'Admin access required' });
	}
	next();
};

router.post('/', protect, ctrl.createPost);
router.get('/channel/:channelId', protect, ctrl.getPostsByChannel);
router.get('/:postId', protect, ctrl.getPostById);
router.put('/:postId', protect, ctrl.updatePost);
router.delete('/:postId', protect, ctrl.deletePost);
router.post('/:postId/like', protect, ctrl.likePost);
router.post('/:postId/unlike', protect, ctrl.unlikePost);
router.post('/:postId/pin', protect, adminOnly, ctrl.pinPost);
router.post('/:postId/unpin', protect, adminOnly, ctrl.unpinPost);

module.exports = router;
