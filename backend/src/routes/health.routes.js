const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * Health check endpoint for debugging and monitoring
 * Provides server status and CORS configuration information
 */
router.get('/health', (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001,
    cors: {
      nodeEnv: process.env.NODE_ENV,
      allowedOrigins: process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'Not set',
      credentials: true
    },
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState
    }
  };

  res.status(200).json(healthCheck);
});

module.exports = router;
