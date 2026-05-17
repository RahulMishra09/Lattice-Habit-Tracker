// views-2.jsx — Study, Timer, Calendar, Fitness, Achievements, Monthly, DSA
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ── DSA VIEW ──────────────────────────────────────────────────────
function DSAView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const patterns = seed.dsaPatterns || [];
  const progress = state.dsaProgress || {};
  const [expanded, setExpanded] = useState2(null);

  const totalPatterns = patterns.reduce((a, c) => a + c.patterns.length, 0);
  const totalDone     = patterns.reduce((a, c) => a + c.patterns.filter(p => progress[p.id]).length, 0);
  const pct = totalPatterns > 0 ? Math.round((totalDone / totalPatterns) * 100) : 0;

  const COLOR_MAP = {
    accent: 'var(--accent)',
    info:   'var(--info)',
    plum:   'var(--plum)',
    warn:   'var(--warn)',
  };

  return (
    <div className="fade-up" style={{ padding: compact ? 16 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* header */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="h-eyebrow">DSA Patterns</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Pattern Mastery</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {totalDone} of {totalPatterns} patterns completed · {pct}% done
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontSize: 36, lineHeight: 1, color: 'var(--accent)' }}>{pct}<span style={{ fontSize: 18 }}>%</span></div>
            <div className="muted" style={{ fontSize: 11 }}>{totalDone}/{totalPatterns}</div>
          </div>
          <Donut value={pct / 100} size={64} stroke={7} color="var(--accent)"/>
        </div>
      </header>

      {/* overall bar */}
      <div>
        <div className="bar" style={{ height: 8, borderRadius: 99 }}>
          <div style={{ width: `${pct}%`, borderRadius: 99, transition: 'width .4s ease' }}/>
        </div>
      </div>

      {/* category grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: 12,
      }}>
        {patterns.map(cat => {
          const catDone  = cat.patterns.filter(p => progress[p.id]).length;
          const catTotal = cat.patterns.length;
          const catPct   = Math.round((catDone / catTotal) * 100);
          const color    = COLOR_MAP[cat.color] || 'var(--accent)';
          const isOpen   = expanded === cat.id;

          return (
            <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* category header — click to expand */}
              <button
                onClick={() => setExpanded(isOpen ? null : cat.id)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  padding: '14px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: color, boxShadow: `0 0 6px ${color}88`,
                    }}/>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{cat.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: catPct === 100 ? color : 'var(--muted)' }}>
                      {catDone}/{catTotal}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: 14, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>›</span>
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--bg-soft)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${catPct}%`, background: color, borderRadius: 99, transition: 'width .4s ease' }}/>
                </div>
              </button>

              {/* expanded pattern list */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line-soft)' }}>
                  {cat.patterns.map((p, idx) => {
                    const done = !!progress[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => dispatch({ type: 'TOGGLE_DSA', id: p.id })}
                        style={{
                          width: '100%', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 16px',
                          background: done ? `color-mix(in oklch, ${color}, transparent 88%)` : 'transparent',
                          borderBottom: idx < cat.patterns.length - 1 ? '1px solid var(--line-soft)' : 'none',
                          cursor: 'pointer', border: 'none',
                          transition: 'background .15s',
                        }}>
                        {/* checkbox */}
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          border: done ? 'none' : '1.5px solid var(--line)',
                          background: done ? color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .15s',
                        }}>
                          {done && (
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: 13, color: done ? 'var(--ink-soft)' : 'var(--ink)',
                          textDecoration: done ? 'line-through' : 'none',
                          transition: 'color .15s',
                        }}>
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Status cycle: null → 'reading' → 'done' → null
const BE_STATUS_NEXT  = { null: 'reading', reading: 'done', done: null };
const BE_STATUS_COLOR = { done: 'oklch(0.84 0.21 131)', reading: 'oklch(0.72 0.19 52)', null: 'var(--muted)' };
const BE_STATUS_LABEL = { done: 'Done', reading: 'Reading', null: 'Planned' };
const BE_STATUS_ICON  = { done: 'check', reading: 'play', null: 'next' };

const BE_CAT_COLORS = {
  'be-cat-fund':    'oklch(0.76 0.17 155)',
  'be-cat-data':    'oklch(0.74 0.14 240)',
  'be-cat-auth':    'oklch(0.72 0.19 25)',
  'be-cat-input':   'oklch(0.74 0.14 290)',
  'be-cat-arch':    'oklch(0.76 0.17 155)',
  'be-cat-api':     'oklch(0.74 0.14 240)',
  'be-cat-db':      'oklch(0.72 0.17 45)',
  'be-cat-bll':     'oklch(0.74 0.14 290)',
  'be-cat-perf':    'oklch(0.76 0.17 155)',
  'be-cat-comm':    'oklch(0.74 0.14 240)',
  'be-cat-async':   'oklch(0.72 0.17 45)',
  'be-cat-search':  'oklch(0.74 0.14 290)',
  'be-cat-rel':     'oklch(0.72 0.19 25)',
  'be-cat-cfg':     'oklch(0.74 0.14 240)',
  'be-cat-obs':     'oklch(0.72 0.17 45)',
  'be-cat-life':    'oklch(0.74 0.14 290)',
  'be-cat-sec':     'oklch(0.72 0.19 25)',
  'be-cat-scale':   'oklch(0.76 0.17 155)',
  'be-cat-conc':    'oklch(0.72 0.17 45)',
  'be-cat-store':   'oklch(0.74 0.14 290)',
  'be-cat-rt':      'oklch(0.76 0.17 155)',
  'be-cat-test':    'oklch(0.74 0.14 240)',
  'be-cat-12f':     'oklch(0.72 0.17 45)',
  'be-cat-oas':     'oklch(0.74 0.14 290)',
  'be-cat-hook':    'oklch(0.76 0.17 155)',
  'be-cat-devops':  'oklch(0.74 0.14 240)',
};

// ── Study Category Modal (full-screen overlay) ────────────────────
function StudyCategoryModal({ cat, progress, chapterProgress, accentColor, sectionTitle, onToggleTopic, onToggleChapter, onClose }) {
  const [openTopic, setOpenTopic] = useState2(null);

  const catDone     = cat.topics.filter(t => progress[t.id] === 'done').length;
  const catTotal    = cat.topics.length;
  const totalChaps  = cat.topics.reduce((a, t) => a + (t.chapters?.length || 0), 0);
  const doneChaps   = cat.topics.reduce((a, t) => a + (chapterProgress[t.id] || []).length, 0);

  // Close on Escape key
  useEffect2(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 18,
          width: '100%', maxWidth: 780,
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--line)',
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in oklch, ${accentColor}, transparent 70%)`,
          overflow: 'hidden',
        }}>

        {/* Modal header */}
        <div style={{
          padding: '20px 24px 16px',
          background: `linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, ${accentColor}, var(--surface) 85%) 100%)`,
          borderBottom: '1px solid var(--line-soft)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: accentColor,
              flexShrink: 0, marginTop: 6,
              boxShadow: `0 0 12px color-mix(in oklch, ${accentColor}, transparent 40%)`,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 11, color: accentColor, marginBottom: 3, opacity: 0.85 }}>{sectionTitle}</div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{cat.category}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {catDone}/{catTotal} topics done · {doneChaps}/{totalChaps} chapters completed
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                background: 'var(--bg-soft)', border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-soft)', transition: 'background .12s',
              }}>
              <Icon name="close" size={15}/>
            </button>
          </div>

          {/* Dual progress bars */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 5, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${catTotal > 0 ? (catDone/catTotal)*100 : 0}%`, background: accentColor, borderRadius: 99, transition: 'width .4s' }}/>
              </div>
              <span className="mono faint" style={{ fontSize: 10, flexShrink: 0, width: 90, textAlign: 'right' }}>Topics {catDone}/{catTotal}</span>
            </div>
            {totalChaps > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalChaps > 0 ? (doneChaps/totalChaps)*100 : 0}%`, background: accentColor, borderRadius: 99, opacity: 0.5, transition: 'width .4s' }}/>
                </div>
                <span className="mono faint" style={{ fontSize: 10, flexShrink: 0, width: 90, textAlign: 'right' }}>Chapters {doneChaps}/{totalChaps}</span>
              </div>
            )}
          </div>
        </div>

        {/* Topic list (scrollable) */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {cat.topics.map((topic) => {
            const st       = progress[topic.id] || null;
            const stColor  = BE_STATUS_COLOR[st];
            const topOpen  = openTopic === topic.id;
            const chapDone = chapterProgress[topic.id] || [];
            const chapTotal = topic.chapters?.length || 0;
            const chapPct  = chapTotal > 0 ? chapDone.length / chapTotal : 0;

            return (
              <div key={topic.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                {/* Topic row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 24px',
                  background: topOpen ? 'var(--bg-soft)' : 'transparent',
                  transition: 'background .12s',
                }}>
                  {/* Status toggle */}
                  <button
                    onClick={() => onToggleTopic(topic.id)}
                    title={`${BE_STATUS_LABEL[st]} → click to advance`}
                    style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0, cursor: 'pointer',
                      background: st ? `color-mix(in oklch, ${stColor}, transparent 78%)` : 'var(--bg-soft)',
                      border: `2px solid ${st ? `color-mix(in oklch, ${stColor}, transparent 45%)` : 'var(--line)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: st ? stColor : 'var(--faint)', transition: 'all .15s',
                    }}>
                    <Icon name={BE_STATUS_ICON[st]} size={13}/>
                  </button>

                  {/* Topic info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        textDecoration: st === 'done' ? 'line-through' : 'none',
                        color: st === 'done' ? 'var(--muted)' : 'var(--ink)',
                      }}>{topic.name}</span>
                      <span style={{
                        padding: '1px 8px', borderRadius: 8, fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        background: st ? `color-mix(in oklch, ${stColor}, transparent 83%)` : 'var(--surface)',
                        color: st ? stColor : 'var(--faint)',
                        border: `1px solid ${st ? `color-mix(in oklch, ${stColor}, transparent 60%)` : 'var(--line-soft)'}`,
                      }}>{BE_STATUS_LABEL[st]}</span>
                    </div>
                    {chapTotal > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                        <div style={{ width: 90, height: 3, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${chapPct * 100}%`, background: accentColor, borderRadius: 99 }}/>
                        </div>
                        <span className="mono faint" style={{ fontSize: 10 }}>{chapDone.length}/{chapTotal} chapters</span>
                      </div>
                    )}
                  </div>

                  {/* Expand chapters button */}
                  {chapTotal > 0 && (
                    <button
                      onClick={() => setOpenTopic(topOpen ? null : topic.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 10px', borderRadius: 8,
                        color: 'var(--ink-soft)',
                        background: 'var(--bg-soft)',
                        border: '1px solid var(--line-soft)',
                      }}>
                      <span className="mono" style={{ fontSize: 11 }}>{chapDone.length}/{chapTotal}</span>
                      <Icon name={topOpen ? 'chevD' : 'chevR'} size={12}/>
                    </button>
                  )}
                </div>

                {/* Chapters (expanded) */}
                {topOpen && chapTotal > 0 && (
                  <div style={{ background: 'color-mix(in oklch, var(--bg-soft), var(--surface) 30%)', padding: '6px 0 10px 56px', borderTop: '1px solid var(--line-soft)' }}>
                    {topic.chapters.map((ch, ci) => {
                      const isDone = chapDone.includes(ci);
                      return (
                        <button
                          key={ci}
                          onClick={() => onToggleChapter(topic.id, ci)}
                          style={{
                            width: '100%', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '9px 24px 9px 0',
                            cursor: 'pointer', background: 'none', border: 'none',
                            borderBottom: ci < chapTotal - 1 ? '1px solid var(--line-soft)' : 'none',
                            transition: 'background .1s',
                          }}>
                          {/* Checkbox */}
                          <div style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            background: isDone ? accentColor : 'transparent',
                            border: `2px solid ${isDone ? accentColor : 'var(--line)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .15s',
                            boxShadow: isDone ? `0 0 8px color-mix(in oklch, ${accentColor}, transparent 50%)` : 'none',
                          }}>
                            {isDone && <Icon name="check" size={11} style={{ color: 'var(--surface)' }}/>}
                          </div>
                          <span style={{
                            fontSize: 13.5,
                            textDecoration: isDone ? 'line-through' : 'none',
                            color: isDone ? 'var(--muted)' : 'var(--ink-soft)',
                            transition: 'color .15s',
                          }}>{ch}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Study Section as Card Grid ────────────────────────────────────
function StudySectionCards({ state, dispatch, compact, topicsKey, progressKey, chapterKey, toggleTopicAction, chapterSection, catColors, accentColor, icon, title, subtitle }) {
  const seed = window.LATTICE_SEED;
  const cats = seed[topicsKey] || [];
  const progress     = state[progressKey]  || {};
  const chapterProg  = state[chapterKey]   || {};
  const [modalCatId, setModalCatId] = useState2(null);

  const allTopics  = cats.flatMap(c => c.topics);
  const totalCount = allTopics.length;
  const doneCount  = allTopics.filter(t => progress[t.id] === 'done').length;
  const readCount  = allTopics.filter(t => progress[t.id] === 'reading').length;
  const pct        = totalCount > 0 ? doneCount / totalCount : 0;

  const openCat = modalCatId ? cats.find(c => c.id === modalCatId) : null;

  if (cats.length === 0) return null;

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Section header */}
        <div style={{
          padding: '16px 20px',
          background: `linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, ${accentColor}, var(--surface) 88%) 100%)`,
          borderBottom: '1px solid var(--line-soft)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `color-mix(in oklch, ${accentColor}, transparent 80%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={icon} size={17} style={{ color: accentColor }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                {doneCount}/{totalCount} topics done
                {readCount > 0 && ` · ${readCount} in progress`}
                {' · '}{cats.length} sections · {subtitle}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="num" style={{ fontSize: 22, color: accentColor }}>{Math.round(pct * 100)}%</div>
              <div className="mono faint" style={{ fontSize: 10 }}>completed</div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div style={{ marginTop: 12, height: 6, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 99, background: accentColor, transition: 'width .5s ease' }}/>
          </div>

          {/* Status legend */}
          <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['done','reading','null'].map(s => {
              const cnt = s === 'null' ? totalCount - doneCount - readCount : allTopics.filter(t => progress[t.id] === s).length;
              return (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: BE_STATUS_COLOR[s], flexShrink: 0 }}/>
                  {BE_STATUS_LABEL[s]} ({cnt})
                </span>
              );
            })}
          </div>
        </div>

        {/* Category card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 1,
          background: 'var(--line-soft)',
        }}>
          {cats.map(cat => {
            const cc      = catColors[cat.id] || accentColor;
            const catDone = cat.topics.filter(t => progress[t.id] === 'done').length;
            const catRead = cat.topics.filter(t => progress[t.id] === 'reading').length;
            const catTot  = cat.topics.length;
            const catPct  = catTot > 0 ? catDone / catTot : 0;
            const chapDoneCount = cat.topics.reduce((a, t) => a + (chapterProg[t.id] || []).length, 0);
            const chapTotCount  = cat.topics.reduce((a, t) => a + (t.chapters?.length || 0), 0);

            return (
              <button
                key={cat.id}
                onClick={() => setModalCatId(cat.id)}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  padding: '14px 16px 12px',
                  background: 'var(--surface)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  transition: 'background .12s',
                  position: 'relative', overflow: 'hidden',
                  border: 'none',
                }}>
                {/* Colored top bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: catPct > 0 ? `linear-gradient(90deg, ${cc} ${catPct * 100}%, var(--line-soft) ${catPct * 100}%)` : 'var(--line-soft)',
                }}/>

                {/* Category name + donut row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                  <div style={{ flexShrink: 0 }}>
                    <Donut value={catPct} size={36} stroke={3.5} color={cc}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)' }}>{cat.category}</div>
                    <div className="mono faint" style={{ fontSize: 10, marginTop: 2 }}>
                      {catDone}/{catTot} done{catRead > 0 ? ` · ${catRead} →` : ''}
                    </div>
                  </div>
                </div>

                {/* Topic status dots */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {cat.topics.map(t => (
                    <div key={t.id} title={`${t.name}: ${BE_STATUS_LABEL[progress[t.id] || null]}`} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: BE_STATUS_COLOR[progress[t.id] || null],
                      opacity: !progress[t.id] ? 0.22 : 1,
                      transition: 'all .2s',
                    }}/>
                  ))}
                </div>

                {/* Progress bar + chapter count */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ height: 3, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${catPct * 100}%`, background: cc, borderRadius: 99, transition: 'width .4s' }}/>
                  </div>
                  {chapTotCount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="mono faint" style={{ fontSize: 9 }}>
                        {chapDoneCount}/{chapTotCount} chapters
                      </span>
                      <span className="mono" style={{ fontSize: 9, color: cc, opacity: 0.8 }}>
                        {Math.round(catPct * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-screen modal */}
      {openCat && (
        <StudyCategoryModal
          cat={openCat}
          progress={progress}
          chapterProgress={chapterProg}
          accentColor={catColors[openCat.id] || accentColor}
          sectionTitle={title}
          onToggleTopic={id => dispatch({ type: toggleTopicAction, id })}
          onToggleChapter={(topicId, idx) => dispatch({ type: 'TOGGLE_CHAPTER', section: chapterSection, topicId, chapterIdx: idx })}
          onClose={() => setModalCatId(null)}
        />
      )}
    </>
  );
}

// ── (Legacy) Backend Study Section — kept as alias to card grid ───
function BackendStudySection({ state, dispatch, compact }) {
  const seed = window.LATTICE_SEED;
  const cats = seed.backendTopics || [];
  const progress = state.backendProgress || {};
  const [openCat, setOpenCat] = useState2(null);
  const [openTopic, setOpenTopic] = useState2(null);

  const allTopics  = cats.flatMap(c => c.topics);
  const totalCount = allTopics.length;
  const doneCount  = allTopics.filter(t => progress[t.id] === 'done').length;
  const readCount  = allTopics.filter(t => progress[t.id] === 'reading').length;
  const pct        = totalCount > 0 ? doneCount / totalCount : 0;

  if (cats.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, oklch(0.76 0.17 155), var(--surface) 90%) 100%)',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'color-mix(in oklch, oklch(0.76 0.17 155), transparent 80%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="code" size={17} style={{ color: 'oklch(0.76 0.17 155)' }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Backend Engineering</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              {doneCount}/{totalCount} topics done
              {readCount > 0 && ` · ${readCount} in progress`}
              {' · '}{cats.length} categories
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="num" style={{ fontSize: 22, color: 'oklch(0.76 0.17 155)' }}>{Math.round(pct * 100)}%</div>
            <div className="mono faint" style={{ fontSize: 10 }}>completed</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginTop: 12, height: 5, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct * 100}%`, borderRadius: 99,
            background: 'oklch(0.76 0.17 155)', transition: 'width .4s ease',
          }}/>
        </div>

        {/* Status legend */}
        <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['done','reading','null'].map(s => {
            const cnt = s === 'null'
              ? totalCount - doneCount - readCount
              : allTopics.filter(t => progress[t.id] === s).length;
            return (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: BE_STATUS_COLOR[s], flexShrink: 0 }}/>
                {BE_STATUS_LABEL[s]} ({cnt})
              </span>
            );
          })}
        </div>
      </div>

      {/* Category list */}
      <div style={{ padding: '8px 0' }}>
        {cats.map(cat => {
          const catColor = BE_CAT_COLORS[cat.id] || 'oklch(0.76 0.17 155)';
          const catDone  = cat.topics.filter(t => progress[t.id] === 'done').length;
          const catTotal = cat.topics.length;
          const catOpen  = openCat === cat.id;

          return (
            <div key={cat.id}>
              {/* Category header */}
              <button
                onClick={() => setOpenCat(catOpen ? null : cat.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px',
                  background: catOpen ? 'var(--bg-soft)' : 'transparent',
                  borderBottom: '1px solid var(--line-soft)',
                  cursor: 'pointer',
                  transition: 'background .12s',
                }}>
                {/* Mini progress circle */}
                <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                  <Donut value={catTotal > 0 ? catDone / catTotal : 0} size={28} stroke={3} color={catColor}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.category}</div>
                  <div className="mono faint" style={{ fontSize: 10, marginTop: 1 }}>
                    {catDone}/{catTotal} topics
                  </div>
                </div>
                {/* Topic status chips */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginRight: 8 }}>
                  {cat.topics.map(t => {
                    const st = progress[t.id] || null;
                    return (
                      <div key={t.id} title={t.name} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: BE_STATUS_COLOR[st],
                        opacity: st === null ? 0.25 : 1,
                      }}/>
                    );
                  })}
                </div>
                <Icon name={catOpen ? 'chevD' : 'chevR'} size={13} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
              </button>

              {/* Topics list (expanded) */}
              {catOpen && (
                <div style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--line-soft)' }}>
                  {cat.topics.map(topic => {
                    const st      = progress[topic.id] || null;
                    const stColor = BE_STATUS_COLOR[st];
                    const topOpen = openTopic === topic.id;

                    return (
                      <div key={topic.id}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 20px 10px 32px',
                          borderBottom: '1px solid var(--line-soft)',
                          background: topOpen ? 'color-mix(in oklch, var(--surface), var(--bg-soft) 50%)' : 'transparent',
                        }}>
                          {/* Status toggle button */}
                          <button
                            onClick={() => dispatch({ type: 'TOGGLE_BACKEND', id: topic.id })}
                            title={`Click to mark as ${BE_STATUS_NEXT[String(st)] || 'planned'}`}
                            style={{
                              width: 26, height: 26, borderRadius: 7, flexShrink: 0, cursor: 'pointer',
                              background: st ? `color-mix(in oklch, ${stColor}, transparent 80%)` : 'var(--surface)',
                              border: `1.5px solid ${st ? `color-mix(in oklch, ${stColor}, transparent 50%)` : 'var(--line)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: st ? stColor : 'var(--faint)',
                              transition: 'all .15s',
                            }}>
                            <Icon name={BE_STATUS_ICON[st]} size={12}/>
                          </button>

                          {/* Topic name */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13,
                              textDecoration: st === 'done' ? 'line-through' : 'none',
                              color: st === 'done' ? 'var(--muted)' : 'var(--ink)',
                              transition: 'color .15s',
                            }}>{topic.name}</div>
                            <div className="mono faint" style={{ fontSize: 10, marginTop: 1 }}>
                              {topic.chapters?.length || 0} chapter{(topic.chapters?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>

                          {/* Status badge */}
                          <span style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 10, flexShrink: 0,
                            fontFamily: 'var(--font-mono)',
                            background: st ? `color-mix(in oklch, ${stColor}, transparent 83%)` : 'var(--surface)',
                            color: st ? stColor : 'var(--faint)',
                            border: `1px solid ${st ? `color-mix(in oklch, ${stColor}, transparent 60%)` : 'var(--line-soft)'}`,
                          }}>{BE_STATUS_LABEL[st]}</span>

                          {/* Expand chapters */}
                          {topic.chapters?.length > 0 && (
                            <button
                              onClick={() => setOpenTopic(topOpen ? null : topic.id)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                color: 'var(--muted)', display: 'flex', alignItems: 'center',
                              }}>
                              <Icon name={topOpen ? 'chevD' : 'chevR'} size={12}/>
                            </button>
                          )}
                        </div>

                        {/* Chapters list */}
                        {topOpen && topic.chapters?.length > 0 && (
                          <div style={{ paddingLeft: 44, paddingBottom: 6, background: 'var(--bg-soft)' }}>
                            {topic.chapters.map((ch, ci) => (
                              <div key={ci} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 20px 6px 0',
                                borderBottom: ci < topic.chapters.length - 1 ? '1px solid var(--line-soft)' : 'none',
                                fontSize: 12, color: 'var(--ink-soft)',
                              }}>
                                <span style={{ color: catColor, fontSize: 9, flexShrink: 0 }}>▸</span>
                                {ch}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Subjects Section ─────────────────────────────────────────────
function SubjectsSection({ subjects, compact }) {
  const [openSubj, setOpenSubj] = useState2(null);

  const totalHours  = subjects.reduce((a, s) => a + s.hoursLogged, 0);
  const avgMastery  = subjects.length > 0
    ? subjects.reduce((a, s) => a + s.mastery, 0) / subjects.length
    : 0;
  const solid   = subjects.filter(s => s.mastery >= 0.7).length;
  const medium  = subjects.filter(s => s.mastery >= 0.4 && s.mastery < 0.7).length;
  const weak    = subjects.filter(s => s.mastery < 0.4).length;

  function masteryColor(m) {
    if (m >= 0.7) return 'oklch(0.84 0.21 131)';   // green
    if (m >= 0.4) return 'oklch(0.72 0.19 52)';    // amber
    return 'oklch(0.65 0.22 25)';                   // red
  }

  const SUBJ_ACCENT = 'oklch(0.76 0.17 60)';

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: `linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, ${SUBJ_ACCENT}, var(--surface) 90%) 100%)`,
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `color-mix(in oklch, ${SUBJ_ACCENT}, transparent 80%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="sparkle" size={17} style={{ color: SUBJ_ACCENT }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Study Subjects</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              {subjects.length > 0
                ? `${subjects.length} subject${subjects.length !== 1 ? 's' : ''} · ${totalHours}h logged · avg ${Math.round(avgMastery * 100)}% mastery`
                : 'No subjects added yet'}
            </div>
          </div>
          {subjects.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="num" style={{ fontSize: 22, color: SUBJ_ACCENT }}>{Math.round(avgMastery * 100)}%</div>
              <div className="mono faint" style={{ fontSize: 10 }}>avg mastery</div>
            </div>
          )}
        </div>

        {subjects.length > 0 && (
          <>
            {/* Overall progress bar (avg mastery) */}
            <div style={{ marginTop: 12, height: 5, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avgMastery * 100}%`, borderRadius: 99, background: SUBJ_ACCENT, transition: 'width .4s ease' }}/>
            </div>
            {/* Legend */}
            <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { label: 'Solid (≥70%)', color: 'oklch(0.84 0.21 131)', count: solid },
                { label: 'Developing', color: 'oklch(0.72 0.19 52)', count: medium },
                { label: 'Needs work', color: 'oklch(0.65 0.22 25)', count: weak },
              ].map(({ label, color, count }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}/>
                  {label} ({count})
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Subject list */}
      <div style={{ padding: subjects.length === 0 ? '24px 20px' : '8px 0' }}>
        {subjects.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0', color: 'var(--muted)' }}>
            <Icon name="sparkle" size={28} style={{ opacity: 0.3 }}/>
            <div style={{ fontSize: 13, fontWeight: 500 }}>No subjects yet</div>
            <div className="muted" style={{ fontSize: 12 }}>Add study subjects to track mastery progress here</div>
          </div>
        ) : (
          [...subjects].sort((a, b) => a.mastery - b.mastery).map(s => {
            const mc    = masteryColor(s.mastery);
            const pct   = Math.round(s.mastery * 100);
            const hrPct = Math.min(100, (s.hoursLogged / s.target) * 100);
            const isOpen = openSubj === s.id;

            return (
              <div key={s.id}>
                {/* Subject row */}
                <button
                  onClick={() => setOpenSubj(isOpen ? null : s.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    background: isOpen ? 'var(--bg-soft)' : 'transparent',
                    borderBottom: '1px solid var(--line-soft)',
                    cursor: 'pointer', transition: 'background .12s',
                    position: 'relative',
                  }}>
                  {/* Mastery color bar */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: mc, borderRadius: '0 2px 2px 0' }}/>

                  {/* Donut */}
                  <div style={{ flexShrink: 0, marginLeft: 4 }}>
                    <Donut value={s.mastery} size={40} stroke={4} color={mc}/>
                  </div>

                  {/* Name + progress bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
                      {s.weakTopics?.length > 0 && (
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 6,
                          background: `color-mix(in oklch, oklch(0.65 0.22 25), transparent 82%)`,
                          color: 'oklch(0.65 0.22 25)',
                          border: '1px solid color-mix(in oklch, oklch(0.65 0.22 25), transparent 60%)',
                          fontFamily: 'var(--font-mono)',
                        }}>{s.weakTopics.length} weak</span>
                      )}
                    </div>
                    {/* Dual progress bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: mc, borderRadius: 99, transition: 'width .4s' }}/>
                        </div>
                        <span className="mono faint" style={{ fontSize: 10, flexShrink: 0 }}>Mastery {pct}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${hrPct}%`, background: SUBJ_ACCENT, borderRadius: 99, transition: 'width .4s', opacity: 0.7 }}/>
                        </div>
                        <span className="mono faint" style={{ fontSize: 10, flexShrink: 0 }}>{s.hoursLogged}/{s.target}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <div className="num" style={{ fontSize: 20, color: mc, lineHeight: 1 }}>{pct}<span style={{ fontSize: 12 }}>%</span></div>
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 6,
                      background: `color-mix(in oklch, ${SUBJ_ACCENT}, transparent 85%)`,
                      color: SUBJ_ACCENT,
                      fontFamily: 'var(--font-mono)',
                    }}>W{Math.round(s.weight * 100)}%</span>
                  </div>
                  <Icon name={isOpen ? 'chevD' : 'chevR'} size={13} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
                </button>

                {/* Expanded detail panel */}
                {isOpen && (
                  <div style={{
                    background: 'var(--bg-soft)',
                    borderBottom: '1px solid var(--line-soft)',
                    padding: '16px 20px 16px 28px',
                  }}>
                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Hours logged', value: `${s.hoursLogged}h`, sub: `of ${s.target}h target` },
                        { label: 'Mastery', value: `${pct}%`, sub: pct >= 70 ? 'Solid' : pct >= 40 ? 'Developing' : 'Needs work' },
                        { label: 'Exam weight', value: `${Math.round(s.weight * 100)}%`, sub: 'of total score' },
                        { label: 'Weak topics', value: `${s.weakTopics?.length || 0}`, sub: 'flagged for review' },
                      ].map(({ label, value, sub }) => (
                        <div key={label} style={{
                          flex: '1 1 80px',
                          padding: '10px 14px',
                          background: 'var(--surface)',
                          borderRadius: 10,
                          border: '1px solid var(--line-soft)',
                        }}>
                          <div className="muted" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
                          <div className="num" style={{ fontSize: 18, color: mc }}>{value}</div>
                          <div className="mono faint" style={{ fontSize: 10, marginTop: 2 }}>{sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Hours progress bar detailed */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span className="muted" style={{ fontSize: 11 }}>Progress to target ({s.target}h)</span>
                        <span className="mono" style={{ fontSize: 11, color: SUBJ_ACCENT }}>{Math.round(hrPct)}%</span>
                      </div>
                      <div style={{ height: 7, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${hrPct}%`, background: SUBJ_ACCENT, borderRadius: 99, transition: 'width .4s' }}/>
                      </div>
                    </div>

                    {/* Weak topics */}
                    {s.weakTopics?.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Weak Topics</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {s.weakTopics.map((t, i) => (
                            <span key={i} style={{
                              padding: '5px 10px', borderRadius: 8, fontSize: 12,
                              background: 'color-mix(in oklch, oklch(0.65 0.22 25), transparent 85%)',
                              color: 'oklch(0.65 0.22 25)',
                              border: '1px solid color-mix(in oklch, oklch(0.65 0.22 25), transparent 65%)',
                            }}>⚠ {t}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'oklch(0.84 0.21 131)' }}>
                        <Icon name="check" size={13}/>
                        No weak topics flagged — solid coverage!
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Colors for CS & DA sections ───────────────────────────────────
const CS_CAT_COLORS = {
  'cs-s1': 'oklch(0.74 0.14 240)', 'cs-s2': 'oklch(0.72 0.17 45)',
  'cs-s3': 'oklch(0.76 0.17 155)', 'cs-s4': 'oklch(0.74 0.14 290)',
  'cs-s5': 'oklch(0.72 0.19 25)',  'cs-s6': 'oklch(0.76 0.17 155)',
  'cs-s7': 'oklch(0.74 0.14 240)', 'cs-s8': 'oklch(0.72 0.17 45)',
  'cs-s9': 'oklch(0.74 0.14 290)', 'cs-s10':'oklch(0.72 0.19 52)',
};
const DA_CAT_COLORS = {
  'da-s1': 'oklch(0.74 0.19 310)', 'da-s2': 'oklch(0.74 0.14 240)',
  'da-s3': 'oklch(0.72 0.17 45)',  'da-s4': 'oklch(0.76 0.17 155)',
  'da-s5': 'oklch(0.74 0.14 290)', 'da-s6': 'oklch(0.72 0.19 25)',
  'da-s7': 'oklch(0.74 0.19 310)',
};
const GA_CAT_COLORS = {
  'ga-s1': 'oklch(0.72 0.19 310)', // Verbal — violet
  'ga-s2': 'oklch(0.74 0.14 240)', // Quantitative — blue
  'ga-s3': 'oklch(0.72 0.17 45)',  // Analytical — amber
  'ga-s4': 'oklch(0.76 0.17 155)', // Spatial — green
};

// ── Generic GATE study section (shared by CS and DA) ──────────────
function GATEStudySection({ state, dispatch, compact, topicsKey, progressKey, toggleAction, accentColor, icon, title, subtitle }) {
  const seed = window.LATTICE_SEED;
  const cats = seed[topicsKey] || [];
  const progress = state[progressKey] || {};
  const CAT_COLORS = topicsKey === 'csTopics' ? CS_CAT_COLORS : DA_CAT_COLORS;
  const [openCat, setOpenCat] = useState2(null);
  const [openTopic, setOpenTopic] = useState2(null);

  const allTopics  = cats.flatMap(c => c.topics);
  const totalCount = allTopics.length;
  const doneCount  = allTopics.filter(t => progress[t.id] === 'done').length;
  const readCount  = allTopics.filter(t => progress[t.id] === 'reading').length;
  const pct        = totalCount > 0 ? doneCount / totalCount : 0;

  if (cats.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: `linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, ${accentColor}, var(--surface) 90%) 100%)`,
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `color-mix(in oklch, ${accentColor}, transparent 80%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={icon} size={17} style={{ color: accentColor }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              {doneCount}/{totalCount} topics done{readCount > 0 && ` · ${readCount} in progress`} · {cats.length} sections · {subtitle}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="num" style={{ fontSize: 22, color: accentColor }}>{Math.round(pct * 100)}%</div>
            <div className="mono faint" style={{ fontSize: 10 }}>completed</div>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 5, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 99, background: accentColor, transition: 'width .4s ease' }}/>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['done','reading','null'].map(s => {
            const cnt = s === 'null' ? totalCount - doneCount - readCount : allTopics.filter(t => progress[t.id] === s).length;
            return (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: BE_STATUS_COLOR[s], flexShrink: 0 }}/>
                {BE_STATUS_LABEL[s]} ({cnt})
              </span>
            );
          })}
        </div>
      </div>

      {/* Category list */}
      <div style={{ padding: '8px 0' }}>
        {cats.map(cat => {
          const catColor = CAT_COLORS[cat.id] || accentColor;
          const catDone  = cat.topics.filter(t => progress[t.id] === 'done').length;
          const catTotal = cat.topics.length;
          const catOpen  = openCat === cat.id;
          return (
            <div key={cat.id}>
              <button
                onClick={() => setOpenCat(catOpen ? null : cat.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px',
                  background: catOpen ? 'var(--bg-soft)' : 'transparent',
                  borderBottom: '1px solid var(--line-soft)',
                  cursor: 'pointer', transition: 'background .12s',
                }}>
                <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                  <Donut value={catTotal > 0 ? catDone / catTotal : 0} size={28} stroke={3} color={catColor}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.category}</div>
                  <div className="mono faint" style={{ fontSize: 10, marginTop: 1 }}>{catDone}/{catTotal} topics</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginRight: 8 }}>
                  {cat.topics.map(t => (
                    <div key={t.id} title={t.name} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: BE_STATUS_COLOR[progress[t.id] || null],
                      opacity: !progress[t.id] ? 0.25 : 1,
                    }}/>
                  ))}
                </div>
                <Icon name={catOpen ? 'chevD' : 'chevR'} size={13} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
              </button>

              {catOpen && (
                <div style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--line-soft)' }}>
                  {cat.topics.map(topic => {
                    const st      = progress[topic.id] || null;
                    const stColor = BE_STATUS_COLOR[st];
                    const topOpen = openTopic === topic.id;
                    return (
                      <div key={topic.id}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 20px 10px 32px',
                          borderBottom: '1px solid var(--line-soft)',
                          background: topOpen ? 'color-mix(in oklch, var(--surface), var(--bg-soft) 50%)' : 'transparent',
                        }}>
                          <button
                            onClick={() => dispatch({ type: toggleAction, id: topic.id })}
                            title={`Click to mark as ${BE_STATUS_NEXT[String(st)] || 'planned'}`}
                            style={{
                              width: 26, height: 26, borderRadius: 7, flexShrink: 0, cursor: 'pointer',
                              background: st ? `color-mix(in oklch, ${stColor}, transparent 80%)` : 'var(--surface)',
                              border: `1.5px solid ${st ? `color-mix(in oklch, ${stColor}, transparent 50%)` : 'var(--line)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: st ? stColor : 'var(--faint)', transition: 'all .15s',
                            }}>
                            <Icon name={BE_STATUS_ICON[st]} size={12}/>
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13,
                              textDecoration: st === 'done' ? 'line-through' : 'none',
                              color: st === 'done' ? 'var(--muted)' : 'var(--ink)',
                              transition: 'color .15s',
                            }}>{topic.name}</div>
                            <div className="mono faint" style={{ fontSize: 10, marginTop: 1 }}>
                              {topic.chapters?.length || 0} chapter{(topic.chapters?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <span style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 10, flexShrink: 0,
                            fontFamily: 'var(--font-mono)',
                            background: st ? `color-mix(in oklch, ${stColor}, transparent 83%)` : 'var(--surface)',
                            color: st ? stColor : 'var(--faint)',
                            border: `1px solid ${st ? `color-mix(in oklch, ${stColor}, transparent 60%)` : 'var(--line-soft)'}`,
                          }}>{BE_STATUS_LABEL[st]}</span>
                          {topic.chapters?.length > 0 && (
                            <button
                              onClick={() => setOpenTopic(topOpen ? null : topic.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                              <Icon name={topOpen ? 'chevD' : 'chevR'} size={12}/>
                            </button>
                          )}
                        </div>
                        {topOpen && topic.chapters?.length > 0 && (
                          <div style={{ paddingLeft: 44, paddingBottom: 6, background: 'var(--bg-soft)' }}>
                            {topic.chapters.map((ch, ci) => (
                              <div key={ci} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 20px 6px 0',
                                borderBottom: ci < topic.chapters.length - 1 ? '1px solid var(--line-soft)' : 'none',
                                fontSize: 12, color: 'var(--ink-soft)',
                              }}>
                                <span style={{ color: catColor, fontSize: 9, flexShrink: 0 }}>▸</span>
                                {ch}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STUDY VIEW ────────────────────────────────────────────────────
function StudyView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const subjects   = seed.subjects   || [];
  const studyDaily = seed.studyDaily || [];
  const last30 = studyDaily.slice(-30).map(d => d.hours);

  // Topic stats — Backend, CS, DA
  const beCats  = seed.backendTopics || [];
  const beAll   = beCats.flatMap(c => c.topics);
  const beDone  = beAll.filter(t => (state.backendProgress || {})[t.id] === 'done').length;
  const bePct   = beAll.length > 0 ? Math.round((beDone / beAll.length) * 100) : 0;

  const csCats  = seed.csTopics || [];
  const csAll   = csCats.flatMap(c => c.topics);
  const csDone  = csAll.filter(t => (state.csProgress || {})[t.id] === 'done').length;
  const csPct   = csAll.length > 0 ? Math.round((csDone / csAll.length) * 100) : 0;

  const daCats  = seed.daTopics || [];
  const daAll   = daCats.flatMap(c => c.topics);
  const daDone  = daAll.filter(t => (state.daProgress || {})[t.id] === 'done').length;
  const daPct   = daAll.length > 0 ? Math.round((daDone / daAll.length) * 100) : 0;

  const gaCats  = seed.gaTopics || [];
  const gaAll   = gaCats.flatMap(c => c.topics);
  const gaDone  = gaAll.filter(t => (state.gaProgress || {})[t.id] === 'done').length;
  const gaPct   = gaAll.length > 0 ? Math.round((gaDone / gaAll.length) * 100) : 0;

  const studyTodayH = studyDaily.length > 0 ? studyDaily[studyDaily.length - 1].hours : 0;
  const avgMastery  = subjects.length > 0 ? Math.round(subjects.reduce((a,s) => a + s.mastery, 0) / subjects.length * 100) : 0;
  const totalHours  = subjects.reduce((a,s) => a + s.hoursLogged, 0);

  // Safe date labels for hours chart
  const chartStart = studyDaily.length >= 30 ? studyDaily[studyDaily.length - 30].date.slice(5) : studyDaily[0]?.date.slice(5) || '';
  const chartEnd   = studyDaily.length > 0 ? studyDaily[studyDaily.length - 1].date.slice(5) : '';

  return (
    <div className="fade-up" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <div className="h-eyebrow">Study tracker</div>
        <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Mastery, by subject.</h1>
        <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
          {subjects.length > 0 ? `${subjects.length} subjects · ${totalHours}h logged · ` : ''}
          Backend {bePct}% · CS {csPct}% · DA {daPct}% · GA {gaPct}%
        </p>
      </header>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(5, minmax(0, 1fr))',
        gap: 12,
      }}>
        <Metric label="Backend"  value={`${bePct}%`}  sub={`${beDone}/${beAll.length} done`}  series={beAll.map((_, i) => i < beDone ? 1 : 0)}/>
        <Metric label="GATE CS"  value={`${csPct}%`}  sub={`${csDone}/${csAll.length} done`}  series={csAll.map((_, i) => i < csDone ? 1 : 0)}/>
        <Metric label="GATE DA"  value={`${daPct}%`}  sub={`${daDone}/${daAll.length} done`}  series={daAll.map((_, i) => i < daDone ? 1 : 0)}/>
        <Metric label="Aptitude" value={`${gaPct}%`}  sub={`${gaDone}/${gaAll.length} done`}  series={gaAll.map((_, i) => i < gaDone ? 1 : 0)}/>
        <Metric label="This month"  value={`${last30.reduce((a,b)=>a+b,0).toFixed(0)}h`} sub="study hours" series={last30}/>
      </div>

      {/* Backend Engineering */}
      <StudySectionCards
        state={state} dispatch={dispatch} compact={compact}
        topicsKey="backendTopics" progressKey="backendProgress" chapterKey="backendChapters"
        toggleTopicAction="TOGGLE_BACKEND" chapterSection="backend"
        catColors={BE_CAT_COLORS} accentColor="oklch(0.76 0.17 155)"
        icon="code" title="Backend Engineering" subtitle="Node.js · APIs · Databases"
      />

      {/* GATE CS */}
      <StudySectionCards
        state={state} dispatch={dispatch} compact={compact}
        topicsKey="csTopics" progressKey="csProgress" chapterKey="csChapters"
        toggleTopicAction="TOGGLE_CS" chapterSection="cs"
        catColors={CS_CAT_COLORS} accentColor="oklch(0.74 0.14 240)"
        icon="layers" title="GATE CS — Computer Science & IT" subtitle="GATE 2024 syllabus"
      />

      {/* GATE DA */}
      <StudySectionCards
        state={state} dispatch={dispatch} compact={compact}
        topicsKey="daTopics" progressKey="daProgress" chapterKey="daChapters"
        toggleTopicAction="TOGGLE_DA" chapterSection="da"
        catColors={DA_CAT_COLORS} accentColor="oklch(0.74 0.19 310)"
        icon="chart" title="GATE DA — Data Science & AI" subtitle="GATE 2026 syllabus"
      />

      {/* GATE GA — General Aptitude */}
      <StudySectionCards
        state={state} dispatch={dispatch} compact={compact}
        topicsKey="gaTopics" progressKey="gaProgress" chapterKey="gaChapters"
        toggleTopicAction="TOGGLE_GA" chapterSection="ga"
        catColors={GA_CAT_COLORS} accentColor="oklch(0.68 0.22 290)"
        icon="sparkle" title="GATE GA — General Aptitude" subtitle="GATE 2026 syllabus"
      />

      {/* Subjects — always show section, with or without data */}
      <SubjectsSection subjects={subjects} compact={compact}/>

      {/* Hours chart — only if data exists */}
      {studyDaily.length > 1 && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Daily hours" hint="Past 30 days" action={
            <Segmented value="30d" options={['7d', '30d', '90d']} onChange={() => {}}/>
          }/>
          <div style={{ marginTop: 16 }}>
            <BarChart values={last30} w={compact ? 320 : 880} h={120}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span className="mono faint" style={{ fontSize: 10 }}>{chartStart}</span>
              <span className="mono faint" style={{ fontSize: 10 }}>{chartEnd}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TIMER VIEW ────────────────────────────────────────────────────
// Timer state lives in app reducer (state.timer) so it runs in background
const TIMER_SUBJECTS = ['DSA', 'Backend', 'GATE CS', 'GATE DA', 'GATE GA', 'Maths', 'Physics', 'General'];

function TimerView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const t = state.timer || {};
  const { mode = 'pomodoro', phase = 'focus', running = false, secondsLeft = 1500,
          stopwatch = 0, countdown = 600, subject = 'DSA', completedToday = 0 } = t;

  const set = (payload) => dispatch({ type: 'TIMER_SET', payload });

  // Real last-7-days series from state.focusSessions
  const today = seed.TODAY || new Date().toISOString().slice(0, 10);
  const allSessions = state.focusSessions || seed.focusSessions || [];
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const last7Sessions = last7Dates.map(date =>
    allSessions.filter(s => s.completed && s.date === date).length
  );
  const last7Minutes = last7Sessions.map(n => n * 25);

  // All subject options: static list + any added study subjects
  const subjectOptions = TIMER_SUBJECTS.concat(
    (seed.subjects || []).map(s => s.name).filter(n => !TIMER_SUBJECTS.includes(n))
  );

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  const displaySec = mode === 'pomodoro' ? secondsLeft : mode === 'stopwatch' ? stopwatch : countdown;
  const progress   = mode === 'pomodoro' ? 1 - secondsLeft / ((phase === 'focus' ? 25 : 5) * 60) : 0;
  const accentCol  = mode === 'pomodoro' ? (phase === 'focus' ? 'var(--accent)' : 'var(--warn)') : 'var(--info)';

  return (
    <div className="fade-up" style={{ padding: compact ? 16 : '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="h-eyebrow">Focus</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Deep work.</h1>
        </div>
        {running && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
            background: `color-mix(in oklch, ${accentCol}, transparent 88%)`,
            border: `1px solid color-mix(in oklch, ${accentCol}, transparent 60%)`,
            color: accentCol, fontSize: 12 }}>
            <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: accentCol }}/>
            Running in background
          </div>
        )}
      </header>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Segmented value={mode} options={[
          { value: 'pomodoro',  label: 'Pomodoro'  },
          { value: 'stopwatch', label: 'Stopwatch' },
          { value: 'countdown', label: 'Countdown' },
        ]} onChange={(m) => set({ mode: m, running: false })}/>
      </div>

      {/* Big timer card */}
      <div className="card" style={{
        padding: compact ? '28px 16px' : '48px 32px',
        background: `linear-gradient(160deg, var(--surface), color-mix(in oklch, ${accentCol}, var(--surface) 92%))`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Phase label */}
        <div className="h-eyebrow" style={{ marginBottom: 14, color: accentCol }}>
          {running && <span className="pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: accentCol, marginRight: 8, verticalAlign: 'middle' }}/>}
          {mode === 'pomodoro'
            ? (phase === 'focus' ? `Focus · ${subject}` : 'Break time')
            : mode === 'stopwatch' ? 'Stopwatch' : 'Countdown'}
        </div>

        {/* Time display */}
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: compact ? 88 : 144,
          fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1,
          color: running ? accentCol : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          transition: 'color .3s',
        }}>{fmtTime(displaySec)}</div>

        {/* Pomodoro progress bar */}
        {mode === 'pomodoro' && (
          <div style={{ maxWidth: 480, margin: '20px auto 0' }}>
            <div className="bar" style={{ height: 4 }}>
              <div style={{ width: `${progress * 100}%`, background: accentCol, transition: 'width 1s linear' }}/>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ height: 42, padding: '0 24px', fontSize: 14 }}
            onClick={() => set({ running: !running })}>
            <Icon name={running ? 'pause' : 'play'} size={14}/>
            {running ? 'Pause' : mode === 'stopwatch' && stopwatch > 0 ? 'Resume' : 'Start'}
          </button>
          <button className="btn" style={{ height: 42, padding: '0 14px' }} onClick={() => {
            if (mode === 'pomodoro')   set({ running: false, secondsLeft: (phase === 'focus' ? 25 : 5) * 60 });
            else if (mode === 'stopwatch') set({ running: false, stopwatch: 0 });
            else                       set({ running: false, countdown: 10 * 60 });
          }}><Icon name="reset" size={14}/></button>
          {mode === 'pomodoro' && (
            <button className="btn" style={{ height: 42, padding: '0 14px' }} onClick={() => {
              const next = phase === 'focus' ? 'break' : 'focus';
              set({ phase: next, secondsLeft: (next === 'focus' ? 25 : 5) * 60,
                    completedToday: phase === 'focus' ? completedToday + 1 : completedToday });
            }}><Icon name="next" size={14}/></button>
          )}
        </div>

        {/* Subject selector — pill chips */}
        <div style={{ marginTop: 24 }}>
            <div className="muted" style={{ fontSize: 11, marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Studying</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {subjectOptions.map(s => {
                const active = subject === s;
                return (
                  <button key={s} onClick={() => set({ subject: s })} style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                    background: active ? accentCol : 'var(--bg-soft)',
                    color: active ? '#fff' : 'var(--ink-soft)',
                    border: `1.5px solid ${active ? accentCol : 'var(--line-soft)'}`,
                    transition: 'all .15s',
                  }}>{s}</button>
                );
              })}
            </div>
        </div>

        {/* Countdown custom input */}
        {mode === 'countdown' && !running && (
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span className="muted" style={{ fontSize: 12 }}>Duration (min):</span>
            {[5, 10, 15, 20, 30, 45, 60].map(min => (
              <button key={min} className="btn" style={{ height: 28, padding: '0 8px', fontSize: 11,
                background: countdown === min * 60 ? 'var(--accent-tint)' : undefined,
                color: countdown === min * 60 ? 'var(--accent)' : undefined,
                borderColor: countdown === min * 60 ? 'var(--accent-line)' : undefined,
              }} onClick={() => set({ countdown: min * 60 })}>{min}</button>
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
        <Metric label="Sessions today" value={last7Sessions[6]} sub="completed" series={last7Sessions}/>
        <Metric label="Focus minutes"  value={`${last7Sessions[6] * 25}m`} sub="today" series={last7Minutes}/>
        <Metric label="Stopwatch"      value={fmtTime(stopwatch)} sub="elapsed" series={[]}/>
        <Metric label="Status"         value={running ? 'Active' : 'Idle'} sub={running ? `${mode} running` : 'not running'} series={[]}/>
      </div>

      {/* Session history — today's completed sessions, newest first */}
      {!compact && allSessions.filter(s => s.completed && s.date === today).length > 0 && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <CardHead title="Session history" hint="Today's sessions"/>
          <div style={{ marginTop: 14 }}>
            {allSessions.filter(s => s.completed && s.date === today).slice().reverse().map((s, i) => (
              <div key={s.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: 'var(--accent-tint)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="check" size={14}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{s.subject || 'General'}</div>
                  <div className="mono faint" style={{ fontSize: 11 }}>{s.date} · {s.minutes || 25} min</div>
                </div>
                <span className="tag" style={{ borderColor: 'var(--accent-line)', color: 'var(--accent)' }}>Complete</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared fitness constants (used by both CalendarView & FitnessView) ──
const FITNESS_DAY_COLORS = {
  Monday:    'oklch(0.84 0.21 131)',
  Tuesday:   'oklch(0.72 0.19 52)',
  Wednesday: 'oklch(0.84 0.21 131)',
  Thursday:  'oklch(0.84 0.21 131)',
  Friday:    'oklch(0.72 0.19 52)',
  Saturday:  'oklch(0.84 0.21 131)',
  Sunday:    'oklch(0.68 0.24 352)',
};

const FITNESS_DEFAULT_PLAN = [
  { day: 'Monday',    group: 'Chest & Triceps',  short: 'Chest',     muscles: ['Upper Chest', 'Mid Chest', 'Triceps', 'Front Delt'],    exercises: ['Bench Press', 'Incline DB Press', 'Cable Flyes', 'Tricep Pushdown', 'Overhead Ext'], mins: 60 },
  { day: 'Tuesday',   group: 'Back & Biceps',    short: 'Back',      muscles: ['Lats', 'Rhomboids', 'Biceps', 'Rear Delt'],             exercises: ['Pull-Ups', 'Barbell Row', 'Lat Pulldown', 'Hammer Curl', 'Face Pull'], mins: 60 },
  { day: 'Wednesday', group: 'Legs & Glutes',    short: 'Legs',      muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],              exercises: ['Squats', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Calf Raises'], mins: 70 },
  { day: 'Thursday',  group: 'Shoulders & Abs',  short: 'Shoulders', muscles: ['Front Delt', 'Side Delt', 'Rear Delt', 'Core'],         exercises: ['OHP', 'Lateral Raises', 'Front Raises', 'Plank', 'Crunches'], mins: 55 },
  { day: 'Friday',    group: 'Full Body Power',  short: 'Power',     muscles: ['Chest', 'Back', 'Shoulders', 'Arms'],                   exercises: ['Deadlift', 'Push-Ups', 'Dips', 'Cable Row', 'Curls'], mins: 65 },
  { day: 'Saturday',  group: 'Arms & Core',      short: 'Arms',      muscles: ['Biceps', 'Triceps', 'Forearms', 'Abs'],                 exercises: ['Barbell Curl', 'Skullcrushers', 'Preacher Curl', 'Tricep Dips', 'Ab Wheel'], mins: 50 },
];

const FITNESS_DEFAULT_CARDIO = {
  day: 'Sunday', short: 'Cardio',
  title: 'Active Recovery & Cardio',
  total: '60 min',
  flow: [
    { name: 'Warm Up',   mins: 10, icon: 'flame' },
    { name: 'HIIT',      mins: 20, icon: 'target' },
    { name: 'Cardio',    mins: 15, icon: 'timer' },
    { name: 'Core',      mins: 10, icon: 'target' },
    { name: 'Cool Down', mins:  5, icon: 'next' },
  ],
  benefits: ['Improves cardiovascular fitness', 'Burns fat efficiently', 'Enhances recovery', 'Boosts endurance'],
};

// DOW index (0=Sun … 6=Sat) → workout entry
const DOW_TO_WORKOUT = [
  FITNESS_DEFAULT_CARDIO,        // 0 Sunday
  FITNESS_DEFAULT_PLAN[0],       // 1 Monday  – Chest & Triceps
  FITNESS_DEFAULT_PLAN[1],       // 2 Tuesday – Back & Biceps
  FITNESS_DEFAULT_PLAN[2],       // 3 Wednesday – Legs
  FITNESS_DEFAULT_PLAN[3],       // 4 Thursday – Shoulders
  FITNESS_DEFAULT_PLAN[4],       // 5 Friday – Full Body
  FITNESS_DEFAULT_PLAN[5],       // 6 Saturday – Arms & Core
];

// Live clock — shows current time, updates every second
function LiveClock() {
  const [time, setTime] = useState2(() => {
    const n = new Date();
    return n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });
  useEffect2(() => {
    const id = setInterval(() => {
      const n = new Date();
      setTime(n.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="mono faint" style={{ fontSize: 10, letterSpacing: '0.05em', userSelect: 'none' }}>{time}</span>
  );
}

// ── CALENDAR VIEW ─────────────────────────────────────────────────
const EVENT_KINDS = ['event', 'test', 'meet', 'study', 'admin', 'workout'];
const kindColor = (kind) =>
  kind === 'test'    ? 'oklch(0.72 0.16 25 / 0.22)'   :
  kind === 'meet'    ? 'oklch(0.78 0.10 240 / 0.22)'  :
  kind === 'study'   ? 'var(--accent-tint)'            :
  kind === 'admin'   ? 'oklch(0.74 0.10 320 / 0.22)'  :
  kind === 'workout' ? 'oklch(0.84 0.21 131 / 0.18)'  :
                       'oklch(0.74 0.14 160 / 0.22)';
const kindDot = (kind) =>
  kind === 'test'    ? 'var(--danger)'              :
  kind === 'meet'    ? 'var(--info)'                :
  kind === 'study'   ? 'var(--accent)'              :
  kind === 'admin'   ? 'var(--plum)'                :
  kind === 'workout' ? 'oklch(0.84 0.21 131)'       : 'var(--warn)';

const DOW_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function CalendarView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const todayIso = seed.TODAY;
  // Parse date parts directly to avoid any UTC-shift timezone issues
  const [ty, tm, td] = todayIso.split('-').map(Number);
  const [cursor, setCursor] = useState2({ year: ty, month: tm - 1 });
  const [selected, setSelected] = useState2(todayIso);
  const [addOpen, setAddOpen] = useState2(false);
  const [editId, setEditId] = useState2(null);
  const [form, setForm] = useState2({ title: '', time: '', kind: 'event' });

  const year = cursor.year;
  const month = cursor.month;  // 0-based
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (d) => d ? `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : null;
  const isToday    = (d) => iso(d) === todayIso;
  const isSelected = (d) => iso(d) === selected;

  const events = state.events || [];
  const eventsByDay = useMemo2(() => {
    const m = {};
    events.forEach(e => { (m[e.date] = m[e.date] || []).push(e); });
    return m;
  }, [events]);

  const dayEvents = eventsByDay[selected] || [];

  // Workout for selected day — use shared constants (no seed.fitness dependency)
  const seedPlan    = seed.fitness?.plan     || null;
  const seedCardio  = seed.fitness?.cardioDay || null;
  // Parse selected date safely
  const [sy, sm2, sd2] = selected.split('-').map(Number);
  const selDow = new Date(sy, sm2 - 1, sd2).getDay();  // local, no UTC shift
  const workout = selDow === 0
    ? (seedCardio || FITNESS_DEFAULT_CARDIO)
    : (seedPlan ? seedPlan.find(p => p.day === DOW_NAMES[selDow]) : null) || DOW_TO_WORKOUT[selDow];

  const workoutColor = FITNESS_DAY_COLORS[DOW_NAMES[selDow]] || FITNESS_DAY_COLORS.Sunday;

  const selectedLabel = new Date(sy, sm2 - 1, sd2).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // form helpers
  const openAdd = () => { setEditId(null); setForm({ title: '', time: '', kind: 'event' }); setAddOpen(true); };
  const openEdit = (ev) => { setEditId(ev.id); setForm({ title: ev.title, time: ev.time, kind: ev.kind }); setAddOpen(true); };
  const closeForm = () => { setAddOpen(false); setEditId(null); };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    if (editId) {
      dispatch({ type: 'UPDATE_EVENT', event: { id: editId, ...form, date: selected } });
    } else {
      dispatch({ type: 'ADD_EVENT', event: { id: 'e' + Date.now(), ...form, date: selected } });
    }
    closeForm();
  };

  return (
    <div className="fade-up" style={{ padding: compact ? 16 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="h-eyebrow">Calendar</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Plan the month.</h1>
        </div>
        {!compact && (
          <button className="btn" onClick={() => { setCursor({ year: ty, month: tm - 1 }); setSelected(todayIso); }}>Today</button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* ── Left: month grid ── */}
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="serif" style={{ fontSize: compact ? 18 : 22, margin: 0 }}>{monthLabel}</h2>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn-ghost btn" onClick={() => { const d = new Date(year, month - 1, 1); setCursor({ year: d.getFullYear(), month: d.getMonth() }); }} style={{ padding: '0 10px' }}>‹</button>
              <button className="btn-ghost btn" onClick={() => { const d = new Date(year, month + 1, 1); setCursor({ year: d.getFullYear(), month: d.getMonth() }); }} style={{ padding: '0 10px' }}>›</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="h-eyebrow" style={{ fontSize: 9, textAlign: 'center', padding: '0 2px' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((d, i) => {
              const dateIso = iso(d);
              const evs = d ? (eventsByDay[dateIso] || []) : [];
              const habitsDone = d ? Object.values(state.habitLog).filter(log => (log[dateIso] || 0) > 0).length : 0;
              const intensity = habitsDone === 0 ? null : habitsDone < 2 ? 1 : habitsDone < 4 ? 2 : habitsDone < 5 ? 3 : 4;
              const sel = isSelected(d);
              const tod = isToday(d);
              // Workout chip for this cell
              const cellDow = d ? new Date(year, month, d).getDay() : -1;
              const cellWorkout = d ? DOW_TO_WORKOUT[cellDow] : null;
              const cellWColor = cellWorkout ? (FITNESS_DAY_COLORS[cellWorkout.day] || FITNESS_DAY_COLORS.Sunday) : null;
              return (
                <button key={i}
                  onClick={() => d && setSelected(dateIso)}
                  style={{
                    minHeight: compact ? 44 : 72,
                    padding: '5px 4px', borderRadius: 8, cursor: d ? 'pointer' : 'default',
                    background: !d ? 'transparent' :
                      sel ? 'var(--accent)' :
                      tod ? 'var(--accent-tint)' : 'var(--bg-soft)',
                    border: '1px solid ' + (sel ? 'var(--accent)' : tod ? 'var(--accent-line)' : 'var(--line-soft)'),
                    opacity: !d ? 0 : 1, textAlign: 'left', transition: 'all .15s',
                  }}>
                  {d && (<>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="mono" style={{ fontSize: 11, color: sel ? 'var(--accent-on)' : tod ? 'var(--accent)' : 'var(--ink-soft)' }}>{d}</span>
                      {intensity && !sel && <div style={{ width: 5, height: 5, borderRadius: '50%' }} className="hm-cell" data-v={intensity}/>}
                    </div>
                    {/* Workout chip */}
                    {!compact && cellWorkout && (
                      <div style={{
                        fontSize: 8, padding: '1px 4px', borderRadius: 3, marginTop: 2,
                        background: sel ? 'rgba(255,255,255,0.18)' : `color-mix(in oklch, ${cellWColor}, transparent 80%)`,
                        color: sel ? 'var(--accent-on)' : cellWColor,
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        fontFamily: 'var(--font-mono)',
                      }}>{cellWorkout.short}</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                      {evs.slice(0, compact ? 1 : 2).map(e => (
                        <div key={e.id} style={{
                          fontSize: 9, padding: '1px 3px', borderRadius: 3,
                          background: sel ? 'rgba(255,255,255,0.2)' : kindColor(e.kind),
                          color: sel ? 'var(--accent-on)' : 'var(--ink-soft)',
                          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }}>{e.title}</div>
                      ))}
                      {evs.length > 2 && <div className="mono" style={{ fontSize: 8, color: sel ? 'rgba(255,255,255,0.7)' : 'var(--faint)' }}>+{evs.length - 2}</div>}
                    </div>
                  </>)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: day detail panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* day header */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="h-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selected === todayIso ? 'Today' : DOW_NAMES[selDow]}
                  {selected === todayIso && <LiveClock/>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{selectedLabel}</div>
              </div>
              <button className="btn btn-primary" style={{ height: 32, padding: '0 12px', fontSize: 12 }} onClick={openAdd}>
                <Icon name="plus" size={12}/> Add event
              </button>
            </div>

            {/* add / edit form */}
            {addOpen && (
              <div className="fade-up" style={{
                padding: 14, marginBottom: 12,
                background: 'var(--bg-soft)', border: '1px solid var(--line)',
                borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <input
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Event title" autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveEvent()}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none', color: 'var(--ink)' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="Time (e.g. 18:00 or all-day)"
                    style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', color: 'var(--ink)' }}
                  />
                  <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 8px', fontSize: 12, outline: 'none', color: 'var(--ink)' }}>
                    {EVENT_KINDS.map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1, height: 32, fontSize: 12 }} onClick={saveEvent}>
                    {editId ? 'Save changes' : 'Add event'}
                  </button>
                  <button className="btn-ghost btn" style={{ height: 32, fontSize: 12 }} onClick={closeForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* event list for selected day */}
            {dayEvents.length === 0 && !addOpen && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div className="muted" style={{ fontSize: 13 }}>No events scheduled</div>
                <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>Click "+ Add event" to schedule one</div>
              </div>
            )}
            {dayEvents.map(ev => (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8,
                background: kindColor(ev.kind),
                marginBottom: 6,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: kindDot(ev.kind), flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{ev.title}</div>
                  <div className="mono faint" style={{ fontSize: 10, marginTop: 1 }}>{ev.time} · {ev.kind}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(ev)} style={{
                    width: 26, height: 26, borderRadius: 6, background: 'var(--bg-soft)',
                    border: '1px solid var(--line-soft)', color: 'var(--muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name="settings" size={11}/></button>
                  <button onClick={() => dispatch({ type: 'DELETE_EVENT', id: ev.id })} style={{
                    width: 26, height: 26, borderRadius: 6, background: 'var(--bg-soft)',
                    border: '1px solid var(--line-soft)', color: 'var(--danger)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name="minus" size={11}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* workout for this day — styled with day color */}
          <div className="card" style={{
            padding: '16px 18px', overflow: 'hidden', position: 'relative',
            background: `linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, ${workoutColor}, var(--surface) 94%) 100%)`,
            border: `1px solid color-mix(in oklch, ${workoutColor}, transparent 72%)`,
          }}>
            {/* top accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: workoutColor }}/>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 2 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, color: workoutColor, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {DOW_NAMES[selDow]} · {selDow === 0 ? 'Cardio & Recovery' : 'Workout'}
                </div>
                <div className="serif" style={{ fontSize: 16 }}>{workout.group || workout.title}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 12,
                background: `color-mix(in oklch, ${workoutColor}, transparent 82%)`,
                color: workoutColor, fontFamily: 'var(--font-mono)', fontSize: 10,
              }}>{workout.total || `${workout.mins} min`}</span>
            </div>

            {/* Gym day: muscles + exercises */}
            {selDow !== 0 && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {(workout.muscles || []).map((m, i) => (
                    <span key={i} style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 10, fontFamily: 'var(--font-mono)',
                      background: `color-mix(in oklch, ${workoutColor}, transparent 85%)`,
                      color: workoutColor,
                    }}>{m}</span>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
                  {(workout.exercises || []).map((ex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
                      <span style={{ color: workoutColor, fontSize: 8 }}>►</span>
                      {ex}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Cardio/Sunday: flow steps */}
            {selDow === 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {(workout.flow || []).map((step, i) => (
                    <React.Fragment key={i}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', margin: '0 auto 3px',
                          background: `color-mix(in oklch, ${workoutColor}, transparent 84%)`,
                          border: `1px solid color-mix(in oklch, ${workoutColor}, transparent 62%)`,
                          color: workoutColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Icon name={step.icon} size={14}/></div>
                        <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{step.name}</div>
                        <div className="mono faint" style={{ fontSize: 9 }}>{step.mins}m</div>
                      </div>
                      {i < (workout.flow || []).length - 1 && (
                        <span style={{ color: workoutColor, opacity: 0.4, fontSize: 12 }}>›</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {(workout.benefits || []).map((b, i) => (
                    <span key={i} style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 10, fontFamily: 'var(--font-mono)',
                      background: `color-mix(in oklch, ${workoutColor}, transparent 85%)`,
                      color: workoutColor,
                    }}>{b}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* upcoming strip */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <CardHead title="Upcoming" hint="Next 10 days"/>
            <div style={{ marginTop: 10 }}>
              {events.filter(e => e.date >= todayIso).sort((a,b)=>a.date.localeCompare(b.date)).slice(0, 5).map(e => (
                <AgendaRow key={e.id} ev={e}/>
              ))}
              {events.filter(e => e.date >= todayIso).length === 0 && (
                <Empty title="No upcoming events" hint="Add events to see them here"/>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FITNESS VIEW ───────────────────────────────────────────────────
function FitnessView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const f = seed.fitness;

  const plan      = f?.plan      || FITNESS_DEFAULT_PLAN;
  const cardioDay = f?.cardioDay || FITNESS_DEFAULT_CARDIO;
  const stepsGoal = f?.today?.stepsGoal || 10000;
  const activeGoal= f?.today?.activeGoal || 60;

  // Live progress from state (persisted via backend)
  const fp = state.fitnessProgress || {};
  const completedMap = fp.completedExercises || {};
  const steps = fp.steps || 0;

  // Derived metrics from completed exercises + steps
  const totalDoneExercises = Object.values(completedMap).reduce((sum, arr) => sum + arr.length, 0);
  const exerciseCalories   = totalDoneExercises * 28;           // ~28 kcal per exercise
  const stepCalories       = Math.round(steps * 0.04);         // ~0.04 kcal/step
  const calories           = exerciseCalories + stepCalories;
  const distKm             = parseFloat((steps * 0.0007).toFixed(2));
  const activeMin          = Math.round(steps / 100) + totalDoneExercises * 4; // walk + sets

  const stepsWeek = f?.stepsWeek || (() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayIdx = new Date().getDay(); // 0=Sun
    const mappedIdx = todayIdx === 0 ? 6 : todayIdx - 1; // Mon=0
    return days.map((d, i) => ({
      d, steps: i === mappedIdx ? steps : 0,
      today: i === mappedIdx, future: i > mappedIdx,
    }));
  })();

  const [stepsInput, setStepsInput] = useState2(String(steps));
  // Keep input field in sync with external updates
  useEffect2(() => { setStepsInput(String(steps)); }, [steps]);

  const [nowTime, setNowTime] = useState2(new Date());
  useEffect2(() => {
    const id = setInterval(() => setNowTime(new Date()), 60000); // update every minute
    return () => clearInterval(id);
  }, []);
  const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const todayName = DAY_NAMES[nowTime.getDay()];
  const dateStr   = `${todayName}, ${MONTH_NAMES[nowTime.getMonth()]} ${nowTime.getDate()}`;
  const hr        = nowTime.getHours();
  const greeting  = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="fade-up" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="h-eyebrow">Fitness</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>{greeting}, Athlete! 💪</h1>
          {totalDoneExercises > 0 && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: 'oklch(0.84 0.21 131)' }}>
                {totalDoneExercises} exercise{totalDoneExercises !== 1 ? 's' : ''} done today
              </span>
              <span className="mono faint" style={{ fontSize: 11 }}>·</span>
              <span className="mono faint" style={{ fontSize: 11 }}>{calories} kcal burned</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {totalDoneExercises > 0 && (
            <button
              onClick={() => dispatch({ type: 'RESET_FITNESS' })}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-soft)', border: '1px solid var(--line-soft)', color: 'var(--muted)',
              }}>Reset day</button>
          )}
          <div style={{
            padding: '8px 20px', borderRadius: 24,
            background: 'oklch(0.84 0.21 131)',
            color: '#000',
            fontFamily: 'var(--font-mono)',
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em',
          }}>{dateStr}</div>
        </div>
      </header>

      {/* ── 4 Ring Metric Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(2, minmax(0,1fr))' : 'repeat(4, minmax(0,1fr))',
        gap: 12,
      }}>
        <RingMetric label="Steps Today"   value={steps.toLocaleString()}
          sub={`/ ${stepsGoal.toLocaleString()} steps`} unit=""
          pct={steps / stepsGoal}
          color="oklch(0.84 0.21 131)" iconName="target"/>
        <RingMetric label="Calories Burn" value={calories}
          sub="kcal burned" unit=""
          pct={calories / 800}
          color="oklch(0.72 0.19 52)" iconName="flame"/>
        <RingMetric label="Distance"      value={distKm}
          sub="km covered" unit=""
          pct={distKm / 8}
          color="oklch(0.74 0.14 240)" iconName="next"/>
        <RingMetric label="Active Time"   value={`${Math.floor(activeMin/60)}h ${activeMin%60}m`}
          sub="minutes active" unit=""
          pct={activeMin / activeGoal}
          color="oklch(0.68 0.24 352)" iconName="timer"/>
      </div>

      {/* ── Weekly Gym Workout Plan ── */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--accent-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="target" size={17}/>
          </div>
          <div>
            <div className="h-section" style={{ fontSize: 14 }}>Weekly Gym Workout Plan</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>6 training days · Sunday rest &amp; cardio</div>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(2, minmax(0,1fr))' : 'repeat(3, minmax(0,1fr))',
          gap: 12,
        }}>
          {plan.map((p, i) => (
            <FitDayCard key={i} plan={p}
              color={FITNESS_DAY_COLORS[p.day] || 'var(--accent)'}
              completedExercises={completedMap[p.day] || []}
              onToggle={(day, idx) => dispatch({ type: 'TOGGLE_EXERCISE', day, index: idx })}
            />
          ))}
        </div>
      </div>

      {/* ── Sunday Cardio Day ── */}
      <div className="card" style={{
        padding: compact ? '18px 20px' : '24px 28px',
        background: 'linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, oklch(0.68 0.24 352), var(--surface) 90%) 100%)',
        border: '1px solid color-mix(in oklch, oklch(0.68 0.24 352), transparent 72%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'oklch(0.68 0.24 352)', letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 5 }}>
              {cardioDay.day} · Cardio &amp; Recovery
            </div>
            <div className="serif" style={{ fontSize: compact ? 18 : 22 }}>{cardioDay.title}</div>
          </div>
          <span style={{
            padding: '5px 16px', borderRadius: 20,
            border: '1px solid color-mix(in oklch, oklch(0.68 0.24 352), transparent 60%)',
            color: 'oklch(0.68 0.24 352)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}>Total {cardioDay.total}</span>
        </div>

        {/* Flow diagram */}
        <div style={{
          display: 'flex', alignItems: 'center',
          flexWrap: compact ? 'wrap' : 'nowrap',
          gap: compact ? 10 : 0,
          justifyContent: compact ? 'flex-start' : 'space-between',
          marginBottom: 20,
        }}>
          {cardioDay.flow.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: compact ? '0 0 auto' : 1 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'color-mix(in oklch, oklch(0.68 0.24 352), transparent 84%)',
                  border: '1.5px solid color-mix(in oklch, oklch(0.68 0.24 352), transparent 58%)',
                  color: 'oklch(0.68 0.24 352)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={step.icon} size={21}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{step.name}</div>
                <div className="mono faint" style={{ fontSize: 10 }}>{step.mins} min</div>
              </div>
              {i < cardioDay.flow.length - 1 && !compact && (
                <div style={{ flex: '0 0 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon name="chevR" size={14} style={{ color: 'oklch(0.68 0.24 352)', opacity: 0.45 }}/>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {!compact && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {cardioDay.benefits.map((b, i) => (
              <span key={i} style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'oklch(0.68 0.24 352)', flexShrink: 0 }}/>
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 10,000 Steps Tracker ── */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'color-mix(in oklch, oklch(0.84 0.21 131), transparent 82%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="target" size={17} style={{ color: 'oklch(0.84 0.21 131)' }}/>
          </div>
          <div>
            <div className="h-section" style={{ fontSize: 14 }}>10,000 Steps Tracker</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Daily goal · 10,000 steps</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '220px 1fr',
          gap: 28,
          alignItems: 'center',
        }}>
          {/* Big donut */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Donut
              value={Math.min(1, steps / stepsGoal)}
              size={compact ? 160 : 200}
              stroke={14}
              color="oklch(0.84 0.21 131)"
              label={
                <div style={{ textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: compact ? 26 : 36, lineHeight: 1 }}>{steps.toLocaleString()}</div>
                  <div className="mono faint" style={{ fontSize: 10, marginTop: 5 }}>/ {stepsGoal.toLocaleString()} STEPS</div>
                </div>
              }
            />
            <div className="num" style={{ fontSize: 20, color: 'oklch(0.84 0.21 131)' }}>
              {Math.round((steps / stepsGoal) * 100)}% completed
            </div>
            <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
              {steps >= stepsGoal ? 'Goal reached! Great job.' : `${(stepsGoal - steps).toLocaleString()} steps to go`}
            </div>

            {/* Quick-add step buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              {[500, 1000, 2000, 5000].map(n => (
                <button key={n}
                  onClick={() => dispatch({ type: 'UPDATE_STEPS', steps: steps + n })}
                  style={{
                    padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: 'color-mix(in oklch, oklch(0.84 0.21 131), transparent 84%)',
                    border: '1px solid color-mix(in oklch, oklch(0.84 0.21 131), transparent 60%)',
                    color: 'oklch(0.84 0.21 131)',
                    transition: 'opacity .15s',
                  }}>+{n >= 1000 ? `${n/1000}k` : n}</button>
              ))}
            </div>

            {/* Manual step input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <input
                type="number" min="0" max="99999"
                value={stepsInput}
                onChange={e => setStepsInput(e.target.value)}
                onBlur={() => {
                  const v = parseInt(stepsInput, 10);
                  if (!isNaN(v) && v >= 0) dispatch({ type: 'UPDATE_STEPS', steps: v });
                  else setStepsInput(String(steps));
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = parseInt(stepsInput, 10);
                    if (!isNaN(v) && v >= 0) dispatch({ type: 'UPDATE_STEPS', steps: v });
                  }
                }}
                style={{
                  width: 90, padding: '5px 8px', borderRadius: 8, textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                }}
              />
              <button
                onClick={() => { dispatch({ type: 'UPDATE_STEPS', steps: 0 }); setStepsInput('0'); }}
                style={{
                  padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line-soft)',
                  color: 'var(--muted)',
                }}>Reset</button>
            </div>
          </div>

          {/* Weekly bars + stats */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <span className="h-section">Weekly Overview</span>
              <span className="mono faint" style={{ fontSize: 11 }}>Goal 10,000/day</span>
            </div>
            <StepsBarChart data={stepsWeek} compact={compact}/>
            {!compact && (
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <MiniStat label="Today's Steps"  value={steps.toLocaleString()}/>
                <MiniStat label="Distance"       value={`${distKm} km`}/>
                <MiniStat label="Calories Burnt" value={`${calories.toLocaleString()} kcal`}/>
                <MiniStat label="Exercises Done" value={`${totalDoneExercises} sets`}/>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly Progress History ── */}
      {!compact && (() => {
        const history = fp.history || {};
        const weeks = Object.keys(history).sort((a, b) => b.localeCompare(a)); // newest first
        if (weeks.length === 0) return null;

        const DOW_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        const allPlans  = [...plan, cardioDay]; // all 7 days

        return (
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--accent-tint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="chart" size={17}/>
              </div>
              <div>
                <div className="h-section" style={{ fontSize: 14 }}>Weekly Progress History</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                  {weeks.length} week{weeks.length !== 1 ? 's' : ''} tracked · auto-archived every Monday
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weeks.map(weekKey => {
                const entry = history[weekKey];
                const ce = entry.completedExercises || {};
                const total = entry.totalExercises || Object.values(ce).reduce((s,a) => s+a.length, 0);
                // Total possible = 5 exercises × 6 days = 30
                const possible = allPlans.reduce((s, p) => s + (p.exercises?.length || 0), 0);
                const pct = possible > 0 ? Math.min(1, total / possible) : 0;

                // Parse weekKey (YYYY-MM-DD = Monday) to display label
                const [wy, wm, wd] = weekKey.split('-').map(Number);
                const mondayDate = new Date(wy, wm - 1, wd);
                const sundayDate = new Date(wy, wm - 1, wd + 6);
                const fmt = d => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                const weekLabel = `${fmt(mondayDate)} – ${fmt(sundayDate)}, ${wy}`;

                // Days worked out
                const daysWorked = Object.keys(ce).filter(day => (ce[day] || []).length > 0);

                return (
                  <div key={weekKey} style={{
                    padding: '14px 16px',
                    background: 'var(--bg-soft)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div className="mono faint" style={{ fontSize: 10, marginBottom: 3, letterSpacing: '0.05em' }}>{weekLabel}</div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                          {total} exercise{total !== 1 ? 's' : ''} completed
                          <span className="muted" style={{ fontSize: 12, fontWeight: 400, marginLeft: 6 }}>
                            ({daysWorked.length} day{daysWorked.length !== 1 ? 's' : ''} active)
                          </span>
                        </div>
                      </div>
                      <div className="num" style={{ fontSize: 20, color: pct >= 0.7 ? 'oklch(0.84 0.21 131)' : pct >= 0.4 ? 'oklch(0.72 0.19 52)' : 'var(--muted)' }}>
                        {Math.round(pct * 100)}%
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 4, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{
                        height: '100%', borderRadius: 99, transition: 'width .4s ease',
                        width: `${pct * 100}%`,
                        background: pct >= 0.7 ? 'oklch(0.84 0.21 131)' : pct >= 0.4 ? 'oklch(0.72 0.19 52)' : 'var(--muted)',
                      }}/>
                    </div>

                    {/* Day chips */}
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {DOW_ORDER.map(day => {
                        const done = (ce[day] || []).length;
                        const dayPlan = allPlans.find(p => p.day === day);
                        const total2 = dayPlan?.exercises?.length || 0;
                        const dayColor = FITNESS_DAY_COLORS[day] || 'var(--muted)';
                        const isActive = done > 0;
                        return (
                          <div key={day} title={`${day}: ${done}/${total2} exercises`} style={{
                            padding: '3px 9px', borderRadius: 10, fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            background: isActive ? `color-mix(in oklch, ${dayColor}, transparent 80%)` : 'var(--surface)',
                            border: `1px solid ${isActive ? `color-mix(in oklch, ${dayColor}, transparent 58%)` : 'var(--line-soft)'}`,
                            color: isActive ? dayColor : 'var(--faint)',
                          }}>
                            {day.slice(0, 3)}{isActive ? ` ${done}/${total2}` : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Fitness day card — FitTrack style with exercise checklist
function FitDayCard({ plan, color, completedExercises, onToggle }) {
  const [expanded, setExpanded] = useState2(false);
  const exList = plan.exercises || [];
  const done  = completedExercises.length;
  const total = exList.length;
  const pct   = total > 0 ? done / total : 0;

  return (
    <div style={{
      background: 'var(--bg-soft)',
      border: '1px solid var(--line-soft)',
      borderRadius: 14,
      overflow: 'hidden', position: 'relative',
      transition: 'border-color .15s',
      borderColor: done > 0 ? `color-mix(in oklch, ${color}, transparent 55%)` : undefined,
    }}>
      {/* Top accent bar */}
      <div style={{ height: 3, background: color }}/>

      <div style={{ padding: 16 }}>
        {/* Day + progress badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="mono" style={{ fontSize: 11, color, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {plan.day}
          </div>
          {done > 0 && (
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)',
              padding: '2px 8px', borderRadius: 10,
              background: `color-mix(in oklch, ${color}, transparent 80%)`,
              color,
            }}>{done}/{total}</span>
          )}
        </div>

        {/* Group name */}
        <div className="serif" style={{ fontSize: 16, lineHeight: 1.2, marginBottom: 12 }}>{plan.group}</div>

        {/* Muscle targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(plan.muscles || []).map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
              <span style={{ color, fontSize: 9 }}>►</span>
              {m}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginTop: 12, height: 3, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 99, transition: 'width .3s ease' }}/>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 11, fontFamily: 'var(--font-mono)', color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            {expanded ? '▲ Hide' : '▼ Exercises'} ({total})
          </button>
          <span className="mono faint" style={{ fontSize: 10 }}>{plan.mins} min</span>
        </div>

        {/* Expanded exercise checklist */}
        {expanded && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {exList.map((ex, i) => {
              const checked = completedExercises.includes(i);
              return (
                <div key={i}
                  onClick={() => onToggle(plan.day, i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px',
                    background: checked ? `color-mix(in oklch, ${color}, transparent 88%)` : 'var(--surface)',
                    border: '1px solid ' + (checked ? `color-mix(in oklch, ${color}, transparent 60%)` : 'var(--line-soft)'),
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'background .15s, border-color .15s',
                  }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    background: checked ? color : 'transparent',
                    border: '1.5px solid ' + (checked ? color : 'var(--muted)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {checked && <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <polyline points="2,5 4,8 8,2" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                  </div>
                  <span style={{
                    fontSize: 12, flex: 1,
                    textDecoration: checked ? 'line-through' : 'none',
                    color: checked ? 'var(--muted)' : 'var(--ink)',
                    transition: 'color .15s',
                  }}>{ex}</span>
                  <span className="mono faint" style={{ fontSize: 10 }}>3×10</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Ring metric card (used at top of fitness)
function RingMetric({ label, value, sub, unit, pct, color, iconName }) {
  return (
    <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div className="h-eyebrow" style={{ fontSize: 10 }}>{label}</div>
        </div>
        <div className="num" style={{ fontSize: 24, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{value}</div>
        <div className="mono faint" style={{ fontSize: 10, marginTop: 2 }}>{sub} {unit}</div>
      </div>
      <div style={{ position: 'relative' }}>
        <Donut value={Math.min(1, pct)} size={48} stroke={5} color={color}/>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, opacity: 0.85,
        }}>
          <Icon name={iconName} size={14}/>
        </div>
      </div>
    </div>
  );
}

// Day card in weekly plan
function DayCard({ plan, active, onClick }) {
  const groupColor = plan.group.startsWith('Back') ? 'oklch(0.74 0.14 145)'
    : plan.group.startsWith('Chest') ? 'oklch(0.74 0.16 50)'
    : 'oklch(0.74 0.14 280)';
  return (
    <button onClick={onClick}
      style={{
        textAlign: 'left',
        padding: 14,
        background: active ? 'color-mix(in oklch, var(--surface), transparent 30%)' : 'var(--bg-soft)',
        border: '1px solid ' + (active ? 'var(--accent-line)' : 'var(--line-soft)'),
        borderRadius: 12,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color .15s, background .15s',
      }}>
      {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--accent)' }}/>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="mono" style={{ fontSize: 10, color: groupColor, letterSpacing: '0.14em' }}>{plan.day.toUpperCase()}</div>
        <span className="mono faint" style={{ fontSize: 10 }}>{plan.mins} min</span>
      </div>
      <div className="serif" style={{ fontSize: 18, lineHeight: 1.15, marginBottom: 10 }}>{plan.group}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {plan.muscles.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-soft)' }}>
            <span style={{ color: groupColor }}>›</span>
            {m}
          </div>
        ))}
      </div>
      <div className="hr" style={{ margin: '10px 0 8px' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="mono faint" style={{ fontSize: 10 }}>{plan.exercises.length} exercises</span>
        <span className="mono" style={{ fontSize: 10, color: active ? 'var(--accent)' : 'var(--muted)' }}>{active ? 'Viewing' : 'View →'}</span>
      </div>
    </button>
  );
}

// Steps weekly bar chart
function StepsBarChart({ data, compact }) {
  const max = Math.max(...data.map(d => d.steps), 12000);
  const h = compact ? 110 : 150;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: compact ? 8 : 14, height: h + 36 }}>
      {data.map((d, i) => {
        const ratio = d.steps / max;
        const bh = d.future ? 6 : ratio * h;
        const isToday = d.today;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 10, color: isToday ? 'var(--accent)' : d.future ? 'var(--faint)' : 'var(--ink-soft)' }}>
              {d.future ? '—' : d.steps.toLocaleString()}
            </div>
            <div style={{
              width: '100%',
              height: bh,
              background: isToday ? 'var(--accent)' : d.future ? 'var(--line-soft)' : 'var(--elev)',
              borderRadius: 6,
              border: isToday ? '1px solid var(--accent)' : '1px solid var(--line)',
              transition: 'height .35s ease',
            }}/>
            <div className="mono" style={{ fontSize: 10, color: isToday ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.d}</div>
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{
      padding: 12,
      background: 'var(--bg-soft)',
      border: '1px solid var(--line-soft)',
      borderRadius: 10,
      minWidth: 0,
    }}>
      <div className="h-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
}

function RingCard({ label, value, goal, unit, color }) {
  const pct = Math.min(1, value / goal);
  return (
    <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Donut value={pct} size={56} stroke={6} color={color}
        label={<span className="mono" style={{ fontSize: 11 }}>{Math.round(pct*100)}%</span>}/>
      <div>
        <div className="h-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
        <div className="num" style={{ fontSize: 22 }}>{value.toLocaleString()}<span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>{unit}</span></div>
        <div className="muted" style={{ fontSize: 11 }}>of {goal.toLocaleString()}{unit && ` ${unit}`}</div>
      </div>
    </div>
  );
}

// ── ACHIEVEMENTS VIEW ─────────────────────────────────────────────
function AchievementsView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const xp = seed.xp || { level: 1, current: 0, nextLevel: 1000, totalEarned: 0 };
  const badges = seed.badges || [];

  return (
    <div className="fade-up" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header>
        <div className="h-eyebrow">Achievements</div>
        <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>Level up.</h1>
      </header>

      <div className="card" style={{
        padding: 24,
        background: 'linear-gradient(135deg, var(--surface), color-mix(in oklch, var(--accent-tint), var(--surface) 70%))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: compact ? 64 : 88, height: compact ? 64 : 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
            color: 'var(--accent-on)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 24px var(--accent-tint), inset 0 -4px 8px rgba(0,0,0,0.15)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 9, opacity: 0.8 }}>LVL</div>
              <div className="num" style={{ fontSize: compact ? 24 : 34, color: 'var(--accent-on)' }}>{xp.level}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="h-eyebrow" style={{ marginBottom: 4 }}>Experience</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span className="num" style={{ fontSize: compact ? 22 : 30 }}>{xp.current.toLocaleString()}</span>
              <span className="muted" style={{ fontSize: 13 }}>/ {xp.nextLevel.toLocaleString()} XP</span>
            </div>
            <div className="bar" style={{ height: 8 }}>
              <div style={{ width: `${(xp.current / xp.nextLevel) * 100}%` }}/>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
              {(xp.nextLevel - xp.current).toLocaleString()} XP to level {xp.level + 1} · total {xp.totalEarned.toLocaleString()} earned
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <CardHead title="Badges" hint={`${badges.filter(b=>b.unlocked).length}/${badges.length} unlocked`}/>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10 }}>
          {badges.length === 0 && <Empty title="No badges yet" hint="Complete habits and challenges to earn badges"/>}
          {badges.map(b => (
            <div key={b.id} style={{
              padding: 14,
              background: b.unlocked ? 'var(--bg-soft)' : 'transparent',
              border: '1px solid var(--line-soft)',
              borderRadius: 10,
              opacity: b.unlocked ? 1 : 0.55,
              position: 'relative',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: b.unlocked ? 'var(--accent-tint)' : 'var(--bg-soft)',
                color: b.unlocked ? 'var(--accent)' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <Icon name="trophy" size={16}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{b.name}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{b.desc}</div>
              {b.unlocked ? (
                <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', marginTop: 6 }}>
                  Earned {b.date.slice(5).replace('-', '/')}
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div className="bar" style={{ height: 3 }}>
                    <div style={{ width: `${(b.progress || 0) * 100}%` }}/>
                  </div>
                  <div className="mono faint" style={{ fontSize: 9, marginTop: 3 }}>{Math.round((b.progress || 0) * 100)}%</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <CardHead title="Daily challenges" hint="Reset at midnight"/>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {seed.challenges.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--accent-tint)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name="target" size={16}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{c.name}</span>
                  <span className="mono faint" style={{ fontSize: 11 }}>+{c.xp} XP</span>
                </div>
                <div className="bar"><div style={{ width: `${Math.min(100,(c.progress/c.target)*100)}%` }}/></div>
              </div>
              <div className="mono muted" style={{ fontSize: 11, width: 50, textAlign: 'right' }}>{c.progress}/{c.target}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MONTHLY VIEW ───────────────────────────────────────────────────
function MonthlyView({ state, dispatch, compact = false }) {
  const seed = window.LATTICE_SEED;
  const m = seed.monthly || { month: '', goals: [], stats: { productivityScore: 0, studyHours: 0, problemsSolved: 0, focusMinutes: 0, consistency: 0 } };
  const monthLabel = m.month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const consistencyLog = useMemo2(() => buildConsistencyLog(state, seed, 'all'), [state, seed]);

  return (
    <div className="fade-up" style={{ padding: compact ? 20 : '28px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="h-eyebrow">Monthly report</div>
          <h1 className={compact ? 'h-title' : 'h-display'} style={{ margin: '4px 0 0' }}>{monthLabel}.</h1>
        </div>
        {!compact && <button className="btn"><Icon name="chart" size={12}/> Export PDF</button>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 10 }}>
        <BigStat label="Productivity" value={m.stats.productivityScore} sub="/100"/>
        <BigStat label="Study hours" value={m.stats.studyHours} sub="hrs"/>
        <BigStat label="Problems solved" value={m.stats.problemsSolved} sub="DSA"/>
        <BigStat label="Focus minutes" value={(m.stats.focusMinutes||0).toLocaleString()} sub="min"/>
        <BigStat label="Consistency" value={`${Math.round((m.stats.consistency||0)*100)}%`} sub="vs goal"/>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <CardHead title="Monthly goals" hint={`${(m.goals||[]).filter(g=>g.progress>=1).length}/${(m.goals||[]).length} achieved`}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          {(m.goals||[]).length === 0 && <Empty title="No goals set" hint="Set monthly goals to track your progress"/>}
          {(m.goals||[]).map(g => (
            <div key={g.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{g.name}</span>
                <span className="num" style={{ fontSize: 14 }}>{Math.round(g.progress*100)}%</span>
              </div>
              <div className="bar" style={{ height: 6 }}>
                <div style={{ width: `${g.progress*100}%`,
                  background: g.progress >= 1 ? 'var(--accent)' : 'var(--accent)' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <CardHead title="Consistency map" hint="Daily progress across every tracked area"/>
        <div style={{ marginTop: 14, overflowX: 'auto' }}>
          <Heatmap log={consistencyLog} today={seed.TODAY} weeks={compact ? 26 : 52} dense={compact}/>
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div className="h-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="num" style={{ fontSize: 26 }}>{value}</span>
        <span className="muted" style={{ fontSize: 12 }}>{sub}</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  StudyView, TimerView, CalendarView, FitnessView, AchievementsView, MonthlyView,
});
