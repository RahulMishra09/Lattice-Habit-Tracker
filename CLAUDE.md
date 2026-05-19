# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI
npm install
npm start              # production
npm run dev            # dev with nodemon watch
```

Open http://localhost:3001. There is no separate frontend dev server; the Express backend serves the `frontend/` directory as static files.

There is no test suite and no linter configuration.

## Architecture overview

This is a single-user habit/study tracker for a GATE/placement-prep student. The stack is:

- **Frontend**: React 18 loaded via CDN, JSX transpiled in-browser by Babel Standalone — no build step. All frontend files are plain `.jsx`/`.js` served as static assets.
- **Backend**: Node.js + Express 4
- **Database**: MongoDB Atlas via Mongoose

### Data flow

On startup, the frontend fetches `GET /api/seed`, which returns the entire app state in one payload, stored on `window.LATTICE_SEED` and also dispatched into React state via a `useReducer`. All user actions are **optimistic**: the reducer updates local state immediately, then `apiDispatch` fires a background `fetch` to sync the backend. API failures are silently swallowed with `.catch(console.warn)`.

### Frontend file load order

`index.html` loads the files in this order (each must be present before the next):
1. `data.js` — sets `window.LATTICE_SEED` with offline fallback seed data
2. `primitives.jsx` — shared UI components (`Icon`, `Sparkline`, `BarChart`, etc.)
3. `views-1.jsx` — `DashboardView`, `HabitsView`, `TasksView`
4. `views-2.jsx` — `StudyView`, `DSAView`, `TimerView`, `CalendarView`, `FitnessView`, `MonthlyView`, `AchievementsView`
5. `app.jsx` — app shell, root reducer, `App` component, `ReactDOM.createRoot` mount

All files share a single global scope. React hooks are destructured from the global `React` object at the top of each file (no `import` statements).

Views read **dynamic data** (habits, tasks, progress) from `state.*` (React state, kept up-to-date by the reducer) and **static/config data** (topic lists, fitness plans, seed metadata) from `window.LATTICE_SEED`.

### Database models (db.js)

| Model | Purpose |
|-------|---------|
| `Habit` | One doc per habit (name, category, streak, pos) |
| `HabitLog` | One doc per (habitId, date) pair; `value` is 0 (not done) or 4 (done) |
| `Task` | One doc per task (title, list, priority, done, pos, subtasks) |
| `AppConfig` | **Singleton** — `_id: 'config'`. Stores everything else: study progress, fitness, events, timer state, XP, etc. |

`Habit` and `Task` use a custom string `id` field (e.g. `'h1234'`, `'t1234'`) rather than relying on MongoDB `_id`. Queries use `{ id: req.params.id }`, not `{ _id: ... }`.

### AppConfig singleton pattern

Almost all non-habit/task data lives in the single `AppConfig` document with `_id: 'config'`. Fields that hold plain objects or arrays (e.g. `dsaProgress`, `fitnessProgress`) must be explicitly marked dirty before saving:

```js
config.someField = newValue;
config.markModified('someField');
await config.save();
```

Forgetting `markModified` causes Mongoose to silently skip the update for Mixed-type fields.

### Topic progress state machine

Study-section topics (backend, CS, DA, GA) cycle through three states:
```
null → 'reading' → 'done' → null
```
The reducer actions `TOGGLE_BACKEND`, `TOGGLE_CS`, `TOGGLE_DA`, `TOGGLE_GA` and the corresponding route handlers in `backend.js` and `gate.js` all follow this same cycle.

DSA patterns are simpler: boolean toggle (`true`/`false` in `dsaProgress`).

### Adding a new study section

When adding a new prep subject (e.g. a new GATE paper):

1. Add the static topic list constant to `db.js`
2. Add the new fields to `appConfigSchema` in `db.js` (use `mongoose.Schema.Types.Mixed`)
3. Add migration logic in `seed()` to populate the fields for existing users
4. Seed the `AppConfig.create({})` call with empty defaults
5. Add the field to the `/api/seed` response in `routes/seed.js`
6. Wire up a route (follow the `gate.js` pattern for toggle + chapter endpoints)
7. Add the action type to the reducer in `app.jsx`
8. Add the `apiDispatch` branch in `app.jsx`
9. Add the view component to `views-2.jsx`

### Timer cross-device sync

The pomodoro/stopwatch/countdown timer state is persisted to `AppConfig.timerState` via `PATCH /api/timer`. On app load, `startedAt` is used to compute elapsed time and fast-forward the restored timer.

### Fitness weekly reset

Weekly exercise progress is keyed by Monday's ISO date (`weekKey`). When `GET /api/seed` detects a new week, it archives the previous week's data into `fitnessProgress.history` and resets `completedExercises`. The same guard runs in `routes/fitness.js` on exercise toggle to handle race conditions.

## API routes reference

Beyond the table in README.md, the additional routes are:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/habits/logs` | All habit logs as `{ habitId: { date: value } }` |
| PATCH | `/api/dsa/:id/toggle` | Toggle DSA pattern done/undone |
| PATCH | `/api/backend/:id/status` | Cycle backend topic status |
| PATCH | `/api/backend/:id/chapter` | Toggle chapter done `{ index }` |
| PATCH | `/api/cs/:id/status` | Cycle CS topic status |
| PATCH | `/api/cs/:id/chapter` | Toggle CS chapter |
| PATCH | `/api/da/:id/status` | Cycle DA topic status |
| PATCH | `/api/da/:id/chapter` | Toggle DA chapter |
| PATCH | `/api/ga/:id/status` | Cycle GA topic status |
| PATCH | `/api/ga/:id/chapter` | Toggle GA chapter |
| POST | `/api/events` | Create calendar event |
| PATCH | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| PATCH | `/api/fitness/exercise` | Toggle exercise `{ day, index }` |
| PATCH | `/api/fitness/steps` | Set step count `{ steps }` |
| DELETE | `/api/fitness/reset` | Reset this week's exercises |
| PATCH | `/api/timer` | Persist timer state |
| POST | `/api/focus/log` | Log a completed focus session `{ subject, minutes }` |

## Deployment

Render.com reads `render.yaml` from the repo root. The backend serves the frontend as static files from `../frontend` relative to `backend/server.js`. `MONGODB_URI` must be set manually in the Render dashboard; `DB_NAME` and `PORT` are set in `render.yaml`.
