export interface LaunchpadCopilotContext {
  stepId: string
  hasFunnel: boolean
  offerAttached: boolean
  emailReady: boolean
  launchChecksPassed: boolean
  funnelPublished: boolean
  selectedTemplate: string
}

export type LaunchpadCopilotTargetStep =
  | 'niche'
  | 'funnel'
  | 'offers'
  | 'email'
  | 'launch'

export interface LaunchpadCopilotReply {
  message: string
  targetStep: LaunchpadCopilotTargetStep
  suggestedAction: string
}

function getBestNextStep(context: LaunchpadCopilotContext): LaunchpadCopilotTargetStep {
  if (!context.hasFunnel) return 'funnel'
  if (!context.offerAttached) return 'offers'
  if (!context.emailReady) return 'email'
  if (!context.launchChecksPassed || !context.funnelPublished) return 'launch'
  return 'launch'
}

export function getLaunchpadCopilotReply(
  input: string,
  context: LaunchpadCopilotContext
): LaunchpadCopilotReply {
  const normalized = input.trim().toLowerCase()
  const bestStep = getBestNextStep(context)

  const bestNextResponse: Record<LaunchpadCopilotTargetStep, LaunchpadCopilotReply> = {
    niche: {
      message: 'Start by choosing the niche. That sets language and examples for everything downstream.',
      targetStep: 'niche',
      suggestedAction: 'Choose Niche',
    },
    funnel: {
      message:
        context.selectedTemplate
          ? `Your ${context.selectedTemplate} template looks aligned. Next step: generate the draft so we can inspect flow behavior.`
          : 'Next step: choose a funnel template and generate a draft so we can inspect visitor flow.',
      targetStep: 'funnel',
      suggestedAction: 'Build Funnel Draft',
    },
    offers: {
      message:
        "Your structure is in place. Now attach an offer so CTA traffic has a monetized destination.",
      targetStep: 'offers',
      suggestedAction: 'Attach Offer',
    },
    email: {
      message:
        'You already have traffic and offer flow. Enable email automation next so leads are recovered after first session.',
      targetStep: 'email',
      suggestedAction: 'Enable Email Automation',
    },
    launch: {
      message:
        'Your CTA path looks ready. Run launch checks, then publish so tracking starts on live traffic.',
      targetStep: 'launch',
      suggestedAction: 'Run Launch Checks',
    },
  }

  if (!normalized) {
    return {
      message:
        "I can suggest the next action, explain this step, or map a fast route to launch. Ask me what's next.",
      targetStep: context.stepId === 'welcome' ? 'niche' : bestStep,
      suggestedAction: 'Show Next Step',
    }
  }

  if (
    normalized.includes('best next') ||
    normalized.includes('next step') ||
    normalized.includes('what now')
  ) {
    return bestNextResponse[bestStep]
  }

  if (normalized.includes('cta')) {
    return {
      message:
        'CTA quality depends on one clear action and one destination. After setting button copy, validate the redirect target.',
      targetStep: context.hasFunnel ? 'offers' : 'funnel',
      suggestedAction: context.hasFunnel ? 'Wire CTA Offer' : 'Create Funnel First',
    }
  }

  if (normalized.includes('email')) {
    return {
      message:
        'Email automation is strongest after the funnel and offer are attached. Then every lead gets immediate follow-up.',
      targetStep: context.offerAttached ? 'email' : 'offers',
      suggestedAction: context.offerAttached ? 'Enable Email' : 'Attach Offer First',
    }
  }

  if (normalized.includes('launch') || normalized.includes('publish')) {
    return {
      message:
        'Before launch, confirm preview load and CTA redirect checks. Then publish so telemetry starts from first click.',
      targetStep: 'launch',
      suggestedAction: 'Open Launch Step',
    }
  }

  return bestNextResponse[bestStep]
}

