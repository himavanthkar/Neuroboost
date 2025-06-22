const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Set various HTTP headers for security
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Routes ---
const authRoutes = require('./src/routes/auth');
const taskRoutes = require('./src/routes/tasks');
const aiRoutes = require('./src/routes/ai');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// --- Basic Route ---
app.get('/', (req, res) => {
  res.send('NeuroBoost API Gateway is running! 🚀');
});

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway server is listening on port ${PORT}`);
});

module.exports = app; 