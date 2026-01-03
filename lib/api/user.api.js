/**
 * User API endpoints
 */

import api from './index'

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  /**
   * Upload profile picture
   * @param {File} file - The image file to upload
   * @returns {Promise} API response with updated user data
   */
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  /**
   * Delete profile picture
   * @returns {Promise} API response with updated user data
   */
  deleteProfilePicture: () => {
    return api.delete('/users/profile-picture');
  },
}

