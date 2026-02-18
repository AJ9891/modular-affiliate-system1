export type RiskLevel = 'low' | 'medium' | 'high'
export type PageMode = 'builder' | 'onboarding' | 'live_funnel'
export type UserLevel = 'new' | 'active' | 'advanced'
export type ComponentId =
  | 'HeroBlock'
  | 'CTAEditor'
  | 'FunnelComposer'
  | 'TemplateCopy'
  | 'AnalyticsInsight'
  | 'OnboardingAssistant'
  | 'ParodyFunnel'
  | 'Unknown'

export type VoiceId = 'boost' | 'anti-guru' | 'glitch'

export interface AIContext {
  location: ComponentId
  mode: PageMode
  voice: VoiceId
  risk: RiskLevel
  userLevel: UserLevel
  templateVoice?: VoiceId
  metadata?: Record<string, unknown>
}

export interface AIContextInput {
  componentId?: ComponentId
  pageMode?: PageMode
  userLevel?: UserLevel
  templateVoice?: VoiceId
  riskLevel?: RiskLevel
  metadata?: Record<string, unknown>
}
