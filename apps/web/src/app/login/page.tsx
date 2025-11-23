'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

      const data = await response.json()

      if (!response.ok) {
        // Show specific error message from API
        setError(data.error || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <Link href="/" className="text-white hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Log in to your Launchpad4Success account
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In 🚀'}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>First time here?</strong> Create an account first by clicking "Sign up free" above.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
