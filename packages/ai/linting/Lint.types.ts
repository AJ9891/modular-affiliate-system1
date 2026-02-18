export interface LintFinding {
  type: 'violation' | 'warning'
  message: string
}

export interface LintResult {
  isPass: boolean
  findings: LintFinding[]
}
