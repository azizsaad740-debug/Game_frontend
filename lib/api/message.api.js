/**
 * Message API endpoints
 */

import api from './index'

export const messageAPI = {
  // Get user messages
  getMessages: (params) => api.get('/messages', { params }),
  
  // Get message by ID
  getMessageById: (id) => api.get(`/messages/${id}`),
  
  // Send message
  sendMessage: (data) => api.post('/messages', data),
  
  // Mark message as read
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  
  // Mark all messages as read
  markAllAsRead: () => api.put('/messages/read-all'),
  
  // Delete message
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  
  // Get unread count
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  // Send system message (Admin)
  sendSystemMessage: (data) => api.post('/messages/system', data),
}
