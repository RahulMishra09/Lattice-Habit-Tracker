// routes/dsa.js — PATCH /api/dsa/:id/toggle
const express    = require('express');
const router     = express.Router();
const { AppConfig } = require('../db');

router.patch('/:id/toggle', async (req, res) => {
  try {
    const config = await AppConfig.findById('config');
    if (!config) return res.status(404).json({ error: 'config not found' });

    const today = new Date().toISOString().slice(0, 10);
    const progress = { ...(config.dsaProgress || {}) };
    const history = { ...(config.dsaHistory || {}) };
    const done = !progress[req.params.id];
    progress[req.params.id] = done;
    if (done) history[req.params.id] = today;
    else delete history[req.params.id];
    config.dsaProgress = progress;
    config.dsaHistory = history;
    config.markModified('dsaProgress');
    config.markModified('dsaHistory');
    await config.save();

    res.json({ id: req.params.id, done, completedAt: history[req.params.id] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
