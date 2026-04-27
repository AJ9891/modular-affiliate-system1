'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Page {
  id: string
  name: string
  content: any
  funnel_id: string
}

export default function PublicPage() {
  const params = useParams()
  const slug = params.slug as string

  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPage()
  }, [slug])

  async function loadPage() {
    try {
      const res = await fetch(`/api/pages/public/${slug}`)
      if (!res.ok) throw new Error('Page not found')
      const data = await res.json()
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-rocket-500"></div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-premium text-center">
          <h1 className="mb-4 text-2xl font-bold text-text-primary">Page Not Found</h1>
          <p className="text-text-secondary">The page you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cockpit-container min-h-screen py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-text-primary">{page.name}</h1>
        <div className="prose prose-lg">
          {/* Render page content - this would need a proper renderer based on content structure */}
          <pre className="whitespace-pre-wrap rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] p-4 text-text-secondary">{JSON.stringify(page.content, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
