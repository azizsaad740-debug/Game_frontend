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
  }
};

export default sweetBonanzaAPI;

