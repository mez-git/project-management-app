const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // For logging API requests
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors());         // Enable CORS for frontend
app.use(morgan('dev'));  // Request logging

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/projects', require('./routes/projectRoutes'));
app.use('/api/v1/tasks', require('./routes/taskRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;