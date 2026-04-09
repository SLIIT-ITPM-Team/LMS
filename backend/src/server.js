


// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Channel = require('./models/Channel');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5001;

// Import our custom CORS middleware
const createCorsMiddleware = require('./middlewares/cors.middleware');
const healthRouter = require('./routes/health.routes');

// Ensure uploads directories exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(createCorsMiddleware());
app.use(helmet());
app.use(bodyParser.json());
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve uploaded PDFs statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!mongoUri) {
  console.error('MongoDB initial connection failed: MONGODB_URI is not set in backend/.env');
} else {
  mongoose.connect(mongoUri).catch((error) => {
    console.error('MongoDB initial connection failed:', error.message);
  });
}

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB connection success!");
  ensureDefaultAdmin()
    .then((admin) => ensureDefaultChannels(admin))
    .catch((err) => console.error('Default seed failed:', err.message));
});
connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
});

// Ensure a default admin exists (idempotent)
async function ensureDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.DEFAULT_ADMIN_NAME || 'admin';

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Default admin elevated: ${email}`);
    }
    return existing;
  }

  const created = await User.create({ name, email, password, role: 'admin' });
  console.log(`Default admin created: ${email}`);
  return created;
}

async function ensureDefaultChannels(adminUser) {
  if (!adminUser) return;
  const defaults = [
    { name: 'ITPM', subject: 'IT Project Management', description: 'Projects, PMBOK, Agile, tools', expert: { name: 'Dr. Silva' } },
    { name: 'PAF', subject: 'Physical and Applied Finance', description: 'Markets, risk, valuation', expert: { name: 'Prof. Kumar' } },
    { name: 'NDM', subject: 'Network & Data Management', description: 'Networks, security, ops', expert: { name: 'Eng. Perera' } },
  ];

  for (const ch of defaults) {
    const exists = await Channel.findOne({ name: ch.name });
    if (exists) {
      if (!exists.isActive) {
        exists.isActive = true;
        await exists.save();
        console.log(`Reactivated channel: ${ch.name}`);
      }
      continue;
    }
    await Channel.create({
      ...ch,
      createdBy: adminUser._id,
    });
    console.log(`Seeded channel: ${ch.name}`);
  }
}

// Routes
const quizRouter = require('./routes/quiz.routes.js');
const communityRoutes = require('./routes/community.routes.js');
const postRoutes = require('./routes/post.routes.js');
const commentRoutes = require('./routes/comment.routes.js');
const notificationRoutes = require('./routes/notification.routes.js');
const channelRoutes = require('./routes/channel.routes.js');
const authRouter = require('./routes/auth.routes');
const adminRouter = require('./routes/admin.routes');
const courseRouter = require('./routes/course.routes.js');
const materialRouter = require('./routes/material.routes.js');

// Health check endpoint first
app.use('/api/health', healthRouter);

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/admin', adminRouter);

app.use('/api/quiz', quizRouter);
app.use('/quiz', quizRouter);
app.use('/api/courses', courseRouter);
app.use('/api/materials', materialRouter);

// Global io instance
let io;

// Attach io to every request once it's available
app.use((req, res, next) => {
  if (io) {
    req.io = io;
  }
  next();
});

// Community routes (needs io attached)
app.use('/api/community', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/channels', channelRoutes);

app.use((err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Start server
function startServer(port, retriesLeft = 5) {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });
  global.io = io;

  // Socket.io connection
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Join a channel room
    socket.on('join:channel', (channelId) => {
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });

    // Leave a channel room
    socket.on('leave:channel', (channelId) => {
      socket.leave(channelId);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`Server is up and running on port number: ${port}`);
  });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
            const nextPort = port + 1;
            console.warn(`Port ${port} is already in use. Retrying on port ${nextPort}...`);
            startServer(nextPort, retriesLeft - 1);
            return;
        }

        if (error.code === 'EADDRINUSE') {
            console.error(`No available port found in range ${DEFAULT_PORT}-${DEFAULT_PORT + 5}. Set PORT in backend/.env and try again.`);
            process.exit(1);
        }

        console.error('Server failed to start:', error.message);
        process.exit(1);
    });
}

startServer(DEFAULT_PORT);
