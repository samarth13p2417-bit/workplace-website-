/**
 * Real-time Socket.io Client Service
 * Week 3 & 4 Real-time Synchronization Engine
 * - Secure WebSocket Handshake with JWT
 * - Live board presence & active users
 * - Instant drag & drop movement broadcasts
 * - Real-time card comments threads
 * - Real-time typing indicators
 * - Targeted in-app push notifications
 */

import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('jira_auth_token_v1');

    socket = io('/', {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to real-time server with socket ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection notice:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason);
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  const token = localStorage.getItem('jira_auth_token_v1');
  if (token) {
    s.auth = { token };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinBoard = (boardId = 'board_kanban_1') => {
  const s = connectSocket();
  s.emit('board:join', boardId);
};

export const leaveBoard = (boardId = 'board_kanban_1') => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('board:leave', boardId);
  }
};

export const joinCard = (cardId) => {
  const s = connectSocket();
  if (s && cardId) {
    s.emit('card:join', cardId);
  }
};

export const leaveCard = (cardId) => {
  const s = getSocket();
  if (s && s.connected && cardId) {
    s.emit('card:leave', cardId);
  }
};

export const emitCardMove = (moveData) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:move', moveData);
  }
};

export const emitCardCreate = (card) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:create', card);
  }
};

export const emitCardUpdate = (card) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:update', card);
  }
};

export const emitCardDelete = (cardId) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:delete', cardId);
  }
};

export const emitCardTyping = (cardId, field = 'comment') => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:typing', { cardId, field });
  }
};

export const emitCardStopTyping = (cardId) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:stop_typing', { cardId });
  }
};

export const emitCardComment = (cardId, comment) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('card:comment:add', { cardId, comment });
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinBoard,
  leaveBoard,
  joinCard,
  leaveCard,
  emitCardMove,
  emitCardCreate,
  emitCardUpdate,
  emitCardDelete,
  emitCardTyping,
  emitCardStopTyping,
  emitCardComment,
};
