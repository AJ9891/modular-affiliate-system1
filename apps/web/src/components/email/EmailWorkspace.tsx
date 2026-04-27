'use client'

import { useEffect, useMemo, useState } from 'react'
import { Mail, Users, Bot } from 'lucide-react'
import {
  createAutomation,
  createCampaignDraft,
  getEmailTemplates,
  setupDefaultAutomations,
  type EmailPersonality,
  type EmailTemplate,
} from '@/lib/api/email'
import { listSubscribers, type SubscriberLead } from '@/lib/api/subscribers'
import DashboardPanel from '@/components/cockpit/DashboardPanel'
import WorkspacePanel from '@/components/cockpit/WorkspacePanel'
import { CockpitEmptyState } from '@/components/ui/CockpitEmptyState'
import { useBrandMode, type BrandModeKey } from '@/contexts/BrandModeContext'
import EmailSkeleton from './EmailSkeleton'

function mapModeToEmailPersonality(mode: BrandModeKey): EmailPersonality {
  if (mode === 'meltdown') return 'glitch'
  if (mode === 'antiguru') return 'anchor'
  return 'rocket'
}

function personalityLabel(personality: EmailPersonality): string {
  if (personality === 'glitch') return 'Glitch'
  if (personality === 'anchor') return 'Anchor'
  return 'Rocket'
}

