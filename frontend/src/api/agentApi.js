import { apiRequest } from './client.js';

export const agentApi = {
  chat(message, conversationId = 'web-chat-session') {
    return apiRequest('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  },

  getAgentInfo() {
    return apiRequest('/api/agent/info');
  },

  getPolicies() {
    return apiRequest('/api/policies');
  },

  getAmenities() {
    return apiRequest('/api/wellbeing/amenities');
  },

  getHospitals(city) {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    return apiRequest(`/api/wellbeing/hospitals${query}`);
  },

  getResorts() {
    return apiRequest('/api/wellbeing/resorts');
  },

  getVacationNudge() {
    return apiRequest('/api/wellbeing/vacation-nudge');
  },

  getAgentStatus() {
    return apiRequest('/api/agent/status');
  },

  updateAgentConfig(apiKey) {
    return apiRequest('/api/agent/config', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
  },
};
