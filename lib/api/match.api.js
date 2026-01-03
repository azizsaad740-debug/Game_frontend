/**
 * Match API endpoints
 */

import api from './index'

export const matchAPI = {
  // Get all matches with filters
  getMatches: (params) => api.get('/matches', { params }),
  
  // Get match by ID
  getMatchById: (id) => api.get(`/matches/${id}`),
  
  // Place bet on a match
  placeBet: (matchId, betData) => api.post(`/matches/${matchId}/bet`, betData),
  
  // Get user's bets
  getMyBets: (params) => api.get('/matches/bets/my', { params }),
  
  // Admin: Create match
  createMatch: (data) => api.post('/matches', data),
  
  // Admin: Update match
  updateMatch: (id, data) => api.put(`/matches/${id}`, data),
  
  // Admin: Enter match result (auto-settles bets)
  enterMatchResult: (id, data) => api.post(`/matches/${id}/result`, data),
}