export default function EmailWorkspace() {
  const { mode } = useBrandMode()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberLead[]>([])

  const [automationName, setAutomationName] = useState('Welcome Sequence')
  const [campaignSubject, setCampaignSubject] = useState('Campaign Update')
  const [campaignHtml, setCampaignHtml] = useState('<h1>Hello from Launchpad</h1><p>Your campaign draft is ready.</p>')

  const [savingAutomation, setSavingAutomation] = useState(false)
  const [savingCampaign, setSavingCampaign] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [templateData, subscriberData] = await Promise.all([
          getEmailTemplates().catch(() => []),
          listSubscribers(200).catch(() => []),
        ])

        if (active) {
          setTemplates(templateData)
          setSubscribers(subscriberData)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load email workspace')
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

  const uniqueSubscribers = useMemo(() => {
    const map = new Map<string, SubscriberLead>()
    subscribers.forEach((subscriber) => {
      if (!map.has(subscriber.email)) {
        map.set(subscriber.email, subscriber)
      }
    })
    return Array.from(map.values())
  }, [subscribers])

  const templatesByPersonality = useMemo(() => {
    const grouped = {
      rocket: [] as EmailTemplate[],
      glitch: [] as EmailTemplate[],
      anchor: [] as EmailTemplate[],
      unassigned: [] as EmailTemplate[],
    }

    for (const template of templates) {
      if (template.personality === 'rocket') {
        grouped.rocket.push(template)
      } else if (template.personality === 'glitch') {
        grouped.glitch.push(template)
      } else if (template.personality === 'anchor') {
        grouped.anchor.push(template)
      } else {
        grouped.unassigned.push(template)
      }
    }

    return grouped
  }, [templates])

  const selectedPersonality = useMemo(() => mapModeToEmailPersonality(mode), [mode])
  const selectedPersonalityTemplates = useMemo(() => {
    if (selectedPersonality === 'glitch') return templatesByPersonality.glitch
    if (selectedPersonality === 'anchor') return templatesByPersonality.anchor
    return templatesByPersonality.rocket
  }, [selectedPersonality, templatesByPersonality])
  const selectedPersonalityLabel = useMemo(() => personalityLabel(selectedPersonality), [selectedPersonality])

  async function handleSetupDefaultAutomations() {
    try {
      setSavingAutomation(true)
      setError(null)
      await setupDefaultAutomations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup automations')
    } finally {
      setSavingAutomation(false)
    }
  }

  async function handleCreateAutomation() {
    try {
      if (selectedPersonalityTemplates.length === 0) {
        setError(`No ${selectedPersonalityLabel} templates available to create an automation.`)
        return
      }

      setSavingAutomation(true)
      setError(null)
      await createAutomation({
        name: automationName,
        trigger: 'signup',
        emails: selectedPersonalityTemplates.slice(0, 1).map((template) => ({ delay: 0, template })),
        active: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation')
    } finally {
      setSavingAutomation(false)
    }
  }

  async function handleCreateCampaignDraft() {
    if (uniqueSubscribers.length === 0) {
      setError('No subscribers available for campaign draft.')
      return
    }

    try {
      setSavingCampaign(true)
      setError(null)
      await createCampaignDraft({
        name: `Campaign ${new Date().toLocaleDateString()}`,
        subject: campaignSubject,
        html: campaignHtml,
        recipients: uniqueSubscribers.slice(0, 10).map((subscriber) => ({ email: subscriber.email })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign draft')
    } finally {
      setSavingCampaign(false)
    }
  }

  if (loading) {
    return <EmailSkeleton />
  }

  return (
    <main className="cockpit-shell page-crew py-8">
      <div className="cockpit-container max-w-7xl space-y-6">
        <section className="hud-panel">
          <p className="text-xs uppercase tracking-system text-text-secondary">Email</p>
          <h1 className="text-3xl font-semibold text-text-primary md:text-4xl">Campaign and Automation Console</h1>
          <p className="mt-2 text-sm text-text-secondary">Coordinate templates, audience segments, and automated sequences.</p>
        </section>

        {error && <section className="rounded-lg border border-red-400/35 bg-red-500/12 p-4 text-red-200">{error}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardPanel title="Templates" icon={<Mail size={16} />} value={selectedPersonalityTemplates.length} tone="info">
            <p className="text-xs text-text-secondary">Showing {selectedPersonalityLabel} templates.</p>
          </DashboardPanel>
          <DashboardPanel title="Subscribers" icon={<Users size={16} />} value={uniqueSubscribers.length} tone="neutral">
            <p className="text-xs text-text-secondary">Distinct contacts available for campaigns.</p>
          </DashboardPanel>
          <DashboardPanel title="Automation Engine" icon={<Bot size={16} />} value="Active" tone="success">
            <p className="text-xs text-text-secondary">Sequencing controls ready for execution.</p>
          </DashboardPanel>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkspacePanel
            title="Automation Sequences"
            description="Manage onboarding flows and recurring automation behavior."
            actions={
              <div className="flex gap-2">
                <button type="button" onClick={handleSetupDefaultAutomations} disabled={savingAutomation} className="hud-button-secondary px-3 py-1.5 text-xs">
                  {savingAutomation ? 'Working...' : 'Setup Default'}
                </button>
                <button type="button" onClick={handleCreateAutomation} disabled={savingAutomation} className="hud-button-primary px-3 py-1.5 text-xs">
                  {savingAutomation ? 'Saving...' : 'Create'}
                </button>
              </div>
            }
            expandable
          >
            <input
              className="hud-input"
              value={automationName}
              onChange={(event) => setAutomationName(event.target.value)}
              placeholder="Automation name"
            />
            <p className="mt-3 text-xs text-text-secondary">Triggers signup-based automations using the first available template in current personality.</p>
          </WorkspacePanel>

          <WorkspacePanel
            title="Campaign Draft Composer"
            description="Draft outbound campaign payload for selected subscribers."
            actions={
              <button type="button" onClick={handleCreateCampaignDraft} disabled={savingCampaign} className="hud-button-primary px-3 py-1.5 text-xs">
                {savingCampaign ? 'Creating...' : 'Create Draft'}
              </button>
            }
            expandable
          >
            <div className="space-y-3">
              <input
                className="hud-input"
                value={campaignSubject}
                onChange={(event) => setCampaignSubject(event.target.value)}
                placeholder="Campaign subject"
              />
              <textarea className="hud-input min-h-32" value={campaignHtml} onChange={(event) => setCampaignHtml(event.target.value)} />
              <p className="text-xs text-text-secondary">Draft payload uses up to 10 subscribers as recipients.</p>
            </div>
          </WorkspacePanel>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkspacePanel
            title={`${selectedPersonalityLabel} Template Library`}
            description="Template inventory filtered by active brand personality."
            className="lg:col-span-2"
            expandable
          >
            {templates.length === 0 ? (
              <CockpitEmptyState
                compact
                title="No templates returned yet"
                description="Templates will appear here after your template API is configured."
                tone="warning"
                tips={[
                  'Sync templates from the Templates workspace.',
                  'Ensure email template API endpoint is reachable.',
                ]}
                secondaryAction={{ label: 'Open Settings', href: '/settings' }}
              />
            ) : (
              <section className="rounded-lg border border-[var(--border-subtle)] p-3">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-system text-text-secondary">
                  {selectedPersonalityLabel} ({selectedPersonalityTemplates.length})
                </h3>
                <div className="space-y-2">
                  {selectedPersonalityTemplates.map((template) => (
                    <div key={template.id || template.name} className="rounded border border-[var(--border-subtle)] p-2">
                      <p className="text-sm font-medium text-text-primary">{template.name}</p>
                      <p className="text-xs text-text-secondary">{template.subject}</p>
                    </div>
                  ))}
                  {selectedPersonalityTemplates.length === 0 && (
                    <CockpitEmptyState
                      compact
                      title={`No ${selectedPersonalityLabel} templates`}
                      description="Switch voice mode or create templates to continue automation setup."
                      tone="warning"
                      tips={['Create at least one template for this voice profile.']}
                    />
                  )}
                </div>
              </section>
            )}
          </WorkspacePanel>

          <WorkspacePanel title="Audience Snapshot" description="Latest subscribers available for campaign targeting." expandable>
            <div className="space-y-2">
              {uniqueSubscribers.length === 0 && (
                <CockpitEmptyState
                  compact
                  title="No subscribers captured yet"
                  description="Publish a funnel and connect forms to start collecting subscribers."
                  tone="info"
                  tips={[
                    'Add an email capture block in your funnel.',
                    'Run a small traffic test to verify lead capture.',
                  ]}
                  primaryAction={{ label: 'Go to Funnels', href: '/funnels' }}
                />
              )}
              {uniqueSubscribers.slice(0, 8).map((subscriber) => (
                <div key={subscriber.email} className="rounded-lg border border-[var(--border-subtle)] p-3">
                  <p className="font-medium text-text-primary">{subscriber.email}</p>
                  <p className="text-xs text-text-secondary">
                    Source: {subscriber.source || subscriber.utm_source || 'direct'} · {new Date(subscriber.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </section>
      </div>
    </main>
  )
}
