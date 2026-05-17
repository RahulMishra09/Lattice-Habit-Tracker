// primitives.jsx — small visual building blocks shared across views

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ── Icons (single-stroke, minimal) ────────────────────────────────────
function Icon({ name, size = 16, stroke = 1.6, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const paths = {
    home:    <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    target:  <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    check:   <><polyline points="4 12 9 17 20 6"/></>,
    plus:    <><path d="M12 5v14M5 12h14"/></>,
    minus:   <><path d="M5 12h14"/></>,
    list:    <><path d="M4 6h16M4 12h16M4 18h10"/></>,
    book:    <><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/><path d="M4 17h14"/></>,
    timer:   <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    heart:   <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21l8.84-8.61a5.5 5.5 0 0 0 0-7.78z"/></>,
    flame:   <><path d="M12 2c2 4 6 6 6 11a6 6 0 1 1-12 0c0-3 2-4 3-7 1.5 2 3 2 3 6 0-3 0-7 0-10z"/></>,
    sparkle: <><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.3 6.3l4.2 4.2M13.5 13.5l4.2 4.2M6.3 17.7l4.2-4.2M13.5 10.5l4.2-4.2"/></>,
    trophy:  <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M5 4h2v3a3 3 0 0 1-3-3zM19 4h-2v3a3 3 0 0 0 3-3z"/></>,
    chart:   <><path d="M4 20V8M10 20V4M16 20v-9M22 20H2"/></>,
    play:    <><polygon points="6 4 20 12 6 20 6 4"/></>,
    pause:   <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    next:    <><polygon points="6 4 16 12 6 20"/><line x1="18" y1="4" x2="18" y2="20"/></>,
    reset:   <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/></>,
    search:  <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
    filter:  <><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>,
    sun:     <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>,
    moon:    <><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></>,
    bell:    <><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    drop:    <><path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/></>,
    dumbbell:<><path d="M6 8v8M2 10v4M10 6v12M18 6v12M14 8v8M22 10v4"/></>,
    sword:   <><path d="M14 4l6 0 0 6-9 9-3-3z"/><path d="M5 16l3 3M2 22l4-4"/></>,
    grip:    <><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></>,
    chevR:   <><polyline points="9 6 15 12 9 18"/></>,
    chevD:   <><polyline points="6 9 12 15 18 9"/></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    sliders: <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8L4.2 6.9a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    user:    <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    code:    <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
    close:   <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    layers:  <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  };
  return <svg {...p} className="ico">{paths[name] || null}</svg>;
}

// ── Sparkline ───────────────────────────────────────────────────────
function Sparkline({ values, w = 120, h = 32, fill = true, strokeColor }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const dFill = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fill && <path d={dFill} className="spark-fill"/>}
      <path d={d} className="spark" style={strokeColor ? { stroke: strokeColor } : null}/>
    </svg>
  );
}

// ── Bar chart (small) ──────────────────────────────────────────────
function BarChart({ values, w = 240, h = 80, accent }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const bw = w / values.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const bh = (v / max) * (h - 6);
        return (
          <rect key={i}
            x={i * bw + 1} y={h - bh}
            width={bw - 2} height={bh}
            rx="1.5"
            fill={accent || 'var(--accent)'}
            opacity={0.45 + 0.55 * (v / max)}
          />
        );
      })}
    </svg>
  );
}

// ── Donut ──────────────────────────────────────────────────────────
function Donut({ value, size = 64, stroke = 6, label, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.min(1, Math.max(0, value));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-soft)" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r}
          stroke={color || 'var(--accent)'} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray .5s ease' }}
        />
      </svg>
      {label != null && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, color: 'var(--ink)',
        }}>{label}</div>
      )}
    </div>
  );
}

// ── Check pill (round, animated) ───────────────────────────────────
function Check({ on, onClick, size = 18 }) {
  return (
    <button className="check" data-on={on} onClick={onClick}
      style={{ width: size, height: size }} aria-label={on ? 'mark incomplete' : 'mark complete'}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none">
        <polyline points="3 8 7 12 13 4" stroke="var(--accent-on)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ── Segmented control ──────────────────────────────────────────────
function Segmented({ value, options, onChange }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value || o} data-on={(o.value || o) === value} onClick={() => onChange(o.value || o)}>
          {o.label || o}
        </button>
      ))}
    </div>
  );
}

