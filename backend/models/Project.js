const mongoose = require('mongoose');

const timelineTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: String,
    startDate: String,
    endDate: String,
    color: String,
    status: String,
    progress: Number,
  },
  { _id: false }
);

const projectPhotoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    src: String,
    alt: String,
    caption: String,
    dataAiHint: String,
  },
  { _id: false }
);

const projectCommentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    user: String,
    text: String,
    date: String,
    avatar: String,
    dataAiHintAvatar: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    engineer: String,
    clientName: String,
    status: { type: String, default: 'مخطط له' },
    startDate: String,
    endDate: String,
    description: String,
    location: String,
    budget: Number,
    overallProgress: { type: Number, default: 0 },
    quantitySummary: { type: String, default: '' },
    photos: { type: [projectPhotoSchema], default: [] },
    timelineTasks: { type: [timelineTaskSchema], default: [] },
    comments: { type: [projectCommentSchema], default: [] },
    linkedOwnerEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);


