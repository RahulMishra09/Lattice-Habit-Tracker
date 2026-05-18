// db.js — MongoDB connection + Mongoose models + seed logic
const mongoose = require('mongoose');

// ── Connection ────────────────────────────────────────────────────────
async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(uri, {
    dbName: process.env.DB_NAME || 'lattice',
  });
  console.log('  MongoDB connected →', mongoose.connection.host);
}

// ── Schemas & Models ──────────────────────────────────────────────────

// Habit
const habitSchema = new mongoose.Schema({
  id:     { type: String, required: true, unique: true },
  name:   { type: String, required: true },
  cat:    { type: String, required: true },
  target: { type: Number, default: 1 },
  unit:   { type: String, default: 'session' },
  color:  { type: String, default: 'accent' },
  streak: { type: Number, default: 0 },
  best:   { type: Number, default: 0 },
  pos:    { type: Number, default: 0 },
}, { versionKey: false });

// HabitLog — one doc per (habit, date) pair
const habitLogSchema = new mongoose.Schema({
  habitId: { type: String, required: true },
  date:    { type: String, required: true },   // 'YYYY-MM-DD'
  value:   { type: Number, default: 0 },        // 0–4
}, { versionKey: false });
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

// Task
const subtaskSchema = new mongoose.Schema({ t: String, d: Boolean }, { _id: false });
const taskSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  title:    { type: String, required: true },
  list:     { type: String, default: 'Today' },
  cat:      { type: String, default: 'General' },
  priority: { type: String, default: 'medium' },
  due:      { type: String },
  done:     { type: Boolean, default: false },
  completedAt: { type: String, default: null },
  pos:      { type: Number, default: 0 },
  subtasks: { type: [subtaskSchema], default: [] },
}, { versionKey: false });

// AppConfig — single document holding all static/reference data
const appConfigSchema = new mongoose.Schema({
  _id:           { type: String, default: 'config' },
  TODAY:         String,
  subjects:      mongoose.Schema.Types.Mixed,
  studyDaily:    mongoose.Schema.Types.Mixed,
  focusSessions: mongoose.Schema.Types.Mixed,
  events:        mongoose.Schema.Types.Mixed,
  fitness:       mongoose.Schema.Types.Mixed,
  xp:            mongoose.Schema.Types.Mixed,
  badges:        mongoose.Schema.Types.Mixed,
  challenges:    mongoose.Schema.Types.Mixed,
  monthly:       mongoose.Schema.Types.Mixed,
  suggestions:   mongoose.Schema.Types.Mixed,
  quotes:        mongoose.Schema.Types.Mixed,
  dsaPatterns:      mongoose.Schema.Types.Mixed,
  dsaProgress:      mongoose.Schema.Types.Mixed,
  dsaHistory:       mongoose.Schema.Types.Mixed,
  fitnessProgress:  mongoose.Schema.Types.Mixed,
  backendTopics:    mongoose.Schema.Types.Mixed,  // static topic list
  backendProgress:  mongoose.Schema.Types.Mixed,  // { topicId: 'done'|'reading'|null }
  backendHistory:   mongoose.Schema.Types.Mixed,
  csTopics:         mongoose.Schema.Types.Mixed,
  csProgress:       mongoose.Schema.Types.Mixed,
  daTopics:         mongoose.Schema.Types.Mixed,
  daProgress:       mongoose.Schema.Types.Mixed,
  backendChapters:  mongoose.Schema.Types.Mixed,  // { topicId: [completedIndices] }
  csChapters:       mongoose.Schema.Types.Mixed,
  daChapters:       mongoose.Schema.Types.Mixed,
  gaTopics:         mongoose.Schema.Types.Mixed,
  gaProgress:       mongoose.Schema.Types.Mixed,
  gaChapters:       mongoose.Schema.Types.Mixed,
  timerState:       mongoose.Schema.Types.Mixed,
}, { versionKey: false });

const Habit     = mongoose.model('Habit',     habitSchema);
const HabitLog  = mongoose.model('HabitLog',  habitLogSchema);
const Task      = mongoose.model('Task',      taskSchema);
const AppConfig = mongoose.model('AppConfig', appConfigSchema);

