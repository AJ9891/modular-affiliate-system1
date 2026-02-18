export interface PromptContract {
  allowedVoices: string[]
  riskLevel: 'low' | 'medium' | 'high'
  outputShape: 'options-with-explanations' | 'single' | 'structured-json'
  overwritePolicy: 'never' | 'append' | 'replace-empty'
  persuasionLevel: 'low' | 'medium' | 'high'
  notes?: string
}
