/**
 * Payment API endpoints
 */

import api from './index'

export const paymentAPI = {
  getIbanInfo: () => api.get('/payment/iban-info'),
  createIbanDeposit: (data) => api.post('/payment/iban-deposit', data),
  createDeposit: (data) => api.post('/payment/iban-deposit', data), // Alias for createIbanDeposit
  getDepositRequests: (params) => api.get('/payment/deposit-requests', { params }),
  getDepositMethods: () => api.get('/payment/deposit-methods'),
  createWithdrawal: (data) => api.post('/payment/withdrawal/request', data),
  getWithdrawalRequests: (params) => api.get('/payment/withdrawal-requests', { params }),
  cancelWithdrawal: (id) => api.post(`/payment/withdrawal/${id}/cancel`),
  updateProfile: (data) => api.put('/payment/profile', data),
}

