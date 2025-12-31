export type BrandModeId =
  | 'ai_meltdown'
  | 'anti_guru'
  | 'rocket_future';

export interface BrandPersonality {
  id: BrandModeId;

  uiTone: {
    voiceHint: string;
    helperTextStyle: 'sarcastic' | 'neutral' | 'encouraging';
  };

  visuals: {
    background: 'dark' | 'light' | 'gradient';
    accentColor: string;
    borderStyle: 'soft' | 'sharp' | 'glitch';
  };

  motion: {
    hover: 'none' | 'subtle' | 'playful';
    transitions: 'instant' | 'smooth' | 'energetic';
  };

  copyRules: {
    avoids: string[];
    favors: string[];
  };
}

export interface PromptContext {
  productName: string;
  audience: string;
  goal: string;
  pageType: 'hero' | 'section' | 'cta';
}

export interface ResolvedPrompt {
  system: string;
  user: string;
}
