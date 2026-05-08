const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware');

const COLORS = ['#ff6b6b', '#4ecdc4', '#a29bfe', '#ffe66d', '#fd79a8', '#55efc4', '#fdcb6e'];

// GET /api/users - get all team members
router.get('/', authMiddleware, (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.color, u.created_at,
      (SELECT COUNT(*) FROM tasks WHERE assignee_id = u.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE assignee_id = u.id AND status = 'done') as done_count
    FROM users u ORDER BY u.role DESC, u.name ASC
  `).all();
  res.json(users);
});

// POST /api/users/invite - admin invites a new member
router.post('/invite', authMiddleware, adminOnly, (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered.' });

  const tempPassword = 'invited123';
  const hashed = bcrypt.hashSync(tempPassword, 10);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  const result = db.prepare(
    'INSERT INTO users (name, email, password, role, color) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hashed, 'member', color);

  const user = db.prepare('SELECT id, name, email, role, color FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...user, tempPassword });
});

// GET /api/users/stats - dashboard stats
router.get('/stats', authMiddleware, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const uid = req.user.id;

  const totalProjects = isAdmin
    ? db.prepare('SELECT COUNT(*) as c FROM projects').get().c
    : db.prepare('SELECT COUNT(*) as c FROM project_members WHERE user_id = ?').get(uid).c;

  const allTasks = isAdmin
    ? db.prepare('SELECT status, due_date FROM tasks').all()
    : db.prepare('SELECT status, due_date FROM tasks WHERE assignee_id = ?').all(uid);

  const today = new Date().toISOString().split('T')[0];
  const done = allTasks.filter(t => t.status === 'done').length;
  const inprogress = allTasks.filter(t => t.status === 'inprogress').length;
  const todo = allTasks.filter(t => t.status === 'todo').length;
  const overdue = allTasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < today).length;

  res.json({ totalProjects, total: allTasks.length, done, inprogress, todo, overdue });
});

module.exports = router;