// ── Seed ─────────────────────────────────────────────────────────────
async function seed() {
  const todayKey = new Date().toISOString().slice(0, 10);

  // ── Clear old fake demo data if it exists ──────────────────────────
  const fakeHabit = await Habit.findOne({ id: 'h1' });
  if (fakeHabit) {
    await Promise.all([
      Habit.deleteMany({}),
      HabitLog.deleteMany({}),
      Task.deleteMany({}),
    ]);
    console.log('  Cleared demo data');
  }

  // ── Ensure AppConfig exists (create empty if missing) ──────────────
  const configCount = await AppConfig.countDocuments();

  if (configCount === 0) {
    await AppConfig.create({
      _id:           'config',
      subjects:      [],
      studyDaily:    [],
      focusSessions: [],
      events:        [],
      fitness:       null,
      xp:            { level: 1, current: 0, nextLevel: 1000, totalEarned: 0 },
      badges:        [],
      challenges:    [],
      monthly:       { month: '', goals: [], stats: { productivityScore: 0, studyHours: 0, problemsSolved: 0, focusMinutes: 0, consistency: 0 } },
      suggestions:   [],
      quotes:        [],
      dsaPatterns:     DSA_PATTERNS,
      dsaProgress:     {},
      dsaHistory:      {},
      fitnessProgress: { weekKey: mondayKey(), completedExercises: {}, steps: 0, history: {} },
      backendTopics:   BACKEND_TOPICS,
      backendProgress: { 'be-http': 'done', 'be-routing': 'done' },
      backendHistory:  {},
      csTopics:        CS_TOPICS,
      csProgress:      {},
      daTopics:        DA_TOPICS,
      daProgress:      {},
      backendChapters: {},
      csChapters:      {},
      daChapters:      {},
      gaTopics:        GA_TOPICS,
      gaProgress:      {},
      gaChapters:      {},
    });
    console.log('  Created empty app config');
  }

  // ── Ensure DSA patterns exist in config ───────────────────────────
  const existing = await AppConfig.findById('config');
  if (existing && !existing.dsaPatterns) {
    existing.dsaPatterns = DSA_PATTERNS;
    existing.dsaProgress = existing.dsaProgress || {};
    existing.dsaHistory = existing.dsaHistory || {};
    existing.markModified('dsaPatterns');
    existing.markModified('dsaProgress');
    existing.markModified('dsaHistory');
    await existing.save();
    console.log('  Added DSA patterns to config');
  }

  // ── Migrate: add backendTopics / backendProgress if missing ──────
  if (existing && !existing.backendTopics) {
    existing.backendTopics   = BACKEND_TOPICS;
    existing.backendProgress = existing.backendProgress || { 'be-http': 'done', 'be-routing': 'done' };
    existing.backendHistory  = existing.backendHistory || {};
    existing.markModified('backendTopics');
    existing.markModified('backendProgress');
    existing.markModified('backendHistory');
    await existing.save();
    console.log('  Added Backend topics to config');
  }

  // ── Migrate: add GA topics if missing ────────────────────────────
  if (existing && !existing.gaTopics) {
    existing.gaTopics   = GA_TOPICS;
    existing.gaProgress = existing.gaProgress || {};
    existing.gaChapters = existing.gaChapters || {};
    existing.markModified('gaTopics');
    existing.markModified('gaProgress');
    existing.markModified('gaChapters');
    await existing.save();
    console.log('  Added GATE GA topics to config');
  }

  // ── Migrate: add chapter progress fields if missing ─────────────
  if (existing && !existing.backendChapters) {
    existing.backendChapters = {};
    existing.csChapters      = existing.csChapters  || {};
    existing.daChapters      = existing.daChapters  || {};
    existing.markModified('backendChapters');
    existing.markModified('csChapters');
    existing.markModified('daChapters');
    await existing.save();
    console.log('  Added chapter progress fields to config');
  }

  // ── Migrate: add CS / DA topics if missing ───────────────────────
  if (existing && !existing.csTopics) {
    existing.csTopics  = CS_TOPICS;
    existing.csProgress = existing.csProgress || {};
    existing.markModified('csTopics');
    existing.markModified('csProgress');
    await existing.save();
    console.log('  Added GATE CS topics to config');
  }
  if (existing && !existing.daTopics) {
    existing.daTopics  = DA_TOPICS;
    existing.daProgress = existing.daProgress || {};
    existing.markModified('daTopics');
    existing.markModified('daProgress');
    await existing.save();
    console.log('  Added GATE DA topics to config');
  }

  // ── Migrate: add fitnessProgress if missing or missing weekKey ───
  if (existing) {
    let needSave = false;
    if (!existing.dsaHistory) {
      existing.dsaHistory = Object.fromEntries(
        Object.entries(existing.dsaProgress || {}).filter(([, done]) => !!done).map(([id]) => [id, todayKey])
      );
      needSave = true;
    }
    if (!existing.backendHistory) {
      existing.backendHistory = Object.fromEntries(
        Object.entries(existing.backendProgress || {}).filter(([, status]) => status === 'done').map(([id]) => [id, todayKey])
      );
      needSave = true;
    }
    if (!existing.fitnessProgress) {
      existing.fitnessProgress = { weekKey: mondayKey(), completedExercises: {}, steps: 0, history: {} };
      needSave = true;
    } else if (!existing.fitnessProgress.weekKey) {
      const fp = { ...existing.fitnessProgress };
      fp.weekKey = mondayKey();
      fp.history = fp.history || {};
      existing.fitnessProgress = fp;
      needSave = true;
    }
    if (needSave) {
      existing.markModified('dsaHistory');
      existing.markModified('backendHistory');
      existing.markModified('fitnessProgress');
      await existing.save();
      console.log('  Migrated progress history fields');
    }
  }

  const tasksNeedingDate = await Task.find({ done: true, $or: [{ completedAt: null }, { completedAt: { $exists: false } }] });
  if (tasksNeedingDate.length > 0) {
    await Promise.all(tasksNeedingDate.map(task => {
      task.completedAt = task.due || todayKey;
      return task.save();
    }));
    console.log('  Backfilled task completion dates');
  }

  // ── Reset fake config data to empty (if old demo config exists) ───
  if (existing && existing.subjects && existing.subjects.length > 0 && existing.subjects[0].id === 's1') {
    await AppConfig.findByIdAndUpdate('config', {
      $set: {
        subjects:      [],
        studyDaily:    [],
        focusSessions: [],
        events:        [],
        fitness:       null,
        xp:            { level: 1, current: 0, nextLevel: 1000, totalEarned: 0 },
        badges:        [],
        challenges:    [],
        monthly:       { month: '', goals: [], stats: { productivityScore: 0, studyHours: 0, problemsSolved: 0, focusMinutes: 0, consistency: 0 } },
        suggestions:   [],
        quotes:        [],
      },
    });
    console.log('  Cleared demo config data');
  }
}

