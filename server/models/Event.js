// server/models/Event.js
const mongoose = require('mongoose');

// Define the schema for the 'events' collection
const EventSchema = new mongoose.Schema(
    {
        // --- Core Event Details ---
        title: {
            type: String,
            required: [true, 'Please add an event title'], // Title is mandatory
            trim: true, // Remove leading/trailing whitespace
            maxlength: [150, 'Event title cannot be more than 150 characters'] // Optional length limit
        },
        description: {
            type: String,
            required: [true, 'Please add an event description'] // Description is mandatory
        },
        date: {
            type: Date,
            required: [true, 'Please add an event date and time'] // Date/Time is mandatory
        },

        // --- Optional Event Details ---
        location: { // Physical location or online platform
            type: String,
            trim: true
        },
        image: { // URL for the main event banner or thumbnail image
            type: String,
            trim: true
            // Optional: Add URL validation if desired
            // match: [/^(http|https):\/\/[^ "]+$/, 'Please use a valid URL for the image']
        },
        registrationLink: { // Optional link for users to register
            type: String,
            trim: true
            // Optional: Add URL validation
        },

        // --- Gallery Moments ---
        // Stores an array of image URLs for the event gallery ('moments') section
        moments: {
            type: [String], // Defines an array where each element must be a String (URL)
            default: [] // Defaults to an empty array if not provided
            // Consider adding validation for each URL within the array if needed
        }

        // --- Other Potential Fields ---
        // category: { type: String, trim: true } // e.g., 'Workshop', 'Hackathon', 'Talk'
        // isFeatured: { type: Boolean, default: false }
        // createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' } // Track who created it

    }, {
        // --- Schema Options ---
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

// --- Indexes (Optional but recommended for performance on queried fields) ---
// Example: Index the date field for faster sorting/filtering by date
EventSchema.index({ date: -1 }); // Index for sorting by date descending

// --- Export the Mongoose Model ---
// Mongoose will create/use a collection named 'events' (lowercase plural) in MongoDB
module.exports = mongoose.model('Event', EventSchema);