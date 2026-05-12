export type ValidationSeverity = 'warning' | 'violation'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  message: string
}

export interface ValidationResult {
  blocked: boolean
  issues: ValidationIssue[]
}
