// server/routes/events.js
const express = require('express');
const mongoose = require('mongoose'); // Needed for ObjectId validation
const Event = require('../models/Event.js'); // Ensure path is correct
const { protect, adminOnly } = require('../middleware/auth.js'); // Ensure path is correct

const router = express.Router(); // Initialize the express router

// --- Helper Function for Centralized Error Handling ---
const handleServerError = (res, error, action = 'perform action') => {
    console.error(`Error during ${action}:`, error.message); // Log the specific error message

    // Handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    // Handle CastErrors (often invalid ObjectId format)
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ID format provided for ${action}.` });
    }
    // Handle potential duplicate key errors if unique fields are added later
    if (error.code === 11000) {
         return res.status(400).json({ success: false, message: `Duplicate field value entered during ${action}.` });
    }

    // Default to 500 Internal Server Error for other issues
    res.status(500).json({ success: false, message: `Server Error while trying to ${action}. Please try again later.` });
};


// --- API Routes for Events ---

// @desc    Get all events, sorted by event date descending (newest first)
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 }); // Sort by date, newest first
        res.status(200).json(events); // Send array (can be empty)
    } catch (error) {
        handleServerError(res, error, 'fetching all events');
    }
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
    // Validate ID format before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ success: false, message: 'Invalid event ID format' });
    }
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json(event); // Send the specific event object
    } catch (error) {
         handleServerError(res, error, `fetching event with ID ${req.params.id}`);
    }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        // Create new event document using data from request body
        // Mongoose validation defined in the model will run automatically
        const event = await Event.create(req.body);
        res.status(201).json(event); // Return new event with 201 status
    } catch (error) {
        handleServerError(res, error, 'creating event');
    }
});

// @desc    Update an existing event by ID (excluding moments)
// @route   PUT /api/events/:id
// @access  Private (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ success: false, message: 'Invalid event ID format' });
    }
    try {
        // Fields allowed to be updated by the main edit form (excluding moments)
        const allowedUpdates = ['title', 'description', 'date', 'location', 'image', 'registrationLink'];
        const updates = {};

        allowedUpdates.forEach(field => {
            // Only include field in update if it was actually sent in the request body
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Check if there are any fields to update
        if (Object.keys(updates).length === 0) {
             return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
        }

        // Find and update the document
        const event = await Event.findByIdAndUpdate(req.params.id, updates, {
            new: true, // Return the updated document
            runValidators: true // Ensure schema validations run
        });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json(event); // Send back the updated event object

    } catch (error) {
        handleServerError(res, error, `updating event with ID ${req.params.id}`);
    }
});

// @desc    Delete an event by ID
// @route   DELETE /api/events/:id
// @access  Private (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ success: false, message: 'Invalid event ID format' });
    }
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        await event.deleteOne();
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        handleServerError(res, error, `deleting event with ID ${req.params.id}`);
    }
});


// --- Routes for Managing Event Moments ---

// @desc    Get moments (image URLs array) for a specific event
// @route   GET /api/events/:id/moments
// @access  Public
router.get('/:id/moments', async (req, res) => {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ success: false, message: 'Invalid event ID format' });
    }
    try {
        // Find the event and select ONLY the 'moments' field
        const event = await Event.findById(req.params.id).select('moments');
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json(event.moments || []); // Return moments array or empty array

    } catch (error) {
         handleServerError(res, error, `fetching moments for event ID ${req.params.id}`);
    }
});

// @desc    Add a new moment image URL to a specific event
// @route   POST /api/events/:id/moments
// @access  Private (Admin Only)
router.post('/:id/moments', protect, adminOnly, async (req, res) => {
    const { imageUrl } = req.body;
    const eventId = req.params.id;

     if (!mongoose.Types.ObjectId.isValid(eventId)) {
         return res.status(400).json({ success: false, message: 'Invalid event ID format' });
    }

    // Validate imageUrl
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim().startsWith('http')) {
        return res.status(400).json({ success: false, message: 'Please provide a valid image URL starting with http or https.' });
    }
    const trimmedUrl = imageUrl.trim();

    try {
        // Use findByIdAndUpdate with $addToSet to add URL only if it doesn't exist
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $addToSet: { moments: trimmedUrl } }, // $addToSet prevents duplicates
            { new: true, runValidators: true } // Return updated doc, run validators
        );

        if (!updatedEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if the moment was actually added (if $addToSet found a duplicate, it wouldn't change the array)
        if (!updatedEvent.moments.includes(trimmedUrl)) {
             // This case means the URL was already present
             return res.status(400).json({ success: false, message: 'This image URL already exists for this event.' });
        }

        // Send back success and the updated array
        res.status(201).json({ // Use 201 Created status for adding a sub-resource
             success: true,
             message: 'Moment added successfully',
             moments: updatedEvent.moments
        });

    } catch (error) {
        handleServerError(res, error, `add moment to event ${eventId}`);
    }
});

// @desc    Delete a specific moment image URL from an event
// @route   DELETE /api/events/:id/moments
// @access  Private (Admin Only)
router.delete('/:id/moments', protect, adminOnly, async (req, res) => {
     const { imageUrlToDelete } = req.body; // Expect URL in the body
     const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
         return res.status(400).json({ success: false, message: 'Invalid event ID format' });
      }

      if (!imageUrlToDelete || typeof imageUrlToDelete !== 'string') {
        return res.status(400).json({ success: false, message: 'Please provide the image URL to delete in the request body.' });
      }
      const trimmedUrlToDelete = imageUrlToDelete.trim();

     try {
         // Use findByIdAndUpdate with $pull to remove the specific URL from the array
         const updatedEvent = await Event.findByIdAndUpdate(
             eventId,
             { $pull: { moments: trimmedUrlToDelete } }, // $pull removes matching items from array
             { new: true } // Return the updated document
         );

         if (!updatedEvent) {
             return res.status(404).json({ success: false, message: 'Event not found' });
         }

         // Check if the URL was actually present and removed
         // (Note: $pull works even if the item wasn't there, it just won't modify)
         // We might rely on the frontend to know if the delete worked based on the UI interaction

         res.status(200).json({
             success: true,
             message: 'Moment deleted successfully (if it existed)',
             moments: updatedEvent.moments // Return the potentially updated array
         });

     } catch (error) {
          handleServerError(res, error, `delete moment from event ${eventId}`);
     }
});


// Export the configured router
module.exports = router;