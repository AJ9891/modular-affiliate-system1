'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'

interface Funnel {
  funnel_id: string
  name: string
  slug: string
  blocks: {
    template: string
    niche: string
    blocks: any[]
  }
}

export default function FunnelEditorPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const router = useRouter()

  const [funnel, setFunnel] = useState<Funnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadFunnel()
  }, [slug, user])

  async function loadFunnel() {
    try {
      const res = await fetch(`/api/funnels/slug/${slug}`)
      if (!res.ok) throw new Error('Funnel not found')
      const data = await res.json()
      setFunnel(data.funnel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load funnel')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Funnel Not Found</h1>
          <p className="text-gray-600">The funnel you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedFunnelBuilder
        initialNiche={funnel.blocks.niche}
        funnelId={funnel.funnel_id}
      />
    </div>
  )
}