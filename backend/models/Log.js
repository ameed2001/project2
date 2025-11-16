const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    action: String,
    level: { type: String, enum: ['INFO', 'WARNING', 'ERROR', 'SUCCESS'], default: 'INFO' },
    message: String,
    timestamp: { type: Date, default: Date.now },
    user: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);


