const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const isFirstUser = (await User.countDocuments({})) === 0;
    const userRole = isFirstUser ? 'ADMIN' : (role || 'USER');

    const user = await User.create({
      username,
      email,
      password,
      role: userRole,
    });

    if (user) {
      const token = generateToken(user._id);
      // user.toJSON() will be called, including virtual 'id' and new 'email'
      res.status(201).json({ 
        user: user.toJSON(), // Send the full user object (includes id, username, email, role)
        token 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Changed from username to email
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  try {
    const user = await User.findOne({ email }); // Find by email

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({
        user: user.toJSON(), // Send the full user object
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  // req.user is attached by 'protect' middleware and already excludes password.
  // It will include the new 'email' field.
  if (req.user) {
    res.json(req.user.toJSON()); // req.user is a Mongoose document, use toJSON()
  } else {
    // This case should ideally be caught by 'protect' middleware if token is invalid/user not found
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
