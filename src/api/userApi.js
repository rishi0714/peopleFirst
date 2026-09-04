import { apiRequest } from './client.js';

export const userApi = {
  getDirectReportees() {
    return apiRequest('/api/users/reportees');
  },

  getAllUsers() {
    return apiRequest('/api/users');
  },

  getUserById(id) {
    return apiRequest(`/api/users/${id}`);
  },
};
