// routes/events.js — POST / PATCH /:id / DELETE /:id
const express    = require('express');
const router     = express.Router();
const { AppConfig } = require('../db');

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { id, title, date, time, kind } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'title and date required' });
    const ev = { id: id || ('e' + Date.now()), title, date, time: time || 'all-day', kind: kind || 'event' };
    const config = await AppConfig.findById('config');
    config.events = [...(config.events || []), ev];
    config.markModified('events');
    await config.save();
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/events/:id
router.patch('/:id', async (req, res) => {
  try {
    const config = await AppConfig.findById('config');
    const events = [...(config.events || [])];
    const idx = events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'event not found' });
    ['title', 'date', 'time', 'kind'].forEach(k => {
      if (req.body[k] !== undefined) events[idx] = { ...events[idx], [k]: req.body[k] };
    });
    config.events = events;
    config.markModified('events');
    await config.save();
    res.json(events[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const config = await AppConfig.findById('config');
    config.events = (config.events || []).filter(e => e.id !== req.params.id);
    config.markModified('events');
    await config.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
