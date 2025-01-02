const LearningPath = require('../models/LearningPath');
const logger = require('../utils/log');

class LearningPathService {
  async create(userId, pathData) {
    try {
      const learningPath = new LearningPath({
        userId,
        ...pathData,
        resources: [], // Initially empty, will be populated later
        progress: 0
      });

      await learningPath.save();
      logger.info(`Created learning path with ID ${learningPath._id} for user ${userId}`);

      return learningPath;
    } catch (error) {
      logger.error('Error creating learning path:', {
        error: error.message,
        stack: error.stack,
        userId,
        pathData
      });
      throw error;
    }
  }

  async get(pathId) {
    try {
      logger.info(`Fetching learning path with ID ${pathId}`);
      const learningPath = await LearningPath.findById(pathId);
      
      if (!learningPath) {
        logger.warn(`Learning path with ID ${pathId} not found`);
        throw new Error('Learning path not found');
      }

      return learningPath;
    } catch (error) {
      logger.error('Error fetching learning path:', {
        error: error.message,
        stack: error.stack,
        pathId
      });
      throw error;
    }
  }

  async getByUser(userId) {
    try {
      logger.info(`Fetching learning paths for user ${userId}`);
      const paths = await LearningPath.find({ userId });
      return paths;
    } catch (error) {
      logger.error('Error fetching user learning paths:', {
        error: error.message,
        stack: error.stack,
        userId
      });
      throw error;
    }
  }

  async update(pathId, updateData) {
    try {
      logger.info(`Updating learning path ${pathId}`);
      const learningPath = await LearningPath.findByIdAndUpdate(
        pathId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!learningPath) {
        logger.warn(`Learning path with ID ${pathId} not found for update`);
        throw new Error('Learning path not found');
      }

      return learningPath;
    } catch (error) {
      logger.error('Error updating learning path:', {
        error: error.message,
        stack: error.stack,
        pathId,
        updateData
      });
      throw error;
    }
  }

  async delete(pathId) {
    try {
      logger.info(`Deleting learning path ${pathId}`);
      const learningPath = await LearningPath.findByIdAndDelete(pathId);

      if (!learningPath) {
        logger.warn(`Learning path with ID ${pathId} not found for deletion`);
        throw new Error('Learning path not found');
      }

      return learningPath;
    } catch (error) {
      logger.error('Error deleting learning path:', {
        error: error.message,
        stack: error.stack,
        pathId
      });
      throw error;
    }
  }
}

module.exports = new LearningPathService();