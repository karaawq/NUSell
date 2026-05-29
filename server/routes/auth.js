const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// REGISTRATION
router.post('/register', async (req, res) => {
  const { username, email, password, telegram } = req.body;

  try {
    // 1. check if email already exists in db
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'email taken alr' });
    }

    // 2. check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'username taken alr' });
    }

    // 3. encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      telegram: telegram || ''
    });

    await user.save();

    // 5. create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'account created!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        telegram: user.telegram,
        points: user.points
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error sia' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. confirm that user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'invalid email or password' });
    }

    // 2. validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'invalid email or password' });
    }

    // 3. create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        telegram: user.telegram,
        points: user.points
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error sia..' });
  }
});

// GET USER
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'server error sia...' });
  }
});

module.exports = router;
