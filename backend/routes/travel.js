const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Travel = require('../models/Travel');
const Feedback = require('../models/Feedback');

// ----- Travel logs (user specific) -----

// GET /api/travel
router.get('/', protect, async (req, res, next) => {
  try {
    const logs = await Travel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) { next(err); }
});

// POST /api/travel
router.post('/', protect, async (req, res, next) => {
  try {
    const body = req.body || {};
    const doc = await Travel.create({
      user: req.user.id,
      country: body.country,
      city: body.city,
      transport: body.transport,
      start: body.start,
      end: body.end,
      people: body.people || 1,
      notes: body.notes || ''
    });
    res.status(201).json(doc);
  } catch (err) { next(err); }
});

// DELETE /api/travel/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const removed = await Travel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!removed) return res.status(404).json({ message: 'Trip not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ----- Feedback (public) -----

// GET /api/travel/feedback/all
router.get('/feedback/all', async (req, res, next) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

// POST /api/travel/feedback
router.post('/feedback', async (req, res, next) => {
  try {
    const f = await Feedback.create({
      name: req.body.name || '',
      rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
      comment: req.body.comment || ''
    });
    res.status(201).json(f);
  } catch (err) { next(err); }
});

module.exports = router;