const FITNESS_DAY_OFFSETS = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function isoDayKey(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function addActivity(log, date, amount) {
  if (!date || !amount || amount <= 0) return;
  log[date] = (log[date] || 0) + amount;
}

function consistencyAreaForHabit(cat) {
  const value = (cat || '').toLowerCase();
  if (value === 'coding') return 'coding';
  if (value === 'fitness' || value === 'health') return 'fitness';
  if (value === 'study' || value === 'reading' || value === 'meditation') return 'study';
  return 'all';
}

function fitnessActivityByDate(fitnessProgress) {
  const out = {};

  const addWeek = (weekKey, completedExercises) => {
    if (!weekKey || !completedExercises) return;
    Object.entries(completedExercises).forEach(([day, completed]) => {
      const offset = FITNESS_DAY_OFFSETS[day];
      const count = Array.isArray(completed) ? completed.length : 0;
      if (offset == null || count <= 0) return;
      const date = new Date(`${weekKey}T12:00:00`);
      date.setDate(date.getDate() + offset);
      addActivity(out, isoDayKey(date), count);
    });
  };

  const history = fitnessProgress?.history || {};
  Object.entries(history).forEach(([weekKey, entry]) => addWeek(weekKey, entry?.completedExercises));
  addWeek(fitnessProgress?.weekKey, fitnessProgress?.completedExercises);

  return out;
}

function normalizeActivityLog(raw) {
  const values = Object.values(raw).filter(v => v > 0);
  if (values.length === 0) return {};

  const max = Math.max(...values);
  const out = {};
  Object.entries(raw).forEach(([date, value]) => {
    if (value <= 0) return;
    const ratio = max <= 1 ? 1 : value / max;
    out[date] = ratio >= 0.85 ? 4 : ratio >= 0.6 ? 3 : ratio >= 0.3 ? 2 : 1;
  });
  return out;
}

// Build one heatmap across every progress source that has a real date behind it.
function buildConsistencyLog(state, seed, scope = 'all') {
  const raw = {};
  const today = seed?.TODAY || isoDayKey(new Date());

  (state.habits || []).forEach(habit => {
    const area = consistencyAreaForHabit(habit.cat);
    if (scope !== 'all' && area !== scope) return;
    const log = state.habitLog?.[habit.id] || {};
    Object.entries(log).forEach(([date, value]) => addActivity(raw, date, value > 0 ? 1 : 0));
  });

  if (scope === 'all' || scope === 'study') {
    (seed?.studyDaily || []).forEach(entry => addActivity(raw, entry.date, Number(entry.hours) || 0));
    const completedSessions = (seed?.focusSessions || []).filter(session => session.completed).length;
    addActivity(raw, today, completedSessions);
  }

  if (scope === 'all' || scope === 'fitness') {
    const fitnessLog = fitnessActivityByDate(state.fitnessProgress || {});
    Object.entries(fitnessLog).forEach(([date, value]) => addActivity(raw, date, value));
    addActivity(raw, today, Math.min(4, (state.fitnessProgress?.steps || 0) / 2500));
  }

  (state.tasks || []).forEach(task => {
    if (scope !== 'all') return;
    addActivity(raw, task.completedAt, task.done ? 1 : 0);
  });

  Object.values(state.dsaHistory || {}).forEach(date => {
    if (scope === 'all' || scope === 'coding') addActivity(raw, date, 1);
  });

  Object.values(state.backendHistory || {}).forEach(date => {
    if (scope === 'all' || scope === 'coding') addActivity(raw, date, 1);
  });

  return normalizeActivityLog(raw);
}

// ── Heatmap (GitHub contribution-style) ────────────────────────────
// log: { 'YYYY-MM-DD': 0..4 }
function Heatmap({ log, today, weeks = 52, dense = false, showLabels = true }) {
  const cells = useMemo(() => {
    const t = new Date(today);
    // align to most recent Saturday so columns line up
    const dow = t.getDay();
    const end = new Date(t);
    end.setDate(end.getDate() + (6 - dow));
    const totalDays = weeks * 7;
    const arr = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(end); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0,10);
      const future = d > new Date(today);
      arr.push({ iso, v: future ? -1 : (log[iso] || 0), d });
    }
    return arr;
  }, [log, today, weeks]);

  // Month labels positions
  const months = useMemo(() => {
    const out = [];
    let lastMo = -1;
    cells.forEach((c, idx) => {
      const w = Math.floor(idx / 7);
      const mo = c.d.getMonth();
      if (mo !== lastMo && c.d.getDate() <= 7) {
        out.push({ w, label: c.d.toLocaleString('en-US', { month: 'short' }) });
        lastMo = mo;
      }
    });
    return out;
  }, [cells]);

  return (
    <div>
      {showLabels && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks}, ${dense ? 10 : 12}px)`,
          gap: dense ? 2.5 : 3,
          marginBottom: 4,
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
          letterSpacing: '0.04em',
        }}>
          {Array.from({ length: weeks }).map((_, i) => {
            const m = months.find(x => x.w === i);
            return <div key={i} style={{ height: 12 }}>{m?.label || ''}</div>;
          })}
        </div>
      )}
      <div className={`hm-grid${dense ? ' dense' : ''}`}>
        {cells.map((c, i) => (
          <div key={i}
            className="hm-cell"
            data-v={c.v > 0 ? c.v : null}
            style={c.v === -1 ? { background: 'transparent' } : null}
            title={`${c.iso} · ${c.v > 0 ? `activity level ${c.v}/4` : 'no activity'}`}
          />
        ))}
      </div>
      {showLabels && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
        }}>
          <span>Less</span>
          <div className="hm-cell" style={{ width: 10, height: 10 }} />
          <div className="hm-cell" data-v="1" style={{ width: 10, height: 10 }} />
          <div className="hm-cell" data-v="2" style={{ width: 10, height: 10 }} />
          <div className="hm-cell" data-v="3" style={{ width: 10, height: 10 }} />
          <div className="hm-cell" data-v="4" style={{ width: 10, height: 10 }} />
          <span>More</span>
        </div>
      )}
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────
function Avatar({ name = 'A', size = 28 }) {
  const initials = name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
      color: 'var(--accent-on)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: size * 0.4,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────
function Empty({ title, hint }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center', color: 'var(--muted)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div className="serif" style={{ fontSize: 22, color: 'var(--ink-soft)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{hint}</div>
    </div>
  );
}

Object.assign(window, {
  Icon, Sparkline, BarChart, Donut, Check, Segmented, Heatmap, Avatar, Empty, buildConsistencyLog,
});
