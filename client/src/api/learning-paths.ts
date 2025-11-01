import api from './Api';

export interface LearningPath {
  _id?: string;
  id?: string;
  userId?: string;
  topic: string;
  level: string;
  pace: string;
  goals: string[];
  resources?: Resource[];
  courseData?: CourseData;
  progress: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  type: 'video' | 'article' | 'course' | 'playlist';
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  source?: string;
  channelTitle?: string;
  publishedAt?: string;
  videoId?: string;
  playlistId?: string;
  priority?: number;
}

export interface CourseData {
  title: string;
  description: string;
  duration?: string;
  estimatedHours?: number;
  modules?: CourseModule[];
  projects?: Project[];
  milestones?: Milestone[];
  resources?: Resource[];
  resourceCount?: {
    videos: number;
    articles: number;
    total: number;
  };
}

export interface CourseModule {
  id: number;
  title: string;
  objectives: string[];
  duration: string;
  topics: string[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  moduleIds: number[];
}

// Get all learning paths for the user
export const getAllLearningPaths = async (): Promise<LearningPath[]> => {
  const response = await api.get('/learning-paths');
  return response.data.learningPaths;
};

// Get a specific learning path
export const getLearningPath = async (id: string): Promise<LearningPath> => {
  const response = await api.get(`/learning-paths/${id}`);
  return response.data.learningPath;
};

// Create Learning Path
export const createLearningPath = async (data: {
  topic: string;
  level: string;
  pace: string;
  goals: string[]
}): Promise<LearningPath> => {
  try {
    console.log('Attempting to create learning path with data:', data);
    const response = await api.post('/learning-paths/', data);
    console.log('Response from create learning path:', response);
    return response.data.learningPath;
  } catch (error: any) {
    console.error('Error in createLearningPath:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Generate AI-powered course content
export const generateCourse = async (id: string) => {
  const response = await api.post(`/learning-paths/${id}/generate-course`);
  return response.data;
};

// Update learning path progress
export const updateProgress = async (id: string, progress: number) => {
  const response = await api.put(`/learning-paths/${id}/progress`, { progress });
  return response.data;
};

// Delete learning path
export const deleteLearningPath = async (id: string) => {
  const response = await api.delete(`/learning-paths/${id}`);
  return response.data;
};