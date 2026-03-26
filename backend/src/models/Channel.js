const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    topic: { type: String, trim: true, default: '' },
    expert: {
      name: { type: String, default: '' },
      title: { type: String, default: '' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      // ⚠️ email & phone intentionally excluded for privacy
    },
    subjectMatterExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    icon: { type: String, trim: true, default: '' },
    coverImage: { type: String, trim: true, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', channelSchema);