// ── DSA Patterns list ─────────────────────────────────────────────────
const DSA_PATTERNS = [
  { id:'cat-arrays', category:'Arrays & Strings',          color:'accent', patterns:[
    { id:'p-sw',       name:'Sliding Window' },
    { id:'p-tp',       name:'Two Pointers' },
    { id:'p-ps',       name:'Prefix Sum' },
    { id:'p-bsa',      name:'Binary Search on Answer' },
    { id:'p-kad',      name:"Kadane's Algorithm (Max Subarray)" },
    { id:'p-mi',       name:'Merge Intervals' },
    { id:'p-cs',       name:'Cyclic Sort' },
    { id:'p-ipr',      name:'In-place Reversal of Array' },
    { id:'p-fsp',      name:'Fast & Slow Pointers' },
  ]},
  { id:'cat-ll', category:'Linked List', color:'info', patterns:[
    { id:'p-ll-fsp',   name:'Fast and Slow Pointers' },
    { id:'p-ll-rev',   name:'Reversal of Linked List' },
    { id:'p-ll-mg',    name:'Merge Two Lists' },
    { id:'p-ll-dc',    name:'Detect Cycle' },
    { id:'p-ll-dn',    name:'Dummy Node Pattern' },
    { id:'p-ll-rn',    name:'Remove N-th Node' },
    { id:'p-ll-add',   name:'Add Two Numbers as Linked List' },
  ]},
  { id:'cat-tree', category:'Trees / Binary Trees / BST',  color:'plum', patterns:[
    { id:'p-tr-dfs',   name:'DFS (Inorder, Preorder, Postorder)' },
    { id:'p-tr-bfs',   name:'BFS (Level Order)' },
    { id:'p-tr-rec',   name:'Recursive Tree Traversal' },
    { id:'p-tr-iter',  name:'Iterative Tree Traversal (Stack)' },
    { id:'p-tr-lca',   name:'Lowest Common Ancestor' },
    { id:'p-tr-dia',   name:'Diameter of Tree' },
    { id:'p-tr-bst',   name:'Validate BST' },
    { id:'p-tr-con',   name:'Construct Tree from Traversals' },
  ]},
  { id:'cat-bt', category:'Recursion / Backtracking',      color:'warn', patterns:[
    { id:'p-bt-tmpl',  name:'Backtracking Template' },
    { id:'p-bt-sub',   name:'Subsets / Combinations' },
    { id:'p-bt-perm',  name:'Permutations' },
    { id:'p-bt-nq',    name:'N-Queens Problem' },
    { id:'p-bt-su',    name:'Sudoku Solver' },
    { id:'p-bt-ws',    name:'Word Search' },
  ]},
  { id:'cat-dp', category:'Dynamic Programming',           color:'accent', patterns:[
    { id:'p-dp-01k',   name:'0/1 Knapsack' },
    { id:'p-dp-ubk',   name:'Unbounded Knapsack' },
    { id:'p-dp-lcs',   name:'LCS (Longest Common Subsequence)' },
    { id:'p-dp-lis',   name:'LIS (Longest Increasing Subsequence)' },
    { id:'p-dp-mat',   name:'Matrix DP (Grid-Based)' },
    { id:'p-dp-pal',   name:'Palindromic Substring / Subsequence' },
    { id:'p-dp-ed',    name:'Edit Distance' },
    { id:'p-dp-par',   name:'Partition DP' },
    { id:'p-dp-bm',    name:'DP with Bitmasking' },
  ]},
  { id:'cat-math', category:'Math & Bit Manipulation',     color:'info', patterns:[
    { id:'p-mb-bm',    name:'Bitmasking Pattern' },
    { id:'p-mb-siev',  name:'Sieve of Eratosthenes' },
    { id:'p-mb-gcd',   name:'GCD / LCM' },
    { id:'p-mb-pow',   name:'Fast Exponentiation' },
    { id:'p-mb-mod',   name:'Modular Arithmetic' },
    { id:'p-mb-xor',   name:'XOR Tricks' },
  ]},
  { id:'cat-hash', category:'Hashing / HashMap / Set',     color:'plum', patterns:[
    { id:'p-hm-freq',  name:'Hashmap for Frequency Counting' },
    { id:'p-hm-set',   name:'HashSet for Uniqueness' },
    { id:'p-hm-sw',    name:'Hashing + Sliding Window' },
    { id:'p-hm-ps',    name:'Hashing + Prefix Sum' },
    { id:'p-hm-mem',   name:'Hashmap for Memoization (DP)' },
  ]},
  { id:'cat-stk', category:'Stack / Queue / Deque',        color:'warn', patterns:[
    { id:'p-sq-ms',    name:'Monotonic Stack' },
    { id:'p-sq-mq',    name:'Monotonic Queue' },
    { id:'p-sq-nge',   name:'Next Greater Element' },
    { id:'p-sq-dt',    name:'Daily Temperatures' },
    { id:'p-sq-lrh',   name:'Largest Rectangle in Histogram' },
    { id:'p-sq-vp',    name:'Valid Parentheses' },
    { id:'p-sq-eval',  name:'Stack for Evaluation (Prefix/Infix/Postfix)' },
    { id:'p-sq-dq',    name:'Deque for Sliding Window Maximum' },
  ]},
  { id:'cat-heap', category:'Heap / Priority Queue',       color:'accent', patterns:[
    { id:'p-hp-mm',    name:'Min/Max Heap Pattern' },
    { id:'p-hp-tk',    name:'Top K Elements' },
    { id:'p-hp-med',   name:'Median from Data Stream' },
    { id:'p-hp-mk',    name:'Merge K Sorted Lists' },
    { id:'p-hp-kcp',   name:'K Closest Points' },
  ]},
  { id:'cat-graph', category:'Graphs',                     color:'info', patterns:[
    { id:'p-gr-dfs',   name:'DFS for Graphs' },
    { id:'p-gr-bfs',   name:'BFS for Graphs' },
    { id:'p-gr-dsu',   name:'Union Find (DSU)' },
    { id:'p-gr-top',   name:'Topological Sort (Kahn\'s + DFS)' },
    { id:'p-gr-dij',   name:"Dijkstra's Algorithm" },
    { id:'p-gr-bf',    name:'Bellman-Ford' },
    { id:'p-gr-fw',    name:'Floyd-Warshall' },
    { id:'p-gr-cd',    name:'Cycle Detection (Directed & Undirected)' },
    { id:'p-gr-bi',    name:'Bipartite Graph Check' },
    { id:'p-gr-ni',    name:'Number of Islands / Connected Components' },
  ]},
  { id:'cat-trie', category:'Trie / Advanced Strings',     color:'plum', patterns:[
    { id:'p-tr2-trie', name:'Trie (Prefix Tree)' },
    { id:'p-tr2-lpm',  name:'Longest Prefix Matching' },
    { id:'p-tr2-wdw',  name:'Word Dictionary with Wildcards' },
    { id:'p-tr2-aho',  name:'Aho-Corasick Algorithm' },
    { id:'p-tr2-rk',   name:'Rabin-Karp' },
    { id:'p-tr2-kmp',  name:'KMP (Knuth-Morris-Pratt)' },
    { id:'p-tr2-z',    name:'Z-Algorithm' },
  ]},
];

