/**
 * KYC API endpoints
 */

import api from './index'

export const kycAPI = {
  // User endpoints
  getKYC: () => api.get('/user/kyc'),
  submitKYC: (data) => api.post('/user/kyc/submit', data),
  uploadKYCDocuments: (formData) => api.post('/user/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  // Admin endpoints
  getAllKYC: () => api.get('/admin/kyc'),
  updateKYCStatus: (userId, status) => api.put(`/admin/kyc/${userId}`, { status }),
}
