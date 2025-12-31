import { BrandPersonality } from '../types';

export const rocketFuture: BrandPersonality = {
  id: 'rocket_future',

  uiTone: {
    voiceHint: 'Optimistic and collaborative',
    helperTextStyle: 'encouraging',
  },

  visuals: {
    background: 'gradient',
    accentColor: '#4f8cff',
    borderStyle: 'soft',
  },

  motion: {
    hover: 'subtle',
    transitions: 'smooth',
  },

  copyRules: {
    avoids: ['get rich', 'shortcut'],
    favors: ['progress', 'momentum', 'together'],
  },
};
