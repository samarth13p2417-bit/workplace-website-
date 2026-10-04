import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import './config/redis.js'; // Initialize Redis client & connection listeners
import { seedDatabaseIfEmpty } from './seed/seedData.js';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import listRoutes from './routes/listRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP and Socket.io server setup
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

// Setup Real-time WebSockets with JWT Handshake Auth
setupSocketHandlers(io);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Status & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Jira Workplace Management Backend API',
    database: 'MongoDB',
    realtime: 'Socket.io',
    cache: 'Redis',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// Global Error Handler
app.use(errorHandler);

// Connect Database and Start Server
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedDatabaseIfEmpty();
  }

  httpServer.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Jira Workplace Backend running on port ${PORT}`);
    console.log(`⚡ Real-time Engine: Socket.io listening for secure handshakes`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();

export { app, io, httpServer };
