const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Get user by id (safe)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { passwordHash: 0 });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    return res.json({ success: true, user });
  } catch {
    return res.status(400).json({ success: false, message: 'فشل تحميل المستخدم.' });
  }
});

// Get user by email (safe)
router.get('/by/email', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email }, { passwordHash: 0 });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    return res.json({ success: true, user });
  } catch {
    return res.status(400).json({ success: false, message: 'فشل تحميل المستخدم.' });
  }
});

// List users (safe)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 });
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.email) updates.email = String(updates.email).toLowerCase();
    // Prevent passwordHash direct set here
    delete updates.passwordHash;
    const existingWithEmail = updates.email
      ? await User.findOne({ email: updates.email, _id: { $ne: req.params.id } })
      : null;
    if (existingWithEmail) {
      return res.status(409).json({ success: false, message: 'Email already in use', fieldErrors: { email: ['هذا البريد الإلكتروني مستخدم بالفعل.'] } });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { ...updates, updatedAt: new Date() }, { new: true, projection: { passwordHash: 0 } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    return res.json({ success: true, user, message: 'تم تحديث المستخدم بنجاح.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل تحديث المستخدم.' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    // حساب تاريخ انتهاء صلاحية الحذف (بعد سنة من الآن)
    const deletionExpiryDate = new Date();
    deletionExpiryDate.setFullYear(deletionExpiryDate.getFullYear() + 1);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'DELETED', 
        updatedAt: new Date(),
        deletionExpiryDate: deletionExpiryDate
      },
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    return res.json({ success: true, message: 'تم حذف الحساب وسيتم الاحتفاظ بالبيانات لمدة عام.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل حذف المستخدم.' });
  }
});

// Admin reset password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword_input } = req.body;
    const passwordHash = await bcrypt.hash(newPassword_input, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { passwordHash, updatedAt: new Date() }, { new: true, projection: { passwordHash: 0 } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    return res.json({ success: true, message: 'تم إعادة تعيين كلمة مرور المستخدم بنجاح.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل إعادة تعيين كلمة المرور.' });
  }
});

// Approve engineer (or toggle status)
router.post('/:id/approve', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'ACTIVE', updatedAt: new Date() }, { new: true, projection: { passwordHash: 0 } });
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    return res.json({ success: true, message: 'تمت الموافقة على المهندس.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل الموافقة على المهندس.' });
  }
});

// Suspend/Unsuspend
router.post('/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    if (user.role === 'ADMIN') return res.status(400).json({ success: false, message: 'لا يمكن تعليق حساب مسؤول.' });
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    user.status = newStatus;
    await user.save();
    return res.json({ success: true, message: newStatus === 'SUSPENDED' ? 'تم تعليق المستخدم بنجاح.' : 'تم إلغاء تعليق المستخدم بنجاح.' });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'فشل تغيير حالة المستخدم.' });
  }
});

// Restore deleted user
router.post('/:id/restore', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
    if (user.status !== 'DELETED') return res.status(400).json({ success: false, message: 'لا يمكن استعادة هذا الحساب لأنه لم يتم حذفه.' });

    // تحديث حالة المستخدم إلى نشط وإزالة تاريخ انتهاء صلاحية الحذف
    user.status = 'ACTIVE';
    user.deletionExpiryDate = null;
    await user.save();

    return res.json({ 
      success: true, 
      message: 'تم استعادة حساب المستخدم بنجاح.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Error restoring user:', err);
    return res.status(400).json({ success: false, message: 'فشل استعادة المستخدم.' });
  }
});

module.exports = router;


