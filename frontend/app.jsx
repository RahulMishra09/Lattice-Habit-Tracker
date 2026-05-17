// app.jsx — Lattice main app shell with API integration
const { useState: useStateA, useEffect: useEffectA, useReducer: useReducerA, useMemo: useMemoA, useCallback: useCallbackA, useRef: useRefA } = React;

// ── API base URL (relative when served by the backend, fallback for file://) ─
const API = window.location.protocol === 'file:' ? 'http://localhost:3001/api' : '/api';

// ── State reducer ─────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SEED':
      return { ...state, ...action.payload, loaded: true };
    case 'NAV':
      return { ...state, view: action.view };
    case 'TOGGLE_HABIT': {
      const log = { ...state.habitLog };
      const habitLog = { ...(log[action.id] || {}) };
      habitLog[action.date] = habitLog[action.date] > 0 ? 0 : 4;
      log[action.id] = habitLog;
      return { ...state, habitLog: log };
    }
    case 'ADD_HABIT': {
      const newHabit = {
        id: action.habit.id || ('h' + Date.now()),
        name: action.habit.name,
        cat: action.habit.cat,
        target: 1, unit: 'session', color: 'accent',
        streak: 0, best: 0,
      };
      return { ...state, habits: [...state.habits, newHabit], habitLog: { ...state.habitLog, [newHabit.id]: {} } };
    }
    case 'TOGGLE_TASK': {
      const today = window.LATTICE_SEED?.TODAY || new Date().toISOString().slice(0, 10);
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id !== action.id) return task;
          const done = !task.done;
          return { ...task, done, completedAt: done ? (task.completedAt || today) : null };
        }),
      };
    }
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'REORDER_TASK': {
      const tasks = [...state.tasks];
      const fromIdx = tasks.findIndex(t => t.id === action.from);
      const toIdx = tasks.findIndex(t => t.id === action.to);
      if (fromIdx === -1 || toIdx === -1) return state;
      const [moved] = tasks.splice(fromIdx, 1);
      tasks.splice(toIdx, 0, moved);
      return { ...state, tasks };
    }
    case 'TOGGLE_DSA': {
      const today = window.LATTICE_SEED?.TODAY || new Date().toISOString().slice(0, 10);
      const prog = { ...(state.dsaProgress || {}) };
      const history = { ...(state.dsaHistory || {}) };
      const done = !prog[action.id];
      prog[action.id] = done;
      if (done) history[action.id] = today;
      else delete history[action.id];
      return { ...state, dsaProgress: prog, dsaHistory: history };
    }
    case 'TOGGLE_EXERCISE': {
      const fp = { ...(state.fitnessProgress || {}) };
      const done = [...(fp.completedExercises?.[action.day] || [])];
      const pos = done.indexOf(action.index);
      if (pos === -1) done.push(action.index); else done.splice(pos, 1);
      return { ...state, fitnessProgress: { ...fp, completedExercises: { ...(fp.completedExercises || {}), [action.day]: done } } };
    }
    case 'UPDATE_STEPS': {
      const fp = { ...(state.fitnessProgress || {}) };
      return { ...state, fitnessProgress: { ...fp, steps: Math.max(0, action.steps) } };
    }
    case 'RESET_FITNESS':
      return {
        ...state,
        fitnessProgress: {
          ...(state.fitnessProgress || {}),
          completedExercises: {},
          steps: 0,
        },
      };
    case 'TOGGLE_BACKEND': {
      const today = window.LATTICE_SEED?.TODAY || new Date().toISOString().slice(0, 10);
      const bp = { ...(state.backendProgress || {}) };
      const history = { ...(state.backendHistory || {}) };
      const cur = bp[action.id] || null;
      const next = cur === null ? 'reading' : cur === 'reading' ? 'done' : null;
      if (next === null) delete bp[action.id]; else bp[action.id] = next;
      if (next === 'done') history[action.id] = today;
      else delete history[action.id];
      return { ...state, backendProgress: bp, backendHistory: history };
    }
    case 'TOGGLE_CS': {
      const cp = { ...(state.csProgress || {}) };
      const cur = cp[action.id] || null;
      const next = cur === null ? 'reading' : cur === 'reading' ? 'done' : null;
      if (next === null) delete cp[action.id]; else cp[action.id] = next;
      return { ...state, csProgress: cp };
    }
    case 'TOGGLE_DA': {
      const dp = { ...(state.daProgress || {}) };
      const cur = dp[action.id] || null;
      const next = cur === null ? 'reading' : cur === 'reading' ? 'done' : null;
      if (next === null) delete dp[action.id]; else dp[action.id] = next;
      return { ...state, daProgress: dp };
    }
    case 'TOGGLE_GA': {
      const gp = { ...(state.gaProgress || {}) };
      const cur = gp[action.id] || null;
      const next = cur === null ? 'reading' : cur === 'reading' ? 'done' : null;
      if (next === null) delete gp[action.id]; else gp[action.id] = next;
      return { ...state, gaProgress: gp };
    }
    case 'TOGGLE_CHAPTER': {
      const fieldMap = { backend: 'backendChapters', cs: 'csChapters', da: 'daChapters', ga: 'gaChapters' };
      const field = fieldMap[action.section];
      if (!field) return state;
      const chapters = { ...(state[field] || {}) };
      const list = [...(chapters[action.topicId] || [])];
      const pos = list.indexOf(action.chapterIdx);
      if (pos === -1) list.push(action.chapterIdx); else list.splice(pos, 1);
      chapters[action.topicId] = list;
      return { ...state, [field]: chapters };
    }
    case 'LOG_FOCUS_SESSION': {
      const today = window.LATTICE_SEED?.TODAY || new Date().toISOString().slice(0, 10);
      const hoursAdded = (action.minutes || 25) / 60;
      // Update studyDaily
      const studyDaily = [...(state.studyDaily || [])];
      const idx = studyDaily.findIndex(e => e.date === today);
      if (idx === -1) {
        studyDaily.push({ date: today, hours: Math.round(hoursAdded * 100) / 100 });
      } else {
        studyDaily[idx] = { date: today, hours: Math.round((studyDaily[idx].hours + hoursAdded) * 100) / 100 };
      }
      // Append focusSessions
      const focusSessions = [...(state.focusSessions || [])];
      focusSessions.push({ id: `fs_${Date.now()}`, date: today, subject: action.subject, minutes: action.minutes || 25, completed: true });
      // Update global seed so views that read window.LATTICE_SEED stay in sync
      if (window.LATTICE_SEED) {
        window.LATTICE_SEED.studyDaily    = studyDaily;
        window.LATTICE_SEED.focusSessions = focusSessions;
      }
      return { ...state, studyDaily, focusSessions };
    }
    case 'TIMER_SET':
      return { ...state, timer: { ...(state.timer || {}), ...action.payload } };
    case 'TIMER_TICK': {
      const t = state.timer;
      if (!t || !t.running) return state;
      if (t.mode === 'stopwatch') {
        return { ...state, timer: { ...t, stopwatch: t.stopwatch + 1 } };
      }
      if (t.mode === 'countdown') {
        const next = Math.max(0, t.countdown - 1);
        return { ...state, timer: { ...t, countdown: next, running: next > 0 } };
      }
      // pomodoro
      if (t.secondsLeft <= 1) {
        const newPhase = t.phase === 'focus' ? 'break' : 'focus';
        return { ...state, timer: {
          ...t,
          phase: newPhase,
          secondsLeft: (newPhase === 'focus' ? 25 : 5) * 60,
          completedToday: t.phase === 'focus' ? t.completedToday + 1 : t.completedToday,
          // Signal that a focus session completed (cleared by apiDispatch effect)
          sessionJustCompleted: t.phase === 'focus' ? { subject: t.subject || 'General', minutes: 25 } : null,
        }};
      }
      return { ...state, timer: { ...t, secondsLeft: t.secondsLeft - 1 } };
    }
    case 'ADD_EVENT': {
      const ev = { ...action.event, id: action.event.id || ('e' + Date.now()) };
      return { ...state, events: [...(state.events || []), ev] };
    }
    case 'UPDATE_EVENT':
      return { ...state, events: (state.events || []).map(e => e.id === action.event.id ? { ...e, ...action.event } : e) };
    case 'DELETE_EVENT':
      return { ...state, events: (state.events || []).filter(e => e.id !== action.id) };
    default:
      return state;
  }
}

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'home' },
  { id: 'habits',       label: 'Habits',       icon: 'target' },
  { id: 'tasks',        label: 'Tasks',        icon: 'list' },
  { id: 'study',        label: 'Study',        icon: 'book' },
  { id: 'dsa',          label: 'DSA',          icon: 'code' },
  { id: 'timer',        label: 'Focus',        icon: 'timer' },
  { id: 'calendar',     label: 'Calendar',     icon: 'calendar' },
  { id: 'fitness',      label: 'Fitness',      icon: 'heart' },
  { id: 'monthly',      label: 'Monthly',      icon: 'chart' },
  { id: 'achievements', label: 'Achievements', icon: 'trophy' },
];

