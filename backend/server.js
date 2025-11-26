const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/logs');
const settingRoutes = require('./routes/settings');
const reportRoutes = require('./routes/reports');
const passwordRoutes = require('./routes/password');
const calculationRoutes = require('./routes/calculations');

app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/calculations', calculationRoutes);
if (!process.env.MONGO_URI) {
  console.error('❌ Missing MONGO_URI in environment. Check backend/.env');
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!',
    port: PORT,
    timestamp: new Date().toISOString(),
    endpoints: {
      calculations: {
        concrete: '/api/calculations/concrete',
        steel: '/api/calculations/steel',
        costEstimation: '/api/calculations/cost-estimation'
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Calculations endpoint: http://localhost:${PORT}/api/calculations/concrete`);
});
