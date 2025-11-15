import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '@/config/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Retry logic for network errors
    if (!originalRequest._retry && error.code === 'NETWORK_ERROR') {
      originalRequest._retry = true;
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common API calls
export const apiHelpers = {
  // Get properties with error handling
  getProperties: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROPERTIES);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get property by ID with error handling
  getPropertyById: async (propertyId: number) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PROPERTIES}/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get property images with error handling
  getPropertyImages: async (propertyId: number) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROPERTY_IMAGES(propertyId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cache statistics
  getCacheStats: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CACHE.STATS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default apiClient;
