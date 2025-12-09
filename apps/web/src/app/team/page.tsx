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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-purple-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">Collaborate with your team on funnels and offers</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        {inviteLink && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold mb-2">Invite Link Generated:</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 bg-white px-3 py-2 rounded text-sm">{inviteLink}</code>
              <button
                onClick={() => copyInviteLink(inviteLink)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              {showInviteForm ? 'Cancel' : '+ Invite Team Member'}
            </button>
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="viewer">Viewer - Can view funnels and offers</option>
                  <option value="editor">Editor - Can create and edit funnels</option>
                  <option value="admin">Admin - Full access except billing</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Send Invite
              </button>
            </form>
          </div>
        )}

        {/* Team Members List */}
        {teamData?.isOwner && teamData.ownedTeam.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Your Team</h2>
            <div className="space-y-4">
              {teamData.ownedTeam.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{member.member_email}</p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : member.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Invited {new Date(member.invited_at).toLocaleDateString()}
                      {member.accepted_at && ` · Joined ${new Date(member.accepted_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {member.status === 'active' && (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Teams You're Part Of</h2>
            <div className="space-y-4">
              {teamData.memberOf.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      Team Account
                    </p>
                    <p className="text-sm text-gray-600">
                      Role: <span className="font-medium capitalize">{membership.role}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {teamData && !teamData.isOwner && teamData.memberOf.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Yet</h2>
            <p className="text-gray-600 mb-6">
              Team collaboration is available on the Agency plan.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Upgrade to Agency
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
