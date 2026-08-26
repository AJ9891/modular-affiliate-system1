'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, PlugZap, ShieldCheck } from 'lucide-react'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'

type Integration = {
  id: string
  provider: string
  destination: string
  authType: string
  isActive: boolean
  lastTestStatus: string | null
  lastError: string | null
  createdAt: string
}

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({})) as {
    error?: string
    integrations?: Integration[]
    integration?: Integration
  }
  if (!response.ok) throw new Error(payload.error || 'Request failed')
  return payload
}

export default function IntegrationsWorkspace() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhookUrl, setWebhookUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/integrations/cms', {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      const payload = await readResponse(response)
      setIntegrations(payload.integrations || [])
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Could not load integrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!webhookUrl.trim() || saving) return

    try {
      setSaving(true)
      setError(null)
      setNotice(null)
      const response = await fetch('/api/integrations/cms', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'make_webhook',
          targetUrl: webhookUrl.trim(),
          authType: 'none',
          isActive: true,
        }),
      })
      await readResponse(response)
      setWebhookUrl('')
      setNotice('Make is connected and ready for scheduled campaigns.')
      await load()
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Could not connect the webhook')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-5xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Integrations</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Publishing Connections</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Connect a private webhook for scheduled campaigns. Launchpad tests the destination before saving it.
          </p>
        </section>

        {error && (
          <section role="alert" className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">
            {error}
          </section>
        )}
        {notice && (
          <section role="status" className="rounded-lg border border-rocket-500/35 bg-[rgba(46,230,194,0.12)] p-4 text-rocket-500">
            {notice}
          </section>
        )}

        <WorkspacePanel
          title="Connect Make"
          description="Paste the Custom Webhook URL from your Make scenario. It is stored privately and is never shown again."
          actions={<ShieldCheck size={18} className="text-rocket-500" />}
        >
          <form onSubmit={connect} className="space-y-4">
            <div>
              <label htmlFor="make-webhook-url" className="text-xs uppercase tracking-system text-text-secondary">
                Make webhook URL
              </label>
              <input
                id="make-webhook-url"
                type="password"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                placeholder="https://hook.make.com/..."
                className="hud-input mt-2 w-full"
                required
                aria-describedby="webhook-security-note"
              />
              <p id="webhook-security-note" className="mt-2 text-xs text-text-secondary">
                HTTPS only. The full address stays server-side after it is saved.
              </p>
            </div>
            <button type="submit" disabled={saving || !webhookUrl.trim()} className="hud-button-primary inline-flex items-center gap-2 px-4 py-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
              {saving ? 'Testing connection...' : 'Connect and test'}
            </button>
          </form>
        </WorkspacePanel>

        <WorkspacePanel title="Active connections" description="Destinations available to Publish now and scheduled campaign delivery.">
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-text-secondary">
              <Loader2 size={16} className="animate-spin" /> Loading connections...
            </div>
          ) : integrations.length === 0 ? (
            <p className="py-6 text-sm text-text-secondary">No publishing connection yet.</p>
          ) : (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <article key={integration.id} className="flex flex-col gap-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <CheckCircle2 size={16} className="text-rocket-500" />
                      Make webhook
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      {integration.destination} · Connected {new Date(integration.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-rocket-500/35 bg-[rgba(46,230,194,0.12)] px-2.5 py-1 text-xs text-rocket-500">
                    {integration.isActive && integration.lastTestStatus === 'success' ? 'Active · Tested' : 'Needs attention'}
                  </span>
                </article>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </main>
  )
}
