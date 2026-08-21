import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getStoredToken = () => {
  const token =
    localStorage.getItem('access') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('access') ||
    sessionStorage.getItem('accessToken');

  if (token === 'undefined' || token === 'null') {
    return null;
  }

  return token;
};

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('access');
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;