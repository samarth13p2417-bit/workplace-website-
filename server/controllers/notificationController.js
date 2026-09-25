import Notification from '../models/Notification.js';
import { emitNotificationToUser } from '../sockets/socketHandler.js';

export const createNotificationHelper = async ({
  recipientEmail,
  recipientId = '',
  sender = { name: 'System', initials: 'SYS', email: '' },
  type = 'system',
  title,
  message,
  cardId = '',
  cardKey = '',
  boardId = 'board_kanban_1',
}) => {
  try {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const notification = await Notification.create({
      id,
      recipientEmail: (recipientEmail || 'all').toLowerCase(),
      recipientId,
      sender,
      type,
      title,
      message,
      cardId,
      cardKey,
      boardId,
      isRead: false,
    });

    // Real-time WebSockets push notification
    emitNotificationToUser(recipientEmail, notification);
    return notification;
  } catch (error) {
    console.warn('[Notification] Error creating notification:', error.message);
    return null;
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userEmail = req.user?.email || req.query.email || 'all';
    const { unread } = req.query;

    const query = {
      $or: [
        { recipientEmail: userEmail.toLowerCase() },
        { recipientEmail: 'all' },
      ],
    };

    if (unread === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userEmail = req.user?.email || req.body.email || 'all';

    await Notification.updateMany(
      {
        $or: [
          { recipientEmail: userEmail.toLowerCase() },
          { recipientEmail: 'all' },
        ],
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
