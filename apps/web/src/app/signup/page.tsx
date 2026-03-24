'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

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
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
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
              disabled={loading}
              className="w-full btn-launch py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : '3...2...1... LAUNCH! 🚀'}
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
