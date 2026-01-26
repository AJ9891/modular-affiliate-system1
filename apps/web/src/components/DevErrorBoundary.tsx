'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class DevErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[DEV ERROR BOUNDARY] Error caught:', error);
    console.error('[DEV ERROR BOUNDARY] Error info:', errorInfo);
    console.error('[DEV ERROR BOUNDARY] Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });
    
    // In development, also log to a more detailed format
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary - Detailed Debug Info');
      console.error('Error:', error.name);
      console.error('Message:', error.message);
      console.error('Stack trace:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Development error display
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="min-h-screen bg-red-50 p-8">
            <div className="mx-auto max-w-4xl">
              <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-red-900">Development Error</h1>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Details</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-mono text-sm text-red-600"><strong>Type:</strong> {this.state.error?.name}</p>
                      <p className="font-mono text-sm text-red-600 mt-1"><strong>Message:</strong> {this.state.error?.message}</p>
                    </div>
                  </div>
                  
                  {this.state.error?.stack && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Stack Trace</h2>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Component Stack</h2>
                      <pre className="bg-blue-900 text-blue-100 p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <button 
                      onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="ml-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // Production error display
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We apologize for the inconvenience. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}