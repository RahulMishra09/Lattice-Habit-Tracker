// routes/tasks.js
const express = require('express');
const router  = express.Router();
const { Task } = require('../db');

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort('pos').lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, list = 'Today', priority = 'medium' } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const pos  = await Task.countDocuments();
    const task = await Task.create({
      id: 't' + Date.now(),
      title, list, priority, pos,
      due: new Date().toISOString().slice(0, 10),
    });
    res.status(201).json(task.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/reorder  — must come BEFORE /:id
router.patch('/reorder', async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    const [from, to] = await Promise.all([
      Task.findOne({ id: fromId }),
      Task.findOne({ id: toId }),
    ]);
    if (!from || !to) return res.status(404).json({ error: 'task not found' });

    const tmp = from.pos;
    from.pos  = to.pos;
    to.pos    = tmp;
    await Promise.all([from.save(), to.save()]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'list', 'cat', 'priority', 'due', 'done'];
    const task = await Task.findOne({ id: req.params.id });
    if (!task) return res.status(404).json({ error: 'not found' });

    allowed.forEach(key => {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    });

    if (req.body.done !== undefined) {
      task.completedAt = req.body.done
        ? (task.completedAt || new Date().toISOString().slice(0, 10))
        : null;
    }

    await task.save();
    res.json(task.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await Task.deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
