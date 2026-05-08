const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Railway has ephemeral filesystem — use /tmp which is always writable
// Locally it will use the project root
let DB_PATH;
if (process.env.DB_PATH) {
  DB_PATH = process.env.DB_PATH;
} else if (process.env.RAILWAY_ENVIRONMENT) {
  DB_PATH = '/tmp/teamflow.db';
} else {
  DB_PATH = path.join(__dirname, '..', 'teamflow.db');
}

console.log(`🗄️  Using database at: ${DB_PATH}`);

let db;
try {
  db = new DatabaseSync(DB_PATH);
} catch (err) {
  console.warn('⚠️  Could not open DB at', DB_PATH, '— falling back to /tmp/teamflow.db');
  DB_PATH = '/tmp/teamflow.db';
  db = new DatabaseSync(DB_PATH);
}

// Enable foreign keys
try { db.exec('PRAGMA foreign_keys = ON'); } catch(e) {}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
    color TEXT NOT NULL DEFAULT '#4ecdc4',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    emoji TEXT DEFAULT '📁',
    color TEXT DEFAULT '#4ecdc4',
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    project_id INTEGER NOT NULL,
    assignee_id INTEGER,
    created_by INTEGER NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'inprogress', 'done')),
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Seed demo data if users table is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const adminPw = bcrypt.hashSync('admin123', 10);
  const memberPw = bcrypt.hashSync('member123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role, color) VALUES (?, ?, ?, ?, ?)'
  );

  const admin = insertUser.run('Alex Admin', 'admin@test.com', adminPw, 'admin', '#ff6b6b');
  const member = insertUser.run('Jamie Member', 'member@test.com', memberPw, 'member', '#a29bfe');

  const insertProject = db.prepare(
    'INSERT INTO projects (name, description, emoji, color, created_by) VALUES (?, ?, ?, ?, ?)'
  );

  const p1 = insertProject.run('Website Redesign', 'Give the site a proper glow-up', '🎨', '#ff6b6b', admin.lastInsertRowid);
  const p2 = insertProject.run('Mobile App v2', 'Android + iOS rebuild', '📱', '#4ecdc4', admin.lastInsertRowid);
  const p3 = insertProject.run('API Integration', 'Hook up third party services', '🔌', '#a29bfe', admin.lastInsertRowid);

  const insertMember = db.prepare('INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)');
  [p1, p2, p3].forEach(p => {
    insertMember.run(p.lastInsertRowid, admin.lastInsertRowid);
    insertMember.run(p.lastInsertRowid, member.lastInsertRowid);
  });

  const insertTask = db.prepare(
    'INSERT INTO tasks (title, project_id, assignee_id, created_by, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const aid = admin.lastInsertRowid;
  const mid = member.lastInsertRowid;
  const pid1 = p1.lastInsertRowid, pid2 = p2.lastInsertRowid, pid3 = p3.lastInsertRowid;

  insertTask.run('Design new landing page', pid1, mid, aid, 'high', 'inprogress', '2026-05-15');
  insertTask.run('Fix navbar on mobile', pid1, aid, aid, 'medium', 'todo', '2026-05-10');
  insertTask.run('Setup push notifications', pid2, mid, aid, 'high', 'todo', '2026-05-08');
  insertTask.run('Write API documentation', pid3, aid, aid, 'low', 'done', '2026-05-01');
  insertTask.run('User testing session', pid1, mid, aid, 'medium', 'done', '2026-04-28');
  insertTask.run('Setup Stripe payments', pid3, aid, aid, 'high', 'inprogress', '2026-05-12');
  insertTask.run('App store submission', pid2, mid, aid, 'high', 'todo', '2026-05-06');
  insertTask.run('Performance audit', pid1, aid, aid, 'medium', 'todo', '2026-05-20');

  console.log('✅ Database seeded with demo data');
}

module.exports = db;
