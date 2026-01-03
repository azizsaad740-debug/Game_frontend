/**
 * Content API endpoints (Public)
 */

import api from './index'

export const contentAPI = {
  // Get all content pages
  getContentPages: (params) => api.get('/content/pages', { params }),
  
  // Get content by slug
  getContentBySlug: (slug) => api.get(`/content/${slug}`),
  
  // Get FAQ content
  getFAQContent: (params) => api.get('/content/faq', { params }),
  
  // Get help content
  getHelpContent: (params) => api.get('/content/help', { params }),
}
