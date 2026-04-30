'use client'

import { useState } from 'react'
import { lookupGoogleKeywords } from '@/lib/api/content-automation'

interface KeywordLookupPanelProps {
  onKeywordSelected: (keyword: string) => void
}

export default function KeywordLookupPanel({ onKeywordSelected }: KeywordLookupPanelProps) {
  const [query, setQuery] = useState('')
  const [locale, setLocale] = useState('en-US')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<Array<{ keyword: string; source: string }>>([])

  async function runLookup() {
    if (!query.trim()) {
      setError('Enter a keyword seed first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await lookupGoogleKeywords({ query: query.trim(), locale })
      setKeywords(result.keywords)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed keyword lookup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="hud-panel space-y-3">
      <div>
        <p className="text-xs uppercase tracking-system text-text-secondary">Google Keywords</p>
        <h2 className="text-lg font-semibold text-text-primary">Keyword Lookup</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="hud-input"
          placeholder="Seed keyword"
        />
        <input
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
          className="hud-input"
          placeholder="Locale (en-US)"
        />
        <button type="button" onClick={runLookup} disabled={loading} className="hud-button-primary px-4 py-2">
          {loading ? 'Looking up...' : 'Lookup Keywords'}
        </button>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {keywords.length > 0 && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {keywords.map((item) => (
            <button
              key={item.keyword}
              type="button"
              className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] px-3 py-2 text-left text-sm text-text-primary hover:border-rocket-500/35"
              onClick={() => onKeywordSelected(item.keyword)}
            >
              <div className="font-medium">{item.keyword}</div>
              <div className="text-xs text-text-secondary">{item.source}</div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
