export type ComponentContract = {
  allowTextEdit: boolean;
  allowImageSwap: boolean;
  allowSpacing: boolean;
  allowDelete: boolean;
};

export const HERO_CONTRACT: ComponentContract = {
  allowTextEdit: true,
  allowImageSwap: true,
  allowSpacing: false,
  allowDelete: false,
};

export type ComponentBlockType = 'hero' | 'benefits' | 'testimonials' | 'cta' | 'features' | 'pricing';

export interface ComponentConfig {
  type: ComponentBlockType;
  contract: ComponentContract;
  defaultContent: Record<string, any>;
  defaultStyle: Record<string, any>;
}

export const COMPONENT_CONTRACTS: Record<ComponentBlockType, ComponentContract> = {
  hero: HERO_CONTRACT,
  benefits: {
    allowTextEdit: true,
    allowImageSwap: false,
    allowSpacing: true,
    allowDelete: true,
  },
  testimonials: {
    allowTextEdit: true,
    allowImageSwap: true,
    allowSpacing: true,
    allowDelete: true,
  },
  cta: {
    allowTextEdit: true,
    allowImageSwap: false,
    allowSpacing: true,
    allowDelete: true,
  },
  features: {
    allowTextEdit: true,
    allowImageSwap: false,
    allowSpacing: true,
    allowDelete: true,
  },
  pricing: {
    allowTextEdit: true,
    allowImageSwap: false,
    allowSpacing: true,
    allowDelete: true,
  },
};
