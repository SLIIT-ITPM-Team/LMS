


// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 8070;

// Ensure uploads directories exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve uploaded PDFs statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const URL = process.env.MONGODB_URI || process.env.MONGODB_URL;
mongoose.connect(URL).catch((error) => {
    console.error('MongoDB initial connection failed:', error.message);
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB connection success!");
});
connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
});

// Routes
const quizRouter = require('./routes/quiz.routes.js');
const communityRoutes = require('./routes/community.routes.js');
app.use('/quiz', quizRouter);

// Global io instance
let io;

// Start server
function startServer(port, retriesLeft = 5) {
    const server = http.createServer(app);

    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    });

    // Attach io to every request AFTER io is created
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Community routes (MUST be AFTER middleware)
    app.use('/api/community', communityRoutes);

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
