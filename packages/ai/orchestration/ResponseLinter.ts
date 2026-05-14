import { lintMiddlewareResponse } from '../middleware/ResponseLinter'
import type { ResponseLintEnvelope } from './types'

export function lintPipelineResponse(content: string): ResponseLintEnvelope {
  return lintMiddlewareResponse(content)
}
