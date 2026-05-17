// routes/gate.js — GATE CS & DA topic progress
const express = require('express');
const router  = express.Router();
const { AppConfig } = require('../db');

function makeToggle(progressField) {
  return async (req, res) => {
    try {
      const { id } = req.params;
      const config = await AppConfig.findById('config');
      const bp = { ...(config[progressField] || {}) };
      const current = bp[id] || null;
      const next = current === null ? 'reading' : current === 'reading' ? 'done' : null;
      if (next === null) delete bp[id]; else bp[id] = next;
      config[progressField] = bp;
      config.markModified(progressField);
      await config.save();
      res.json({ ok: true, id, status: next });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

router.patch('/cs/:id/status',  makeToggle('csProgress'));
router.patch('/da/:id/status',  makeToggle('daProgress'));
router.patch('/ga/:id/status',  makeToggle('gaProgress'));

function makeChapterToggle(chaptersField) {
  return async (req, res) => {
    try {
      const { id } = req.params;
      const { index } = req.body;
      const config = await AppConfig.findById('config');
      const bc = { ...(config[chaptersField] || {}) };
      const list = [...(bc[id] || [])];
      const pos = list.indexOf(index);
      if (pos === -1) list.push(index); else list.splice(pos, 1);
      bc[id] = list;
      config[chaptersField] = bc;
      config.markModified(chaptersField);
      await config.save();
      res.json({ ok: true, id, index, completed: list });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

router.patch('/cs/:id/chapter',  makeChapterToggle('csChapters'));
router.patch('/da/:id/chapter',  makeChapterToggle('daChapters'));
router.patch('/ga/:id/chapter',  makeChapterToggle('gaChapters'));

module.exports = router;
