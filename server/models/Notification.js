import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      index: true,
    },
    recipientId: {
      type: String,
      default: '',
    },
    sender: {
      name: { type: String, default: 'System' },
      initials: { type: String, default: 'SYS' },
      email: { type: String, default: '' },
    },
    type: {
      type: String,
      enum: ['comment', 'assigned', 'status_change', 'mention', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    cardId: {
      type: String,
      default: '',
    },
    cardKey: {
      type: String,
      default: '',
    },
    boardId: {
      type: String,
      default: 'board_kanban_1',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user notification lookups
notificationSchema.index({ recipientEmail: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
