/**
 * Authentication and role utilities
 */

// Get current user from localStorage
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error parsing user data:', error)
    }
    return null
  }
};

// Get auth token
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Check if user has admin role
export const isAdmin = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return ['admin', 'super_admin', 'operator'].includes(user.role);
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
};

// Get redirect path based on role
export const getRedirectPath = (role) => {
  if (['admin', 'super_admin', 'operator'].includes(role)) {
    return '/admin';
  }
  return '/dashboard';
};

// Logout user
export const logout = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminEmail');
  
  // Redirect to home
  window.location.href = '/';
};

// Clear all auth data (for logout)
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminEmail');
};

// Store user data after login/register
export const storeUserData = (token, user) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  if (['admin', 'super_admin', 'operator'].includes(user.role)) {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminEmail', user.email);
  }
};

// Update user data (e.g., after balance changes)
export const updateUserData = (userData) => {
  if (typeof window === 'undefined') return;
  
  try {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch custom event to notify components of user data update
      window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedUser }));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating user data:', error);
    }
  }
};

