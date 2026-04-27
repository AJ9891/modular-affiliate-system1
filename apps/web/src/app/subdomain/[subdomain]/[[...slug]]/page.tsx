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
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-rocket-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-premium text-center">
          <h1 className="mb-4 text-4xl font-bold text-text-primary">404</h1>
          <p className="mb-8 text-xl text-text-secondary">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-launch-premium px-6 py-3"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (data?.message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-premium text-center">
          <h1 className="mb-4 text-6xl font-bold text-text-primary">
            {data.message}
          </h1>
          <p className="mb-4 text-2xl text-text-secondary">
            {data.owner.name}'s site is launching soon
          </p>
          <p className="text-lg text-text-muted">
            {subdomain}.launchpad4success.pro
          </p>
        </div>
      </div>
    )
  }

  if (data?.funnel) {
    // Render the funnel based on its configuration
    return (
      <div className="cockpit-container min-h-screen py-8">
        {/* This would be replaced with your funnel renderer component */}
        <div className="mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-text-primary">
              {data.funnel.name}
            </h1>
            <p className="mb-8 text-xl text-text-secondary">
              by {data.owner.name}
            </p>
            
            {/* Funnel content would be rendered here based on data.funnel.config */}
            <div className="max-w-4xl mx-auto">
              <p className="text-text-secondary">
                Funnel content will be rendered here based on the funnel configuration.
              </p>
              <pre className="mt-4 overflow-auto rounded border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] p-4 text-left text-sm text-text-secondary">
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
      <div className="card-premium text-center">
        <h1 className="mb-4 text-4xl font-bold text-text-primary">
          Welcome to {data?.owner.name}'s Site
        </h1>
        <p className="text-xl text-text-secondary">
          No funnels are currently published.
        </p>
      </div>
    </div>
  )
}
