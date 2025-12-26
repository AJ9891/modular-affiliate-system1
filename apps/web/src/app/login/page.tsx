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

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType)
        setError('Server error: Invalid response format')
        setLoading(false)
        return
      }

      const text = await response.text()
      console.log('Login response:', text)

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', text)
        setError('Server error: Invalid response data')
        setLoading(false)
        return
      }

      if (!response.ok) {
        // Show specific error message from API
        setError(data.error || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      // Set the session on the client-side
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
      }

      // Success - redirect to dashboard
      console.log('Login successful, redirecting to dashboard')
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
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
            Welcome Back
          </h1>
          <p className="text-brand-purple text-center mb-8">
            Log in to your Launchpad4Success account
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-brand-purple">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-brand-purple/30 rounded-lg focus:border-brand-cyan focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-launch py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In 🚀'}
            </button>
          </form>
          
          <p className="text-center text-sm text-brand-purple mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-cyan font-semibold hover:text-brand-orange transition-colors">
              Sign up free
            </Link>
          </p>

          <div className="mt-6 p-4 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg">
            <p className="text-sm text-brand-navy">
              <strong>First time here?</strong> Create an account first by clicking "Sign up free" above.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
