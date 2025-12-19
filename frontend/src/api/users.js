import apiClient from './client';

export const usersApi = {
  searchStudents: async (search, page = 0, size = 20) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      search,
    });
    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },
};


