const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['post', 'announcement'], default: 'post' },
    title: { type: String, trim: true, default: '' },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    attachments: [{ type: String, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    viewCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    isDiscussionRoot: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
