


// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 8070;

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow non-browser clients or same-origin requests with no Origin header.
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
};

// Ensure uploads directories exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
});
connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
});

// Routes
const quizRouter = require('./routes/quiz.routes.js');
const authRouter = require('./routes/auth.routes');
const adminRouter = require('./routes/admin.routes');

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/admin', adminRouter);

app.use('/api/quiz', quizRouter);
app.use('/quiz', quizRouter);

app.use((err, req, res, next) => {
    const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(status).json({
        message: err.message || 'Server error',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
});

// Start server
function startServer(port, retriesLeft = 5) {
    const server = app.listen(port, () => {
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
