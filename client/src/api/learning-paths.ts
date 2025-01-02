import api from './api';

// Get Learning Path
// GET /api/learning-paths/:id
// Response: { id: string, topic: string, level: string, pace: string, goals: string[], resources: Array<{ type: string, title: string, url: string }>, progress: number }
export const getLearningPath = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '1',
        topic: 'Web Development',
        level: 'Undergraduate/Tertiary Level',
        pace: 'self-paced',
        goals: ['Learn HTML/CSS', 'Master JavaScript', 'Build Full-Stack Apps'],
        resources: [
          { type: 'video', title: 'HTML Basics', url: 'https://example.com/html' },
          { type: 'article', title: 'CSS Flexbox Guide', url: 'https://example.com/css' },
          { type: 'course', title: 'JavaScript Fundamentals', url: 'https://example.com/js' }
        ],
        progress: 45
      });
    }, 500);
  });
};

// Create Learning Path
// POST /api/learning-paths
// Request: { topic: string, level: string, pace: string, goals: string[] }
// Response: { id: string, message: string, learningPath: { _id: string, topic: string, level: string, pace: string, goals: string[], resources: Array<{ type: string, title: string, url: string }>, progress: number, createdAt: string } }
export const createLearningPath = async (data: { topic: string; level: string; pace: string; goals: string[] }) => {
  try {
    console.log('Attempting to create learning path with data:', data);
    const response = await api.post('/api/learning-paths/', data);
    console.log('Response from create learning path:', response);
    return response.data;
  } catch (error) {
    console.error('Error in createLearningPath:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};