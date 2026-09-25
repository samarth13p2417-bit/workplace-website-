import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { getCacheStats } from './config/redis.js';
import { seedDatabaseIfEmpty } from './seed/seedData.js';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import listRoutes from './routes/listRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  securityHeaders,
  performanceProfiler,
  rateLimiter,
  sanitizePayload,
} from './middleware/security.js';

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
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Setup Real-time WebSockets with JWT Handshake Auth & Room Broadcasts
setupSocketHandlers(io);

// Security & Profiling Middlewares (Week 4 Day 5-7)
app.use(securityHeaders);
app.use(performanceProfiler);

// CORS and Body Parsers
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizePayload);

// API Status & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Jira Workplace Management Backend API',
    database: 'MongoDB',
    realtime: 'Socket.io',
    cache: 'Redis',
    version: '2.0.0',
  });
});

// Cache Metrics & Optimization Stats (Week 4 Day 3-4)
app.get('/api/cache/stats', async (req, res, next) => {
  try {
    const stats = await getCacheStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Performance Profiling & System Metrics (Week 4 Day 5-7)
app.get('/api/system/metrics', async (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMB: {
      rss: (memory.rss / 1024 / 1024).toFixed(2),
      heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2),
    },
    activeSockets: io.engine.clientsCount || 0,
    timestamp: new Date().toISOString(),
  });
});

// Routes with targeted rate limits
app.use('/api/auth', rateLimiter({ windowMs: 60000, maxRequests: 30 }), authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/notifications', notificationRoutes);

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
    console.log(`⚡ Cache Engine: http://localhost:${PORT}/api/cache/stats`);
    console.log(`📊 System Metrics: http://localhost:${PORT}/api/system/metrics`);
    console.log(`===============================================`);
  });
};

startServer();

export { app, io, httpServer };
  
