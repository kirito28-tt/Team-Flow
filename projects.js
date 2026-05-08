const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware');

// GET /api/projects - get all projects
router.get('/', authMiddleware, (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = db.prepare(`
      SELECT p.*, u.name as creator_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `).all();
  } else {
    projects = db.prepare(`
      SELECT p.*, u.name as creator_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
      ORDER BY p.created_at DESC
    `).all(req.user.id);
  }

  // Attach members to each project
  const getMemberStmt = db.prepare(`
    SELECT u.id, u.name, u.color FROM users u
    JOIN project_members pm ON u.id = pm.user_id
    WHERE pm.project_id = ?
  `);
  projects = projects.map(p => ({ ...p, members: getMemberStmt.all(p.id) }));
  res.json(projects);
});

// POST /api/projects - create project (admin only)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, description, emoji, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required.' });

  const result = db.prepare(`
    INSERT INTO projects (name, description, emoji, color, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, description || '', emoji || '📁', color || '#4ecdc4', req.user.id);

  // Auto-add creator as member
  db.prepare('INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)').run(result.lastInsertRowid, req.user.id);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

// GET /api/projects/:id
router.get('/:id', authMiddleware, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.color, u.role FROM users u
    JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = ?
  `).all(project.id);
  const tasks = db.prepare(`
    SELECT t.*, u.name as assignee_name FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id WHERE t.project_id = ?
  `).all(project.id);
  res.json({ ...project, members, tasks });
});

// DELETE /api/projects/:id (admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project deleted.' });
});

// POST /api/projects/:id/members - add member to project
router.post('/:id/members', authMiddleware, adminOnly, (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });
  db.prepare('INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)').run(req.params.id, user_id);
  res.json({ message: 'Member added.' });
});

module.exports = router;
