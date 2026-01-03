/**
 * Dashboard API endpoints
 */

import api from './index'

export const dashboardAPI = {
  // Get user dashboard stats
  getDashboardStats: () => api.get('/dashboard/stats'),
  
  // Get recent activity
  getRecentActivity: (params) => api.get('/dashboard/recent-activity', { params }),
  
  // Get betting summary
  getBettingSummary: (params) => api.get('/dashboard/betting-summary', { params }),
  
  // Get balance history
  getBalanceHistory: (params) => api.get('/dashboard/balance-history', { params }),
}
