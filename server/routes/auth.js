const express = require('express');
const UserService = require('../services/user.js');
const { requireUser } = require('./middleware/auth.js');
const logger = require('../utils/log.js');

const router = express.Router();
const log = logger('api/routes/authRoutes');

router.post('/login', async (req, res) => {
  console.log('Login request received:', req.body);
  const sendError = msg => {
    console.log('Login error:', msg);
    return res.status(400).json({ error: msg });
  };
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  const user = await UserService.authenticateWithPassword(email, password);
  console.log('Authentication result:', user ? 'User found' : 'User not found');

  if (user) {
    console.log('Login successful for user:', email);
    return res.json(user);
  } else {
    return sendError('Email or password is incorrect');
  }
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await UserService.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await UserService.createUser({ email, password });

    // Start session for the new user
    req.session.userId = user._id;

    return res.status(201).json({
      success: true,
      user: {
        email: user.email,
        token: user.token
      }
    });
  } catch (error) {
    log.error('Error while registering user:', error);
    return res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.all('/api/auth/logout', async (req, res) => {
  if (req.user) {
    await UserService.regenerateToken(req.user);
  }
  return res.status(204).send();
});

router.get('/me', requireUser, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;