const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/posts/:postId', protect, ctrl.createComment);
router.post('/replies/:commentId', protect, ctrl.replyToComment);
router.get('/posts/:postId', protect, ctrl.getCommentsByPost);
router.get('/:commentId', protect, ctrl.getCommentById);
router.put('/:commentId', protect, ctrl.updateComment);
router.delete('/:commentId', protect, ctrl.deleteComment);
router.post('/:commentId/like', protect, ctrl.likeComment);
router.post('/:commentId/unlike', protect, ctrl.unlikeComment);

module.exports = router;
