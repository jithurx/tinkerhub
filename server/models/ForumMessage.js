// server/models/ForumMessage.js
const mongoose = require('mongoose');

const ForumMessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Message text cannot be empty'],
        trim: true,
        maxlength: [500, 'Message text cannot exceed 500 characters'] // Example length limit
    },
    user: { // Reference to the User who posted
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Links to the 'User' model
        required: true // Ensure every message has an associated user
    }
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('ForumMessage', ForumMessageSchema);