const Channel = require('../models/Channel');
const Notification = require('../models/Notification');

// Create channel (Admin only)
exports.createChannel = async (req, res) => {
  try {
    const { name, description, topic, subject, subjectMatterExpertId } = req.body;

    // Validate input
    if (!name || !description || !subject || !subjectMatterExpertId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if channel name already exists
    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: 'Channel name already exists',
      });
    }

    const newChannel = new Channel({
      name,
      description,
      topic,
      subject,
      subjectMatterExpert: subjectMatterExpertId,
      createdBy: req.user._id,
      members: [req.user._id],
      memberCount: 1,
    });

    await newChannel.save();
    await newChannel.populate('subjectMatterExpert', 'firstName lastName email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Channel created successfully',
      data: newChannel,
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
    const channels = await Channel.find({ isActive: true })
      .populate('subjectMatterExpert', 'firstName lastName email phone avatar')
      .populate('createdBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: channels,
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
      .populate('subjectMatterExpert', 'firstName lastName email phone avatar bio')
      .populate('members', 'firstName lastName avatar email')
      .populate('createdBy', 'firstName lastName avatar');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    res.status(200).json({
      success: true,
      data: channel,
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
    const { name, description, topic, subject, subjectMatterExpertId } = req.body;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    // Update fields
    if (name) channel.name = name;
    if (description) channel.description = description;
    if (topic) channel.topic = topic;
    if (subject) channel.subject = subject;
    if (subjectMatterExpertId) channel.subjectMatterExpert = subjectMatterExpertId;

    await channel.save();
    await channel.populate('subjectMatterExpert', 'firstName lastName email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Channel updated successfully',
      data: channel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating channel',
      error: error.message,
    });
  }
};

// Delete channel (Admin only, soft delete)
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

    channel.isActive = false;
    await channel.save();

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

// Join channel
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

    // Check if already a member
    if (channel.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this channel',
      });
    }

    channel.members.push(userId);
    channel.memberCount = channel.members.length;
    await channel.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`channel-${channelId}`).emit('memberJoined', {
        userId,
        channelId,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Joined channel successfully',
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

// Leave channel
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

    // Check if user is a member
    if (!channel.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this channel',
      });
    }

    channel.members = channel.members.filter(id => id.toString() !== userId.toString());
    channel.memberCount = channel.members.length;
    await channel.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`channel-${channelId}`).emit('memberLeft', {
        userId,
        channelId,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Left channel successfully',
      data: channel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving channel',
      error: error.message,
    });
  }
};
