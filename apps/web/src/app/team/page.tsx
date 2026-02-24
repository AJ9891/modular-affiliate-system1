'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TeamMember {
  id: string
  account_owner_id: string
  member_user_id: string | null
  member_email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'pending' | 'active' | 'declined'
  invited_at: string
  accepted_at: string | null
}

interface TeamData {
  ownedTeam: TeamMember[]
  memberOf: TeamMember[]
  isOwner: boolean
}

export default function TeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer')
  const [inviteLink, setInviteLink] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAuth()
    loadTeam()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  async function loadTeam() {
    try {
      const response = await fetch('/api/team')
      if (!response.ok) {
        throw new Error('Failed to load team')
      }
      const data = await response.json()
      setTeamData(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setInviteLink('')

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_email: inviteEmail,
          role: inviteRole
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setSuccess(`Invite sent to ${inviteEmail}`)
      setInviteLink(data.inviteLink)
      setInviteEmail('')
      setShowInviteForm(false)
      loadTeam()
    } catch (error: any) {
      setError(error.message)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    try {
      const response = await fetch(`/api/team?memberId=${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      setSuccess('Team member removed')
      loadTeam()
    } catch (error: any) {
      setError(error.message)
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      setSuccess('Role updated')
      loadTeam()
    } catch (error: any) {
      setError(error.message)
    }
  }

  function copyInviteLink(link: string) {
    navigator.clipboard.writeText(link)
    setSuccess('Invite link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="cockpit-shell page-crew flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-anchor-400"></div>
          <p className="text-text-secondary">Loading crew roster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cockpit-shell page-crew py-8">
      <div className="cockpit-container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="mb-4 inline-block text-text-secondary hover:text-text-primary">
            ← Back to Dashboard
          </Link>
          <h1 className="mb-2 text-4xl font-semibold text-text-primary">Crew Management</h1>
          <p className="text-text-secondary">Collaborate with your team on funnels and offers</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-400/35 bg-red-500/12 px-4 py-3 text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-400/35 bg-emerald-500/12 px-4 py-3 text-emerald-200">
            {success}
          </div>
        )}
        {inviteLink && (
          <div className="mb-6 rounded-lg border border-rocket-500/35 bg-rocket-500/12 px-4 py-3 text-text-primary">
            <p className="mb-2 font-semibold">Invite Link Generated:</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 rounded border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.5)] px-3 py-2 text-sm text-text-secondary">{inviteLink}</code>
              <button
                onClick={() => copyInviteLink(inviteLink)}
                className="hud-button-secondary px-4 py-2"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Invite Button */}
        {teamData?.isOwner && (
          <div className="mb-8">
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="hud-button-primary px-6 py-3"
            >
              {showInviteForm ? 'Cancel' : '+ Invite Team Member'}
            </button>
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <div className="hud-card mb-8">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Invite Crew Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="hud-input"
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="hud-select"
                >
                  <option value="viewer">Viewer - Can view funnels and offers</option>
                  <option value="editor">Editor - Can create and edit funnels</option>
                  <option value="admin">Admin - Full access except billing</option>
                </select>
              </div>
              <button
                type="submit"
                className="hud-button-primary px-6 py-2"
              >
                Send Invite
              </button>
            </form>
          </div>
        )}

        {/* Team Members List */}
        {teamData?.isOwner && teamData.ownedTeam.length > 0 && (
          <div className="hud-card mb-8">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Crew Roster</h2>
            <div className="space-y-4">
              {teamData.ownedTeam.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[rgba(12,18,26,0.5)] p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-text-primary">{member.member_email}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          member.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : member.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'bg-slate-500/20 text-slate-200'
                        }`}
                      >
                        {member.status}
                      </span>
                      <span className={`role-badge role-badge-${member.role}`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Invited {new Date(member.invited_at).toLocaleDateString()}
                      {member.accepted_at && ` · Joined ${new Date(member.accepted_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {member.status === 'active' && (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="hud-select px-3 py-1 text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-sm font-medium text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teams User Is Part Of */}
        {teamData?.memberOf && teamData.memberOf.length > 0 && (
          <div className="hud-card">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Teams You're Part Of</h2>
            <div className="space-y-4">
              {teamData.memberOf.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[rgba(12,18,26,0.5)] p-4"
                >
                  <div>
                    <p className="font-semibold text-text-primary">
                      Team Account
                    </p>
                    <p className="text-sm text-text-secondary">
                      Role: <span className="font-medium capitalize">{membership.role}</span>
                    </p>
                  </div>
                  <span className={`role-badge role-badge-${membership.role}`}>
                    {membership.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {teamData && !teamData.isOwner && teamData.memberOf.length === 0 && (
          <div className="hud-card text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="mb-2 text-2xl font-semibold text-text-primary">No Team Yet</h2>
            <p className="mb-6 text-text-secondary">
              Team collaboration is available on the Agency plan.
            </p>
            <Link
              href="/pricing"
              className="hud-button-primary inline-block px-6 py-3"
            >
              Upgrade to Agency
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
