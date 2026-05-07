export interface ValidationIssue {
  field: string
  message: string
}

export interface ValidationResult<T> {
  isValid: boolean
  value?: T
  issues: ValidationIssue[]
}

export function valid<T>(value: T): ValidationResult<T> {
  return {
    isValid: true,
    value,
    issues: []
  }
}

export function invalid<T = never>(issues: ValidationIssue[]): ValidationResult<T> {
  return {
    isValid: false,
    issues
  }
}
