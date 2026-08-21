import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getStoredToken = () => {
  const token =
    sessionStorage.getItem('access_token') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('accessToken');

  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  return token;
};

const getStoredRefresh = () => {
  const refresh =
    sessionStorage.getItem('refresh') ||
    sessionStorage.getItem('refresh_token') ||
    localStorage.getItem('refresh') ||
    localStorage.getItem('refresh_token');

  if (!refresh || refresh === 'undefined' || refresh === 'null') {
    return null;
  }

  return refresh;
};

const storeAccessToken = (token) => {
  if (sessionStorage.getItem('access') || sessionStorage.getItem('token') || sessionStorage.getItem('access_token')) {
    sessionStorage.setItem('access', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('access_token', token);
  } else {
    localStorage.setItem('access', token);
    localStorage.setItem('token', token);
    localStorage.setItem('access_token', token);
  }
};

const clearAuthStorage = () => {
  sessionStorage.clear();
  localStorage.clear();
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

// Dedupe concurrent refresh attempts so a burst of 401s only refreshes once
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/api/auth/token/refresh/`, {
        refresh: getStoredRefresh(),
      })
      .then((res) => {
        const newAccess = res.data.access;
        storeAccessToken(newAccess);
        return newAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Response interceptor: on 401, try a silent token refresh and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefresh();
    if (!refreshToken) {
      clearAuthStorage();
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const newAccess = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (refreshError) {
      clearAuthStorage();
      return Promise.reject(error);
    }
  }
);

export default api;