// ── Backend Engineering Topics ────────────────────────────────────────
const BACKEND_TOPICS = [
  { id:'be-cat-fund', category:'Fundamentals', color:'accent', topics:[
    { id:'be-http',    name:'HTTP Protocol',                  chapters:['HTTP Fundamentals','Request-Response Cycle','HTTP Headers Deep Dive','HTTP Status Codes','HTTP Methods & Security','Advanced HTTP Concepts'] },
    { id:'be-routing', name:'Routing',                        chapters:['Routing Overview','HTTP Methods & Request Flow','Routing Patterns & Best Practices','Middleware Integration','Advanced Routing Concepts'] },
    { id:'be-roadmap', name:'Backend Roadmap Introduction',   chapters:['High-Level Understanding of Backend Systems'] },
  ]},
  { id:'be-cat-data', category:'Data Handling', color:'info', topics:[
    { id:'be-serial',  name:'Serialization & Deserialization', chapters:['JSON, XML, Protocol Buffers','Binary vs Text formats','Performance considerations'] },
  ]},
  { id:'be-cat-auth', category:'Security & Access Control', color:'warn', topics:[
    { id:'be-auth',    name:'Authentication & Authorization',  chapters:['JWT & Session-based auth','OAuth 2.0','RBAC & Permission systems','Multi-factor authentication (MFA)'] },
  ]},
  { id:'be-cat-input', category:'Input Handling', color:'plum', topics:[
    { id:'be-valid',   name:'Validation & Transformation',     chapters:['Input validation strategies','Data sanitization','Schema validation','Type coercion'] },
  ]},
  { id:'be-cat-arch', category:'Backend Architecture', color:'accent', topics:[
    { id:'be-middle',  name:'Middlewares',                     chapters:['Authentication middleware','Logging middleware','Error handling middleware','Custom middleware patterns'] },
    { id:'be-ctx',     name:'Request Context',                 chapters:['Context propagation','Request lifecycle','Context values and scoping'] },
    { id:'be-ctrl',    name:'Handlers, Controllers & Services',chapters:['Separation of concerns','MVC pattern','Service layer architecture','Dependency injection'] },
  ]},
  { id:'be-cat-api', category:'API & CRUD', color:'info', topics:[
    { id:'be-crud',    name:'CRUD Deep Dive',                  chapters:['Create / Read / Update / Delete','Batch operations','Soft deletes','Audit trails'] },
    { id:'be-rest',    name:'RESTful Architecture',            chapters:['REST principles','Resource modeling','Versioning strategies','HATEOAS'] },
  ]},
  { id:'be-cat-db', category:'Data Layer', color:'warn', topics:[
    { id:'be-sql',     name:'Relational Databases',            chapters:['SQL fundamentals','Indexing strategies','Query optimization','Transactions & ACID'] },
    { id:'be-nosql',   name:'NoSQL Databases',                 chapters:['Document stores (MongoDB)','Key-value stores (Redis)','When to use NoSQL'] },
    { id:'be-dbdesign',name:'Database Design',                 chapters:['Normalization','Denormalization','Schema design patterns'] },
    { id:'be-orm',     name:'ORMs & Query Builders',           chapters:['Sequelize, TypeORM, Prisma','Raw queries vs ORM','Migration strategies'] },
  ]},
  { id:'be-cat-bll', category:'Application Logic', color:'plum', topics:[
    { id:'be-bll',     name:'Business Logic Layer',            chapters:['Domain-driven design','Business rules implementation','Service layer patterns','Use cases and interactors'] },
  ]},
  { id:'be-cat-perf', category:'Performance Optimization', color:'accent', topics:[
    { id:'be-cache',   name:'Caching',                         chapters:['Cache-aside / Write-through / Write-behind','Application & DB & CDN cache','Redis & Memcached','TTL & Cache eviction policies'] },
  ]},
  { id:'be-cat-comm', category:'Communication Systems', color:'info', topics:[
    { id:'be-email',   name:'Transactional Emails',            chapters:['Email service providers','Template management','Delivery tracking','Email queuing'] },
  ]},
  { id:'be-cat-async', category:'Async Processing', color:'warn', topics:[
    { id:'be-queue',   name:'Task Queuing & Scheduling',       chapters:['RabbitMQ / Kafka / AWS SQS','Cron jobs & task schedulers','Producer-consumer','Pub-Sub','Request-Reply'] },
  ]},
  { id:'be-cat-search', category:'Search Systems', color:'plum', topics:[
    { id:'be-elastic', name:'Elasticsearch',                   chapters:['Full-text search','Indexing strategies','Query DSL','Aggregations','Performance tuning'] },
  ]},
  { id:'be-cat-rel', category:'Reliability', color:'accent', topics:[
    { id:'be-errors',  name:'Error Handling',                  chapters:['Error types & classification','Global error handlers','Custom error classes','Retry mechanisms','Circuit breakers'] },
  ]},
  { id:'be-cat-cfg', category:'System Configuration', color:'info', topics:[
    { id:'be-config',  name:'Config Management',               chapters:['Environment variables','Configuration files','Secret management','Feature flags','Multi-environment setup'] },
  ]},
  { id:'be-cat-obs', category:'Observability', color:'warn', topics:[
    { id:'be-obs',     name:'Logging, Monitoring & Observability', chapters:['Structured logging','Metrics collection & APM','Distributed tracing','OpenTelemetry'] },
  ]},
  { id:'be-cat-life', category:'System Lifecycle', color:'plum', topics:[
    { id:'be-shutdown',name:'Graceful Shutdown',               chapters:['Connection draining','Cleanup procedures','Signal handling','Zero-downtime deployments'] },
  ]},
  { id:'be-cat-sec', category:'Advanced Security', color:'accent', topics:[
    { id:'be-sec',     name:'Security Best Practices',         chapters:['OWASP Top 10','SQL injection & XSS prevention','Rate limiting & API keys','Encryption at rest & in transit','DDoS protection'] },
  ]},
  { id:'be-cat-scale', category:'Scalability', color:'info', topics:[
    { id:'be-scale',   name:'Scaling & Performance',           chapters:['Horizontal vs Vertical Scaling','Load Balancing strategies','Read replicas & Sharding','Profiling & N+1 problem'] },
  ]},
  { id:'be-cat-conc', category:'Execution Models', color:'warn', topics:[
    { id:'be-conc',    name:'Concurrency & Parallelism',       chapters:['Threads vs Processes','Async/await patterns','Event loops','Worker pools','Deadlock prevention'] },
  ]},
  { id:'be-cat-store', category:'Storage', color:'plum', topics:[
    { id:'be-s3',      name:'Object Storage & Large Files',    chapters:['AWS S3 / Azure Blob / GCS','CDN integration','Upload strategies','Presigned URLs'] },
  ]},
  { id:'be-cat-rt', category:'Real-Time Systems', color:'accent', topics:[
    { id:'be-ws',      name:'Real-time Backend Systems',       chapters:['WebSockets','Server-Sent Events (SSE)','Long polling','Pub-Sub patterns','Socket.io'] },
  ]},
  { id:'be-cat-test', category:'Code Quality', color:'info', topics:[
    { id:'be-test',    name:'Testing & Code Quality',          chapters:['Unit / Integration / E2E testing','Jest, Mocha, Chai, Supertest','ESLint & Prettier','Code coverage & static analysis'] },
  ]},
  { id:'be-cat-12f', category:'Architecture Principles', color:'warn', topics:[
    { id:'be-12f',     name:'12 Factor App',                   chapters:['Codebase & Dependencies','Config & Backing Services','Build-Release-Run','Processes & Port Binding','Logs & Admin Processes'] },
  ]},
  { id:'be-cat-oas', category:'API Standards', color:'plum', topics:[
    { id:'be-oas',     name:'OpenAPI Standards',               chapters:['OpenAPI Specification (OAS)','Swagger documentation','API versioning','API design patterns'] },
  ]},
  { id:'be-cat-hook', category:'Integrations', color:'accent', topics:[
    { id:'be-hooks',   name:'Webhooks',                        chapters:['Webhook design','Security & verification','Retry mechanisms','Event-driven architecture'] },
  ]},
  { id:'be-cat-devops', category:'DevOps for Backend', color:'info', topics:[
    { id:'be-docker',  name:'Containerization',                chapters:['Docker','Docker Compose','Container orchestration (K8s)'] },
    { id:'be-cicd',    name:'CI/CD Pipelines',                 chapters:['GitHub Actions','Jenkins / GitLab CI','Infrastructure as Code (Terraform)'] },
    { id:'be-cloud',   name:'Cloud Platforms',                 chapters:['AWS core services','Azure fundamentals','Google Cloud Platform','Monitoring with Prometheus & Grafana'] },
  ]},
];

