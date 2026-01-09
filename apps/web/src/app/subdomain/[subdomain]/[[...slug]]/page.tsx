'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface FunnelData {
  id: string
  name: string
  slug: string
  config: any
}

interface SubdomainData {
  funnel?: FunnelData
  owner: {
    id: string
    name: string
    subdomain: string
  }
  message?: string
}

export default function SubdomainPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<SubdomainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subdomain = params.subdomain as string
  const slug = params.slug as string[] || []

  useEffect(() => {
    async function fetchSubdomainData() {
      try {
        const url = `/api/subdomain/${subdomain}${slug.length > 0 ? `/${slug.join('/')}` : ''}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err.message || 'Failed to load subdomain data')
      } finally {
        setLoading(false)
      }
    }

    if (subdomain) {
      fetchSubdomainData()
    }
  }, [subdomain, slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (data?.message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            {data.message}
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            {data.owner.name}'s site is launching soon
          </p>
          <p className="text-lg text-gray-500">
            {subdomain}.launchpad4success.com
          </p>
        </div>
      </div>
    )
  }

  if (data?.funnel) {
    // Render the funnel based on its configuration
    return (
      <div className="min-h-screen">
        {/* This would be replaced with your funnel renderer component */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {data.funnel.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              by {data.owner.name}
            </p>
            
            {/* Funnel content would be rendered here based on data.funnel.config */}
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-600">
                Funnel content will be rendered here based on the funnel configuration.
              </p>
              <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-sm overflow-auto">
                {JSON.stringify(data.funnel.config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to {data?.owner.name}'s Site
        </h1>
        <p className="text-xl text-gray-600">
          No funnels are currently published.
        </p>
      </div>
    </div>
  )
}