const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  telegram: {
    type: String,
    trim: true,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', userSchema);