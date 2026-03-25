const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    topic: {
      type: String,
      enum: ['JavaScript', 'Python', 'React', 'Node.js', 'Databases', 'DevOps', 'UI/UX', 'General'],
      default: 'General',
    },
    subject: {
      type: String,
      required: true,
      maxlength: 100,
    },
    subjectMatterExpert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', channelSchema);