// ── GATE CS Topics ────────────────────────────────────────────────────
const CS_TOPICS = [
  { id:'cs-s1', category:'Engineering Mathematics', topics:[
    { id:'cs-discmath', name:'Discrete Mathematics', chapters:['Propositional and first order logic','Sets, relations, functions, partial orders and lattices','Monoids, Groups','Graphs: connectivity, matching, coloring','Combinatorics: counting, recurrence relations, generating functions'] },
    { id:'cs-linalg',   name:'Linear Algebra',       chapters:['Matrices and determinants','System of linear equations','Eigenvalues and eigenvectors','LU decomposition'] },
    { id:'cs-calc',     name:'Calculus',              chapters:['Limits, continuity and differentiability','Maxima and minima','Mean value theorem','Integration'] },
    { id:'cs-prob',     name:'Probability & Statistics', chapters:['Random variables','Uniform, normal, exponential, Poisson and binomial distributions','Mean, median, mode and standard deviation','Conditional probability and Bayes theorem'] },
  ]},
  { id:'cs-s2', category:'Digital Logic', topics:[
    { id:'cs-bool',    name:'Boolean Algebra',                  chapters:['Boolean algebra fundamentals','Minimization (K-Map, Quine-McCluskey)'] },
    { id:'cs-circuit', name:'Combinational & Sequential Circuits', chapters:['Combinational circuits design','Sequential circuits and flip-flops','Registers and counters'] },
    { id:'cs-numrep',  name:'Number Representations',           chapters:['Fixed point representation','Floating point representation','Computer arithmetic'] },
  ]},
  { id:'cs-s3', category:'Computer Organization & Architecture', topics:[
    { id:'cs-instr',  name:'Machine Instructions & Addressing', chapters:['Instruction formats','Addressing modes','Instruction execution cycle'] },
    { id:'cs-alu',    name:'ALU, Data-path & Control Unit',     chapters:['ALU design','Data-path organization','Hardwired and microprogrammed control unit'] },
    { id:'cs-pipe',   name:'Instruction Pipelining',            chapters:['Pipeline stages','Structural, data and control hazards','Hazard mitigation (forwarding, stalling, branch prediction)'] },
    { id:'cs-mem',    name:'Memory Hierarchy',                  chapters:['Cache memory: mapping and replacement policies','Main memory organization','Secondary storage','Virtual memory and paging'] },
    { id:'cs-io',     name:'I/O Interface',                     chapters:['Interrupt-driven I/O','DMA mode','I/O channels and controllers'] },
  ]},
  { id:'cs-s4', category:'Programming & Data Structures', topics:[
    { id:'cs-cprog',     name:'Programming in C & Recursion',    chapters:['C fundamentals and pointers','Memory management','Recursion and recursive algorithms'] },
    { id:'cs-linear',    name:'Linear Data Structures',          chapters:['Arrays','Stacks and queues','Linked lists (singly, doubly, circular)'] },
    { id:'cs-nonlinear', name:'Trees & Graphs',                  chapters:['Binary trees and traversals','Binary search trees (BST)','Binary heaps','Graph representations'] },
  ]},
  { id:'cs-s5', category:'Algorithms', topics:[
    { id:'cs-search',     name:'Searching, Sorting & Hashing',   chapters:['Linear and binary search','Comparison-based sorting (QuickSort, MergeSort, HeapSort)','Hashing and collision resolution'] },
    { id:'cs-complex',    name:'Asymptotic Complexity',           chapters:['Time complexity analysis (Big-O, Theta, Omega)','Space complexity','Recurrence relations'] },
    { id:'cs-design',     name:'Algorithm Design Techniques',     chapters:['Greedy algorithms','Dynamic programming','Divide and conquer'] },
    { id:'cs-graphalgo',  name:'Graph Algorithms',                chapters:['BFS and DFS','Minimum spanning trees (Kruskal, Prim)','Shortest paths (Dijkstra, Bellman-Ford, Floyd-Warshall)'] },
  ]},
  { id:'cs-s6', category:'Theory of Computation', topics:[
    { id:'cs-regex',  name:'Regular Languages & Finite Automata', chapters:['Regular expressions','DFA and NFA','Regular grammar and pumping lemma'] },
    { id:'cs-cfg',    name:'Context-Free Languages',              chapters:['Context-free grammars (CFG)','Push-down automata (PDA)','Pumping lemma for CFLs'] },
    { id:'cs-turing', name:'Turing Machines & Undecidability',    chapters:['Turing machine model','Decidability and undecidability','Halting problem and reductions'] },
  ]},
  { id:'cs-s7', category:'Compiler Design', topics:[
    { id:'cs-lexparse', name:'Lexical Analysis & Parsing',         chapters:['Lexical analysis and tokenization','Top-down parsing (LL grammars)','Bottom-up parsing (LR, LALR)'] },
    { id:'cs-sdt',      name:'Syntax-Directed Translation',        chapters:['SDT schemes and attribute grammars','Semantic actions','Type checking'] },
    { id:'cs-codegen',  name:'Code Generation & Optimization',     chapters:['Runtime environments and activation records','Intermediate code (3-address code)','Local optimisation','Data flow analyses: constant propagation, liveness analysis, CSE'] },
  ]},
  { id:'cs-s8', category:'Operating Systems', topics:[
    { id:'cs-proc',    name:'Processes, Threads & IPC',  chapters:['Process concepts and states','Threads and multithreading models','System calls','Inter-process communication (pipes, shared memory, message passing)'] },
    { id:'cs-sync',    name:'Concurrency & Synchronization', chapters:['Critical section problem','Semaphores and monitors','Classic problems (Producer-Consumer, Readers-Writers, Dining Philosophers)','Deadlock: detection, prevention and avoidance (Bankers algorithm)'] },
    { id:'cs-sched',   name:'CPU & I/O Scheduling',       chapters:['FCFS, SJF, Round Robin, Priority scheduling','Multilevel queues','I/O scheduling algorithms'] },
    { id:'cs-memmgmt', name:'Memory Management',          chapters:['Paging and segmentation','Page replacement (FIFO, LRU, Optimal)','Virtual memory and demand paging','Thrashing and working set model'] },
    { id:'cs-fs',      name:'File Systems',               chapters:['File organization and access methods','Directory structures','File allocation: contiguous, linked, indexed','Disk management and RAID'] },
  ]},
  { id:'cs-s9', category:'Databases', topics:[
    { id:'cs-erm',   name:'ER & Relational Model',          chapters:['ER-model concepts and diagrams','Relational model','Relational algebra and tuple calculus'] },
    { id:'cs-sql',   name:'SQL & Integrity',                chapters:['SQL: DDL, DML, DCL','Integrity constraints','Normal forms: 1NF, 2NF, 3NF, BCNF'] },
    { id:'cs-index', name:'Storage & Indexing',             chapters:['File organization','B-trees and B+-trees','Hashing for indexing'] },
    { id:'cs-txn',   name:'Transactions & Concurrency',     chapters:['ACID properties','Serializability','Concurrency control: locking (2PL), MVCC','Recovery: log-based, checkpointing'] },
  ]},
  { id:'cs-s10', category:'Computer Networks', topics:[
    { id:'cs-layers',    name:'Network Layering',     chapters:['OSI model (7 layers)','TCP/IP protocol stack','Packet, circuit and virtual circuit-switching'] },
    { id:'cs-dll',       name:'Data Link Layer',      chapters:['Framing and error detection (CRC, parity)','Medium Access Control (CSMA/CD, CSMA/CA)','Ethernet and bridging'] },
    { id:'cs-routing',   name:'Routing & IP',         chapters:['Routing protocols: shortest path, flooding, distance vector, link state','IPv4 addressing and CIDR notation','ARP, DHCP, ICMP','Network Address Translation (NAT)'] },
    { id:'cs-transport', name:'Transport Layer',      chapters:['Flow control and congestion control','UDP','TCP: connection management, sliding window, congestion control','Sockets programming'] },
    { id:'cs-applayer',  name:'Application Layer',    chapters:['DNS','HTTP and HTTPS','SMTP and email protocols','FTP'] },
  ]},
];

