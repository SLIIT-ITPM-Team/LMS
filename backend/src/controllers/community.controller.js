const Channel = require('../models/Channel');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// ════════════════════════════════════════════
//  CHANNELS
// ════════════════════════════════════════════

exports.createChannel = async (req, res) => {
  try {
    const { name, subject, description, expertName, expertUserId } = req.body;
    const channel = await Channel.create({
      name,
      subject,
      description,
      expert: { name: expertName || '', userId: expertUserId || null },
      createdBy: req.user._id,
    });
    const populated = await channel.populate('createdBy', 'name');
    req.io.emit('channel:new', populated);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json({ success: true, data: channels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('createdBy', 'name');
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });
    res.json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('createdBy', 'name');
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });
    req.io.emit('channel:updated', channel);
    res.json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    await Channel.findByIdAndUpdate(req.params.id, { isActive: false });
    req.io.emit('channel:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Channel deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
//  POSTS & ANNOUNCEMENTS
// ════════════════════════════════════════════

exports.createPost = async (req, res) => {
  try {
    const { channelId, title, content, type } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (type === 'announcement' && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can create announcements' });
    }

    const post = await Post.create({
      channel: channelId,
      author: req.user._id,
      type: isAdmin ? type || 'post' : 'post',
      title: title || '',
      content,
    });

    const populated = await Post.findById(post._id).populate('author', 'name role avatar');
    req.io.to(channelId).emit('post:new', populated);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPostsByChannel = async (req, res) => {
  try {
    const posts = await Post.find({ channel: req.params.channelId, isDeleted: false })
      .populate('author', 'name role avatar')
      .sort('-createdAt');
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = post.author.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('author', 'name role avatar');

    req.io.to(post.channel.toString()).emit('post:updated', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = post.author.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await Post.findByIdAndUpdate(req.params.id, { isDeleted: true });
    req.io.to(post.channel.toString()).emit('post:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
//  LIKES
// ════════════════════════════════════════════

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.map((l) => l.toString()).includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((l) => l.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    req.io.to(post.channel.toString()).emit('post:liked', {
      postId: post._id,
      likes: post.likes,
    });
    res.json({ success: true, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
//  COMMENTS
// ════════════════════════════════════════════

exports.createComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null,
    });

    const populated = await Comment.findById(comment._id).populate('author', 'name role avatar');
    req.io.to(post.channel.toString()).emit('comment:new', populated);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, isDeleted: false })
      .populate('author', 'name role avatar')
      .sort('createdAt');
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Unauthorized' });

    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    ).populate('author', 'name role avatar');

    const post = await Post.findById(comment.post);
    req.io.to(post.channel.toString()).emit('comment:updated', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Unauthorized' });

    await Comment.findByIdAndUpdate(req.params.id, { isDeleted: true });
    const post = await Post.findById(comment.post);
    req.io.to(post.channel.toString()).emit('comment:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
