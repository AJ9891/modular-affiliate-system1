import {
  type TemplateMetadataContract,
  type ValidationIssue,
  type ValidationResult,
} from './types'

const allowedVoices = new Set(['boost', 'anti-guru', 'glitch'])
const allowedRisk = new Set(['low', 'medium', 'high'])
const allowedChannels = new Set(['landing-page', 'email', 'ad'])

export function validateMetadataContract(
  metadata: TemplateMetadataContract
): ValidationResult<TemplateMetadataContract> {
  const issues: ValidationIssue[] = []

  if (!metadata.id || metadata.id.trim().length < 3) {
    issues.push({ field: 'id', message: 'id must be at least 3 characters' })
  }
  if (!metadata.version || !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
    issues.push({ field: 'version', message: 'version must follow semver (x.y.z)' })
  }
  if (!metadata.name || metadata.name.trim().length < 3) {
    issues.push({ field: 'name', message: 'name must be at least 3 characters' })
  }
  if (!metadata.owner || metadata.owner.trim().length < 2) {
    issues.push({ field: 'owner', message: 'owner is required' })
  }
  if (!allowedChannels.has(metadata.channel)) {
    issues.push({ field: 'channel', message: `unsupported channel: ${metadata.channel}` })
  }
  if (!allowedVoices.has(metadata.voice)) {
    issues.push({ field: 'voice', message: `unsupported voice: ${metadata.voice}` })
  }
  if (!allowedRisk.has(metadata.risk)) {
    issues.push({ field: 'risk', message: `unsupported risk: ${metadata.risk}` })
  }
  if (!metadata.audience || metadata.audience.trim().length < 3) {
    issues.push({ field: 'audience', message: 'audience is required' })
  }
  if (!Array.isArray(metadata.tags) || metadata.tags.length === 0) {
    issues.push({ field: 'tags', message: 'at least one tag is required' })
  }

  if (issues.length > 0) {
    return { isValid: false, issues }
  }

  return { isValid: true, value: metadata, issues: [] }
}
