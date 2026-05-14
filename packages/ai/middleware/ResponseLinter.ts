import { lintResponse } from '../linting/ResponseLinter'
import type { LintResult } from '../linting/Lint.types'

export interface MiddlewareResponseLint {
  blocked: boolean
  result: LintResult
}

export function lintMiddlewareResponse(content: string): MiddlewareResponseLint {
  const result = lintResponse(content)
  const blocked = result.findings.some((finding) => finding.type === 'violation')

  return {
    blocked,
    result,
  }
}
