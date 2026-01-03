/**
 * Dice Roll Bet API endpoints
 */

import api from './index';

export const diceRollBetAPI = {
  // Place a bet
  placeBet: (data) => api.post('/dice-roll-bets', data),

  // Get user's bets
  getMyBets: (params) => api.get('/dice-roll-bets/my-bets', { params }),

  // Get bets for a game
  getGameBets: (gameId, params) => api.get(`/dice-roll-bets/game/${gameId}`, { params }),

  // Get single bet
  getBet: (id) => api.get(`/dice-roll-bets/${id}`),
};

