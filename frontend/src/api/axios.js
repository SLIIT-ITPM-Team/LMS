import axios from "axios";

// Central Axios instance used across the LMS frontend.
// Reads the base URL from Vite env; falls back to localhost for local dev.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

// Attach auth token if stored by the app (keeps this file self‑contained).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
