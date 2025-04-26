// server.js (Moved from api/index.js)
require('dotenv').config(); // MUST BE FIRST
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./server/config/db'); // Updated path

// Route modules (Update paths)
const authRoutes         = require('./server/routes/auth');
const annRoutes          = require('./server/routes/announcements');
const eventRoutes        = require('./server/routes/events');
const resourceRoutes     = require('./server/routes/resources');
const forumRoutes        = require('./server/routes/forum');

// Connect to MongoDB
connectDB(); // Attempt DB connection early

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Mount API routes (Keep '/api' prefix for consistency with frontend)
app.use('/api/auth',         authRoutes);
app.use('/api/announcements',annRoutes);
app.use('/api/events',       eventRoutes);
app.use('/api/resources',    resourceRoutes);
app.use('/api/forum',        forumRoutes);

// Simple API root test route
app.get('/api', (req, res) => {
    res.json({ message: 'TinkerHub Campus API is running!' });
});

// Add a simple root route for the server itself (optional)
app.get('/', (req, res) => {
    res.send('Backend Server is Alive!');
});

// --- Server Listening Logic (Runs Always) ---
const PORT = process.env.PORT || 5000; // Use port from environment or default

const server = app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections (Good Practice)
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Optionally close server gracefully
  // server.close(() => process.exit(1));
});

// NOTE: No module.exports = app; needed here