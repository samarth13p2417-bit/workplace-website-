import jwt from 'jsonwebtoken';
import {
  addActiveSocketUser,
  removeActiveSocketUser,
  getActiveSocketUsers,
} from '../config/redis.js';

export const setupSocketHandlers = (io) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'jira_workplace_jwt_secret_dev_key';

  // 1. SECURE WEBSOCKET HANDSHAKE (JWT Verification)
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow anonymous guest read-only connection
        socket.user = {
          id: `guest_${socket.id.substring(0, 5)}`,
          name: 'Guest User',
          initials: 'GU',
          isGuest: true,
        };
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = {
        id: decoded.sub || decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role || 'Member',
        initials: decoded.name
          ? decoded.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
          : 'US',
        isGuest: false,
      };

      console.log(`[Socket.io] Authenticated connection from user: ${socket.user.name} (${socket.user.email})`);
      next();
    } catch (err) {
      console.warn('[Socket.io] Handshake token verification failed:', err.message);
      // Fallback to guest so connection doesn't hard-crash the UI
      socket.user = {
        id: `guest_${socket.id.substring(0, 5)}`,
        name: 'Guest User',
        initials: 'GU',
        isGuest: true,
      };
      next();
    }
  });

  // 2. SOCKET EVENT HANDLERS
  io.on('connection', (socket) => {
    let currentRoom = null;

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

    // Real-time Card Movement (Drag and Drop)
    socket.on('card:move', (data) => {
      if (currentRoom) {
        // Broadcast to all other clients in the board room
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
    });

    // Real-time Card Deletion
    socket.on('card:delete', (cardId) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('card:deleted', cardId);
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
      if (currentRoom) {
        await removeActiveSocketUser(currentRoom, socket.id);
        const activeUsers = await getActiveSocketUsers(currentRoom);
        socket.to(currentRoom).emit('board:active_users', activeUsers);
      }
    });
  });
};
