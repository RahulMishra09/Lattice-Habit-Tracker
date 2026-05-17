// data.js — seeded sample data for a GATE/placement-prep student
// Exposed on window.LATTICE_SEED so all components can read it.

(function () {
  const TODAY = new Date('2026-05-17');
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  // --- Habits ---------------------------------------------------------------
  const habits = [
    { id: 'h1', name: 'DSA problem (1+)',  cat: 'Coding',     target: 1, unit: 'problem',  color: 'accent',  streak: 41, best: 52 },
    { id: 'h2', name: 'Read 30 pages',     cat: 'Reading',    target: 30, unit: 'pages',   color: 'info',    streak: 12, best: 31 },
    { id: 'h3', name: 'Meditate 10 min',   cat: 'Meditation', target: 10, unit: 'min',     color: 'plum',    streak: 8,  best: 22 },
    { id: 'h4', name: 'Workout',           cat: 'Fitness',    target: 1, unit: 'session',  color: 'warn',    streak: 5,  best: 18 },
    { id: 'h5', name: 'Revise notes',      cat: 'Study',      target: 1, unit: 'topic',    color: 'accent',  streak: 27, best: 27 },
    { id: 'h6', name: 'Sleep before 12',   cat: 'Health',     target: 1, unit: 'night',    color: 'danger',  streak: 3,  best: 14 },
  ];

  // Generate 365 days of habit completion data
  // Deterministic pseudo-random so the heatmap is stable
  const seedRand = (s) => { let x = s; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  const habitLog = {};
  habits.forEach((h, hi) => {
    const r = seedRand(31 + hi * 7);
    const log = {};
    for (let i = 365; i >= 0; i--) {
      const date = iso(addDays(TODAY, -i));
      // overall ramp: more recent = more likely
      const recency = 1 - i / 400;
      const base = 0.35 + 0.45 * recency;
      const v = r() < base ? Math.min(4, 1 + Math.floor(r() * 4)) : 0;
      log[date] = v;
    }
    // boost today/yesterday to look "lived in"
    log[iso(TODAY)] = hi < 4 ? Math.min(4, hi + 1) : 0;
    log[iso(addDays(TODAY, -1))] = 3;
    log[iso(addDays(TODAY, -2))] = 4;
    habitLog[h.id] = log;
  });

  // --- Tasks ---------------------------------------------------------------
  const tasks = [
    { id: 't1', title: 'Solve 5 graph problems',    list: 'Today',    cat: 'DSA',     priority: 'high',   due: iso(TODAY),               done: false, subtasks: [{t:'BFS shortest path',d:true},{t:'Topological sort',d:true},{t:'Union-find',d:false},{t:'Dijkstra variant',d:false},{t:'A* heuristic',d:false}] },
    { id: 't2', title: 'CN — TCP congestion control', list: 'Today',  cat: 'CN',      priority: 'medium', due: iso(TODAY),               done: false, subtasks: [{t:'Slow start',d:true},{t:'Reno vs Cubic',d:false}] },
    { id: 't3', title: 'OS revision — deadlocks',   list: 'Today',    cat: 'OS',      priority: 'medium', due: iso(TODAY),               done: true,  completedAt: iso(addDays(TODAY, -1)), subtasks: [] },
    { id: 't4', title: 'Mock test #12 review',      list: 'Today',    cat: 'GATE',    priority: 'high',   due: iso(TODAY),               done: false, subtasks: [] },
    { id: 't5', title: 'Update resume — projects',  list: 'This week',cat: 'Career',  priority: 'medium', due: iso(addDays(TODAY,2)),    done: false, subtasks: [] },
    { id: 't6', title: 'DBMS — normalization Qs',   list: 'This week',cat: 'DBMS',    priority: 'low',    due: iso(addDays(TODAY,3)),    done: false, subtasks: [] },
    { id: 't7', title: 'Read "Designing Data-Intensive Apps" ch.4', list: 'This week', cat: 'Reading', priority: 'low', due: iso(addDays(TODAY,4)), done: false, subtasks: [] },
    { id: 't8', title: 'System design — caching',   list: 'This week',cat: 'SD',      priority: 'medium', due: iso(addDays(TODAY,5)),    done: false, subtasks: [] },
    { id: 't9', title: 'Aptitude — 20 perm/comb',   list: 'Backlog',  cat: 'Apti',    priority: 'low',    due: iso(addDays(TODAY,9)),    done: false, subtasks: [] },
    { id: 't10',title: 'ML — gradient descent notes',list: 'Backlog', cat: 'AI/ML',   priority: 'low',    due: iso(addDays(TODAY,11)),   done: false, subtasks: [] },
    { id: 't11',title: 'Pay electricity bill',      list: 'Backlog',  cat: 'Life',    priority: 'medium', due: iso(addDays(TODAY,1)),    done: false, subtasks: [] },
    { id: 't12',title: 'Compiler design — parsing', list: 'Backlog',  cat: 'CD',      priority: 'low',    due: iso(addDays(TODAY,14)),   done: false, subtasks: [] },
  ];

  // --- Subjects (study tracker) ------------------------------------------
  const subjects = [
    { id: 's1', name: 'DSA',                  weight: 0.20, hoursLogged: 142, target: 180, mastery: 0.78, weakTopics: ['Segment trees', 'Heavy-light decomposition'] },
    { id: 's2', name: 'Operating Systems',    weight: 0.12, hoursLogged: 64,  target: 80,  mastery: 0.82, weakTopics: ['Banker\u2019s algorithm'] },
    { id: 's3', name: 'DBMS',                 weight: 0.10, hoursLogged: 52,  target: 70,  mastery: 0.71, weakTopics: ['Multivalued dependencies', 'B+ tree splits'] },
    { id: 's4', name: 'Computer Networks',    weight: 0.10, hoursLogged: 38,  target: 60,  mastery: 0.58, weakTopics: ['Subnetting math', 'TCP windowing'] },
    { id: 's5', name: 'Theory of Computation',weight: 0.08, hoursLogged: 22,  target: 45,  mastery: 0.41, weakTopics: ['Pumping lemma proofs', 'Decidability'] },
    { id: 's6', name: 'Compiler Design',      weight: 0.08, hoursLogged: 18,  target: 40,  mastery: 0.36, weakTopics: ['LR parsing', 'Code optimization'] },
    { id: 's7', name: 'Aptitude',             weight: 0.15, hoursLogged: 71,  target: 90,  mastery: 0.84, weakTopics: [] },
    { id: 's8', name: 'AI / ML',              weight: 0.10, hoursLogged: 33,  target: 50,  mastery: 0.62, weakTopics: ['Backprop math', 'SVM kernels'] },
    { id: 's9', name: 'Web Dev',              weight: 0.07, hoursLogged: 19,  target: 30,  mastery: 0.69, weakTopics: [] },
  ];

  // study hours per day (last 90)
  const studyDaily = (() => {
    const r = seedRand(99);
    const out = [];
    for (let i = 89; i >= 0; i--) {
      const day = addDays(TODAY, -i);
      const wd = day.getDay();
      const base = (wd === 0 || wd === 6) ? 5.5 : 3.8;
      const noise = (r() - 0.5) * 2.4;
      out.push({ date: iso(day), hours: Math.max(0, +(base + noise).toFixed(1)) });
    }
    return out;
  })();

  // --- Pomodoro sessions ---------------------------------------------------
  const focusSessions = [
    { id:'p1', subject:'DSA',  start:'08:10', mins: 25, completed:true  },
    { id:'p2', subject:'DSA',  start:'08:45', mins: 25, completed:true  },
    { id:'p3', subject:'OS',   start:'10:20', mins: 25, completed:true  },
    { id:'p4', subject:'CN',   start:'11:05', mins: 25, completed:false },
  ];

  // --- Calendar events -----------------------------------------------------
  const events = [
    { id:'e1', date: iso(TODAY),                title:'Mock test #13',         time:'18:00', kind:'test' },
    { id:'e2', date: iso(addDays(TODAY, 1)),    title:'DSA mentor call',       time:'19:30', kind:'meet' },
    { id:'e3', date: iso(addDays(TODAY, 3)),    title:'GATE registration',     time:'all-day', kind:'admin' },
    { id:'e4', date: iso(addDays(TODAY, 4)),    title:'Coding contest',        time:'20:00', kind:'event' },
    { id:'e5', date: iso(addDays(TODAY, 7)),    title:'Mock interview',        time:'17:00', kind:'meet' },
    { id:'e6', date: iso(addDays(TODAY, 10)),   title:'Semester project demo', time:'14:00', kind:'event' },
    { id:'e7', date: iso(addDays(TODAY, -1)),   title:'TOC revision',          time:'all-day', kind:'study' },
  ];

  // --- Fitness ------------------------------------------------------------
  const fitness = {
    weightKg: 68.4,
    targetKg: 66,
    heightCm: 175,
    streak: 18,
    today: {
      caloriesIn:  1420,  caloriesGoal: 2200,
      caloriesOut: 563,
      waterMl:     1750,  waterGoal: 2500,
      steps:       7842,  stepsGoal: 10000,
      distanceKm:  5.62,
      activeMin:   72,    activeGoal: 90,
      meals: [
        { id:'m1', name:'Oats + banana',          kcal: 320, when:'07:30', macros:{p:14,c:48,f:8} },
        { id:'m2', name:'Paneer wrap',            kcal: 480, when:'13:10', macros:{p:24,c:42,f:18} },
        { id:'m3', name:'Apple + almonds',        kcal: 220, when:'16:45', macros:{p:6,c:24,f:12} },
        { id:'m4', name:'Dal, rice, salad',       kcal: 400, when:'20:00', macros:{p:18,c:62,f:10} },
      ],
      workouts: [
        { id:'w1', name:'30-min run',     kcal: 280 },
        { id:'w2', name:'Push-ups (3x12)', kcal: 100 },
      ],
    },
    stepsWeek: [
      { d: 'Mon', steps: 8932 },
      { d: 'Tue', steps: 12456 },
      { d: 'Wed', steps: 9876 },
      { d: 'Thu', steps: 7842, today: true },
      { d: 'Fri', steps: 10231 },
      { d: 'Sat', steps: 11098 },
      { d: 'Sun', steps: 0, future: true },
    ],
    weightSeries: (() => {
      const r = seedRand(7);
      const arr = [];
      for (let i = 59; i >= 0; i--) arr.push({ date: iso(addDays(TODAY, -i)), kg: +(70.5 - (59 - i) * 0.035 + (r()-0.5) * 0.6).toFixed(1) });
      return arr;
    })(),
    plan: [
      { day: 'Monday',    group: 'Back & Biceps',     mins: '45–60', muscles: ['Back thickness', 'Biceps strength', 'Grip power'],
        exercises: ['Weighted pull-ups', 'Lat pulldown', 'T-bar row', 'Cable row', 'Deadlift', 'Barbell curl', 'Dumbbell curl', 'Hammer curl'] },
      { day: 'Tuesday',   group: 'Chest & Shoulders', mins: '45–60', muscles: ['Chest strength', 'Shoulder width', 'Upper body power'],
        exercises: ['Bench press', 'Incline dumbbell press', 'Pec deck fly', 'Weighted dips', 'Side lateral raise', 'Dumbbell press', 'Reverse fly', 'Shrugs'] },
      { day: 'Wednesday', group: 'Legs & Triceps',    mins: '60–75', muscles: ['Leg strength', 'Muscle growth', 'Triceps power'],
        exercises: ['Squat', 'Leg press', 'Romanian deadlift', 'Leg extension', 'Calf raises', 'V-bar overhead ext.', 'V-bar pushdown'] },
      { day: 'Thursday',  group: 'Back & Biceps',     mins: '45–60', muscles: ['Back thickness', 'Biceps isolation', 'Grip power'],
        exercises: ['Lat pulldown', 'Reverse grip pulldown', 'Cable row', 'Single-arm DB row', 'Preacher curl', 'Hammer curl', 'Dumbbell curl'] },
      { day: 'Friday',    group: 'Chest & Shoulders', mins: '45–60', muscles: ['Chest strength', 'Shoulder power', 'Upper body pump'],
        exercises: ['Flat dumbbell press', 'Dips', 'Incline Smith press', 'Dumbbell fly', 'Military press', 'Cable lateral raises', 'Face pull', 'Shrugs'] },
      { day: 'Saturday',  group: 'Legs & Triceps',    mins: '60–75', muscles: ['Leg strength', 'Calves', 'Triceps burn'],
        exercises: ['Front squat', 'Sumo squat', 'Leg curl', 'Calf raises', 'Cross cable tri. ext.', 'Rope pushdown'] },
    ],
    cardioDay: {
      day: 'Sunday',
      title: 'Full body cardio & endurance',
      total: '85 min',
      flow: [
        { name: 'Warm up', mins: 10, icon: 'sun' },
        { name: 'HIIT',    mins: 20, icon: 'flame' },
        { name: 'Cardio',  mins: 30, icon: 'heart' },
        { name: 'Core',    mins: 15, icon: 'target' },
        { name: 'Cool down', mins: 10, icon: 'moon' },
      ],
      benefits: ['Boost endurance', 'Burn calories', 'Improve stamina', 'Full body fat burn'],
    },
    monthlyStats: {
      workouts: 24,
      caloriesBurnt: 4250,
      activeTime: '12h 45m',
      totalSteps: 72654,
    },
    prs: [
      { exercise: 'Deadlift',    weight: 130, unit: 'kg', date: '2026-04-22' },
      { exercise: 'Bench press', weight: 82.5, unit: 'kg', date: '2026-05-08' },
      { exercise: 'Squat',       weight: 110, unit: 'kg', date: '2026-05-12' },
      { exercise: 'Pull-ups',    weight: 12,  unit: 'reps', date: '2026-05-14' },
    ],
  };

  // --- Achievements / Gamification ---------------------------------------
  const xp = { level: 14, current: 2840, nextLevel: 3200, totalEarned: 41280 };
  const badges = [
    { id:'b1', name:'First Light',     desc:'Completed your first habit',  unlocked:true,  date:'2026-01-08' },
    { id:'b2', name:'30-Day Spark',    desc:'30-day habit streak',         unlocked:true,  date:'2026-03-19' },
    { id:'b3', name:'Deep Diver',      desc:'4 focus sessions in one day', unlocked:true,  date:'2026-04-02' },
    { id:'b4', name:'Centurion',       desc:'100 problems solved',         unlocked:true,  date:'2026-04-28' },
    { id:'b5', name:'Polymath',        desc:'Study 5 subjects in a week',  unlocked:true,  date:'2026-05-12' },
    { id:'b6', name:'Iron Will',       desc:'100-day streak',              unlocked:false, progress: 0.41 },
    { id:'b7', name:'Night Owl Tamer', desc:'Sleep on time x14',           unlocked:false, progress: 0.21 },
    { id:'b8', name:'Marathoner',      desc:'200hrs studied in a month',   unlocked:false, progress: 0.72 },
  ];
  const challenges = [
    { id:'c1', name:'Solve 3 DSA today',  progress: 2, target: 3, xp: 60 },
    { id:'c2', name:'Hit 90 min focus',   progress: 75, target: 90, xp: 80 },
    { id:'c3', name:'Drink 2.5L water',   progress: 1.75, target: 2.5, xp: 40 },
  ];

  // --- Monthly goals -------------------------------------------------------
  const monthly = {
    month: 'May 2026',
    goals: [
      { id:'g1', name:'Finish DSA — graphs',     progress: 0.78 },
      { id:'g2', name:'Complete 4 mock tests',   progress: 0.75 },
      { id:'g3', name:'Avg 4h study/day',        progress: 0.62 },
      { id:'g4', name:'Lose 1.5 kg',             progress: 0.55 },
    ],
    stats: {
      productivityScore: 82,
      studyHours: 118.5,
      problemsSolved: 47,
      focusMinutes: 1840,
      consistency: 0.86,
    },
  };

  // --- Suggestions / AI ----------------------------------------------------
  const suggestions = [
    { id:'sg1', kind:'habit',  title:'Add an evening walk',     reason:'Your steps drop 31% after 6pm', cta:'Add habit' },
    { id:'sg2', kind:'study',  title:'Schedule TOC tomorrow',   reason:'Lowest mastery (41%) — slipping further', cta:'Schedule' },
    { id:'sg3', kind:'focus',  title:'Shift focus to mornings', reason:'You complete 2.3x more sessions before noon', cta:'Try it' },
    { id:'sg4', kind:'rest',   title:'Take a recovery day',     reason:'7 days without a rest day',     cta:'Plan rest' },
  ];

  const quotes = [
    { q: 'The expert in anything was once a beginner.',                a: 'Helen Hayes' },
    { q: 'Discipline equals freedom.',                                  a: 'Jocko Willink' },
    { q: 'Small daily improvements are the key to staggering results.', a: 'Robin Sharma' },
    { q: 'It always seems impossible until it\u2019s done.',            a: 'Nelson Mandela' },
  ];

  window.LATTICE_SEED = {
    TODAY: iso(TODAY),
    habits, habitLog,
    tasks,
    subjects, studyDaily,
    focusSessions,
    events,
    fitness,
    xp, badges, challenges,
    monthly,
    suggestions, quotes,
  };
})();
