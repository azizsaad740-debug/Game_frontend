/**
 * Financial Calculator API endpoints
 * Handles financial flow calculations and balance tracking
 */

import api from './index'

export const financialAPI = {
  // Calculate financial flow (doesn't modify balance)
  calculateFlow: (data) => api.post('/financial/calculate-flow', data),
  
  // Apply financial flow to user balance
  applyFlow: (data) => api.post('/financial/apply-flow', data),
  
  // Apply game outcome to balance
  applyGameOutcome: (data) => api.post('/financial/apply-game-outcome', data),
  
  // Get balance history
  getBalanceHistory: (params) => api.get('/financial/balance-history', { params }),
  
  // Get win/loss statistics
  getWinLossStats: (params) => api.get('/financial/win-loss-stats', { params }),
  
  // Example flow (public for demo)
  exampleFlow: () => api.post('/financial/example-flow'),
}

