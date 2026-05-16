'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [betaInviteToken, setBetaInviteToken] = useState('')
  const [betaInviteEmailLocked, setBetaInviteEmailLocked] = useState(false)
  const [betaInviteLoading, setBetaInviteLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = searchParams.get('betaInvite')
    if (!token) return

    let active = true
    setBetaInviteToken(token)
    setBetaInviteLoading(true)

    async function resolveInvite() {
      try {
        const response = await fetch(`/api/beta/invite?token=${encodeURIComponent(token)}`)
        const data = (await response.json().catch(() => ({}))) as {
          valid?: boolean
          email?: string
          full_name?: string
          alreadyAccepted?: boolean
          error?: string
        }

        if (!active) return

        if (!response.ok || !data.valid || !data.email) {
          setError(data.error || 'Invalid beta invite link')
          return
        }

        setFormData((prev) => ({
          ...prev,
          email: data.email || prev.email,
          fullName: prev.fullName || data.full_name || prev.fullName,
        }))
        setBetaInviteEmailLocked(true)

        if (data.alreadyAccepted) {
          setNotice('This invite was already accepted. If you already have an account, log in instead.')
        } else {
          setNotice('Beta invite confirmed. Complete signup to activate your tester access.')
        }
      } catch {
        if (active) setError('Unable to validate beta invite')
      } finally {
        if (active) setBetaInviteLoading(false)
      }
    }

    resolveInvite()
    return () => {
      active = false
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          betaInvite: betaInviteToken || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Attempt immediate login for a smooth onboarding handoff.
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        if (loginData.session) {
          await supabase.auth.setSession({
            access_token: loginData.session.access_token,
            refresh_token: loginData.session.refresh_token
          })
        }
        router.push('/welcome')
        return
      }

      setNotice('Account created. Log in to begin onboarding.')
      router.push('/login?redirectTo=/welcome')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-brand-gradient launch-pad flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <Link href="/" className="text-white hover:text-brand-cyan mb-8 inline-block transition-colors">
          ← Back to Home
        </Link>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border-2 border-brand-purple/20">
          <h1 className="text-3xl font-bold mb-2 text-center text-brand-navy">
            Create Your Account
          </h1>
          <p className="text-brand-purple text-center mb-8">
            Start building funnels in minutes
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {notice}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                readOnly={betaInviteEmailLocked}
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
              {betaInviteEmailLocked && (
                <p className="text-xs text-brand-purple mt-1">Email is locked to the invite recipient.</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
              <p className="text-xs text-brand-purple mt-1">Minimum 6 characters</p>
            </div>
            
            <button
              type="submit"
              disabled={loading || betaInviteLoading}
              className="w-full btn-launch py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || betaInviteLoading ? 'Creating Account...' : '3...2...1... LAUNCH! 🚀'}
            </button>
          </form>
          
          <p className="text-center text-sm text-brand-purple mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-cyan font-semibold hover:text-brand-orange transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function Signup() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-brand-gradient launch-pad flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border-2 border-brand-purple/20">
              <h1 className="text-3xl font-bold mb-2 text-center text-brand-navy">Create Your Account</h1>
              <p className="text-brand-purple text-center mb-2">Loading signup…</p>
            </div>
          </div>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  )
}
