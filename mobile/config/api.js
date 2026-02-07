import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - Update this to match your backend
export const BACKEND_URL = 'https://match-finder-124.preview.emergentagent.com';
export const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      // You can add navigation logic here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
