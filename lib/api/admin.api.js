/**
 * Admin API endpoints
 */

import api from './index'

export const adminAPI = {
  // Deposit Pool
  getDepositPool: (params) => api.get('/admin/deposit-pool', { params }),
  getDepositRequest: (id) => api.get(`/admin/deposit-pool/${id}`),
  approveDeposit: (id, data) => api.post(`/admin/deposit-pool/${id}/approve`, data),
  cancelDeposit: (id, data) => api.post(`/admin/deposit-pool/${id}/cancel`, data),
  bulkApproveDeposits: (data) => api.post('/admin/deposit-pool/bulk-approve', data),
  bulkCancelDeposits: (data) => api.post('/admin/deposit-pool/bulk-cancel', data),
  exportDeposits: (params) => api.get('/admin/deposit-pool/export', { params, responseType: 'blob' }),

  // Withdrawal Pool
  getWithdrawalPool: (params) => api.get('/admin/withdrawal-pool', { params }),
  getWithdrawalRequest: (id) => api.get(`/admin/withdrawal-pool/${id}`),
  approveWithdrawal: (id, data) => api.post(`/admin/withdrawal-pool/${id}/approve`, data),
  rejectWithdrawal: (id, data) => api.post(`/admin/withdrawal-pool/${id}/reject`, data),
  bulkApproveWithdrawals: (data) => api.post('/admin/withdrawal-pool/bulk-approve', data),
  bulkRejectWithdrawals: (data) => api.post('/admin/withdrawal-pool/bulk-reject', data),
  exportWithdrawals: (params) => api.get('/admin/withdrawal-pool/export', { params, responseType: 'blob' }),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentTransactions: (params) => api.get('/admin/dashboard/recent-transactions', { params }),
  getRevenueChartData: (params) => api.get('/admin/dashboard/revenue-chart', { params }),

  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  bulkUpdateUserStatus: (data) => api.put('/admin/users/bulk-status', data),
  exportUsers: (params) => api.get('/admin/users/export', { params, responseType: 'blob' }),
  updateUserIban: (id, data) => api.put(`/admin/users/${id}/iban`, data),
  updateUserBalance: (id, data) => api.put(`/admin/users/${id}/balance`, data),

  // Betting Management
  getBets: (params) => api.get('/admin/bets', { params }),
  settleBet: (id, data) => api.put(`/admin/bets/${id}/settle`, data),
  bulkSettleBets: (data) => api.put('/admin/bets/bulk-settle', data),
  exportBets: (params) => api.get('/admin/bets/export', { params, responseType: 'blob' }),

  // Admin Logs
  getAdminLogs: (params) => api.get('/admin/logs', { params }),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),

  // Support Tickets
  getAllTickets: (params) => api.get('/support/tickets', { params }),
  getTicketById: (id) => api.get(`/support/tickets/${id}`),
  updateTicketStatus: (id, data) => api.put(`/support/tickets/${id}/status`, data),
  closeTicket: (id, data) => api.post(`/support/tickets/${id}/close`, data),
  respondToTicket: (id, data) => api.post(`/support/tickets/${id}/respond`, data),
  getTicketStatistics: () => api.get('/support/statistics'),

  // Game Catalog Management
  getGames: (params) => api.get('/admin/games', { params }),
  getGameById: (id) => api.get(`/admin/games/${id}`),
  createGame: (data) => api.post('/admin/games', data),
  updateGame: (id, data) => api.put(`/admin/games/${id}`, data),
  deleteGame: (id) => api.delete(`/admin/games/${id}`),
  getProviders: () => api.get('/admin/games/providers'),

  // Promotion Management
  getPromotions: (params) => api.get('/admin/promotions', { params }),
  getPromotionById: (id) => api.get(`/admin/promotions/${id}`),
  createPromotion: (data) => api.post('/admin/promotions', data),
  updatePromotion: (id, data) => api.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id) => api.delete(`/admin/promotions/${id}`),

  // Content Management
  getContent: (params) => api.get('/admin/content', { params }),
  getContentById: (id) => api.get(`/admin/content/${id}`),
  createContent: (data) => api.post('/admin/content', data),
  updateContent: (id, data) => api.put(`/admin/content/${id}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),

  // Tournament Management
  getTournaments: (params) => api.get('/admin/tournaments', { params }),
  getTournamentById: (id) => api.get(`/admin/tournaments/${id}`),
  createTournament: (data) => api.post('/admin/tournaments', data),
  updateTournament: (id, data) => api.put(`/admin/tournaments/${id}`, data),
  deleteTournament: (id) => api.delete(`/admin/tournaments/${id}`),
  getTournamentParticipants: (id, params) => api.get(`/admin/tournaments/${id}/participants`, { params }),

  // Game Round Management
  getGameRounds: (params) => api.get('/admin/game-rounds', { params }),
  getCurrentRound: () => api.get('/admin/game-rounds/current'),
  getRoundDetails: (id) => api.get(`/admin/game-rounds/${id}`),
  getRoundStatistics: (id) => api.get(`/admin/game-rounds/${id}/statistics`),
  startRound: () => api.post('/admin/game-rounds/start'),
  crashRound: (data) => api.post('/admin/game-rounds/crash', data),
  completeRound: (id) => api.post(`/admin/game-rounds/${id}/complete`),
  // KYC Management
  getAllKYC: () => api.get('/admin/kyc'),
  updateKYCStatus: (userId, status) => api.put(`/admin/kyc/${userId}`, { status }),

  // Game Control (Manual Results)
  getPendingSpins: () => api.get('/admin/game-controls/pending'),
  submitSpinDecision: (id, decision) => api.post(`/admin/game-controls/${id}/decision`, { decision }),
  getSweetBonanzaLobby: () => api.get('/admin/game-controls/sweet-bonanza/lobby'),
}

