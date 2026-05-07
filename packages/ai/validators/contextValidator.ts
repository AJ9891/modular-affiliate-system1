import type { AIContext } from '../context/Context.types'
import { invalid, valid, type ValidationIssue, type ValidationResult } from './Validation.types'

const allowedModes = new Set(['builder', 'onboarding', 'live_funnel'])
const allowedVoices = new Set(['boost', 'anti-guru', 'glitch'])
const allowedRisk = new Set(['low', 'medium', 'high'])
const allowedUserLevels = new Set(['new', 'active', 'advanced'])

export function validateAIContext(context: AIContext): ValidationResult<AIContext> {
  const issues: ValidationIssue[] = []

  if (!context.location) {
    issues.push({ field: 'location', message: 'location is required' })
  }
  if (!allowedModes.has(context.mode)) {
    issues.push({ field: 'mode', message: `unsupported mode: ${context.mode}` })
  }
  if (!allowedVoices.has(context.voice)) {
    issues.push({ field: 'voice', message: `unsupported voice: ${context.voice}` })
  }
  if (!allowedRisk.has(context.risk)) {
    issues.push({ field: 'risk', message: `unsupported risk: ${context.risk}` })
  }
  if (!allowedUserLevels.has(context.userLevel)) {
    issues.push({ field: 'userLevel', message: `unsupported user level: ${context.userLevel}` })
  }
  if (context.templateVoice && !allowedVoices.has(context.templateVoice)) {
    issues.push({ field: 'templateVoice', message: `unsupported template voice: ${context.templateVoice}` })
  }

  return issues.length > 0 ? invalid(issues) : valid(context)
}
