import jwt from 'jsonwebtoken';
import {
  addActiveSocketUser,
  removeActiveSocketUser,
  getActiveSocketUsers,
} from '../config/redis.js';

let ioInstance = null;
// Map to track user socket IDs by email: email -> Set of socket IDs
const userSocketsMap = new Map();

export const setupSocketHandlers = (io) => {
  ioInstance = io;
  const JWT_SECRET = process.env.JWT_SECRET || 'jira_workplace_jwt_secret_dev_key';

  // 1. SECURE WEBSOCKET HANDSHAKE (JWT Verification)
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        socket.user = {
          id: `guest_${socket.id.substring(0, 5)}`,
          name: 'Guest User',
          email: 'guest@jira.local',
          initials: 'GU',
          isGuest: true,
        };
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = {
        id: decoded.sub || decoded.id,
        name: decoded.name || 'Workspace User',
        email: decoded.email || '',
        role: decoded.role || 'Member',
        initials: decoded.name
          ? decoded.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
          : 'US',
        isGuest: false,
      };

      console.log(`[Socket.io] Authenticated connection from: ${socket.user.name} (${socket.user.email})`);
      next();
    } catch (err) {
      console.warn('[Socket.io] Handshake token verification failed, falling back to guest:', err.message);
      socket.user = {
        id: `guest_${socket.id.substring(0, 5)}`,
        name: 'Guest User',
        email: 'guest@jira.local',
        initials: 'GU',
        isGuest: true,
      };
      next();
    }
  });

  // 2. SOCKET EVENT HANDLERS
  io.on('connection', (socket) => {
    let currentRoom = null;
    const userEmail = socket.user?.email;

    // Track user socket ID for targeted real-time notifications
    if (userEmail) {
      if (!userSocketsMap.has(userEmail)) {
        userSocketsMap.set(userEmail, new Set());
      }
      userSocketsMap.get(userEmail).add(socket.id);
    }

    // Join Kanban Board room & track active session
    socket.on('board:join', async (boardId) => {
      const room = `board_${boardId || 'board_kanban_1'}`;
      currentRoom = room;
      socket.join(room);

      // Track active user in Redis / cache
      await addActiveSocketUser(room, socket.user, socket.id);
      const activeUsers = await getActiveSocketUsers(room);

      // Broadcast active user list to everyone in this board
      io.to(room).emit('board:active_users', activeUsers);
      console.log(`[Socket.io] ${socket.user.name} joined room: ${room} (Total active: ${activeUsers.length})`);
    });

    // Leave Kanban Board room
    socket.on('board:leave', async (boardId) => {
      const room = `board_${boardId || 'board_kanban_1'}`;
      socket.leave(room);
      await removeActiveSocketUser(room, socket.id);
      const activeUsers = await getActiveSocketUsers(room);
      socket.to(room).emit('board:active_users', activeUsers);
    });

    // Join Card Detail Room (for focused card typing indicators & comments)
    socket.on('card:join', (cardId) => {
      if (!cardId) return;
      const cardRoom = `card_${cardId}`;
      socket.join(cardRoom);
    });

    socket.on('card:leave', (cardId) => {
      if (!cardId) return;
      const cardRoom = `card_${cardId}`;
      socket.leave(cardRoom);
    });

    // Real-time Card Movement (Drag and Drop)
    socket.on('card:move', (data) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('card:moved', data);
      }
    });

    // Real-time Card Creation
    socket.on('card:create', (card) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('card:created', card);
      }
    });

    // Real-time Card Update
    socket.on('card:update', (card) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('card:updated', card);
      }
      if (card?.id) {
        socket.to(`card_${card.id}`).emit('card:updated', card);
      }
    });

    // Real-time Card Deletion
    socket.on('card:delete', (cardId) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('card:deleted', cardId);
      }
    });

    // Real-time Typing Indicators (Day 6-7 requirement)
    socket.on('card:typing', (data) => {
      const payload = {
        cardId: data.cardId,
        user: socket.user,
        field: data.field || 'comment',
      };
      if (data.cardId) {
        socket.to(`card_${data.cardId}`).emit('card:typing', payload);
      }
      if (currentRoom) {
        socket.to(currentRoom).emit('card:typing', payload);
      }
    });

    socket.on('card:stop_typing', (data) => {
      const payload = {
        cardId: data.cardId,
        user: socket.user,
      };
      if (data.cardId) {
        socket.to(`card_${data.cardId}`).emit('card:stop_typing', payload);
      }
      if (currentRoom) {
        socket.to(currentRoom).emit('card:stop_typing', payload);
      }
    });

    // Real-time Card Comments Thread Broadcast (Day 6-7 requirement)
    socket.on('card:comment:add', (data) => {
      const { cardId, comment } = data;
      const payload = {
        cardId,
        comment,
        sender: socket.user,
      };
      // Broadcast to both board and specific card room
      if (cardId) {
        socket.to(`card_${cardId}`).emit('card:comment:added', payload);
      }
      if (currentRoom) {
        socket.to(currentRoom).emit('card:comment:added', payload);
      }
    });

    // Real-time List / Column actions
    socket.on('list:create', (list) => {
      if (currentRoom) socket.to(currentRoom).emit('list:created', list);
    });

    socket.on('list:update', (list) => {
      if (currentRoom) socket.to(currentRoom).emit('list:updated', list);
    });

    socket.on('list:delete', (listId) => {
      if (currentRoom) socket.to(currentRoom).emit('list:deleted', listId);
    });

    // Handle Disconnect & clean active socket connections
    socket.on('disconnect', async () => {
      if (userEmail && userSocketsMap.has(userEmail)) {
        const set = userSocketsMap.get(userEmail);
        set.delete(socket.id);
        if (set.size === 0) {
          userSocketsMap.delete(userEmail);
        }
      }

      if (currentRoom) {
        await removeActiveSocketUser(currentRoom, socket.id);
        const activeUsers = await getActiveSocketUsers(currentRoom);
        socket.to(currentRoom).emit('board:active_users', activeUsers);
      }
    });
  });
};

// Helper function to broadcast notifications or events directly to a specific user
export const emitNotificationToUser = (userEmail, notification) => {
  if (!ioInstance) return false;
  if (!userEmail) {
    // Broadcast globally if no recipient specified
    ioInstance.emit('notification:new', notification);
    return true;
  }

  const socketIds = userSocketsMap.get(userEmail);
  if (socketIds && socketIds.size > 0) {
    for (const sid of socketIds) {
      ioInstance.to(sid).emit('notification:new', notification);
    }
    return true;
  }
  // Also broadcast with recipient tag so client filtering works if reconnected
  ioInstance.emit('notification:new', notification);
  return true;
};

// Helper function to broadcast to an entire board
export const broadcastToBoard = (boardId, event, data) => {
  if (!ioInstance) return;
  const room = `board_${boardId || 'board_kanban_1'}`;
  ioInstance.to(room).emit(event, data);
};
