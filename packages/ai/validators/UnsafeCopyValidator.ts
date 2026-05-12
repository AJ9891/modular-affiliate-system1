import type { ValidationIssue } from './types'

const UNSAFE_PATTERNS = [
  /fake\s+countdown/gi,
  /limited\s+spots\s+left\s+\d+/gi,
  /you\s+are\s+failing\s+if\s+you\s+don't/gi,
]

export function findUnsafeCopy(content: string): ValidationIssue[] {
  return UNSAFE_PATTERNS.flatMap((pattern, index) =>
    pattern.test(content)
      ? [
          {
            id: `unsafe-copy-${index}`,
            severity: 'violation' as const,
            message: `Detected unsafe copy pattern: ${pattern}`,
          },
        ]
      : [],
  )
}
