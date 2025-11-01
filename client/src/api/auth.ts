import api from './Api';

// Login
// POST /auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, message: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Register
// POST /auth/register
// Request: { email: string, password: string }
// Response: { success: boolean, user: { email: string, token: string } }
export const register = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Logout
// POST /auth/logout
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};