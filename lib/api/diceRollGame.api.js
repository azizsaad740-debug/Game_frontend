/**
 * Dice Roll Game API endpoints
 */

import api from './index';

export const diceRollGameAPI = {
  // Get all games
  getAllGames: (params) => api.get('/dice-roll-games', { params }),

  // Get active game
  getActiveGame: () => api.get('/dice-roll-games/active'),

  // Get single game
  getGame: (id) => api.get(`/dice-roll-games/${id}`),

  // Get game stats (admin)
  getGameStats: (id) => api.get(`/dice-roll-games/${id}/stats`),

  // Create game (admin)
  createGame: (data) => api.post('/dice-roll-games', data),

  // Close game (admin)
  closeGame: (id) => api.patch(`/dice-roll-games/${id}/close`),

  // Select winner (admin)
  selectWinner: (id, data) => api.patch(`/dice-roll-games/${id}/select-winner`, data),

  // Change outcome (admin)
  changeOutcome: (id, data) => api.patch(`/dice-roll-games/${id}/change-outcome`, data),

  // Place bet on a game
  placeBet: (gameId, data) => api.post(`/dice-roll-games/${gameId}/bets`, data),

  // Get bets for a game
  getGameBets: (gameId, params) => api.get(`/dice-roll-games/${gameId}/bets`, { params }),
  
  // Matchmaking
  joinQueue: (data) => api.post('/dice-roll-games/join-queue', data),
  getMatchmakingStatus: () => api.get('/dice-roll-games/matchmaking-status'),
  leaveQueue: () => api.post('/dice-roll-games/leave-queue'),
  rollDice: (id) => api.post(`/dice-roll-games/${id}/roll-dice`),
  endGameSession: (id) => api.post(`/dice-roll-games/${id}/end-session`),
};

