/**
 * Bonus API endpoints
 */

import api from './index'

export const bonusAPI = {
  getMyBonuses: () => api.get('/bonus/my-bonuses'),
  checkRollover: (data) => api.post('/bonus/check-rollover', data),
}

