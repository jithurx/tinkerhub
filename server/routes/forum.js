// server/routes/forum.js
const express = require('express');
const ForumMessage = require('../models/ForumMessage.js'); // Correct path
const { protect } = require('../middleware/auth.js'); // Only need 'protect'

const router = express.Router();

// @desc    Get all forum messages, populated with user name, sorted oldest first
// @route   GET /api/forum/messages
// @access  Private (Requires login)
router.get('/messages', protect, async (req, res) => {
    try {
        const messages = await ForumMessage.find()
                              .sort({ createdAt: 1 }) // Oldest first for chat flow
                              .populate('user', 'name'); // Fetch the 'name' field from the referenced 'User' doc

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching forum messages:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching messages' });
    }
});

// @desc    Post a new forum message
// @route   POST /api/forum/messages
// @access  Private (Requires login - student or admin)
router.post('/messages', protect, async (req, res) => {
    const { text } = req.body;

    // Validate input text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
       return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }
    if (text.length > 500) { // Example length validation
         return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 500 characters' });
    }


    try {
        // Create the message, associating it with the logged-in user from req.user
        const newMessage = await ForumMessage.create({
            text: text.trim(), // Store trimmed text
            user: req.user.id // req.user is added by the 'protect' middleware
        });

        // Populate the user details for the newly created message before sending back
        // This avoids a separate fetch on the frontend after posting
        const populatedMessage = await ForumMessage.findById(newMessage._id)
                                     .populate('user', 'name');

        res.status(201).json(populatedMessage); // Send back the created message with user details

    } catch (error) {
        console.error("Error posting forum message:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error posting message' });
    }
});

// Potential Future Routes (Optional):
// DELETE /api/forum/messages/:id (Admin or message owner?)
// PUT /api/forum/messages/:id (Maybe message owner only, within a time limit?)

module.exports = router;