// ── GATE DA Topics ────────────────────────────────────────────────────
const DA_TOPICS = [
  { id:'da-s1', category:'Probability & Statistics', topics:[
    { id:'da-counting', name:'Counting & Combinatorics', chapters:['Permutations and combinations','Counting principles and pigeonhole'] },
    { id:'da-probfund', name:'Probability Fundamentals', chapters:['Probability axioms and sample space','Independent and mutually exclusive events','Marginal, conditional and joint probability','Bayes Theorem and conditional expectation'] },
    { id:'da-randvar',  name:'Random Variables & Distributions', chapters:['Discrete RVs: uniform, Bernoulli, binomial distributions','Continuous RVs: uniform, exponential, Poisson, normal, t-distribution, chi-squared','CDF and Conditional PDF','Central limit theorem','Confidence intervals'] },
    { id:'da-stats',    name:'Statistical Measures & Hypothesis Testing', chapters:['Mean, median, mode and standard deviation','Correlation and covariance','z-test, t-test, chi-squared test'] },
  ]},
  { id:'da-s2', category:'Linear Algebra', topics:[
    { id:'da-vecspace',  name:'Vector Spaces',              chapters:['Vector space and subspaces','Linear dependence and independence','Basis and dimension'] },
    { id:'da-matrices',  name:'Matrices & Properties',      chapters:['Projection, orthogonal, idempotent and partition matrices','Quadratic forms','Determinant, rank, nullity'] },
    { id:'da-lineq',     name:'Systems of Linear Equations', chapters:['Gaussian elimination','Solution methods and projections'] },
    { id:'da-eigdecomp', name:'Eigenvalues & Decompositions', chapters:['Eigenvalues and eigenvectors','LU decomposition','Singular value decomposition (SVD)'] },
  ]},
  { id:'da-s3', category:'Calculus & Optimization', topics:[
    { id:'da-calcfund', name:'Calculus Fundamentals', chapters:['Functions of a single variable','Limit, continuity and differentiability','Taylor series'] },
    { id:'da-optim',    name:'Optimization',          chapters:['Maxima and minima','Optimization of single-variable functions'] },
  ]},
  { id:'da-s4', category:'Programming, DSA & Algorithms', topics:[
    { id:'da-python', name:'Programming in Python',         chapters:['Python fundamentals','Data manipulation and NumPy/Pandas','Algorithmic thinking in Python'] },
    { id:'da-ds',     name:'Basic Data Structures',          chapters:['Stacks, queues, linked lists','Trees and hash tables'] },
    { id:'da-algos',  name:'Search, Sort & Graph Algorithms', chapters:['Linear search and binary search','Selection, bubble and insertion sort','Divide and conquer: mergesort, quicksort','Introduction to graph theory','Graph traversals and shortest path'] },
  ]},
  { id:'da-s5', category:'Database Management & Warehousing', topics:[
    { id:'da-db',        name:'Database Fundamentals',  chapters:['ER-model and relational model','Relational algebra and tuple calculus','SQL and integrity constraints','Normal forms and file organization','Indexing'] },
    { id:'da-transform', name:'Data Transformation',    chapters:['Normalization, discretization, sampling, compression','Data types and preprocessing'] },
    { id:'da-warehouse', name:'Data Warehousing',       chapters:['Schema for multidimensional data models','Concept hierarchies','Measures: categorization and computations'] },
  ]},
  { id:'da-s6', category:'Machine Learning', topics:[
    { id:'da-regression', name:'Regression',             chapters:['Simple and multiple linear regression','Ridge regression'] },
    { id:'da-classif',    name:'Classification Algorithms', chapters:['Logistic regression','K-nearest neighbour (KNN)','Naive Bayes classifier','Linear discriminant analysis','Support vector machine (SVM)','Decision trees'] },
    { id:'da-modeval',    name:'Model Evaluation',        chapters:['Bias-variance trade-off','Leave-one-out (LOO) cross-validation','k-folds cross-validation'] },
    { id:'da-nn',         name:'Neural Networks',         chapters:['Multi-layer perceptron (MLP)','Feed-forward neural networks','Backpropagation basics'] },
    { id:'da-unsup',      name:'Unsupervised Learning',   chapters:['k-means and k-medoid clustering','Hierarchical clustering: single-linkage, multiple-linkage','Dimensionality reduction','Principal component analysis (PCA)'] },
  ]},
  { id:'da-s7', category:'Artificial Intelligence', topics:[
    { id:'da-search',      name:'Search Algorithms',          chapters:['Uninformed search (BFS, DFS, iterative deepening)','Informed search (A*, greedy best-first)','Adversarial search (minimax, alpha-beta pruning)'] },
    { id:'da-logic',       name:'Logic',                      chapters:['Propositional logic','Predicate logic and quantifiers','Knowledge representation and reasoning'] },
    { id:'da-uncertainty', name:'Reasoning Under Uncertainty', chapters:['Conditional independence representation','Bayesian networks','Exact inference through variable elimination','Approximate inference through sampling'] },
  ]},
];

