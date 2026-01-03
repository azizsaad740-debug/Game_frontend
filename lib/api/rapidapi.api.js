/**
 * RapidAPI Integration API endpoints (Admin only)
 */

import api from './index'

export const rapidapiAPI = {
  // Check RapidAPI configuration status
  getStatus: () => api.get('/rapidapi/status'),
  
  // Get available leagues
  getLeagues: (params) => api.get('/rapidapi/leagues', { params }),
  
  // Get teams
  getTeams: (params) => api.get('/rapidapi/teams', { params }),
  
  // Get live matches from RapidAPI
  getLiveMatches: (params) => api.get('/rapidapi/live-matches', { params }),
  
  // Sync matches from RapidAPI
  syncMatches: (data) => api.post('/rapidapi/sync-matches', data),
  
  // Sync odds for a match
  syncOdds: (matchId) => api.post(`/rapidapi/sync-odds/${matchId}`),
}

