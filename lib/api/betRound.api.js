/**
 * Bet Round API endpoints
 * Handles betting round operations for games (e.g., Crash game)
 */

import api from './index'

export const betRoundAPI = {
  // Place a bet on a round
  placeBetRound: (data) => api.post('/bet-rounds/place', data),
  
  // Get betting history with advanced filters
  getBetRoundHistory: (params) => api.get('/bet-rounds/history', { params }),
  
  // Get specific round details
  getBetRoundDetails: (id) => api.get(`/bet-rounds/${id}`),
  
  // Get betting statistics
  getBetRoundStatistics: (params) => api.get('/bet-rounds/statistics', { params }),
}