// ── GATE GA Topics ────────────────────────────────────────────────────
const GA_TOPICS = [
  { id:'ga-s1', category:'Verbal Aptitude', topics:[
    { id:'ga-grammar', name:'Basic English Grammar', chapters:['Tenses (present, past, future)','Articles (a, an, the)','Adjectives and adverbs','Prepositions','Conjunctions','Verb-noun agreement','Other parts of speech'] },
    { id:'ga-vocab',   name:'Basic Vocabulary',      chapters:['Words in context','Idioms and phrases','Synonyms and antonyms','One-word substitution'] },
    { id:'ga-reading', name:'Reading Comprehension & Narrative Sequencing', chapters:['Reading comprehension passages','Inference and interpretation','Narrative sequencing','Sentence ordering'] },
  ]},
  { id:'ga-s2', category:'Quantitative Aptitude', topics:[
    { id:'ga-dataint', name:'Data Interpretation', chapters:['Bar graphs and pie charts','Line graphs and scatter plots','2D and 3D plots','Maps and tables','Data sufficiency'] },
    { id:'ga-numcomp', name:'Numerical Computation & Estimation', chapters:['Ratios and proportions','Percentages','Powers, exponents and logarithms','Permutations and combinations','Series and sequences','Mensuration: area, volume, perimeter','Geometry: triangles, circles, polygons','Elementary statistics: mean, median, mode','Elementary probability'] },
  ]},
  { id:'ga-s3', category:'Analytical Aptitude', topics:[
    { id:'ga-logic', name:'Logic & Reasoning', chapters:['Deductive reasoning','Inductive reasoning','Analogy (verbal, numerical, figural)','Numerical relations and reasoning','Syllogisms','Critical reasoning'] },
  ]},
  { id:'ga-s4', category:'Spatial Aptitude', topics:[
    { id:'ga-spatial', name:'Transformation of Shapes', chapters:['Translation and rotation','Scaling and mirroring','Assembling and grouping shapes','Paper folding and cutting','Patterns in 2D','Patterns in 3D','Cube and dice problems'] },
  ]},
];

// ── Helpers ───────────────────────────────────────────────────────────
function mondayKey(date) {
  const d = new Date(date || Date.now());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

module.exports = { connect, seed, Habit, HabitLog, Task, AppConfig };
