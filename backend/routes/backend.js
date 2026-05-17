// routes/backend.js — Backend topic progress tracking
const express = require('express');
const router  = express.Router();
const { AppConfig } = require('../db');

const VALID_STATUSES = ['done', 'reading', null];

// PATCH /api/backend/:id/status
// Cycles: null → 'reading' → 'done' → null
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await AppConfig.findById('config');
    const bp = { ...(config.backendProgress || {}) };
    const history = { ...(config.backendHistory || {}) };
    const today = new Date().toISOString().slice(0, 10);

    const current = bp[id] || null;
    const next = current === null ? 'reading' : current === 'reading' ? 'done' : null;

    if (next === null) {
      delete bp[id];
    } else {
      bp[id] = next;
    }
    if (next === 'done') history[id] = today;
    else delete history[id];

    config.backendProgress = bp;
    config.backendHistory = history;
    config.markModified('backendProgress');
    config.markModified('backendHistory');
    await config.save();

    res.json({ ok: true, id, status: next, completedAt: history[id] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/backend/:id/chapter   body: { index }
router.patch('/:id/chapter', async (req, res) => {
  try {
    const { id } = req.params;
    const { index } = req.body;
    const config = await AppConfig.findById('config');
    const bc = { ...(config.backendChapters || {}) };
    const list = [...(bc[id] || [])];
    const pos = list.indexOf(index);
    if (pos === -1) list.push(index); else list.splice(pos, 1);
    bc[id] = list;
    config.backendChapters = bc;
    config.markModified('backendChapters');
    await config.save();
    res.json({ ok: true, id, index, completed: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
