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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">{page.name}</h1>
        <div className="prose prose-lg">
          {/* Render page content - this would need a proper renderer based on content structure */}
          <pre className="whitespace-pre-wrap">{JSON.stringify(page.content, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}