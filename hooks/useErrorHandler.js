/**
 * React Hook for Error Handling
 * Provides easy error handling in React components
 */

import { useState, useCallback, useEffect } from 'react';
import { handleApiError, getErrorMessage as getErrorMsgUtil, logError, setTranslationFunction } from '@/utils/errorHandler';
import { useTranslation } from '@/hooks/useTranslation';

export const useErrorHandler = () => {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize translation function in error handler
  useEffect(() => {
    setTranslationFunction(t);
  }, [t]);

  /**
   * Handle error and set error state
   */
  const handleError = useCallback((err, context = {}) => {
    const errorDetails = handleApiError(err);
    logError(err, context);
    setError(errorDetails);
    return errorDetails;
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute async function with error handling
   */
  const execute = useCallback(async (asyncFn, context = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      return handleError(err, context);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback((err) => {
    if (!err) return null;
    return typeof err === 'string' ? err : getErrorMsgUtil(err);
  }, []);

  return {
    error,
    loading,
    handleError,
    clearError,
    execute,
    getErrorMessage,
  };
};

