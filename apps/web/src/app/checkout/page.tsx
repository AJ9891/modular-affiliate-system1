import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function CheckoutFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 px-4 py-12">
      <div className="mx-auto max-w-6xl animate-pulse text-center text-blue-100">
        Loading secure checkout...
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutClient />
    </Suspense>
  )
}
