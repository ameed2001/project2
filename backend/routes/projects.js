const express = require('express');
const Project = require('../models/Project');
const router = express.Router();

// List projects (optionally by role/email/name)
router.get('/', async (req, res) => {
  try {
    const { role, email, name } = req.query;
    let filter = {};
    if (role === 'OWNER' && email) filter.linkedOwnerEmail = String(email).toLowerCase();
    if (role === 'ENGINEER' && name) filter.engineer = name;
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, projects });
  } catch (err) {
    console.error('[GET /projects] error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.json({ success: true, project });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body || {});
    return res.status(201).json({ success: true, project });
  } catch (err) {
    console.error('[POST /projects] error:', err);
    return res.status(400).json({ success: false, message: 'Failed to create project' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.json({ success: true, project });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to update project' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to delete project' });
  }
});

module.exports = router;


