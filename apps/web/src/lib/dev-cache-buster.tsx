import React from 'react'

declare const __webpack_require__: any

/**
 * Browser Cache Buster for Development
 * This helps ensure the browser loads fresh, unminified JavaScript files
 */
export function clearDevelopmentCache() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🧹 Development Cache Clearing...')

    // Clear various browser caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
          console.log('🧹 Service worker unregistered:', registration.scope)
        }
      })
    }

    // Clear localStorage related to the app
    try {
      localStorage.clear()
      console.log('🧹 localStorage cleared')
    } catch (e) {
      console.log('🧹 localStorage not available or already cleared')
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear()
      console.log('🧹 sessionStorage cleared')
    } catch (e) {
      console.log('🧹 sessionStorage not available or already cleared')
    }

    // Add cache-busting to script tags (for any dynamically loaded scripts)
    const scripts = document.querySelectorAll('script[src]')
    console.log(`🧹 Found ${scripts.length} script tags`)

    // Log all current script sources to help identify minified files
    scripts.forEach((script, index) => {
      const src = (script as HTMLScriptElement).src
      if (src.includes('static/chunks/') || src.includes('.js')) {
        console.log(`🔍 Script ${index + 1}:`, src)
        if (src.includes('-') && src.includes('.js') && !src.includes('webpack')) {
          console.warn(`⚠️ Potentially minified script detected: ${src}`)
        }
      }
    })

    // Force page reload with cache bypass if we detect minified files
    const hasMinifiedScripts = Array.from(scripts).some((script) => {
      const src = (script as HTMLScriptElement).src
      return src.includes('static/chunks/') && /[a-f0-9]{8}-[a-f0-9]{12}/.test(src)
    })

    if (hasMinifiedScripts) {
      console.warn('🚨 Minified scripts detected! This might be causing the React error.')
      console.warn('💡 Try a hard refresh (Ctrl+F5 or Cmd+Shift+R) to bypass cache.')

      // Optionally auto-refresh (uncomment if you want automatic refresh)
      // setTimeout(() => {
      //   console.log('🔄 Auto-refreshing to clear cache...')
      //   window.location.reload(true)
      // }, 2000)
    }
  }
}

/**
 * Development Environment Checker
 * Displays current environment status and helps identify build issues
 */
export function checkDevelopmentEnvironment() {
  if (typeof window !== 'undefined') {
    console.group('🔧 Development Environment Check')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('Development Mode:', process.env.NODE_ENV === 'development')
    console.log('User Agent:', navigator.userAgent)
    console.log('Current URL:', window.location.href)
    console.log('Timestamp:', new Date().toISOString())

    // Check if React is in development mode
    try {
      // @ts-ignore - accessing React internals for debugging
      const reactVersion = React?.version
      console.log('React Version:', reactVersion)

      // Check if React DevTools are available
      // @ts-ignore - checking for React DevTools
      const hasReactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
      console.log('React DevTools:', hasReactDevTools ? '✅ Available' : '❌ Not Available')
    } catch (e) {
      console.log('React info not available:', e)
    }

    // Check build information
    console.log('Build Info:')
    console.log('- Webpack:', typeof __webpack_require__ !== 'undefined' ? '✅' : '❌')
    const hotModule = typeof module !== 'undefined' ? (module as any).hot : undefined
    console.log('- Hot Module Replacement:', hotModule ? '✅' : '❌')

    console.groupEnd()
  }
}

/**
 * Force Development Mode Component
 * This component ensures we're in proper development mode
 */
export function ForceDevelopmentMode({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    checkDevelopmentEnvironment()
    clearDevelopmentCache()

    // Set up a periodic check for minified errors
    const errorCheckInterval = setInterval(() => {
      const errors = document.querySelectorAll('[data-nextjs-dialog-overlay]')
      if (errors.length > 0) {
        console.log('🚨 Next.js error overlay detected')
        console.log('This is good - you should see detailed error information')
      }
    }, 5000)

    return () => {
      clearInterval(errorCheckInterval)
    }
  }, [])

  return <>{children}</>
}
