/**
 * IBAN API endpoints (Admin)
 * Handles IBAN management operations
 */

import api from './index'

export const ibanAPI = {
  // Get all IBANs with pagination and filters
  getIbans: (params) => api.get('/ibans', { params }),
  
  // Get IBAN by ID
  getIbanById: (id) => api.get(`/ibans/${id}`),
  
  // Create new IBAN
  createIban: (data) => api.post('/ibans', data),
  
  // Update IBAN
  updateIban: (id, data) => api.put(`/ibans/${id}`, data),
  
  // Toggle IBAN active status
  toggleIbanStatus: (id) => api.put(`/ibans/${id}/toggle`),
  
  // Delete IBAN
  deleteIban: (id) => api.delete(`/ibans/${id}`),
}

