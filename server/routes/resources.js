const express = require('express');
const Resource= require('../models/Resource');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  const all = await Resource.find().sort({ createdAt: -1 });
  res.json(all);
});

router.post('/', protect, adminOnly, async (req, res) => {
  const r = new Resource(req.body);
  await r.save();
  res.status(201).json(r);
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
