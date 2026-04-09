const Post = require('../models/Post');
const Channel = require('../models/Channel');
const Notification = require('../models/Notification');
const User = require('../models/User');

const emitToChannel = (req, channelId, event, payload) => {
  if (!req.io) return;
  req.io.to(channelId).emit(event, payload);
  req.io.to(`channel-${channelId}`).emit(event, payload);
};

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

    const channelName = channel.name?.trim() || 'this channel';

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
      .populate('author', 'name avatar email')
      .populate('channel', 'name');

    // Emit socket event for real-time update
    emitToChannel(req, channelId, 'newPost', populatedPost);
    emitToChannel(req, channelId, 'post:new', populatedPost);

    // Create notifications
    const notificationType = type === 'announcement' ? 'announcement_created' : 'post_created';
    let recipients = [];

    if (type === 'announcement') {
      const users = await User.find({}, '_id');
      recipients = users.map((u) => u._id);
    } else {
      const channelMembers = await Channel.findById(channelId).select('members');
      recipients = channelMembers?.members || [];
    }

    const actorDisplayName = req.user.name || (type === 'announcement' ? 'Admin' : 'User');
    const trimmedTitle = title?.trim();
    const announcementTitle = trimmedTitle || 'Announcement';
    const postTitle = trimmedTitle || 'Post';
    const notificationTitle = type === 'announcement' ? announcementTitle : 'New Post';
    const notificationMessage = type === 'announcement'
      ? `${channelName} • ${actorDisplayName} posted this announcement.`
      : `${actorDisplayName} posted in ${channelName}: "${postTitle}"`;

    const notifications = recipients
      .filter((memberId) => memberId.toString() !== req.user._id.toString())
      .map((memberId) => ({
        recipient: memberId,
        actor: req.user._id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
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
    const skip = (Number(page) - 1) * Number(limit);

    const query = { channel: channelId, isDeleted: false };
    if (type) {
      query.type = type;
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatar email')
      .populate('channel', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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
      .populate('author', 'name avatar email bio')
      .populate('channel', 'name')
      .populate('likes', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count
    const existingView = post.views?.find(
      (v) => v.userId.toString() === req.user._id.toString()
    );
    if (!existingView) {
      post.views = post.views || [];
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

    const channel = await Channel.findById(post.channel).select('name');
    const channelName = channel?.name || 'this channel';

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
      .populate('author', 'name avatar email')
      .populate('channel', 'name');

    // Emit socket event
    emitToChannel(req, post.channel.toString(), 'postUpdated', updatedPost);
    emitToChannel(req, post.channel.toString(), 'post:updated', updatedPost);

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
    emitToChannel(req, channelId.toString(), 'postDeleted', { postId });
    emitToChannel(req, channelId.toString(), 'post:deleted', { id: postId });

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

// Like post
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
        message: `${req.user.name || 'User'} liked your post in ${channelName}`,
        relatedPost: postId,
        actionUrl: `/community/post/${postId}`,
      });
      await notification.save();

      // Emit socket event
      if (req.io) {
        req.io.to(`user-${post.author}`).emit('notification', notification);
      }
    }

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(`post-${postId}`).emit('postLiked', { postId, likeCount: post.likeCount });
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

    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    post.likeCount = post.likes.length;
    await post.save();

    // Emit socket event
    if (req.io) {
      req.io.to(`post-${postId}`).emit('postUnliked', { postId, likeCount: post.likeCount });
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
    emitToChannel(req, post.channel.toString(), 'postPinned', { postId });

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
    emitToChannel(req, post.channel.toString(), 'postUnpinned', { postId });

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
