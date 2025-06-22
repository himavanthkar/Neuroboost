const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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