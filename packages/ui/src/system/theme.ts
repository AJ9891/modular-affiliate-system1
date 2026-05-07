import { ThemeConfig } from './types'
import { systemTokens } from './tokens'

export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default Theme',
  tokens: systemTokens,
}

export function createTheme(theme: Partial<ThemeConfig> = {}): ThemeConfig {
  return {
    id: theme.id ?? defaultTheme.id,
    name: theme.name ?? defaultTheme.name,
    tokens: theme.tokens ?? defaultTheme.tokens,
  }
}
