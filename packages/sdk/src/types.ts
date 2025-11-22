export interface ModuleContract {
  module_id: string
  name: string
  version: string
  routes: string[]
  templates: TemplateConfig[]
  assets: AssetConfig[]
  permissions: string[]
}

export interface TemplateConfig {
  id: string
  name: string
  type: 'page' | 'email' | 'block'
  content: string
}

export interface AssetConfig {
  id: string
  type: 'image' | 'css' | 'js'
  url: string
}

export interface FunnelBlock {
  type: string
  content: Record<string, any>
  style: Record<string, any>
}

export interface Funnel {
  funnel_id: string
  name: string
  niche_id: string
  blocks: FunnelBlock[]
  created_at?: string
  updated_at?: string
}

export interface Offer {
  id: string
  niche_id: string
  name: string
  description?: string
  affiliate_link: string
  commission_rate?: number
  active: boolean
}

export interface Click {
  click_id: string
  offer_id: string
  funnel_id: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  clicked_at: string
}

export interface Conversion {
  conversion_id: string
  click_id?: string
  offer_id: string
  amount: number
  order_id?: string
  converted_at: string
}
