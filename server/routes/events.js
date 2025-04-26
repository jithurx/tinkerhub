// server/routes/events.js
const express = require('express');
const Event = require('../models/Event.js'); // Correct path
const { protect, adminOnly } = require('../middleware/auth.js'); // Correct path

const router = express.Router();

// @desc    Get all events, sorted by date descending
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Frontend can filter into upcoming/past if needed
        const events = await Event.find().sort({ date: -1 }); // Newest date first
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching events' });
    }
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error(`Error fetching event ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid event ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error fetching event' });
    }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
    } catch (error) {
        console.error("Error creating event:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error creating event' });
    }
});

// @desc    Update event by ID
// @route   PUT /api/events/:id
// @access  Private (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json(event);
    } catch (error) {
        console.error(`Error updating event ${req.params.id}:`, error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid event ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error updating event' });
    }
});

// @desc    Delete event by ID
// @route   DELETE /api/events/:id
// @access  Private (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        await event.deleteOne();
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error(`Error deleting event ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid event ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error deleting event' });
    }
});

// @desc    Get moments for a specific event
// @route   GET /api/events/:id/moments
// @access  Public
router.get('/:id/moments', async (req, res) => {
    const eventId = req.params.id;
    console.log(`Fetching moments for event ID: ${eventId}`);
    try {
        // 1. Check if event exists (optional but good practice)
        const eventExists = await Event.findById(eventId);
        if (!eventExists) {
             return res.status(404).json({ success: false, message: 'Event not found, cannot fetch moments.' });
        }

        // 2. Placeholder/Dummy data logic
        // TODO: Replace this with your actual logic to fetch moments
        // E.g., if moments are stored as an array in the event document:
        // const eventWithMoments = await Event.findById(eventId).select('moments');
        // const moments = eventWithMoments ? eventWithMoments.moments : [];
        // Or fetch from a separate collection or external storage...

        // For now, returning dummy data or empty array:
        const moments = [
            // "https://via.placeholder.com/300x200.png?text=Moment+1",
            // "https://via.placeholder.com/300x200.png?text=Moment+2"
        ];
        res.status(200).json(moments);

    } catch (error) {
        console.error(`Error fetching moments for event ${eventId}:`, error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid event ID format for moments' });
        }
        res.status(500).json({ success: false, message: 'Server Error fetching moments' });
    }
});


module.exports = router;