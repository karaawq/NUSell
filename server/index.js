const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', //allows req from both local and deployed client
  credentials: true
}));
app.use(express.json()); 

// ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'NUSell API is running!' });
});

// CONNECT TO MONGODB
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });