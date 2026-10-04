import Redis from 'ioredis';

let redisClient = null;
let isRedisConnected = false;

// Fallback in-memory cache store when Redis is offline
const memoryCache = new Map();
const memoryActiveSockets = new Map(); // room -> Map(socketId, user)

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          // Stop retrying aggressively if Redis is not running locally
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully to Redis server');
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        console.warn('[Redis] Connection lost:', err.message);
      }
      isRedisConnected = false;
    });

    redisClient.connect().catch(() => {
      console.warn('[Redis] Local Redis server not detected. Using high-performance in-memory fallback for caching and active socket session tracking.');
    });
  } catch (error) {
    console.warn('[Redis] Initialization error, falling back to memory store:', error.message);
    isRedisConnected = false;
  }
};

initRedis();

// =========================================================================
// CACHING UTILITIES
// =========================================================================

export const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`[Redis] Error getting key ${key}:`, err.message);
    }
  }

  // Fallback to in-memory cache
  const item = memoryCache.get(key);
  if (item) {
    if (item.expiry && item.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  }
  return null;
};

export const setCache = async (key, value, ttlSeconds = 120) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (err) {
      console.warn(`[Redis] Error setting key ${key}:`, err.message);
    }
  }

  // Fallback to in-memory cache
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

export const delCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn(`[Redis] Error deleting key ${key}:`, err.message);
    }
  }
  memoryCache.delete(key);
};

export const delCachePattern = async (patternPrefix) => {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(`${patternPrefix}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      console.warn(`[Redis] Error invalidating pattern ${patternPrefix}:`, err.message);
    }
  }

  // Clear in-memory keys matching prefix
  for (const k of memoryCache.keys()) {
    if (k.startsWith(patternPrefix)) {
      memoryCache.delete(k);
    }
  }
};

// =========================================================================
// ACTIVE SOCKET CONNECTION TRACKING
// =========================================================================

export const addActiveSocketUser = async (room, user, socketId) => {
  const redisKey = `socket:room:${room}:users`;

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.hset(redisKey, socketId, JSON.stringify(user));
      await redisClient.expire(redisKey, 3600); // 1 hour TTL
    } catch (err) {
      console.warn(`[Redis] Error adding socket user to ${room}:`, err.message);
    }
  }

  // In-memory fallback
  if (!memoryActiveSockets.has(room)) {
    memoryActiveSockets.set(room, new Map());
  }
  memoryActiveSockets.get(room).set(socketId, user);
};

export const removeActiveSocketUser = async (room, socketId) => {
  const redisKey = `socket:room:${room}:users`;

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.hdel(redisKey, socketId);
    } catch (err) {
      console.warn(`[Redis] Error removing socket user from ${room}:`, err.message);
    }
  }

  // In-memory fallback
  if (memoryActiveSockets.has(room)) {
    memoryActiveSockets.get(room).delete(socketId);
    if (memoryActiveSockets.get(room).size === 0) {
      memoryActiveSockets.delete(room);
    }
  }
};

export const getActiveSocketUsers = async (room) => {
  const redisKey = `socket:room:${room}:users`;

  if (isRedisConnected && redisClient) {
    try {
      const rawUsers = await redisClient.hvals(redisKey);
      if (rawUsers && rawUsers.length > 0) {
        return rawUsers.map((u) => JSON.parse(u));
      }
    } catch (err) {
      console.warn(`[Redis] Error getting socket users from ${room}:`, err.message);
    }
  }

  // In-memory fallback
  if (memoryActiveSockets.has(room)) {
    return Array.from(memoryActiveSockets.get(room).values());
  }
  return [];
};

export default {
  getCache,
  setCache,
  delCache,
  delCachePattern,
  addActiveSocketUser,
  removeActiveSocketUser,
  getActiveSocketUsers,
};
