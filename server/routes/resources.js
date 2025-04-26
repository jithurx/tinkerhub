// server/routes/resources.js
const express = require('express');
const Resource = require('../models/Resource.js'); // Correct path
const { protect, adminOnly } = require('../middleware/auth.js'); // Correct path

const router = express.Router();

// @desc    Get all resources, sorted by creation date descending
// @route   GET /api/resources
// @access  Public
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.status(200).json(resources);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ success: false, message: 'Server Error fetching resources' });
    }
});

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        res.status(200).json(resource);
    } catch (error) {
        console.error(`Error fetching resource ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error fetching resource' });
    }
});

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const resource = await Resource.create(req.body);
        res.status(201).json(resource);
    } catch (error) {
        console.error("Error creating resource:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        res.status(500).json({ success: false, message: 'Server Error creating resource' });
    }
});

// @desc    Update resource by ID
// @route   PUT /api/resources/:id
// @access  Private (Admin Only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        let resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json(resource);
    } catch (error) {
        console.error(`Error updating resource ${req.params.id}:`, error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join('. ') });
        }
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error updating resource' });
    }
});

// @desc    Delete resource by ID
// @route   DELETE /api/resources/:id
// @access  Private (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        await resource.deleteOne();
        res.status(200).json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error(`Error deleting resource ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error deleting resource' });
    }
});

module.exports = router;