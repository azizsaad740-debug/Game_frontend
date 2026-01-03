/**
 * Bet API endpoints (User-facing)
 */

import api from './index'

export const betAPI = {
  // Get betting history with advanced filters
  getBettingHistory: (params) => api.get('/bets/history', { params }),
  
  // Get bet details
  getBetDetails: (id) => api.get(`/bets/${id}`),
  
  // Get betting statistics
  getBettingStatistics: (params) => api.get('/bets/statistics', { params }),
  
  // Get betting summary
  getBettingSummary: (params) => api.get('/bets/summary', { params }),
}
