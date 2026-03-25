


// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5001;

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
const URL = process.env.MONGODB_URI;
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
const communityRouter = require('./routes/community.routes.js');
const { initializeSocket } = require('./config/socketConfig.js');

app.use('/api/quiz', quizRouter);
app.use('/api/community', communityRouter);

// Start server
function startServer(port, retriesLeft = 5) {
    const server = http.createServer(app);
    
    // Initialize Socket.io
    initializeSocket(server);

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
