'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/90 to-brand-purple/90 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-white/80 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-brand-orange text-white px-6 py-2 rounded-lg hover:bg-brand-orange/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}