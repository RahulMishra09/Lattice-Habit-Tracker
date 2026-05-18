// routes/seed.js — GET /api/seed  returns full LATTICE_SEED payload
const express  = require('express');
const router   = express.Router();
const { Habit, HabitLog, Task, AppConfig } = require('../db');

// Monday of a given date as 'YYYY-MM-DD' — used as weekly key
function getMondayKey(date) {
  const d = new Date(date);
  const day = d.getDay();              // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;  // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

router.get('/seed', async (req, res) => {
  try {
    // Fetch everything in parallel
    const [habits, logs, tasks, config] = await Promise.all([
      Habit.find().sort('pos').lean(),
      HabitLog.find({ value: { $gt: 0 } }).lean(),
      Task.find().sort('pos').lean(),
      AppConfig.findById('config'),   // non-lean so we can save
    ]);

    // ── Auto-rotate weekly fitness progress ──────────────────────────
    const currentWeekKey = getMondayKey(new Date());
    let fp = config.fitnessProgress
      ? { ...config.fitnessProgress }
      : { weekKey: currentWeekKey, completedExercises: {}, steps: 0, history: {} };

    if (!fp.weekKey) {
      // First time adding weekKey — stamp current week, no archive needed
      fp.weekKey = currentWeekKey;
      fp.history  = fp.history || {};
      config.fitnessProgress = fp;
      config.markModified('fitnessProgress');
      await config.save();
    } else if (fp.weekKey !== currentWeekKey) {
      // New week detected — archive completed exercises, reset current
      const history = { ...(fp.history || {}) };
      const prev = fp.completedExercises || {};
      const totalDone = Object.values(prev).reduce((s, a) => s + a.length, 0);

      if (totalDone > 0 || Object.keys(prev).length > 0) {
        history[fp.weekKey] = {
          completedExercises: prev,
          totalExercises: totalDone,
        };
      }

      fp = {
        weekKey:            currentWeekKey,
        completedExercises: {},
        steps:              fp.steps || 0,  // keep today's steps
        history,
      };

      config.fitnessProgress = fp;
      config.markModified('fitnessProgress');
      await config.save();
      console.log(`  Weekly fitness reset: ${fp.weekKey} (archived ${totalDone} exercises from previous week)`);
    }

    // Build habitLog map: { habitId: { 'YYYY-MM-DD': value } }
    const habitLog = {};
    habits.forEach(h => { habitLog[h.id] = {}; });
    logs.forEach(({ habitId, date, value }) => {
      if (habitLog[habitId]) habitLog[habitId][date] = value;
    });

    res.json({
      TODAY:         new Date().toISOString().slice(0, 10),
      habits,
      habitLog,
      tasks,
      subjects:      config.subjects,
      studyDaily:    config.studyDaily,
      focusSessions: config.focusSessions,
      events:        config.events,
      fitness:       config.fitness,
      xp:            config.xp,
      badges:        config.badges,
      challenges:    config.challenges,
      monthly:       config.monthly,
      suggestions:   config.suggestions,
      quotes:        config.quotes,
      dsaPatterns:     config.dsaPatterns || [],
      dsaProgress:     config.dsaProgress || {},
      dsaHistory:      config.dsaHistory || {},
      fitnessProgress: config.fitnessProgress || fp,
      backendTopics:   config.backendTopics  || [],
      backendProgress: config.backendProgress || {},
      backendHistory:  config.backendHistory || {},
      csTopics:        config.csTopics  || [],
      csProgress:      config.csProgress || {},
      daTopics:        config.daTopics  || [],
      daProgress:      config.daProgress || {},
      backendChapters: config.backendChapters || {},
      csChapters:      config.csChapters || {},
      daChapters:      config.daChapters || {},
      gaTopics:        config.gaTopics  || [],
      gaProgress:      config.gaProgress || {},
      gaChapters:      config.gaChapters || {},
      timerState:      config.timerState || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
