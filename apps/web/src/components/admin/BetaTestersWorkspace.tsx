'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  createBetaTester,
  deleteBetaTester,
  getBetaTesters,
  type BetaTesterRecord,
  type BetaTesterStatus,
  updateBetaTester,
} from '@/lib/api/admin'

const STATUS_OPTIONS: BetaTesterStatus[] = ['prospect', 'invited', 'active', 'paused']

function statusLabel(status: BetaTesterStatus) {
  if (status === 'prospect') return 'Prospect'
  if (status === 'invited') return 'Invited'
  if (status === 'active') return 'Active'
  return 'Paused'
}

export default function BetaTestersWorkspace() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testers, setTesters] = useState<BetaTesterRecord[]>([])

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<BetaTesterStatus>('prospect')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getBetaTesters()
        if (active) {
          setTesters(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load beta testers')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const totals = useMemo(() => {
    return testers.reduce<Record<BetaTesterStatus, number>>(
      (acc, tester) => {
        acc[tester.status] += 1
        return acc
      },
      { prospect: 0, invited: 0, active: 0, paused: 0 },
    )
  }, [testers])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return

    try {
      setSubmitting(true)
      setError(null)

      const created = await createBetaTester({
        email,
        full_name: fullName,
        company,
        notes,
        status,
      })

      setTesters((prev) => [created, ...prev])
      setEmail('')
      setFullName('')
      setCompany('')
      setNotes('')
      setStatus('prospect')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add beta tester')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(id: string, nextStatus: BetaTesterStatus) {
    const previous = testers
    setTesters((prev) => prev.map((tester) => (tester.id === id ? { ...tester, status: nextStatus } : tester)))
    try {
      const updated = await updateBetaTester({ id, status: nextStatus })
      setTesters((prev) => prev.map((tester) => (tester.id === id ? updated : tester)))
    } catch (err) {
      setTesters(previous)
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  async function handleDelete(id: string) {
    const previous = testers
    setTesters((prev) => prev.filter((tester) => tester.id !== id))
    try {
      await deleteBetaTester(id)
    } catch (err) {
      setTesters(previous)
      setError(err instanceof Error ? err.message : 'Failed to remove beta tester')
    }
  }

  async function handleResendInvite(id: string) {
    const previous = testers
    try {
      setError(null)
      const updated = await updateBetaTester({ id, resend_invite: true, status: 'invited' })
      setTesters((prev) => prev.map((tester) => (tester.id === id ? updated : tester)))
    } catch (err) {
      setTesters(previous)
      setError(err instanceof Error ? err.message : 'Failed to resend invite')
    }
  }

  async function copyInviteLink(inviteUrl: string | null | undefined) {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
    } catch {
      setError('Unable to copy invite link')
    }
  }

  return (
    <main className="cockpit-shell page-command-authority py-8">
      <div className="cockpit-container max-w-6xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Admin</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Beta Testers</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Keep a single roster of platform beta testers and track invite status.
          </p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Total</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{testers.length}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Prospects</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{totals.prospect}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Invited</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{totals.invited}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Active</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{totals.active}</p>
          </article>
          <article className="hud-card">
            <p className="text-xs uppercase tracking-system text-text-secondary">Paused</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{totals.paused}</p>
          </article>
        </section>

        <section className="hud-card">
          <h2 className="text-xl font-semibold text-text-primary">Add Beta Tester</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="Email"
              className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-text-primary outline-none focus:border-[var(--border-focus)]"
            />
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name (optional)"
              className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-text-primary outline-none focus:border-[var(--border-focus)]"
            />
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company (optional)"
              className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-text-primary outline-none focus:border-[var(--border-focus)]"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BetaTesterStatus)}
              className="rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-text-primary outline-none focus:border-[var(--border-focus)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-slate-900 text-white">
                  {statusLabel(option)}
                </option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes (optional)"
              className="md:col-span-2 min-h-20 rounded-lg border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-text-primary outline-none focus:border-[var(--border-focus)]"
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Adding…' : 'Add Tester'}
              </button>
            </div>
          </form>
        </section>

        <section className="hud-card overflow-x-auto">
          <h2 className="text-xl font-semibold text-text-primary">Roster</h2>
          {loading ? (
            <p className="mt-4 text-sm text-text-secondary">Loading beta testers…</p>
          ) : testers.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">No beta testers yet.</p>
          ) : (
            <table className="mt-4 min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-text-secondary">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Notes</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Invite Link</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testers.map((tester) => (
                  <tr key={tester.id} className="border-b border-[var(--border-subtle)] text-text-primary">
                    <td className="px-3 py-3">{tester.email}</td>
                    <td className="px-3 py-3">{tester.full_name || '-'}</td>
                    <td className="px-3 py-3">{tester.company || '-'}</td>
                    <td className="max-w-72 truncate px-3 py-3 text-text-secondary" title={tester.notes || ''}>
                      {tester.notes || '-'}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={tester.status}
                        onChange={(event) => handleStatusChange(tester.id, event.target.value as BetaTesterStatus)}
                        className="rounded-md border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-text-primary"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-slate-900 text-white">
                            {statusLabel(option)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      {tester.invite_url ? (
                        <button
                          type="button"
                          onClick={() => copyInviteLink(tester.invite_url)}
                          className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                        >
                          Copy link
                        </button>
                      ) : (
                        <span className="text-xs text-text-secondary">No link</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {tester.created_at ? new Date(tester.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResendInvite(tester.id)}
                          className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                        >
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tester.id)}
                          className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}
