'use client'

import { useState } from 'react'
import CampaignWizard from './CampaignWizard'
import ContentAutomationWorkspace from './ContentAutomationWorkspace'

export default function ContentAutomationExperience() {
  const [advancedMode, setAdvancedMode] = useState(false)

  return (
    <>
      <div className="cockpit-shell pt-6">
        <div className="cockpit-container max-w-5xl">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.72)] p-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {advancedMode ? 'Advanced content automation' : 'Guided campaign builder'}
              </p>
              <p className="text-xs text-text-secondary">
                {advancedMode
                  ? 'All keyword, webhook, scheduling, and publishing controls.'
                  : 'A simple step-by-step path for building a campaign.'}
              </p>
            </div>
            <button
              type="button"
              className="hud-button-secondary shrink-0 px-4 py-2"
              onClick={() => setAdvancedMode((current) => !current)}
            >
              {advancedMode ? 'Use Wizard' : 'Advanced Mode'}
            </button>
          </div>
        </div>
      </div>
      {advancedMode ? <ContentAutomationWorkspace /> : <CampaignWizard />}
    </>
  )
}
