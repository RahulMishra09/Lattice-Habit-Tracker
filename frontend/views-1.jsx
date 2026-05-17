// views-1.jsx — Dashboard, Habits, Tasks
const { useState: useState1, useEffect: useEffect1, useMemo: useMemo1, useRef: useRef1 } = React;

// helpers ----------------------------------------------------------
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const greetingFor = (h) => h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Wind down';
// ISO 8601 week number: week containing the first Thursday of the year
const getWeekNum1 = (isoDate) => {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // shift to Thursday of current week
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// ── DASHBOARD ─────────────────────────────────────────────────────
function DashboardView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const today = seed.TODAY;
  const realToday = new Date().toISOString().slice(0, 10);
  const hour = new Date().getHours();
  const wk = getWeekNum1(realToday);
  const [consistencyScope, setConsistencyScope] = useState1('all');

  const habitsToday = state.habits.map(h => ({
    ...h,
    done: state.habitLog[h.id]?.[today] > 0,
  }));
  const doneCount = habitsToday.filter(h => h.done).length;
  const tasksToday = state.tasks.filter(t => t.list === 'Today');
  const tasksOpen = tasksToday.filter(t => !t.done).length;

  // productivity score: weighted blend
  const consistency = seed.monthly?.stats?.consistency || 0;
  const score = Math.round(
    (doneCount / Math.max(1, habitsToday.length)) * 35 +
    ((tasksToday.length - tasksOpen) / Math.max(1, tasksToday.length)) * 30 +
    consistency * 35
  );

  const scoreLabel = score >= 80 ? 'Strong day' : score >= 60 ? 'On pace' : score >= 40 ? 'Catching up' : 'Slow start';
  const scoreSub   = score >= 75 ? 'Keep the momentum' : score >= 50 ? 'You\'re making progress' : 'Every step counts';

  // study hours today — read from state so optimistic updates show immediately
  const studyDaily = state.studyDaily || seed.studyDaily || [];
  const todayStudy = studyDaily.find(e => e.date === today);
  const studyTodayH = todayStudy ? todayStudy.hours : 0;

  // last 7 calendar days (including today)
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  // Real study-hours series for last 7 days
  const last7Study = last7Dates.map(date => {
    const e = studyDaily.find(d => d.date === date);
    return e ? e.hours : 0;
  });

  // Real habits-done series for last 7 days
  const last7Habits = last7Dates.map(date => {
    if (date === today) return doneCount;
    return state.habits.filter(h => (state.habitLog[h.id]?.[date] || 0) > 0).length;
  });

  // Real focus-session series for last 7 days
  const focusSessions = state.focusSessions || seed.focusSessions || [];
  const last7Focus = last7Dates.map(date =>
    focusSessions.filter(s => s.completed && s.date === date).length
  );
  const todayFocusCount = last7Focus[6];

  // today's first event (for greeting subtitle)
  const nextEvent = (seed.events || []).filter(e => e.date === today).sort((a,b) => a.time.localeCompare(b.time))[0];

  // quote — empty fallback
  const quotes = seed.quotes || [];
  const quote = quotes.length > 0 ? quotes[(new Date(today).getDate()) % quotes.length] : null;
  const consistencyHint = consistencyScope === 'all' ? 'all tracked progress' : `${consistencyScope} progress`;
  const consistencyLog = useMemo1(
    () => buildConsistencyLog(state, seed, consistencyScope),
    [state, seed, consistencyScope]
  );

  return (
    <div className="fade-up view-main" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* greeting */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 6 }}>{fmtDate(realToday)} · Week {wk}</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: 0 }}>
            {greetingFor(hour)}, Rahul.
          </h1>
          <p className="muted" style={{ margin: '8px 0 0', fontSize: 14, maxWidth: 540 }}>
            {doneCount}/{habitsToday.length} habits done, {tasksOpen} task{tasksOpen !== 1 ? 's' : ''} left today.
            {nextEvent ? ` ${nextEvent.title} at ${nextEvent.time}.` : ' Clear schedule ahead.'}
          </p>
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={() => dispatch({ type: 'NAV', view: 'tasks' })}>
              <Icon name="plus" size={14}/> Quick add
            </button>
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'NAV', view: 'timer' })}>
              <Icon name="play" size={12}/> Start focus
            </button>
          </div>
        )}
      </header>

      {/* score row */}
      <div className="dash-score-grid" style={{
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : '1.5fr repeat(3, minmax(0, 1fr))',
        gap: 12,
      }}>
        <ScoreCard score={score} label={scoreLabel} sub={scoreSub} compact={compact}/>
        <Metric label="Habits today" value={`${doneCount}/${habitsToday.length}`} sub="completion" series={last7Habits} />
        <Metric label="Study hours" value={`${studyTodayH}h`} sub="today" series={last7Study} />
        <Metric label="Focus sessions" value={todayFocusCount} sub="completed today" series={last7Focus} />
      </div>

      {/* row: habits | upcoming */}
      <div className="dash-habits-row" style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '1.3fr 1fr',
        gap: 12,
      }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Habits" hint="Today's check-ins" action={
            <button className="btn-ghost btn" onClick={() => dispatch({ type: 'NAV', view: 'habits' })}>
              View all <Icon name="chevR" size={12}/>
            </button>
          }/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {habitsToday.slice(0, 5).map(h => (
              <HabitRow key={h.id} habit={h} done={h.done}
                onToggle={() => dispatch({ type: 'TOGGLE_HABIT', id: h.id, date: today })}
              />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Up next" hint="Today's agenda"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 12 }}>
            {(() => {
              const allEvents = state.events || seed.events || [];
              const todayEvts = allEvents
                .filter(e => e.date === today)
                .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
              const upcoming = allEvents
                .filter(e => e.date > today)
                .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
              const nextDate = upcoming[0]?.date;
              const tomorrowIso = (() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
              const nextLabel = !nextDate ? 'Upcoming'
                : nextDate === tomorrowIso ? 'Tomorrow'
                : new Date(nextDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <>
                  {todayEvts.map(e => <AgendaRow key={e.id} ev={e}/>)}
                  {todayEvts.length === 0 && <Empty title="Clear day" hint="No scheduled events"/>}
                  <div className="hr" style={{ margin: '10px 0' }}/>
                  <div className="h-eyebrow" style={{ marginBottom: 6 }}>{nextLabel}</div>
                  {upcoming.slice(0, 3).map(e => <AgendaRow key={e.id} ev={e} muted/>)}
                  {upcoming.length === 0 && <span className="muted" style={{ fontSize: 12 }}>Nothing upcoming</span>}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* heatmap */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <CardHead title="Consistency" hint={`Past ${compact ? '26' : '52'} weeks · ${consistencyHint}`}
          action={!compact && (
            <Segmented
              value={consistencyScope}
              options={[
                { value: 'all', label: 'All' },
                { value: 'coding', label: 'Coding' },
                { value: 'study', label: 'Study' },
                { value: 'fitness', label: 'Fitness' },
              ]}
              onChange={setConsistencyScope}
            />
          )}
        />
        <div style={{ marginTop: 14, overflowX: 'auto' }}>
          <Heatmap log={consistencyLog} today={today} weeks={compact ? 26 : 52} dense={compact} showLabels={!compact}/>
        </div>
      </div>

      {/* DSA progress row */}
      <DSAProgressCard state={state} dispatch={dispatch} compact={compact}/>

      {/* bottom row: tasks | challenges | quote */}
      <div className="dash-bottom-grid" style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '1.2fr 1fr 1fr',
        gap: 12,
      }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Pending tasks" hint={`${tasksOpen} open`} action={
            <button className="btn-ghost btn" onClick={() => dispatch({ type: 'NAV', view: 'tasks' })}>
              Open <Icon name="chevR" size={12}/>
            </button>
          }/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
            {tasksToday.filter(t => !t.done).slice(0, 4).map(t => (
              <TaskRow key={t.id} task={t} compact
                onToggle={() => dispatch({ type: 'TOGGLE_TASK', id: t.id })} />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Daily challenges" hint="Earn XP"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {(seed.challenges||[]).length === 0 && <Empty title="No challenges" hint="Add challenges to track"/>}
            {(seed.challenges||[]).map(c => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>{c.name}</span>
                  <span className="mono faint">+{c.xp} XP</span>
                </div>
                <div className="bar"><div style={{ width: `${Math.min(100, (c.progress/c.target)*100)}%` }}/></div>
                <div className="mono faint" style={{ fontSize: 10, marginTop: 3 }}>
                  {c.progress}/{c.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: 'linear-gradient(160deg, var(--surface), color-mix(in oklch, var(--accent-tint), var(--surface) 70%))',
        }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 12 }}>Daily quote</div>
            {quote ? (
              <p className="serif" style={{ fontSize: 18, lineHeight: 1.35, margin: 0, color: 'var(--ink)' }}>
                "{quote.q}"
              </p>
            ) : (
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>No quotes added yet.</p>
            )}
          </div>
          {quote && <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>— {quote.a}</div>}
        </div>
      </div>
    </div>
  );
}

// ── DSA Progress card (used in dashboard) ──────────────────────────
function DSAProgressCard({ state, dispatch, compact }) {
  const seed = window.LATTICE_SEED;
  const patterns = seed.dsaPatterns || [];
  const progress = state.dsaProgress || {};

  if (!patterns.length) return null;

  const totalPatterns = patterns.reduce((a, c) => a + c.patterns.length, 0);
  const totalDone     = patterns.reduce((a, c) => a + c.patterns.filter(p => progress[p.id]).length, 0);
  const pct = totalPatterns > 0 ? Math.round((totalDone / totalPatterns) * 100) : 0;

  const COLOR_MAP = { accent:'var(--accent)', info:'var(--info)', plum:'var(--plum)', warn:'var(--warn)' };

  // Pick top 6 categories by % done for the bar chart
  const cats = patterns.map(c => ({
    ...c,
    done: c.patterns.filter(p => progress[p.id]).length,
    total: c.patterns.length,
    pct: Math.round(c.patterns.filter(p => progress[p.id]).length / c.patterns.length * 100),
  })).slice(0, compact ? 4 : 11);

  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <CardHead
        title="DSA Patterns"
        hint={`${totalDone} / ${totalPatterns} completed`}
        action={
          <button className="btn-ghost btn" onClick={() => dispatch({ type: 'NAV', view: 'dsa' })}>
            Open <Icon name="chevR" size={12}/>
          </button>
        }
      />
      <div className="dsa-progress-inner" style={{ display: 'flex', gap: 24, marginTop: 16, alignItems: 'flex-start' }}>
        {/* left: big ring + pct */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <Donut value={pct / 100} size={72} stroke={8} color="var(--accent)"
            label={<span className="num" style={{ fontSize: 20 }}>{pct}<span style={{ fontSize: 11 }}>%</span></span>}/>
          <div>
            <div className="num" style={{ fontSize: 32, lineHeight: 1 }}>{totalDone}</div>
            <div className="muted" style={{ fontSize: 12 }}>of {totalPatterns} patterns</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              {patterns.filter(c => c.patterns.every(p => progress[p.id])).length} categories complete
            </div>
          </div>
        </div>

        {/* right: category bars */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
          {cats.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{c.category}</span>
                <span className="mono faint">{c.done}/{c.total}</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-soft)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${c.pct}%`,
                  background: COLOR_MAP[c.color] || 'var(--accent)',
                  transition: 'width .4s ease',
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardHead({ title, hint, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div className="h-section">{title}</div>
        {hint && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{hint}</div>}
      </div>
      {action}
    </div>
  );
}

function ScoreCard({ score, label, sub, compact }) {
  return (
    <div className="card" style={{
      padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 18,
      background: 'linear-gradient(135deg, var(--surface), color-mix(in oklch, var(--accent-tint), var(--surface) 75%))',
    }}>
      <Donut value={score/100} size={compact ? 56 : 72} stroke={compact ? 6 : 8}
        label={<span className="num" style={{ fontSize: compact ? 18 : 24 }}>{score}</span>}/>
      <div>
        <div className="h-eyebrow" style={{ marginBottom: 4 }}>Productivity score</div>
        <div className="serif" style={{ fontSize: compact ? 18 : 22, color: 'var(--ink)' }}>
          {label || 'On pace'}
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, series }) {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110, minWidth: 0 }}>
      <div className="h-eyebrow" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div className="num" style={{ fontSize: 28 }}>{value}</div>
          <div className="muted" style={{ fontSize: 11 }}>{sub}</div>
        </div>
        <Sparkline values={series} w={60} h={32}/>
      </div>
    </div>
  );
}

// ── HABIT ROW (compact, used in dashboard + habits view) ──────────
function HabitRow({ habit, done, onToggle, showStreak = true }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 0',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <Check on={done} onClick={onToggle} size={18}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: done ? 'var(--muted)' : 'var(--ink)',
          textDecoration: done ? 'line-through' : 'none' }}>{habit.name}</div>
        <div className="mono faint" style={{ fontSize: 10, marginTop: 2 }}>
          {habit.cat} · target {habit.target} {habit.unit}
        </div>
      </div>
      {showStreak && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warn)' }}>
          <Icon name="flame" size={13}/>
          <span className="mono" style={{ fontSize: 12 }}>{habit.streak}</span>
        </div>
      )}
    </div>
  );
}

function AgendaRow({ ev, muted }) {
  const dotColor = ev.kind === 'test' ? 'var(--danger)'
    : ev.kind === 'meet' ? 'var(--info)'
    : ev.kind === 'study' ? 'var(--accent)'
    : 'var(--plum)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: '1px solid var(--line-soft)',
      opacity: muted ? 0.7 : 1,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>{ev.title}</div>
      </div>
      <div className="mono muted" style={{ fontSize: 11 }}>{ev.time}</div>
    </div>
  );
}

// ── HABITS VIEW ───────────────────────────────────────────────────
function HabitsView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const today = seed.TODAY;
  const [adding, setAdding] = useState1(false);
  const [name, setName] = useState1('');
  const [cat, setCat] = useState1('Coding');

  const categories = ['Fitness', 'Study', 'Coding', 'Reading', 'Meditation', 'Health'];

  return (
    <div className="fade-up view-main" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="h-eyebrow">Habits</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Build the foundation.</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {state.habits.length} active · longest streak {Math.max(...state.habits.map(h=>h.best))} days
          </p>
        </div>
        {!compact && (
          <button className="btn btn-primary" onClick={() => setAdding(s => !s)}>
            <Icon name="plus" size={12}/> New habit
          </button>
        )}
      </header>

      {adding && (
        <div className="card fade-up" style={{ padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Practice typing — 10 min" autoFocus
            style={{
              flex: 1, background: 'var(--bg-soft)', border: '1px solid var(--line)',
              borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none',
            }} />
          <select value={cat} onChange={e => setCat(e.target.value)} style={{
            background: 'var(--bg-soft)', border: '1px solid var(--line)',
            borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none',
          }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => {
            if (!name.trim()) return;
            dispatch({ type: 'ADD_HABIT', name, cat });
            setName(''); setAdding(false);
          }}>Create</button>
          <button className="btn-ghost btn" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}

      {/* Today's strip */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <CardHead title="Today" hint={fmtDate(today)}/>
        <div className="habits-today-grid" style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 10,
        }}>
          {state.habits.map(h => {
            const done = state.habitLog[h.id]?.[today] > 0;
            return (
              <button key={h.id}
                onClick={() => dispatch({ type: 'TOGGLE_HABIT', id: h.id, date: today })}
                style={{
                  textAlign: 'left',
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid ' + (done ? 'var(--accent-line)' : 'var(--line-soft)'),
                  background: done ? 'var(--accent-tint)' : 'var(--bg-soft)',
                  transition: 'all .2s ease',
                  cursor: 'pointer',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Check on={done} onClick={() => {}}/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warn)' }}>
                    <Icon name="flame" size={12}/>
                    <span className="mono" style={{ fontSize: 11 }}>{h.streak}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{h.name}</div>
                <div className="mono faint" style={{ fontSize: 10, marginTop: 2 }}>{h.cat}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Per-habit heatmaps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.habits.map(h => (
          <div key={h.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: 'var(--accent-tint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  <Icon name={iconForCat(h.cat)} size={14}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{h.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {h.cat} · streak {h.streak} · best {h.best}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="num" style={{ fontSize: 18 }}>
                  {Math.round((Object.values(state.habitLog[h.id]||{}).filter(v=>v>0).length / 365) * 100)}%
                </span>
                <span className="muted" style={{ fontSize: 11 }}>year</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Heatmap log={state.habitLog[h.id] || {}} today={today}
                weeks={compact ? 20 : 52} dense={compact} showLabels={!compact}/>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {!compact && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Smart suggestions" hint="Based on your patterns"/>
          <div className="habits-suggest-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
            {(seed.suggestions||[]).length === 0 && <Empty title="No suggestions yet" hint="Keep tracking to get personalized tips"/>}
            {(seed.suggestions||[]).map(s => (
              <div key={s.id} style={{
                padding: 14, borderRadius: 10,
                border: '1px solid var(--line-soft)',
                background: 'var(--bg-soft)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--accent-tint)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name="sparkle" size={14}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)' }}>{s.title}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{s.reason}</div>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12 }}>{s.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function iconForCat(c) {
  return {
    Fitness: 'dumbbell',
    Study: 'book',
    Coding: 'sword',
    Reading: 'book',
    Meditation: 'sparkle',
    Health: 'heart',
  }[c] || 'target';
}

// ── TASKS VIEW ─────────────────────────────────────────────────────
function TasksView({ state, dispatch, compact = false }) {
  const [active, setActive] = useState1('Today');
  const [adding, setAdding] = useState1(false);
  const [draft, setDraft] = useState1('');
  const [priority, setPriority] = useState1('medium');
  const [filter, setFilter] = useState1('');
  const [draggedId, setDraggedId] = useState1(null);

  const lists = ['Today', 'This week', 'Backlog'];
  const filtered = state.tasks
    .filter(t => t.list === active)
    .filter(t => !filter || t.title.toLowerCase().includes(filter.toLowerCase()) || t.cat.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="fade-up view-main" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="h-eyebrow">Tasks</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Make today count.</h1>
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px',
              background: 'var(--bg-soft)', border: '1px solid var(--line-soft)',
              borderRadius: 8,
            }}>
              <Icon name="search" size={13} style={{ color: 'var(--muted)' }}/>
              <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search tasks"
                style={{ background: 'transparent', border: 0, outline: 0, fontSize: 12, width: 160, color: 'var(--ink)' }}/>
            </div>
            <button className="btn btn-primary" onClick={() => setAdding(s => !s)}>
              <Icon name="plus" size={12}/> Add task
            </button>
          </div>
        )}
      </header>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <Segmented value={active} options={lists} onChange={setActive}/>
        <div className="mono faint" style={{ fontSize: 11 }}>
          {filtered.filter(t=>!t.done).length} open · {filtered.filter(t=>t.done).length} done
        </div>
      </div>

      {adding && (
        <div className="card fade-up" style={{ padding: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Check on={false} onClick={() => {}}/>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="What needs doing?" autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && draft.trim()) {
                dispatch({ type: 'ADD_TASK', title: draft, list: active, priority });
                setDraft(''); setAdding(false);
              }
            }}
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0, fontSize: 14, color: 'var(--ink)',
            }} />
          <Segmented value={priority} options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Med' },
            { value: 'high', label: 'High' },
          ]} onChange={setPriority}/>
          <button className="btn btn-primary" onClick={() => {
            if (draft.trim()) {
              dispatch({ type: 'ADD_TASK', title: draft, list: active, priority });
              setDraft(''); setAdding(false);
            }
          }}>Save</button>
        </div>
      )}

      <div className="card" style={{ padding: '4px 0', overflow: 'hidden' }}>
        {filtered.length === 0 ? <Empty title="Nothing here" hint="Either you're crushing it or hiding from it."/> : filtered.map((t, i) => (
          <TaskRow key={t.id}
            task={t}
            isDragging={draggedId === t.id}
            onDragStart={() => setDraggedId(t.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={() => { if (draggedId && draggedId !== t.id) dispatch({ type: 'REORDER_TASK', from: draggedId, to: t.id }); setDraggedId(null); }}
            onToggle={() => dispatch({ type: 'TOGGLE_TASK', id: t.id })}
            onDelete={() => dispatch({ type: 'DELETE_TASK', id: t.id })}
            compact={compact}
          />
        ))}
      </div>

      {!compact && (() => {
        const totalDone = state.tasks.filter(t => t.done).length;
        const totalAll  = state.tasks.length;
        const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
        // bar heights: use list breakdown
        const lists = ['Today', 'This week', 'Backlog'];
        const bars = lists.map(l => state.tasks.filter(t => t.list === l && t.done).length);
        const maxBar = Math.max(...bars, 1);
        return (
          <div className="card" style={{ padding: '18px 20px' }}>
            <CardHead title="Task completion" hint={`${totalDone} of ${totalAll} tasks done`}
              action={<button className="btn-ghost btn" onClick={() => dispatch({ type: 'NAV', view: 'tasks' })}>Open <Icon name="chevR" size={12}/></button>}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 14 }}>
              <BarChart values={bars.map(b => (b / maxBar) * 10)} w={200} h={60}/>
              <div>
                <div className="num" style={{ fontSize: 28 }}>{pct}%</div>
                <div className="muted" style={{ fontSize: 11 }}>overall completion</div>
                <div className="mono faint" style={{ fontSize: 10, marginTop: 3 }}>
                  Today · Week · Backlog
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete, isDragging, onDragStart, onDragEnd, onDragOver, onDrop, compact }) {
  const [expanded, setExpanded] = useState1(false);
  const hasSubs = task.subtasks && task.subtasks.length > 0;
  const pColor = task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warn)' : 'var(--info)';
  return (
    <div
      draggable={!compact}
      onDragStart={onDragStart} onDragEnd={onDragEnd}
      onDragOver={onDragOver} onDrop={onDrop}
      style={{
        opacity: isDragging ? 0.3 : 1,
        transition: 'opacity .15s',
      }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        borderTop: '1px solid var(--line-soft)',
      }}>
        {!compact && (
          <span style={{ color: 'var(--faint)', cursor: 'grab', display: 'flex' }}>
            <Icon name="grip" size={14}/>
          </span>
        )}
        <Check on={task.done} onClick={onToggle}/>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: pColor, flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13.5,
            color: task.done ? 'var(--muted)' : 'var(--ink)',
            textDecoration: task.done ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{task.title}</div>
          {!compact && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
              <span className="tag">{task.cat}</span>
              <span className="mono faint" style={{ fontSize: 10 }}>
                {dueLabel(task.due)}
              </span>
              {hasSubs && (
                <span className="mono faint" style={{ fontSize: 10 }}>
                  {task.subtasks.filter(s=>s.d).length}/{task.subtasks.length} sub
                </span>
              )}
            </div>
          )}
        </div>
        {!compact && hasSubs && (
          <button className="btn-ghost btn" style={{ height: 24, padding: '0 6px' }} onClick={() => setExpanded(s => !s)}>
            <Icon name={expanded ? 'chevD' : 'chevR'} size={12}/>
          </button>
        )}
        {!compact && onDelete && (
          <button className="btn-ghost btn" style={{ height: 24, padding: '0 6px', color: 'var(--faint)' }} onClick={onDelete}>×</button>
        )}
      </div>
      {expanded && hasSubs && (
        <div style={{ padding: '4px 16px 12px 56px' }}>
          {task.subtasks.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <Check on={s.d} onClick={() => {}} size={14}/>
              <span style={{ fontSize: 12.5, color: s.d ? 'var(--muted)' : 'var(--ink-soft)', textDecoration: s.d ? 'line-through' : 'none' }}>{s.t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function dueLabel(due) {
  const seed = window.LATTICE_SEED;
  const t = new Date(seed.TODAY);
  const d = new Date(due);
  const diff = Math.round((d - t) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return `${-diff}d overdue`;
  if (diff < 7) return `In ${diff}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

Object.assign(window, {
  DashboardView, HabitsView, TasksView, HabitRow, TaskRow, CardHead, ScoreCard, Metric,
  AgendaRow, combineLog, dueLabel, fmtDate, greetingFor, iconForCat,
});
