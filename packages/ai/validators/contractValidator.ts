import type { PromptContract } from '../prompts/promptContracts/types'
import { invalid, valid, type ValidationIssue, type ValidationResult } from './Validation.types'

const allowedVoices = new Set(['boost', 'anti-guru', 'glitch'])
const outputShapes = new Set(['options-with-explanations', 'single', 'structured-json'])
const overwritePolicies = new Set(['never', 'append', 'replace-empty'])
const persuasionLevels = new Set(['low', 'medium', 'high'])
const riskLevels = new Set(['low', 'medium', 'high'])

export function validatePromptContract(contract: PromptContract): ValidationResult<PromptContract> {
  const issues: ValidationIssue[] = []

  if (!Array.isArray(contract.allowedVoices) || contract.allowedVoices.length === 0) {
    issues.push({ field: 'allowedVoices', message: 'allowedVoices must contain at least one voice' })
  } else if (contract.allowedVoices.some((voice) => !allowedVoices.has(voice))) {
    issues.push({ field: 'allowedVoices', message: 'allowedVoices contains unsupported voice ids' })
  }

  if (!riskLevels.has(contract.riskLevel)) {
    issues.push({ field: 'riskLevel', message: `unsupported risk level: ${contract.riskLevel}` })
  }
  if (!outputShapes.has(contract.outputShape)) {
    issues.push({ field: 'outputShape', message: `unsupported output shape: ${contract.outputShape}` })
  }
  if (!overwritePolicies.has(contract.overwritePolicy)) {
    issues.push({ field: 'overwritePolicy', message: `unsupported overwrite policy: ${contract.overwritePolicy}` })
  }
  if (!persuasionLevels.has(contract.persuasionLevel)) {
    issues.push({ field: 'persuasionLevel', message: `unsupported persuasion level: ${contract.persuasionLevel}` })
  }

  return issues.length > 0 ? invalid(issues) : valid(contract)
}
