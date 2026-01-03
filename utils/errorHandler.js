/**
 * Comprehensive Error Handling Utility
 * Provides consistent error handling across the application
 * Works in both development and production environments
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Translation function - will be set by useTranslation hook
let translateFunction = null;

/**
 * Set the translation function
 */
export const setTranslationFunction = (t) => {
  translateFunction = t;
};

/**
 * Get translated error message
 */
const getTranslatedError = (key, fallback) => {
  if (translateFunction && typeof translateFunction === 'function') {
    const translated = translateFunction(`errors.${key}`);
    // If translation returns the key (not found), use fallback
    return translated !== `errors.${key}` ? translated : fallback;
  }
  return fallback;
};

/**
 * Error types enum
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Get user-friendly error message based on error type
 */
export const getErrorMessage = (error, defaultMessage = null) => {
  // If it's already a user-friendly string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Handle Axios errors
  if (error?.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    // Use server message if available (but try to translate common patterns)
    if (serverMessage) {
      // Try to map common server messages to translation keys
      const messageLower = serverMessage.toLowerCase();
      if (messageLower.includes('token expired') || messageLower.includes('token inval')) {
        return getTranslatedError('tokenExpired', serverMessage);
      }
      if (messageLower.includes('unauthorized') || messageLower.includes('no access token')) {
        return getTranslatedError('noAccessToken', serverMessage);
      }
      if (messageLower.includes('banned')) {
        return getTranslatedError('accountBanned', serverMessage);
      }
      if (messageLower.includes('insufficient balance') || messageLower.includes('yetersiz bakiye')) {
        return getTranslatedError('insufficientBalance', serverMessage);
      }
      if (messageLower.includes('iban') && messageLower.includes('required')) {
        return getTranslatedError('ibanRequired', serverMessage);
      }
      if (messageLower.includes('kyc')) {
        if (messageLower.includes('required')) {
          return getTranslatedError('kycRequired', serverMessage);
        }
        if (messageLower.includes('pending')) {
          return getTranslatedError('kycPending', serverMessage);
        }
        if (messageLower.includes('rejected')) {
          return getTranslatedError('kycRejected', serverMessage);
        }
      }
      return serverMessage;
    }

    // Fallback to status-based messages with translation
    switch (status) {
      case 400:
        return getTranslatedError('invalidRequest', 'Invalid request. Please check your input and try again.');
      case 401:
        return getTranslatedError('sessionExpired', 'Your session has expired. Please log in again.');
      case 403:
        return getTranslatedError('noPermission', 'You do not have permission to perform this action.');
      case 404:
        return getTranslatedError('notFound', 'The requested resource was not found.');
      case 409:
        return getTranslatedError('conflict', 'This action conflicts with existing data.');
      case 422:
        return getTranslatedError('validationError', 'Validation error. Please check your input.');
      case 429:
        return getTranslatedError('tooManyRequests', 'Too many requests. Please try again later.');
      case 500:
        return getTranslatedError('serverError', 
          isDevelopment
            ? `Server error: ${error.response.data?.error || 'Internal server error'}`
            : 'Server error. Please try again later or contact support.');
      case 502:
      case 503:
        return getTranslatedError('serviceUnavailable', 'Service temporarily unavailable. Please try again later.');
      default:
        return getTranslatedError('unexpectedError',
          isDevelopment
            ? `Error ${status}: ${serverMessage || 'Unknown error'}`
            : 'An error occurred. Please try again.');
    }
  }

  // Handle network errors
  if (error?.request) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return getTranslatedError('timeoutError', 'Request timed out. Please check your internet connection and try again.');
    }
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return getTranslatedError('networkError', 'Network error. Please check your internet connection and ensure the server is running.');
    }
    if (error.code === 'ERR_CORS') {
      return getTranslatedError('corsError', 'CORS error. Please contact support if this persists.');
    }
    return getTranslatedError('connectionError', 'Unable to connect to server. Please check your internet connection.');
  }

  // Handle validation errors
  if (error?.name === 'ValidationError') {
    return getTranslatedError('validationError', error.message || 'Validation error. Please check your input.');
  }

  // Handle generic errors
  if (error?.message) {
    // In development, show full error message
    if (isDevelopment) {
      return error.message;
    }
    // In production, sanitize error messages
    if (error.message.includes('Network') || error.message.includes('timeout')) {
      return getTranslatedError('networkError', 'Network error. Please check your connection.');
    }
    return getTranslatedError('unexpectedError', defaultMessage || 'An unexpected error occurred. Please try again.');
  }

  return getTranslatedError('unexpectedError', defaultMessage || 'An unexpected error occurred. Please try again.');
};

/**
 * Get error type from error object
 */
export const getErrorType = (error) => {
  if (error?.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return ErrorTypes.AUTH;
    }
    if (status >= 500) {
      return ErrorTypes.SERVER;
    }
    if (status >= 400) {
      return ErrorTypes.CLIENT;
    }
  }

  if (error?.request) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return ErrorTypes.TIMEOUT;
    }
    return ErrorTypes.NETWORK;
  }

  if (error?.name === 'ValidationError') {
    return ErrorTypes.VALIDATION;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Log error with appropriate level
 */
export const logError = (error, context = {}) => {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const errorDetails = {
    type: errorType,
    message: errorMessage,
    context,
    timestamp: new Date().toISOString(),
  };

  // In development, log full error details
  if (isDevelopment) {
    console.error('Error Details:', {
      ...errorDetails,
      originalError: error,
      stack: error?.stack,
      response: error?.response?.data,
    });
  } else {
    // In production, log sanitized error
    console.error('Error:', errorDetails);
  }

  // TODO: Send to error tracking service (e.g., Sentry) in production
  // if (!isDevelopment && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }

  return errorDetails;
};

/**
 * Handle API error with user-friendly message
 */
export const handleApiError = (error, customMessage = null) => {
  const errorDetails = logError(error, { source: 'API' });
  
  return {
    message: customMessage || errorDetails.message,
    type: errorDetails.type,
    status: error?.response?.status,
    data: error?.response?.data,
    isNetworkError: !error?.response && error?.request,
    isTimeout: error?.code === 'ECONNABORTED' || error?.message?.includes('timeout'),
  };
};

/**
 * Create error object with consistent structure
 */
export const createError = (message, type = ErrorTypes.UNKNOWN, details = {}) => {
  return {
    message,
    type,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  // Network errors are usually retryable
  if (!error?.response && error?.request) {
    return true;
  }

  // 5xx errors are retryable
  if (error?.response?.status >= 500) {
    return true;
  }

  // Timeout errors are retryable
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return true;
  }

  // 429 (Too Many Requests) is retryable after delay
  if (error?.response?.status === 429) {
    return true;
  }

  return false;
};

/**
 * Get retry delay in milliseconds
 */
export const getRetryDelay = (attempt = 1, baseDelay = 1000) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
};

