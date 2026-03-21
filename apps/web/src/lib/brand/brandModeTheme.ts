import type { BrandModeKey } from '@/contexts/BrandModeContext'

export type BrandModeTheme = {
  accent: string
  accentRgb: string
  accentSoft: string
  accentHover: string
  borderFocus: string
  glowLabel: string
}

export const BRAND_MODE_THEMES: Record<BrandModeKey, BrandModeTheme> = {
  rocket: {
    accent: '#ff6a00',
    accentRgb: '255, 106, 0',
    accentSoft: 'rgba(255, 106, 0, 0.14)',
    accentHover: 'rgba(255, 106, 0, 0.24)',
    borderFocus: 'rgba(255, 106, 0, 0.5)',
    glowLabel: 'Rocket Ember',
  },
  meltdown: {
    accent: '#00e5ff',
    accentRgb: '0, 229, 255',
    accentSoft: 'rgba(0, 229, 255, 0.14)',
    accentHover: 'rgba(0, 229, 255, 0.24)',
    borderFocus: 'rgba(0, 229, 255, 0.5)',
    glowLabel: 'Meltdown Plasma',
  },
  antiguru: {
    accent: '#facc15',
    accentRgb: '250, 204, 21',
    accentSoft: 'rgba(250, 204, 21, 0.14)',
    accentHover: 'rgba(250, 204, 21, 0.24)',
    borderFocus: 'rgba(250, 204, 21, 0.5)',
    glowLabel: 'Anti-Guru Gold',
  },
}

export function getBrandModeTheme(mode: BrandModeKey): BrandModeTheme {
  return BRAND_MODE_THEMES[mode]
}
