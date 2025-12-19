import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const isAuthEndpoint = (url) => {
  if (!url) return false;
  // Axios config.url is the path passed to apiClient (e.g. "/auth/login")
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  );
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};

    // Don't attempt refresh token flow for auth endpoints (especially /auth/login),
    // otherwise invalid credentials can look like "nothing happened" due to a redirect loop.
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = apiClient.post('/auth/refresh').then((response) => {
            const newToken = response.data.accessToken;
            localStorage.setItem('accessToken', newToken);
            return newToken;
          });
        }

        const newToken = await refreshPromise;
        refreshPromise = null;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem('accessToken');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // For auth endpoints, let the calling page/context decide how to display errors
    // (avoids duplicate toast messages on login/forgot/reset flows).
    if (!isAuthEndpoint(originalRequest.url)) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (error.response?.status && error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        toast.error(error.response.data.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

