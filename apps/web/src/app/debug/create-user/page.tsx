'use client'

import { useState } from 'react'

export default function CreateUserPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="card-premium w-full max-w-md rounded-lg p-8">
        <h1 className="mb-4 text-2xl font-bold text-text-primary">Create User in Database</h1>
        <p className="mb-6 text-text-secondary">
          This will insert your authenticated user into the public.users table.
        </p>
        
        <button
          onClick={createUser}
          disabled={loading}
          className="btn-launch-premium w-full px-6 py-3 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User Record'}
        </button>

        {result && (
          <div className="mt-6 rounded border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-4">
            <h3 className="mb-2 font-semibold text-text-primary">Result:</h3>
            <pre className="overflow-auto text-xs text-text-secondary">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
