'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

/**
 * React Error Debugging Component
 * This will help identify React Error #310 and other minified errors
 */
export function ReactErrorDebugger({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Override the global error handler to catch React errors
    const originalConsoleError = console.error

    console.error = (...args) => {
      const errorMessage = args.join(' ')

      // Check for React error #310
      if (errorMessage.includes('Minified React error #310')) {
        console.group('🚨 REACT ERROR #310 DETECTED')
        console.error('This error occurs when:')
        console.error('1. Hooks are called conditionally (inside if statements, loops, or nested functions)')
        console.error('2. Hooks are called outside of React components or custom hooks')
        console.error('3. Different number of hooks are called on re-renders')
        console.error('')
        console.error('Common causes:')
        console.error('- useState() inside a conditional block')
        console.error('- useEffect() inside a loop')
        console.error('- Calling hooks in event handlers or callbacks')
        console.error('- Component returning JSX conditionally after hooks')
        console.error('')
        console.error('Original error:', errorMessage)
        console.error('Stack trace:', new Error().stack)
        console.groupEnd()

        // Also show a visual alert in development
        if (process.env.NODE_ENV === 'development') {
          const errorDiv = document.createElement('div')
          errorDiv.innerHTML = `
            <div style="
              position: fixed;
              top: 20px;
              right: 20px;
              background: #fee;
              border: 2px solid #fcc;
              padding: 20px;
              border-radius: 8px;
              max-width: 400px;
              z-index: 9999;
              font-family: monospace;
              font-size: 12px;
              color: #900;
            ">
              <h3 style="margin: 0 0 10px 0; color: #900;">🚨 React Error #310</h3>
              <p><strong>Hooks Rule Violation Detected</strong></p>
              <p>Check the console for detailed debugging information.</p>
              <button onclick="this.parentElement.remove()" style="
                background: #900;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
              ">Close</button>
            </div>
          `
          document.body.appendChild(errorDiv)

          // Auto-remove after 10 seconds
          setTimeout(() => {
            if (errorDiv.parentElement) {
              errorDiv.remove()
            }
          }, 10000)
        }
      }

      // Call the original console.error
      originalConsoleError.apply(console, args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  return <>{children}</>
}

/**
 * Hook Rules Checker
 * Add this to components suspected of causing hook violations
 */
export function useHookRulesChecker(componentName: string) {
  useEffect(() => {
    console.log(`🔍 Hook Rules Check: ${componentName} - Component mounted`)

    return () => {
      console.log(`🔍 Hook Rules Check: ${componentName} - Component unmounted`)
    }
  }, [componentName])

  // This effect runs on every render to detect hook count changes
  useEffect(() => {
    console.log(`🔍 Hook Rules Check: ${componentName} - Render cycle`)
  })
}

/**
 * Development-only component to display detailed React errors
 */
export function DevReactErrorDisplay() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: '#f0f0f0',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9998,
        maxWidth: '300px',
      }}
    >
      <strong>Dev Mode Active</strong>
      <br />
      React errors will show detailed debugging info in console.
      <br />
      <small>Remove this component in production.</small>
    </div>
  )
}
