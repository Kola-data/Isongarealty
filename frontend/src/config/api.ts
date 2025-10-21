// API Configuration - Always use online API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.isongarealty.com';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  PROPERTIES: `${API_BASE_URL}/api/properties`,
  PROPERTY_IMAGES: (id: number) => `${API_BASE_URL}/api/properties/${id}/images`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  USERS: `${API_BASE_URL}/api/users`,
  CACHE: {
    HEALTH: `${API_BASE_URL}/api/cache/health`,
    STATS: `${API_BASE_URL}/api/cache/stats`,
  }
};

export default API_ENDPOINTS;
