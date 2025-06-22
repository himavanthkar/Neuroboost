const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
<<<<<<< HEAD
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Gateway is healthy' });
});

// VAPI Webhook Endpoint
app.post('/vapi-webhook', (req, res) => {
  console.log('Received webhook call:', JSON.stringify(req.body, null, 2));

  const { message } = req.body;

  // For now, we will just acknowledge the message.
  // In the future, you can add logic here to handle different message types.
  if (message) {
    // A simple response to let Vapi know the message was received.
    return res.status(200).json({
      message: "Webhook received successfully."
    });
  }

  // If the payload is not what we expect, send a bad request response.
  return res.status(400).json({ error: 'Invalid payload' });
});

app.listen(port, () => {
  console.log(`API Gateway listening on http://localhost:${port}`);
}); 
=======
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
>>>>>>> 86bcd2765441c85686465662273e7b7b8ff8c0e0