function viewFor(id, props) {
  switch (id) {
    case 'dashboard':    return <DashboardView {...props}/>;
    case 'habits':       return <HabitsView {...props}/>;
    case 'tasks':        return <TasksView {...props}/>;
    case 'study':        return <StudyView {...props}/>;
    case 'dsa':          return <DSAView {...props}/>;
    case 'timer':        return <TimerView {...props}/>;
    case 'calendar':     return <CalendarView {...props}/>;
    case 'fitness':      return <FitnessView {...props}/>;
    case 'monthly':      return <MonthlyView {...props}/>;
    case 'achievements': return <AchievementsView {...props}/>;
    default:             return <DashboardView {...props}/>;
  }
}

// ── Loading screen ────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-on)',
        boxShadow: '0 0 24px var(--accent-tint)',
      }}>
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
          <path d="M2 11L7 2L12 11H2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
          <circle cx="7" cy="9" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="serif" style={{ fontSize: 22, color: 'var(--ink)' }}>Lattice</div>
        <div className="mono muted" style={{ fontSize: 11, marginTop: 4, letterSpacing: '0.14em' }}>LOADING…</div>
      </div>
      <div style={{
        width: 120, height: 3, background: 'var(--bg-soft)',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: '60%', background: 'var(--accent)',
          borderRadius: 99, animation: 'pulse-dot 1.2s ease-in-out infinite',
        }}/>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────
