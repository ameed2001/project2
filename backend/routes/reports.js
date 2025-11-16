const express = require('express');
const CostReport = require('../models/CostReport');
const router = express.Router();

// Create cost report
router.post('/', async (req, res) => {
  try {
    const report = await CostReport.create(req.body || {});
    return res.status(201).json({ success: true, report });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to create cost report' });
  }
});

// Get reports for project
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const reports = await CostReport.find({ $or: [{ projectIdLegacy: projectId }, { projectId }] }).sort({ createdAt: -1 });
    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

module.exports = router;


