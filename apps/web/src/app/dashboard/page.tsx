'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // Clear session and redirect to home
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            Launchpad<span className="text-yellow-400">4</span>Success
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your funnels</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <div className="text-sm text-gray-600 mb-1">Total Funnels</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
            <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
            <div className="text-sm text-gray-600 mb-1">Conversions</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Revenue</div>
            <div className="text-3xl font-bold">$0</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/builder"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600">Create New Funnel</h3>
              <p className="text-sm text-gray-600">Start building a new affiliate funnel</p>
            </Link>
            
            <Link
              href="/offers"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">Manage Offers</h3>
              <p className="text-sm text-gray-600">Add and track affiliate offers</p>
            </Link>
            
            <Link
              href="/analytics"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-600">View Analytics</h3>
              <p className="text-sm text-gray-600">Track clicks and conversions</p>
            </Link>
            
            <Link
              href="/niches"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600">Browse Niches</h3>
              <p className="text-sm text-gray-600">Explore pre-built niche modules</p>
            </Link>
            
            <Link
              href="/features"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">View Analytics</h3>
              <p className="text-sm text-gray-600">Track your funnel performance</p>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">Ready to Launch Your First Funnel?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            You haven't created any funnels yet. Let's get started by choosing a niche and building your first high-converting funnel!
          </p>
          <Link
            href="/builder"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Create Your First Funnel
          </Link>
        </div>
      </div>
    </main>
  )
}
