/**
 * Promotion API endpoints
 */

import api from './index'

export const promotionAPI = {
  // Get active promotions (public or authenticated)
  getActivePromotions: (params) => api.get('/promotions', { params }),
  
  // Get promotion by ID (public or authenticated)
  getPromotionById: (id) => api.get(`/promotions/${id}`),
  
  // Claim promotion (authenticated)
  claimPromotion: (id) => api.post(`/promotions/${id}/claim`),
  
  // Get user's claimed promotions (authenticated)
  getMyPromotions: (params) => api.get('/promotions/my', { params }),
  
  // Get promotion claim status (authenticated)
  getPromotionStatus: (id) => api.get(`/promotions/${id}/status`),
}
