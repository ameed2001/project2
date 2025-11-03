const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password_input, role, phone, status } = req.body;

    if (!name || !email || !password_input || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists', errorType: 'email_exists' });
    }

    const passwordHash = await bcrypt.hash(password_input, 10);
    const normalizedRole = String(role).toUpperCase();
    const initialStatus = status || 'ACTIVE';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: normalizedRole,
      status: initialStatus,
      phone,
      profileImage: `https://placehold.co/100x100.png?text=${name.substring(0, 2).toUpperCase()}`,
    });

    const { passwordHash: _, ...safeUser } = user.toObject();
    return res.status(201).json({ success: true, message: 'User registered successfully', user: safeUser });
  } catch (err) {
    console.error('[register] error:', err);
    return res.status(500).json({ success: false, message: 'Error registering user', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password_input } = req.body;
    if (!email || !password_input) {
      return res.status(400).json({ success: false, message: 'Missing credentials' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found', errorType: 'email_not_found' });
    }

    const ok = await bcrypt.compare(password_input, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid password', errorType: 'invalid_password' });
    }

    if (user.status !== 'ACTIVE') {
      const statusMap = {
        PENDING_APPROVAL: { message: 'Account pending approval', errorType: 'pending_approval' },
        SUSPENDED: { message: 'Account suspended', errorType: 'account_suspended' },
        DELETED: { message: 'Account deleted', errorType: 'account_deleted' },
      };
      const info = statusMap[user.status] || { message: 'Account inactive', errorType: 'other' };
      return res.status(403).json({ success: false, ...info });
    }

    const { passwordHash: _, ...safeUser } = user.toObject();
    return res.status(200).json({ success: true, message: 'Login successful', user: safeUser });
  } catch (err) {
    console.error('[login] error:', err);
    return res.status(500).json({ success: false, message: 'Error logging in', error: err.message });
  }
});

module.exports = router;
