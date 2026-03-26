const cors = require('cors');

/**
 * CORS middleware configuration for the LMS backend
 * Provides flexible CORS handling for development and production environments
 */
const createCorsMiddleware = () => {
  const normalizeOrigin = (value) => String(value || '').trim().replace(/\/$/, '');
  const nodeEnv = String(process.env.NODE_ENV || 'development').trim().toLowerCase();
  const allowAllOrigins = String(process.env.ALLOW_ALL_ORIGINS || '').trim().toLowerCase() === 'true';

  const isLoopbackOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const isLanOrigin = (origin) => /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(origin);

  const parseAllowedOrigins = () => {
    const envOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
    const origins = envOrigins
      .split(',')
      .map((origin) => normalizeOrigin(origin))
      .filter(Boolean);

    if (nodeEnv === 'development') {
      const defaultDevOrigins = [
        'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
        'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
        'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175',
        'http://127.0.0.1:5176', 'http://127.0.0.1:5177', 'http://127.0.0.1:5178',
      ];

      defaultDevOrigins.forEach((origin) => {
        const normalized = normalizeOrigin(origin);
        if (!origins.includes(normalized)) {
          origins.push(normalized);
        }
      });
    }

    return origins;
  };

  const allowedOrigins = new Set(parseAllowedOrigins());

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);

      if (isLoopbackOrigin(normalizedOrigin)) {
        return callback(null, true);
      }

      if (allowAllOrigins) {
        return callback(null, true);
      }

      if (nodeEnv === 'development') {
        if (isLanOrigin(normalizedOrigin) || allowedOrigins.has(normalizedOrigin)) {
          return callback(null, true);
        }

        console.log(`CORS: Allowing origin (development): ${normalizedOrigin}`);
        return callback(null, true);
      }

      if (allowedOrigins.has(normalizedOrigin)) {
        console.log(`CORS: Allowing origin: ${normalizedOrigin}`);
        return callback(null, true);
      }

      const error = new Error(`CORS blocked for origin: ${normalizedOrigin}`);
      error.status = 401;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  };

  return cors(corsOptions);
};

module.exports = createCorsMiddleware;
