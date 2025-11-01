const express = require('express');
const router = express.Router();
const { requireUser } = require('./middleware/auth');
const LearningPathService = require('../services/learning-path');
const courseGenerator = require('../services/course-generator');
const UserService = require('../services/user');
const logger = require('../utils/log');

// Get all learning paths for the authenticated user
router.get('/', requireUser, async (req, res) => {
  try {
    const learningPaths = await LearningPathService.getByUser(req.user._id);
    res.json({
      success: true,
      count: learningPaths.length,
      learningPaths,
    });
  } catch (error) {
    logger.error('Error fetching learning paths:', error);
    res.status(500).json({
      error: `Failed to fetch learning paths: ${error.message}`,
    });
  }
});

// Get a specific learning path
router.get('/:id', requireUser, async (req, res) => {
  try {
    const learningPath = await LearningPathService.get(req.params.id);

    if (!learningPath) {
      return res.status(404).json({
        error: 'Learning path not found',
      });
    }

    // Ensure user owns this learning path
    if (learningPath.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      learningPath,
    });
  } catch (error) {
    logger.error('Error fetching learning path:', error);
    res.status(500).json({
      error: `Failed to fetch learning path: ${error.message}`,
    });
  }
});

// Create a new learning path
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

// Generate AI-powered course content for a learning path
router.post('/:id/generate-course', requireUser, async (req, res) => {
  try {
    const learningPath = await LearningPathService.get(req.params.id);

    if (!learningPath) {
      return res.status(404).json({
        error: 'Learning path not found',
      });
    }

    // Ensure user owns this learning path
    if (learningPath.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    // Check if user has enough credits
    const user = await UserService.get(req.user._id);
    if (!user.hasCredits(1)) {
      return res.status(402).json({
        error: 'Insufficient credits. Please upgrade your plan or purchase more credits.',
        currentCredits: user.credits,
        required: 1,
      });
    }

    // Generate the course using AI
    const course = await courseGenerator.generateCourse(
      learningPath.topic,
      learningPath.level,
      learningPath.pace,
      learningPath.goals
    );

    // Update learning path with generated content and resources
    const updatedPath = await LearningPathService.update(req.params.id, {
      resources: course.resources || [],
      courseData: course,
    });

    // Deduct credits after successful generation
    await user.deductCredits(1);

    res.json({
      success: true,
      message: 'Course generated successfully',
      creditsRemaining: user.credits - 1,
      course,
      learningPath: updatedPath,
    });
  } catch (error) {
    logger.error('Error generating course:', error);
    res.status(500).json({
      error: `Failed to generate course: ${error.message}`,
    });
  }
});

// Update learning path progress
router.put('/:id/progress', requireUser, async (req, res) => {
  try {
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        error: 'Progress must be a number between 0 and 100',
      });
    }

    const learningPath = await LearningPathService.get(req.params.id);

    if (!learningPath) {
      return res.status(404).json({
        error: 'Learning path not found',
      });
    }

    if (learningPath.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    const updatedPath = await LearningPathService.update(req.params.id, {
      progress,
    });

    res.json({
      success: true,
      message: 'Progress updated successfully',
      learningPath: updatedPath,
    });
  } catch (error) {
    logger.error('Error updating progress:', error);
    res.status(500).json({
      error: `Failed to update progress: ${error.message}`,
    });
  }
});

// Delete a learning path
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const learningPath = await LearningPathService.get(req.params.id);

    if (!learningPath) {
      return res.status(404).json({
        error: 'Learning path not found',
      });
    }

    if (learningPath.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    await LearningPathService.delete(req.params.id);

    res.json({
      success: true,
      message: 'Learning path deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting learning path:', error);
    res.status(500).json({
      error: `Failed to delete learning path: ${error.message}`,
    });
  }
});

module.exports = router;