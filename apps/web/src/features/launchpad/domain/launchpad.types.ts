import type { LAUNCHPAD_STAGES, PLANS } from './launchpad.constants'

export type Plan = (typeof PLANS)[keyof typeof PLANS]
export type LaunchpadStage = (typeof LAUNCHPAD_STAGES)[keyof typeof LAUNCHPAD_STAGES]
export type LaunchpadStatus = 'draft' | 'ready' | 'live' | 'paused' | 'archived'
export type PublishStatus = 'unpublished' | 'queued' | 'publishing' | 'published' | 'failed'

export type Launchpad = {
  id: string
  user_id: string
  name: string
  niche: string | null
  funnel_type: string | null
  campaign_name: string | null
  traffic_goal: string | null
  intent: string | null
  selected_offer_id: string | null
  funnel_id: string | null
  launchpad_stage: LaunchpadStage
  preflight_complete: boolean
  startup_checklist_complete: boolean
  status: LaunchpadStatus
  publish_status: PublishStatus
  created_at: string
  updated_at: string
}
