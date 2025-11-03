const express = require('express');
const Log = require('../models/Log');
const router = express.Router();

// Get logs (sorted desc)
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

// Create a log entry
router.post('/', async (req, res) => {
  try {
    const { action, level, message, user } = req.body || {};
    const log = await Log.create({
      action: action || 'APP_EVENT',
      level: level || 'INFO',
      message: message || '',
      user: user || 'System',
    });
    return res.status(201).json({ success: true, log });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Failed to create log' });
  }
});

// Delete all logs (and insert a single audit log)
router.delete('/', async (req, res) => {
  try {
    const { adminUserId } = req.body || {};
    const count = await Log.countDocuments();
    await Log.deleteMany({});
    await Log.create({
      action: 'ADMIN_DELETE_ALL_LOGS',
      level: 'WARNING',
      message: `Admin deleted all ${count} system logs.`,
      user: adminUserId,
    });
    return res.json({ success: true, message: 'تم حذف جميع السجلات بنجاح.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'فشل حذف السجلات.' });
  }
});

module.exports = router;


