'use client'

import { useEffect, useState } from 'react'
import {
  generateContent,
  listCmsIntegrations,
  listPublishSchedules,
  saveCmsIntegration,
  type CmsIntegrationItem,
  type ContentScheduleItem,
  type GeneratedContentPayload,
} from '@/lib/api/content-automation'
import KeywordLookupPanel from './KeywordLookupPanel'
import ScheduleComposer from './ScheduleComposer'

export default function ContentAutomationWorkspace() {
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [tone, setTone] = useState<'professional' | 'casual' | 'urgent' | 'friendly'>('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [content, setContent] = useState<GeneratedContentPayload | null>(null)
  const [funnelId, setFunnelId] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const [schedules, setSchedules] = useState<ContentScheduleItem[]>([])
  const [integrations, setIntegrations] = useState<CmsIntegrationItem[]>([])

  const [provider, setProvider] = useState('webhook')
  const [targetUrl, setTargetUrl] = useState('')
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'header'>('none')
  const [authValue, setAuthValue] = useState('')
  const [savingIntegration, setSavingIntegration] = useState(false)

  async function loadSchedules() {
    try {
      const response = await listPublishSchedules()
      setSchedules(response.schedules)
    } catch {
      // non-blocking
    }
  }

  async function loadIntegrations() {
    try {
      const response = await listCmsIntegrations()
      setIntegrations(response.integrations)
    } catch {
      // non-blocking
    }
  }

  useEffect(() => {
    loadSchedules()
    loadIntegrations()
  }, [])

  async function handleGenerate() {
    if (!sourceUrl.trim() && !selectedKeyword.trim()) {
      setError('Provide a source URL or select a keyword')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await generateContent({
        sourceUrl: sourceUrl.trim() || undefined,
        keyword: selectedKeyword.trim() || undefined,
        tone,
        persist: true,
      })
      setContent(response.content)
      setFunnelId(response.saved.funnelId)
      setWarnings(response.warnings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveIntegration() {
    if (!targetUrl.trim()) {
      setError('Integration target URL is required')
      return
    }

    try {
      setSavingIntegration(true)
      setError(null)
      await saveCmsIntegration({
        provider,
        targetUrl: targetUrl.trim(),
        authType,
        authValue: authValue.trim() || undefined,
        isActive: true,
      })
      setTargetUrl('')
      setAuthValue('')
      await loadIntegrations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save integration')
    } finally {
      setSavingIntegration(false)
    }
  }

  return (
    <main className="cockpit-shell py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel space-y-2">
          <p className="text-xs uppercase tracking-system text-text-secondary">Content Automation</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">AI Generation + Scheduled Posting</h1>
          <p className="text-sm text-text-secondary">
            Generate article and funnel payloads, connect your publishing endpoint, and schedule delivery.
          </p>
        </section>

        {error && <section className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</section>}

        <KeywordLookupPanel onKeywordSelected={setSelectedKeyword} />

        <section className="hud-panel space-y-3">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">AI Generation</p>
            <h2 className="text-lg font-semibold text-text-primary">Generate Article + Funnel Content</h2>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <input
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              className="hud-input md:col-span-2"
              placeholder="Optional source URL"
            />
            <input
              value={selectedKeyword}
              onChange={(event) => setSelectedKeyword(event.target.value)}
              className="hud-input"
              placeholder="Selected keyword"
            />
            <select value={tone} onChange={(event) => setTone(event.target.value as typeof tone)} className="hud-select">
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="urgent">Urgent</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <button type="button" onClick={handleGenerate} disabled={loading} className="hud-button-primary px-4 py-2">
            {loading ? 'Generating...' : 'Generate Content'}
          </button>

          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-200">
              {warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}
        </section>

        <section className="hud-panel space-y-3">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Publishing Integration</p>
            <h2 className="text-lg font-semibold text-text-primary">CMS/Webhook Connection</h2>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <input value={provider} onChange={(event) => setProvider(event.target.value)} className="hud-input" placeholder="Provider" />
            <input
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              className="hud-input"
              placeholder="Target URL"
            />
            <select value={authType} onChange={(event) => setAuthType(event.target.value as typeof authType)} className="hud-select">
              <option value="none">No Auth</option>
              <option value="bearer">Bearer</option>
              <option value="basic">Basic</option>
              <option value="header">Header Secret</option>
            </select>
            <input
              value={authValue}
              onChange={(event) => setAuthValue(event.target.value)}
              className="hud-input"
              placeholder="Auth value (optional)"
            />
          </div>

          <button type="button" onClick={handleSaveIntegration} disabled={savingIntegration} className="hud-button-secondary px-4 py-2">
            {savingIntegration ? 'Saving...' : 'Save Integration'}
          </button>

          {integrations.length > 0 && (
            <div className="space-y-2">
              {integrations.map((integration) => (
                <div key={integration.id} className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3 text-sm">
                  <p className="font-medium text-text-primary">{integration.provider}</p>
                  <p className="text-text-secondary">{integration.target_url}</p>
                  <p className="text-xs text-text-secondary">Auth: {integration.auth_type}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <ScheduleComposer content={content} funnelId={funnelId} onScheduled={loadSchedules} />

        {content && (
          <section className="hud-panel space-y-3">
            <div>
              <p className="text-xs uppercase tracking-system text-text-secondary">Generated Output</p>
              <h2 className="text-lg font-semibold text-text-primary">{content.title}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                <h3 className="text-sm font-semibold text-text-primary">Article</h3>
                <p className="mt-2 text-xs text-text-secondary">{content.article.metaTitle}</p>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-text-secondary">{content.article.markdown}</pre>
              </article>
              <article className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4">
                <h3 className="text-sm font-semibold text-text-primary">Funnel</h3>
                <p className="mt-2 text-text-primary">{content.funnel.headline}</p>
                <p className="text-sm text-text-secondary">{content.funnel.subheadline}</p>
                <p className="mt-2 text-xs text-rocket-400">CTA: {content.funnel.cta}</p>
                <p className="mt-3 text-xs text-text-secondary">Saved funnel ID: {funnelId || 'Not saved'}</p>
              </article>
            </div>
          </section>
        )}

        <section className="hud-panel space-y-3">
          <div>
            <p className="text-xs uppercase tracking-system text-text-secondary">Schedule Queue</p>
            <h2 className="text-lg font-semibold text-text-primary">Upcoming and Past Jobs</h2>
          </div>

          {schedules.length === 0 ? (
            <p className="text-sm text-text-secondary">No schedules yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Run At</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border-subtle)] text-text-primary">
                      <td className="px-3 py-2">{item.title}</td>
                      <td className="px-3 py-2">{new Date(item.run_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{item.content_type}</td>
                      <td className="px-3 py-2">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
