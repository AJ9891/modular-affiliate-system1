'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DomainsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [domains, setDomains] = useState<any>(null)
  const [subdomain, setSubdomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dnsInstructions, setDnsInstructions] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadDomains()
  }, [])

  async function checkAuth() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) router.push('/login')
  }

  async function loadDomains() {
    try {
      const res = await fetch('/api/domains')
      if (res.ok) {
        const data = await res.json()
        setDomains(data)
        setSubdomain(data.subdomain || '')
        setCustomDomain(data.customDomain || '')
      }
    } catch (err) {
      console.error('Failed to load domains:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSubdomain() {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: subdomain, type: 'subdomain' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save subdomain')
      setSuccess(`Subdomain saved! Live at ${data.url}`)
      loadDomains()
    } catch (err: any) {
      setError(err.message || 'Failed to save subdomain')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddCustomDomain() {
    setError('')
    setSuccess('')
    setDnsInstructions(null)
    setSaving(true)
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain, type: 'custom' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add custom domain')
      setSuccess('Domain added successfully!')
      setDnsInstructions(data.instructions)
      loadDomains()
    } catch (err: any) {
      setError(err.message || 'Failed to add custom domain')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="theme-command min-h-screen flex items-center justify-center">
        <div className="text-center text-white/80 space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rocket-500 mx-auto mb-2" />
          <p>Initializing navigation systems…</p>
        </div>
      </div>
    )
  }

  return (
    <main className="theme-command min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="glass-tile">
          <p className="text-xs uppercase tracking-[0.25em] text-white/60">Navigation</p>
          <h1 className="text-3xl font-bold text-white mb-2">Domains & Routing</h1>
          <p className="text-white/70">Configure launchpad subdomains and custom domains.</p>
          <p className="mt-2 text-sm text-white/55">Channel: command → nav → dns</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-400/40 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/40 rounded-lg text-emerald-200">
            {success}
          </div>
        )}

        <div className="glass-tile p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌐</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Free Subdomain</h2>
              <p className="text-white/70">Available on all plans.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/80">Choose your subdomain</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="yourname"
                className="flex-1 px-4 py-3 border border-white/20 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
              />
              <span className="flex items-center px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white font-mono">
                .launchpad4success.pro
              </span>
            </div>
            <p className="text-sm text-white/60 mt-2">Only lowercase letters, numbers, and hyphens.</p>
          </div>
          <button
            onClick={handleSaveSubdomain}
            disabled={saving || !subdomain}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving…' : 'Save Subdomain'}
          </button>

          {domains?.subdomain && (
            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/40 rounded-lg text-cyan-100">
              ✅ Live at{' '}
              <a
                href={`https://${domains.subdomain}.launchpad4success.pro`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-white"
              >
                {domains.subdomain}.launchpad4success.pro
              </a>
            </div>
          )}
        </div>

        <div className="glass-tile p-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🛰️</div>
              <div>
                <h2 className="text-2xl font-bold text-white">Custom Domain</h2>
                <p className="text-white/70">Agency plan only.</p>
              </div>
            </div>
            {!domains?.canAddCustomDomain && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition"
              >
                Upgrade to Agency
              </Link>
            )}
          </div>

          {domains?.canAddCustomDomain ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">Your custom domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                  placeholder="yourdomain.com"
                  className="w-full px-4 py-3 border border-white/20 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                />
                <p className="text-sm text-white/60 mt-2">Enter your domain without http:// or www.</p>
              </div>
              <button
                onClick={handleAddCustomDomain}
                disabled={saving || !customDomain}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Adding…' : 'Add Custom Domain'}
              </button>

              {dnsInstructions && (
                <div className="mt-6 p-6 bg-slate-900/60 border border-cyan-400/30 rounded-lg space-y-3 text-white">
                  <h3 className="text-lg font-bold">📃 DNS Configuration Required</h3>
                  <p className="text-sm text-white/75">{dnsInstructions.message}</p>
                  {dnsInstructions.records.map((record: any, i: number) => (
                    <div key={i} className="bg-black/30 p-4 rounded border border-cyan-500/30">
                      <div className="grid grid-cols-3 gap-4 font-mono text-sm">
                        <div><span className="text-white/60">Type:</span> <span className="font-bold ml-1">{record.type}</span></div>
                        <div><span className="text-white/60">Name:</span> <span className="font-bold ml-1">{record.name}</span></div>
                        <div><span className="text-white/60">Value:</span> <span className="font-bold ml-1">{record.value}</span></div>
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-white/70">
                    Add these records to your DNS provider. Propagation can take up to 48h.
                  </p>
                </div>
              )}

              {domains?.customDomain && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-400/40 rounded-lg text-emerald-100">
                  ✅ Custom domain configured:{' '}
                  <a
                    href={`https://${domains.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-white"
                  >
                    {domains.customDomain}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 bg-slate-900/40 border-2 border-dashed border-white/20 rounded-lg text-center text-white">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-lg font-semibold mb-2">Custom Domains Require Agency Plan</p>
              <p className="text-white/70 mb-4">
                Upgrade to Agency to connect your own domain with automatic SSL and DNS management.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition"
              >
                View Agency Plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
