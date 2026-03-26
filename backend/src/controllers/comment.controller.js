const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const emitToPost = (req, postId, event, payload) => {
  if (!req.io && !global.io) return;
  const io = req.io || global.io;
  io.to(`post-${postId}`).emit(event, payload);
};

// Create comment on post
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, attachments = [] } = req.body;

    if (!content || !postId) {
      return res.status(400).json({
        success: false,
        message: 'Content and postId are required',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const newComment = new Comment({
      content,
      post: postId,
      author: req.user._id,
      attachments,
    });

    await newComment.save();

    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'name avatar email');

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.author,
        actor: req.user._id,
        type: 'comment_added',
        title: 'New Comment',
        message: `${req.user.name || 'User'} commented on your post`,
        relatedPost: postId,
        relatedComment: newComment._id,
        actionUrl: `/community/post/${postId}`,
      });
      await notification.save();

      const io = req.io || global.io;
      if (io) {
        io.to(`user-${post.author}`).emit('notification', notification);
      }
    }

    emitToPost(req, postId, 'newComment', populatedComment);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message,
    });
  }
};

// Create reply to comment (nested comment)
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, attachments = [] } = req.body;

    if (!content || !commentId) {
      return res.status(400).json({
        success: false,
        message: 'Content and commentId are required',
      });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found',
      });
    }

    const newReply = new Comment({
      content,
      post: parentComment.post,
      author: req.user._id,
      parentComment: commentId,
      attachments,
    });

    await newReply.save();

    parentComment.replies = parentComment.replies || [];
    parentComment.replies.push(newReply._id);
    parentComment.replyCount = (parentComment.replyCount || 0) + 1;
    await parentComment.save();

    const populatedReply = await Comment.findById(newReply._id)
      .populate('author', 'name avatar email');

    if (parentComment.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: parentComment.author,
        actor: req.user._id,
        type: 'comment_replied',
        title: 'New Reply',
        message: `${req.user.name || 'User'} replied to your comment`,
        relatedPost: parentComment.post,
        relatedComment: newReply._id,
        actionUrl: `/community/post/${parentComment.post}`,
      });
      await notification.save();

      const io = req.io || global.io;
      if (io) {
        io.to(`user-${parentComment.author}`).emit('notification', notification);
      }
    }

    emitToPost(req, parentComment.post.toString(), 'newReply', populatedReply);

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: populatedReply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating reply',
      error: error.message,
    });
  }
};

// Get all comments for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({ post: postId, parentComment: null, isDeleted: false })
      .populate('author', 'name avatar email')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name avatar email',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Comment.countDocuments({ post: postId, parentComment: null, isDeleted: false });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
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

// Get single comment with all replies
exports.getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('author', 'name avatar email bio')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name avatar email',
        },
      });

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
    const { content, attachments } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this comment',
      });
    }

    if (content) {
      comment.content = content;
      comment.isEdited = true;
      comment.editedAt = new Date();
    }
    if (attachments) comment.attachments = attachments;

    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'name avatar email');

    emitToPost(req, comment.post.toString(), 'commentUpdated', updatedComment);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message,
    });
  }
};

// Delete comment (Soft delete - Author or Admin)
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

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment',
      });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    if (comment.parentComment) {
      const parentComment = await Comment.findById(comment.parentComment);
      if (parentComment) {
        parentComment.replyCount = Math.max(0, (parentComment.replyCount || 0) - 1);
        await parentComment.save();
      }
    } else {
      const post = await Post.findById(comment.post);
      if (post) {
        post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
        await post.save();
      }
    }

    emitToPost(req, comment.post.toString(), 'commentDeleted', { commentId });

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

    if (comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this comment',
      });
    }

    comment.likes.push(userId);
    comment.likeCount = comment.likes.length;
    await comment.save();

    if (comment.author.toString() !== userId.toString()) {
      const notification = new Notification({
        recipient: comment.author,
        actor: userId,
        type: 'comment_liked',
        title: 'Comment Liked',
        message: `${req.user.name || 'User'} liked your comment`,
        relatedPost: comment.post,
        relatedComment: commentId,
        actionUrl: `/community/post/${comment.post}`,
      });
      await notification.save();

      const io = req.io || global.io;
      if (io) {
        io.to(`user-${comment.author}`).emit('notification', notification);
      }
    }

    emitToPost(req, comment.post.toString(), 'commentLiked', { commentId, likeCount: comment.likeCount });

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

    if (!comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this comment',
      });
    }

    comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    comment.likeCount = comment.likes.length;
    await comment.save();

    emitToPost(req, comment.post.toString(), 'commentUnliked', { commentId, likeCount: comment.likeCount });

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
