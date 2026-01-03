/**
 * Tournament API endpoints
 */

import api from './index'

export const tournamentAPI = {
  // Get active tournaments (public or authenticated)
  getTournaments: (params) => api.get('/tournaments', { params }),
  
  // Get tournament by ID (public or authenticated)
  getTournamentById: (id) => api.get(`/tournaments/${id}`),
  
  // Join tournament (authenticated)
  joinTournament: (id) => api.post(`/tournaments/${id}/join`),
  
  // Get user's tournaments (authenticated)
  getMyTournaments: (params) => api.get('/tournaments/my', { params }),
  
  // Get tournament leaderboard (public or authenticated)
  getLeaderboard: (id, params) => api.get(`/tournaments/${id}/leaderboard`, { params }),
  
  // Get tournament standings (public or authenticated)
  getStandings: (id) => api.get(`/tournaments/${id}/standings`),
}
