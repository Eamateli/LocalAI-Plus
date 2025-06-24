import axios from 'axios';
import { useAppStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const apiKey = useAppStore.getState().apiKey;
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

// Add retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.config && error.response?.status === 503 && !error.config._retry) {
      error.config._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);