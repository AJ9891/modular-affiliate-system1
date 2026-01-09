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
    if (!res.ok) {
      router.push('/login')
    }
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
        body: JSON.stringify({
          domain: subdomain,
          type: 'subdomain'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save subdomain')
        setSaving(false)
        return
      }

      setSuccess(`Subdomain saved! Your site is now live at: ${data.url}`)
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
        body: JSON.stringify({
          domain: customDomain,
          type: 'custom'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to add custom domain')
        setSaving(false)
        return
      }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            Launchpad<span className="text-yellow-400">4</span>Success
          </Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Domain Settings</h1>
        <p className="text-gray-600 mb-8">Manage your subdomain and custom domain</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Subdomain Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🌐</div>
            <div>
              <h2 className="text-2xl font-bold">Free Subdomain</h2>
              <p className="text-gray-600">Available on all plans</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Choose your subdomain</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="yourname"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <span className="flex items-center px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-mono">
                .launchpad4success.pro
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          <button
            onClick={handleSaveSubdomain}
            disabled={saving || !subdomain}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save Subdomain'}
          </button>

          {domains?.subdomain && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✅ Your site is live at:{' '}
                <a
                  href={`https://${domains.subdomain}.launchpad4success.pro`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  {domains.subdomain}.launchpad4success.pro
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Custom Domain Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🚀</div>
              <div>
                <h2 className="text-2xl font-bold">Custom Domain</h2>
                <p className="text-gray-600">Agency plan only</p>
              </div>
            </div>
            {!domains?.canAddCustomDomain && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                Upgrade to Agency
              </Link>
            )}
          </div>

          {domains?.canAddCustomDomain ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Your custom domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                  placeholder="yourdomain.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter your domain without http:// or www
                </p>
              </div>

              <button
                onClick={handleAddCustomDomain}
                disabled={saving || !customDomain}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Adding Domain...' : 'Add Custom Domain'}
              </button>

              {dnsInstructions && (
                <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">📋 DNS Configuration Required</h3>
                  <p className="text-sm text-gray-700 mb-4">{dnsInstructions.message}</p>
                  
                  <div className="space-y-3">
                    {dnsInstructions.records.map((record: any, i: number) => (
                      <div key={i} className="bg-white p-4 rounded border border-purple-300">
                        <div className="grid grid-cols-3 gap-4 font-mono text-sm">
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <span className="font-bold ml-2">{record.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="font-bold ml-2">{record.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Value:</span>
                            <span className="font-bold ml-2">{record.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    Add these DNS records to your domain provider. It may take up to 48 hours for DNS changes to propagate.
                  </p>
                </div>
              )}

              {domains?.customDomain && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Custom domain configured:{' '}
                    <a
                      href={`https://${domains.customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline"
                    >
                      {domains.customDomain}
                    </a>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-lg font-semibold mb-2">Custom Domains Require Agency Plan</p>
              <p className="text-gray-600 mb-4">
                Upgrade to Agency plan to connect your own custom domain with automatic SSL and DNS management.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
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
