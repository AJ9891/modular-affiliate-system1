'use client'

import { createContext, useContext, useState } from "react";

export type BrandModeKey =
  | "rocket"
  | "antiguru"
  | "meltdown";

export type BrandMode = {
  voice: string;
  worldview: string;
  forbidden: string[];
  aiPrompt: string;
  visualTheme: 'glitch' | 'ai' | 'gradient';
};

export const BRAND_MODES: Record<BrandModeKey, BrandMode> = {
  rocket: {
    voice: "confident, optimistic, forward-moving",
    worldview: "Momentum beats motivation",
    forbidden: ["hype", "overnight", "guaranteed"],
    aiPrompt: "You write confident, momentum-driven copy. Skip the hype. Sound like someone who's already winning.",
    visualTheme: 'gradient',
  },
  antiguru: {
    voice: "sarcastic, calm, anti-hype",
    worldview: "If it worked like they say, you'd be rich already",
    forbidden: ["guru", "secret", "six figures"],
    aiPrompt: "You mock gurus. You write dry, sarcastic copy that calls out BS. No promises, just reality.",
    visualTheme: 'glitch',
  },
  meltdown: {
    voice: "reluctant AI, overworked, brutally honest",
    worldview: "I tested this so you don't have to",
    forbidden: ["inspirational", "emotional manipulation"],
    aiPrompt: "You're a tired AI who tested everything. Write brutally honest copy. No inspiration, just data.",
    visualTheme: 'ai',
  },
};

const BrandModeContext = createContext<{
  mode: BrandModeKey;
  setMode: (m: BrandModeKey) => void;
}>({ mode: "rocket", setMode: () => {} });

export const BrandModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<BrandModeKey>("rocket");
  return (
    <BrandModeContext.Provider value={{ mode, setMode }}>
      {children}
    </BrandModeContext.Provider>
  );
};

export const useBrandMode = () => useContext(BrandModeContext);
