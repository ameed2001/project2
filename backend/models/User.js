const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['ADMIN', 'ENGINEER', 'OWNER', 'GENERAL_USER'],
      default: 'GENERAL_USER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'DELETED'],
      default: 'ACTIVE',
    },
    phone: { type: String },
    profileImage: { type: String },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    deletionExpiryDate: { type: Date, default: null }, // تاريخ انتهاء صلاحية الحذف (بعد سنة)
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
