// routes/focus.js — POST /api/focus/log  (record a completed focus session)
const express = require('express');
const router  = express.Router();
const { AppConfig } = require('../db');

// POST /api/focus/log
// Body: { subject: 'DSA', minutes: 25 }
// Updates studyDaily (hours for today) + appends to focusSessions
router.post('/log', async (req, res) => {
  try {
    const { subject = 'General', minutes = 25 } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const hoursAdded = minutes / 60;

    const config = await AppConfig.findById('config');

    // ── studyDaily: upsert today's entry ─────────────────────────────
    const studyDaily = [...(config.studyDaily || [])];
    const idx = studyDaily.findIndex(e => e.date === today);
    if (idx === -1) {
      studyDaily.push({ date: today, hours: Math.round(hoursAdded * 100) / 100 });
    } else {
      studyDaily[idx] = {
        date: today,
        hours: Math.round((studyDaily[idx].hours + hoursAdded) * 100) / 100,
      };
    }

    // ── focusSessions: append completed session ───────────────────────
    const focusSessions = [...(config.focusSessions || [])];
    focusSessions.push({
      id:        `fs_${Date.now()}`,
      date:      today,
      subject,
      minutes,
      completed: true,
    });

    config.studyDaily    = studyDaily;
    config.focusSessions = focusSessions;
    config.markModified('studyDaily');
    config.markModified('focusSessions');
    await config.save();

    res.json({ ok: true, today, hoursAdded, studyDaily, focusSessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
