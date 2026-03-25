const cors = require('cors');

/**
 * CORS middleware configuration for the LMS backend
 * Provides flexible CORS handling for development and production environments
 */
const createCorsMiddleware = () => {
  // Parse allowed origins from environment variables
  const parseAllowedOrigins = () => {
    const envOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
    const origins = envOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);

    // For development, add common Vite ports if not already included
    if (process.env.NODE_ENV === 'development') {
      const defaultDevOrigins = [
        'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
        'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178',
        'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175',
        'http://127.0.0.1:5176', 'http://127.0.0.1:5177', 'http://127.0.0.1:5178'
      ];
      
      defaultDevOrigins.forEach(origin => {
        if (!origins.includes(origin)) {
          origins.push(origin);
        }
      });
    }

    return origins;
  };

  const allowedOrigins = parseAllowedOrigins();

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`CORS: Allowing origin (development): ${origin}`);
        return callback(null, true);
      }

      // In production, check against allowed origins
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS: Allowing origin: ${origin}`);
        return callback(null, true);
      }

      const error = new Error(`CORS blocked for origin: ${origin}`);
      error.status = 401;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200 // For legacy browser support
  };

  return cors(corsOptions);
};

module.exports = createCorsMiddleware;