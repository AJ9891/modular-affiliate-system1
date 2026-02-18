import type { LintResult } from './Lint.types'
import { lintRules } from './lintRules'

// Simple text-based linter stub; replace with structured checks later.
export function lintResponse(content: string): LintResult {
  const findings = [] as LintResult['findings']
  const lower = content.toLowerCase()

  lintRules.voiceViolations.forEach(rule => {
    if (lower.includes(rule)) findings.push({ type: 'violation', message: `Voice violation: ${rule}` })
  })

  lintRules.intentDrift.forEach(rule => {
    if (lower.includes(rule)) findings.push({ type: 'violation', message: `Intent drift: ${rule}` })
  })

  lintRules.structureMismatch.forEach(rule => {
    if (lower.includes(rule)) findings.push({ type: 'warning', message: `Structure mismatch: ${rule}` })
  })

  lintRules.overconfidence.forEach(rule => {
    if (lower.includes(rule)) findings.push({ type: 'warning', message: `Overconfidence language: ${rule}` })
  })

  return { isPass: findings.length === 0, findings }
}
