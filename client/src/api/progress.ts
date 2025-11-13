import api from './Api';

// Update Progress
// POST /api/progress/:pathId
// Request: { completed: number }
// Response: { success: boolean, message: string }
export const updateProgress = (pathId: string, completed: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Progress updated successfully' });
    }, 500);
  });
};

// Get Assessment
// GET /api/assessment/:pathId
// Response: { questions: Array<{ id: string, question: string, options: string[], correct: number }> }
export const getAssessment = (pathId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        questions: [
          {
            id: '1',
            question: 'What is HTML?',
            options: [
              'Hypertext Markup Language',
              'High Tech Machine Learning',
              'Hybrid Text Manipulation Logic',
              'Hardware Testing Method Layer'
            ],
            correct: 0
          }
        ]
      });
    }, 500);
  });
};