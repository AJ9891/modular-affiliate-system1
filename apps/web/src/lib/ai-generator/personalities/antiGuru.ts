import { BrandPersonality } from '../types';

export const antiGuru: BrandPersonality = {
  id: 'anti_guru',

  uiTone: {
    voiceHint: 'Direct and grounded',
    helperTextStyle: 'neutral',
  },

  visuals: {
    background: 'light',
    accentColor: '#111111',
    borderStyle: 'sharp',
  },

  motion: {
    hover: 'none',
    transitions: 'instant',
  },

  copyRules: {
    avoids: ['secret', 'hack', 'overnight'],
    favors: ['learn', 'practice', 'build'],
  },
};
