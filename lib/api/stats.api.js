/**
 * Statistics API endpoints
 */

import api from './index'

export const statsAPI = {
  // Get match results (public)
  getMatchResults: (params) => api.get('/stats/results', { params }),
  
  // Get user statistics (authenticated)
  getUserStatistics: (params) => api.get('/stats/statistics', { params }),
  
  // Get betting history statistics (authenticated)
  getBettingHistoryStats: (params) => api.get('/stats/betting-history', { params }),
}
