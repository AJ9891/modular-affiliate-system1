import { lintResponse } from '../linting/ResponseLinter'
import type { ResponseLintEnvelope } from './types'

export function lintPipelineResponse(content: string): ResponseLintEnvelope {
  const result = lintResponse(content)
  const hasViolations = result.findings.some((finding) => finding.type === 'violation')

  return {
    blocked: hasViolations,
    result,
  }
}
