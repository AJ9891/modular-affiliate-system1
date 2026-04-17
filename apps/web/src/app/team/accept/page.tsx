'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      acceptInvite(token)
    } else {
      setError('No invite token provided')
      setLoading(false)
    }
  }, [searchParams])

  async function acceptInvite(token: string) {
    try {
      const response = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in - redirect to login with return URL
          router.push(`/login?redirect=/team/accept?token=${token}`)
          return
        }
        throw new Error(data.error || 'Failed to accept invite')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/team')
      }, 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-premium w-full max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500"></div>
          <h2 className="text-xl font-bold text-text-primary">Accepting Invite...</h2>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-premium w-full max-w-md rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="mb-2 text-2xl font-bold text-text-primary">Welcome to the Team!</h2>
          <p className="mb-6 text-text-secondary">
            You've successfully joined the team. Redirecting to team page...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-premium w-full max-w-md rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-text-primary">Invite Error</h2>
          <p className="mb-6 text-red-200">{error}</p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="btn-launch-premium block w-full px-6 py-3 font-semibold"
            >
              Login
            </Link>
            <Link
              href="/team"
              className="hud-button-secondary block w-full px-6 py-3 font-semibold"
            >
              Go to Team Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-premium w-full max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500"></div>
          <h2 className="text-xl font-bold text-text-primary">Loading...</h2>
        </div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}
