const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware');

const COLORS = ['#ff6b6b', '#4ecdc4', '#a29bfe', '#ffe66d', '#fd79a8', '#55efc4', '#fdcb6e'];

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (role && !['admin', 'member'].includes(role)) return res.status(400).json({ error: 'Invalid role.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered.' });

  const hashed = bcrypt.hashSync(password, 10);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const result = db.prepare(
    'INSERT INTO users (name, email, password, role, color) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hashed, role || 'member', color);

  const user = db.prepare('SELECT id, name, email, role, color FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', require('../middleware').authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, color, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

module.exports = router;
