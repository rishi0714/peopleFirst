import { apiRequest } from './client.js';

export const ticketApi = {
  createTicket(ticketData) {
    return apiRequest('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  getTickets(scope) {
    const query = scope ? `?scope=${scope}` : '';
    return apiRequest(`/api/tickets${query}`);
  },
};
