'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, Users } from 'lucide-react'
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

const DEFAULT_CAMPAIGN_HTML = '<h1>Hello from Launchpad</h1><p>Your campaign draft is ready.</p>'
const DEFAULT_SUBSCRIBER_SELECTION_LIMIT = 10

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

function getTemplateKey(template: EmailTemplate): string {
  return template.id || template.name
}

function getTemplateBody(template: EmailTemplate): string {
  return template.html || template.text || DEFAULT_CAMPAIGN_HTML
}

function formatCountLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export default function EmailWorkspace() {
  const { mode } = useBrandMode()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberLead[]>([])

  const [automationName, setAutomationName] = useState('Welcome Sequence')
  const [campaignSubject, setCampaignSubject] = useState('Campaign Update')
  const [campaignHtml, setCampaignHtml] = useState(DEFAULT_CAMPAIGN_HTML)

  const [savingAutomation, setSavingAutomation] = useState(false)
  const [savingCampaign, setSavingCampaign] = useState(false)
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null)
  const [selectedSubscriberEmails, setSelectedSubscriberEmails] = useState<string[]>([])
  const subscriberSelectionInitializedRef = useRef(false)

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

  const selectedSubscriberEmailSet = useMemo(() => new Set(selectedSubscriberEmails), [selectedSubscriberEmails])
  const selectedSubscribers = useMemo(
    () => uniqueSubscribers.filter((subscriber) => selectedSubscriberEmailSet.has(subscriber.email)),
    [selectedSubscriberEmailSet, uniqueSubscribers]
  )

  useEffect(() => {
    setSelectedSubscriberEmails((current) => {
      const validEmails = new Set(uniqueSubscribers.map((subscriber) => subscriber.email))
      const prunedSelection = current.filter((email) => validEmails.has(email))

      if (!subscriberSelectionInitializedRef.current && uniqueSubscribers.length > 0) {
        subscriberSelectionInitializedRef.current = true
        return uniqueSubscribers.slice(0, DEFAULT_SUBSCRIBER_SELECTION_LIMIT).map((subscriber) => subscriber.email)
      }

      return prunedSelection
    })
  }, [uniqueSubscribers])

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
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateKey) return null
    return templates.find((template) => getTemplateKey(template) === selectedTemplateKey) || null
  }, [selectedTemplateKey, templates])

  useEffect(() => {
    const templateId = searchParams.get('templateId')
    if (!templateId || templates.length === 0 || selectedTemplateKey === templateId) {
      return
    }

    const chosenTemplate = templates.find((template) => getTemplateKey(template) === templateId)
    if (!chosenTemplate) {
      return
    }

    setCampaignSubject(chosenTemplate.subject)
    setCampaignHtml(getTemplateBody(chosenTemplate))
    setSelectedTemplateKey(templateId)
    setNotice(`Loaded template: ${chosenTemplate.name}`)
  }, [searchParams, selectedTemplateKey, templates])

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
    if (selectedSubscribers.length === 0) {
      setError('Select at least one subscriber for the campaign draft.')
      return
    }

    try {
      setSavingCampaign(true)
      setError(null)
      await createCampaignDraft({
        name: `Campaign ${new Date().toLocaleDateString()}`,
        subject: campaignSubject,
        html: campaignHtml,
        recipients: selectedSubscribers.map((subscriber) => ({ email: subscriber.email })),
      })
      setNotice(`Campaign draft created for ${formatCountLabel(selectedSubscribers.length, 'selected subscriber')}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign draft')
    } finally {
      setSavingCampaign(false)
    }
  }

  function toggleSubscriberSelection(email: string) {
    setNotice(null)
    setSelectedSubscriberEmails((current) =>
      current.includes(email) ? current.filter((selectedEmail) => selectedEmail !== email) : [...current, email]
    )
  }

  function selectAllSubscribers() {
    setNotice(null)
    setSelectedSubscriberEmails(uniqueSubscribers.map((subscriber) => subscriber.email))
  }

  function clearSubscriberSelection() {
    setNotice(null)
    setSelectedSubscriberEmails([])
  }

  function handleSelectTemplate(template: EmailTemplate) {
    const templateKey = getTemplateKey(template)
    setCampaignSubject(template.subject)
    setCampaignHtml(getTemplateBody(template))
    setSelectedTemplateKey(templateKey)
    setError(null)
    setNotice(`Loaded template: ${template.name}`)
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
        {notice && <section className="rounded-lg border border-cyan-400/35 bg-cyan-500/12 p-4 text-cyan-100">{notice}</section>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardPanel title="Templates" icon={<Mail size={16} />} value={selectedPersonalityTemplates.length} tone="info">
            <p className="text-xs text-text-secondary">
              {selectedTemplate ? `Loaded: ${selectedTemplate.name}` : `Showing ${selectedPersonalityLabel} templates.`}
            </p>
          </DashboardPanel>
          <DashboardPanel title="Subscribers" icon={<Users size={16} />} value={uniqueSubscribers.length} tone="neutral">
            <p className="text-xs text-text-secondary">Distinct contacts available for campaigns.</p>
          </DashboardPanel>
          <DashboardPanel title="Selected" icon={<CheckCircle size={16} />} value={selectedSubscribers.length} tone="success">
            <p className="text-xs text-text-secondary">Contacts included in the next campaign draft.</p>
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
              <button
                type="button"
                onClick={handleCreateCampaignDraft}
                disabled={savingCampaign || selectedSubscribers.length === 0}
                className="hud-button-primary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
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
              <p className="text-xs text-text-secondary">
                Draft payload uses {formatCountLabel(selectedSubscribers.length, 'selected subscriber')} as recipients.
              </p>
            </div>
          </WorkspacePanel>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkspacePanel
            title={`${selectedPersonalityLabel} Template Library`}
            description="Select one of the built-in email templates to load it into the campaign composer."
            className="lg:col-span-2"
            expandable
          >
            {templates.length === 0 ? (
              <CockpitEmptyState
                compact
                title="No templates returned yet"
                description="Templates will appear here after your template API is configured."
                secondaryAction={{ label: 'Open Settings', href: '/settings' }}
              />
            ) : (
              <section className="rounded-lg border border-[var(--border-subtle)] p-3">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-system text-text-secondary">
                  {selectedPersonalityLabel} ({selectedPersonalityTemplates.length})
                </h3>
                <div className="space-y-2">
                  {selectedPersonalityTemplates.map((template) => {
                    const templateKey = getTemplateKey(template)
                    const selected = selectedTemplateKey === templateKey

                    return (
                      <button
                        key={templateKey}
                        type="button"
                        onClick={() => handleSelectTemplate(template)}
                        className={`w-full rounded border p-3 text-left transition ${
                          selected
                            ? 'border-[var(--border-focus)] bg-[rgba(var(--accent-rgb),0.10)]'
                            : 'border-[var(--border-subtle)] hover:border-[var(--border-elevated)]'
                        }`}
                        aria-pressed={selected}
                      >
                        <span className="flex flex-wrap items-start justify-between gap-2">
                          <span>
                            <span className="block text-sm font-medium text-text-primary">{template.name}</span>
                            <span className="mt-1 block text-xs text-text-secondary">{template.subject}</span>
                          </span>
                          <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] uppercase tracking-system text-text-secondary">
                            {selected ? 'Selected' : template.source || 'local'}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                  {selectedPersonalityTemplates.length === 0 && (
                    <CockpitEmptyState
                      compact
                      title={`No ${selectedPersonalityLabel} templates`}
                      description="Switch voice mode or create templates to continue automation setup."
                    />
                  )}
                </div>
              </section>
            )}
          </WorkspacePanel>

          <WorkspacePanel
            title="Audience Selection"
            description="Choose the subscriber emails to include in the campaign draft."
            actions={
              uniqueSubscribers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={selectAllSubscribers} className="hud-button-secondary px-3 py-1.5 text-xs">
                    Select All
                  </button>
                  <button type="button" onClick={clearSubscriberSelection} className="hud-button-secondary px-3 py-1.5 text-xs">
                    Clear
                  </button>
                </div>
              ) : null
            }
            expandable
          >
            <div className="space-y-2">
              {uniqueSubscribers.length === 0 && (
                <CockpitEmptyState
                  compact
                  title="No subscribers captured yet"
                  description="Publish a funnel and connect forms to start collecting subscribers."
                  primaryAction={{ label: 'Go to Funnels', href: '/funnels' }}
                />
              )}
              {uniqueSubscribers.length > 0 && (
                <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                  {uniqueSubscribers.map((subscriber) => {
                    const selected = selectedSubscriberEmailSet.has(subscriber.email)

                    return (
                      <label
                        key={subscriber.email}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                          selected
                            ? 'border-[var(--border-focus)] bg-[rgba(var(--accent-rgb),0.10)]'
                            : 'border-[var(--border-subtle)] hover:border-[var(--border-elevated)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-[var(--border-elevated)] accent-[rgb(var(--accent-rgb))]"
                          checked={selected}
                          onChange={() => toggleSubscriberSelection(subscriber.email)}
                        />
                        <span className="min-w-0">
                          <span className="block break-all font-medium text-text-primary">{subscriber.email}</span>
                          <span className="block text-xs text-text-secondary">
                            Source: {subscriber.source || subscriber.utm_source || 'direct'} · {new Date(subscriber.created_at).toLocaleDateString()}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </WorkspacePanel>
        </section>
      </div>
    </main>
  )
}
