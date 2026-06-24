const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ ADD YOUR VERCEL URL HERE
const FRONTEND_URL = 'https://project-manager-mern-alpha.vercel.app';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',           // Local dev
    'http://localhost:5001',           // Local backend
    FRONTEND_URL                        // Production frontend
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
console.log('🔄 Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('❌ MongoDB connection FAILED');
    console.error('Error:', err.message);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/cards', require('./routes/cards'));

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running! ✅' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});