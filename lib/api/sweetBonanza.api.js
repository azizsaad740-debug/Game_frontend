/**
 * Sweet Bonanza API Client
 */

import api from './index';

const sweetBonanzaAPI = {
  /**
   * Play Sweet Bonanza game
   * @param {number} betAmount - Amount to bet
   * @returns {Promise} Game result with reels, win amount, and balance
   */
  playGame: async (betAmount) => {
    const response = await api.post('/sweet-bonanza/play', {
      betAmount: parseFloat(betAmount)
    });
    return response;
  },

  /**
   * Get game history
   * @param {Object} params - Query parameters (limit, page)
   * @returns {Promise} Game history
   */
  getHistory: async (params = {}) => {
    const response = await api.get('/sweet-bonanza/history', { params });
    return response;
  },

  /**
   * Get user statistics
   * @returns {Promise} User statistics
   */
  getStats: async () => {
    const response = await api.get('/sweet-bonanza/stats');
    return response;
  },

  /**
   * Get lobby session state
   */
  getSession: async () => {
    const response = await api.get('/sweet-bonanza/session');
    return response;
  },

  /**
   * Place a bet in the lobby
   */
  placeLobbyBet: async (betAmount, side) => {
    const response = await api.post('/sweet-bonanza/bet', {
      betAmount: parseFloat(betAmount),
      side
    });
    return response;
  },

  /**
   * Submit an admin decision
   */
  submitAdminDecision: async (decision) => {
    const response = await api.post('/sweet-bonanza/admin-decision', { decision });
    return response;
  }
};

export default sweetBonanzaAPI;

