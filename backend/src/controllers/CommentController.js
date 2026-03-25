const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Create comment on post
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const newComment = new Comment({
      content: content.trim(),
      author: req.user._id,
      post: postId,
    });

    await newComment.save();
    await newComment.populate('author', 'firstName lastName avatar email');

    // Update post comment count
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    // Create notification for post author
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.author,
        actor: req.user._id,
        type: 'comment_added',
        title: 'New Comment',
        message: `${req.user.firstName} ${req.user.lastName} commented on your post`,
        relatedPost: postId,
        relatedComment: newComment._id,
        actionUrl: `/community/post/${postId}`,
      });
      await notification.save();

      // Emit socket event
      if (global.io) {
        global.io.to(`user-${post.author}`).emit('newNotification', notification);
      }
    }

    // Emit socket event
    if (global.io) {
      global.io.to(`post-${postId}`).emit('newComment', newComment);
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message,
    });
  }
};

// Get comments by post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: postId, isDeleted: false })
      .populate('author', 'firstName lastName avatar email')
      .populate('replies.author', 'firstName lastName avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ post: postId, isDeleted: false });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message,
    });
  }
};

// Get comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('author', 'firstName lastName avatar email')
      .populate('replies.author', 'firstName lastName avatar email');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comment',
      error: error.message,
    });
  }
};

// Update comment (Author or Admin)
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check authorization
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this comment',
      });
    }

    if (content) {
      comment.content = content.trim();
      comment.isEdited = true;
      comment.editedAt = new Date();
    }

    await comment.save();
    await comment.populate('author', 'firstName lastName avatar email');

    // Emit socket event
    if (global.io) {
      global.io.to(`post-${comment.post}`).emit('commentUpdated', comment);
    }

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message,
    });
  }
};

// Delete comment (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check authorization
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment',
      });
    }

    comment.isDeleted = true;
    await comment.save();

    // Update post comment count
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentCount = Math.max((post.commentCount || 1) - 1, 0);
      await post.save();
    }

    // Emit socket event
    if (global.io) {
      global.io.to(`post-${comment.post}`).emit('commentDeleted', { commentId });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message,
    });
  }
};

// Reply to comment
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required',
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const reply = {
      author: req.user._id,
      content: content.trim(),
    };

    comment.replies.push(reply);
    await comment.save();
    await comment.populate('replies.author', 'firstName lastName avatar email');

    // Create notification for comment author
    if (comment.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: comment.author,
        actor: req.user._id,
        type: 'reply_added',
        title: 'New Reply',
        message: `${req.user.firstName} ${req.user.lastName} replied to your comment`,
        relatedComment: commentId,
        relatedPost: comment.post,
        actionUrl: `/community/post/${comment.post}`,
      });
      await notification.save();

      // Emit socket event
      if (global.io) {
        global.io.to(`user-${comment.author}`).emit('newNotification', notification);
      }
    }

    // Emit socket event
    if (global.io) {
      global.io.to(`comment-${commentId}`).emit('newReply', {
        commentId,
        reply: comment.replies[comment.replies.length - 1],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: comment.replies[comment.replies.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message,
    });
  }
};

// Like comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if already liked
    if (comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this comment',
      });
    }

    comment.likes.push(userId);
    comment.likeCount = comment.likes.length;
    await comment.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`post-${comment.post}`).emit('commentLiked', {
        commentId,
        likeCount: comment.likeCount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment liked successfully',
      data: { commentId, likeCount: comment.likeCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking comment',
      error: error.message,
    });
  }
};

// Unlike comment
exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user has liked the comment
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this comment',
      });
    }

    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    comment.likeCount = comment.likes.length;
    await comment.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`post-${comment.post}`).emit('commentUnliked', {
        commentId,
        likeCount: comment.likeCount,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment unliked successfully',
      data: { commentId, likeCount: comment.likeCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unliking comment',
      error: error.message,
    });
  }
};
