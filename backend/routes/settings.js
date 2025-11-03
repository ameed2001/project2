const express = require('express');
const Setting = require('../models/Setting');
const router = express.Router();

// Get settings (single doc)
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) {
      return res.json({ success: true, settings: null });
    }
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Upsert settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body || {};
    const settings = await Setting.findOneAndUpdate({}, updates, { new: true, upsert: true });
    return res.json({ success: true, settings, message: 'تم حفظ الإعدادات بنجاح.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل حفظ الإعدادات.' });
  }
});

module.exports = router;


