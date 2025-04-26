// server/routes/announcements.js
const express = require('express');
const Announcement = require('../models/Announcement.js'); // Correct path
const { protect, adminOnly } = require('../middleware/auth.js'); // Correct path

const router = express.Router();

// @desc    Get all announcements, sorted by creation date descending
// @route   GET /api/announcements
// @access  Public
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements); // Send as array, even if empty
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching announcements' });
    }
});

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            // Use 404 for resource not found
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.status(200).json(announcement);
    } catch (error) {
        console.error(`Error fetching announcement ${req.params.id}:`, error);
        // Handle invalid MongoDB ObjectId format
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid announcement ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error fetching announcement' });
    }
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        // req.body contains the data sent from the frontend form
        const announcement = await Announcement.create(req.body);
        res.status(201).json(announcement); // 201 Created status
    } catch (error) {
        console.error("Error creating announcement:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error creating announcement' });
    }
});

// @desc    Update announcement by ID
// @route   PUT /api/announcements/:id
// @access  Private (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        // Find existing announcement first
        let announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        // Update using findByIdAndUpdate for atomicity and options
        announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the modified document instead of the original
            runValidators: true // Ensure updates adhere to schema validation
        });

        res.status(200).json(announcement);
    } catch (error) {
        console.error(`Error updating announcement ${req.params.id}:`, error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error updating announcement' });
    }
});

// @desc    Delete announcement by ID
// @route   DELETE /api/announcements/:id
// @access  Private (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        await announcement.deleteOne(); // Use deleteOne() on the document instance

        res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
        // Alternative: res.status(204).send(); // 204 No Content is also common for DELETE

    } catch (error) {
        console.error(`Error deleting announcement ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error deleting announcement' });
    }
});

module.exports = router;