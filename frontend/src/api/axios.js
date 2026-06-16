import axios from 'axios';

const getStoredToken = () => {
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
  baseURL: 'http://127.0.0.1:8000'
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