const express = require('express');
const cors = require('cors');

const app = express();

const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const moduleRoutes = require('./routes/module.routes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/modules', moduleRoutes);

app.get('/', (req, res) => {
    res.send('LMS API is running...');
});

module.exports = app;
