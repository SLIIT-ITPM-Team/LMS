const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
	{
		recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		type: { type: String, required: true },
		title: { type: String, required: true },
		message: { type: String, required: true },
		relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
		relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
		relatedChannel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', default: null },
		actionUrl: { type: String, default: '' },
		isRead: { type: Boolean, default: false },
		readAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
