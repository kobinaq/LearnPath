import axios from 'axios';

// In production (Railway), API is on same domain at /api
// In development, API is on localhost:3000
const getBaseURL = () => {
  // Check if we're in development mode (Vite dev server)
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  // Production: API is on same domain
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session-based auth
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
