import { BrandPersonality } from '../types';

export const aiMeltdown: BrandPersonality = {
  id: 'ai_meltdown',

  uiTone: {
    voiceHint: 'Overworked but honest',
    helperTextStyle: 'sarcastic',
  },

  visuals: {
    background: 'dark',
    accentColor: '#22ff88',
    borderStyle: 'glitch',
  },

  motion: {
    hover: 'playful',
    transitions: 'instant',
  },

  copyRules: {
    avoids: ['guarantee', 'effortless', 'passive income'],
    favors: ['probably', 'honestly', 'no promises'],
  },
};
