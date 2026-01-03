/**
 * Notification API endpoints
 */

import api from './index'

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  createNotification: (data) => api.post('/notifications', data),
  createBulkNotifications: (data) => api.post('/notifications/bulk', data),
}

