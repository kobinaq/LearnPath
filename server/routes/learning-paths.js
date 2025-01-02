const express = require('express');
const router = express.Router();
const { requireUser } = require('./middleware/auth');
const LearningPathService = require('../services/learning-path');
const logger = require('../utils/log');

router.post('/', requireUser, async (req, res) => {
  console.log('Received learning path creation request:', {
    body: req.body,
    user: req.user,
    headers: req.headers
  });
  
  try {
    const { topic, level, pace, goals } = req.body;

    // Validate required fields
    if (!topic || !level || !pace || !goals) {
      return res.status(400).json({
        error: 'Missing required fields. Please provide topic, level, pace, and goals.'
      });
    }

    // Validate goals is an array and not empty
    if (!Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({
        error: 'Goals must be a non-empty array'
      });
    }

    const learningPath = await LearningPathService.create(req.user._id, {
      topic,
      level,
      pace,
      goals
    });

    res.status(201).json({
      id: learningPath._id,
      message: 'Learning path created successfully',
      learningPath
    });
  } catch (error) {
    logger.error('Error in learning path creation:', error);
    res.status(500).json({
      error: `Failed to create learning path: ${error.message}`
    });
  }
});

module.exports = router;