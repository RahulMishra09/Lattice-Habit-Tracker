// routes/fitness.js — fitness progress tracking
const express = require('express');
const router  = express.Router();
const { AppConfig } = require('../db');

function getMondayKey(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// PATCH /api/fitness/exercise — toggle an exercise done/undone
// body: { day: 'Monday', index: 2 }
router.patch('/exercise', async (req, res) => {
  try {
    const { day, index } = req.body;
    if (!day || index === undefined) return res.status(400).json({ error: 'day and index required' });

    const config = await AppConfig.findById('config');
    const fp = { ...(config.fitnessProgress || {}) };
    const currentWeekKey = getMondayKey(new Date());

    // Safety: if week has drifted (race condition), reset completed but keep history
    if (fp.weekKey && fp.weekKey !== currentWeekKey) {
      const history = { ...(fp.history || {}) };
      const prev = fp.completedExercises || {};
      const totalDone = Object.values(prev).reduce((s, a) => s + a.length, 0);
      if (totalDone > 0) history[fp.weekKey] = { completedExercises: prev, totalExercises: totalDone };
      fp.completedExercises = {};
      fp.weekKey = currentWeekKey;
      fp.history = history;
    }

    fp.weekKey = fp.weekKey || currentWeekKey;
    const completed = [...(fp.completedExercises?.[day] || [])];
    const pos = completed.indexOf(index);
    if (pos === -1) completed.push(index);
    else completed.splice(pos, 1);

    fp.completedExercises = { ...(fp.completedExercises || {}), [day]: completed };
    config.fitnessProgress = fp;
    config.markModified('fitnessProgress');
    await config.save();

    res.json({ ok: true, day, completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/fitness/steps — set current step count
// body: { steps: 7500 }
router.patch('/steps', async (req, res) => {
  try {
    const { steps } = req.body;
    if (steps === undefined) return res.status(400).json({ error: 'steps required' });

    const config = await AppConfig.findById('config');
    const fp = { ...(config.fitnessProgress || {}) };
    fp.weekKey = fp.weekKey || getMondayKey(new Date());
    fp.steps   = Math.max(0, Math.round(steps));
    config.fitnessProgress = fp;
    config.markModified('fitnessProgress');
    await config.save();

    res.json({ ok: true, steps: fp.steps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/fitness/reset — reset this week's completed exercises only (keeps history & steps)
router.delete('/reset', async (req, res) => {
  try {
    const config = await AppConfig.findById('config');
    const fp = { ...(config.fitnessProgress || {}) };
    fp.completedExercises = {};
    fp.weekKey = fp.weekKey || getMondayKey(new Date());
    config.fitnessProgress = fp;
    config.markModified('fitnessProgress');
    await config.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
