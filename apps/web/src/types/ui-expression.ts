// UI Expression Profile Types
// Clean type definitions for brand UI expression

export type MotionIntensity = 'none' | 'low' | 'medium' | 'high';
export type VisualNoise = 'none' | 'controlled' | 'expressive';
export type SurfaceDepth = 'flat' | 'soft' | 'layered';
export type BorderStyle = 'sharp' | 'rounded' | 'mixed';
export type TypographyTone = 'flat' | 'confident' | 'playful' | 'fractured';
export type EmphasisStyle = 'none' | 'underline' | 'highlight' | 'strike';

export type UIExpressionProfile = {
  hero: {
    variants: ('meltdown' | 'anti-guru' | 'rocket')[];
    motionIntensity: MotionIntensity;
    visualNoise: VisualNoise;
  };

  typography: {
    tone: TypographyTone;
    emphasisStyle: EmphasisStyle;
  };

  surfaces: {
    depth: SurfaceDepth;
    borderStyle: BorderStyle;
  };

  microInteractions: {
    hoverAllowed: boolean;
    glitchAllowed: boolean;
    pulseAllowed: boolean;
  };

  sound: {
    ambientProfiles: ('checklist' | 'hum' | 'glitch')[];
    maxVolume: number;
  };
};
