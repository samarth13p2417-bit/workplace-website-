/**
 * Real-time Socket.io Client Service
 * Features:
 * - Secure WebSocket Handshake with JWT Authentication
 * - Automatic reconnection handling
 * - Live board session tracking (active users)
 * - Real-time synchronization for Kanban board movements & card edits
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
      console.warn('[Socket.io] Connection warning:', err.message);
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

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinBoard,
  emitCardMove,
  emitCardCreate,
  emitCardUpdate,
  emitCardDelete,
};
