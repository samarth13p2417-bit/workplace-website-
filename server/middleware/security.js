// Security & Performance Profiling Middleware
const rateLimitMap = new Map();

export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

export const performanceProfiler = (req, res, next) => {
  const start = process.hrtime();

  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs}ms`);
    }
    return originalWriteHead.apply(this, args);
  };

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    if (durationMs > 250) {
      console.warn(`[Perf Warning] Slow Request: ${req.method} ${req.originalUrl} took ${durationMs}ms`);
    }
  });

  next();
};

export const rateLimiter = (options = { windowMs: 60000, maxRequests: 100 }) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const key = `${clientIp}_${req.baseUrl}`;

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    const record = rateLimitMap.get(key);
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + options.windowMs;
      return next();
    }

    record.count++;
    if (record.count > options.maxRequests) {
      return res.status(429).json({
        message: 'Too many requests, please try again in a minute.',
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      });
    }

    next();
  };
};

export const sanitizePayload = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Strip dangerous script/iframe tags while preserving regular text
          obj[key] = obj[key].replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
                             .replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};
