const express = require('express');
const Project = require('../models/Project');
const router = express.Router();

// List projects (optionally by role/email/name)
router.get('/', async (req, res) => {
  try {
    const { role, email, name, userId, userEmail, userRole } = req.query;
    let filter = {};
    
    // If userRole is OWNER and userEmail is provided, show projects linked to that owner
    if (userRole === 'OWNER' && userEmail) {
      filter.linkedOwnerEmail = String(userEmail).toLowerCase();
    } 
    // If userId is provided and user is not OWNER, filter by createdByUserId
    else if (userId && userRole !== 'OWNER') {
      const uid = String(userId);
      filter.createdByUserId = uid;
    } 
    // Legacy filtering for backward compatibility
    else {
      if (role === 'OWNER' && email) filter.linkedOwnerEmail = String(email).toLowerCase();
      if (role === 'ENGINEER' && name) filter.engineer = name;
      if (userId) {
        const uid = String(userId);
        filter.createdByUserId = uid;
      }
    }
    
    let projects = await Project.find(filter).sort({ createdAt: -1 });
    
    // Also filter out projects hidden for this user
    if (userId) {
      const uid = String(userId);
      projects = projects.filter(p => !(p.hiddenForUserIds || []).includes(uid));
    }
    
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
    const projectData = req.body || {};
    
    // Ensure createdByUserId is set if provided
    if (!projectData.createdByUserId && projectData.userId) {
      projectData.createdByUserId = projectData.userId;
    }
    
    const project = await Project.create(projectData);
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
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required for per-user deletion' });
    }
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { hiddenForUserIds: String(userId) } },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.json({ success: true, message: 'Project hidden for user' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to delete project' });
  }
});

module.exports = router;


