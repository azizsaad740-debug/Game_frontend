/**
 * Transaction API endpoints
 */

import api from './index'

export const transactionAPI = {
  getMyTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createDeposit: (data) => api.post('/transactions/deposit', data),
  createWithdrawal: (data) => api.post('/transactions/withdraw', data),
}

