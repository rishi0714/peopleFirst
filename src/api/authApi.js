import { apiRequest } from './client.js';

export const authApi = {
  login(username, password, channel = 'WEB') {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, channel }),
    });
  },

  refresh(refreshToken) {
    return apiRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  getCurrentUserProfile() {
    return apiRequest('/api/auth/me');
  },
};
