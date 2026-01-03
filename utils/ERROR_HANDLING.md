# Error Handling Guide

This project uses a comprehensive error handling system that works in both development and production environments.

## Features

- ✅ Consistent error messages across the application
- ✅ Environment-specific error details (dev vs prod)
- ✅ User-friendly error messages
- ✅ Automatic error logging
- ✅ Network error detection and handling
- ✅ Retry logic for retryable errors
- ✅ Error boundaries for React components

## Usage

### 1. Using the Error Handler Utility

```javascript
import { handleApiError, getErrorMessage, logError } from '@/utils/errorHandler';

try {
  const response = await api.get('/endpoint');
} catch (error) {
  const errorDetails = handleApiError(error);
  console.error(errorDetails.message);
  // errorDetails contains: message, type, status, data, isNetworkError, isTimeout
}
```

### 2. Using the useErrorHandler Hook

```javascript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { error, loading, handleError, clearError, execute } = useErrorHandler();

  const fetchData = async () => {
    const result = await execute(
      async () => {
        return await api.get('/data');
      },
      { component: 'MyComponent' }
    );
    
    if (result?.error) {
      // Handle error
      console.error(result.message);
    }
  };

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  );
}
```

### 3. Error Boundaries

Wrap your components with ErrorBoundary:

```javascript
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 4. API Error Handling

The API interceptor automatically handles:
- 401 errors (redirects to login)
- 403 errors (redirects from admin routes)
- Network errors
- Timeout errors

## Error Types

- `NETWORK_ERROR`: Network connection issues
- `TIMEOUT_ERROR`: Request timeout
- `AUTH_ERROR`: Authentication/authorization errors (401, 403)
- `VALIDATION_ERROR`: Input validation errors
- `SERVER_ERROR`: Server-side errors (500+)
- `CLIENT_ERROR`: Client-side errors (400-499)
- `UNKNOWN_ERROR`: Unknown errors

## Environment Behavior

### Development
- Full error messages and stack traces
- Detailed error logging
- Error details in UI

### Production
- User-friendly error messages
- Sanitized error details
- Error tracking ready (Sentry integration ready)

## Best Practices

1. Always use `handleApiError` for API errors
2. Use `useErrorHandler` hook in React components
3. Wrap components with `ErrorBoundary`
4. Log errors with context using `logError`
5. Provide fallback UI for error states
6. Use retry logic for retryable errors

