# Lattice · Habit & Study Tracker

A premium, minimal productivity app for GATE/placement prep students.

## Project structure

```
habit/
├── frontend/          # Static HTML/CSS/JSX (React via Babel standalone)
│   ├── index.html
│   ├── styles.css
│   ├── data.js        # Fallback seed (used if backend is unreachable)
│   ├── app.jsx        # App shell + API integration
│   ├── primitives.jsx # Shared UI components
│   ├── views-1.jsx    # Dashboard, Habits, Tasks
│   └── views-2.jsx    # Study, Timer, Calendar, Fitness, Monthly, Achievements
│
├── backend/           # Node.js + Express REST API
│   ├── server.js      # Entry point (serves frontend + API)
│   ├── db.js          # Mongoose connection + models + seed
│   ├── routes/
│   │   ├── habits.js  # GET/POST/PATCH/DELETE /api/habits
│   │   ├── tasks.js   # GET/POST/PATCH/DELETE /api/tasks
│   │   └── seed.js    # GET /api/seed — full app data payload
│   ├── .env           # Local secrets (never commit this)
│   └── .env.example   # Template — copy to .env and fill in values
│
└── render.yaml        # One-click Render.com deployment config
```

## Local setup

### 1. MongoDB Atlas (free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free account
2. Create a new **M0 Free Tier** cluster (any region)
3. Under **Database Access** → add a database user (username + password)
4. Under **Network Access** → add IP `0.0.0.0/0` (allow from anywhere, needed for hosting)
5. Click **Connect** on your cluster → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and replace the placeholders with your actual credentials:
```
PORT=3001
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=lattice
```

### 3. Run

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:3001** in your browser.

The database is seeded automatically on first run.

## Deploy to Render.com

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Render auto-detects `render.yaml` — just click **Deploy**
4. In the Render dashboard → **Environment** → set `MONGODB_URI` to your Atlas connection string

Your app will be live at `https://lattice.onrender.com` (or similar).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/seed` | Full app data (habits, tasks, subjects, fitness, …) |
| GET | `/api/habits` | List habits |
| POST | `/api/habits` | Create habit `{ name, cat }` |
| PATCH | `/api/habits/:id/toggle` | Toggle habit for a date `{ date }` |
| DELETE | `/api/habits/:id` | Delete habit |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task `{ title, list, priority }` |
| PATCH | `/api/tasks/:id` | Update task fields |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/reorder` | Swap task positions `{ fromId, toId }` |
| GET | `/api/health` | Health check |

## Tech stack

- **Frontend**: React 18 (CDN), Babel standalone, vanilla CSS
- **Backend**: Node.js, Express 4
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Hosting**: Render.com (backend + frontend served together)
