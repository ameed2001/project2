const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Change own password
router.post('/change', async (req, res) => {
  try {
    const { userId, currentPassword_input, newPassword_input } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.', errorType: 'user_not_found' });
    const ok = await bcrypt.compare(currentPassword_input, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة.', errorType: 'invalid_current_password' });
    user.passwordHash = await bcrypt.hash(newPassword_input, 10);
    await user.save();
    return res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل تغيير كلمة المرور.', errorType: 'db_error' });
  }
});

// Create reset token
router.post('/reset-token', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();
    return res.json({ success: true, token, userId: user.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// Reset with token
router.post('/reset-with-token', async (req, res) => {
  try {
    const { token, newPassword_input } = req.body;
    const user = await User.findOne({ resetToken: token });
    if (!user) return res.status(400).json({ success: false, message: 'رابط إعادة التعيين غير صالح.' });
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'رابط إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد.' });
    }
    user.passwordHash = await bcrypt.hash(newPassword_input, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    return res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم.' });
  }
});

module.exports = router;


