// routes/habits.js
const express  = require('express');
const router   = express.Router();
const { Habit, HabitLog } = require('../db');

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort('pos').lean();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/habits/logs  — all logs shaped as { habitId: { date: value } }
router.get('/logs', async (req, res) => {
  try {
    const logs = await HabitLog.find({ value: { $gt: 0 } }).lean();
    const map = {};
    logs.forEach(({ habitId, date, value }) => {
      if (!map[habitId]) map[habitId] = {};
      map[habitId][date] = value;
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { name, cat } = req.body;
    if (!name || !cat) return res.status(400).json({ error: 'name and cat required' });

    const pos   = await Habit.countDocuments();
    const habit = await Habit.create({ id: 'h' + Date.now(), name, cat, pos });
    res.status(201).json(habit.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/habits/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id }  = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'date required' });

    const existing = await HabitLog.findOne({ habitId: id, date });
    const newValue = existing && existing.value > 0 ? 0 : 4;

    await HabitLog.findOneAndUpdate(
      { habitId: id, date },
      { value: newValue },
      { upsert: true, new: true }
    );
    res.json({ habitId: id, date, value: newValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    await Promise.all([
      Habit.deleteOne({ id: req.params.id }),
      HabitLog.deleteMany({ habitId: req.params.id }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
