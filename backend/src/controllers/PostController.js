const Post = require('../models/Post');
const Channel = require('../models/Channel');
const Notification = require('../models/Notification');

// Create Post (User) or Announcement (Admin)
exports.createPost = async (req, res) => {
  try {
    const { title, content, channelId, type = 'post', tags = [], attachments = [] } = req.body;

    // Validate input
    if (!title || !content || !channelId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (title, content, channelId)',
      });
    }

    // Verify channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    // Check permissions
    if (type === 'announcement' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create announcements',
      });
    }

    const newPost = new Post({
      title,
      content,
      channel: channelId,
      author: req.user._id,
      type,
      tags,
      attachments,
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'firstName lastName avatar email')
      .populate('channel', 'name');

    // Emit socket event for real-time update
    if (global.io) {
      global.io.to(`channel-${channelId}`).emit('newPost', populatedPost);
    }

    // Create notifications for channel members
    const channelMembers = await Channel.findById(channelId).select('members');
    const notificationType = type === 'announcement' ? 'announcement_created' : 'post_created';
    
    const notifications = channelMembers.members
      .filter(memberId => memberId.toString() !== req.user._id.toString())
      .map(memberId => ({
        recipient: memberId,
        actor: req.user._id,
        type: notificationType,
        title: type === 'announcement' ? 'New Announcement' : 'New Post',
        message: `${req.user.firstName} ${req.user.lastName} posted: "${title}"`,
        relatedPost: newPost._id,
        relatedChannel: channelId,
        actionUrl: `/community/channel/${channelId}/post/${newPost._id}`,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      data: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
};

// Get all posts in a channel
exports.getPostsByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { channel: channelId };

    if (type) {
      query.type = type;
    }

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar email')
      .populate('channel', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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
      message: 'Error fetching posts',
      error: error.message,
    });
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'firstName lastName avatar email bio')
      .populate('channel', 'name')
      .populate('likes', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count
    const existingView = post.views.find(v => v.userId.toString() === req.user._id.toString());
    if (!existingView) {
      post.views.push({ userId: req.user._id });
      post.viewCount = post.views.length;
      await post.save();
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message,
    });
  }
};

// Update post (Author or Admin)
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, tags, attachments } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check authorization
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this post',
      });
    }

    // Update fields
    if (title) post.title = title;
    if (content) {
      post.content = content;
      post.isEdited = true;
      post.editedAt = new Date();
    }
    if (tags) post.tags = tags;
    if (attachments) post.attachments = attachments;

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('author', 'firstName lastName avatar email')
      .populate('channel', 'name');

    // Emit socket event
    if (global.io) {
      global.io.to(`channel-${post.channel}`).emit('postUpdated', updatedPost);
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message,
    });
  }
};

// Delete post (Author or Admin)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check authorization
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post',
      });
    }

    const channelId = post.channel;
    await Post.findByIdAndDelete(postId);

    // Delete related notifications
    await Notification.deleteMany({ relatedPost: postId });

    // Emit socket event
    if (global.io) {
      global.io.to(`channel-${channelId}`).emit('postDeleted', { postId });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message,
    });
  }
};

// Like post (YouTube style)
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if already liked
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this post',
      });
    }

    post.likes.push(userId);
    post.likeCount = post.likes.length;
    await post.save();

    // Create notification for post author
    if (post.author.toString() !== userId.toString()) {
      const notification = new Notification({
        recipient: post.author,
        actor: userId,
        type: 'post_liked',
        title: 'Post Liked',
        message: `${req.user.firstName} ${req.user.lastName} liked your post`,
        relatedPost: postId,
        actionUrl: `/community/post/${postId}`,
      });
      await notification.save();

      // Emit socket event
      if (global.io) {
        global.io.to(`user-${post.author}`).emit('notification', notification);
      }
    }

    // Emit socket event for real-time update
    if (global.io) {
      global.io.to(`post-${postId}`).emit('postLiked', { postId, likeCount: post.likeCount });
    }

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: { postId, likeCount: post.likeCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message,
    });
  }
};

// Unlike post
exports.unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user has liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this post',
      });
    }

    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    post.likeCount = post.likes.length;
    await post.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`post-${postId}`).emit('postUnliked', { postId, likeCount: post.likeCount });
    }

    res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
      data: { postId, likeCount: post.likeCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unliking post',
      error: error.message,
    });
  }
};

// Pin post (Admin only)
exports.pinPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.isPinned = true;
    await post.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`channel-${post.channel}`).emit('postPinned', { postId });
    }

    res.status(200).json({
      success: true,
      message: 'Post pinned successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pinning post',
      error: error.message,
    });
  }
};

// Unpin post (Admin only)
exports.unpinPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.isPinned = false;
    await post.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`channel-${post.channel}`).emit('postUnpinned', { postId });
    }

    res.status(200).json({
      success: true,
      message: 'Post unpinned successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unpinning post',
      error: error.message,
    });
  }
};
