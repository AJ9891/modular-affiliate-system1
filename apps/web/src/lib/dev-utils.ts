import { useEffect } from 'react'

/**
 * Development debugging utilities
 * Only active in development mode
 */
export const devLog = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[DEV]', ...args)
    }
  },

  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV ERROR]', ...args)
    }
  },

  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DEV WARN]', ...args)
    }
  },

  api: (endpoint: string, method: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🌐 API Call: ${method} ${endpoint}`)
      if (data) {
        console.log('Request data:', data)
      }
      console.groupEnd()
    }
  },

  apiResponse: (endpoint: string, status: number, data?: any, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`📡 API Response: ${endpoint} (${status})`)
      if (error) {
        console.error('Error:', error)
      } else if (data) {
        console.log('Response data:', data)
      }
      console.groupEnd()
    }
  },

  component: (name: string, props?: any, state?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`⚛️ Component: ${name}`)
      if (props) {
        console.log('Props:', props)
      }
      if (state) {
        console.log('State:', state)
      }
      console.groupEnd()
    }
  },

  performance: (label: string, startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime
      console.log(`⏱️ [PERF] ${label}: ${duration}ms`)
    }
  },
}

/**
 * Enhanced fetch wrapper with debugging
 */
export const devFetch = async (url: string, options?: RequestInit) => {
  const startTime = Date.now()

  devLog.api(url, options?.method || 'GET', options?.body)

  try {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)

    devLog.apiResponse(url, response.status, data)
    devLog.performance(`API ${url}`, startTime)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${data?.error || response.statusText}`)
    }

    return { ok: true, data, status: response.status, response }
  } catch (error) {
    devLog.apiResponse(url, 0, null, error)
    devLog.performance(`API ${url} (failed)`, startTime)
    throw error
  }
}

/**
 * Error reporting helper
 */
export const reportError = (error: Error, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
  }

  devLog.error('Error reported:', errorInfo)

  // In development, you might want to send this to a logging service
  // In production, you'd send to your error tracking service like Sentry
  if (process.env.NODE_ENV === 'development') {
    console.table(errorInfo)
  }
}

/**
 * React hook for error handling with dev logging
 */
export const useErrorHandler = (componentName: string) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError(event.error, `${componentName} - Unhandled Error`)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(String(event.reason)), `${componentName} - Unhandled Promise Rejection`)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }
  }, [componentName])

  return { reportError: (error: Error) => reportError(error, componentName) }
}
