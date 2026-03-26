import axios from "axios";

// Central Axios instance used across the LMS frontend.
// Uses relative URLs when proxy is enabled, absolute URLs for production.
const isDevelopment = import.meta.env.DEV;
const baseURL = isDevelopment 
  ? ''  // Use empty baseURL in development (proxy handles /api)
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001");

const api = axios.create({
<<<<<<< Updated upstream
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
=======
  baseURL: baseURL,
>>>>>>> Development
=======
  baseURL: baseURL,
>>>>>>> Stashed changes
  withCredentials: true,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('lms_token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network Error:', error.request);
      if (isDevelopment) {
        console.warn('Make sure the backend server is running on http://localhost:5001');
      }
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
