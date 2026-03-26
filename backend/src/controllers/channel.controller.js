const Channel = require('../models/Channel');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Create Channel (Admin only)
exports.createChannel = async (req, res) => {
  try {
    const { name, description, topic, subject, subjectMatterExpertId, icon, coverImage } = req.body;

    if (!name || !description || !topic || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    let sme = null;
    if (subjectMatterExpertId) {
      if (!mongoose.Types.ObjectId.isValid(subjectMatterExpertId)) {
        return res.status(400).json({
          success: false,
          message: 'Subject Matter Expert ID is invalid',
        });
      }

      sme = await User.findById(subjectMatterExpertId);
      if (!sme) {
        return res.status(404).json({
          success: false,
          message: 'Subject Matter Expert not found',
        });
      }
    }

    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: 'Channel with this name already exists',
      });
    }

    const members = [req.user._id];
    if (sme) members.push(sme._id);

    const newChannel = new Channel({
      name,
      description,
      topic,
      subject,
      subjectMatterExpert: sme?._id || null,
      createdBy: req.user._id,
      icon,
      coverImage,
      members,
      memberCount: members.length,
    });

    await newChannel.save();

    const populatedChannel = await Channel.findById(newChannel._id)
      .populate('subjectMatterExpert', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      data: populatedChannel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating channel',
      error: error.message,
    });
  }
};

// Get all channels
exports.getAllChannels = async (req, res) => {
  try {
    const { page = 1, limit = 10, topic, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { isActive: true };

    if (topic) {
      query.topic = topic;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const channels = await Channel.find(query)
      .populate('subjectMatterExpert', 'name email')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Channel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: channels,
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
      message: 'Error fetching channels',
      error: error.message,
    });
  }
};

// Get channel by ID
exports.getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId)
      .populate('subjectMatterExpert', 'name email bio')
      .populate('createdBy', 'name email')
      .populate('members', 'name avatar');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    const recentPosts = await Post.find({ channel: channelId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        channel,
        recentPosts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching channel',
      error: error.message,
    });
  }
};

// Update channel (Admin only)
exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description, topic, subject, subjectMatterExpertId, icon, coverImage } = req.body;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    if (name) channel.name = name;
    if (description) channel.description = description;
    if (topic) channel.topic = topic;
    if (subject) channel.subject = subject;
    if (icon) channel.icon = icon;
    if (coverImage) channel.coverImage = coverImage;

    if (subjectMatterExpertId === '' || subjectMatterExpertId === null) {
      channel.subjectMatterExpert = null;
    } else if (subjectMatterExpertId && String(channel.subjectMatterExpert) !== String(subjectMatterExpertId)) {
      if (!mongoose.Types.ObjectId.isValid(subjectMatterExpertId)) {
        return res.status(400).json({
          success: false,
          message: 'New Subject Matter Expert ID is invalid',
        });
      }

      const newSME = await User.findById(subjectMatterExpertId);
      if (!newSME) {
        return res.status(404).json({
          success: false,
          message: 'New Subject Matter Expert not found',
        });
      }

      channel.subjectMatterExpert = subjectMatterExpertId;
    }

    await channel.save();

    const updatedChannel = await Channel.findById(channelId)
      .populate('subjectMatterExpert', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Channel updated successfully',
      data: updatedChannel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating channel',
      error: error.message,
    });
  }
};

// Delete channel (Admin only)
exports.deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    await Post.deleteMany({ channel: channelId });
    await Channel.findByIdAndDelete(channelId);

    res.status(200).json({
      success: true,
      message: 'Channel deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting channel',
      error: error.message,
    });
  }
};

// Delete all channels (Admin only)
exports.deleteAllChannels = async (req, res) => {
  try {
    const channels = await Channel.find({});
    const channelIds = channels.map((c) => c._id);

    const posts = await Post.find({ channel: { $in: channelIds } }).select('_id');
    const postIds = posts.map((p) => p._id);

    await Comment.deleteMany({ post: { $in: postIds } });
    await Notification.deleteMany({
      $or: [
        { relatedChannel: { $in: channelIds } },
        { relatedPost: { $in: postIds } },
      ],
    });
    await Post.deleteMany({ channel: { $in: channelIds } });
    await Channel.deleteMany({ _id: { $in: channelIds } });

    res.status(200).json({
      success: true,
      message: 'All channels deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting channels',
      error: error.message,
    });
  }
};

// Join channel (User)
exports.joinChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    if (channel.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this channel',
      });
    }

    channel.members.push(userId);
    channel.memberCount = (channel.memberCount || 0) + 1;
    await channel.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined channel',
      data: channel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining channel',
      error: error.message,
    });
  }
};

// Leave channel (User)
exports.leaveChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    if (!channel.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this channel',
      });
    }

    channel.members = channel.members.filter((id) => id.toString() !== userId.toString());
    channel.memberCount = Math.max(0, (channel.memberCount || 0) - 1);
    await channel.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left channel',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving channel',
      error: error.message,
    });
  }
};
