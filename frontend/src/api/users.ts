import apiClient from './client';
import { PageResponse, User } from '../types';

export const usersApi = {
  searchStudents: async (search: string, page = 0, size = 20): Promise<PageResponse<User>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      search,
    });
    const response = await apiClient.get<PageResponse<User>>(`/users?${params.toString()}`);
    return response.data;
  },
};


