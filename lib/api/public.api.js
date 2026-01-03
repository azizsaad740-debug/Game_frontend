/**
 * Public API endpoints (no authentication required)
 */

import api from './index'

export const publicAPI = {
  // Get active IBANs for deposit page
  getActiveIbans: () => api.get('/public/ibans'),
}


