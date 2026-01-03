/**
 * Logger utility for consistent logging across the application
 * Replaces console.log/error/warn with a more structured approach
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
}

/**
 * Logger class
 */
class Logger {
  constructor() {
    this.isDevelopment = isDevelopment
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (data) {
      return { prefix, message, data }
    }
    return { prefix, message }
  }

  /**
   * Debug log (only in development)
   */
  debug(message, data = null) {
    if (!this.isDevelopment) return
    
    const formatted = this.formatMessage(LogLevel.DEBUG, message, data)
    if (data) {
      console.log(formatted.prefix, formatted.message, formatted.data)
    } else {
      console.log(formatted.prefix, formatted.message)
    }
  }

  /**
   * Info log
   */
  info(message, data = null) {
    const formatted = this.formatMessage(LogLevel.INFO, message, data)
    if (data) {
      console.info(formatted.prefix, formatted.message, formatted.data)
    } else {
      console.info(formatted.prefix, formatted.message)
    }
  }

  /**
   * Warning log
   */
  warn(message, data = null) {
    const formatted = this.formatMessage(LogLevel.WARN, message, data)
    if (data) {
      console.warn(formatted.prefix, formatted.message, formatted.data)
    } else {
      console.warn(formatted.prefix, formatted.message)
    }
  }

  /**
   * Error log
   */
  error(message, error = null) {
    const formatted = this.formatMessage(LogLevel.ERROR, message, error)
    
    if (error) {
      console.error(formatted.prefix, formatted.message, error)
      
      // In production, you might want to send to error tracking service
      if (!this.isDevelopment && typeof window !== 'undefined') {
        // Example: Send to error tracking service (Sentry, etc.)
        // errorTrackingService.captureException(error, { extra: { message } })
      }
    } else {
      console.error(formatted.prefix, formatted.message)
    }
  }

  /**
   * API error log (specific for API errors)
   */
  apiError(endpoint, error) {
    this.error(`API Error [${endpoint}]`, {
      endpoint,
      status: error?.response?.status,
      message: error?.response?.data?.message || error?.message,
      data: error?.response?.data,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const log = {
  debug: (message, data) => logger.debug(message, data),
  info: (message, data) => logger.info(message, data),
  warn: (message, data) => logger.warn(message, data),
  error: (message, error) => logger.error(message, error),
  apiError: (endpoint, error) => logger.apiError(endpoint, error),
}

export default logger

