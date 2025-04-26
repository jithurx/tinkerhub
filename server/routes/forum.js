// server/routes/forum.js
const express = require('express');
const mongoose = require('mongoose'); // Optional: for ObjectId validation if needed later
const ForumMessage = require('../models/ForumMessage.js'); // Correct path to model
const { protect } = require('../middleware/auth.js'); // Correct path to middleware (only 'protect' needed)

const router = express.Router();

// --- Helper Function for Centralized Error Handling ---
const handleServerError = (res, error, action = 'perform action') => {
    console.error(`Error during ${action}:`, error.message);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    // Add other specific error checks if needed (e.g., CastError)
    res.status(500).json({ success: false, message: `Server Error while trying to ${action}.` });
};


// @desc    Get all forum messages, populated with user name, sorted oldest first
// @route   GET /api/forum/messages
// @access  Private (Requires login - student or admin)
router.get('/messages', protect, async (req, res) => {
    try {
        const messages = await ForumMessage.find()
                              .sort({ createdAt: 1 }) // Chronological order (oldest first)
                              .populate('user', 'name'); // Fetch the 'name' field from the referenced 'User' doc

        // Check if populate worked (user might have been deleted)
        const populatedMessages = messages.map(msg => ({
            ...msg.toObject(), // Convert Mongoose doc to plain object
            user: msg.user ? { _id: msg.user._id, name: msg.user.name } : { _id: null, name: '[Deleted User]' } // Handle potentially deleted users
        }));

        res.status(200).json(populatedMessages); // Send array of messages
    } catch (error) {
        handleServerError(res, error, 'fetching forum messages');
    }
});

// @desc    Post a new forum message
// @route   POST /api/forum/messages
// @access  Private (Requires login - student or admin)
router.post('/messages', protect, async (req, res) => {
    const { text } = req.body; // Get text from request body

    // Validate input text existence and length (can rely on Mongoose validation too)
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
       return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }
    if (text.trim().length > 500) { // Match model validation
         return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 500 characters' });
    }

    try {
        // Create the new message document
        // 'req.user.id' is available because the 'protect' middleware ran successfully
        const newMessage = await ForumMessage.create({
            text: text.trim(), // Store trimmed text
            user: req.user.id // Associate message with the logged-in user's ID
        });

        // Populate the user details for the newly created message before sending back
        // This avoids a separate fetch on the frontend just to display the name
        const populatedMessage = await ForumMessage.findById(newMessage._id)
                                     .populate('user', 'name'); // Populate name

        // Handle case where user might have been deleted between create and populate (highly unlikely but safe)
        const responseMessage = populatedMessage.toObject();
        if (!responseMessage.user) {
             responseMessage.user = { _id: null, name: '[Deleted User]' };
        } else {
             responseMessage.user = { _id: responseMessage.user._id, name: responseMessage.user.name };
        }


        res.status(201).json(responseMessage); // Send back the created message with user details (201 Created)

    } catch (error) {
        handleServerError(res, error, 'posting forum message');
    }
});

// --- Optional: Future Routes ---
// DELETE /api/forum/messages/:id (Could be Admin only, or message owner)
// PUT /api/forum/messages/:id (Could be message owner only, maybe within a time limit)

module.exports = router; // Export the router