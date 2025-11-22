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