function weekNumber(date) {
  const d = new Date(date);
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
}

// ── Desktop sidebar ──────────────────────────────────────────────────
function Sidebar({ active, onSelect, state, theme, onToggleTheme }) {
  const seed = window.LATTICE_SEED;
  const todayTasks = state.tasks.filter(t => t.list === 'Today' && !t.done).length;
  const counts = { tasks: todayTasks > 0 ? todayTasks : null };
  const wk = seed ? weekNumber(seed.TODAY) : '—';

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 16px' }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-on)', boxShadow: '0 4px 12px var(--accent-tint)', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L7 2L12 11H2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="7" cy="9" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 17, lineHeight: 1, letterSpacing: '-0.01em' }}>Lattice</div>
          <div className="mono faint" style={{ fontSize: 9, marginTop: 2, letterSpacing: '0.12em' }}>PREP TRACKER · WEEK {wk}</div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', margin: '0 0 16px',
        background: 'var(--surface)', border: '1px solid var(--line-soft)',
        borderRadius: 8, cursor: 'pointer',
      }}>
        <Icon name="search" size={13} style={{ color: 'var(--muted)' }}/>
        <span className="muted" style={{ fontSize: 12, flex: 1 }}>Search</span>
        <span className="kbd">⌘K</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
        <div className="h-eyebrow" style={{ padding: '8px 10px 4px', fontSize: 10 }}>Workspace</div>
        {NAV_ITEMS.slice(0, 5).map(item => (
          <div key={item.id} className="nav-item" data-on={active === item.id} onClick={() => onSelect(item.id)}>
            <Icon name={item.icon} size={15}/>
            {item.label}
            {counts[item.id] != null && <span className="count">{counts[item.id]}</span>}
          </div>
        ))}
        <div className="h-eyebrow" style={{ padding: '12px 10px 4px', fontSize: 10 }}>Focus & Plan</div>
        {NAV_ITEMS.slice(5, 8).map(item => (
          <div key={item.id} className="nav-item" data-on={active === item.id} onClick={() => onSelect(item.id)}>
            <Icon name={item.icon} size={15}/>
            {item.label}
          </div>
        ))}
        <div className="h-eyebrow" style={{ padding: '12px 10px 4px', fontSize: 10 }}>Reports</div>
        {NAV_ITEMS.slice(8).map(item => (
          <div key={item.id} className="nav-item" data-on={active === item.id} onClick={() => onSelect(item.id)}>
            <Icon name={item.icon} size={15}/>
            {item.label}
          </div>
        ))}
      </nav>

      <div style={{
        marginTop: 12, padding: 12,
        background: 'var(--surface)', border: '1px solid var(--line-soft)', borderRadius: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar name="Rahul M" size={28}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Rahul Mishra</div>
            <div className="mono faint" style={{ fontSize: 10 }}>
              Level {seed && seed.xp ? seed.xp.level : '—'} · {seed && seed.xp ? seed.xp.current.toLocaleString() : '—'} XP
            </div>
          </div>
          <button onClick={onToggleTheme} className="btn-ghost btn"
            style={{ padding: '0 6px', height: 28, flexShrink: 0 }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={13}/>
          </button>
        </div>
        {seed && seed.xp && (
          <div className="bar" style={{ height: 4 }}>
            <div style={{ width: `${(seed.xp.current / seed.xp.nextLevel) * 100}%` }}/>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Desktop topbar ────────────────────────────────────────────────────
function TopBar({ activeView, theme, onToggleTheme, state }) {
  const label = NAV_ITEMS.find(n => n.id === activeView)?.label || '';
  const bestStreak = state && state.habits.length > 0
    ? Math.max(...state.habits.map(h => h.streak))
    : 0;
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="mono faint" style={{ fontSize: 11 }}>lattice</span>
        <span className="faint">/</span>
        <span style={{ fontSize: 13 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {bestStreak > 0 && <span className="pill"><span className="swatch" style={{ background: 'var(--accent)' }}/>Streak {bestStreak}d</span>}
        <button className="btn-ghost btn" style={{ padding: '0 6px' }}><Icon name="bell" size={14}/></button>
        <button className="btn-ghost btn" style={{ padding: '0 6px' }} onClick={onToggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14}/>
        </button>
      </div>
    </div>
  );
}

// ── Mobile header ─────────────────────────────────────────────────────
function MobileHeader({ activeView, onMenuOpen, theme, onToggleTheme }) {
  const label = NAV_ITEMS.find(n => n.id === activeView)?.label || '';
  return (
    <div className="mobile-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-on)',
        }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L7 2L12 11H2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="7" cy="9" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div className="serif" style={{ fontSize: 17, lineHeight: 1 }}>{label}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onToggleTheme} style={{
          width: 34, height: 34, borderRadius: 99,
          background: 'var(--bg-soft)', border: '1px solid var(--line-soft)', color: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14}/></button>
        <button onClick={onMenuOpen} style={{
          width: 34, height: 34, borderRadius: 99,
          background: 'var(--bg-soft)', border: '1px solid var(--line-soft)', color: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><Icon name="list" size={14}/></button>
      </div>
    </div>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────
function MobileTabBar({ active, onSelect }) {
  const items = [
    { id: 'dashboard', icon: 'home',    label: 'Home' },
    { id: 'habits',    icon: 'target',  label: 'Habits' },
    { id: 'timer',     icon: 'timer',   label: 'Focus' },
    { id: 'tasks',     icon: 'list',    label: 'Tasks' },
    { id: 'more',      icon: 'sparkle', label: 'More' },
  ];
  return (
    <div className="mobile-tabbar">
      {items.map(it => (
        <button key={it.id} onClick={() => onSelect(it.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: active === it.id ? 'var(--accent)' : 'var(--muted)',
          padding: '4px 0', flex: 1,
          background: 'none', border: 'none', cursor: 'pointer', transition: 'color .15s',
        }}>
          <Icon name={it.icon} size={20} stroke={active === it.id ? 2 : 1.6}/>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-sans)' }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Mobile menu overlay ───────────────────────────────────────────────
function MobileMenu({ active, onSelect, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'color-mix(in oklch, var(--bg), transparent 6%)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      padding: '56px 20px 100px', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="serif" style={{ fontSize: 24 }}>All sections</div>
        <button onClick={onClose} style={{
          width: 34, height: 34, borderRadius: 99,
          background: 'var(--bg-soft)', border: '1px solid var(--line-soft)', color: 'var(--ink)',
          fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {NAV_ITEMS.map(it => (
          <button key={it.id} onClick={() => { onSelect(it.id); onClose(); }} style={{
            textAlign: 'left', padding: 14, borderRadius: 12,
            background: active === it.id ? 'var(--accent-tint)' : 'var(--surface)',
            border: '1px solid ' + (active === it.id ? 'var(--accent-line)' : 'var(--line-soft)'),
            color: 'var(--ink)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <Icon name={it.icon} size={20} style={{ color: active === it.id ? 'var(--accent)' : 'var(--ink-soft)' }}/>
            <span style={{ fontSize: 14 }}>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────────
function App() {
  const initial = {
    view: 'dashboard',
    habits: [],
    habitLog: {},
    tasks: [],
    events: [],
    dsaProgress: {},
    dsaHistory: {},
    fitnessProgress: { weekKey: '', completedExercises: {}, steps: 0, history: {} },
    backendProgress: {},
    backendHistory: {},
    csProgress: {},
    daProgress: {},
    backendChapters: {},
    csChapters: {},
    daChapters: {},
    gaProgress: {},
    gaChapters: {},
    studyDaily: [],
    focusSessions: [],
    timer: {
      mode: 'pomodoro',
      phase: 'focus',
      running: false,
      secondsLeft: 25 * 60,
      stopwatch: 0,
      countdown: 10 * 60,
      subject: 'DSA',
      completedToday: 0,
    },
    loaded: false,
  };

  const [state, dispatch] = useReducerA(reducer, initial);
  const [theme, setTheme] = useStateA('dark');
  const [mobileMenu, setMobileMenu] = useStateA(false);

  // Apply theme to <html>
  useEffectA(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Load seed data from API ──────────────────────────────────────────
  useEffectA(() => {
    fetch(`${API}/seed`)
      .then(r => {
        if (!r.ok) throw new Error('API unavailable');
        return r.json();
      })
      .then(data => {
        // Make data available globally (views read from window.LATTICE_SEED)
        window.LATTICE_SEED = data;
        dispatch({
          type: 'SEED',
          payload: {
            habits:          data.habits,
            habitLog:        data.habitLog,
            tasks:           data.tasks,
            events:          data.events || [],
            dsaProgress:     data.dsaProgress || {},
            dsaHistory:      data.dsaHistory || {},
            fitnessProgress: data.fitnessProgress || { weekKey: '', completedExercises: {}, steps: 0, history: {} },
            backendProgress: data.backendProgress || {},
            backendHistory:  data.backendHistory || {},
            csProgress:      data.csProgress || {},
            daProgress:      data.daProgress || {},
            backendChapters: data.backendChapters || {},
            csChapters:      data.csChapters || {},
            daChapters:      data.daChapters || {},
            gaProgress:      data.gaProgress || {},
            gaChapters:      data.gaChapters || {},
            studyDaily:      data.studyDaily || [],
            focusSessions:   data.focusSessions || [],
          },
        });
      })
      .catch(() => {
        // Fall back to static data.js seed if API is unavailable
        if (window.LATTICE_SEED) {
          const data = window.LATTICE_SEED;
          dispatch({
            type: 'SEED',
            payload: {
              habits: data.habits,
              habitLog: JSON.parse(JSON.stringify(data.habitLog)),
              tasks: data.tasks,
              dsaHistory: data.dsaHistory || {},
              backendHistory: data.backendHistory || {},
            },
          });
        } else {
          // No fallback — still mark loaded so the UI renders
          dispatch({ type: 'SEED', payload: {} });
        }
      });
  }, []);

  // ── API-backed dispatch ──────────────────────────────────────────────
  const apiDispatch = useCallbackA((action) => {
    // Optimistic local update first
    dispatch(action);

    // Then sync with API
    const today = window.LATTICE_SEED?.TODAY || new Date().toISOString().slice(0, 10);

    if (action.type === 'TOGGLE_HABIT') {
      fetch(`${API}/habits/${action.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: action.date || today }),
      }).catch(console.warn);
    }

    if (action.type === 'ADD_HABIT' && !action.habit) {
      // The reducer already handled it; also persist to API
      fetch(`${API}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: action.name, cat: action.cat }),
      })
        .then(r => r.json())
        .then(habit => {
          // Update the locally-created habit with the server-assigned id
          // (already added optimistically; close enough for this demo)
        })
        .catch(console.warn);
    }

    if (action.type === 'TOGGLE_TASK') {
      const task = state.tasks.find(t => t.id === action.id);
      if (task) {
        fetch(`${API}/tasks/${action.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: !task.done }),
        }).catch(console.warn);
      }
    }

    if (action.type === 'ADD_TASK') {
      // The task object was already built locally; also persist
      fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: action.title, list: action.list, priority: action.priority }),
      })
        .then(r => r.json())
        .catch(console.warn);
    }

    if (action.type === 'DELETE_TASK') {
      fetch(`${API}/tasks/${action.id}`, { method: 'DELETE' }).catch(console.warn);
    }

    if (action.type === 'REORDER_TASK') {
      fetch(`${API}/tasks/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: action.from, toId: action.to }),
      }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_DSA') {
      fetch(`${API}/dsa/${action.id}/toggle`, { method: 'PATCH' }).catch(console.warn);
    }

    if (action.type === 'ADD_EVENT') {
      fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.event),
      }).catch(console.warn);
    }

    if (action.type === 'UPDATE_EVENT') {
      fetch(`${API}/events/${action.event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.event),
      }).catch(console.warn);
    }

    if (action.type === 'DELETE_EVENT') {
      fetch(`${API}/events/${action.id}`, { method: 'DELETE' }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_EXERCISE') {
      fetch(`${API}/fitness/exercise`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: action.day, index: action.index }),
      }).catch(console.warn);
    }

    if (action.type === 'UPDATE_STEPS') {
      fetch(`${API}/fitness/steps`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: action.steps }),
      }).catch(console.warn);
    }

    if (action.type === 'RESET_FITNESS') {
      fetch(`${API}/fitness/reset`, { method: 'DELETE' }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_BACKEND') {
      fetch(`${API}/backend/${action.id}/status`, { method: 'PATCH' }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_CS') {
      fetch(`${API}/cs/${action.id}/status`, { method: 'PATCH' }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_DA') {
      fetch(`${API}/da/${action.id}/status`, { method: 'PATCH' }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_GA') {
      fetch(`${API}/ga/${action.id}/status`, { method: 'PATCH' }).catch(console.warn);
    }

    if (action.type === 'LOG_FOCUS_SESSION') {
      fetch(`${API}/focus/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: action.subject, minutes: action.minutes }),
      }).catch(console.warn);
    }

    if (action.type === 'TOGGLE_CHAPTER') {
      const urlMap = { backend: 'backend', cs: 'cs', da: 'da', ga: 'ga' };
      const base = urlMap[action.section];
      if (base) {
        fetch(`${API}/${base}/${action.topicId}/chapter`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: action.chapterIdx }),
        }).catch(console.warn);
      }
    }
  }, [state, dispatch]);

  // ── Background timer interval ────────────────────────────────────
  useEffectA(() => {
    if (!state.timer?.running) return;
    const id = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.timer?.running]);

  // ── Log focus session when pomodoro focus phase completes ────────
  useEffectA(() => {
    const completed = state.timer?.sessionJustCompleted;
    if (!completed) return;
    // Clear the flag
    dispatch({ type: 'TIMER_SET', payload: { sessionJustCompleted: null } });
    // Update local state
    apiDispatch({ type: 'LOG_FOCUS_SESSION', subject: completed.subject, minutes: completed.minutes });
  }, [state.timer?.sessionJustCompleted]);

  // ── Update document title while timer running ────────────────────
  useEffectA(() => {
    const t = state.timer;
    if (!t?.running) { document.title = 'Lattice'; return; }
    const secs = t.mode === 'pomodoro' ? t.secondsLeft : t.mode === 'stopwatch' ? t.stopwatch : t.countdown;
    const m = Math.floor(secs / 60), s = secs % 60;
    const label = t.mode === 'pomodoro' ? (t.phase === 'focus' ? '🍅' : '☕') : t.mode === 'stopwatch' ? '⏱' : '⏳';
    document.title = `${label} ${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')} — Lattice`;
  }, [state.timer?.secondsLeft, state.timer?.stopwatch, state.timer?.countdown, state.timer?.running]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  if (!state.loaded) return <LoadingScreen/>;

  const viewProps = { state, dispatch: apiDispatch };

  return (
    <div className="app-shell">
      <Sidebar
        active={state.view}
        onSelect={(v) => apiDispatch({ type: 'NAV', view: v })}
        state={state}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="app-main">
        <TopBar activeView={state.view} theme={theme} onToggleTheme={toggleTheme} state={state}/>
        <MobileHeader activeView={state.view} onMenuOpen={() => setMobileMenu(true)} theme={theme} onToggleTheme={toggleTheme}/>
        <div className="app-content" key={state.view}>
          {viewFor(state.view, viewProps)}
        </div>
      </div>

      <MobileTabBar
        active={state.view}
        onSelect={(v) => {
          if (v === 'more') { setMobileMenu(true); return; }
          apiDispatch({ type: 'NAV', view: v });
        }}
      />

      {mobileMenu && (
        <MobileMenu
          active={state.view}
          onSelect={(v) => apiDispatch({ type: 'NAV', view: v })}
          onClose={() => setMobileMenu(false)}
        />
      )}

      {/* Floating timer badge — visible on all views when running */}
      {state.timer?.running && state.view !== 'timer' && (() => {
        const t = state.timer;
        const secs = t.mode === 'pomodoro' ? t.secondsLeft : t.mode === 'stopwatch' ? t.stopwatch : t.countdown;
        const m = Math.floor(secs / 60), s = secs % 60;
        const label = t.mode === 'pomodoro' ? (t.phase === 'focus' ? '🍅 Focus' : '☕ Break') : t.mode === 'stopwatch' ? '⏱ Stopwatch' : '⏳ Countdown';
        const color = t.mode === 'pomodoro' ? (t.phase === 'focus' ? 'var(--accent)' : 'var(--warn)') : 'var(--info)';
        return (
          <button
            onClick={() => apiDispatch({ type: 'NAV', view: 'timer' })}
            style={{
              position: 'fixed', bottom: 80, right: 20, zIndex: 900,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 14,
              background: 'var(--surface)', border: `1.5px solid ${color}`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px color-mix(in oklch, ${color}, transparent 70%)`,
              cursor: 'pointer', color: 'var(--ink)',
            }}>
            <span className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: color, fontFamily: 'var(--font-mono)' }}>{label}</span>
            <span style={{ fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 300, letterSpacing: '-0.02em', color, fontVariantNumeric: 'tabular-nums' }}>
              {m.toString().padStart(2,'0')}:{s.toString().padStart(2,'0')}
            </span>
            <button
              onClick={e => { e.stopPropagation(); apiDispatch({ type: 'TIMER_SET', payload: { running: false } }); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, display: 'flex', marginLeft: 2 }}>
              ✕
            </button>
          </button>
        );
      })()}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
