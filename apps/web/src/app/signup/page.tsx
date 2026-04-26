'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { hasAdminAccess } from '@/lib/admin-access'

const ONBOARDING_COMPLETE = 8

export default function Signup() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
          fullName: formData.fullName
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

        let destination = '/welcome'
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('onboarding_seen, onboarding_step, onboarding_complete, is_admin, role')
            .eq('id', user.id)
            .maybeSingle()

          const isAdmin = hasAdminAccess(profile)
          const onboardingStep = Number(profile?.onboarding_step ?? 0)
          const onboardingComplete = Boolean(profile?.onboarding_complete) || onboardingStep >= ONBOARDING_COMPLETE

          if (isAdmin || onboardingComplete) {
            destination = '/cockpit'
          } else if (profile?.onboarding_seen) {
            destination = '/launchpad'
          }
        }

        router.push(destination)
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

  if (!mounted) {
    return (
      <main className="min-h-screen theme-crew flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-text-primary">Create Your Account</h1>
            <p className="text-text-secondary">Preparing secure signup…</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen theme-crew flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <Link href="/" className="mb-8 inline-block text-text-secondary transition-colors hover:text-rocket-500">
          ← Back to Home
        </Link>
        
        <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-10">
          <h1 className="mb-2 text-center text-3xl font-bold text-text-primary">
            Create Your Account
          </h1>
          <p className="mb-8 text-center text-text-secondary">
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
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="hud-input"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="hud-input"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="hud-input"
              />
              <p className="mt-1 text-xs text-text-muted">Minimum 6 characters</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-launch-premium w-full py-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : '3...2...1... LAUNCH! 🚀'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-rocket-500 transition-colors hover:text-text-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
