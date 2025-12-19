import apiClient from './client';

export const authApi = {
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  refresh: async () => {
    const response = await apiClient.post('/auth/refresh');
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  forgotPassword: async (email) => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },
};

