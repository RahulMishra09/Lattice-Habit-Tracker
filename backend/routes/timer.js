// routes/timer.js — PATCH /api/timer  saves timer state for cross-device sync
const express  = require('express');
const router   = express.Router();
const { AppConfig } = require('../db');

router.patch('/timer', async (req, res) => {
  try {
    await AppConfig.findByIdAndUpdate(
      'config',
      { $set: { timerState: req.body } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
