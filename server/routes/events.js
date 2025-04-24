const express = require('express');
const Event   = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Public: list all events
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: -1 });
  res.json(events);
});

// Admin: create
router.post('/', protect, adminOnly, async (req, res) => {
  const ev = new Event(req.body);
  await ev.save();
  res.status(201).json(ev);
});

// Admin: update
router.put('/:id', protect, adminOnly, async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Admin: delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
