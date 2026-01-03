
import axios from "axios";

// API URL configuration - must be set in production via NEXT_PUBLIC_API_URL
const getAPIURL = () => {
  let url = '';

  // Check for environment variable (works in both client and server)
  // In Next.js, NEXT_PUBLIC_* variables are available in both server and client
  if (typeof window !== 'undefined') {
    // Client-side: check process.env (Vercel injects these at build time)
    url = process.env.NEXT_PUBLIC_API_URL || '';

    // Debug: Log if URL is missing (only in browser console)
    if (!url && process.env.NODE_ENV === 'production') {
      console.error('❌ NEXT_PUBLIC_API_URL is not set!');
      console.error('📝 Please set it in Vercel Dashboard → Settings → Environment Variables');
      console.error('📝 Format: https://your-backend.onrender.com/api');
    }
  } else {
    // Server-side (SSR)
    url = process.env.NEXT_PUBLIC_API_URL || '';
  }

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      // In production, return empty string (will cause API calls to fail with clear error)
      return '';
    }
    // Development fallback
    return "http://localhost:5000/api";
  }

  // Normalize the URL - ensure it ends with /api if it doesn't already
  // Remove trailing slash first
  url = url.trim().replace(/\/+$/, '');

  // If URL doesn't end with /api, add it
  // This handles cases where NEXT_PUBLIC_API_URL is set to just the domain
  if (!url.endsWith('/api')) {
    // Check if it already has /api in the path
    if (!url.includes('/api')) {
      url = `${url}/api`;
    }
  }

  return url;
};

const API_URL = getAPIURL();

// Validate API URL in production
if (process.env.NODE_ENV === 'production' && !API_URL) {
  console.error('CRITICAL: NEXT_PUBLIC_API_URL environment variable is not set!');
  console.error('Please set NEXT_PUBLIC_API_URL in your Vercel project settings.');
}

// Log API URL for debugging (both dev and prod to help troubleshoot)
if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'development') {
    console.log('API Base URL:', API_URL);
  } else if (process.env.NODE_ENV === 'production' && API_URL) {
    // In production, log to help debug API issues
    console.log('API Base URL configured:', API_URL);
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false // We're using Bearer token, not cookies
});

// ---------------------------------------------
// Request Interceptor: Add token to Authorization header
// ---------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Only add token if we're in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && token !== 'cookie-auth') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------
// Response Interceptor: Comprehensive Error Handling
// ---------------------------------------------
api.interceptors.response.use(
  // Success path: just return the response
  (response) => response,

  // Error path: handle all error types
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Clear auth and redirect
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register") &&
      localStorage.getItem('token') !== 'mock-token' // DO NOT intercept if using mock token
    ) {
      originalRequest._retry = true;

      // Clear invalid token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminEmail');

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = "/auth/login";
        }
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        // If trying to access admin route without permission, redirect to dashboard
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = "/dashboard";
        }
      }
    }

    // Log error for debugging
    const fullUrl = originalRequest?.baseURL + originalRequest?.url;
    const errorInfo = {
      fullUrl,
      baseURL: originalRequest?.baseURL,
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorInfo);
    } else {
      // In production, log 404s to help debug routing issues
      if (error.response?.status === 404) {
        console.error('API 404 Error - Check if NEXT_PUBLIC_API_URL includes /api:', errorInfo);
      }
    }

    // Enhance error object with additional context
    error.apiError = {
      url: originalRequest?.url,
      method: originalRequest?.method,
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(error);
  }
);

export default api;
