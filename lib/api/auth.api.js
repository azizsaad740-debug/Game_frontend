/**
 * Authentication API endpoints
 */

import api from "./index";

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),

  register: (userData) => api.post("/auth/register", userData),

  logout: () => api.post("/auth/logout"),

  // Canonical name
  me: () => api.get("/auth/me"),

  // Backward-compatible alias (many pages call authAPI.getMe())
  getMe: () => api.get("/auth/me"),

  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  // Backend expects confirmPassword too
  resetPassword: (token, password, confirmPassword) =>
    api.post("/auth/reset-password", { token, password, confirmPassword }),

  // Backend route is POST /api/auth/refresh-token
  refresh: () => api.post("/auth/refresh-token"),
};
