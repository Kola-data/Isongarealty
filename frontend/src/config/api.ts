// API Configuration - Use local API for development, online API for production
// In development, always use localhost unless explicitly set to online
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
// Force localhost for development - override any .env setting
const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL || 'https://api.isongarealty.com');

// Log which API is being used (only in development)
if (isDevelopment) {
  console.log(`[API Config] Using LOCAL API: ${API_BASE_URL}`);
}

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
