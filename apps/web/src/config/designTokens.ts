const spacingScale = [8, 16, 32, 64, 96];
const typographyScale = ["Hero XL", "Hero L", "Body", "Micro"];

export const DESIGN_SYSTEM = {
  spacing: {
    1: "8px",
    2: "16px",
    3: "32px",
    4: "64px",
    5: "96px",
  },
  fontSizes: {
    heroXL: "text-6xl",
    heroL: "text-5xl",
    section: "text-4xl",
    body: "text-base",
    small: "text-sm",
  },
  fontWeights: {
    hero: "font-extrabold",
    section: "font-bold",
    body: "font-normal",
  },
  radius: {
    sm: "rounded-md",
    md: "rounded-xl",
    lg: "rounded-2xl",
  },
};

export const designTokens = {
  colors: {
    rocket: {
      bg: "#0B1C2D",
      accent: "#FF6A00",
      text: "#FFFFFF",
      muted: "#9CA3AF",
    },
    meltdown: {
      bg: "#050A12",
      accent: "#00E5FF",
      text: "#E5E7EB",
      danger: "#FF3B3B",
    },
    antiguru: {
      bg: "#0F172A",
      accent: "#FACC15",
      text: "#F9FAFB",
      muted: "#94A3B8",
    },
  },
  spacing: {
    xs: "8px",
    sm: "16px",
    md: "32px",
    lg: "64px",
    xl: "96px",
    scale: spacingScale,
  },
  typography: {
    hero: "text-5xl md:text-6xl font-extrabold tracking-tight",
    subhead: "text-lg md:text-xl text-muted",
    body: "text-base leading-relaxed",
    cta: "text-lg font-semibold",
    scale: typographyScale,
  },
};
