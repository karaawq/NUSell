const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

// REGISTER POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, telegram } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password required' });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
        return res.status(400).json({
            message: exists.email === email ? 'Email already in use' : 'Username already taken',
        });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed, telegram: telegram || '' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
        token, user: { _id: user._id, username: user.username, email: user.email, telegram: user.telegram, points: user.points },
    });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } 
});

// LOGIN POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token, user: { _id: user._id, username: user.username, email: user.email, telegram: user.telegram, points: user.points },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET USER /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET USER BY ID /api/auth/users/:id
router.get('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username telegram points');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/auth/me to edit/update own profile
router.put('/me', auth, async (req, res) => {
    try {
        const { username, telegram } = req.body;
        if (!username || username.trim().length < 6) {
        return res.status(400).json({ message: 'Username must be at least 6 characters' });
        }

        const conflict = await User.findOne({ username: username.trim(), _id: { $ne: req.user.id } });
        if (conflict) {
            return res.status(400).json({ message: 'Username already taken' });
        }   

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username: username.trim(), telegram: (telegram || '').replace(/^@/, '').trim() },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;