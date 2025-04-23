// api/index.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('../server/config/db');

// Route modules
const authRoutes         = require('../server/routes/auth');
const annRoutes          = require('../server/routes/announcements');
const eventRoutes        = require('../server/routes/events');
const resourceRoutes     = require('../server/routes/resources');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/auth',         authRoutes);
app.use('/api/announcements',annRoutes);
app.use('/api/events',       eventRoutes);
app.use('/api/resources',    resourceRoutes);

module.exports = app;
