// server/models/ForumMessage.js
const mongoose = require('mongoose');

const ForumMessageSchema = new mongoose.Schema({
    // The actual text content of the message
    text: {
        type: String,
        required: [true, 'Message text cannot be empty'],
        trim: true,
        maxlength: [500, 'Message text cannot exceed 500 characters'] // Example length limit
    },
    // Reference to the User document of the person who posted the message
    user: {
        type: mongoose.Schema.ObjectId, // Stores the MongoDB ObjectId of the user
        ref: 'User', // Creates a reference link to the 'User' model/collection
        required: [true, 'Message must belong to a user'] // Ensure user association
    }
    // Optional: Add fields like 'isEdited', 'replies', etc. if needed later
}, {
    // Automatically add 'createdAt' and 'updatedAt' timestamps
    timestamps: true
});

// Optional: Add an index on createdAt for efficient sorting
ForumMessageSchema.index({ createdAt: 1 });

// Export the Mongoose model
// Mongoose will use the collection name 'forummessages' (lowercase, plural)
module.exports = mongoose.model('ForumMessage', ForumMessageSchema);