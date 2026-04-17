'use client'

import { useEffect } from 'react'

/**
 * Simple React Error #310 Detector
 * This page will help identify what's causing the minified React error
 */
export default function ReactErrorDebugPage() {
  useEffect(() => {
    console.log('🔧 React Error Debug Page loaded')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Development mode:', process.env.NODE_ENV === 'development')
    
    // Override console.error to catch React errors
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('Minified React error #310')) {
        console.group('🚨 REACT ERROR #310 CAUGHT!')
        console.error('This is the "Rules of Hooks" violation error.')
        console.error('Common causes:')
        console.error('1. Conditional hook calls')
        console.error('2. Hook calls in loops')
        console.error('3. Hook calls in event handlers')
        console.error('4. Hook calls after early returns')
        console.error('Stack trace at time of error:')
        console.error(new Error().stack)
        console.groupEnd()
      }
      originalError.apply(console, args)
    }
    
    return () => {
      console.error = originalError
    }
  }, [])

  return (
    <div className="cockpit-container min-h-screen py-8">
      <div className="mx-auto max-w-4xl">
        <div className="card-premium rounded-lg p-6">
          <h1 className="mb-4 text-2xl font-bold text-text-primary">🔧 React Error Debug Page</h1>
          
          <div className="space-y-4">
            <div className="rounded border border-sky-400/30 bg-sky-500/10 p-4">
              <h2 className="mb-2 font-semibold text-sky-100">Development Environment Status</h2>
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Development Mode:</strong> {process.env.NODE_ENV === 'development' ? '✅ Active' : '❌ Not Active'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
            
            <div className="rounded border border-emerald-400/30 bg-emerald-500/10 p-4">
              <h2 className="mb-2 font-semibold text-emerald-100">✅ What's Working</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>This page loaded successfully</li>
                <li>React hooks are working here (useEffect called)</li>
                <li>Console error overrides are active</li>
                <li>Development environment is properly configured</li>
              </ul>
            </div>
            
            <div className="rounded border border-amber-400/30 bg-amber-500/10 p-4">
              <h2 className="mb-2 font-semibold text-amber-100">🔍 Instructions</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Open your browser's Developer Tools</strong> (F12 or right-click → Inspect)</li>
                <li><strong>Go to the Console tab</strong></li>
                <li><strong>Navigate to the page with the error</strong></li>
                <li><strong>Look for the detailed error information</strong> that will now appear</li>
                <li>If you still see minified errors, try a <strong>hard refresh</strong> (Ctrl+F5 or Cmd+Shift+R)</li>
              </ol>
            </div>
            
            <div className="rounded border border-red-400/30 bg-red-500/10 p-4">
              <h2 className="mb-2 font-semibold text-red-100">🚨 If React Error #310 Occurs</h2>
              <p className="mb-2">You'll see detailed debugging info in the console. The error typically means:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Conditional Hooks:</strong> useState, useEffect, etc. called inside if statements</li>
                <li><strong>Hook Order Changes:</strong> Different number of hooks on re-renders</li>
                <li><strong>Hooks in Wrong Places:</strong> Called in event handlers or after early returns</li>
              </ul>
            </div>

            <div className="rounded border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] p-4">
              <h2 className="mb-2 font-semibold text-text-primary">🛠️ Quick Actions</h2>
              <div className="space-x-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="hud-button-secondary px-4 py-2"
                >
                  Reload Page
                </button>
                <button 
                  onClick={() => {
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.reload()
                  }}
                  className="hud-button-danger px-4 py-2"
                >
                  Clear Cache & Reload
                </button>
                <button 
                  onClick={() => {
                    console.clear()
                    console.log('🧹 Console cleared. Navigate to error page now.')
                  }}
                  className="btn-launch-premium px-4 py-2"
                >
                  Clear Console
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
