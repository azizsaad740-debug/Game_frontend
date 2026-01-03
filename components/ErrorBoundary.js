'use client'

import { Component } from 'react'
import Link from 'next/link'

const isDevelopment = process.env.NODE_ENV === 'development'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })

    this.setState({ errorInfo })

    // TODO: Send to error tracking service in production
    // if (!isDevelopment && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   })
    // }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state
      const errorMessage = error?.message || 'An unexpected error occurred'

      return (
        <div className="flex min-h-screen items-center justify-center bg-background-dark p-4">
          <div className="max-w-lg w-full bg-component-dark rounded-lg p-8 border border-red-500/20 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-red-500/10 rounded-full">
                <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
              </div>
              
              <h1 className="text-white text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-white/70 text-sm mb-6">
                {isDevelopment 
                  ? errorMessage
                  : 'We\'re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.'
                }
              </p>

              {isDevelopment && error && (
                <div className="w-full mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-left">
                  <p className="text-red-400 text-xs font-mono break-all mb-2">
                    <strong>Error:</strong> {error.toString()}
                  </p>
                  {errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="text-red-300 text-xs cursor-pointer mb-2">
                        Component Stack
                      </summary>
                      <pre className="text-red-300/70 text-xs overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-red-300 text-xs cursor-pointer mb-2">
                        Stack Trace
                      </summary>
                      <pre className="text-red-300/70 text-xs overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors"
                >
                  Reload Page
                </button>
                <Link
                  href="/"
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors text-center"
                >
                  Go Home
                </Link>
              </div>

              {!isDevelopment && (
                <p className="mt-6 text-xs text-white/50">
                  Error ID: {Date.now()}
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
