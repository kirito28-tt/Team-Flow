const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware');

// GET /api/tasks - get tasks (admin: all, member: assigned to them)
router.get('/', authMiddleware, (req, res) => {
  const { project_id, status, priority } = req.query;
  let query = `
    SELECT t.*, 
      u.name as assignee_name, u.color as assignee_color,
      p.name as project_name, p.emoji as project_emoji
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role !== 'admin') {
    query += ' AND t.assignee_id = ?';
    params.push(req.user.id);
  }
  if (project_id) { query += ' AND t.project_id = ?'; params.push(project_id); }
  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority); }

  query += ' ORDER BY t.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// POST /api/tasks - create task
router.post('/', authMiddleware, (req, res) => {
  const { title, description, project_id, assignee_id, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required.' });
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  const result = db.prepare(`
    INSERT INTO tasks (title, description, project_id, assignee_id, created_by, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, 'todo', ?)
  `).run(title, description || '', project_id, assignee_id || null, req.user.id, priority || 'medium', due_date || null);

  const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.color as assignee_color,
      p.name as project_name, p.emoji as project_emoji
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(task);
});

// PATCH /api/tasks/:id - update task status / fields
router.patch('/:id', authMiddleware, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  // Members can only update tasks assigned to them
  if (req.user.role !== 'admin' && task.assignee_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only update tasks assigned to you.' });
  }

  const { title, description, status, priority, assignee_id, due_date } = req.body;
  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  if (assignee_id !== undefined) { updates.push('assignee_id = ?'); params.push(assignee_id); }
  if (due_date !== undefined) { updates.push('due_date = ?'); params.push(due_date); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.color as assignee_color,
      p.name as project_name, p.emoji as project_emoji
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?
  `).get(req.params.id);

  res.json(updated);
});

// DELETE /api/tasks/:id (admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted.' });
});

module.exports = router;
