'use client'

import { useMemo, useState } from 'react'
import type { BrandModeKey } from '@/contexts/BrandModeContext'
import { resolveVisionIntent } from '../domain/vision.intent'
import { phraseVisionRecommendation } from '../domain/vision.personality'
import { attachVisionContext, recommendNextAction, VISION_ACTION_DEFINITIONS } from '../domain/vision.recommendations'
import type { VisionActionId, VisionChatMessage, VisionContext, VisionResponse } from '../domain/vision.types'
import { useVisionMemory } from './useVisionMemory'

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function responseFor(prompt: string, context: VisionContext, mode: BrandModeKey): VisionResponse {
  const resolved = resolveVisionIntent(prompt)
  const recommendation = resolved.actionId
    ? { actionId: resolved.actionId, priority: 50, reason: VISION_ACTION_DEFINITIONS[resolved.actionId].reason }
    : recommendNextAction(context)
  const action = VISION_ACTION_DEFINITIONS[recommendation.actionId]
  const href = attachVisionContext(action.href, context, recommendation)
  return {
    intent: resolved.intent,
    confidence: resolved.actionId ? resolved.confidence : 0.8,
    message: phraseVisionRecommendation(mode, recommendation.reason, action.label),
    recommendedAction: { id: recommendation.actionId, label: action.label, href, reason: recommendation.reason },
    followUpQuestion: resolved.intent === 'unknown' ? 'Are you trying to build, optimize, analyze, configure email, or manage offers?' : undefined,
  }
}

export function useVision(context: VisionContext, mode: BrandModeKey) {
  const initial = useMemo<VisionChatMessage>(() => ({
    id: makeId(), role: 'system',
    content: `System online. ${context.user.plan} plan detected. I can read your Launchpad and performance state, then route you with context attached.`,
  }), [context.user.plan])
  const { messages, append } = useVisionMemory(initial)
  const [isThinking, setIsThinking] = useState(false)

  const submit = (rawPrompt: string) => {
    const prompt = rawPrompt.trim()
    if (!prompt || isThinking) return
    append({ id: makeId(), role: 'user', content: prompt })
    setIsThinking(true)
    window.setTimeout(() => {
      const response = responseFor(prompt, context, mode)
      append({
        id: makeId(), role: 'system', content: response.followUpQuestion ? `${response.message} ${response.followUpQuestion}` : response.message,
        actionId: response.recommendedAction?.id as VisionActionId | undefined,
        actionLabel: response.recommendedAction ? `Open ${response.recommendedAction.label}` : undefined,
        actionHref: response.recommendedAction?.href,
      })
      setIsThinking(false)
    }, 220)
  }

  return { messages, isThinking, submit, recommendation: recommendNextAction(context) }
}
