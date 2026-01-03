/**
 * Support/Messages API endpoints
 */

import api from './index'

export const supportAPI = {
  getMyTickets: () => api.get('/support/my-tickets'),
  getTicketById: (id) => api.get(`/support/tickets/${id}`),
  createTicket: (data) => api.post('/support/ticket', data),
  respondToTicket: (id, data) => api.post(`/support/tickets/${id}/respond`, data),
}

