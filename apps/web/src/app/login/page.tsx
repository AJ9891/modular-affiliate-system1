'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setError('Server error: Invalid response format')
        setLoading(false)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
      }

      router.push('/cockpit')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen theme-command flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="text-white/80 hover:text-white text-sm inline-flex items-center gap-2 transition">
          ← Back to Home
        </Link>

        <div className="glass-tile p-8 border border-white/15 bg-black/30">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Access</p>
            <h1 className="text-3xl font-semibold text-white">Log In</h1>
            <p className="text-white/70 text-sm mt-1">Authenticate to enter the flight deck.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-white/20 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-white/20 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-6">
            Don’t have an account?{' '}
            <Link href="/signup" className="text-cyan-300 font-semibold hover:text-white transition">
              Sign up free
            </Link>
          </p>

          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg text-white/80 text-sm">
            <strong>First time here?</strong> Create an account first, then you can access the deck.
          </div>
        </div>
      </div>
    </main>
  )
}
