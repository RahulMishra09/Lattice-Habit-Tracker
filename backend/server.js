// server.js — Lattice backend
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { connect, seed } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve frontend static files ──────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API routes ───────────────────────────────────────────────────────
app.use('/api/habits',  require('./routes/habits'));
app.use('/api/tasks',   require('./routes/tasks'));
app.use('/api/dsa',     require('./routes/dsa'));
app.use('/api/events',  require('./routes/events'));
app.use('/api/fitness',  require('./routes/fitness'));
app.use('/api/backend',  require('./routes/backend'));
app.use('/api/focus',    require('./routes/focus'));
app.use('/api',          require('./routes/timer'));
app.use('/api',          require('./routes/gate'));
app.use('/api',          require('./routes/seed'));

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Catch-all: serve frontend for any non-API route ──────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Boot: connect → seed → listen ────────────────────────────────────
async function start() {
  try {
    await connect();   // Connect to MongoDB Atlas
    await seed();      // Seed collections if empty
    app.listen(PORT, () => {
      console.log(`\n  Lattice server → http://localhost:${PORT}`);
      console.log(`  API base       → http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('  Failed to start:', err.message);
    process.exit(1);
  }
}

start();
